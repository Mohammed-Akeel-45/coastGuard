import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface PendingReport {
    id: string;
    text: string;
    type: string;
    latitude: number;
    longitude: number;
    location_name?: string;
    mediaUri: string | null;
    timestamp: number;
}

interface OfflineState {
    queue: PendingReport[];
    addToQueue: (report: PendingReport) => void;
    removeFromQueue: (id: string) => void;
}

export const useOfflineStore = create<OfflineState>()(
    persist(
        (set) => ({
            queue: [],
            addToQueue: (report) => set((state) => ({ queue: [...state.queue, report] })),
            removeFromQueue: (id) =>
                set((state) => ({ queue: state.queue.filter((item) => item.id !== id) })),
        }),
        {
            name: 'offline-report-queue',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
