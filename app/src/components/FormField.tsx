import { MaterialIcons } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { Text, TextInput, View } from "react-native";
import { authStyles as styles } from "../styles/authStyles";

export type FormFieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "phone-pad";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  leading?: "business" | "person" | "phone" | "mail" | "lock";
  trailing?: ReactNode;
};

const getLeadingIcon = (leading?: FormFieldProps["leading"]) => {
  switch (leading) {
    case "business":
      return <MaterialIcons name="business" size={18} color="#9ca3af" />;
    case "person":
      return <MaterialIcons name="person" size={18} color="#9ca3af" />;
    case "phone":
      return <MaterialIcons name="phone" size={18} color="#9ca3af" />;
    case "mail":
      return <MaterialIcons name="email" size={18} color="#9ca3af" />;
    case "lock":
      return <MaterialIcons name="lock" size={18} color="#9ca3af" />;
    default:
      return null;
  }
};

export const FormField = ({
  autoCapitalize = "sentences",
  keyboardType = "default",
  label,
  onChangeText,
  placeholder,
  secureTextEntry,
  value,
  leading,
  trailing,
}: FormFieldProps) => (
  <View style={styles.field}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.inputShell}>
      <View style={styles.leadingIconWrap}>{getLeadingIcon(leading)}</View>
      <TextInput
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        secureTextEntry={secureTextEntry}
        style={styles.input}
        value={value}
      />
      {trailing}
    </View>
  </View>
);
