import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Bitsacco",
  description: "Community Savings and Investment Platform",
  keywords: [
    "savings",
    "investment",
    "community",
    "chama",
    "bitcoin",
    "lightning",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased bg-gray-50`}>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
