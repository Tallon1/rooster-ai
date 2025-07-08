import { create } from "zustand";
import { apiClient } from "@/lib/api";
import { toast } from "react-hot-toast";

interface DashboardMetrics {
  staff: {
    total: number;
    active: number;
    activePercentage: number;
  };
  rosters: {
    total: number;
    published: number;
    publishedPercentage: number;
  };
  shifts: {
    thisWeek: number;
    thisMonth: number;
    upcoming: number;
  };
  recentActivity: Array<{
    id: string;
    name: string;
    isPublished: boolean;
    updatedAt: string;
    _count: {
      shifts: number;
    };
  }>;
}

interface AnalyticsState {
  dashboardMetrics: DashboardMetrics | null;
  staffUtilization: any[];
  departmentAnalytics: any[];
  isLoading: boolean;

  // Actions
  fetchDashboardMetrics: () => Promise<void>;
  fetchStaffUtilization: (days?: number) => Promise<void>;
  fetchDepartmentAnalytics: () => Promise<void>;
}

export const useAnalyticsStore = create<AnalyticsState>((set) => ({
  dashboardMetrics: null,
  staffUtilization: [],
  departmentAnalytics: [],
  isLoading: false,

  fetchDashboardMetrics: async () => {
    set({ isLoading: true });
    try {
      const response = await apiClient.get("/analytics/dashboard");
      set({
        dashboardMetrics: response.data.data,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      toast.error("Failed to fetch dashboard metrics");
    }
  },

  fetchStaffUtilization: async (days = 30) => {
    try {
      const response = await apiClient.get("/analytics/staff-utilization", {
        params: { days },
      });
      set({ staffUtilization: response.data.data });
    } catch (error) {
      toast.error("Failed to fetch staff utilization");
    }
  },

  fetchDepartmentAnalytics: async () => {
    try {
      const response = await apiClient.get("/analytics/departments");
      set({ departmentAnalytics: response.data.data });
    } catch (error) {
      toast.error("Failed to fetch department analytics");
    }
  },
}));
