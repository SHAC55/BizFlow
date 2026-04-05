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
  const { customer, isLoading: isCustomerLoading, error: customerError } =
    useCustomer(customerId);
  const { createCustomer, isLoading: isCreating, error: createError } =
    useCreateCustomer();
  const { updateCustomer, isLoading: isUpdating, error: updateError } =
    useUpdateCustomer();
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
      <div className="flex min-h-screen items-center justify-center bg-blue-50">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-slate-600" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-screen items-center justify-center bg-blue-50 px-4">
      <div className="w-full max-w-2xl">
        <div className="mb-4">
          <button
            type="button"
            onClick={() =>
              navigate(isEditMode ? `/customers/${customerId}` : "/customers")
            }
            className="inline-flex items-center gap-2 text-sm text-slate-500 transition-colors hover:text-slate-700"
          >
            <ArrowLeft className="h-4 w-4" />
            {isEditMode ? "Back to customer" : "Back to customers"}
          </button>
        </div>

        <div className="mb-6 text-center">
          <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
            <User className="h-7 w-7 text-slate-700" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-800 md:text-3xl">
            {isEditMode ? "Edit Customer" : "Add New Customer"}
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            {isEditMode
              ? "Update customer details and keep records current"
              : "Enter customer details to create a real customer profile"}
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          {submitError && (
            <div className="m-6 mb-0 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
              {submitError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="p-6 md:p-8">
            <div className="space-y-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <User className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    {...register("name", { required: "Name is required" })}
                    className={`w-full rounded-lg border bg-slate-50 py-2.5 pl-9 pr-3 text-sm text-slate-800 transition-all placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                      errors.name
                        ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500/20"
                        : "border-slate-200 focus:border-slate-300 focus:ring-slate-200"
                    }`}
                    placeholder="John Doe"
                  />
                </div>
                {errors.name && (
                  <p className="mt-1.5 flex items-center gap-1 text-xs text-rose-500">
                    <span className="inline-block h-1 w-1 rounded-full bg-rose-500" />
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Contact Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Phone className="h-4 w-4 text-slate-400" />
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
                    className={`w-full rounded-lg border bg-slate-50 py-2.5 pl-9 pr-3 text-sm text-slate-800 transition-all placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                      errors.mobile
                        ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500/20"
                        : "border-slate-200 focus:border-slate-300 focus:ring-slate-200"
                    }`}
                    placeholder="9876543210"
                  />
                </div>
                {errors.mobile && (
                  <p className="mt-1.5 flex items-center gap-1 text-xs text-rose-500">
                    <span className="inline-block h-1 w-1 rounded-full bg-rose-500" />
                    {errors.mobile.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Email Address
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Mail className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    {...register("email", {
                      pattern: {
                        value: /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/,
                        message: "Enter a valid email address",
                      },
                    })}
                    className={`w-full rounded-lg border bg-slate-50 py-2.5 pl-9 pr-3 text-sm text-slate-800 transition-all placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                      errors.email
                        ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500/20"
                        : "border-slate-200 focus:border-slate-300 focus:ring-slate-200"
                    }`}
                    placeholder="customer@example.com"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1.5 flex items-center gap-1 text-xs text-rose-500">
                    <span className="inline-block h-1 w-1 rounded-full bg-rose-500" />
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Opening Balance
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <CreditCard className="h-4 w-4 text-slate-400" />
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
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm text-slate-800 transition-all placeholder:text-slate-400 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200"
                      placeholder="0"
                    />
                  </div>
                  {errors.openingBalance && (
                    <p className="mt-1.5 flex items-center gap-1 text-xs text-rose-500">
                      <span className="inline-block h-1 w-1 rounded-full bg-rose-500" />
                      {errors.openingBalance.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Address
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <MapPin className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      {...register("address")}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm text-slate-800 transition-all placeholder:text-slate-400 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200"
                      placeholder="Street, area, city"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Notes
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute left-0 top-0 pl-3 pt-3">
                    <FileText className="h-4 w-4 text-slate-400" />
                  </div>
                  <textarea
                    rows="4"
                    {...register("notes")}
                    className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm text-slate-800 transition-all placeholder:text-slate-400 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200"
                    placeholder="Delivery preference, follow-up details, or billing notes"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row">
              <button
                type="button"
                onClick={() => reset()}
                className="flex-1 rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-200"
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    {isEditMode ? "Updating..." : "Adding..."}
                  </>
                ) : (
                  <>
                    {isEditMode ? "Update Customer" : "Add Customer"}
                    <ArrowRight className="h-4 w-4" />
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
