import {
  DARK_TAB_THEME,
  LIGHT_TAB_THEME,
  TabTheme,
} from "@/styles/theme";
import * as SecureStore from "expo-secure-store";
import React, { createContext, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "student-tab-theme";

type TabThemeContextValue = {
  isDark: boolean;
  theme: TabTheme;
  toggleTheme: () => void;
  setDarkMode: (value: boolean) => void;
};

const TabThemeContext = createContext<TabThemeContextValue | null>(null);

export function TabThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadTheme = async () => {
      try {
        const stored = await SecureStore.getItemAsync(STORAGE_KEY);
        if (mounted && stored !== null) {
          setIsDark(stored === "dark");
        }
      } catch {
        // Ignore storage errors and fall back to light mode.
      }
    };

    loadTheme();

    return () => {
      mounted = false;
    };
  }, []);

  const setDarkMode = (value: boolean) => {
    setIsDark(value);
    void SecureStore.setItemAsync(STORAGE_KEY, value ? "dark" : "light");
  };

  const toggleTheme = () => {
    setDarkMode(!isDark);
  };

  const value = {
    isDark,
    theme: isDark ? DARK_TAB_THEME : LIGHT_TAB_THEME,
    toggleTheme,
    setDarkMode,
  };

  return (
    <TabThemeContext.Provider value={value}>
      {children}
    </TabThemeContext.Provider>
  );
}

export function useTabTheme() {
  const context = useContext(TabThemeContext);

  if (!context) {
    return {
      isDark: false,
      theme: LIGHT_TAB_THEME,
      toggleTheme: () => {},
      setDarkMode: () => {},
    };
  }

  return context;
}
