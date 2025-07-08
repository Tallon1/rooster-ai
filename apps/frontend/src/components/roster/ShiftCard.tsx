"use client";

import { format } from "date-fns";
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { useRosterStore } from "@/store/rosterStore";
import { RosterShift } from "@/types/roster.types";

interface ShiftCardProps {
  shift: RosterShift;
}

export default function ShiftCard({ shift }: ShiftCardProps) {
  const { deleteShift, updateShift } = useRosterStore();

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this shift?")) {
      await deleteShift(shift.id);
    }
  };

  const handleConfirm = async () => {
    await updateShift(shift.id, { isConfirmed: !shift.isConfirmed });
  };

  const duration =
    (new Date(shift.endTime).getTime() - new Date(shift.startTime).getTime()) /
    (1000 * 60 * 60);

  return (
    <div
      className={`relative rounded-md p-2 text-xs ${
        shift.isConfirmed
          ? "bg-green-100 border border-green-200"
          : "bg-blue-100 border border-blue-200"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 truncate">
            {shift.staff.name}
          </p>
          <p className="text-gray-600 truncate">{shift.position}</p>
          <p className="text-gray-500">
            {format(new Date(shift.startTime), "h:mm a")} -{" "}
            {format(new Date(shift.endTime), "h:mm a")}
          </p>
          <p className="text-gray-500">{duration.toFixed(1)}h</p>
        </div>

        <Menu as="div" className="relative">
          <Menu.Button className="p-1 rounded-full text-gray-400 hover:text-gray-600">
            <EllipsisVerticalIcon className="h-4 w-4" />
          </Menu.Button>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute right-0 z-10 mt-1 w-32 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              <Menu.Item>
                <button
                  onClick={handleConfirm}
                  className="block w-full text-left px-3 py-1 text-xs text-gray-700 hover:bg-gray-100"
                >
                  {shift.isConfirmed ? "Unconfirm" : "Confirm"}
                </button>
              </Menu.Item>
              <Menu.Item>
                <button
                  onClick={handleDelete}
                  className="block w-full text-left px-3 py-1 text-xs text-red-700 hover:bg-gray-100"
                >
                  Delete
                </button>
              </Menu.Item>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>
    </div>
  );
}
