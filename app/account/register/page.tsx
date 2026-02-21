import type { Metadata } from "next";
import Link from "next/link";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { Input } from "@/components/ui/Input";

export const metadata: Metadata = {
  title: "Create Account – Theo Kiddies",
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-brand-cream py-16">
      <Container className="max-w-md">
        <Card className="p-8">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-orange/10">
              <UserPlus className="h-5 w-5 text-brand-orange" />
            </div>
            <h1 className="text-2xl font-bold text-brand-cocoa">Create an account</h1>
            <p className="mt-1 text-sm text-brand-cocoa/60">
              Join Theo Kiddies for a better shopping experience
            </p>
          </div>

          <form className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.2em] text-brand-orange/70">
                  First name
                </label>
                <Input placeholder="First name" required />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.2em] text-brand-orange/70">
                  Last name
                </label>
                <Input placeholder="Last name" required />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.2em] text-brand-orange/70">
                Email
              </label>
              <Input type="email" placeholder="you@example.com" required />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.2em] text-brand-orange/70">
                Password
              </label>
              <Input type="password" placeholder="Min. 8 characters" required />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.2em] text-brand-orange/70">
                Confirm password
              </label>
              <Input type="password" placeholder="Repeat password" required />
            </div>
            <Button size="lg" className="w-full" type="submit">
              Create account
            </Button>
          </form>

          <div className="mt-4 rounded-2xl border border-dashed border-brand-orange/30 bg-white p-4 text-center text-xs text-brand-cocoa/60">
            Connect an auth provider (NextAuth, Clerk, Supabase) to enable real authentication.
          </div>

          <p className="mt-6 text-center text-sm text-brand-cocoa/70">
            Already have an account?{" "}
            <Link href="/account/login" className="font-semibold text-brand-orange hover:underline">
              Sign in
            </Link>
          </p>
        </Card>
      </Container>
    </div>
  );
}
