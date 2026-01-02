import { useOfflineStore } from '../store/offlineStore';
import api from './api'; // Import your configured axios instance
import * as FileSystem from 'expo-file-system'; // Optional, if needed to verify file existence

export const syncReports = async () => {
    const { queue, removeFromQueue } = useOfflineStore.getState();

    if (queue.length === 0) return;

    console.log(`[Sync] Attempting to sync ${queue.length} reports...`);

    for (const report of queue) {
        try {
            const formData = new FormData();

            formData.append('text', report.text);
            formData.append('type_id', report.type); // API expects integer, but FormData is string-based
            formData.append('latitude', report.latitude.toString());
            formData.append('longitude', report.longitude.toString());
            if (report.location_name) {
                formData.append('location_name', report.location_name);
            }

            if (report.mediaUri) {
                // React Native FormData requires a specific object structure for files
                const filename = report.mediaUri.split('/').pop();
                const match = /\.(\w+)$/.exec(filename || '');
                const type = match ? `image/${match[1]}` : `image`;

                formData.append('media', {
                    uri: report.mediaUri,
                    name: filename || 'upload.jpg',
                    type: type,
                } as any);
            }

            // Note: Do NOT set Content-Type manually; Axios/Fetch sets it with boundary for FormData
            await api.post('/reports', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            console.log(`[Sync] Report ${report.id} uploaded successfully.`);
            removeFromQueue(report.id);

        } catch (error) {
            console.error(`[Sync] Failed to upload report ${report.id}`, error);
            // We purposefully do NOT remove it from the queue so it retries later
        }
    }
};
