import { useEffect, useState } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { AppLayout } from "../components/AppLayout";
import { archiveCustomer, fetchCustomer } from "../lib/api";
import { useAuth } from "../providers/AuthProvider";
import type { CustomerDetail } from "../types/customer";
import type { AppRoute } from "../types/navigation";

type CustomerDetailPageProps = {
  customerId: string;
  onBack: () => void;
  onEdit: () => void;
  onOpenSale: (saleId: string) => void;
  onNavigate: (route: AppRoute) => void;
};

const formatCurrency = (value: number) =>
  `₹${Number(value || 0).toLocaleString("en-IN")}`;

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const initialsFor = (name: string) =>
  name
    .split(" ")
    .map((p) => p[0]?.toUpperCase() || "")
    .join("")
    .slice(0, 2);

export const CustomerDetailPage = ({
  customerId,
  onBack,
  onEdit,
  onNavigate,
  onOpenSale,
}: CustomerDetailPageProps) => {
  const { session } = useAuth();

  const [customer, setCustomer] = useState<CustomerDetail | null>(null);

  const [error, setError] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);

  const load = async (refresh = false) => {
    const token = session?.tokens.accessToken;

    if (!token) {
      setError("Session expired.");
      return;
    }

    refresh ? setIsRefreshing(true) : setIsLoading(true);

    try {
      setError(null);

      const data = await fetchCustomer(token, customerId);

      setCustomer(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, [customerId]);

  const handleArchive = async () => {
    const token = session?.tokens.accessToken;
    if (!token) return;

    try {
      setIsArchiving(true);
      await archiveCustomer(token, customerId);
      onBack();
    } finally {
      setIsArchiving(false);
    }
  };

  return (
    <AppLayout
      currentRoute="customers"
      onNavigate={onNavigate}
      title="Customer Detail"
      subtitle="Overview & transaction history"
    >
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pb-28"
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => load(true)}
          />
        }
      >
        {/* Top Buttons */}
        <View className="mt-4 mb-4 flex-row gap-3">
          <TopBtn label="Back" icon="arrow-back" onPress={onBack} />

          <TopBtn label="Edit" icon="edit" onPress={onEdit} dark />
        </View>

        {isLoading ? (
          <Text className="py-20 text-center text-black/40">
            Loading customer...
          </Text>
        ) : error || !customer ? (
          <Text className="py-20 text-center text-red-500">
            {error || "Customer not found"}
          </Text>
        ) : (
          <>
            {/* Hero Card */}
            <View className="rounded-[28px] bg-black px-5 py-5">
              <View className="flex-row items-center gap-4">
                <View className="h-14 w-14 items-center justify-center rounded-full bg-white/10">
                  <Text className="text-[16px] font-bold text-white">
                    {initialsFor(customer.name)}
                  </Text>
                </View>

                <View className="flex-1">
                  <Text className="text-[22px] font-bold text-white">
                    {customer.name}
                  </Text>

                  <Text className="mt-1 text-[13px] text-white/55">
                    {customer.mobile}
                  </Text>
                </View>
              </View>

              <View className="mt-5 flex-row gap-3">
                <MetricCard
                  label="Revenue"
                  value={formatCurrency(customer.totalPayment)}
                />

                <MetricCard
                  label="Total Due"
                  value={formatCurrency(customer.due)}
                  red
                />
              </View>
            </View>

            {/* Info Section */}
            <View className="mt-5 rounded-[28px] border border-black/10 bg-white p-5">
              <SectionTitle title="Customer Info" />

              {/* Phone + Email */}
              <View className="flex-row gap-3 mb-3">
                <View className="flex-1">
                  <InfoRow icon="phone" label="Phone" value={customer.mobile} />
                </View>

                <View className="flex-1">
                  <InfoRow
                    icon="mail"
                    label="Email"
                    value={customer.email || "Not provided"}
                  />
                </View>
              </View>

              {/* Address + Joined */}
              <View className="flex-row gap-3 mb-3">
                <View className="flex-1">
                  <InfoRow
                    icon="location-on"
                    label="Address"
                    value={customer.address || "Not provided"}
                  />
                </View>

                <View className="flex-1">
                  <InfoRow
                    icon="calendar-month"
                    label="Joined"
                    value={formatDate(customer.createdAt)}
                  />
                </View>
              </View>

              {customer.notes ? (
                <InfoRow
                  icon="description"
                  label="Notes"
                  value={customer.notes}
                />
              ) : null}

              {!customer.archivedAt && (
                <Pressable
                  onPress={handleArchive}
                  className="mt-4 rounded-2xl bg-black py-4 items-center"
                >
                  <Text className="font-semibold text-white">
                    {isArchiving ? "Archiving..." : "Archive Customer"}
                  </Text>
                </Pressable>
              )}
            </View>

            {/* Sales History */}
            <View className="mt-5 rounded-[28px] border border-black/10 bg-white overflow-hidden">
              <View className="border-b border-black/5 px-5 py-4">
                <Text className="text-[16px] font-semibold text-black">
                  Sales History
                </Text>
              </View>

              {customer.sales.length === 0 ? (
                <Text className="py-10 text-center text-black/35">
                  No sales yet
                </Text>
              ) : (
                customer.sales.map((sale, index) => (
                  <Pressable
                    key={sale.id}
                    onPress={() => onOpenSale(sale.id)}
                    className={`px-5 py-4 ${
                      index < customer.sales.length - 1
                        ? "border-b border-black/5"
                        : ""
                    }`}
                  >
                    <View className="flex-row items-center justify-between">
                      <View>
                        <Text className="font-semibold text-black">
                          Sale #{sale.id.slice(0, 8)}
                        </Text>

                        <Text className="mt-1 text-[12px] text-black/35">
                          {formatDate(sale.createdAt)}
                        </Text>
                      </View>

                      <View className="items-end">
                        <Text className="font-bold text-black">
                          {formatCurrency(sale.totalAmount)}
                        </Text>

                        <Text className="mt-1 text-[12px] text-red-500">
                          Due {formatCurrency(sale.dueAmount)}
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                ))
              )}
            </View>
          </>
        )}
      </ScrollView>
    </AppLayout>
  );
};

/* Components */

const TopBtn = ({ label, icon, dark, onPress }: any) => (
  <Pressable
    onPress={onPress}
    className={`flex-row items-center gap-2 rounded-2xl px-4 py-3 ${
      dark ? "bg-black" : "border border-black/10 bg-white"
    }`}
  >
    <MaterialIcons name={icon} size={18} color={dark ? "#fff" : "#000"} />

    <Text className={`font-medium ${dark ? "text-white" : "text-black"}`}>
      {label}
    </Text>
  </Pressable>
);

const MetricCard = ({ label, value, red }: any) => (
  <View
    className={`flex-1 rounded-2xl px-4 py-4 ${
      red ? "bg-red-500/15" : "bg-white/10"
    }`}
  >
    <Text className="text-[11px] text-white/50">{label}</Text>

    <Text
      className={`mt-2 text-[18px] font-bold ${
        red ? "text-red-400" : "text-white"
      }`}
    >
      {value}
    </Text>
  </View>
);

const SectionTitle = ({ title }: { title: string }) => (
  <Text className="mb-4 text-[16px] font-semibold text-black">{title}</Text>
);

const InfoRow = ({ icon, label, value }: any) => (
  <View className="rounded-2xl bg-zinc-50 px-4 py-4">
    <MaterialIcons name={icon} size={18} color="#555" />

    <View className="mt-2">
      <Text className="text-[11px] uppercase text-black/35">{label}</Text>

      <Text numberOfLines={2} className="mt-1 text-[14px] text-black">
        {value}
      </Text>
    </View>
  </View>
);
