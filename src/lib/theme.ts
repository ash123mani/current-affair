import { createTheme, type MantineColorsTuple, rem } from "@mantine/core";

const warmGray: MantineColorsTuple = [
  "#F2EFE8",
  "#EFECE5",
  "#E8E4DC",
  "#D3D1C7",
  "#B4B2A9",
  "#888780",
  "#5F5E5A",
  "#444441",
  "#2C2C2A",
  "#1A1A18",
];

const terracotta: MantineColorsTuple = [
  "#FDF0E8",
  "#F9D9C3",
  "#F5C4A0",
  "#EFA87A",
  "#E69060",
  "#D97B4F",
  "#C4663C",
  "#A3502C",
  "#7A3E1F",
  "#4A2210",
];

export const theme = createTheme({
  primaryColor: "terracotta",
  primaryShade: { light: 5, dark: 4 },

  colors: { warmGray, gray: warmGray, terracotta },

  white: "#FAFAF8",
  black: "#2C2C2A",

  fontFamily: "var(--font-sans), DM Sans, system-ui, sans-serif",
  fontFamilyMonospace: "var(--font-mono), JetBrains Mono, monospace",

  headings: {
    fontFamily: "var(--font-serif), Lora, Georgia, serif",
    fontWeight: "500",
    sizes: {
      h1: { fontSize: rem(38), lineHeight: "1.15", fontWeight: "500" },
      h2: { fontSize: rem(30), lineHeight: "1.25", fontWeight: "500" },
      h3: { fontSize: rem(24), lineHeight: "1.3", fontWeight: "500" },
      h4: { fontSize: rem(20), lineHeight: "1.4", fontWeight: "500" },
      h5: { fontSize: rem(17), lineHeight: "1.5", fontWeight: "500" },
      h6: { fontSize: rem(15), lineHeight: "1.6", fontWeight: "500" },
    },
  },

  fontSizes: {
    xs: rem(11),
    sm: rem(13),
    md: rem(15),
    lg: rem(17),
    xl: rem(20),
  },

  lineHeights: {
    xs: "1.5",
    sm: "1.6",
    md: "1.7",
    lg: "1.7",
    xl: "1.6",
  },

  spacing: {
    xs: rem(6),
    sm: rem(10),
    md: rem(16),
    lg: rem(24),
    xl: rem(40),
  },

  radius: {
    xs: rem(4),
    sm: rem(6),
    md: rem(10),
    lg: rem(14),
    xl: rem(20),
    pill: rem(9999),
  },
  defaultRadius: "md",

  shadows: {
    xs: "none",
    sm: "none",
    md: "none",
    lg: "none",
    xl: "none",
  },

  components: {
    AppShell: {
      styles: { main: { backgroundColor: "#F2EFE8" } },
    },
    AppShellHeader: {
      styles: {
        header: {
          backgroundColor: "#EFECE5",
          borderBottom: "0.5px solid #D3D1C7",
          boxShadow: "none",
        },
      },
    },
    Button: {
      defaultProps: { radius: "pill", size: "sm" },
      styles: {
        root: {
          fontWeight: 500,
          letterSpacing: "0.01em",
        },
      },
    },
    TextInput: {
      defaultProps: { radius: "pill" },
      styles: {
        input: {
          backgroundColor: "#FAFAF8",
          border: "0.5px solid #D3D1C7",
          color: "#2C2C2A",
          "&::placeholder": { color: "#888780" },
          "&:focus": { borderColor: "#B4B2A9" },
        },
      },
    },
    Textarea: {
      defaultProps: { radius: "md" },
      styles: {
        input: {
          backgroundColor: "#FAFAF8",
          border: "0.5px solid #D3D1C7",
          color: "#2C2C2A",
          "&::placeholder": { color: "#888780" },
          "&:focus": { borderColor: "#B4B2A9" },
        },
      },
    },
    PasswordInput: {
      defaultProps: { radius: "pill" },
      styles: {
        input: {
          backgroundColor: "#FAFAF8",
          border: "0.5px solid #D3D1C7",
        },
      },
    },
    Select: {
      defaultProps: { radius: "md" },
      styles: {
        input: {
          backgroundColor: "#FAFAF8",
          border: "0.5px solid #D3D1C7",
          color: "#2C2C2A",
        },
        dropdown: {
          backgroundColor: "#FAFAF8",
          border: "0.5px solid #D3D1C7",
          boxShadow: "none",
        },
        option: {
          "&[data-selected]": {
            backgroundColor: "#F5C4A0",
            color: "#7A3E1F",
          },
          "&:hover": { backgroundColor: "#EFECE5" },
        },
      },
    },
    Card: {
      defaultProps: { radius: "lg", p: "lg" },
      styles: {
        root: {
          backgroundColor: "#FFFFFF",
          border: "0.5px solid #D3D1C7",
          boxShadow: "none",
        },
      },
    },
    Paper: {
      defaultProps: { radius: "lg" },
      styles: {
        root: {
          backgroundColor: "#FAFAF8",
          border: "0.5px solid #D3D1C7",
          boxShadow: "none",
        },
      },
    },
    Badge: {
      defaultProps: { radius: "pill", variant: "outline", size: "sm" },
      styles: {
        root: {
          backgroundColor: "#EFECE5",
          borderColor: "#D3D1C7",
          borderWidth: "0.5px",
          color: "#5F5E5A",
          fontWeight: 500,
          letterSpacing: "0.04em",
          textTransform: "none",
        },
      },
    },
    Divider: {
      styles: { root: { borderColor: "#D3D1C7", borderTopWidth: "0.5px" } },
    },
    NavLink: {
      defaultProps: { radius: "md" },
      styles: {
        root: {
          color: "#5F5E5A",
          fontSize: rem(13),
          "&:hover": { backgroundColor: "#EFECE5", color: "#2C2C2A" },
          "&[data-active]": {
            backgroundColor: "#E8E4DC",
            color: "#2C2C2A",
            fontWeight: 500,
          },
        },
      },
    },
    Tabs: {
      styles: {
        tab: {
          fontSize: rem(13),
          color: "#888780",
          borderBottomWidth: "0.5px",
          "&:hover": { color: "#2C2C2A", backgroundColor: "transparent" },
          "&[data-active]": {
            color: "#2C2C2A",
            borderBottomColor: "#D97B4F",
            fontWeight: 500,
          },
        },
        list: { borderBottomWidth: "0.5px", borderBottomColor: "#D3D1C7" },
      },
    },
    Tooltip: {
      defaultProps: { radius: "md" },
      styles: {
        tooltip: {
          backgroundColor: "#2C2C2A",
          color: "#FAFAF8",
          fontSize: rem(12),
          boxShadow: "none",
        },
      },
    },
    Menu: {
      styles: {
        dropdown: {
          backgroundColor: "#FAFAF8",
          border: "0.5px solid #D3D1C7",
          boxShadow: "none",
          borderRadius: rem(10),
        },
        item: {
          fontSize: rem(13),
          color: "#5F5E5A",
          "&:hover": { backgroundColor: "#EFECE5", color: "#2C2C2A" },
        },
        divider: { borderColor: "#D3D1C7", borderTopWidth: "0.5px" },
      },
    },
    Modal: {
      defaultProps: { radius: "lg" },
      styles: {
        content: {
          backgroundColor: "#FAFAF8",
          border: "0.5px solid #D3D1C7",
          boxShadow: "none",
        },
        header: {
          backgroundColor: "#EFECE5",
          borderBottom: "0.5px solid #D3D1C7",
        },
        title: { fontFamily: "var(--font-serif)", fontWeight: 500 },
        overlay: { backgroundColor: "rgba(44, 44, 42, 0.35)" },
      },
    },
    Notification: {
      defaultProps: { radius: "lg" },
      styles: {
        root: {
          backgroundColor: "#FAFAF8",
          border: "0.5px solid #D3D1C7",
          boxShadow: "none",
        },
      },
    },
    Table: {
      styles: {
        thead: { borderBottom: "0.5px solid #D3D1C7" },
        th: { fontSize: rem(12), color: "#888780", fontWeight: 500, letterSpacing: "0.04em" },
        td: { fontSize: rem(13), color: "#2C2C2A", borderBottom: "0.5px solid #D3D1C7" },
        tr: { "&:hover td": { backgroundColor: "#F2EFE8" } },
      },
    },
    Accordion: {
      styles: {
        item: { border: "0.5px solid #D3D1C7", borderRadius: rem(10), marginBottom: rem(6) },
        control: { fontSize: rem(14), color: "#2C2C2A", "&:hover": { backgroundColor: "#EFECE5" } },
        content: { fontSize: rem(13), color: "#5F5E5A" },
        chevron: { color: "#888780" },
      },
    },
  },
});
