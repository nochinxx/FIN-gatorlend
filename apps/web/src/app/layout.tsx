import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AppHeader } from "@/components/AppHeader";
import { FeedbackButton } from "@/components/FeedbackButton";
import { FOOTER_DISCLAIMER } from "@/lib/marketing/publicContent";

export const metadata: Metadata = {
  title: "FIN GatorLend",
  description: "Student-built exchange pilot with optional XRPL testnet verification for selected demo assets."
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
        <FeedbackButton />
        <footer
          style={{
            borderTop: "1px solid #ebebeb",
            padding: "1.2rem 1.5rem 2rem",
            color: "#5a5a5a"
          }}
        >
          <div style={{ maxWidth: 1120, margin: "0 auto", fontSize: 14, lineHeight: 1.6 }}>
            {FOOTER_DISCLAIMER}
          </div>
        </footer>
      </body>
    </html>
  );
}
