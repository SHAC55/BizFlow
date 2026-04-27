import { MaterialIcons } from "@expo/vector-icons";
import { useState, type ComponentProps, type ReactNode } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  Text,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../providers/AuthProvider";
import type { RootStackParamList } from "../types/navigation";

const formatMemberSince = (value: string) =>
  new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export const ProfileMenu = () => {
  const { logout, refreshUser, session } = useAuth();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [isOpen, setIsOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const user = session?.user;
  const initials = user?.name?.charAt(0)?.toUpperCase() || "U";

  const openMenu = async () => {
    setIsOpen(true);

    if (!session) return;

    setIsRefreshing(true);
    try {
      await refreshUser();
    } catch {
      // Keep showing the last known session data if refresh fails.
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await logout();
      setIsOpen(false);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      <Pressable
        onPress={openMenu}
        android_ripple={{ color: "rgba(255,255,255,0.1)", borderless: false }}
        style={{
          height: 48,
          width: 48,
          borderRadius: 16,
          backgroundColor: "#111111",
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 1,
          borderColor: "#222222",
        }}
      >
        <Text
          style={{
            fontSize: 16,
            fontWeight: "800",
            color: "#FFFFFF",
          }}
        >
          {initials}
        </Text>
      </Pressable>

      <Modal
        animationType="fade"
        transparent
        visible={isOpen}
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable
          onPress={() => setIsOpen(false)}
          style={{
            flex: 1,
            backgroundColor: "rgba(2, 6, 23, 0.48)",
            paddingTop: insets.top + 18,
            paddingHorizontal: 16,
            justifyContent: "flex-start",
            alignItems: "flex-end",
          }}
        >
          <Pressable
            onPress={() => undefined}
            style={{
              width: "100%",
              maxWidth: 360,
              borderRadius: 28,
              backgroundColor: "#FFFFFF",
              padding: 20,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.16,
              shadowRadius: 24,
              elevation: 12,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Text style={{ fontSize: 18, fontWeight: "800", color: "#0F172A" }}>
                Profile
              </Text>
              {isRefreshing ? (
                <ActivityIndicator size="small" color="#0F172A" />
              ) : null}
            </View>

            <View
              style={{
                marginTop: 16,
                borderRadius: 24,
                backgroundColor: "#0F172A",
                padding: 18,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    height: 56,
                    width: 56,
                    borderRadius: 999,
                    backgroundColor: "#FFFFFF",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ fontSize: 20, fontWeight: "800", color: "#0F172A" }}>
                    {initials}
                  </Text>
                </View>

                <View style={{ marginLeft: 14, flex: 1 }}>
                  <Text style={{ fontSize: 18, fontWeight: "800", color: "#FFFFFF" }}>
                    {user?.name || "User"}
                  </Text>
                  <Text style={{ marginTop: 3, fontSize: 12, color: "rgba(255,255,255,0.72)" }}>
                    {user?.business?.name || "Business not set"}
                  </Text>
                </View>

                {user?.verified ? (
                  <View
                    style={{
                      borderRadius: 999,
                      backgroundColor: "rgba(34,197,94,0.16)",
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                    }}
                  >
                    <Text style={{ fontSize: 11, fontWeight: "700", color: "#86EFAC" }}>
                      Verified
                    </Text>
                  </View>
                ) : null}
              </View>

              <View style={{ marginTop: 16, gap: 10 }}>
                <InfoRow icon="mail" label="Email" value={user?.email || "-"} />
                <InfoRow icon="phone" label="Mobile" value={user?.mobile || "-"} />
                <InfoRow
                  icon="event"
                  label="Member since"
                  value={user?.createdAt ? formatMemberSince(user.createdAt) : "-"}
                />
              </View>
            </View>

            <View style={{ marginTop: 16, gap: 10 }}>
              <ActionRow
                icon="manage-accounts"
                label="View Profile"
                onPress={() => { setIsOpen(false); navigation.navigate("UserDetail"); }}
              />
              <ActionRow
                icon="logout"
                label={isLoggingOut ? "Logging out..." : "Logout"}
                destructive
                trailing={
                  isLoggingOut ? <ActivityIndicator size="small" color="#DC2626" /> : null
                }
                onPress={handleLogout}
              />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};

const InfoRow = ({
  icon,
  label,
  value,
}: {
  icon: ComponentProps<typeof MaterialIcons>["name"];
  label: string;
  value: string;
}) => (
  <View
    style={{
      flexDirection: "row",
      alignItems: "center",
      borderRadius: 18,
      backgroundColor: "rgba(255,255,255,0.08)",
      paddingHorizontal: 12,
      paddingVertical: 12,
    }}
  >
    <MaterialIcons name={icon} size={18} color="#CBD5E1" />
    <View style={{ marginLeft: 10, flex: 1 }}>
      <Text style={{ fontSize: 11, fontWeight: "700", color: "rgba(255,255,255,0.6)" }}>
        {label}
      </Text>
      <Text style={{ marginTop: 2, fontSize: 13, fontWeight: "600", color: "#FFFFFF" }}>
        {value}
      </Text>
    </View>
  </View>
);

const ActionRow = ({
  destructive,
  icon,
  label,
  muted,
  onPress,
  trailing,
}: {
  destructive?: boolean;
  icon: ComponentProps<typeof MaterialIcons>["name"];
  label: string;
  muted?: boolean;
  onPress?: () => void;
  trailing?: ReactNode;
}) => (
  <Pressable
    onPress={onPress}
    android_ripple={{ color: "rgba(0,0,0,0.06)", borderless: false }}
    style={{
      flexDirection: "row",
      alignItems: "center",
      borderRadius: 20,
      borderWidth: 1,
      borderColor: destructive ? "#FECACA" : "#E2E8F0",
      backgroundColor: destructive ? "#FEF2F2" : muted ? "#F8FAFC" : "#FFFFFF",
      paddingHorizontal: 14,
      paddingVertical: 14,
    }}
  >
    <MaterialIcons
      name={icon}
      size={20}
      color={destructive ? "#DC2626" : "#0F172A"}
    />
    <Text
      style={{
        marginLeft: 12,
        flex: 1,
        fontSize: 14,
        fontWeight: "700",
        color: destructive ? "#DC2626" : "#0F172A",
      }}
    >
      {label}
    </Text>
    {trailing}
  </Pressable>
);
