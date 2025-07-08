"use client";

import { format } from "date-fns";
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { useRosterStore } from "@/store/rosterStore";

interface ShiftCardProps {
  shift: {
    id: string;
    startTime: string | Date;
    endTime: string | Date;
    position: string;
    notes?: string;
    isConfirmed: boolean;
    staff: {
      id: string;
      name: string;
      position: string;
    };
  };
}

export default function ShiftCard({ shift }: ShiftCardProps) {
  const { deleteShift } = useRosterStore();

  const startTime = new Date(shift.startTime);
  const endTime = new Date(shift.endTime);

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this shift?")) {
      await deleteShift(shift.id);
    }
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-md p-2 text-xs">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-blue-900 truncate">
            {shift.staff.name}
          </p>
          <p className="text-blue-700">
            {format(startTime, "h:mm a")} - {format(endTime, "h:mm a")}
          </p>
          <p className="text-blue-600">{shift.position}</p>
        </div>

        <Menu as="div" className="relative">
          <Menu.Button className="p-1 rounded text-blue-400 hover:text-blue-600">
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

      {shift.notes && (
        <p className="mt-1 text-blue-600 text-xs">{shift.notes}</p>
      )}
    </div>
  );
}
