"use client";

import { useState, useEffect } from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks } from "date-fns";
import { useRosterStore } from "@/store/rosterStore";
import WeeklyRoster from "@/components/roster/WeeklyRoster";
import RosterAI from "@/components/roster/RosterAI";
import Button from "@/components/ui/Button";

export default function RostersPage() {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const { currentRoster, isLoading, fetchWeeklyRoster } = useRosterStore();

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });

  useEffect(() => {
    fetchWeeklyRoster(weekStart, weekEnd);
  }, [currentWeek, fetchWeeklyRoster, weekStart, weekEnd]);

  const handlePreviousWeek = () => {
    setCurrentWeek(subWeeks(currentWeek, 1));
  };

  const handleNextWeek = () => {
    setCurrentWeek(addWeeks(currentWeek, 1));
  };

  return (
    <div className="h-full flex">
      {/* Main Roster View */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-semibold text-gray-900">
                Weekly Roster
              </h1>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handlePreviousWeek}
                  className="p-2 rounded-md text-gray-400 hover:text-gray-600"
                >
                  <ChevronLeftIcon className="h-5 w-5" />
                </button>
                <span className="text-sm font-medium text-gray-900 min-w-[200px] text-center">
                  {format(weekStart, "MMM d")} -{" "}
                  {format(weekEnd, "MMM d, yyyy")}
                </span>
                <button
                  onClick={handleNextWeek}
                  className="p-2 rounded-md text-gray-400 hover:text-gray-600"
                >
                  <ChevronRightIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Draft
              </span>
              <Button variant="outline">Generate</Button>
              <Button>Save</Button>
              <Button variant="primary">Publish</Button>
            </div>
          </div>
        </div>

        {/* Roster Grid */}
        <div className="flex-1 overflow-auto">
          <WeeklyRoster
            weekStart={weekStart}
            weekEnd={weekEnd}
            roster={currentRoster}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* AI Assistant Sidebar */}
      <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
        <RosterAI />
      </div>
    </div>
  );
}
