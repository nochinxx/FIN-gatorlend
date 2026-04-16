import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AppHeader } from "@/components/AppHeader";

export const metadata: Metadata = {
  title: "FIN GatorLend",
  description: "XRPL campus tokenization platform scaffold for textbook-backed XLS-20 assets."
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily:
            'ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          background: "#ffffff",
          color: "#111111"
        }}
      >
        <AppHeader />
        {children}
      </body>
    </html>
  );
}
