import { create } from "zustand";
import { apiClient } from "@/lib/api";
import { toast } from "react-hot-toast";
import {
  StoreLocation,
  CreateStoreLocationInput,
  UpdateStoreLocationInput,
} from "@rooster-ai/shared";

interface StoreLocationState {
  storeLocations: StoreLocation[];
  currentLocation: StoreLocation | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchStoreLocations: () => Promise<void>;
  fetchStoreLocationById: (id: string) => Promise<void>;
  createStoreLocation: (data: CreateStoreLocationInput) => Promise<void>;
  updateStoreLocation: (
    id: string,
    data: UpdateStoreLocationInput
  ) => Promise<void>;
  deleteStoreLocation: (id: string) => Promise<void>;
  setCurrentLocation: (location: StoreLocation | null) => void;
  assignStaffToLocation: (
    locationId: string,
    staffIds: string[]
  ) => Promise<void>;

  // Enhanced: New utility actions
  getLocationStaff: (locationId: string) => any[];
  clearError: () => void;
  refreshCurrentLocation: () => Promise<void>;
}

export const useStoreLocationStore = create<StoreLocationState>((set, get) => ({
  storeLocations: [],
  currentLocation: null,
  isLoading: false,
  error: null,

  fetchStoreLocations: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get("/store-locations");

      // ✅ Map the response to match shared types
      const locationsWithCount = response.data.data.map((location: any) => ({
        ...location,
        createdAt: new Date(location.createdAt),
        updatedAt: new Date(location.updatedAt),
        staffCount: location._count?.staffAssignments || 0,
        // ✅ Ensure staffAssignments matches the expected structure
        staffAssignments:
          location.staffAssignments?.map((assignment: any) => ({
            staffId: assignment.staffId,
            storeLocationId: assignment.storeLocationId,
            id: assignment.id,
            createdAt: assignment.createdAt
              ? new Date(assignment.createdAt)
              : undefined,
            updatedAt: assignment.updatedAt
              ? new Date(assignment.updatedAt)
              : undefined,
            staff: assignment.staff,
          })) || [],
      }));

      set({
        storeLocations: locationsWithCount,
        isLoading: false,
      });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to fetch locations",
        isLoading: false,
      });
      toast.error("Failed to fetch store locations");
    }
  },

  fetchStoreLocationById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get(`/store-locations/${id}`);

      // ✅ Enhanced: Convert date strings and handle staff assignments
      const location: StoreLocation = {
        ...response.data.data,
        createdAt: new Date(response.data.data.createdAt),
        updatedAt: new Date(response.data.data.updatedAt),
        staffAssignments:
          response.data.data.staffAssignments?.map((assignment: any) => ({
            staffId: assignment.staffId,
            storeLocationId: assignment.storeLocationId,
            id: assignment.id,
            createdAt: assignment.createdAt
              ? new Date(assignment.createdAt)
              : undefined,
            updatedAt: assignment.updatedAt
              ? new Date(assignment.updatedAt)
              : undefined,
            staff: assignment.staff,
          })) || [],
      };

      set({
        currentLocation: location,
        isLoading: false,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch store location";
      set({
        isLoading: false,
        error: errorMessage,
      });
      toast.error(errorMessage);
    }
  },

  createStoreLocation: async (data: CreateStoreLocationInput) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post("/store-locations", data);
      const newLocation: StoreLocation = {
        ...response.data.data,
        createdAt: new Date(response.data.data.createdAt),
        updatedAt: new Date(response.data.data.updatedAt),
        staffAssignments: [],
      };

      set((state) => ({
        storeLocations: [...state.storeLocations, newLocation],
        isLoading: false,
      }));

      toast.success("Store location created successfully");
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to create store location";
      set({
        isLoading: false,
        error: errorMessage,
      });
      throw error;
    }
  },

  updateStoreLocation: async (id: string, data: UpdateStoreLocationInput) => {
    set({ error: null });
    try {
      const response = await apiClient.put(`/store-locations/${id}`, data);
      const updatedLocation: StoreLocation = {
        ...response.data.data,
        createdAt: new Date(response.data.data.createdAt),
        updatedAt: new Date(response.data.data.updatedAt),
      };

      set((state) => ({
        storeLocations: state.storeLocations.map((location) =>
          location.id === id ? updatedLocation : location
        ),
        currentLocation:
          state.currentLocation?.id === id
            ? updatedLocation
            : state.currentLocation,
      }));

      toast.success("Store location updated successfully");
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to update store location";
      set({ error: errorMessage });
      throw error;
    }
  },

  assignStaffToLocation: async (locationId: string, staffIds: string[]) => {
    set({ error: null });
    try {
      const response = await apiClient.post(
        `/store-locations/${locationId}/assign-staff`,
        {
          staffIds,
        }
      );
      const updatedLocation: StoreLocation = {
        ...response.data.data,
        createdAt: new Date(response.data.data.createdAt),
        updatedAt: new Date(response.data.data.updatedAt),
        staffAssignments:
          response.data.data.staffAssignments?.map((assignment: any) => ({
            staffId: assignment.staffId,
            storeLocationId: assignment.storeLocationId,
            id: assignment.id,
            createdAt: assignment.createdAt
              ? new Date(assignment.createdAt)
              : undefined,
            updatedAt: assignment.updatedAt
              ? new Date(assignment.updatedAt)
              : undefined,
            staff: assignment.staff,
          })) || [],
      };

      set((state) => ({
        storeLocations: state.storeLocations.map((location) =>
          location.id === locationId ? updatedLocation : location
        ),
        currentLocation:
          state.currentLocation?.id === locationId
            ? updatedLocation
            : state.currentLocation,
      }));

      toast.success("Staff assigned to location successfully");
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to assign staff to location";
      set({ error: errorMessage });
      throw error;
    }
  },

  deleteStoreLocation: async (id: string) => {
    set({ error: null });
    try {
      await apiClient.delete(`/store-locations/${id}`);

      set((state) => ({
        storeLocations: state.storeLocations.filter(
          (location) => location.id !== id
        ),
        currentLocation:
          state.currentLocation?.id === id ? null : state.currentLocation,
      }));

      toast.success("Store location deleted successfully");
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to delete store location";
      set({ error: errorMessage });
      toast.error(errorMessage);
    }
  },

  setCurrentLocation: (location: StoreLocation | null) => {
    set({ currentLocation: location, error: null });
  },

  // Enhanced: New utility methods
  getLocationStaff: (locationId: string) => {
    const { storeLocations } = get();
    const location = storeLocations.find((loc) => loc.id === locationId);
    return (
      location?.staffAssignments?.map((assignment) => assignment.staff) || []
    );
  },

  clearError: () => {
    set({ error: null });
  },

  refreshCurrentLocation: async () => {
    const { currentLocation } = get();
    if (currentLocation) {
      await get().fetchStoreLocationById(currentLocation.id);
    }
  },
}));
