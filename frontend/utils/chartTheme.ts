import type { Theme } from "@/hooks/useTheme";

// Neutral colors for Plotly charts, which can't read CSS variables.
export function chartColors(theme: Theme) {
  return theme === "dark"
    ? {
        text: "#d5d9df",
        muted: "#9097a3",
        grid: "#2a2e36",
        hoverBg: "#1f232a",
        hoverBorder: "#363b45",
        hoverText: "#e6e8eb",
        separator: "#171a1f",
        bar: "#5b86c9",
      }
    : {
        text: "#272a2f",
        muted: "#606776",
        grid: "#e3e5e8",
        hoverBg: "#ffffff",
        hoverBorder: "#dfe1e5",
        hoverText: "#272a2f",
        separator: "#ffffff",
        bar: "#3d5a80",
      };
}
