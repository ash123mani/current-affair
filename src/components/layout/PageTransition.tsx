"use client";

import { usePathname } from "next/navigation";
import { Box } from "@mantine/core";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <Box key={pathname} className="animate-up">
      {children}
    </Box>
  );
}
