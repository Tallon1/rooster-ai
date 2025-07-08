"use client";

import { useState } from "react";
import { useStaffStore } from "@/store/staffStore";
import { Menu, Transition } from "@headlessui/react";
import { ChevronDownIcon, FunnelIcon } from "@heroicons/react/24/outline";
import { Fragment } from "react";

export default function StaffFilters() {
  const { filters, setFilters } = useStaffStore();
  const [isOpen, setIsOpen] = useState(false);

  const departments = ["Front of House", "Kitchen", "Bar", "Management"];
  const positions = ["Server", "Cook", "Bartender", "Host", "Manager"];

  const handleDepartmentChange = (department: string) => {
    setFilters({
      ...filters,
      department: filters.department === department ? undefined : department,
    });
  };

  const handlePositionChange = (position: string) => {
    setFilters({
      ...filters,
      position: filters.position === position ? undefined : position,
    });
  };

  const handleStatusChange = (isActive: boolean) => {
    setFilters({
      ...filters,
      isActive: filters.isActive === isActive ? undefined : isActive,
    });
  };

  const clearFilters = () => {
    setFilters({
      page: 1,
      limit: 20,
      sortBy: "name",
      sortOrder: "asc",
    });
  };

  const hasActiveFilters =
    filters.department || filters.position || filters.isActive !== undefined;

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
          <FunnelIcon className="h-4 w-4 mr-2" />
          Filters
          {hasActiveFilters && (
            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
              Active
            </span>
          )}
          <ChevronDownIcon className="ml-2 -mr-1 h-4 w-4" />
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
          <div className="py-1">
            {/* Department Filter */}
            <div className="px-4 py-2 text-sm font-medium text-gray-900 border-b border-gray-200">
              Department
            </div>
            {departments.map((department) => (
              <Menu.Item key={department}>
                <button
                  onClick={() => handleDepartmentChange(department)}
                  className={`block w-full text-left px-4 py-2 text-sm ${
                    filters.department === department
                      ? "bg-primary-100 text-primary-900"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {department}
                </button>
              </Menu.Item>
            ))}

            {/* Position Filter */}
            <div className="px-4 py-2 text-sm font-medium text-gray-900 border-b border-gray-200 mt-2">
              Position
            </div>
            {positions.map((position) => (
              <Menu.Item key={position}>
                <button
                  onClick={() => handlePositionChange(position)}
                  className={`block w-full text-left px-4 py-2 text-sm ${
                    filters.position === position
                      ? "bg-primary-100 text-primary-900"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {position}
                </button>
              </Menu.Item>
            ))}

            {/* Status Filter */}
            <div className="px-4 py-2 text-sm font-medium text-gray-900 border-b border-gray-200 mt-2">
              Status
            </div>
            <Menu.Item>
              <button
                onClick={() => handleStatusChange(true)}
                className={`block w-full text-left px-4 py-2 text-sm ${
                  filters.isActive === true
                    ? "bg-primary-100 text-primary-900"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Active
              </button>
            </Menu.Item>
            <Menu.Item>
              <button
                onClick={() => handleStatusChange(false)}
                className={`block w-full text-left px-4 py-2 text-sm ${
                  filters.isActive === false
                    ? "bg-primary-100 text-primary-900"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Inactive
              </button>
            </Menu.Item>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <Menu.Item>
                <button
                  onClick={clearFilters}
                  className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-gray-100 border-t border-gray-200 mt-2"
                >
                  Clear Filters
                </button>
              </Menu.Item>
            )}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
