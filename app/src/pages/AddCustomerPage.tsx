import { useEffect, useState, type ComponentProps } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Toast from "react-native-toast-message";
import { AppLayout } from "../components/AppLayout";
import { FormBottomSheet } from "../components/FormBottomSheet";
import { createCustomer, fetchCustomer, updateCustomer } from "../lib/api";
import { queryKeys } from "../lib/query";
import { useAuth } from "../providers/AuthProvider";
import type { AppRoute } from "../types/navigation";

type AddCustomerPageProps = {
  customerId?: string;
  onBack: () => void;
  onCreated: (customerId?: string) => void;
  onNavigate: (route: AppRoute) => void;
  onRequestClose?: () => void;
  presentation?: "screen" | "sheet";
};

type FormState = {
  name: string;
  mobile: string;
  email: string;
  openingBalance: string;
  address: string;
  notes: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;
type FormTouched = Partial<Record<keyof FormState, boolean>>;

const initialForm: FormState = {
  name: "",
  mobile: "",
  email: "",
  openingBalance: "0",
  address: "",
  notes: "",
};

const validateField = (name: keyof FormState, value: string): string | undefined => {
  switch (name) {
    case "name":
      return value.trim() ? undefined : "Name is required";
    case "mobile": {
      if (!value.trim()) return "Mobile is required";
      const digits = value.replace(/\D/g, "");
      if (digits.length < 10) return "Enter a valid 10-digit mobile number";
      return undefined;
    }
    default:
      return undefined;
  }
};

export const AddCustomerPage = ({
  customerId,
  onBack,
  onCreated,
  onNavigate,
  onRequestClose,
  presentation = "screen",
}: AddCustomerPageProps) => {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<FormTouched>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isBootstrapping, setIsBootstrapping] = useState(Boolean(customerId));

  useEffect(() => {
    const accessToken = session?.tokens.accessToken;

    if (!customerId || !accessToken) {
      setIsBootstrapping(false);
      return;
    }

    fetchCustomer(accessToken, customerId)
      .then((customer) => {
        setForm({
          name: customer.name,
          mobile: customer.mobile,
          email: customer.email ?? "",
          openingBalance: String(customer.openingBalance ?? 0),
          address: customer.address ?? "",
          notes: customer.notes ?? "",
        });
      })
      .catch(() => setSubmitError("Failed to load customer"))
      .finally(() => setIsBootstrapping(false));
  }, [customerId]);

  const handleChange = (name: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) {
      const err = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: err }));
    }
  };

  const handleBlur = (name: keyof FormState, value: string) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    const err = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: err }));
  };

  const handleSubmit = async () => {
    const accessToken = session?.tokens.accessToken;
    if (!accessToken) return;

    const requiredFields: (keyof FormState)[] = ["name", "mobile"];
    const newErrors: FormErrors = {};
    const newTouched: FormTouched = {};

    for (const field of requiredFields) {
      newTouched[field] = true;
      const err = validateField(field, form[field]);
      if (err) newErrors[field] = err;
    }

    setTouched((prev) => ({ ...prev, ...newTouched }));
    setErrors((prev) => ({ ...prev, ...newErrors }));

    if (Object.keys(newErrors).length > 0) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      setIsLoading(true);
      setSubmitError(null);

      const payload = {
        name: form.name.trim(),
        mobile: form.mobile.trim(),
        email: form.email.trim() || undefined,
        openingBalance: Number(form.openingBalance || "0"),
        address: form.address.trim() || undefined,
        notes: form.notes.trim() || undefined,
      };

      if (customerId) {
        await updateCustomer(accessToken, customerId, payload);
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: queryKeys.customers.all }),
          queryClient.invalidateQueries({ queryKey: queryKeys.customers.detail(customerId) }),
          queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all }),
          queryClient.invalidateQueries({ queryKey: queryKeys.sales.all }),
        ]);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Toast.show({ type: "success", text1: "Customer Updated", text2: `${form.name.trim()} has been saved.` });
        onCreated(customerId);
      } else {
        const customer = await createCustomer(accessToken, payload);
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: queryKeys.customers.all }),
          queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all }),
          queryClient.invalidateQueries({ queryKey: queryKeys.sales.all }),
        ]);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Toast.show({ type: "success", text1: "Customer Created", text2: `${form.name.trim()} added to your book.` });
        onCreated(customer.id);
      }
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const msg = "Failed to save customer";
      setSubmitError(msg);
      Toast.show({ type: "error", text1: "Save Failed", text2: msg });
    } finally {
      setIsLoading(false);
    }
  };

  const closeHandler = onRequestClose ?? onBack;

  const hero = presentation === "sheet" ? (
    <View className="mb-4 flex-row items-center rounded-[26px] border border-slate-100 bg-white px-4 py-4">
      <View className="h-14 w-14 rounded-2xl border border-slate-200 bg-slate-100 items-center justify-center">
        <MaterialIcons
          name={customerId ? "edit" : "person-add"}
          size={26}
          color="#000"
        />
      </View>

      <View className="ml-4 flex-1">
        <Text className="text-[18px] font-bold text-slate-900">
          {customerId ? "Edit Customer" : "Add Customer"}
        </Text>
        <Text className="mt-1 text-[12px] leading-5 text-slate-500">
          {customerId
            ? "Update customer details, balance and contact info."
            : "Create a customer profile with contact and balance details."}
        </Text>
      </View>
    </View>
  ) : (
    <View className="mb-4 rounded-3xl px-1 py-2">
      <View className="flex-row items-center">
        <View className="h-14 w-14 rounded-2xl border border-slate-200 bg-slate-100 items-center justify-center">
          <MaterialIcons
            name={customerId ? "edit" : "person-add"}
            size={26}
            color="#000"
          />
        </View>

        <View className="ml-4 flex-1">
          <Text className="text-[24px] font-bold text-slate-900">
            {customerId ? "Edit Customer" : "Add Customer"}
          </Text>

          <Text className="mt-1 text-[13px] leading-5 text-slate-500">
            {customerId
              ? "Update customer details, balance and contact info."
              : "Create a customer profile with contact and balance details."}
          </Text>
        </View>
      </View>
    </View>
  );

  const cardClasses = presentation === "sheet"
    ? "mt-1 rounded-3xl border border-slate-100 bg-white px-5 py-5"
    : "mt-5 rounded-3xl border border-slate-100 bg-white px-4 py-5";

  const cardContent = (
    <View className={cardClasses}>
      {submitError ? (
        <View className="mb-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3">
          <Text className="text-[13px] text-red-500">{submitError}</Text>
        </View>
      ) : null}

      {isBootstrapping ? (
        <View className="items-center py-10">
          <ActivityIndicator size="large" color="#000" />
          <Text className="mt-3 text-slate-400">Loading...</Text>
        </View>
      ) : (
        <>
          <Field
            label="Full Name"
            icon="person"
            value={form.name}
            error={errors.name}
            onChangeText={(name) => handleChange("name", name)}
            onBlur={() => handleBlur("name", form.name)}
          />

          <Field
            label="Mobile Number"
            icon="phone"
            keyboardType="phone-pad"
            value={form.mobile}
            error={errors.mobile}
            onChangeText={(mobile) => handleChange("mobile", mobile)}
            onBlur={() => handleBlur("mobile", form.mobile)}
          />

          <Field
            label="Email Address"
            icon="mail"
            keyboardType="email-address"
            value={form.email}
            onChangeText={(email) => handleChange("email", email)}
            onBlur={() => handleBlur("email", form.email)}
          />

          <Field
            label="Opening Balance"
            icon="payments"
            keyboardType="decimal-pad"
            value={form.openingBalance}
            onChangeText={(openingBalance) =>
              handleChange("openingBalance", openingBalance)
            }
            onBlur={() => handleBlur("openingBalance", form.openingBalance)}
          />

          <Field
            label="Address"
            icon="place"
            value={form.address}
            onChangeText={(address) => handleChange("address", address)}
            onBlur={() => handleBlur("address", form.address)}
          />

          <Field
            label="Notes"
            icon="notes"
            multiline
            value={form.notes}
            onChangeText={(notes) => handleChange("notes", notes)}
            onBlur={() => handleBlur("notes", form.notes)}
          />

          <Pressable
            onPress={handleSubmit}
            disabled={isLoading}
            android_ripple={{ color: "rgba(255,255,255,0.1)", borderless: false }}
            className={`mt-3 items-center rounded-2xl py-4 ${
              isLoading ? "bg-slate-400" : "bg-black"
            }`}
          >
            <Text className="text-[15px] font-semibold text-white">
              {isLoading
                ? "Saving..."
                : customerId
                  ? "Update Customer"
                  : "Create Customer"}
            </Text>
          </Pressable>
        </>
      )}
    </View>
  );

  const formBody = (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      {presentation === "sheet" ? (
        <View className="px-5 pb-16 pt-2">
          {hero}
          {cardContent}
        </View>
      ) : null}

      <ScrollView
        automaticallyAdjustKeyboardInsets
        className="flex-1"
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerClassName="px-4 pb-32 pt-3"
        style={presentation === "sheet" ? { display: "none" } : undefined}
      >
        {hero}
        {cardContent}
      </ScrollView>
    </KeyboardAvoidingView>
  );

  if (presentation === "sheet") {
    return (
      <FormBottomSheet
        title={customerId ? "Edit Customer" : "Add Customer"}
        subtitle="Keep context visible while updating customer details."
        onClose={closeHandler}
      >
        {formBody}
      </FormBottomSheet>
    );
  }

  return (
    <AppLayout
      currentRoute="customers"
      title={customerId ? "Edit Customer" : "Add Customer"}
      subtitle="Manage customer profile professionally"
      onNavigate={onNavigate}
    >
      {formBody}
    </AppLayout>
  );
};

const Field = ({
  label,
  icon,
  keyboardType = "default",
  multiline,
  onChangeText,
  onBlur,
  value,
  error,
}: {
  label: string;
  icon: ComponentProps<typeof MaterialIcons>["name"];
  keyboardType?: "default" | "email-address" | "phone-pad" | "decimal-pad";
  multiline?: boolean;
  onChangeText: (value: string) => void;
  onBlur?: () => void;
  value: string;
  error?: string;
}) => (
  <View className="mb-4">
    <Text className="text-[11px] font-semibold text-slate-500 mb-2 uppercase tracking-[1px]">
      {label}
    </Text>

    <View
      className={`flex-row items-center bg-slate-50 border rounded-2xl px-4 ${
        error ? "border-red-300" : "border-slate-100"
      }`}
    >
      <MaterialIcons name={icon} size={18} color={error ? "#EF4444" : "#94A3B8"} />

      <TextInput
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
        placeholder={label}
        placeholderTextColor="#94A3B8"
        className={`flex-1 text-[15px] text-slate-800 ml-3 ${
          multiline ? "py-4" : "py-4"
        }`}
      />
    </View>

    {error && (
      <Text className="text-red-500 text-[11px] mt-1 ml-1">{error}</Text>
    )}
  </View>
);
