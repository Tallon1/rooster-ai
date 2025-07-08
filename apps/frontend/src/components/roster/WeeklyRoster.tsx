"use client";

import { useState } from "react";
import { format, addDays, isSameDay } from "date-fns";
import { useStaffStore } from "@/store/staffStore";
import { useRosterStore } from "@/store/rosterStore";
import ShiftCard from "./ShiftCard";
import AddShiftModal from "./AddShiftModal";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { FrontendRoster, RosterShift } from "@/types/roster.types";

interface WeeklyRosterProps {
  weekStart: Date;
  weekEnd: Date;
  roster: FrontendRoster | null;
  isLoading: boolean;
}

export default function WeeklyRoster({
  weekStart,
  weekEnd,
  roster,
  isLoading,
}: WeeklyRosterProps) {
  const [selectedSlot, setSelectedSlot] = useState<{
    date: Date;
    hour: number;
  } | null>(null);
  const { staff } = useStaffStore();

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const hours = Array.from({ length: 16 }, (_, i) => i + 6); // 6 AM to 10 PM

  const getShiftsForDateAndHour = (date: Date, hour: number): RosterShift[] => {
    if (!roster) return [];

    return roster.shifts.filter((shift) => {
      const shiftStart = new Date(shift.startTime);
      const shiftHour = shiftStart.getHours();
      return isSameDay(shiftStart, date) && shiftHour === hour;
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <div className="min-w-full overflow-x-auto">
        <div className="grid grid-cols-8 gap-px bg-gray-200">
          {/* Header row */}
          <div className="bg-gray-50 p-3 text-center font-medium text-gray-900">
            Time
          </div>
          {days.map((day) => (
            <div key={day.toISOString()} className="bg-gray-50 p-3 text-center">
              <div className="font-medium text-gray-900">
                {format(day, "EEE")}
              </div>
              <div className="text-sm text-gray-500">
                {format(day, "MMM d")}
              </div>
            </div>
          ))}

          {/* Time slots */}
          {hours.map((hour) => (
            <div key={hour} className="contents">
              <div className="bg-white p-3 text-center text-sm font-medium text-gray-500 border-r">
                {format(new Date().setHours(hour, 0, 0, 0), "h:mm a")}
              </div>
              {days.map((day) => {
                const shifts = getShiftsForDateAndHour(day, hour);
                return (
                  <div
                    key={`${day.toISOString()}-${hour}`}
                    className="bg-white p-2 min-h-[80px] border-b hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedSlot({ date: day, hour })}
                  >
                    <div className="space-y-1">
                      {shifts.map((shift) => (
                        <ShiftCard key={shift.id} shift={shift} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {selectedSlot && (
        <AddShiftModal
          isOpen={!!selectedSlot}
          onClose={() => setSelectedSlot(null)}
          selectedDate={selectedSlot.date}
          rosterId={roster?.id || ""}
        />
      )}
    </>
  );
}
