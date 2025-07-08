'use client';

import { useEffect } from 'react';
import { useAnalyticsStore } from '@/store/analyticsStore';
import MetricCard from '@/components/analytics/MetricCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import {
  UsersIcon,
  CalendarDaysIcon,
  ClockIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

export default function AnalyticsPage() {
  const { dashboardMetrics, isLoading, fetchDashboardMetrics } = useAnalyticsStore();

  useEffect(() => {
    fetchDashboardMetrics();
  }, [fetchDashboardMetrics]);

  if (isLoading || !dashboardMetrics) {
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
        <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Overview of your staff scheduling performance and insights
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Staff"
          value={dashboardMetrics.staff.total}
          subtitle={`${dashboardMetrics.staff.active} active`}
          trend={dashboardMetrics.staff.activePercentage}
          trendLabel="active rate"
          icon={UsersIcon}
        />
        
        <MetricCard
          title="Total Rosters"
          value={dashboardMetrics.rosters.total}
          subtitle={`${dashboardMetrics.rosters.published} published`}
          trend={dashboardMetrics.rosters.publishedPercentage}
          trendLabel="published rate"
          icon={CalendarDaysIcon}
        />
        
        <MetricCard
          title="This Week"
          value={dashboardMetrics.shifts.thisWeek}
          subtitle="shifts scheduled"
          icon={ClockIcon}
        />
        
        <MetricCard
          title="Upcoming"
          value={dashboardMetrics.shifts.upcoming}
          subtitle="future shifts"
          icon={ChartBarIcon}
        />
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Recent Activity
          </h3>
          
          {dashboardMetrics.recentActivity.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No recent activity</p>
          ) : (
            <div className="space-y-3">
              {dashboardMetrics.recentActivity.map((roster) => (
                <div key={roster.id} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{roster.name}</p>
                    <p className="text-sm text-gray-500">
                      {roster._count.shifts} shifts • {roster.isPublished ? 'Published' : 'Draft'}
                    </p>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(roster.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
