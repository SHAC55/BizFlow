import { useEffect, useState, type ComponentProps } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { AppLayout } from "../components/AppLayout";
import { createCustomer, fetchCustomer, updateCustomer } from "../lib/api";
import { useAuth } from "../providers/AuthProvider";
import type { AppRoute } from "../types/navigation";

type AddCustomerPageProps = {
  customerId?: string;
  onBack: () => void;
  onCreated: (customerId?: string) => void;
  onNavigate: (route: AppRoute) => void;
};

type FormState = {
  name: string;
  mobile: string;
  email: string;
  openingBalance: string;
  address: string;
  notes: string;
};

const initialForm: FormState = {
  name: "",
  mobile: "",
  email: "",
  openingBalance: "0",
  address: "",
  notes: "",
};

export const AddCustomerPage = ({
  customerId,
  onBack,
  onCreated,
  onNavigate,
}: AddCustomerPageProps) => {
  const { session } = useAuth();
  const [form, setForm] = useState<FormState>(initialForm);
  const [error, setError] = useState<string | null>(null);
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
      .catch((loadError) => {
        setError(loadError instanceof Error ? loadError.message : "Failed to load customer");
      })
      .finally(() => setIsBootstrapping(false));
  }, [customerId, session?.tokens.accessToken]);

  const handleSubmit = async () => {
    const accessToken = session?.tokens.accessToken;

    if (!accessToken) {
      setError("Session expired. Please sign in again.");
      return;
    }

    if (!form.name.trim() || !form.mobile.trim()) {
      setError("Name and mobile are required");
      return;
    }

    const openingBalance = Number(form.openingBalance || "0");

    if (Number.isNaN(openingBalance) || openingBalance < 0) {
      setError("Opening balance must be zero or greater");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const payload = {
        name: form.name.trim(),
        mobile: form.mobile.trim(),
        email: form.email.trim() || undefined,
        openingBalance,
        address: form.address.trim() || undefined,
        notes: form.notes.trim() || undefined,
      };

      if (customerId) {
        await updateCustomer(accessToken, customerId, payload);
        onCreated(customerId);
        return;
      }

      const customer = await createCustomer(accessToken, payload);
      onCreated(customer.id);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to save customer");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout
      currentRoute="customers"
      eyebrow={customerId ? "Edit Customer" : "New Customer"}
      headerRight={
        <Pressable
          onPress={onBack}
          className="rounded-[20px] border border-black/10 bg-[#f8fafc] px-4 py-3"
        >
          <Text className="text-[13px] font-semibold text-black/70">Back</Text>
        </Pressable>
      }
      onNavigate={onNavigate}
      subtitle="Create a polished customer record with contact details and balance context."
      title={customerId ? "Customer Editor" : "Add Customer"}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView className="flex-1" contentContainerClassName="pb-28">
          <View className="rounded-[28px] bg-[#0f172a] px-5 py-5">
            <Text className="text-[12px] uppercase tracking-[1.8px] text-white/45">
              Client Profile
            </Text>
            <Text className="mt-2 text-[24px] font-extrabold text-white">
              {customerId ? "Refine the relationship." : "Bring a customer into the book."}
            </Text>
          </View>

          <View className="mt-6 rounded-[28px] border border-black/8 bg-white px-4 py-4">
            {error ? (
              <View className="mb-4 rounded-[20px] border border-red-200 bg-red-50 px-4 py-3">
                <Text className="text-[13px] text-red-600">{error}</Text>
              </View>
            ) : null}

            {isBootstrapping ? (
              <Text className="py-10 text-center text-[14px] text-black/45">
                Loading customer...
              </Text>
            ) : (
              <>
                <Field label="Full Name" icon="person" value={form.name} onChangeText={(name) => setForm((current) => ({ ...current, name }))} />
                <Field label="Contact Number" icon="phone" value={form.mobile} keyboardType="phone-pad" onChangeText={(mobile) => setForm((current) => ({ ...current, mobile }))} />
                <Field label="Email" icon="mail" value={form.email} keyboardType="email-address" onChangeText={(email) => setForm((current) => ({ ...current, email }))} />
                <Field label="Opening Balance" icon="payments" value={form.openingBalance} keyboardType="decimal-pad" onChangeText={(openingBalance) => setForm((current) => ({ ...current, openingBalance }))} />
                <Field label="Address" icon="place" value={form.address} onChangeText={(address) => setForm((current) => ({ ...current, address }))} />
                <Field label="Notes" icon="notes" value={form.notes} multiline onChangeText={(notes) => setForm((current) => ({ ...current, notes }))} />

                <Pressable
                  onPress={handleSubmit}
                  disabled={isLoading}
                  className={`mt-3 items-center justify-center rounded-[22px] bg-[#2563eb] py-4 ${isLoading ? "opacity-60" : ""}`}
                >
                  <Text className="text-[15px] font-bold text-white">
                    {isLoading
                      ? "Saving customer..."
                      : customerId
                        ? "Update Customer"
                        : "Create Customer"}
                  </Text>
                </Pressable>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </AppLayout>
  );
};

const Field = ({
  label,
  icon,
  keyboardType = "default",
  multiline,
  onChangeText,
  value,
}: {
  label: string;
  icon: ComponentProps<typeof MaterialIcons>["name"];
  keyboardType?: "default" | "email-address" | "phone-pad" | "decimal-pad";
  multiline?: boolean;
  onChangeText: (value: string) => void;
  value: string;
}) => (
  <View className="mb-4">
    <Text className="mb-2 text-[11px] font-bold uppercase tracking-[1.8px] text-black/35">
      {label}
    </Text>
    <View className="flex-row items-center gap-3 rounded-[22px] border border-black/10 bg-[#f8fafc] px-4 py-1">
      <MaterialIcons name={icon} size={18} color="#94a3b8" />
      <TextInput
        className={`flex-1 text-[15px] text-[#0f172a] ${multiline ? "py-4" : "py-4"}`}
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
        onChangeText={onChangeText}
        placeholder={label}
        placeholderTextColor="#94a3b8"
        value={value}
      />
    </View>
  </View>
);
