import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ConfigProvider } from "@/lib/config-store";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GoWA API Playground — GOWA API Interactive Client",
  description:
    "An elegant, secure, and fully interactive playground for GOWA (Go WhatsApp REST API). Explore endpoints, send messages, generate payloads, and test integrations securely.",
  keywords: [
    "GoWA",
    "WhatsApp API",
    "Go WhatsApp REST API",
    "GOWA Playground",
    "API client",
    "Go-WhatsApp-Web-MultiDevice",
    "aldinokemal",
    "Interactive API documentation",
  ],
  authors: [{ name: "em_rival", url: "https://instagram.com/em_rival" }],
  creator: "em_rival",
  openGraph: {
    title: "GoWA API Playground",
    description:
      "Modern and secure testing ground for Go WhatsApp REST API integrations.",
    url: "https://instagram.com/em_rival",
    siteName: "GoWA Playground",
    images: [
      {
        url: "/gowa-logo.svg",
        width: 800,
        height: 600,
        alt: "GoWA Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GoWA API Playground",
    description: "Interactive API interface for Go WhatsApp REST API.",
    images: ["/gowa-logo.svg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <ConfigProvider>
            <TooltipProvider>{children}</TooltipProvider>
          </ConfigProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
