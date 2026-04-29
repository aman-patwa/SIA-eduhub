import { COLORS } from "@/styles/theme";
import { useTabTheme } from "@/provider/TabThemeProvider";
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
  style,
}: {
  children: React.ReactNode;
  scroll?: boolean;
  contentStyle?: ViewStyle;
  style?: ViewStyle;
}) {
  const { theme } = useTabTheme();

  if (scroll) {
    return (
      <ScrollView
        style={[styles.screen, { backgroundColor: theme.screenBg }, style]}
        contentContainerStyle={[styles.screenContent, contentStyle]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    );
  }

  return (
    <View
      style={[
        styles.screen,
        { backgroundColor: theme.screenBg },
        style,
        styles.screenContent,
        contentStyle,
      ]}
    >
      {children}
    </View>
  );
}

export function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  const { theme } = useTabTheme();

  return <View style={[styles.card, { backgroundColor: theme.cardBg }, style]}>{children}</View>;
}

export function Label({ children }: { children: React.ReactNode }) {
  const { theme } = useTabTheme();

  return <Text style={[styles.label, { color: theme.textPrimary }]}>{children}</Text>;
}

export function AppInput(props: React.ComponentProps<typeof TextInput>) {
  const { theme } = useTabTheme();

  return (
    <TextInput
      {...props}
      style={[
        styles.input,
        {
          backgroundColor: theme.surfaceStrong,
          borderColor: theme.surfaceBorder,
          color: theme.surfaceText,
        },
        props.style,
      ]}
      placeholderTextColor={theme.textMuted}
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
  const { theme } = useTabTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.btn,
        { backgroundColor: theme.tabBarActive },
        disabled && { opacity: 0.6 },
      ]}
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
