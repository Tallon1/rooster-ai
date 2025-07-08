import { create } from 'zustand';
import { Roster, CreateRosterInput, UpdateRosterInput } from '@rooster-ai/shared';
import { apiClient } from '@/lib/api';
import { toast } from 'react-hot-toast';

interface RosterState {
  rosters: Roster[];
  currentRoster: Roster | null;
  isLoading: boolean;
  
  // Actions
  fetchRosters: () => Promise<void>;
  fetchWeeklyRoster: (startDate: Date, endDate: Date) => Promise<void>;
  fetchRosterById: (id: string) => Promise<void>;
  createRoster: (data: CreateRosterInput) => Promise<void>;
  updateRoster: (id: string, data: UpdateRosterInput) => Promise<void>;
  publishRoster: (id: string) => Promise<void>;
  addShift: (rosterId: string, shiftData: any) => Promise<void>;
  updateShift: (shiftId: string, shiftData: any) => Promise<void>;
  deleteShift: (shiftId: string) => Promise<void>;
}

export const useRosterStore = create<RosterState>((set, get) => ({
  rosters: [],
  currentRoster: null,
  isLoading: false,

  fetchRosters: async () => {
    set({ isLoading: true });
    try {
      const response = await apiClient.get('/rosters');
      set({
        rosters: response.data.data,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      toast.error('Failed to fetch rosters');
    }
  },

  fetchWeeklyRoster: async (startDate: Date, endDate: Date) => {
    set({ isLoading: true });
    try {
      const response = await apiClient.get('/rosters', {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
      });
      
      const weeklyRoster = response.data.data[0] || null;
      set({
        currentRoster: weeklyRoster,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      toast.error('Failed to fetch weekly roster');
    }
  },

  fetchRosterById: async (id: string) => {
    set({ isLoading: true });
    try {
      const response = await apiClient.get(`/rosters/${id}`);
      set({
        currentRoster: response.data.data,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      toast.error('Failed to fetch roster');
    }
  },

  createRoster: async (data: CreateRosterInput) => {
    set({ isLoading: true });
    try {
      const response = await apiClient.post('/rosters', data);
      const newRoster = response.data.data;
      
      set((state) => ({
        rosters: [...state.rosters, newRoster],
        currentRoster: newRoster,
        isLoading: false,
      }));
      
      toast.success('Roster created successfully');
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  updateRoster: async (id: string, data: UpdateRosterInput) => {
    try {
      const response = await apiClient.put(`/rosters/${id}`, data);
      const updatedRoster = response.data.data;
      
      set((state) => ({
        rosters: state.rosters.map(r => r.id === id ? updatedRoster : r),
        currentRoster: state.currentRoster?.id === id ? updatedRoster : state.currentRoster,
      }));
      
      toast.success('Roster updated successfully');
    } catch (error) {
      throw error;
    }
  },

  publishRoster: async (id: string) => {
    try {
      const response = await apiClient.post(`/rosters/${id}/publish`);
      const publishedRoster = response.data.data;
      
      set((state) => ({
        rosters: state.rosters.map(r => r.id === id ? publishedRoster : r),
        currentRoster: state.currentRoster?.id === id ? publishedRoster : state.currentRoster,
      }));
      
      toast.success('Roster published successfully');
    } catch (error) {
      throw error;
    }
  },

  addShift: async (rosterId: string, shiftData: any) => {
    try {
      const response = await apiClient.post(`/rosters/${rosterId}/shifts`, shiftData);
      const newShift = response.data.data;
      
      set((state) => ({
        currentRoster: state.currentRoster ? {
          ...state.currentRoster,
          shifts: [...state.currentRoster.shifts, newShift],
        } : null,
      }));
      
      toast.success('Shift added successfully');
    } catch (error) {
      throw error;
    }
  },

  updateShift: async (shiftId: string, shiftData: any) => {
    try {
      const response = await apiClient.put(`/rosters/shifts/${shiftId}`, shiftData);
      const updatedShift = response.data.data;
      
      set((state) => ({
        currentRoster: state.currentRoster ? {
          ...state.currentRoster,
          shifts: state.currentRoster.shifts.map(s => 
            s.id === shiftId ? updatedShift : s
          ),
        } : null,
      }));
      
      toast.success('Shift updated successfully');
    } catch (error) {
      throw error;
    }
  },

  deleteShift: async (shiftId: string) => {
    try {
      await apiClient.delete(`/rosters/shifts/${shiftId}`);
      
      set((state) => ({
        currentRoster: state.currentRoster ? {
          ...state.currentRoster,
          shifts: state.currentRoster.shifts.filter(s => s.id !== shiftId),
        } : null,
      }));
      
      toast.success('Shift deleted successfully');
    } catch (error) {
      throw error;
    }
  },
}));
