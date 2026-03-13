import type { Metadata } from "next";
import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Account Settings – Theo Kiddies",
};

export default async function AccountSettingsPage() {
  const user = await currentUser();

  if (!user) {
    return (
      <div className="min-h-screen bg-brand-cream py-12">
        <Container size="wide" className="space-y-6">
          <h1 className="text-3xl font-bold text-brand-cocoa">Account Settings</h1>
          <Card className="p-6">
            <p className="font-semibold text-brand-cocoa">Sign in to manage your settings</p>
            <p className="mt-1 text-sm text-brand-cocoa/70">Update your profile after signing in.</p>
            <div className="mt-4">
              <Link href="/sign-in" className="rounded-full bg-brand-orange px-5 py-2 text-sm font-semibold text-white">
                Sign in
              </Link>
            </div>
          </Card>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-cream py-12">
      <Container size="wide" className="space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-orange/70">My Account</p>
          <h1 className="mt-2 text-3xl font-bold text-brand-cocoa">Account Settings</h1>
        </div>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-brand-cocoa">Profile</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs text-brand-cocoa/60">First name</p>
              <p className="font-semibold text-brand-cocoa">{user.firstName ?? "-"}</p>
            </div>
            <div>
              <p className="text-xs text-brand-cocoa/60">Last name</p>
              <p className="font-semibold text-brand-cocoa">{user.lastName ?? "-"}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs text-brand-cocoa/60">Email</p>
              <p className="font-semibold text-brand-cocoa">{user.emailAddresses[0]?.emailAddress ?? "-"}</p>
            </div>
          </div>
          <p className="mt-5 text-sm text-brand-cocoa/70">
            Need to change account details? Use Clerk&apos;s account management from your profile icon, or contact support.
          </p>
        </Card>
      </Container>
    </div>
  );
}
