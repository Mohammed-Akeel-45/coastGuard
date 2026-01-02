import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Helper to check if we are on web
const isWeb = Platform.OS === 'web';

export const saveToken = async (key: string, value: string) => {
    if (isWeb) {
        try {
            localStorage.setItem(key, value);
        } catch (e) {
            console.error('Local storage is unavailable:', e);
        }
    } else {
        await SecureStore.setItemAsync(key, value);
    }
};

export const getToken = async (key: string): Promise<string | null> => {
    if (isWeb) {
        try {
            return localStorage.getItem(key);
        } catch (e) {
            console.error('Local storage is unavailable:', e);
            return null;
        }
    } else {
        return await SecureStore.getItemAsync(key);
    }
};

export const deleteToken = async (key: string) => {
    if (isWeb) {
        try {
            localStorage.removeItem(key);
        } catch (e) {
            console.error('Local storage is unavailable:', e);
        }
    } else {
        await SecureStore.deleteItemAsync(key);
    }
};
