import { Box } from "@mantine/core";

export function LogoMark({ size = 28 }: { size?: number }) {
  const s = size;
  const fontSize = Math.round(s * 0.43);
  const radius = Math.round(s * 0.29);
  return (
    <Box
      style={{
        width: s, height: s, borderRadius: radius,
        background: "#D97B4F",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "white", fontWeight: 700, fontSize,
        letterSpacing: "-0.02em", flexShrink: 0,
      }}
    >
      CA
    </Box>
  );
}
