import React from "react";
import { History, X } from "lucide-react";
import { useProductMovements } from "../hooks/useProducts";

const formatMovementType = (type) => {
  if (type === "INCREASE") {
    return "Increase";
  }

  if (type === "DECREASE") {
    return "Decrease";
  }

  if (type === "SET") {
    return "Set";
  }

  return "Initial";
};

const ProductMovementsPanel = ({ product, isOpen, onClose }) => {
  const { movements, isLoading, error } = useProductMovements(
    product?.id,
    isOpen,
  );

  if (!isOpen || !product) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/30">
      <div className="h-full w-full max-w-lg overflow-y-auto bg-white shadow-2xl">
        <div className="sticky top-0 border-b border-gray-200 bg-white px-6 py-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 text-gray-900">
                <History className="h-5 w-5" />
                <h2 className="text-xl font-semibold">Inventory History</h2>
              </div>
              <p className="mt-1 text-sm text-gray-500">{product.name}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="px-6 py-5">
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </div>
          )}

          {isLoading ? (
            <p className="text-sm text-gray-500">Loading history...</p>
          ) : movements.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center">
              <p className="text-sm text-gray-500">No inventory movements yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {movements.map((movement) => (
                <div
                  key={movement.id}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {formatMovementType(movement.type)}
                      </p>
                      <p className="text-xs text-gray-500">{movement.reason}</p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-sm font-semibold ${
                          movement.quantityChange > 0
                            ? "text-green-600"
                            : movement.quantityChange < 0
                              ? "text-red-600"
                              : "text-blue-600"
                        }`}
                      >
                        {movement.quantityChange > 0 ? "+" : ""}
                        {movement.quantityChange}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(movement.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                    <span>Before: {movement.quantityBefore}</span>
                    <span>After: {movement.quantityAfter}</span>
                  </div>

                  {movement.notes && (
                    <p className="mt-3 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-600">
                      {movement.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductMovementsPanel;
