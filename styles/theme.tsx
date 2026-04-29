export const COLORS = {
  bg: "#E6F0FF",
  infoBox: "#CDE2FF",
  card: "#BFD8FF",
  inputBg: "#E8ECF1",
  primary: "#4C74E6",
  textDark: "#002B5B",
  text: "#123A63",
  link: "#0047AB",
  border: "rgba(0,0,0,0.08)",
};

export const LIGHT_TAB_THEME = {
  mode: "light" as const,
  screenBg: COLORS.bg,
  cardBg: COLORS.card,
  textPrimary: COLORS.textDark,
  textSecondary: COLORS.text,
  textMuted: "#475569",
  surface: "rgba(255,255,255,0.55)",
  surfaceStrong: "#FFFFFF",
  surfaceBorder: COLORS.border,
  surfaceText: "#111827",
  toggleBg: "#D8E6FF",
  toggleIcon: COLORS.primary,
  link: COLORS.link,
  progressTrack: "#E5E7EB",
  tabBarBg: "#FFFFFF",
  tabBarActive: COLORS.primary,
  tabBarInactive: "#64748B",
};

export const DARK_TAB_THEME = {
  mode: "dark" as const,
  screenBg: "#081120",
  cardBg: "#11243B",
  textPrimary: "#F8FAFC",
  textSecondary: "#B7C8E6",
  textMuted: "#94A3B8",
  surface: "#162C47",
  surfaceStrong: "#1C3554",
  surfaceBorder: "rgba(148, 163, 184, 0.28)",
  surfaceText: "#E2E8F0",
  toggleBg: "#1E3A5F",
  toggleIcon: "#93C5FD",
  link: "#93C5FD",
  progressTrack: "#334155",
  tabBarBg: "#0F1E33",
  tabBarActive: "#93C5FD",
  tabBarInactive: "#94A3B8",
};

export type TabTheme = typeof LIGHT_TAB_THEME | typeof DARK_TAB_THEME;
