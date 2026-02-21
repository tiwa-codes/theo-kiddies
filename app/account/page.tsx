import type { Metadata } from "next";
import Link from "next/link";
import { Heart, Package, Settings, LogOut } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "My Account – Theo Kiddies",
};

const quickLinks = [
  { label: "My Orders", description: "Track and manage your orders", href: "#", icon: Package },
  { label: "Wishlist", description: "Items you've saved for later", href: "#", icon: Heart },
  { label: "Account Settings", description: "Update profile and preferences", href: "#", icon: Settings },
];

export default function AccountPage() {
  return (
    <div className="min-h-screen bg-brand-cream py-12">
      <Container size="wide" className="space-y-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-orange/70">
            My Account
          </p>
          <h1 className="mt-2 text-3xl font-bold text-brand-cocoa">Welcome back!</h1>
        </div>

        {/* Auth notice */}
        <Card className="border border-dashed border-brand-orange/30 p-6 text-sm text-brand-cocoa/70">
          <p className="font-semibold text-brand-cocoa">Authentication not yet connected.</p>
          <p className="mt-1">
            Connect an auth provider such as{" "}
            <a
              href="https://next-auth.js.org"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-brand-orange hover:underline"
            >
              NextAuth
            </a>
            ,{" "}
            <a
              href="https://clerk.com"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-brand-orange hover:underline"
            >
              Clerk
            </a>
            , or{" "}
            <a
              href="https://supabase.com"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-brand-orange hover:underline"
            >
              Supabase
            </a>{" "}
            to enable login, registration, and session management.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/account/login"
              className="rounded-full bg-brand-orange px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-orange/90"
            >
              Sign in
            </Link>
            <Link
              href="/account/register"
              className="rounded-full border border-brand-orange/15 px-5 py-2 text-sm font-semibold text-brand-cocoa transition hover:bg-white"
            >
              Create account
            </Link>
          </div>
        </Card>

        {/* Quick links */}
        <div className="grid gap-4 sm:grid-cols-3">
          {quickLinks.map(({ label, description, href, icon: Icon }) => (
            <Link key={label} href={href}>
              <Card className="group h-full p-6 transition hover:shadow-float">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-brand-orange/10 transition group-hover:bg-brand-orange/20">
                  <Icon className="h-5 w-5 text-brand-orange" />
                </div>
                <h3 className="font-semibold text-brand-cocoa">{label}</h3>
                <p className="mt-1 text-sm text-brand-cocoa/60">{description}</p>
              </Card>
            </Link>
          ))}
        </div>

        {/* Sign out placeholder */}
        <button
          type="button"
          className="flex items-center gap-2 text-sm font-semibold text-brand-cocoa/60 transition hover:text-brand-cocoa"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </Container>
    </div>
  );
}
