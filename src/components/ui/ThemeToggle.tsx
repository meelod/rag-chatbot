import React from "react";
import { useTheme } from "../../hooks/useTheme";
import { cn } from "../../lib/utils";

interface ThemeToggleProps {
    className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
    const { theme, setTheme } = useTheme();

    return (
        <div className={cn("flex items-center", className)}>
            <div className="flex items-center gap-0.5 p-0.5 bg-white/10 rounded-lg">
                {/* Light */}
                <button
                    onClick={() => setTheme("light")}
                    className={cn(
                        "p-1.5 rounded-md transition-all",
                        theme === "light"
                            ? "bg-white/20 text-white"
                            : "text-white/60 hover:text-white/80"
                    )}
                    aria-label="Light mode"
                    title="Light mode"
                >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                </button>

                {/* Dark */}
                <button
                    onClick={() => setTheme("dark")}
                    className={cn(
                        "p-1.5 rounded-md transition-all",
                        theme === "dark"
                            ? "bg-white/20 text-white"
                            : "text-white/60 hover:text-white/80"
                    )}
                    aria-label="Dark mode"
                    title="Dark mode"
                >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                </button>

                {/* System */}
                <button
                    onClick={() => setTheme("system")}
                    className={cn(
                        "p-1.5 rounded-md transition-all",
                        theme === "system"
                            ? "bg-white/20 text-white"
                            : "text-white/60 hover:text-white/80"
                    )}
                    aria-label="System theme"
                    title="System theme"
                >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                </button>
            </div>
        </div>
    );
}

export default ThemeToggle;
