"use client";

import { clsx } from "clsx";

interface MetricCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  trend?: number;
  trendLabel?: string;
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
}

export default function MetricCard({
  title,
  value,
  subtitle,
  trend,
  trendLabel,
  icon: Icon,
  className,
}: MetricCardProps) {
  return (
    <div
      className={clsx("bg-white overflow-hidden shadow rounded-lg", className)}
    >
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            {Icon && <Icon className="h-6 w-6 text-gray-400" />}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                {title}
              </dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-gray-900">
                  {value}
                </div>
                {subtitle && (
                  <div className="ml-2 text-sm text-gray-500">{subtitle}</div>
                )}
              </dd>
            </dl>
          </div>
        </div>

        {trend !== undefined && trendLabel && (
          <div className="mt-3 flex items-center">
            <div
              className={clsx(
                "flex items-center text-sm font-medium",
                trend >= 0 ? "text-green-600" : "text-red-600"
              )}
            >
              <span>
                {trend >= 0 ? "+" : ""}
                {trend}%
              </span>
            </div>
            <div className="ml-2 text-sm text-gray-500">{trendLabel}</div>
          </div>
        )}
      </div>
    </div>
  );
}
