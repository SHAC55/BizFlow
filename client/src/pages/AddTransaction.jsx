import React, { useEffect, useMemo, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import {
  ArrowLeft,
  Calculator,
  DollarSign,
  Loader2,
  Package,
  Plus,
  ShoppingCart,
  Trash2,
  User,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCustomers } from "../hooks/useCustomers";
import { useProducts } from "../hooks/useProducts";
import { useCreateSale } from "../hooks/useSales";

const formatCurrency = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;

const AddTransaction = () => {
  const navigate = useNavigate();
  const [customerSearch, setCustomerSearch] = useState("");
  const [isTotalEdited, setIsTotalEdited] = useState(false);
  const [finalAmountInput, setFinalAmountInput] = useState("0");
  const { createSale, isLoading: isCreatingSale } = useCreateSale();
  const { products = [], isLoading: productsLoading } = useProducts({
    page: 1,
    limit: 100,
  });
  const { customers = [], isLoading: customersLoading } = useCustomers({
    search: customerSearch,
    page: 1,
    limit: 100,
  });

  const {
    control,
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      customerId: "",
      items: [
        {
          productId: "",
          quantity: 1,
          unitPrice: 0,
        },
      ],
      totalAmount: 0,
      paidAmount: 0,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const totalAmountField = register("totalAmount", {
    required: "Final amount is required",
    valueAsNumber: true,
    min: {
      value: 0.01,
      message: "Final amount must be greater than 0",
    },
    validate: (value) =>
      value <= subtotalAmount || "Final amount cannot exceed subtotal",
  });

  const watchedItems = watch("items");
  const totalAmount = Number(watch("totalAmount") || 0);
  const paidAmount = Number(watch("paidAmount") || 0);
  const selectedCustomerId = watch("customerId");

  const subtotalAmount = useMemo(
    () =>
      watchedItems.reduce((sum, item) => {
        const quantity = Number(item.quantity) || 0;
        const unitPrice = Number(item.unitPrice) || 0;
        return sum + quantity * unitPrice;
      }, 0),
    [watchedItems],
  );

  useEffect(() => {
    if (!isTotalEdited) {
      setFinalAmountInput(subtotalAmount ? String(subtotalAmount) : "0");
      setValue("totalAmount", subtotalAmount, {
        shouldDirty: false,
        shouldValidate: true,
      });
    }
  }, [isTotalEdited, setValue, subtotalAmount]);

  const selectedCustomer = customers.find(
    (customer) => customer.id === selectedCustomerId,
  );
  const dueAmount = Math.max(totalAmount - paidAmount, 0);
  const saleStatus =
    dueAmount <= 0 ? "paid" : paidAmount > 0 ? "partial" : "pending";

  const handleProductChange = (index, productId) => {
    const product = products.find((item) => item.id === productId);
    setValue(`items.${index}.productId`, productId, { shouldValidate: true });
    setValue(`items.${index}.unitPrice`, product?.price ?? 0, {
      shouldValidate: true,
    });
  };

  const onSubmit = async (formData) => {
    const payload = {
      customerId: formData.customerId,
      items: formData.items.map((item) => ({
        productId: item.productId,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
      })),
      totalAmount: Number(formData.totalAmount),
      paidAmount: Number(formData.paidAmount || 0),
    };

    const response = await createSale(payload);

    reset({
      customerId: "",
      items: [
        {
          productId: "",
          quantity: 1,
          unitPrice: 0,
        },
      ],
      totalAmount: 0,
      paidAmount: 0,
    });
    setCustomerSearch("");
    setIsTotalEdited(false);
    setFinalAmountInput("0");
    navigate(`/sales/${response.sale.id}`);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-indigo-50/30 to-purple-50/20 px-4 py-8">
      <div className="mx-auto w-full max-w-5xl">
        <button
          onClick={() => navigate("/sales")}
          className="mb-6 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to sales
        </button>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_360px]">
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xl md:p-8">
            <div className="mb-8 flex items-start gap-4">
              <div className="rounded-2xl bg-blue-100 p-3 text-blue-700">
                <ShoppingCart className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-800">
                  Record Sale
                </h1>
                <p className="mt-2 text-sm text-slate-500">
                  Select a customer, add products, and record any discount or
                  upfront payment.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              <input type="hidden" {...totalAmountField} />
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <User className="h-4 w-4 text-blue-600" />
                  Customer
                </div>

                <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-slate-400">
                      Search Customer
                    </label>
                    <input
                      type="text"
                      value={customerSearch}
                      onChange={(event) => setCustomerSearch(event.target.value)}
                      placeholder="Search by name or mobile"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition-colors focus:border-blue-400 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-slate-400">
                      Select Customer
                    </label>
                    <select
                      {...register("customerId", {
                        required: "Please select a customer",
                      })}
                      disabled={customersLoading}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition-colors focus:border-blue-400 disabled:cursor-not-allowed disabled:bg-slate-100"
                    >
                      <option value="">
                        {customersLoading
                          ? "Loading customers..."
                          : "Choose a customer"}
                      </option>
                      {customers.map((customer) => (
                        <option key={customer.id} value={customer.id}>
                          {customer.name} · {customer.mobile}
                        </option>
                      ))}
                    </select>
                    {errors.customerId && (
                      <p className="mt-2 text-xs text-rose-500">
                        {errors.customerId.message}
                      </p>
                    )}
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <Package className="h-4 w-4 text-blue-600" />
                    Products
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      append({
                        productId: "",
                        quantity: 1,
                        unitPrice: 0,
                      })
                    }
                    className="inline-flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100"
                  >
                    <Plus className="h-4 w-4" />
                    Add product
                  </button>
                </div>

                <div className="space-y-4">
                  {fields.map((field, index) => {
                    const selectedProduct = products.find(
                      (product) => product.id === watchedItems[index]?.productId,
                    );
                    const availableQuantity = selectedProduct?.quantity ?? 0;

                    return (
                      <div
                        key={field.id}
                        className="rounded-3xl border border-slate-100 bg-slate-50 p-4"
                      >
                        <div className="mb-4 flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold text-slate-700">
                            Line item {index + 1}
                          </p>
                          {fields.length > 1 && (
                            <button
                              type="button"
                              onClick={() => remove(index)}
                              className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-rose-500 transition-colors hover:bg-rose-50"
                            >
                              <Trash2 className="h-4 w-4" />
                              Remove
                            </button>
                          )}
                        </div>

                        <div className="grid gap-4 md:grid-cols-[minmax(0,1.5fr)_120px_150px]">
                          <div>
                            <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-slate-400">
                              Product
                            </label>
                            <select
                              {...register(`items.${index}.productId`, {
                                required: "Choose a product",
                              })}
                              onChange={(event) =>
                                handleProductChange(index, event.target.value)
                              }
                              disabled={productsLoading}
                              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition-colors focus:border-blue-400 disabled:cursor-not-allowed disabled:bg-slate-100"
                            >
                              <option value="">
                                {productsLoading
                                  ? "Loading products..."
                                  : "Choose a product"}
                              </option>
                              {products.map((product) => (
                                <option key={product.id} value={product.id}>
                                  {product.name} · {formatCurrency(product.price)}
                                </option>
                              ))}
                            </select>
                            {errors.items?.[index]?.productId && (
                              <p className="mt-2 text-xs text-rose-500">
                                {errors.items[index].productId.message}
                              </p>
                            )}
                            {selectedProduct && (
                              <p className="mt-2 text-xs text-slate-500">
                                Stock available: {availableQuantity}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-slate-400">
                              Quantity
                            </label>
                            <input
                              type="number"
                              min="1"
                              {...register(`items.${index}.quantity`, {
                                required: "Quantity is required",
                                valueAsNumber: true,
                                min: {
                                  value: 1,
                                  message: "Quantity must be at least 1",
                                },
                                validate: (value) =>
                                  !selectedProduct ||
                                  value <= selectedProduct.quantity ||
                                  "Quantity exceeds available stock",
                              })}
                              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition-colors focus:border-blue-400"
                            />
                            {errors.items?.[index]?.quantity && (
                              <p className="mt-2 text-xs text-rose-500">
                                {errors.items[index].quantity.message}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-slate-400">
                              Unit Price
                            </label>
                            <input
                              type="number"
                              min="0.01"
                              step="0.01"
                              {...register(`items.${index}.unitPrice`, {
                                required: "Unit price is required",
                                valueAsNumber: true,
                                min: {
                                  value: 0.01,
                                  message: "Unit price must be greater than 0",
                                },
                              })}
                              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition-colors focus:border-blue-400"
                            />
                            {errors.items?.[index]?.unitPrice && (
                              <p className="mt-2 text-xs text-rose-500">
                                {errors.items[index].unitPrice.message}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-slate-400">
                    Final Amount
                  </label>
                  <div className="relative">
                    <DollarSign className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={finalAmountInput}
                      onChange={(event) => {
                        const nextValue = event.target.value;
                        setIsTotalEdited(true);
                        setFinalAmountInput(nextValue);
                        setValue(
                          "totalAmount",
                          nextValue === "" ? 0 : Number(nextValue),
                          {
                            shouldDirty: true,
                            shouldValidate: true,
                          },
                        );
                      }}
                      className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-700 outline-none transition-colors focus:border-blue-400"
                    />
                  </div>
                  {errors.totalAmount && (
                    <p className="mt-2 text-xs text-rose-500">
                      {errors.totalAmount.message}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-slate-500">
                    Edit this if you want to apply a discount.
                  </p>
                  {isTotalEdited && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsTotalEdited(false);
                        setFinalAmountInput(String(subtotalAmount));
                        setValue("totalAmount", subtotalAmount, {
                          shouldDirty: true,
                          shouldValidate: true,
                        });
                      }}
                      className="mt-2 text-xs font-medium text-blue-600 transition-colors hover:text-blue-700"
                    >
                      Reset to original price
                    </button>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-slate-400">
                    Paid Now
                  </label>
                  <div className="relative">
                    <DollarSign className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      {...register("paidAmount", {
                        valueAsNumber: true,
                        min: {
                          value: 0,
                          message: "Paid amount cannot be negative",
                        },
                        validate: (value) =>
                          value <= totalAmount ||
                          "Paid amount cannot exceed final amount",
                      })}
                      className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-700 outline-none transition-colors focus:border-blue-400"
                    />
                  </div>
                  {errors.paidAmount && (
                    <p className="mt-2 text-xs text-rose-500">
                      {errors.paidAmount.message}
                    </p>
                  )}
                </div>
              </section>

              <button
                type="submit"
                disabled={isSubmitting || isCreatingSale}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {(isSubmitting || isCreatingSale) && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                Save sale
              </button>
            </form>
          </div>

          <aside className="space-y-4">
            <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xl">
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Calculator className="h-4 w-4 text-blue-600" />
                Sale Summary
              </div>

              <div className="space-y-3">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-widest text-slate-400">
                    Customer
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-700">
                    {selectedCustomer?.name || "No customer selected"}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {selectedCustomer?.mobile || "Select from your customers"}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-widest text-slate-400">
                    Subtotal
                  </p>
                  <p className="mt-2 text-2xl font-bold text-slate-800">
                    {formatCurrency(subtotalAmount)}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                  <div className="rounded-2xl bg-emerald-50 p-4 text-emerald-700">
                    <p className="text-xs uppercase tracking-widest opacity-70">
                      Final Amount
                    </p>
                    <p className="mt-2 text-xl font-bold">
                      {formatCurrency(totalAmount)}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-amber-50 p-4 text-amber-700">
                    <p className="text-xs uppercase tracking-widest opacity-70">
                      Discount
                    </p>
                    <p className="mt-2 text-xl font-bold">
                      {formatCurrency(Math.max(subtotalAmount - totalAmount, 0))}
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                  <div className="rounded-2xl bg-blue-50 p-4 text-blue-700">
                    <p className="text-xs uppercase tracking-widest opacity-70">
                      Paid Now
                    </p>
                    <p className="mt-2 text-xl font-bold">
                      {formatCurrency(paidAmount)}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-rose-50 p-4 text-rose-700">
                    <p className="text-xs uppercase tracking-widest opacity-70">
                      Due
                    </p>
                    <p className="mt-2 text-xl font-bold">
                      {formatCurrency(dueAmount)}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-white p-4">
                  <p className="text-xs uppercase tracking-widest text-slate-400">
                    Status
                  </p>
                  <p className="mt-2 text-sm font-semibold capitalize text-slate-700">
                    {saleStatus}
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default AddTransaction;
