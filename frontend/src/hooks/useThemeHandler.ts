import { useEffect } from "react";
import { create } from "zustand";

interface ThemeState {
  isDark: boolean;
  toggleTheme: () => void;
  setIsDark: (val: boolean) => void;
}

export const useTheme = create<ThemeState>((set) => {
  const storedTheme = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const defaultDark = storedTheme ? storedTheme === "dark" : prefersDark;

  return {
    isDark: defaultDark,
    setIsDark: (val) => set({ isDark: val }),
    toggleTheme: () => set((state) => ({ isDark: !state.isDark })),
  };
});

export const useThemeHandler = () => {
  const { isDark, setIsDark } = useTheme();

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e: MediaQueryListEvent) => {
      setIsDark(e.matches);
      localStorage.setItem("theme", e.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [setIsDark]);

  useEffect(() => {
    const theme = isDark ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [isDark]);
};
