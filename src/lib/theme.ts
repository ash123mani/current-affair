// theme.ts — Cosmic Pulse Quiz App
// Full Mantine v7 theme configuration
// Usage: <MantineProvider theme={theme} forceColorScheme="dark">

import {
  createTheme,
  MantineColorsTuple,
  MantineThemeOverride,
  rem,
} from "@mantine/core";

// ─── Color Palettes ───────────────────────────────────────────────────────────

const violet: MantineColorsTuple = [
  "#f5f3ff", // [0] lightest tint
  "#ede9fe", // [1]
  "#ddd6fe", // [2]
  "#c4b5fd", // [3]
  "#a78bfa", // [4]
  "#8b5cf6", // [5]
  "#7c3aed", // [6] ← primaryShade.dark  (buttons, focus rings)
  "#6d28d9", // [7] ← primaryShade.light
  "#5b21b6", // [8]
  "#4c1d95", // [9] darkest
];

// Remapped dark scale: deep indigo-purple instead of Mantine's default grays
const dark: MantineColorsTuple = [
  "#e2d9ff", // [0] bright heading text
  "#c9b8f5", // [1] body text
  "#9b8ec4", // [2] muted / secondary text
  "#6b5f9e", // [3] placeholder text
  "#4e3d8c", // [4] disabled
  "#3d2b7a", // [5] border / divider
  "#2e1f65", // [6] hover surface
  "#241850", // [7] card / surface background
  "#1e1440", // [8] elevated / navbar background
  "#1a1133", // [9] app background (body)
];

// Accent colors used for quiz feedback and gamification
const quizGreen: MantineColorsTuple = [
  "#ecfdf5",
  "#d1fae5",
  "#a7f3d0",
  "#6ee7b7",
  "#34d399",
  "#10b981",
  "#3ecf8e", // [6] correct-answer highlight
  "#059669",
  "#047857",
  "#065f46",
];

const quizRed: MantineColorsTuple = [
  "#fef2f2",
  "#fee2e2",
  "#fecaca",
  "#fca5a5",
  "#f87171", // [4] wrong-answer highlight
  "#ef4444",
  "#dc2626",
  "#b91c1c",
  "#991b1b",
  "#7f1d1d",
];

const quizAmber: MantineColorsTuple = [
  "#fffbeb",
  "#fef3c7",
  "#fde68a",
  "#fcd34d",
  "#facc15", // [4] streak / XP gold
  "#f59e0b",
  "#d97706",
  "#b45309",
  "#92400e",
  "#78350f",
];

// ─── Theme ────────────────────────────────────────────────────────────────────

export const theme: MantineThemeOverride = createTheme({
  // Color scheme
  primaryColor: "violet",
  primaryShade: { light: 7, dark: 6 },

  colors: {
    violet,
    dark,
    quizGreen,
    quizRed,
    quizAmber,
  },

  // ─── Typography ─────────────────────────────────────────────────────────────

  fontFamily: "'Inter', 'Nunito', system-ui, sans-serif",
  fontFamilyMonospace: "'JetBrains Mono', 'Fira Code', monospace",

  fontSizes: {
    xs: rem(11),
    sm: rem(13),
    md: rem(15),
    lg: rem(17),
    xl: rem(20),
  },

  lineHeights: {
    xs: "1.4",
    sm: "1.45",
    md: "1.55",
    lg: "1.6",
    xl: "1.65",
  },

  headings: {
    fontFamily: "'Inter', 'Nunito', system-ui, sans-serif",
    fontWeight: "700",
    sizes: {
      h1: { fontSize: rem(32), lineHeight: "1.2", fontWeight: "800" },
      h2: { fontSize: rem(24), lineHeight: "1.3", fontWeight: "700" },
      h3: { fontSize: rem(20), lineHeight: "1.35", fontWeight: "600" },
      h4: { fontSize: rem(17), lineHeight: "1.4", fontWeight: "600" },
      h5: { fontSize: rem(15), lineHeight: "1.45", fontWeight: "600" },
      h6: { fontSize: rem(13), lineHeight: "1.5", fontWeight: "600" },
    },
  },

  // ─── Spacing & Radius ───────────────────────────────────────────────────────

  spacing: {
    xs: rem(6),
    sm: rem(10),
    md: rem(16),
    lg: rem(22),
    xl: rem(32),
  },

  radius: {
    xs: rem(4),
    sm: rem(8),
    md: rem(12),
    lg: rem(16),
    xl: rem(24),
  },

  defaultRadius: "md",

  // ─── Breakpoints ────────────────────────────────────────────────────────────

  breakpoints: {
    xs: "30em",  // 480px
    sm: "40em",  // 640px
    md: "48em",  // 768px
    lg: "64em",  // 1024px
    xl: "80em",  // 1280px
  },

  // ─── Other ──────────────────────────────────────────────────────────────────

  cursorType: "pointer",
  focusRing: "auto",
  respectReducedMotion: true,

  // ─── Component Overrides ────────────────────────────────────────────────────

  components: {

    // App shell / layout
    AppShell: {
      defaultProps: {
        padding: "md",
      },
      styles: {
        main: {
          background: "var(--mantine-color-dark-9)",
          minHeight: "100vh",
        },
      },
    },

    // Card — quiz category tiles, result panels, leaderboard
    Card: {
      defaultProps: {
        radius: "lg",
        withBorder: true,
        padding: "lg",
      },
      styles: {
        root: {
          backgroundColor: "var(--mantine-color-dark-7)",
          borderColor: "var(--mantine-color-dark-5)",
          transition: "border-color 150ms ease, background-color 150ms ease",
          "&:hover": {
            borderColor: "var(--mantine-color-violet-6)",
            backgroundColor: "var(--mantine-color-dark-6)",
          },
        },
      },
    },

    // Paper — generic surface (modals, sections)
    Paper: {
      defaultProps: {
        radius: "md",
        withBorder: true,
      },
      styles: {
        root: {
          backgroundColor: "var(--mantine-color-dark-7)",
          borderColor: "var(--mantine-color-dark-5)",
        },
      },
    },

    // Button — primary CTA, answer options, navigation
    Button: {
      defaultProps: {
        radius: "md",
        size: "md",
      },
      styles: {
        root: {
          fontWeight: 600,
          letterSpacing: "0.01em",
          transition: "transform 120ms ease, opacity 120ms ease",
          "&:active": {
            transform: "scale(0.97)",
          },
        },
      },
    },

    // Badge — category labels, difficulty tags, streak
    Badge: {
      defaultProps: {
        radius: "xl",
        variant: "filled",
      },
      styles: {
        root: {
          fontWeight: 600,
          letterSpacing: "0.03em",
          textTransform: "none",
          fontSize: rem(11),
        },
      },
    },

    // Progress — XP bar, question progress
    Progress: {
      defaultProps: {
        radius: "xl",
        color: "violet",
        size: "sm",
      },
      styles: {
        root: {
          backgroundColor: "var(--mantine-color-dark-5)",
        },
      },
    },

    // RingProgress — score circle, timer ring
    RingProgress: {
      defaultProps: {
        roundCaps: true,
      },
    },

    // TextInput — search, name entry
    TextInput: {
      defaultProps: {
        radius: "md",
      },
      styles: {
        input: {
          backgroundColor: "var(--mantine-color-dark-7)",
          borderColor: "var(--mantine-color-dark-5)",
          color: "var(--mantine-color-dark-0)",
          "&::placeholder": {
            color: "var(--mantine-color-dark-3)",
          },
          "&:focus": {
            borderColor: "var(--mantine-color-violet-5)",
          },
        },
        label: {
          color: "var(--mantine-color-dark-2)",
          marginBottom: rem(6),
          fontSize: rem(13),
          fontWeight: 500,
        },
      },
    },

    // Select — difficulty, category dropdowns
    Select: {
      defaultProps: {
        radius: "md",
      },
      styles: {
        input: {
          backgroundColor: "var(--mantine-color-dark-7)",
          borderColor: "var(--mantine-color-dark-5)",
          color: "var(--mantine-color-dark-0)",
          "&:focus": {
            borderColor: "var(--mantine-color-violet-5)",
          },
        },
        dropdown: {
          backgroundColor: "var(--mantine-color-dark-7)",
          borderColor: "var(--mantine-color-dark-5)",
        },
        option: {
          color: "var(--mantine-color-dark-1)",
          "&[data-selected]": {
            backgroundColor: "var(--mantine-color-violet-6)",
            color: "#fff",
          },
          "&[data-hovered]": {
            backgroundColor: "var(--mantine-color-dark-6)",
          },
        },
      },
    },

    // Modal — settings, result detail
    Modal: {
      defaultProps: {
        radius: "lg",
        centered: true,
        overlayProps: { blur: 4, opacity: 0.6 },
      },
      styles: {
        content: {
          backgroundColor: "var(--mantine-color-dark-8)",
          border: "1px solid var(--mantine-color-dark-5)",
        },
        header: {
          backgroundColor: "var(--mantine-color-dark-8)",
          borderBottom: "1px solid var(--mantine-color-dark-5)",
        },
        title: {
          color: "var(--mantine-color-dark-0)",
          fontWeight: 600,
        },
        close: {
          color: "var(--mantine-color-dark-2)",
          "&:hover": { backgroundColor: "var(--mantine-color-dark-6)" },
        },
      },
    },

    // Tabs — home navigation tabs
    Tabs: {
      defaultProps: {
        radius: "md",
        variant: "pills",
      },
      styles: {
        tab: {
          color: "var(--mantine-color-dark-2)",
          fontWeight: 500,
          "&[data-active]": {
            backgroundColor: "var(--mantine-color-dark-6)",
            color: "var(--mantine-color-dark-0)",
          },
          "&:hover": {
            backgroundColor: "var(--mantine-color-dark-7)",
          },
        },
      },
    },

    // Notification — correct/wrong feedback toasts
    Notification: {
      defaultProps: {
        radius: "md",
        withBorder: true,
      },
      styles: {
        root: {
          backgroundColor: "var(--mantine-color-dark-7)",
          borderColor: "var(--mantine-color-dark-5)",
        },
        title: {
          color: "var(--mantine-color-dark-0)",
          fontWeight: 600,
        },
        description: {
          color: "var(--mantine-color-dark-2)",
        },
      },
    },

    // Tooltip
    Tooltip: {
      defaultProps: {
        radius: "sm",
        withArrow: true,
      },
      styles: {
        tooltip: {
          backgroundColor: "var(--mantine-color-dark-5)",
          color: "var(--mantine-color-dark-0)",
          fontSize: rem(12),
          fontWeight: 500,
        },
      },
    },

    // Divider
    Divider: {
      styles: {
        root: {
          borderColor: "var(--mantine-color-dark-5)",
        },
      },
    },

    // ActionIcon — icon-only buttons
    ActionIcon: {
      defaultProps: {
        radius: "md",
        variant: "subtle",
        color: "dark.2",
      },
      styles: {
        root: {
          "&:hover": {
            backgroundColor: "var(--mantine-color-dark-6)",
            color: "var(--mantine-color-dark-0)",
          },
        },
      },
    },

    // Avatar — leaderboard player avatars
    Avatar: {
      defaultProps: {
        radius: "xl",
        color: "violet",
        variant: "filled",
      },
    },

    // Loader — spinner during question fetch
    Loader: {
      defaultProps: {
        color: "violet",
        type: "dots",
      },
    },
  },
});
