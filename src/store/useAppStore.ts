import { create } from 'zustand';

interface AppState {
  currentView: 'blog' | 'admin' | 'crm';
  setCurrentView: (view: 'blog' | 'admin' | 'crm') => void;
  selectedPostSlug: string | null;
  setSelectedPostSlug: (slug: string | null) => void;
  showRegistration: boolean;
  setShowRegistration: (show: boolean) => void;
  refreshKey: number;
  triggerRefresh: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentView: 'blog',
  setCurrentView: (view) => set({ currentView: view }),
  selectedPostSlug: null,
  setSelectedPostSlug: (slug) => set({ selectedPostSlug: slug }),
  showRegistration: false,
  setShowRegistration: (show) => set({ showRegistration: show }),
  refreshKey: 0,
  triggerRefresh: () => set((state) => ({ refreshKey: state.refreshKey + 1 })),
}));
