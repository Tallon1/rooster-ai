"use client";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: number;
  trendLabel?: string;
  change?: {
    value: number;
    type: "increase" | "decrease";
  };
  icon?: React.ComponentType<{ className?: string }>;
}

export default function MetricCard({
  title,
  value,
  subtitle,
  trend,
  trendLabel,
  change,
  icon: Icon,
}: MetricCardProps) {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
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
              <dd className="text-lg font-medium text-gray-900">{value}</dd>
              {subtitle && (
                <dd className="text-sm text-gray-500">{subtitle}</dd>
              )}
            </dl>
          </div>
        </div>

        {(change || trend !== undefined) && (
          <div className="mt-4">
            <div className="flex items-center">
              {change && (
                <span
                  className={`text-sm font-medium ${
                    change.type === "increase"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {change.type === "increase" ? "+" : "-"}
                  {Math.abs(change.value)}%
                </span>
              )}

              {trend !== undefined && (
                <span
                  className={`text-sm font-medium ${
                    trend > 0
                      ? "text-green-600"
                      : trend < 0
                        ? "text-red-600"
                        : "text-gray-600"
                  }`}
                >
                  {trend > 0 ? "+" : ""}
                  {trend}%
                </span>
              )}

              {trendLabel && (
                <span className="text-sm text-gray-500 ml-2">{trendLabel}</span>
              )}

              {change && (
                <span className="text-sm text-gray-500 ml-2">
                  from last month
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
