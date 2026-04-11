import React from "react";
import { useForm } from "react-hook-form";
import {
  ArrowLeft,
  ArrowRight,
  CreditCard,
  FileText,
  Mail,
  MapPin,
  Phone,
  User,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  useCreateCustomer,
  useCustomer,
  useUpdateCustomer,
} from "../hooks/useCustomers";

const AddCustomer = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const customerId = searchParams.get("customerId");
  const isEditMode = Boolean(customerId);
  const {
    customer,
    isLoading: isCustomerLoading,
    error: customerError,
  } = useCustomer(customerId);
  const {
    createCustomer,
    isLoading: isCreating,
    error: createError,
  } = useCreateCustomer();
  const {
    updateCustomer,
    isLoading: isUpdating,
    error: updateError,
  } = useUpdateCustomer();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      name: "",
      mobile: "",
      email: "",
      openingBalance: 0,
      address: "",
      notes: "",
    },
  });

  React.useEffect(() => {
    if (!customer) {
      return;
    }

    reset({
      name: customer.name,
      mobile: customer.mobile,
      email: customer.email || "",
      openingBalance: customer.openingBalance,
      address: customer.address || "",
      notes: customer.notes || "",
    });
  }, [customer, reset]);

  const onSubmit = async (data) => {
    const payload = {
      name: data.name,
      mobile: data.mobile,
      email: data.email,
      openingBalance: Number(data.openingBalance || 0),
      address: data.address,
      notes: data.notes,
    };

    if (isEditMode) {
      await updateCustomer(customerId, payload);
      navigate(`/customers/${customerId}`);
      return;
    }

    await createCustomer(payload);
    reset();
    navigate("/customers");
  };

  const submitError = createError || updateError || customerError;
  const isSubmitting = isCreating || isUpdating;

  if (isEditMode && isCustomerLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-gray-200 border-t-gray-900" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-white px-4 py-8 md:ml-20">
      <div className="w-full max-w-3xl mx-auto">
        <div className="mb-6">
          <button
            type="button"
            onClick={() =>
              navigate(isEditMode ? `/customers/${customerId}` : "/customers")
            }
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-black transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
            {isEditMode ? "Back to customer" : "Back to customers"}
          </button>
        </div>

        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-black shadow-sm">
            <User className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-black md:text-4xl">
            {isEditMode ? "Edit Customer" : "Add New Customer"}
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            {isEditMode
              ? "Update customer details and keep records current"
              : "Enter customer details to create a real customer profile"}
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          {submitError && (
            <div className="m-6 mb-0 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {submitError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="p-6 md:p-8">
            <div className="space-y-6">
              {/* Full Name */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-900">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <User className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    {...register("name", { required: "Name is required" })}
                    className={`w-full rounded-lg border bg-white py-2.5 pl-9 pr-3 text-sm text-gray-900 transition-all placeholder:text-gray-400 focus:outline-none focus:ring-2 ${
                      errors.name
                        ? "border-red-400 focus:border-red-500 focus:ring-red-200"
                        : "border-gray-300 focus:border-gray-500 focus:ring-gray-200"
                    }`}
                    placeholder="John Doe"
                  />
                </div>
                {errors.name && (
                  <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500">
                    <span className="inline-block h-1 w-1 rounded-full bg-red-500" />
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Contact Number */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-900">
                  Contact Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Phone className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    {...register("mobile", {
                      required: "Contact number is required",
                      pattern: {
                        value: /^[0-9]{10}$/,
                        message: "Enter a valid 10-digit number",
                      },
                    })}
                    className={`w-full rounded-lg border bg-white py-2.5 pl-9 pr-3 text-sm text-gray-900 transition-all placeholder:text-gray-400 focus:outline-none focus:ring-2 ${
                      errors.mobile
                        ? "border-red-400 focus:border-red-500 focus:ring-red-200"
                        : "border-gray-300 focus:border-gray-500 focus:ring-gray-200"
                    }`}
                    placeholder="9876543210"
                  />
                </div>
                {errors.mobile && (
                  <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500">
                    <span className="inline-block h-1 w-1 rounded-full bg-red-500" />
                    {errors.mobile.message}
                  </p>
                )}
              </div>

              {/* Email Address */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-900">
                  Email Address
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Mail className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    {...register("email", {
                      pattern: {
                        value: /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/,
                        message: "Enter a valid email address",
                      },
                    })}
                    className={`w-full rounded-lg border bg-white py-2.5 pl-9 pr-3 text-sm text-gray-900 transition-all placeholder:text-gray-400 focus:outline-none focus:ring-2 ${
                      errors.email
                        ? "border-red-400 focus:border-red-500 focus:ring-red-200"
                        : "border-gray-300 focus:border-gray-500 focus:ring-gray-200"
                    }`}
                    placeholder="customer@example.com"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500">
                    <span className="inline-block h-1 w-1 rounded-full bg-red-500" />
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Opening Balance and Address Grid */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-900">
                    Opening Balance
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <CreditCard className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      {...register("openingBalance", {
                        min: {
                          value: 0,
                          message: "Opening balance cannot be negative",
                        },
                      })}
                      className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-9 pr-3 text-sm text-gray-900 transition-all placeholder:text-gray-400 focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-200"
                      placeholder="0"
                    />
                  </div>
                  {errors.openingBalance && (
                    <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500">
                      <span className="inline-block h-1 w-1 rounded-full bg-red-500" />
                      {errors.openingBalance.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-900">
                    Address
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <MapPin className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      {...register("address")}
                      className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-9 pr-3 text-sm text-gray-900 transition-all placeholder:text-gray-400 focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-200"
                      placeholder="Street, area, city"
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-900">
                  Notes
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute left-0 top-0 pl-3 pt-3">
                    <FileText className="h-4 w-4 text-gray-400" />
                  </div>
                  <textarea
                    rows="4"
                    {...register("notes")}
                    className="w-full resize-none rounded-lg border border-gray-300 bg-white py-2.5 pl-9 pr-3 text-sm text-gray-900 transition-all placeholder:text-gray-400 focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-200"
                    placeholder="Delivery preference, follow-up details, or billing notes"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col gap-3 border-t border-gray-200 pt-6 sm:flex-row">
              <button
                type="button"
                onClick={() => reset()}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 hover:border-gray-400"
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-70 group"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    {isEditMode ? "Updating..." : "Adding..."}
                  </>
                ) : (
                  <>
                    {isEditMode ? "Update Customer" : "Add Customer"}
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
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

export default AddCustomer;