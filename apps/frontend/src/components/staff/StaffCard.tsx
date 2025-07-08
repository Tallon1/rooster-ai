'use client';

import Link from 'next/link';
import { Staff } from '@rooster-ai/shared';
import { 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon,
  EllipsisVerticalIcon 
} from '@heroicons/react/24/outline';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { useStaffStore } from '@/store/staffStore';

interface StaffCardProps {
  staff: Staff;
}

export default function StaffCard({ staff }: StaffCardProps) {
  const { deleteStaff } = useStaffStore();

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this staff member?')) {
      await deleteStaff(staff.id);
    }
  };

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-primary-600 font-medium text-lg">
                  {staff.name.charAt(0)}
                </span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">
                <Link 
                  href={`/staff/${staff.id}`}
                  className="hover:text-primary-600 transition-colors"
                >
                  {staff.name}
                </Link>
              </h3>
              <p className="text-sm text-gray-500">{staff.position}</p>
            </div>
          </div>
          
          <Menu as="div" className="relative">
            <Menu.Button className="p-2 rounded-full text-gray-400 hover:text-gray-600">
              <EllipsisVerticalIcon className="h-5 w-5" />
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
              <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <Menu.Item>
                  <Link
                    href={`/staff/${staff.id}/edit`}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Edit
                  </Link>
                </Menu.Item>
                <Menu.Item>
                  <button
                    onClick={handleDelete}
                    className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-gray-100"
                  >
                    Delete
                  </button>
                </Menu.Item>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex items-center text-sm text-gray-500">
            <MapPinIcon className="h-4 w-4 mr-2" />
            {staff.department}
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <EnvelopeIcon className="h-4 w-4 mr-2" />
            {staff.email}
          </div>
          {staff.phone && (
            <div className="flex items-center text-sm text-gray-500">
              <PhoneIcon className="h-4 w-4 mr-2" />
              {staff.phone}
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            staff.isActive 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {staff.isActive ? 'Active' : 'Inactive'}
          </span>
          
          {staff.hourlyRate && (
            <span className="text-sm font-medium text-gray-900">
              ${staff.hourlyRate}/hr
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
