import { ActivityIndicator, Modal, View } from "react-native";

export const SubmitOverlay = ({ visible }: { visible: boolean }) => (
  <Modal transparent animationType="none" visible={visible} statusBarTranslucent>
    <View
      style={{
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.35)",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <View
        style={{
          backgroundColor: "#fff",
          borderRadius: 20,
          padding: 28,
          alignItems: "center",
          justifyContent: "center",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.12,
          shadowRadius: 16,
          elevation: 8,
        }}
      >
        <ActivityIndicator size="large" color="#111" />
      </View>
    </View>
  </Modal>
);
