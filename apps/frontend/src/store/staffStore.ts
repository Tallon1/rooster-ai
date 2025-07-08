import { create } from "zustand";
import {
  Staff,
  StaffFilterInput,
  CreateStaffInput,
  UpdateStaffInput,
} from "@rooster-ai/shared";
import { apiClient } from "@/lib/api";
import { toast } from "react-hot-toast";

interface StaffState {
  staff: Staff[];
  currentStaff: Staff | null;
  isLoading: boolean;
  filters: Partial<StaffFilterInput>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };

  // Actions
  fetchStaff: () => Promise<void>;
  fetchStaffById: (id: string) => Promise<void>;
  createStaff: (data: CreateStaffInput) => Promise<void>;
  updateStaff: (id: string, data: UpdateStaffInput) => Promise<void>;
  deleteStaff: (id: string) => Promise<void>;
  setFilters: (filters: Partial<StaffFilterInput>) => void;
  setCurrentStaff: (staff: Staff | null) => void;
}

export const useStaffStore = create<StaffState>((set, get) => ({
  staff: [],
  currentStaff: null,
  isLoading: false,
  filters: {
    page: 1,
    limit: 20,
    sortBy: "name",
    sortOrder: "asc",
  },
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },

  fetchStaff: async () => {
    set({ isLoading: true });
    try {
      const { filters } = get();
      const response = await apiClient.get("/staff", { params: filters });

      set({
        staff: response.data.data,
        pagination: response.data.pagination,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      toast.error("Failed to fetch staff members");
    }
  },

  fetchStaffById: async (id: string) => {
    set({ isLoading: true });
    try {
      const response = await apiClient.get(`/staff/${id}`);
      set({
        currentStaff: response.data.data,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      toast.error("Failed to fetch staff member");
    }
  },

  createStaff: async (data: CreateStaffInput) => {
    set({ isLoading: true });
    try {
      const response = await apiClient.post("/staff", data);
      const newStaff = response.data.data;

      set((state) => ({
        staff: [...state.staff, newStaff],
        isLoading: false,
      }));

      toast.success("Staff member created successfully");
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  updateStaff: async (id: string, data: UpdateStaffInput) => {
    set({ isLoading: true });
    try {
      const response = await apiClient.put(`/staff/${id}`, data);
      const updatedStaff = response.data.data;

      set((state) => ({
        staff: state.staff.map((s) => (s.id === id ? updatedStaff : s)),
        currentStaff:
          state.currentStaff?.id === id ? updatedStaff : state.currentStaff,
        isLoading: false,
      }));

      toast.success("Staff member updated successfully");
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  deleteStaff: async (id: string) => {
    try {
      await apiClient.delete(`/staff/${id}`);

      set((state) => ({
        staff: state.staff.filter((s) => s.id !== id),
      }));

      toast.success("Staff member deleted successfully");
    } catch (error) {
      toast.error("Failed to delete staff member");
    }
  },

  setFilters: (newFilters: Partial<StaffFilterInput>) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }));
    get().fetchStaff();
  },

  setCurrentStaff: (staff: Staff | null) => {
    set({ currentStaff: staff });
  },
}));
