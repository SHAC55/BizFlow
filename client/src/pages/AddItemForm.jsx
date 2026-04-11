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
      costPrice: product.costPrice,
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
      costPrice: Number(data.costPrice),
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-white flex items-center justify-center px-4 py-8 md:ml-20">
      <div className="w-full max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-2xl mb-4 shadow-sm">
            <Package className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-black tracking-tight">
            {isEditMode ? "Update Product" : "Add New Product"}
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            {isEditMode
              ? "Edit product details and update inventory"
              : "Enter product details to add to inventory"}
          </p>
        </div>

        {/* Back Button */}
        <button
          type="button"
          onClick={() => navigate("/inventory")}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-black transition-colors mb-6 group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to inventory
        </button>

        {/* Form Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {submitError && (
            <div className="m-6 mb-0 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {submitError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="p-6 md:p-8">
            <div className="space-y-6">
              {/* Product Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Package className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    {...register("name", {
                      required: "Product name is required",
                    })}
                    className={`w-full pl-9 pr-3 py-2.5 bg-white border rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-all ${
                      errors.name
                        ? "border-red-400 focus:ring-red-200 focus:border-red-500"
                        : "border-gray-300 focus:ring-gray-200 focus:border-gray-500"
                    }`}
                    placeholder="e.g. Wireless Mouse"
                  />
                </div>
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                    <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Tag className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    {...register("category", {
                      required: "Category is required",
                    })}
                    className={`w-full pl-9 pr-3 py-2.5 bg-white border rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-all ${
                      errors.category
                        ? "border-red-400 focus:ring-red-200 focus:border-red-500"
                        : "border-gray-300 focus:ring-gray-200 focus:border-gray-500"
                    }`}
                    placeholder="e.g. Electronics, Grocery, Clothing"
                  />
                </div>
                {errors.category && (
                  <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                    <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
                    {errors.category.message}
                  </p>
                )}
              </div>

              {/* SKU with Regenerate */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  SKU
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Hash className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      {...register("sku")}
                      className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-500 transition-all"
                      placeholder="Auto-generated or enter manually"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setValue("sku", generateSKU(productName))}
                    className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors border border-gray-300"
                  >
                    ↻ Generate
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1.5">
                  Unique identifier for this product
                </p>
              </div>

              {/* Price and Quantity Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {/* Cost Price */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Cost Price <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      {...register("costPrice", {
                        required: "Cost price is required",
                        min: {
                          value: 0,
                          message: "Cost price cannot be negative",
                        },
                      })}
                      className={`w-full pl-9 pr-3 py-2.5 bg-white border rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-all appearance-none ${
                        errors.costPrice
                          ? "border-red-400 focus:ring-red-200 focus:border-red-500"
                          : "border-gray-300 focus:ring-gray-200 focus:border-gray-500"
                      }`}
                      placeholder="0.00"
                    />
                  </div>
                  {errors.costPrice && (
                    <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                      <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
                      {errors.costPrice.message}
                    </p>
                  )}
                </div>

                {/* Selling Price */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Selling Price <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign className="h-4 w-4 text-gray-400" />
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
                      className={`w-full pl-9 pr-3 py-2.5 bg-white border rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-all appearance-none ${
                        errors.price
                          ? "border-red-400 focus:ring-red-200 focus:border-red-500"
                          : "border-gray-300 focus:ring-gray-200 focus:border-gray-500"
                      }`}
                      placeholder="0.00"
                    />
                  </div>
                  {errors.price && (
                    <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                      <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
                      {errors.price.message}
                    </p>
                  )}
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Quantity <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Box className="h-4 w-4 text-gray-400" />
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
                      className={`w-full pl-9 pr-3 py-2.5 bg-white border rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-all appearance-none ${
                        errors.quantity
                          ? "border-red-400 focus:ring-red-200 focus:border-red-500"
                          : "border-gray-300 focus:ring-gray-200 focus:border-gray-500"
                      }`}
                      placeholder="0"
                    />
                  </div>
                  {errors.quantity && (
                    <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                      <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
                      {errors.quantity.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Minimum Quantity Alert */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Minimum Quantity Alert <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <AlertTriangle className="h-4 w-4 text-gray-400" />
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
                    className={`w-full pl-9 pr-3 py-2.5 bg-white border rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-all appearance-none ${
                      errors.minimumQuantity
                        ? "border-red-400 focus:ring-red-200 focus:border-red-500"
                        : "border-gray-300 focus:ring-gray-200 focus:border-gray-500"
                    }`}
                    placeholder="Set alert threshold"
                  />
                </div>
                {errors.minimumQuantity && (
                  <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                    <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
                    {errors.minimumQuantity.message}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-1.5">
                  You'll receive an alert when quantity drops below the minimum threshold
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-4 py-3 text-sm font-semibold text-white bg-black rounded-xl hover:bg-gray-900 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {isEditMode ? "Updating..." : "Adding..."}
                  </>
                ) : (
                  <>
                    {isEditMode ? "Update Product" : "Add Product"}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
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