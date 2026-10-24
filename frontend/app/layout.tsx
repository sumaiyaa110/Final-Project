import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AnomalyX",
  description: "Admin fraud monitoring system",
};

// Applies the saved theme (or the system preference) before the first paint.
const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem("anomalyx-theme");if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
