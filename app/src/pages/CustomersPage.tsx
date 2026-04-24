import {
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useState } from "react";
import { AppLayout } from "../components/AppLayout";
import { useCustomersData } from "../hooks/useCustomersData";
import type { AppRoute } from "../types/navigation";

type CustomersPageProps = {
  onOpenAddCustomer: () => void;
  onOpenCustomer: (customerId: string) => void;
  onNavigate: (route: AppRoute) => void;
};

const formatCurrency = (value: number) =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });

const initialsFor = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0]?.toUpperCase() || "")
    .join("")
    .slice(0, 2);

export const CustomersPage = ({
  onNavigate,
  onOpenAddCustomer,
  onOpenCustomer,
}: CustomersPageProps) => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [dueStatus, setDueStatus] = useState<
    "all" | "pending" | "cleared" | "high_due"
  >("all");
  const { customers, summary, pagination, isLoading, isRefreshing, error, refetch } =
    useCustomersData({
      page,
      limit: 10,
      search,
      dueStatus,
    });

  return (
    <AppLayout
      currentRoute="customers"
      eyebrow="Relationships"
      headerRight={
        <Pressable
          onPress={onOpenAddCustomer}
          className="rounded-[20px] bg-[#0f172a] px-4 py-3"
        >
          <Text className="text-[13px] font-semibold text-white">
            Add customer
          </Text>
        </Pressable>
      }
      onNavigate={onNavigate}
      subtitle="See who drives revenue, who needs follow-up, and who is fully cleared."
      title="Customer Book"
    >
      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-28"
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={refetch} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View className="rounded-[28px] bg-[#0f172a] px-5 py-5">
          <View className="flex-row gap-3">
            <MetricCard
              label="Customers"
              value={summary.totalCustomers.toLocaleString("en-IN")}
            />
            <MetricCard label="Total due" value={formatCurrency(summary.totalDue)} />
          </View>
          <View className="mt-3 flex-row gap-3">
            <MetricCard
              label="Cleared"
              value={summary.clearedCustomers.toLocaleString("en-IN")}
            />
            <MetricCard
              label="Revenue"
              value={formatCurrency(summary.totalRevenue)}
            />
          </View>
        </View>

        <View className="mt-6 rounded-[28px] border border-black/8 bg-white px-4 py-4">
          <View className="rounded-[22px] border border-black/10 bg-[#f8fafc] px-4 py-2">
            <TextInput
              value={search}
              onChangeText={(value) => {
                setSearch(value);
                setPage(1);
              }}
              placeholder="Search name, email, or phone"
              placeholderTextColor="#94a3b8"
              className="text-[14px] text-black"
            />
          </View>
          <View className="mt-3 flex-row flex-wrap gap-2">
            {(["all", "pending", "cleared", "high_due"] as const).map((item) => (
              <FilterChip
                key={item}
                active={dueStatus === item}
                label={item === "high_due" ? "High Due" : item}
                onPress={() => {
                  setDueStatus(item);
                  setPage(1);
                }}
              />
            ))}
          </View>
        </View>

        <View className="mt-6 overflow-hidden rounded-[28px] border border-black/8 bg-white">
          <View className="border-b border-black/5 px-5 py-4">
            <Text className="text-[15px] font-semibold text-black">Customers</Text>
            <Text className="mt-0.5 text-[12px] text-black/40">
              Client health and payment standing
            </Text>
          </View>

          {isLoading ? (
            <StateMessage text="Loading customers..." />
          ) : error ? (
            <StateMessage error text={error} />
          ) : customers.length === 0 ? (
            <StateMessage text="No customers found" />
          ) : (
            customers.map((customer, index) => {
              const cleared = customer.due <= 0;

              return (
                <Pressable
                  key={customer.id}
                  onPress={() => onOpenCustomer(customer.id)}
                  className={`px-5 py-4 ${index < customers.length - 1 ? "border-b border-black/5" : ""}`}
                >
                  <View className="flex-row gap-3">
                    <View className="h-11 w-11 items-center justify-center rounded-full bg-[#0f172a]">
                      <Text className="text-[12px] font-semibold text-white">
                        {initialsFor(customer.name)}
                      </Text>
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-center gap-2">
                        <Text className="text-[15px] font-semibold text-black">
                          {customer.name}
                        </Text>
                        <View
                          className={`rounded-full px-2 py-1 ${
                            cleared
                              ? "bg-[#F0FDF4] text-[#15803D]"
                              : "bg-[#FFFBEB] text-[#B45309]"
                          }`}
                        >
                          <Text className="text-[10px] font-semibold">
                            {cleared ? "Cleared" : "Pending"}
                          </Text>
                        </View>
                      </View>
                      <Text className="mt-1 text-[12px] text-black/40">
                        {customer.mobile}
                        {customer.email ? ` · ${customer.email}` : ""}
                      </Text>

                      <View className="mt-3 flex-row flex-wrap gap-4">
                        <InfoBlock label="Orders" value={`${customer.orders}`} />
                        <InfoBlock
                          label="Revenue"
                          value={formatCurrency(customer.totalPayment)}
                        />
                        <InfoBlock label="Due" value={formatCurrency(customer.due)} />
                      </View>

                      <Text className="mt-3 text-[11px] text-black/30">
                        Since {formatDate(customer.createdAt)}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              );
            })
          )}

          {!isLoading && !error && pagination.totalPages > 1 ? (
            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              onNext={() =>
                setPage((current) => Math.min(current + 1, pagination.totalPages))
              }
              onPrev={() => setPage((current) => Math.max(current - 1, 1))}
            />
          ) : null}
        </View>
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

const FilterChip = ({
  active,
  label,
  onPress,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
}) => (
  <Pressable
    onPress={onPress}
    className={`rounded-full px-3 py-2 ${active ? "bg-black" : "bg-black/5"}`}
  >
    <Text
      className={`text-[12px] font-medium ${active ? "text-white" : "text-black/65"}`}
    >
      {label}
    </Text>
  </Pressable>
);

const InfoBlock = ({ label, value }: { label: string; value: string }) => (
  <View>
    <Text className="text-[11px] text-black/30">{label}</Text>
    <Text className="text-[13px] font-semibold text-black">{value}</Text>
  </View>
);

const StateMessage = ({ error, text }: { error?: boolean; text: string }) => (
  <View className="items-center justify-center px-4 py-14">
    <Text className={`text-[14px] ${error ? "text-[#BE123C]" : "text-black/40"}`}>
      {text}
    </Text>
  </View>
);

const Pagination = ({
  onNext,
  onPrev,
  page,
  totalPages,
}: {
  onNext: () => void;
  onPrev: () => void;
  page: number;
  totalPages: number;
}) => (
  <View className="flex-row items-center justify-between border-t border-black/5 px-5 py-4">
    <Pressable
      onPress={onPrev}
      disabled={page === 1}
      className={`rounded-2xl border px-4 py-2 ${page === 1 ? "border-black/5 opacity-40" : "border-black/10"}`}
    >
      <Text className="text-[12px] font-medium text-black">Previous</Text>
    </Pressable>
    <Text className="text-[12px] text-black/45">
      Page {page} of {totalPages}
    </Text>
    <Pressable
      onPress={onNext}
      disabled={page >= totalPages}
      className={`rounded-2xl border px-4 py-2 ${page >= totalPages ? "border-black/5 opacity-40" : "border-black/10"}`}
    >
      <Text className="text-[12px] font-medium text-black">Next</Text>
    </Pressable>
  </View>
);
