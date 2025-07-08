"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { useStaffStore } from "@/store/staffStore";
import { useRosterStore } from "@/store/rosterStore";

const addShiftSchema = z.object({
  staffId: z.string().min(1, "Staff member is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  position: z.string().min(1, "Position is required"),
  notes: z.string().optional(),
});

type AddShiftFormData = z.infer<typeof addShiftSchema>;

interface AddShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  rosterId: string;
}

export default function AddShiftModal({
  isOpen,
  onClose,
  rosterId,
  selectedDate,
}: AddShiftModalProps) {
  const { staff } = useStaffStore();
  const { addShift, isLoading } = useRosterStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AddShiftFormData>({
    resolver: zodResolver(addShiftSchema),
    defaultValues: {
      startTime: "09:00",
      endTime: "17:00",
    },
  });

  const onSubmit = async (data: AddShiftFormData) => {
    try {
      const baseDate = selectedDate || new Date();
      const dateStr = baseDate.toISOString().split("T")[0];

      const startDateTime = new Date(`${dateStr}T${data.startTime}:00`);
      const endDateTime = new Date(`${dateStr}T${data.endTime}:00`);

      await addShift(rosterId, {
        ...data,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
      });

      reset();
      onClose();
    } catch (error) {
      // Error is handled by the store
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add New Shift"
      footer={
        <>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" form="add-shift-form" loading={isLoading}>
            Add Shift
          </Button>
        </>
      }
    >
      <form
        id="add-shift-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Staff Member
          </label>
          <select
            {...register("staffId")}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          >
            <option value="">Select staff member</option>
            {staff.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name} - {member.position}
              </option>
            ))}
          </select>
          {errors.staffId && (
            <p className="mt-1 text-sm text-red-600">
              {errors.staffId.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Start Time
            </label>
            <input
              type="time"
              {...register("startTime")}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
            {errors.startTime && (
              <p className="mt-1 text-sm text-red-600">
                {errors.startTime.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              End Time
            </label>
            <input
              type="time"
              {...register("endTime")}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
            {errors.endTime && (
              <p className="mt-1 text-sm text-red-600">
                {errors.endTime.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Position
          </label>
          <input
            type="text"
            {...register("position")}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            placeholder="e.g., Server, Cook, Bartender"
          />
          {errors.position && (
            <p className="mt-1 text-sm text-red-600">
              {errors.position.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Notes (Optional)
          </label>
          <textarea
            {...register("notes")}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            placeholder="Any additional notes for this shift..."
          />
        </div>
      </form>
    </Modal>
  );
}
