import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/dates/styles.css";
import type { Metadata } from "next";
import { createTheme, MantineProvider, Box } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { AuthProvider } from "@/lib/auth.provider";
import { Navbar } from "@/components/layout/Navbar";
import { PageTransition } from "@/components/layout/PageTransition";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import "./globals.css";

export const metadata: Metadata = {
  title: "CurrentAffair — Daily Current Affairs Quiz",
  description: "Generate quizzes from live Indian news. Pick a date, choose topics, and test yourself.",
};

const theme = createTheme({
  primaryColor: "indigo",
  defaultRadius: "md",
  fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontFamilyMonospace: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace',
  headings: {
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontWeight: "700",
  },
  colors: {
    indigo: [
      "#f0f0ff",
      "#d9d9ff",
      "#b3b3ff",
      "#8585ff",
      "#5c5cff",
      "#4f46e5",
      "#4338ca",
      "#3730a3",
      "#312e81",
      "#1e1b4b",
    ],
  },
  shadows: {
    xs: "0 1px 2px rgba(0,0,0,0.03)",
    sm: "0 2px 8px rgba(0,0,0,0.04)",
    md: "0 4px 16px rgba(0,0,0,0.06)",
    lg: "0 8px 32px rgba(0,0,0,0.08)",
    xl: "0 12px 48px rgba(0,0,0,0.1)",
  },
  spacing: {
    xs: "4px",
    sm: "8px",
    md: "16px",
    lg: "24px",
    xl: "32px",
  },
  radius: {
    sm: "6px",
    md: "10px",
    lg: "16px",
    xl: "24px",
  },
  primaryShade: 6,
  components: {
    Paper: {
      defaultProps: { withBorder: true, shadow: "sm" },
      styles: { root: { backdropFilter: "blur(8px)" } },
    },
    Card: { defaultProps: { withBorder: true, shadow: "sm" } },
    Button: {
      defaultProps: { radius: "md", size: "sm" },
      styles: { root: { fontWeight: 600, letterSpacing: "-0.01em" } },
    },
    Badge: { defaultProps: { radius: "md" } },
    Alert: { defaultProps: { variant: "light", radius: "md" } },
    TextInput: { defaultProps: { radius: "md" } },
    Select: { defaultProps: { radius: "md" } },
  },
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <MantineProvider theme={theme} defaultColorScheme="light">
          <AuthProvider>
            <Notifications position="top-right" />
            <Navbar />
            <Box component="main" mih="calc(100vh - 64px)">
              <ErrorBoundary>
                <PageTransition>{children}</PageTransition>
              </ErrorBoundary>
            </Box>
          </AuthProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
