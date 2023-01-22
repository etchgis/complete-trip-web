import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useMapStore = create(
  persist(
    (set, get) => ({
      mapStyle: 'DAY',
      setMapStyle: style => set(() => ({ mapStyle: style })),
    }),
    {
      name: '__mba_maptheme',
      // partialize: state => ({ user: state.mapStyle }),
    }
  )
);
