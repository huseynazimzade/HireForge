import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import { AuthProvider } from "@/context/AuthContext";
import { Navbar } from "@/components/Navbar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "HireForge - AI-Powered CV Screening",
  description: "Forge the perfect match between talent and opportunity.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="az" className={inter.variable}>
      <body className="font-sans bg-[#FAFAFA] text-slate-800 antialiased min-h-screen flex flex-col">
        <LanguageProvider>
          <AuthProvider>
            <Navbar />
            <main className="flex-1 flex flex-col">{children}</main>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
