import type { Metadata } from "next";
import type { ReactNode } from "react";

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
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          background: "#f4f1e8",
          color: "#122117"
        }}
      >
        {children}
      </body>
    </html>
  );
}
