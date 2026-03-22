import React from "react";
import { useForm } from "react-hook-form";
import { UploadCloud } from "lucide-react";

const AddItemForm = () => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm();

  // Watch product name
  const productName = watch("name");

  // SKU generator
  const generateSKU = (name) => {
    if (!name) return "";

    const prefix = name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase();

    const random = Math.floor(100 + Math.random() * 900);

    return `${prefix}-${random}`;
  };

  // Auto-generate SKU when name changes
  React.useEffect(() => {
    if (productName) {
      setValue("sku", generateSKU(productName));
    }
  }, [productName, setValue]);

  // Submit
  const onSubmit = (data) => {
    const finalData = {
      ...data,
      sku: data.sku ? data.sku : generateSKU(data.name),
    };

    console.log(finalData);
    reset();
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-blue-50 px-4">
      <div className="w-full max-w-lg bg-white/80 backdrop-blur-md p-6 sm:p-8 rounded-2xl shadow-md border border-blue-100">
        
        <h2 className="text-2xl font-semibold text-blue-900 mb-6">
          Add New Product
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

          {/* Product Name */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Product Name
            </label>
            <input
              {...register("name", {
                required: "Product name is required",
              })}
              className="w-full mt-1 px-4 py-2 border border-blue-100 rounded-xl 
                         focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="e.g. Wireless Mouse"
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* SKU */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              SKU (optional)
            </label>

            <div className="flex gap-2">
              <input
                {...register("sku")}
                className="w-full mt-1 px-4 py-2 border border-blue-100 rounded-xl 
                           focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Auto-generated or enter manually"
              />

              {/* Regenerate Button */}
              <button
                type="button"
                onClick={() =>
                  setValue("sku", generateSKU(productName))
                }
                className="mt-1 px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200"
              >
                ↻
              </button>
            </div>
          </div>

          {/* Product Image */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Product Image (optional)
            </label>

            <label className="mt-2 flex flex-col items-center justify-center 
                              border-2 border-dashed border-blue-200 
                              rounded-xl p-4 cursor-pointer 
                              hover:bg-blue-50 transition">
              <UploadCloud className="text-blue-500 mb-2" size={24} />
              <span className="text-sm text-gray-500">
                Click to upload image
              </span>
              <input type="file" {...register("image")} className="hidden" />
            </label>
          </div>

          {/* Price + Quantity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Price */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Price
              </label>
              <input
                type="number"
                step="0.01"
                {...register("price", {
                  required: "Price is required",
                  min: {
                    value: 1,
                    message: "Price must be greater than 0",
                  },
                })}
                className="w-full mt-1 px-4 py-2 border border-blue-100 rounded-xl 
                           focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                placeholder="₹0.00"
              />
              {errors.price && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.price.message}
                </p>
              )}
            </div>

            {/* Quantity */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Quantity
              </label>
              <input
                type="number"
                {...register("quantity", {
                  required: "Quantity is required",
                  min: {
                    value: 1,
                    message: "Quantity must be greater than 0",
                  },
                })}
                className="w-full mt-1 px-4 py-2 border border-blue-100 rounded-xl 
                           focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                placeholder="0"
              />
              {errors.quantity && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.quantity.message}
                </p>
              )}
            </div>
          </div>

          {/* Minimum Quantity Alert */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Minimum Quantity Alert
            </label>
            <input
              type="number"
              {...register("minQuantity", {
                required: "Minimum quantity is required",
                min: {
                  value: 1,
                  message: "Minimum quantity must be greater than 0",
                },
              })}
              className="w-full mt-1 px-4 py-2 border border-blue-100 rounded-xl 
                         focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
              placeholder="Set alert threshold"
            />
            {errors.minQuantity && (
              <p className="text-red-500 text-xs mt-1">
                {errors.minQuantity.message}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-2.5 rounded-xl text-white font-medium 
                       bg-gradient-to-r from-blue-600 to-blue-400 
                       hover:from-blue-700 hover:to-blue-500 
                       transition-all duration-200 shadow-sm"
          >
            Add Product
          </button>

          <p className="text-xs text-gray-600 text-center">
            You'll receive an alert when quantity drops below the minimum threshold.
          </p>

        </form>
      </div>
    </div>
  );
};

export default AddItemForm;