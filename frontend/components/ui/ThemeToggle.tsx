"use client";

import { LuMoon, LuSun } from "react-icons/lu";
import { setTheme, useTheme } from "@/hooks/useTheme";

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const theme = useTheme();
  const next = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      className={`theme-toggle ${className}`}
      onClick={() => setTheme(next)}
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
    >
      {theme === "dark" ? (
        <LuSun aria-hidden="true" />
      ) : (
        <LuMoon aria-hidden="true" />
      )}
    </button>
  );
}
