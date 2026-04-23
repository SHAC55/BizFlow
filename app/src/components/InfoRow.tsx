import { Text, View } from "react-native";
import { authStyles as styles } from "../styles/authStyles";

type InfoRowProps = {
  label: string;
  value: string;
};

export const InfoRow = ({ label, value }: InfoRowProps) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);
