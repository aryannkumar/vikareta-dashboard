import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { QueryProvider } from "@/components/providers/query-provider";
import { VikaretaAuthProvider } from "@/lib/auth/vikareta";
import { ToastProvider } from "@/components/providers/toast-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vikareta Dashboard - Business Management Platform",
  description: "Comprehensive business dashboard for managing products, orders, RFQs, and more on the Vikareta marketplace platform.",
  keywords: "business dashboard, marketplace, B2B, products, orders, RFQ, quotes",
  authors: [{ name: "Vikareta Team" }],
  creator: "Vikareta",
  publisher: "Vikareta",
  robots: "noindex, nofollow", // Dashboard should not be indexed
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: "Vikareta Dashboard",
    title: "Vikareta Dashboard - Business Management Platform",
    description: "Comprehensive business dashboard for managing products, orders, RFQs, and more on the Vikareta marketplace platform.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vikareta Dashboard - Business Management Platform",
    description: "Comprehensive business dashboard for managing products, orders, RFQs, and more on the Vikareta marketplace platform.",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#3b82f6",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <VikaretaAuthProvider>
              <ToastProvider>
                {children}
              </ToastProvider>
            </VikaretaAuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
