import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "n8n Agent - Workflow Automation",
  description: "Visual workflow automation agent",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
