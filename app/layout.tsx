import type { Metadata } from "next";
import { Fredoka, Nunito } from "next/font/google";
import "./globals.css";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";

const displayFont = Fredoka({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
});

const bodyFont = Nunito({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Theo Kiddies | Premium Kids Essentials",
    template: "%s | Theo Kiddies",
  },
  description:
    "Theo Kiddies is a nationwide children's retail store for clothing, shoes, toys, school supplies, baby essentials, and accessories.",
  metadataBase: new URL("https://theokiddies.com"),
  openGraph: {
    title: "Theo Kiddies | Premium Kids Essentials",
    description:
      "Warm, trustworthy, and premium essentials for every stage of childhood.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${displayFont.variable} ${bodyFont.variable}`}>
      <body>
        {/* Global layout wrappers */}
        <AnnouncementBar />
        <Header />
        <main>{children}</main>
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  );
}
