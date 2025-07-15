"use client";

import { useEffect } from "react";
import { useAnalyticsStore } from "@/store/analyticsStore";
import MetricCard from "@/components/analytics/MetricCard";
import StaffUtilizationChart from "@/components/analytics/StaffUtilizationChart";
import DepartmentChart from "@/components/analytics/DepartmentChart";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { format } from "date-fns";

export default function AnalyticsPage() {
  const {
    dashboardMetrics,
    staffUtilization,
    departmentAnalytics,
    isLoading,
    fetchDashboardMetrics,
    fetchStaffUtilization,
    fetchDepartmentAnalytics,
  } = useAnalyticsStore();

  useEffect(() => {
    fetchDashboardMetrics();
    fetchStaffUtilization();
    fetchDepartmentAnalytics();
  }, [fetchDashboardMetrics, fetchStaffUtilization, fetchDepartmentAnalytics]);

  if (isLoading && !dashboardMetrics) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl">
          Analytics Dashboard
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Insights and metrics for your staff scheduling
        </p>
      </div>

      {/* Metrics Cards */}
      {dashboardMetrics && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Staff"
            value={dashboardMetrics.staff.total}
            change={{
              value: dashboardMetrics.staff.activePercentage,
              type: "increase",
            }}
          />
          <MetricCard
            title="Total Rosters"
            value={dashboardMetrics.rosters.total}
            change={{
              value: dashboardMetrics.rosters.publishedPercentage,
              type: "increase",
            }}
          />
          <MetricCard
            title="This Week"
            value={dashboardMetrics.shifts.thisWeek}
          />
          <MetricCard
            title="Upcoming"
            value={dashboardMetrics.shifts.upcoming}
          />
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Staff Utilization
            </h3>
            <StaffUtilizationChart data={staffUtilization} />
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Department Distribution
            </h3>
            <DepartmentChart data={departmentAnalytics} />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      {dashboardMetrics && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Recent Activity
            </h3>
            {dashboardMetrics.recentActivity.length === 0 ? (
              <p className="text-gray-500">No recent activity</p>
            ) : (
              <div className="space-y-3">
                {dashboardMetrics.recentActivity.map(
                  (roster: {
                    id: string;
                    name: string;
                    isPublished: boolean;
                    updatedAt: string;
                    _count: { shifts: number };
                  }) => (
                    <div
                      key={roster.id}
                      className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {roster.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {roster._count.shifts} shifts •{" "}
                          {roster.isPublished ? "Published" : "Draft"}
                        </p>
                      </div>
                      <div className="text-xs text-gray-500">
                        {format(new Date(roster.updatedAt), "MMM d, h:mm a")}
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
