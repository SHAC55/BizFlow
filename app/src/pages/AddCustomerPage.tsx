import { useEffect, useState, type ComponentProps } from "react";
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
      .catch(() => setError("Failed to load customer"))
      .finally(() => setIsBootstrapping(false));
  }, [customerId]);

  const handleSubmit = async () => {
    const accessToken = session?.tokens.accessToken;

    if (!accessToken) return;

    if (!form.name.trim() || !form.mobile.trim()) {
      setError("Name and mobile required");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

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
        onCreated(customerId);
      } else {
        const customer = await createCustomer(accessToken, payload);
        onCreated(customer.id);
      }
    } catch {
      setError("Failed to save customer");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout
      currentRoute="customers"
      title={customerId ? "Edit Customer" : "Add Customer"}
      subtitle="Manage customer profile professionally"
      onNavigate={onNavigate}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerClassName="px-4 pb-32 pt-3"
        >
          {/* Hero */}
          {/* Hero */}
          <View className="rounded-3xl px-1 py-2 mb-4">
            <View className="flex-row items-center">
              <View className="h-14 w-14 rounded-2xl bg-slate-100 items-center justify-center border border-slate-200">
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

                <Text className="text-[13px] text-slate-500 mt-1 leading-5">
                  {customerId
                    ? "Update customer details, balance and contact info."
                    : "Create a customer profile with contact and balance details."}
                </Text>
              </View>
            </View>
          </View>

          {/* Form */}
          <View className="bg-white rounded-3xl mt-5 px-4 py-5 border border-slate-100">
            {error ? (
              <View className="mb-4 bg-red-50 border border-red-100 rounded-2xl px-4 py-3">
                <Text className="text-red-500 text-[13px]">{error}</Text>
              </View>
            ) : null}

            {isBootstrapping ? (
              <View className="py-10 items-center">
                <ActivityIndicator size="large" color="#000" />
                <Text className="text-slate-400 mt-3">Loading...</Text>
              </View>
            ) : (
              <>
                <Field
                  label="Full Name"
                  icon="person"
                  value={form.name}
                  onChangeText={(name) => setForm((p) => ({ ...p, name }))}
                />

                <Field
                  label="Mobile Number"
                  icon="phone"
                  keyboardType="phone-pad"
                  value={form.mobile}
                  onChangeText={(mobile) => setForm((p) => ({ ...p, mobile }))}
                />

                <Field
                  label="Email Address"
                  icon="mail"
                  keyboardType="email-address"
                  value={form.email}
                  onChangeText={(email) => setForm((p) => ({ ...p, email }))}
                />

                <Field
                  label="Opening Balance"
                  icon="payments"
                  keyboardType="decimal-pad"
                  value={form.openingBalance}
                  onChangeText={(openingBalance) =>
                    setForm((p) => ({ ...p, openingBalance }))
                  }
                />

                <Field
                  label="Address"
                  icon="place"
                  value={form.address}
                  onChangeText={(address) =>
                    setForm((p) => ({ ...p, address }))
                  }
                />

                <Field
                  label="Notes"
                  icon="notes"
                  multiline
                  value={form.notes}
                  onChangeText={(notes) => setForm((p) => ({ ...p, notes }))}
                />

                <Pressable
                  onPress={handleSubmit}
                  disabled={isLoading}
                  className={`mt-3 rounded-2xl py-4 items-center ${
                    isLoading ? "bg-slate-400" : "bg-black"
                  }`}
                >
                  <Text className="text-white text-[15px] font-semibold">
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
    <Text className="text-[11px] font-semibold text-slate-500 mb-2 uppercase tracking-[1px]">
      {label}
    </Text>

    <View className="flex-row items-center bg-slate-50 border border-slate-100 rounded-2xl px-4">
      <MaterialIcons name={icon} size={18} color="#94A3B8" />

      <TextInput
        value={value}
        onChangeText={onChangeText}
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
  </View>
);
