import React, { useEffect, useMemo, useState } from "react";
import { useFieldArray, useForm, Controller } from "react-hook-form";
import {
  ArrowLeft,
  Calculator,
  Check,
  DollarSign,
  Loader2,
  Package,
  Phone,
  Plus,
  ShoppingCart,
  Trash2,
  User,
  UserPlus,
  Search,
  Wrench,
  X,
  Tag,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCustomers, useCreateCustomer } from "../hooks/useCustomers";
import { useProducts } from "../hooks/useProducts";
import { useServices } from "../hooks/useServices";
import { useCreateSale } from "../hooks/useSales";

const formatCurrency = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;

const round2 = (n) => Math.round(Number(n) * 100) / 100;

const AddTransaction = () => {
  const navigate = useNavigate();
  const [customerSearch, setCustomerSearch] = useState("");
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerMobile, setNewCustomerMobile] = useState("");

  const { createSale, isLoading: isCreatingSale } = useCreateSale();
  const { createCustomer, isLoading: isCreatingCustomer } = useCreateCustomer();
  const { products = [], isLoading: productsLoading } = useProducts({
    page: 1,
    limit: 100,
  });
  const { services = [], isLoading: servicesLoading } = useServices({
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
          itemType: "product",
          productId: "",
          serviceId: "",
          quantity: 1,
          unitPrice: 0,
        },
      ],
      discountAmount: 0,
      gstRate: 18,
      paidAmount: 0,
      reminderDate: "",
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  // ── Watch all fields — single source of truth ─────────────────────────────
  const watchedItems = watch("items") || [];
  const discountNum = Number(watch("discountAmount")) || 0;
  const gstRateNum = Number(watch("gstRate")) || 0;
  const paidNum = Number(watch("paidAmount")) || 0;
  const reminderDate = watch("reminderDate");
  const selectedCustomerId = watch("customerId");

  // ── Derived amounts ───────────────────────────────────────────────────────
  // FIX: JSON.stringify forces useMemo to recompute when any nested field changes
  // react-hook-form returns the same array reference even when inner values change,
  // so without this, the memo would always return the cached (stale) value.
  const subtotalAmount = useMemo(() => {
    return round2(
      watchedItems.reduce((sum, item) => {
        const qty = Number(item?.quantity || 0);
        const price = Number(item?.unitPrice || 0);
        return sum + qty * price;
      }, 0),
    );
  }, [JSON.stringify(watchedItems)]); // <-- KEY FIX

  // Discount
  const normalizedDiscount = round2(
    Math.min(Number(discountNum || 0), subtotalAmount),
  );

  // Amount after discount
  const taxableAmount = round2(Math.max(subtotalAmount - normalizedDiscount, 0));

  // GST amount
  const gstAmount = round2((taxableAmount * Number(gstRateNum || 0)) / 100);

  // Final total
  const totalAmount = round2(taxableAmount + gstAmount);

  // Paid amount (clamped to total)
  const paidClamped = round2(Math.min(Number(paidNum || 0), totalAmount));

  // Due amount
  const dueAmount = round2(Math.max(totalAmount - paidClamped, 0));

  const saleStatus =
    dueAmount <= 0 && totalAmount > 0
      ? "paid"
      : paidClamped > 0
        ? "partial"
        : "pending";

  // FIX: JSON.stringify here too for the same reason
  const estimatedCostAmount = useMemo(
    () =>
      watchedItems.reduce((sum, item) => {
        const qty = Number(item?.quantity) || 0;
        if (item?.itemType === "service") {
          const service = services.find((s) => s.id === item?.serviceId);
          return round2(sum + qty * Number(service?.costPrice || 0));
        }
        const product = products.find((p) => p.id === item?.productId);
        return round2(sum + qty * Number(product?.costPrice || 0));
      }, 0),
    [JSON.stringify(watchedItems), products, services], // <-- KEY FIX
  );

  const estimatedProfit = round2(taxableAmount - estimatedCostAmount);

  const selectedCustomer = useMemo(
    () => customers.find((c) => c.id === selectedCustomerId),
    [customers, selectedCustomerId],
  );

  // ── Auto-set reminder date ────────────────────────────────────────────────
  useEffect(() => {
    if (dueAmount <= 0) {
      setReminderEnabled(false);
      setValue("reminderDate", "", { shouldDirty: false });
      return;
    }
    if (!reminderDate) {
      const d = new Date();
      d.setDate(d.getDate() + 7);
      setValue("reminderDate", d.toISOString().slice(0, 10), {
        shouldDirty: false,
      });
    }
  }, [dueAmount, reminderDate, setValue]);

  // ── When a product is selected, auto-fill its price ───────────────────────
  const handleProductChange = (index, productId) => {
    const product = products.find((p) => p.id === productId);
    setValue(`items.${index}.productId`, productId, {
      shouldValidate: true,
      shouldDirty: true,
    });
    setValue(`items.${index}.unitPrice`, product?.price ?? 0, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const handleServiceChange = (index, serviceId) => {
    const service = services.find((s) => s.id === serviceId);
    setValue(`items.${index}.serviceId`, serviceId, {
      shouldValidate: true,
      shouldDirty: true,
    });
    setValue(`items.${index}.unitPrice`, service?.price ?? 0, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const handleItemTypeChange = (index, nextType) => {
    setValue(`items.${index}.itemType`, nextType, {
      shouldValidate: true,
      shouldDirty: true,
    });
    setValue(`items.${index}.productId`, "", {
      shouldValidate: true,
      shouldDirty: true,
    });
    setValue(`items.${index}.serviceId`, "", {
      shouldValidate: true,
      shouldDirty: true,
    });
    setValue(`items.${index}.unitPrice`, 0, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const handleCustomerSelect = (customerId) => {
    setValue("customerId", customerId, {
      shouldValidate: true,
      shouldDirty: true,
    });
    setCustomerSearch("");
    setShowCustomerDropdown(false);
    setShowQuickAdd(false);
  };

  const openQuickAdd = (prefillName = "") => {
    setNewCustomerName(prefillName);
    setNewCustomerMobile("");
    setShowQuickAdd(true);
    setShowCustomerDropdown(false);
  };

  const closeQuickAdd = () => {
    setShowQuickAdd(false);
    setNewCustomerName("");
    setNewCustomerMobile("");
  };

  const handleQuickAddCustomer = async () => {
    const name = newCustomerName.trim();
    const mobile = newCustomerMobile.trim();
    if (!name || !mobile) return;
    try {
      const result = await createCustomer({ name, mobile });
      const newId = result?.customer?.id ?? result?.id;
      if (newId) {
        setValue("customerId", newId, {
          shouldValidate: true,
          shouldDirty: true,
        });
      }
      setCustomerSearch("");
      closeQuickAdd();
    } catch (err) {
      console.error("Customer creation failed:", err?.response?.data || err);
    }
  };

  const filteredCustomers = useMemo(() => {
    if (!customerSearch.trim()) return customers;
    const term = customerSearch.toLowerCase().trim();
    return customers.filter(
      (c) => c.name?.toLowerCase().includes(term) || c.mobile?.includes(term),
    );
  }, [customers, customerSearch]);

  // ── Submit ────────────────────────────────────────────────────────────────
  const onSubmit = async (formData) => {
    const items = watchedItems.map((item) => {
      const base = {
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
      };
      return item.itemType === "service"
        ? { ...base, serviceId: item.serviceId }
        : { ...base, productId: item.productId };
    });

    const sub = round2(
      items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0),
    );
    const disc = round2(Math.min(discountNum, sub));
    const rate = gstRateNum;
    const taxable = round2(Math.max(sub - disc, 0));
    const gst = round2((taxable * rate) / 100);
    const total = round2(taxable + gst);
    const paid = Math.min(paidNum, total);
    const due = round2(Math.max(total - paid, 0));

    const payload = {
      customerId: formData.customerId,
      items,
      subtotalAmount: sub,
      discountAmount: disc,
      gstRate: rate,
      gstAmount: gst,
      totalAmount: total,
      paidAmount: paid,
      ...(due > 0 && reminderEnabled && formData.reminderDate
        ? { reminderDate: formData.reminderDate }
        : {}),
    };

    try {
      const response = await createSale(payload);
      reset({
        customerId: "",
        items: [
        {
          itemType: "product",
          productId: "",
          serviceId: "",
          quantity: 1,
          unitPrice: 0,
        },
      ],
        discountAmount: 0,
        gstRate: 18,
        paidAmount: 0,
        reminderDate: "",
      });
      setCustomerSearch("");
      setShowCustomerDropdown(false);
      setReminderEnabled(true);
      navigate(`/sales/${response.sale.id}`);
    } catch (err) {
      console.error("Sale creation failed:", err?.response?.data || err);
    }
  };

  // ── Numeric input helper — shows blank instead of 0 ──────────────────────
  const numericDisplayValue = (val) =>
    val === 0 || val === "0" || val === "" ? "" : val;

  // ── Status badge config ───────────────────────────────────────────────────
  const statusConfig = {
    paid: {
      label: "Paid",
      className: "bg-emerald-100 text-emerald-700 border border-emerald-200",
    },
    partial: {
      label: "Partial",
      className: "bg-amber-100 text-amber-700 border border-amber-200",
    },
    pending: {
      label: "Pending",
      className: "bg-red-100 text-red-700 border border-red-200",
    },
  };

  // ── Live items (only those with a product or service selected) ───────────
  const filledItems = watchedItems.filter(
    (i) => (i?.itemType === "service" ? i.serviceId : i.productId),
  );

  return (
    <div className="min-h-screen w-full bg-white px-4 py-8 md:ml-20">
      <div className="mx-auto w-full max-w-6xl">
        <button
          onClick={() => navigate("/sales")}
          className="mb-6 inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 hover:border-gray-300 group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to sales
        </button>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_380px]">
          {/* ── Main Form ── */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
            <div className="mb-8 flex items-start gap-4">
              <div className="rounded-xl bg-black p-3">
                <ShoppingCart className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                  Record Sale
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Select a customer, add products, and record payments
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* ── Customer ── */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <User className="h-4 w-4 text-gray-700" />
                  Customer Information
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="relative">
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Search Customer
                    </label>
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={customerSearch}
                        onChange={(e) => {
                          setCustomerSearch(e.target.value);
                          setShowCustomerDropdown(true);
                        }}
                        onFocus={() => setShowCustomerDropdown(true)}
                        onBlur={() =>
                          setTimeout(() => setShowCustomerDropdown(false), 150)
                        }
                        placeholder="Search by name or mobile..."
                        className="w-full rounded-xl border border-gray-300 bg-white pl-10 pr-10 py-2.5 text-sm text-gray-900 outline-none transition-all focus:border-gray-500 focus:ring-1 focus:ring-gray-200"
                      />
                      {customerSearch && (
                        <button
                          type="button"
                          onClick={() => {
                            setCustomerSearch("");
                            setShowCustomerDropdown(false);
                          }}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    {showCustomerDropdown && customerSearch && (
                      <div className="absolute z-10 mt-1 w-full rounded-xl border border-gray-200 bg-white shadow-lg max-h-64 overflow-y-auto">
                        {customersLoading ? (
                          <div className="flex items-center justify-center p-4">
                            <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
                          </div>
                        ) : filteredCustomers.length > 0 ? (
                          <>
                            {filteredCustomers.map((customer) => (
                              <button
                                key={customer.id}
                                type="button"
                                onMouseDown={() =>
                                  handleCustomerSelect(customer.id)
                                }
                                className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100"
                              >
                                <p className="font-medium text-gray-900">
                                  {customer.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {customer.mobile}
                                </p>
                              </button>
                            ))}
                            <button
                              type="button"
                              onMouseDown={() =>
                                openQuickAdd(customerSearch.trim())
                              }
                              className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors"
                            >
                              <UserPlus className="h-4 w-4 text-gray-700" />
                              Add new customer
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onMouseDown={() =>
                              openQuickAdd(customerSearch.trim())
                            }
                            className="flex w-full items-start gap-3 p-4 text-left hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100">
                              <UserPlus className="h-4 w-4 text-gray-700" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-gray-900">
                                No customer found
                              </p>
                              <p className="mt-0.5 text-xs text-gray-500">
                                Tap to add &ldquo;{customerSearch.trim()}&rdquo;
                                as a new customer
                              </p>
                            </div>
                          </button>
                        )}
                      </div>
                    )}

                    {showQuickAdd && (
                      <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
                        <div className="mb-3 flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                            <UserPlus className="h-4 w-4 text-gray-700" />
                            Add new customer
                          </div>
                          <button
                            type="button"
                            onClick={closeQuickAdd}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="space-y-2">
                          <div className="relative">
                            <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                              type="text"
                              value={newCustomerName}
                              onChange={(e) =>
                                setNewCustomerName(e.target.value)
                              }
                              placeholder="Customer name"
                              className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition-all focus:border-gray-500 focus:ring-1 focus:ring-gray-200"
                            />
                          </div>
                          <div className="relative">
                            <Phone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                              type="tel"
                              value={newCustomerMobile}
                              onChange={(e) =>
                                setNewCustomerMobile(e.target.value)
                              }
                              placeholder="Mobile number"
                              className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition-all focus:border-gray-500 focus:ring-1 focus:ring-gray-200"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={handleQuickAddCustomer}
                            disabled={
                              isCreatingCustomer ||
                              !newCustomerName.trim() ||
                              !newCustomerMobile.trim()
                            }
                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-black px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isCreatingCustomer ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Check className="h-4 w-4" />
                            )}
                            {isCreatingCustomer
                              ? "Adding…"
                              : "Create & Select"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Selected Customer
                    </label>
                    <div className="rounded-xl border border-gray-300 bg-gray-50 px-4 py-2.5 min-h-[50px]">
                      {selectedCustomer ? (
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {selectedCustomer.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {selectedCustomer.mobile}
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400">
                          No customer selected
                        </p>
                      )}
                    </div>
                    <input
                      type="hidden"
                      {...register("customerId", {
                        required: "Please select a customer",
                      })}
                    />
                    {errors.customerId && (
                      <p className="mt-2 text-xs text-red-500">
                        {errors.customerId.message}
                      </p>
                    )}
                  </div>
                </div>
              </section>

              {/* ── Products & Services ── */}
              <section className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                    <Package className="h-4 w-4 text-gray-700" />
                    Items
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      append({
                        itemType: "product",
                        productId: "",
                        serviceId: "",
                        quantity: 1,
                        unitPrice: 0,
                      })
                    }
                    className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 hover:border-gray-400"
                  >
                    <Plus className="h-4 w-4" />
                    Add item
                  </button>
                </div>

                <div className="space-y-4">
                  {fields.map((field, index) => {
                    const currentItem = watchedItems[index] || {};
                    const isService = currentItem?.itemType === "service";
                    const selectedProduct = products.find(
                      (p) => p.id === currentItem?.productId,
                    );
                    const selectedService = services.find(
                      (s) => s.id === currentItem?.serviceId,
                    );
                    const lineQty = Number(currentItem?.quantity) || 0;
                    const linePrice = Number(currentItem?.unitPrice) || 0;
                    const lineTotal = round2(lineQty * linePrice);

                    return (
                      <div
                        key={field.id}
                        className="rounded-xl border border-gray-200 bg-gray-50 p-4"
                      >
                        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <p className="text-sm font-semibold text-gray-700">
                              Item {index + 1}
                            </p>
                            <div className="inline-flex items-center rounded-lg border border-gray-200 bg-white p-0.5">
                              <button
                                type="button"
                                onClick={() =>
                                  handleItemTypeChange(index, "product")
                                }
                                className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
                                  !isService
                                    ? "bg-black text-white"
                                    : "text-gray-500 hover:text-gray-900"
                                }`}
                              >
                                <Package className="h-3 w-3" />
                                Product
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleItemTypeChange(index, "service")
                                }
                                className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
                                  isService
                                    ? "bg-black text-white"
                                    : "text-gray-500 hover:text-gray-900"
                                }`}
                              >
                                <Wrench className="h-3 w-3" />
                                Service
                              </button>
                            </div>
                          </div>
                          {fields.length > 1 && (
                            <button
                              type="button"
                              onClick={() => remove(index)}
                              className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-red-500 transition-colors hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                              Remove
                            </button>
                          )}
                        </div>

                        <div className="grid gap-4 md:grid-cols-[minmax(0,1.5fr)_120px_150px]">
                          {/* Product / Service select */}
                          <div>
                            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                              {isService ? "Service" : "Product"}
                            </label>
                            {isService ? (
                              <>
                                <Controller
                                  control={control}
                                  name={`items.${index}.serviceId`}
                                  rules={{ required: "Choose a service" }}
                                  render={({ field: f }) => (
                                    <select
                                      value={f.value}
                                      onChange={(e) =>
                                        handleServiceChange(
                                          index,
                                          e.target.value,
                                        )
                                      }
                                      disabled={servicesLoading}
                                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition-all focus:border-gray-500 focus:ring-1 focus:ring-gray-200 disabled:cursor-not-allowed disabled:bg-gray-100"
                                    >
                                      <option value="">
                                        {servicesLoading
                                          ? "Loading services..."
                                          : services?.length === 0
                                            ? "No services yet — add one first"
                                            : "Choose a service"}
                                      </option>
                                      {services.map((service) => (
                                        <option
                                          key={service.id}
                                          value={service.id}
                                        >
                                          {service.name} ·{" "}
                                          {formatCurrency(service.price)}
                                        </option>
                                      ))}
                                    </select>
                                  )}
                                />
                                {errors.items?.[index]?.serviceId && (
                                  <p className="mt-2 text-xs text-red-500">
                                    {errors.items[index].serviceId.message}
                                  </p>
                                )}
                              </>
                            ) : (
                              <>
                                <Controller
                                  control={control}
                                  name={`items.${index}.productId`}
                                  rules={{ required: "Choose a product" }}
                                  render={({ field: f }) => (
                                    <select
                                      value={f.value}
                                      onChange={(e) => {
                                        handleProductChange(
                                          index,
                                          e.target.value,
                                        );
                                      }}
                                      disabled={productsLoading}
                                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition-all focus:border-gray-500 focus:ring-1 focus:ring-gray-200 disabled:cursor-not-allowed disabled:bg-gray-100"
                                    >
                                      <option value="">
                                        {productsLoading
                                          ? "Loading products..."
                                          : "Choose a product"}
                                      </option>
                                      {products.map((product) => (
                                        <option
                                          key={product.id}
                                          value={product.id}
                                        >
                                          {product.name} ·{" "}
                                          {formatCurrency(product.price)}
                                        </option>
                                      ))}
                                    </select>
                                  )}
                                />
                                {errors.items?.[index]?.productId && (
                                  <p className="mt-2 text-xs text-red-500">
                                    {errors.items[index].productId.message}
                                  </p>
                                )}
                                {selectedProduct && (
                                  <p className="mt-2 text-xs text-gray-500">
                                    Stock: {selectedProduct.quantity ?? 0}{" "}
                                    available
                                  </p>
                                )}
                              </>
                            )}
                          </div>

                          {/* Quantity */}
                          <div>
                            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                              Quantity
                            </label>
                            <Controller
                              control={control}
                              name={`items.${index}.quantity`}
                              rules={{ required: true, min: 1 }}
                              render={({ field: f }) => (
                                <input
                                  type="number"
                                  min="1"
                                  value={numericDisplayValue(f.value)}
                                  placeholder="1"
                                  onChange={(e) => {
                                    const val =
                                      e.target.value === ""
                                        ? 0
                                        : Number(e.target.value);
                                    f.onChange(val);
                                  }}
                                  onBlur={() => {
                                    if (!f.value || f.value < 1) f.onChange(1);
                                  }}
                                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition-all focus:border-gray-500 focus:ring-1 focus:ring-gray-200"
                                />
                              )}
                            />
                          </div>

                          {/* Unit Price */}
                          <div>
                            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                              Unit Price (₹)
                            </label>
                            <Controller
                              control={control}
                              name={`items.${index}.unitPrice`}
                              rules={{ required: true, min: 0.01 }}
                              render={({ field: f }) => (
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={numericDisplayValue(f.value)}
                                  placeholder="0"
                                  onChange={(e) => {
                                    const val =
                                      e.target.value === ""
                                        ? 0
                                        : Number(e.target.value);
                                    f.onChange(val);
                                  }}
                                  onBlur={() => {
                                    if (
                                      f.value === "" ||
                                      f.value === null ||
                                      f.value === undefined
                                    ) {
                                      f.onChange(0);
                                    }
                                  }}
                                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition-all focus:border-gray-500 focus:ring-1 focus:ring-gray-200"
                                />
                              )}
                            />
                          </div>
                        </div>

                        {/* Line total */}
                        <div className="mt-3 pt-3 border-t border-gray-200 flex justify-end">
                          <p className="text-sm text-gray-600">
                            Line total:{" "}
                            <span className="font-semibold text-gray-900">
                              {formatCurrency(lineTotal)}
                            </span>
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* ── Pricing ── */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <Tag className="h-4 w-4 text-gray-700" />
                  Pricing
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  {/* Discount */}
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Discount Amount (₹)
                    </label>
                    <div className="relative">
                      <DollarSign className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <Controller
                        control={control}
                        name="discountAmount"
                        render={({ field: f }) => (
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={numericDisplayValue(f.value)}
                            placeholder="0"
                            onChange={(e) =>
                              f.onChange(
                                e.target.value === ""
                                  ? 0
                                  : Number(e.target.value),
                              )
                            }
                            onBlur={() => {
                              if (!f.value) f.onChange(0);
                            }}
                            className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition-all focus:border-gray-500 focus:ring-1 focus:ring-gray-200"
                          />
                        )}
                      />
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      Applied before GST · saves{" "}
                      <span className="font-medium text-emerald-600">
                        {formatCurrency(normalizedDiscount)}
                      </span>
                    </p>
                  </div>

                  {/* GST Rate */}
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                      GST Rate (%)
                    </label>
                    <div className="relative">
                      <Calculator className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <Controller
                        control={control}
                        name="gstRate"
                        render={({ field: f }) => (
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={numericDisplayValue(f.value)}
                            placeholder="0"
                            onChange={(e) =>
                              f.onChange(
                                e.target.value === ""
                                  ? 0
                                  : Number(e.target.value),
                              )
                            }
                            onBlur={() => {
                              if (!f.value) f.onChange(0);
                            }}
                            className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition-all focus:border-gray-500 focus:ring-1 focus:ring-gray-200"
                          />
                        )}
                      />
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      GST on{" "}
                      <span className="font-medium text-gray-700">
                        {formatCurrency(taxableAmount)}
                      </span>{" "}
                      ={" "}
                      <span className="font-medium text-amber-600">
                        {formatCurrency(gstAmount)}
                      </span>
                    </p>
                  </div>

                  {/* Paid Now */}
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Paid Now (₹)
                    </label>
                    <div className="relative">
                      <DollarSign className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <Controller
                        control={control}
                        name="paidAmount"
                        render={({ field: f }) => (
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={numericDisplayValue(f.value)}
                            placeholder="0"
                            onChange={(e) =>
                              f.onChange(
                                e.target.value === ""
                                  ? 0
                                  : Number(e.target.value),
                              )
                            }
                            onBlur={() => {
                              if (!f.value) f.onChange(0);
                            }}
                            className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition-all focus:border-gray-500 focus:ring-1 focus:ring-gray-200"
                          />
                        )}
                      />
                    </div>
                    {dueAmount > 0 && (
                      <p className="mt-2 text-xs text-red-500">
                        Due:{" "}
                        <span className="font-medium">
                          {formatCurrency(dueAmount)}
                        </span>{" "}
                        remaining
                      </p>
                    )}
                    {dueAmount <= 0 && paidNum > 0 && (
                      <p className="mt-2 text-xs text-emerald-600 font-medium">
                        ✓ Fully paid
                      </p>
                    )}
                  </div>
                </div>
              </section>

              {/* ── Reminder ── */}
              <section className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Due Reminder
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      Schedule a reminder for outstanding payments
                    </p>
                  </div>
                  <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={dueAmount > 0 && reminderEnabled}
                      onChange={(e) => setReminderEnabled(e.target.checked)}
                      disabled={dueAmount <= 0}
                      className="h-4 w-4 rounded border-gray-300 text-black focus:ring-gray-500"
                    />
                    Schedule
                  </label>
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Reminder Date
                    </label>
                    <input
                      type="date"
                      {...register("reminderDate")}
                      disabled={!reminderEnabled || dueAmount <= 0}
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition-all focus:border-gray-500 focus:ring-1 focus:ring-gray-200 disabled:cursor-not-allowed disabled:bg-gray-100"
                    />
                  </div>
                  <div className="rounded-xl bg-white p-4 border border-gray-200">
                    <p className="text-xs uppercase tracking-wider text-gray-500">
                      Reminder Status
                    </p>
                    <p className="mt-2 text-sm font-medium text-gray-900">
                      {dueAmount <= 0
                        ? "No reminder needed — fully paid"
                        : reminderEnabled
                          ? "Reminder will be sent"
                          : "Reminder disabled"}
                    </p>
                  </div>
                </div>
              </section>

              <button
                type="submit"
                disabled={isSubmitting || isCreatingSale}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {(isSubmitting || isCreatingSale) && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                Save Sale
              </button>
            </form>
          </div>

          {/* ── Summary Sidebar ── */}
          <aside className="space-y-4">
            <div className="sticky top-6 space-y-4">
              {/* Customer Card */}
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-xl bg-black flex items-center justify-center">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-500">
                      Customer
                    </p>
                    <p className="font-semibold text-gray-900">
                      {selectedCustomer?.name || "Not selected"}
                    </p>
                  </div>
                </div>
                {selectedCustomer ? (
                  <div className="text-sm space-y-0">
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-500">Mobile</span>
                      <span className="font-medium text-gray-900">
                        {selectedCustomer.mobile}
                      </span>
                    </div>
                    {selectedCustomer.email && (
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-500">Email</span>
                        <span className="font-medium text-gray-900 truncate max-w-[160px]">
                          {selectedCustomer.email}
                        </span>
                      </div>
                    )}
                    {selectedCustomer.address && (
                      <div className="flex justify-between py-2">
                        <span className="text-gray-500">Address</span>
                        <span className="font-medium text-gray-900 text-right max-w-[160px]">
                          {selectedCustomer.address}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">
                    Select a customer to see details
                  </p>
                )}
              </div>

              {/* Live Items */}
              <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div className="border-b border-gray-200 bg-gray-50 px-5 py-3">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-gray-700" />
                    <h2 className="text-sm font-semibold text-gray-900">
                      Items
                    </h2>
                    <span className="ml-auto text-xs text-gray-500">
                      {filledItems.length} item
                      {filledItems.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
                <div className="divide-y divide-gray-100">
                  {filledItems.length === 0 ? (
                    <div className="px-5 py-8 text-center">
                      <Package className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-xs text-gray-400">
                        No items added yet
                      </p>
                    </div>
                  ) : (
                    watchedItems.map((item, index) => {
                      const isService = item?.itemType === "service";
                      const id = isService ? item.serviceId : item.productId;
                      if (!id) return null;
                      const record = isService
                        ? services.find((s) => s.id === id)
                        : products.find((p) => p.id === id);
                      const qty = Number(item.quantity) || 0;
                      const price = Number(item.unitPrice) || 0;
                      const lineTotal = round2(qty * price);
                      const Icon = isService ? Wrench : Package;
                      return (
                        <div
                          key={index}
                          className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                              <Icon className="h-4 w-4 text-gray-500" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {record?.name || "Unknown"}
                              </p>
                              <p className="text-xs text-gray-500 mt-0.5">
                                {isService ? "Service · " : ""}
                                {qty} × {formatCurrency(price)}
                              </p>
                            </div>
                          </div>
                          <p className="text-sm font-semibold text-gray-900 ml-3 shrink-0">
                            {formatCurrency(lineTotal)}
                          </p>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* ── Financial Summary ── */}
              <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div className="border-b border-gray-200 bg-gray-50 px-5 py-3">
                  <div className="flex items-center gap-2">
                    <Calculator className="h-4 w-4 text-gray-700" />
                    <h2 className="text-sm font-semibold text-gray-900">
                      Live Summary
                    </h2>
                  </div>
                </div>

                <div className="divide-y divide-gray-100 text-sm">
                  {/* Product Total */}
                  <div className="flex items-center justify-between px-5 py-3">
                    <span className="text-gray-600">Products Total</span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(subtotalAmount)}
                    </span>
                  </div>

                  {/* Discount */}
                  <div
                    className={`flex items-center justify-between px-5 py-3 ${
                      normalizedDiscount > 0 ? "bg-red-50" : ""
                    }`}
                  >
                    <span
                      className={
                        normalizedDiscount > 0
                          ? "text-red-600 font-medium"
                          : "text-gray-400"
                      }
                    >
                      Discount
                    </span>
                    <span
                      className={
                        normalizedDiscount > 0
                          ? "font-bold text-red-600"
                          : "text-gray-400"
                      }
                    >
                      - {formatCurrency(normalizedDiscount)}
                    </span>
                  </div>

                  {/* After Discount */}
                  <div className="flex items-center justify-between px-5 py-3 bg-gray-50">
                    <span className="text-gray-600">Amount After Discount</span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(taxableAmount)}
                    </span>
                  </div>

                  {/* GST */}
                  <div
                    className={`flex items-center justify-between px-5 py-3 ${
                      gstAmount > 0 ? "bg-amber-50" : ""
                    }`}
                  >
                    <span
                      className={
                        gstAmount > 0
                          ? "text-amber-700 font-medium"
                          : "text-gray-400"
                      }
                    >
                      GST ({gstRateNum}%)
                    </span>
                    <span
                      className={
                        gstAmount > 0
                          ? "font-bold text-amber-700"
                          : "text-gray-400"
                      }
                    >
                      + {formatCurrency(gstAmount)}
                    </span>
                  </div>

                  {/* Grand Total */}
                  <div className="flex items-center justify-between px-5 py-4 bg-black">
                    <span className="text-sm font-semibold text-white opacity-80">
                      Grand Total
                    </span>
                    <span className="text-xl font-bold text-white">
                      {formatCurrency(totalAmount)}
                    </span>
                  </div>

                  {/* Paid */}
                  <div
                    className={`flex items-center justify-between px-5 py-3 ${
                      paidClamped > 0 ? "bg-emerald-50" : ""
                    }`}
                  >
                    <span
                      className={
                        paidClamped > 0
                          ? "text-emerald-700 font-medium"
                          : "text-gray-400"
                      }
                    >
                      Paid Amount
                    </span>
                    <span
                      className={
                        paidClamped > 0
                          ? "font-bold text-emerald-700"
                          : "text-gray-400"
                      }
                    >
                      {formatCurrency(paidClamped)}
                    </span>
                  </div>

                  {/* Due */}
                  <div
                    className={`flex items-center justify-between px-5 py-3 ${
                      dueAmount > 0 ? "bg-red-50" : "bg-emerald-50"
                    }`}
                  >
                    <span
                      className={
                        dueAmount > 0
                          ? "text-red-600 font-semibold"
                          : "text-emerald-700 font-semibold"
                      }
                    >
                      {dueAmount > 0 ? "Due Amount" : "Fully Paid"}
                    </span>
                    <span
                      className={
                        dueAmount > 0
                          ? "text-red-600 font-bold text-lg"
                          : "text-emerald-700 font-bold text-lg"
                      }
                    >
                      {formatCurrency(dueAmount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Profit / Loss + Status */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-gray-50 p-4 border border-gray-100">
                    <p className="text-xs uppercase tracking-wider text-gray-500 opacity-70">
                      Est. Cost
                    </p>
                    <p className="mt-2 text-lg font-bold text-gray-700">
                      {formatCurrency(estimatedCostAmount)}
                    </p>
                  </div>
                  <div
                    className={`rounded-xl p-4 border ${
                      estimatedProfit >= 0
                        ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                        : "bg-red-50 text-red-700 border-red-100"
                    }`}
                  >
                    <div className="flex items-center gap-1 opacity-70">
                      {estimatedProfit >= 0 ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      <p className="text-xs uppercase tracking-wider">
                        {estimatedProfit >= 0 ? "Profit" : "Loss"}
                      </p>
                    </div>
                    <p className="mt-2 text-lg font-bold">
                      {formatCurrency(Math.abs(estimatedProfit))}
                    </p>
                  </div>
                </div>

                {/* Status badge */}
                <div className="rounded-xl border border-gray-200 bg-white p-4 flex items-center justify-between">
                  <p className="text-xs uppercase tracking-wider text-gray-500">
                    Status
                  </p>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                      statusConfig[saleStatus].className
                    }`}
                  >
                    {statusConfig[saleStatus].label}
                  </span>
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