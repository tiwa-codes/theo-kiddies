import type { Metadata } from "next";
import { Fredoka, Nunito } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
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
  metadataBase: new URL(process.env.NEXT_PUBLIC_URL ?? "https://theokiddies.com"),
  keywords: ["kids clothing Nigeria", "children shoes Nigeria", "baby essentials", "kids toys", "school supplies", "Theo Kiddies"],
  openGraph: {
    title: "Theo Kiddies | Premium Kids Essentials",
    description: "Curated picks for busy parents: cozy clothing, playful toys, and everyday essentials.",
    type: "website",
    siteName: "Theo Kiddies",
    locale: "en_NG",
  },
  twitter: {
    card: "summary_large_image",
    title: "Theo Kiddies | Premium Kids Essentials",
    description: "Curated picks for busy parents: cozy clothing, playful toys, and everyday essentials.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  const body = (
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

  // ClerkProvider is only mounted when the publishable key is present.
  // On Vercel, set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY in environment variables.
  if (!clerkKey) return body;

  return <ClerkProvider publishableKey={clerkKey}>{body}</ClerkProvider>;
}
