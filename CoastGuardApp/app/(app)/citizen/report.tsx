import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, Alert, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { useReportStore } from '../../../store/reportStore';
import { useOfflineStore } from '../../../store/offlineStore'; // Import offline store
import { syncReports } from '../../../services/syncService'; // Import sync service
import { useNetInfo } from '@react-native-community/netinfo'; // Import NetInfo
import { router } from 'expo-router';
import api from '../../../services/api';
import uuid from "react-native-uuid"

export default function ReportScreen() {
    const { draft, setDraft, resetDraft } = useReportStore();
    const { addToQueue } = useOfflineStore();
    const netInfo = useNetInfo(); // Get real-time network status
    const [loadingLoc, setLoadingLoc] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 1. Get Location on Mount
    useEffect(() => {
        (async () => {
            setLoadingLoc(true);
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission to access location was denied');
                setLoadingLoc(false);
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            setDraft({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude
            });
            setLoadingLoc(false);
        })();
    }, []);

    // 2. Handle Image Picking
    const pickImage = async () => {
        // Request permission
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            alert('Sorry, we need camera roll permissions to make this work!');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            setDraft({ mediaUri: result.assets[0].uri });
        }
    };

    const handleSubmit = async () => {
        if (!draft.latitude || !draft.longitude) {
            Alert.alert('Error', 'Location is required.');
            return;
        }
        if (!draft.text && !draft.mediaUri) {
            Alert.alert('Error', 'Please add a description or a photo.');
            return;
        }

        setIsSubmitting(true);

        // Prepare report object
        const reportData = {
            id: uuid.v4() as string,
            text: draft.text,
            type: draft.type,
            latitude: draft.latitude,
            longitude: draft.longitude,
            mediaUri: draft.mediaUri,
            timestamp: Date.now(),
        };

        // Check Network Status 
        if (netInfo.isConnected === false) {
            // OFFLINE: Save to local queue
            addToQueue(reportData);
            Alert.alert('Offline', 'Report saved locally. It will upload when you are back online.');
            resetDraft();
            router.back();
        } else {
            // ONLINE: Try to upload immediately
            try {
                const formData = new FormData();
                formData.append('text', draft.text);
                formData.append('type', String(draft.type));
                formData.append('latitude', String(draft.latitude));
                formData.append('longitude', String(draft.longitude));

                if (draft.mediaUri) {
                    const filename = draft.mediaUri.split('/').pop();
                    const match = /\.(\w+)$/.exec(filename || '');
                    const type = match ? `image/${match[1]}` : `image`;
                    formData.append('media', {
                        uri: draft.mediaUri,
                        name: filename,
                        type: type,
                    } as any);
                }

                await api.post('/reports', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                Alert.alert('Success', 'Report uploaded successfully!');
                resetDraft();
                router.back();

            } catch (error) {
                console.log("Upload failed, falling back to queue", error);
                // Fallback: If upload fails (e.g., weak signal), save to queue
                addToQueue(reportData);
                Alert.alert('Saved', 'Upload failed, but report saved locally. Will retry later.');
                resetDraft();
                router.back();
            }
        }

        setIsSubmitting(false);
    };

    return (
        <ScrollView className="flex-1 bg-gray-900 p-4">
            <Text className="text-center text-2xl font-bold text-white mb-6">New Hazard Report</Text>

            {/* Location Status */}
            <View className="mb-6 p-4 bg-gray-800 rounded-lg">
                <Text className="text-gray-400 text-sm mb-1">Location</Text>
                {loadingLoc ? (
                    <ActivityIndicator color="#3b82f6" />
                ) : draft.latitude ? (
                    <Text className="text-green-400 font-mono">
                        {draft.latitude.toFixed(4)}, {draft.longitude?.toFixed(4)}
                    </Text>
                ) : (
                    <Text className="text-red-400">Location not found</Text>
                )}
            </View>

            {/* Hazard Type Selector (Simple Buttons for now) */}
            <View className="mb-6">
                <Text className="text-gray-400 mb-2">Hazard Type</Text>
                <View className="flex-row flex-wrap gap-2">
                    {["flood", "tsunami", "high wave", "surge"].map((hazard_type) => (
                        <TouchableOpacity
                            key={hazard_type}
                            onPress={() => setDraft({ type: hazard_type })}
                            className={`p-3 rounded-md ${draft.type === hazard_type ? 'bg-blue-600' : 'bg-gray-700'}`}
                        >
                            <Text className="text-white">{hazard_type}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Description */}
            <View className="mb-6">
                <Text className="text-gray-400 mb-2">Description</Text>
                <TextInput
                    className="bg-gray-800 text-white p-4 rounded-xl border border-gray-700 h-32"
                    multiline
                    placeholder="Describe what you see..."
                    placeholderTextColor="#6b7280"
                    value={draft.text}
                    onChangeText={(t) => setDraft({ text: t })}
                    textAlignVertical="top"
                />
            </View>

            {/* Media Picker */}
            <TouchableOpacity onPress={pickImage} className="mb-8 items-center justify-center bg-gray-800 h-40 rounded-xl border border-dashed border-gray-600">
                {draft.mediaUri ? (
                    <Image source={{ uri: draft.mediaUri }} className="w-full h-full rounded-xl" />
                ) : (
                    <Text className="text-gray-400">Tap to add photo/video</Text>
                )}
            </TouchableOpacity>

            {/* Submit Button */}
            <TouchableOpacity
                onPress={handleSubmit}
                className="w-full bg-green-600 p-4 rounded-xl items-center mb-10"
            >
                <Text className="text-white font-bold text-lg">POST REPORT</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}
