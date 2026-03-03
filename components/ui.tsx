import { COLORS } from "@/styles/theme";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

export function Screen({
  children,
  scroll = false,
  contentStyle,
}: {
  children: React.ReactNode;
  scroll?: boolean;
  contentStyle?: ViewStyle;
}) {
  if (scroll) {
    return (
      <ScrollView
        style={styles.screen}
        contentContainerStyle={[styles.screenContent, contentStyle]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    );
  }

  return (
    <View style={[styles.screen, styles.screenContent, contentStyle]}>
      {children}
    </View>
  );
}

export function Card({ children }: { children: React.ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

export function Label({ children }: { children: React.ReactNode }) {
  return <Text style={styles.label}>{children}</Text>;
}

export function AppInput(props: React.ComponentProps<typeof TextInput>) {
  return (
    <TextInput
      {...props}
      style={[styles.input, props.style]}
      placeholderTextColor="#6B7280"
    />
  );
}

export function PrimaryButton({
  title,
  onPress,
  disabled,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={disabled}
      style={[styles.btn, disabled && { opacity: 0.6 }]}
    >
      <Text style={styles.btnText}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  screenContent: {
    padding: 20,
    paddingTop: 30,
    alignItems: "center",
    paddingBottom: 30,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: COLORS.card,
    borderRadius: 22,
    padding: 18,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  label: {
    color: COLORS.textDark,
    fontWeight: "800",
    fontSize: 13,
    marginBottom: 6,
  },
  input: {
    width: "100%",
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  btn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 6,
  },
  btnText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 15,
  },
});
