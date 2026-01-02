import { create } from 'zustand';

interface ReportDraft {
    text: string;
    type: string;
    latitude: number | null;
    longitude: number | null;
    mediaUri: string | null;
}

interface ReportStore {
    draft: ReportDraft;
    setDraft: (draft: Partial<ReportDraft>) => void;
    resetDraft: () => void;
}

export const useReportStore = create<ReportStore>((set) => ({
    draft: {
        text: '',
        type: "flood", // Default to first type
        latitude: null,
        longitude: null,
        mediaUri: null,
    },
    setDraft: (updates) => set((state) => ({ draft: { ...state.draft, ...updates } })),
    resetDraft: () => set({
        draft: { text: '', type: "flood", latitude: null, longitude: null, mediaUri: null }
    }),
}));
