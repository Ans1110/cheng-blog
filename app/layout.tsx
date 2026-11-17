import type { Metadata } from "next";
import { Instrument_Serif, Nunito, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import { Footer, Header } from "@/components/layout";
import { DreamBackground } from "@/components/dream/DreamBackground";

const instrumentSerif = Instrument_Serif({
  variable: "--ff-display",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

const nunito = Nunito({
  variable: "--ff-body",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--ff-mono",
  subsets: ["latin"],
  display: "swap",
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
        className={`${instrumentSerif.variable} ${nunito.variable} ${jetbrainsMono.variable} antialiased min-h-screen flex flex-col font-sans`}
      >
        <Providers>
          <DreamBackground />
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
