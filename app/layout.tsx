import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import { Footer, Header } from "@/components/layout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Cheng's Blog",
    template: "%s | Cheng's Blog",
  },
  description:
    "A personal blog about web development, programming, and technology.",
  keywords: ["blog", "web development", "programming", "technology", "React", "Next.js"],
  authors: [{ name: "Cheng" }],
  creator: "Cheng",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Cheng's Blog",
    title: "Cheng's Blog",
    description:
      "A personal blog about web development, programming, and technology.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cheng's Blog",
    description:
      "A personal blog about web development, programming, and technology.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
