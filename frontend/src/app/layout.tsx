import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/layout/Navbar";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "AutoRentals — Premium Car Rental Platform",
  description:
    "Find and rent premium vehicles instantly. Thousands of cars, unbeatable prices, seamless booking experience.",
  keywords: ["car rental", "auto rentals", "vehicle booking", "rent a car"],
  openGraph: {
    title: "AutoRentals — Premium Car Rental Platform",
    description: "Find and rent premium vehicles instantly.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <AuthProvider>
          <Navbar />
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
