import { StatusBar } from "expo-status-bar";
import { Image, Pressable, SafeAreaView, Text, View } from "react-native";
import { InfoRow } from "../components/InfoRow";
import { authAssets } from "../constants/auth";
import type { AuthSession } from "../types/auth";
import { authStyles as styles } from "../styles/authStyles";

type AuthenticatedPageProps = {
  session: AuthSession;
  onLogout: () => Promise<void>;
};

export const AuthenticatedPage = ({
  onLogout,
  session,
}: AuthenticatedPageProps) => (
  <SafeAreaView style={styles.dashboardScreen}>
    <StatusBar style="dark" />
    <View style={styles.dashboardCard}>
      <View style={styles.dashboardHeader}>
        <Image
          source={authAssets.logoImage}
          style={styles.dashboardLogo}
          resizeMode="contain"
        />
        <Text style={styles.dashboardBadge}>Mobile Session</Text>
      </View>

      <Text style={styles.dashboardTitle}>
        {session.user.name || session.user.email || "Authenticated user"}
      </Text>
      <Text style={styles.dashboardSubtitle}>
        Ready to take control of your business? You are signed in.
      </Text>

      <View style={styles.dashboardMeta}>
        <InfoRow label="Provider" value={session.user.provider || "password"} />
        <InfoRow label="Mobile" value={session.user.mobile || "Not set"} />
        <InfoRow
          label="Business"
          value={session.user.business?.name || "Not set"}
        />
      </View>

      {session.needsOnboarding ? (
        <View style={styles.noticeBox}>
          <Text style={styles.noticeTitle}>Onboarding still needed</Text>
          <Text style={styles.noticeBody}>
            This account is authenticated, but some profile fields are still missing.
          </Text>
        </View>
      ) : null}

      <Pressable onPress={onLogout} style={styles.secondaryButton}>
        <Text style={styles.secondaryButtonText}>Log Out</Text>
      </Pressable>
    </View>
  </SafeAreaView>
);
