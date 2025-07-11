import React, { useState, useEffect } from 'react';
import { StoreLocation, Staff } from '@rooster-ai/shared';

export interface StaffAssignmentModalProps {
  location: StoreLocation;
  onCancel: () => void;        // ✅ Add missing prop
  onSuccess: () => void;      // ✅ Add missing prop
}

export default function StaffAssignmentModal({ 
  location, 
  onCancel, 
  onSuccess 
}: StaffAssignmentModalProps) {
  const [availableStaff, setAvailableStaff] = useState<Staff[]>([]);
  const [assignedStaff, setAssignedStaff] = useState<Staff[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<string[]>([]);

  useEffect(() => {
    fetchStaffData();
  }, [location.id]);

  const fetchStaffData = async () => {
    try {
      // Fetch all staff and assigned staff for this location
      const [allStaff, assignments] = await Promise.all([
        fetch('/api/staff').then(res => res.json()),
        fetch(`/api/store-locations/${location.id}/staff`).then(res => res.json())
      ]);

      setAvailableStaff(allStaff.data || []);
      setAssignedStaff(assignments.data || []);
    } catch (error) {
      console.error('Failed to fetch staff data:', error);
    }
  };

  const handleAssignStaff = async () => {
    try {
      await fetch(`/api/store-locations/${location.id}/assign-staff`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ staffIds: selectedStaff }),
      });

      onSuccess(); // ✅ Call success callback
    } catch (error) {
      console.error('Failed to assign staff:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            Assign Staff to {location.name}
          </h2>
          <button
            onClick={onCancel} // ✅ Call close callback
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        <div className="space-y-6">
          {/* Currently Assigned Staff */}
          <div>
            <h3 className="text-lg font-medium mb-3">Currently Assigned Staff</h3>
            {assignedStaff.length > 0 ? (
              <div className="space-y-2">
                {assignedStaff.map((staff) => (
                  <div key={staff.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <span className="font-medium">{staff.name}</span>
                      <span className="text-gray-500 ml-2">({staff.position})</span>
                    </div>
                    <button
                      onClick={() => handleUnassignStaff(staff.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No staff currently assigned to this location.</p>
            )}
          </div>

          {/* Available Staff */}
          <div>
            <h3 className="text-lg font-medium mb-3">Available Staff</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {availableStaff
                .filter(staff => !assignedStaff.some(assigned => assigned.id === staff.id))
                .map((staff) => (
                  <div key={staff.id} className="flex items-center p-3 border rounded-lg">
                    <input
                      type="checkbox"
                      id={`staff-${staff.id}`}
                      checked={selectedStaff.includes(staff.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedStaff([...selectedStaff, staff.id]);
                        } else {
                          setSelectedStaff(selectedStaff.filter(id => id !== staff.id));
                        }
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`staff-${staff.id}`} className="ml-3 flex-1">
                      <span className="font-medium">{staff.name}</span>
                      <span className="text-gray-500 ml-2">({staff.position} - {staff.department})</span>
                    </label>
                  </div>
                ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-6 border-t">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleAssignStaff}
            disabled={selectedStaff.length === 0}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Assign Selected Staff ({selectedStaff.length})
          </button>
        </div>
      </div>
    </div>
  );

  async function handleUnassignStaff(staffId: string) {
    try {
      await fetch(`/api/store-locations/${location.id}/unassign-staff`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ staffId }),
      });

      // Refresh staff data
      fetchStaffData();
    } catch (error) {
      console.error('Failed to unassign staff:', error);
    }
  }
}
