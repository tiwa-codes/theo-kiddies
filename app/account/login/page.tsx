import type { Metadata } from "next";
import Link from "next/link";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { Input } from "@/components/ui/Input";

export const metadata: Metadata = {
  title: "Login – Theo Kiddies",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-brand-cream py-16">
      <Container className="max-w-md">
        <Card className="p-8">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-orange/10">
              <Lock className="h-5 w-5 text-brand-orange" />
            </div>
            <h1 className="text-2xl font-bold text-brand-cocoa">Welcome back</h1>
            <p className="mt-1 text-sm text-brand-cocoa/60">
              Sign in to your Theo Kiddies account
            </p>
          </div>

          <form className="space-y-4">
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
              <Input type="password" placeholder="••••••••" required />
              <div className="mt-2 text-right">
                <span className="text-xs font-semibold text-brand-orange cursor-pointer hover:underline">
                  Forgot password?
                </span>
              </div>
            </div>
            <Button size="lg" className="w-full" type="submit">
              Sign in
            </Button>
          </form>

          <div className="mt-4 rounded-2xl border border-dashed border-brand-orange/30 bg-white p-4 text-center text-xs text-brand-cocoa/60">
            Connect an auth provider (NextAuth, Clerk, Supabase) to enable real authentication.
          </div>

          <p className="mt-6 text-center text-sm text-brand-cocoa/70">
            Don&apos;t have an account?{" "}
            <Link href="/account/register" className="font-semibold text-brand-orange hover:underline">
              Create one
            </Link>
          </p>
        </Card>
      </Container>
    </div>
  );
}
