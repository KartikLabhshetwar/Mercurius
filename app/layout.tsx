import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mercurius",
  description: "Private, self-destructing chat rooms that disappear after 10 minutes. No accounts, no history, just secure conversations.",
  openGraph: {
    images: [
      {
        url: "https://mercurius-five.vercel.app/og.png",
        width: 1200,
        height: 630,
        alt: "Mercurius",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["https://mercurius-five.vercel.app/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
      <script defer src="https://cloud.umami.is/script.js" data-website-id="e12124c2-6985-45b5-b3d5-3038fd1cfc91"></script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
