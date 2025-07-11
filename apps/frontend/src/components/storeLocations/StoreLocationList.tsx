"use client";

import { useEffect, useState } from "react";
import { useStoreLocationStore } from "@/store/storeLocationStore";
import { useAuthStore } from "@/store/authStore";
import {
  PlusIcon,
  MapPinIcon,
  UsersIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import StoreLocationForm from "./StoreLocationForm";
import StaffAssignmentModal from "./StaffAssignmentModal";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { StoreLocation } from "@rooster-ai/shared";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { toast } from "react-hot-toast";

export default function StoreLocationList() {
  const { user } = useAuthStore();
  const {
    storeLocations,
    isLoading,
    fetchStoreLocations,
    deleteStoreLocation,
  } = useStoreLocationStore();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [assigningStaff, setAssigningStaff] = useState<StoreLocation | null>(
    null
  );
  const [editingLocation, setEditingLocation] = useState<StoreLocation | null>(
    null
  );
  const [deletingLocation, setDeletingLocation] =
    useState<StoreLocation | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    locationId: string;
    locationName: string;
  }>({
    isOpen: false,
    locationId: "",
    locationName: "",
  });

  useEffect(() => {
    fetchStoreLocations();
  }, [fetchStoreLocations]);

  const canManageLocations =
    user?.role && ["admin", "owner", "manager"].includes(user.role);

  const handleDeleteLocation = async () => {
    try {
      await deleteStoreLocation(confirmDialog.locationId);
      setConfirmDialog({ isOpen: false, locationId: "", locationName: "" });
    } catch (error) {
      // Error handling is done in the store
    }
  };

  // ✅ Helper function to get staff count
  const getStaffCount = (location: StoreLocation): number => {
    return location.staffCount || location._count?.staffAssignments || 0;
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Store Locations</h1>
          <p className="text-gray-600">
            Manage your company's store locations and staff assignments
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="inline-flex items-center px-4 py-2 bg-[#f11d1c] text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Add Location
        </button>
      </div>

      {/* Locations Grid */}
      {storeLocations.length === 0 ? (
        <div className="text-center py-12">
          <MapPinIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No store locations
          </h3>
          <p className="text-gray-600 mb-4">
            Get started by creating your first store location
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center px-4 py-2 bg-[#f11d1c] text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Add Location
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {storeLocations.map((location) => (
            <div
              key={location.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <MapPinIcon className="w-6 h-6 text-[#f11d1c] mr-3" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {location.name}
                    </h3>
                    <p className="text-sm text-gray-600">{location.address}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      location.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {location.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-600">
                  <UsersIcon className="w-4 h-4 mr-1" />
                  <span>{getStaffCount(location)} staff assigned</span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setAssigningStaff(location)}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Assign Staff"
                  >
                    <UsersIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setEditingLocation(location)}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Edit Location"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeletingLocation(location)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete Location"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Location Modal */}
      {showCreateForm && (
        <StoreLocationForm
          onCancel={() => setShowCreateForm(false)}
          onSuccess={() => {
            setShowCreateForm(false);
            fetchStoreLocations();
          }}
        />
      )}

      {/* Edit Location Modal */}
      {editingLocation && (
        <StoreLocationForm
          location={editingLocation}
          onCancel={() => setEditingLocation(null)}
          onSuccess={() => {
            setEditingLocation(null);
            fetchStoreLocations();
          }}
        />
      )}

      {/* Staff Assignment Modal */}
      {assigningStaff && (
        <StaffAssignmentModal
          location={assigningStaff}
          onCancel={() => setAssigningStaff(null)}
          onSuccess={() => {
            setAssigningStaff(null);
            fetchStoreLocations();
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {deletingLocation && (
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          title="Delete Store Location"
          message={`Are you sure you want to delete "${confirmDialog.locationName}"? This action cannot be undone.`}
          confirmText="Delete"
          confirmButtonClass="bg-red-600 hover:bg-red-700"
          onConfirm={handleDeleteLocation}
          onCancel={() =>
            setConfirmDialog({
              isOpen: false,
              locationId: "",
              locationName: "",
            })
          }
        />
      )}
    </div>
  );
}
