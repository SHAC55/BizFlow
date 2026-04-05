import React from "react";
import { X } from "lucide-react";
import { useForm } from "react-hook-form";
import { useAdjustProductStock } from "../hooks/useProducts";

const adjustmentTypes = [
  { value: "INCREASE", label: "Increase" },
  { value: "DECREASE", label: "Decrease" },
  { value: "SET", label: "Set Exact Quantity" },
];

const AdjustStockModal = ({
  product,
  isOpen,
  onClose,
  onAdjusted,
}) => {
  const { adjustProductStock, isLoading, error } = useAdjustProductStock();
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      type: "INCREASE",
      quantity: "",
      reason: "",
      notes: "",
    },
  });

  React.useEffect(() => {
    if (!isOpen) {
      reset({
        type: "INCREASE",
        quantity: "",
        reason: "",
        notes: "",
      });
    }
  }, [isOpen, reset]);

  const selectedType = watch("type");

  const onSubmit = async (data) => {
    await adjustProductStock(product.id, {
      type: data.type,
      quantity: Number(data.quantity),
      reason: data.reason,
      notes: data.notes || undefined,
    });

    onAdjusted();
    onClose();
  };

  if (!isOpen || !product) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Adjust Stock</h2>
            <p className="mt-1 text-sm text-gray-500">
              {product.name} currently has {product.quantity} units.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Adjustment Type
            </label>
            <select
              {...register("type")}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
            >
              {adjustmentTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {selectedType === "SET" ? "New Quantity" : "Quantity"}
            </label>
            <input
              type="number"
              {...register("quantity", {
                required: "Quantity is required",
                min: {
                  value: 1,
                  message:
                    selectedType === "SET"
                      ? "Quantity must be 1 or more"
                      : "Quantity must be greater than 0",
                },
              })}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
              placeholder={selectedType === "SET" ? "Enter new quantity" : "Enter quantity"}
            />
            {errors.quantity && (
              <p className="mt-1 text-xs text-red-500">
                {errors.quantity.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Reason
            </label>
            <input
              {...register("reason", {
                required: "Reason is required",
              })}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
              placeholder="e.g. supplier delivery"
            />
            {errors.reason && (
              <p className="mt-1 text-xs text-red-500">
                {errors.reason.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Notes
            </label>
            <textarea
              {...register("notes")}
              rows={3}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
              placeholder="Optional internal note"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {isLoading ? "Saving..." : "Save Adjustment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdjustStockModal;
