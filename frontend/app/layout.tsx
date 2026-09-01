import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { KaleidoscopeBackground } from "@/components/geometric/KaleidoscopeBackground";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Hackverse Intelligence",
  description: "Premium financial analysis platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <body className={`${inter.className} min-h-screen bg-[var(--color-cream)] text-[var(--color-text-main)] antialiased selection:bg-[var(--color-forest-light)] selection:text-white`}>
        <KaleidoscopeBackground variant="dashboard" />
        {children}
      </body>
    </html>
  );
}
