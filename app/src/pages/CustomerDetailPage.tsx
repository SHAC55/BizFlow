import { useEffect, useState } from "react";
import { Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
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
  `₹${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

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
    const accessToken = session?.tokens.accessToken;
    if (!accessToken) {
      setError("Session expired. Please sign in again.");
      setIsLoading(false);
      return;
    }
    refresh ? setIsRefreshing(true) : setIsLoading(true);
    try {
      setError(null);
      setCustomer(await fetchCustomer(accessToken, customerId));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load customer");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, [customerId, session?.tokens.accessToken]);

  const handleArchive = async () => {
    const accessToken = session?.tokens.accessToken;
    if (!accessToken) return;
    setIsArchiving(true);
    try {
      await archiveCustomer(accessToken, customerId);
      onBack();
    } catch (archiveError) {
      setError(archiveError instanceof Error ? archiveError.message : "Failed to archive customer");
    } finally {
      setIsArchiving(false);
    }
  };

  return (
    <AppLayout
      currentRoute="customers"
      eyebrow="Profile"
      headerRight={
        <View className="flex-row gap-2">
          <Pressable onPress={onEdit} className="rounded-[18px] border border-black/10 bg-white px-3 py-2.5">
            <Text className="text-[12px] font-semibold text-black/70">Edit</Text>
          </Pressable>
          <Pressable onPress={onBack} className="rounded-[18px] border border-black/10 bg-[#f8fafc] px-3 py-2.5">
            <Text className="text-[12px] font-semibold text-black/70">Back</Text>
          </Pressable>
        </View>
      }
      onNavigate={onNavigate}
      subtitle="Relationship history, dues, and recent transaction context."
      title={customer?.name ?? "Customer Detail"}
    >
      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-28"
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => load(true)} />}
      >
        {isLoading ? (
          <Text className="py-12 text-center text-[14px] text-black/45">Loading customer...</Text>
        ) : error || !customer ? (
          <Text className="py-12 text-center text-[14px] text-red-600">{error || "Customer not found"}</Text>
        ) : (
          <>
            <View className="rounded-[28px] bg-[#0f172a] px-5 py-5">
              <Text className="text-[12px] uppercase tracking-[1.8px] text-white/45">Customer Summary</Text>
              <View className="mt-4 flex-row gap-3">
                <MetricCard label="Revenue" value={formatCurrency(customer.totalPayment)} />
                <MetricCard label="Due" value={formatCurrency(customer.due)} />
              </View>
            </View>

            <View className="mt-6 rounded-[28px] border border-black/8 bg-white px-5 py-5">
              <InfoRow label="Phone" value={customer.mobile} />
              <InfoRow label="Email" value={customer.email || "Not provided"} />
              <InfoRow label="Address" value={customer.address || "Not provided"} />
              <InfoRow label="Customer Since" value={formatDate(customer.createdAt)} />
              {customer.notes ? <InfoRow label="Notes" value={customer.notes} /> : null}
              {!customer.archivedAt ? (
                <Pressable
                  onPress={handleArchive}
                  disabled={isArchiving}
                  className={`mt-4 items-center rounded-[18px] bg-[#0f172a] py-3 ${isArchiving ? "opacity-60" : ""}`}
                >
                  <Text className="text-[13px] font-semibold text-white">
                    {isArchiving ? "Archiving..." : "Archive Customer"}
                  </Text>
                </Pressable>
              ) : null}
            </View>

            <View className="mt-6 overflow-hidden rounded-[28px] border border-black/8 bg-white">
              <View className="border-b border-black/5 px-5 py-4">
                <Text className="text-[15px] font-semibold text-black">Sales History</Text>
              </View>
              {customer.sales.length === 0 ? (
                <Text className="px-5 py-10 text-center text-[14px] text-black/40">No sales yet</Text>
              ) : (
                customer.sales.map((sale, index) => (
                  <Pressable
                    key={sale.id}
                    onPress={() => onOpenSale(sale.id)}
                    className={`px-5 py-4 ${index < customer.sales.length - 1 ? "border-b border-black/5" : ""}`}
                  >
                    <View className="flex-row items-center justify-between">
                      <View>
                        <Text className="text-[14px] font-semibold text-black">
                          Sale #{sale.id.slice(0, 8)}
                        </Text>
                        <Text className="mt-1 text-[12px] text-black/40">{formatDate(sale.createdAt)}</Text>
                      </View>
                      <View className="items-end">
                        <Text className="text-[14px] font-bold text-black">
                          {formatCurrency(sale.totalAmount)}
                        </Text>
                        <Text className="mt-1 text-[11px] text-[#B45309]">
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

const MetricCard = ({ label, value }: { label: string; value: string }) => (
  <View className="flex-1 rounded-[22px] bg-white/8 px-4 py-4">
    <Text className="text-[12px] text-white/55">{label}</Text>
    <Text className="mt-2 text-[18px] font-bold text-white">{value}</Text>
  </View>
);

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <View className="mb-4 rounded-[20px] bg-[#f8fafc] px-4 py-4">
    <Text className="text-[11px] font-bold uppercase tracking-[1.8px] text-black/35">{label}</Text>
    <Text className="mt-2 text-[14px] text-black">{value}</Text>
  </View>
);
