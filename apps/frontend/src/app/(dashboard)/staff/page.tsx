"use client";

import { useState, useEffect } from "react";
import { PlusIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useStaffStore } from "@/store/staffStore";
import StaffCard from "@/components/staff/StaffCard";
import StaffFilters from "@/components/staff/StaffFilters";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Button from "@/components/ui/Button";

export default function StaffPage() {
  const { staff, isLoading, fetchStaff, filters, setFilters } = useStaffStore();
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const handleSearch = (search: string) => {
    setSearchTerm(search);
    setFilters({ ...filters, search });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Staff Members
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage your team members and their availability
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <Button href="/staff/add" icon={PlusIcon}>
            Add Staff
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white shadow rounded-lg">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Search staff members..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Filters */}
            <StaffFilters />
          </div>
        </div>
      </div>

      {/* Staff List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : staff.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto h-12 w-12 text-gray-400">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                  />
                </svg>
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No staff members
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by adding your first staff member.
              </p>
              <div className="mt-6">
                <Button href="/staff/add" icon={PlusIcon}>
                  Add Staff Member
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {staff.map((member) => (
                <StaffCard key={member.id} staff={member} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
