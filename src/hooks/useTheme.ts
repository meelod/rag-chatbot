import { useState, useEffect, useCallback } from "react";

type Theme = "light" | "dark" | "system";

const STORAGE_KEY = "theme-preference";

function getSystemTheme(): "light" | "dark" {
    if (typeof window === "undefined") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getStoredTheme(): Theme {
    if (typeof window === "undefined") return "system";
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark" || stored === "system") {
        return stored;
    }
    return "system";
}

export function useTheme() {
    const [theme, setThemeState] = useState<Theme>(getStoredTheme);
    const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">(
        theme === "system" ? getSystemTheme() : theme
    );

    // Apply theme to document
    useEffect(() => {
        const root = document.documentElement;
        const resolved = theme === "system" ? getSystemTheme() : theme;

        root.classList.remove("light", "dark");
        root.classList.add(resolved);
        setResolvedTheme(resolved);

        // Save to localStorage
        localStorage.setItem(STORAGE_KEY, theme);
    }, [theme]);

    // Listen for system theme changes
    useEffect(() => {
        if (theme !== "system") return;

        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

        const handleChange = (e: MediaQueryListEvent) => {
            const newTheme = e.matches ? "dark" : "light";
            document.documentElement.classList.remove("light", "dark");
            document.documentElement.classList.add(newTheme);
            setResolvedTheme(newTheme);
        };

        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
    }, [theme]);

    const setTheme = useCallback((newTheme: Theme) => {
        setThemeState(newTheme);
    }, []);

    const toggleTheme = useCallback(() => {
        setThemeState((current) => {
            if (current === "light") return "dark";
            if (current === "dark") return "system";
            return "light";
        });
    }, []);

    return {
        theme,
        resolvedTheme,
        setTheme,
        toggleTheme,
        isDark: resolvedTheme === "dark",
    };
}
