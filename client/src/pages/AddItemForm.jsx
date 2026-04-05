import React from "react";
import { useForm } from "react-hook-form";
import {
  ArrowLeft,
  UploadCloud,
  Package,
  Tag,
  Hash,
  Layers,
  AlertTriangle,
  ArrowRight,
  DollarSign,
  Box,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  useCreateProduct,
  useProduct,
  useUpdateProduct,
} from "../hooks/useProducts";

const AddItemForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const productId = searchParams.get("productId");
  const isEditMode = Boolean(productId);
  const {
    product,
    isLoading: isProductLoading,
    error: productError,
  } = useProduct(productId);
  const {
    createProduct,
    isLoading: isCreating,
    error: createError,
  } = useCreateProduct();
  const {
    updateProduct,
    isLoading: isUpdating,
    error: updateError,
  } = useUpdateProduct();
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-slate-200 border-t-slate-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-blue-50 px-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-white rounded-2xl shadow-sm mb-3">
            <Package className="w-7 h-7 text-slate-700" />
          </div>
          <h1 className="text-2xl md:text-3xl font-semibold text-slate-800 tracking-tight">
            {isEditMode ? "Update Product" : "Add New Product"}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {isEditMode
              ? "Edit product details and update inventory"
              : "Enter product details to add to inventory"}
          </p>
        </div>

        {/* Back Button */}
        <button
          type="button"
          onClick={() => navigate("/inventory")}
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors mb-4"
        >
          <ArrowLeft size={16} />
          Back to inventory
        </button>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {submitError && (
            <div className="m-6 mb-0 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
              {submitError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="p-6 md:p-8">
            <div className="space-y-5">
              {/* Product Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Product Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Package className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    {...register("name", {
                      required: "Product name is required",
                    })}
                    className={`w-full pl-9 pr-3 py-2.5 bg-slate-50 border rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                      errors.name
                        ? "border-rose-300 focus:ring-rose-500/20 focus:border-rose-500"
                        : "border-slate-200 focus:ring-slate-200 focus:border-slate-300"
                    }`}
                    placeholder="e.g. Wireless Mouse"
                  />
                </div>
                {errors.name && (
                  <p className="text-rose-500 text-xs mt-1.5 flex items-center gap-1">
                    <span className="inline-block w-1 h-1 rounded-full bg-rose-500" />
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Category <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Tag className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    {...register("category", {
                      required: "Category is required",
                    })}
                    className={`w-full pl-9 pr-3 py-2.5 bg-slate-50 border rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                      errors.category
                        ? "border-rose-300 focus:ring-rose-500/20 focus:border-rose-500"
                        : "border-slate-200 focus:ring-slate-200 focus:border-slate-300"
                    }`}
                    placeholder="e.g. Electronics, Grocery, Clothing"
                  />
                </div>
                {errors.category && (
                  <p className="text-rose-500 text-xs mt-1.5 flex items-center gap-1">
                    <span className="inline-block w-1 h-1 rounded-full bg-rose-500" />
                    {errors.category.message}
                  </p>
                )}
              </div>

              {/* SKU with Regenerate */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  SKU
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Hash className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      {...register("sku")}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-300 transition-all"
                      placeholder="Auto-generated or enter manually"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setValue("sku", generateSKU(productName))}
                    className="px-3 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                  >
                    ↻ Generate
                  </button>
                </div>
                <p className="text-xs text-slate-400 mt-1.5">
                  Unique identifier for this product
                </p>
              </div>

              {/* Product Image Upload */}
              {/* <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Product Image
                </label>
                <label
                  className="mt-1 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 p-5 transition-all hover:border-slate-300 hover:bg-slate-50"
                >
                  <UploadCloud className="mb-2 text-slate-400" size={24} />
                  <span className="text-sm text-slate-500">
                    Click to upload image
                  </span>
                  <span className="text-xs text-slate-400 mt-1">
                    PNG, JPG or WEBP (max. 2MB)
                  </span>
                  <input type="file" {...register("image")} className="hidden" />
                </label>
                <p className="text-xs text-slate-400 mt-1.5">
                  Image upload is not connected yet
                </p>
              </div> */}

              {/* Price + Quantity Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Price */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Price <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign className="h-4 w-4 text-slate-400" />
                    </div>
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
                      className={`w-full pl-9 pr-3 py-2.5 bg-slate-50 border rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all appearance-none ${
                        errors.price
                          ? "border-rose-300 focus:ring-rose-500/20 focus:border-rose-500"
                          : "border-slate-200 focus:ring-slate-200 focus:border-slate-300"
                      }`}
                      placeholder="0.00"
                    />
                  </div>
                  {errors.price && (
                    <p className="text-rose-500 text-xs mt-1.5 flex items-center gap-1">
                      <span className="inline-block w-1 h-1 rounded-full bg-rose-500" />
                      {errors.price.message}
                    </p>
                  )}
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Quantity <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Box className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="number"
                      {...register("quantity", {
                        required: "Quantity is required",
                        min: {
                          value: 0,
                          message: "Quantity cannot be negative",
                        },
                      })}
                      className={`w-full pl-9 pr-3 py-2.5 bg-slate-50 border rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all appearance-none ${
                        errors.quantity
                          ? "border-rose-300 focus:ring-rose-500/20 focus:border-rose-500"
                          : "border-slate-200 focus:ring-slate-200 focus:border-slate-300"
                      }`}
                      placeholder="0"
                    />
                  </div>
                  {errors.quantity && (
                    <p className="text-rose-500 text-xs mt-1.5 flex items-center gap-1">
                      <span className="inline-block w-1 h-1 rounded-full bg-rose-500" />
                      {errors.quantity.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Minimum Quantity Alert */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Minimum Quantity Alert{" "}
                  <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <AlertTriangle className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="number"
                    {...register("minimumQuantity", {
                      required: "Minimum quantity is required",
                      min: {
                        value: 0,
                        message: "Minimum quantity cannot be negative",
                      },
                    })}
                    className={`w-full pl-9 pr-3 py-2.5 bg-slate-50 border rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all appearance-none ${
                      errors.minimumQuantity
                        ? "border-rose-300 focus:ring-rose-500/20 focus:border-rose-500"
                        : "border-slate-200 focus:ring-slate-200 focus:border-slate-300"
                    }`}
                    placeholder="Set alert threshold"
                  />
                </div>
                {errors.minimumQuantity && (
                  <p className="text-rose-500 text-xs mt-1.5 flex items-center gap-1">
                    <span className="inline-block w-1 h-1 rounded-full bg-rose-500" />
                    {errors.minimumQuantity.message}
                  </p>
                )}
                <p className="text-xs text-slate-400 mt-1.5">
                  You'll receive an alert when quantity drops below the minimum
                  threshold
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-8 pt-5 border-t border-slate-100">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-4 py-2.5 text-sm font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {isEditMode ? "Updating..." : "Adding..."}
                  </>
                ) : (
                  <>
                    {isEditMode ? "Update Product" : "Add Product"}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddItemForm;
