import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../providers/AuthProvider";
import type { AppRoute } from "../types/navigation";

type UserDetailPageProps = {
  onBack: () => void;
  onNavigate: (route: AppRoute) => void;
};

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const initialsFor = (name: string) =>
  name
    .split(" ")
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2);

export const UserDetailPage = ({ onBack, onNavigate }: UserDetailPageProps) => {
  const { session, refreshUser } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const user = session?.user;
  const business = user?.business as
    | {
        name?: string;
        gstNumber?: string;
        address?: string;
        type?: string;
      }
    | undefined;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshUser();
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <AppLayout
      currentRoute="dashboard"
      onNavigate={onNavigate}
      title="My Profile"
      subtitle="Account & business details"
    >
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pb-28 pt-3"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Back button */}
        <View className="mb-4">
          <Pressable
            onPress={onBack}
            android_ripple={{ color: "rgba(0,0,0,0.08)", borderless: false }}
            className="flex-row items-center gap-2 self-start rounded-2xl border border-black/10 bg-white px-4 py-3"
          >
            <MaterialIcons name="arrow-back" size={18} color="#000" />
            <Text className="font-medium text-black">Back</Text>
          </Pressable>
        </View>

        {isRefreshing && !user ? (
          <View className="flex-1 items-center justify-center py-20">
            <ActivityIndicator size="large" color="#000" />
          </View>
        ) : user ? (
          <>
            {/* Avatar hero */}
            <View className="rounded-[28px] bg-black px-5 py-6 mb-5">
              <View className="flex-row items-center gap-4">
                <View className="h-16 w-16 items-center justify-center rounded-2xl bg-white/10">
                  <Text className="text-[22px] font-bold text-white">
                    {initialsFor(user.name ?? "U")}
                  </Text>
                </View>

                <View className="flex-1">
                  <Text className="text-[22px] font-bold text-white leading-tight">
                    {user.name}
                  </Text>
                  <Text className="mt-1 text-[13px] text-white/55">
                    {business?.name ?? "No business set"}
                  </Text>
                </View>

                {user.verified ? (
                  <View className="rounded-full bg-green-500/20 px-3 py-1.5">
                    <Text className="text-[11px] font-bold text-green-300">
                      Verified
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>

            {/* Personal info */}
            <InfoCard title="Personal Information">
              <InfoRow icon="mail" label="Email" value={user.email ?? "-"} />
              <InfoRow icon="phone" label="Mobile" value={user.mobile ?? "-"} />
              <InfoRow
                icon="event"
                label="Member Since"
                value={user.createdAt ? formatDate(user.createdAt) : "-"}
              />
            </InfoCard>

            {/* Business info */}
            {business ? (
              <InfoCard title="Business Details">
                <InfoRow
                  icon="storefront"
                  label="Business Name"
                  value={business.name ?? "-"}
                />
                <InfoRow
                  icon="receipt"
                  label="GST Number"
                  value={business.gstNumber ?? "-"}
                />
                <InfoRow
                  icon="location-on"
                  label="Address"
                  value={business.address ?? "-"}
                />
                {business.type ? (
                  <InfoRow
                    icon="business"
                    label="Business Type"
                    value={business.type}
                  />
                ) : null}
              </InfoCard>
            ) : null}
          </>
        ) : (
          <Text className="py-20 text-center text-black/40">
            No profile data available
          </Text>
        )}
      </ScrollView>
    </AppLayout>
  );
};

const InfoCard = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <View className="mb-5 rounded-[28px] border border-black/10 bg-white p-5">
    <Text className="mb-4 text-[16px] font-semibold text-black">{title}</Text>
    <View className="gap-3">{children}</View>
  </View>
);

const InfoRow = ({
  icon,
  label,
  value,
}: {
  icon: React.ComponentProps<typeof MaterialIcons>["name"];
  label: string;
  value: string;
}) => (
  <View className="flex-row items-start gap-3 rounded-2xl bg-zinc-50 px-4 py-4">
    <MaterialIcons name={icon} size={18} color="#555" style={{ marginTop: 1 }} />
    <View className="flex-1">
      <Text className="text-[11px] uppercase text-black/35">{label}</Text>
      <Text className="mt-1 text-[14px] text-black">{value}</Text>
    </View>
  </View>
);