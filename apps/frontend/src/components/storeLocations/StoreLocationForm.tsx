// src/components/storeLocations/StoreLocationForm.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useStoreLocationStore } from "@/store/storeLocationStore";
import { toast } from "react-hot-toast";

// Make isActive required to match form expectations
const storeLocationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  isActive: z.boolean(), // Remove .default(true) to make it required
});

type StoreLocationForm = z.infer<typeof storeLocationSchema>;

interface StoreLocationFormProps {
  location?: {
    id: string;
    name: string;
    address: string;
    isActive: boolean;
  };
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function StoreLocationForm({
  location,
  onSuccess,
  onCancel,
}: StoreLocationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Use store functions
  const { createStoreLocation, updateStoreLocation } = useStoreLocationStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<StoreLocationForm>({
    resolver: zodResolver(storeLocationSchema),
    defaultValues: location
      ? {
          name: location.name,
          address: location.address,
          isActive: location.isActive,
        }
      : {
          name: "",
          address: "",
          isActive: true, // ✅ Provide default value here instead
        },
  });

  // ✅ Fix: Properly type the onSubmit function
  const onSubmit = async (formData: StoreLocationForm) => {
    setIsSubmitting(true);

    try {
      if (location) {
        await updateStoreLocation(location.id, formData);
      } else {
        await createStoreLocation(formData);
      }

      reset();
      onSuccess?.();
    } catch (error) {
      toast.error(`Failed to ${location ? "update" : "create"} store location`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Location Name *
        </label>
        <input
          type="text"
          {...register("name")}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f11d1c] focus:border-transparent"
          placeholder="Main Street Store"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Address *
        </label>
        <textarea
          {...register("address")}
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f11d1c] focus:border-transparent"
          placeholder="123 Main Street, Dublin, Ireland"
        />
        {errors.address && (
          <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
        )}
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          {...register("isActive")}
          className="h-4 w-4 text-[#f11d1c] focus:ring-[#f11d1c] border-gray-300 rounded"
        />
        <label className="ml-2 block text-sm text-gray-900">
          Active location
        </label>
      </div>

      <div className="flex justify-end space-x-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-[#f11d1c] text-white rounded-md hover:bg-red-600 disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : location ? "Update" : "Create"}
        </button>
      </div>
    </form>
  );
}
