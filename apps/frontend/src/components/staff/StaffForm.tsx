"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Staff } from "@rooster-ai/shared";
import Button from "@/components/ui/Button";
import { useStaffStore } from "@/store/staffStore";
import { useRouter } from "next/navigation";
import { useStoreLocationStore } from "@/store/storeLocationStore";

// Create a frontend-specific schema that matches the form requirements
const staffFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  phone: z.string().optional(),
  position: z.string().min(1, "Position is required"),
  department: z.string().min(1, "Department is required"),
  hourlyRate: z.number().positive("Hourly rate must be positive").optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  isActive: z.boolean(),
});

type StaffFormData = z.infer<typeof staffFormSchema>;

interface StaffFormProps {
  staff?: Staff;
  onSuccess?: () => void;
}

export default function StaffForm({ staff, onSuccess }: StaffFormProps) {
  const router = useRouter();
  const { createStaff, updateStaff, isLoading } = useStaffStore();
  const { storeLocations } = useStoreLocationStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StaffFormData>({
    resolver: zodResolver(staffFormSchema),
    defaultValues: staff
      ? {
          name: staff.name,
          email: staff.email,
          phone: staff.phone || "",
          position: staff.position,
          department: staff.department,
          hourlyRate: staff.hourlyRate || undefined,
          startDate: new Date(staff.startDate).toISOString().split("T")[0],
          endDate: staff.endDate
            ? new Date(staff.endDate).toISOString().split("T")[0]
            : "",
          isActive: staff.isActive,
        }
      : {
          name: "",
          email: "",
          phone: "",
          position: "",
          department: "",
          startDate: new Date().toISOString().split("T")[0],
          isActive: true,
        },
  });

  const onSubmit = async (data: StaffFormData) => {
    try {
      const submitData = {
        ...data,
        startDate: new Date(data.startDate).toISOString(),
        ...(data.endDate && { endDate: new Date(data.endDate).toISOString() }),
      };

      if (staff) {
        await updateStaff(staff.id, submitData);
      } else {
        await createStaff(submitData);
      }

      onSuccess?.();
      router.push("/staff");
    } catch (error) {
      // Error is handled by the store
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Name *
          </label>
          <input
            type="text"
            {...register("name")}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Email *
          </label>
          <input
            type="email"
            {...register("email")}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Phone
          </label>
          <input
            type="tel"
            {...register("phone")}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Assigned Locations
          </label>
          <div className="space-y-2">
            {storeLocations.map((location) => (
              <label key={location.id} className="flex items-center">
                <input
                  type="checkbox"
                  value={location.id}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-900">
                  {location.name}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Position *
          </label>
          <input
            type="text"
            {...register("position")}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          />
          {errors.position && (
            <p className="mt-1 text-sm text-red-600">
              {errors.position.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Department *
          </label>
          <select
            {...register("department")}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          >
            <option value="">Select department</option>
            <option value="Front of House">Front of House</option>
            <option value="Kitchen">Kitchen</option>
            <option value="Bar">Bar</option>
            <option value="Management">Management</option>
          </select>
          {errors.department && (
            <p className="mt-1 text-sm text-red-600">
              {errors.department.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Hourly Rate
          </label>
          <input
            type="number"
            step="0.01"
            {...register("hourlyRate", { valueAsNumber: true })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          />
          {errors.hourlyRate && (
            <p className="mt-1 text-sm text-red-600">
              {errors.hourlyRate.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Start Date *
          </label>
          <input
            type="date"
            {...register("startDate")}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          />
          {errors.startDate && (
            <p className="mt-1 text-sm text-red-600">
              {errors.startDate.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            End Date
          </label>
          <input
            type="date"
            {...register("endDate")}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          />
        </div>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          {...register("isActive")}
          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
        />
        <label className="ml-2 block text-sm text-gray-900">
          Active staff member
        </label>
      </div>

      <div className="flex justify-end space-x-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/staff")}
        >
          Cancel
        </Button>
        <Button type="submit" loading={isLoading}>
          {staff ? "Update" : "Create"} Staff Member
        </Button>
      </div>
    </form>
  );
}
