import type { Metadata } from "next";
import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { Heart, Package, Settings, LogOut } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { SignOutButton } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "My Account – Theo Kiddies",
};

const quickLinks = [
  { label: "My Orders", description: "Track and manage your orders", href: "/account/orders", icon: Package },
  { label: "Wishlist", description: "Items you've saved for later", href: "/account/wishlist", icon: Heart },
  { label: "Account Settings", description: "Update profile and preferences", href: "/account/settings", icon: Settings },
];

export default async function AccountPage() {
  const user = await currentUser();

  return (
    <div className="min-h-screen bg-brand-cream py-12">
      <Container size="wide" className="space-y-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-orange/70">
            My Account
          </p>
          <h1 className="mt-2 text-3xl font-bold text-brand-cocoa">
            {user ? `Welcome back${user.firstName ? `, ${user.firstName}` : ""}!` : "Welcome!"}
          </h1>
        </div>

        {user ? (
          /* ── Logged-in state ── */
          <Card className="p-6">
            <div className="flex items-center gap-4">
              {user.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.imageUrl} alt="Profile" className="h-14 w-14 rounded-full object-cover" />
              )}
              <div>
                <p className="font-semibold text-brand-cocoa">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-sm text-brand-cocoa/60">
                  {user.emailAddresses[0]?.emailAddress}
                </p>
              </div>
            </div>
          </Card>
        ) : (
          /* ── Guest state ── */
          <Card className="p-6">
            <p className="font-semibold text-brand-cocoa">Sign in to your account</p>
            <p className="mt-1 text-sm text-brand-cocoa/70">
              Track orders, save favourites, and manage your profile.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/sign-in"
                className="rounded-full bg-brand-orange px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-orange/90"
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="rounded-full border border-brand-orange/20 px-5 py-2 text-sm font-semibold text-brand-cocoa transition hover:bg-white"
              >
                Create account
              </Link>
            </div>
          </Card>
        )}

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

        {user && (
          <SignOutButton redirectUrl="/">
            <button
              type="button"
              className="flex items-center gap-2 text-sm font-semibold text-brand-cocoa/60 transition hover:text-brand-cocoa"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </SignOutButton>
        )}
      </Container>
    </div>
  );
}
