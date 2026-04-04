import React from "react";
import { useForm } from "react-hook-form";
import { ArrowLeft, UploadCloud } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCreateProduct, useProduct, useUpdateProduct } from "../hooks/useProducts";

const AddItemForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const productId = searchParams.get("productId");
  const isEditMode = Boolean(productId);
  const { product, isLoading: isProductLoading, error: productError } =
    useProduct(productId);
  const { createProduct, isLoading: isCreating, error: createError } =
    useCreateProduct();
  const { updateProduct, isLoading: isUpdating, error: updateError } =
    useUpdateProduct();
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
    if (!productName) {
      return;
    }

    if (isEditMode) {
      return;
    }

    if (productName) {
      setValue("sku", generateSKU(productName));
    }
  }, [isEditMode, productName, setValue]);

  React.useEffect(() => {
    if (!product) {
      return;
    }

    reset({
      name: product.name,
      category: product.category,
      sku: product.sku || "",
      price: product.price,
      quantity: product.quantity,
      minimumQuantity: product.minimumQuantity,
    });
  }, [product, reset]);

  // Submit
  const onSubmit = async (data) => {
    const payload = {
      ...data,
      sku: data.sku ? data.sku : generateSKU(data.name),
      price: Number(data.price),
      quantity: Number(data.quantity),
      minimumQuantity: Number(data.minimumQuantity),
    };

    if (isEditMode) {
      await updateProduct(productId, payload);
    } else {
      await createProduct(payload);
      reset();
    }

    navigate("/inventory");
  };

  const submitError = createError || updateError || productError;
  const isSubmitting = isCreating || isUpdating;

  if (isEditMode && isProductLoading) {
    return (
      <div className="min-h-screen w-screen flex items-center justify-center bg-blue-50 px-4">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-blue-50 px-4">
      <div className="w-full max-w-lg bg-white/80 backdrop-blur-md p-6 sm:p-8 rounded-2xl shadow-md border border-blue-100">
        <button
          type="button"
          onClick={() => navigate("/inventory")}
          className="mb-5 inline-flex items-center gap-2 text-sm text-blue-700 hover:text-blue-800"
        >
          <ArrowLeft size={16} />
          Back to inventory
        </button>

        <h2 className="text-2xl font-semibold text-blue-900 mb-6">
          {isEditMode ? "Update Product" : "Add New Product"}
        </h2>

        {submitError && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {submitError}
          </div>
        )}

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

          <div>
            <label className="text-sm font-medium text-gray-700">
              Category
            </label>
            <input
              {...register("category", {
                required: "Category is required",
              })}
              className="w-full mt-1 px-4 py-2 border border-blue-100 rounded-xl 
                         focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="e.g. Grocery"
            />
            {errors.category && (
              <p className="text-red-500 text-xs mt-1">
                {errors.category.message}
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

          <div>
            <label className="text-sm font-medium text-gray-700">
              Product Image (optional)
            </label>

            <label
              className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-blue-200 p-4 transition hover:bg-blue-50"
            >
              <UploadCloud className="mb-2 text-blue-500" size={24} />
              <span className="text-sm text-gray-500">
                Keep for later. Image upload is not connected yet.
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
                  value: 0,
                  message: "Quantity cannot be negative",
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
              {...register("minimumQuantity", {
                required: "Minimum quantity is required",
                min: {
                  value: 0,
                  message: "Minimum quantity cannot be negative",
                },
              })}
              className="w-full mt-1 px-4 py-2 border border-blue-100 rounded-xl 
                         focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
              placeholder="Set alert threshold"
            />
            {errors.minimumQuantity && (
              <p className="text-red-500 text-xs mt-1">
                {errors.minimumQuantity.message}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 rounded-xl text-white font-medium 
                       bg-gradient-to-r from-blue-600 to-blue-400 
                       hover:from-blue-700 hover:to-blue-500 
                       transition-all duration-200 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting
              ? isEditMode
                ? "Updating..."
                : "Adding..."
              : isEditMode
                ? "Update Product"
                : "Add Product"}
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
