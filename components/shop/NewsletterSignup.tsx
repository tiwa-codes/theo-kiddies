"use client";

import { useId, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { NewsletterSource } from "@/lib/newsletter";

type Status = "idle" | "sending" | "done" | "error";

/** Working newsletter signup, used in the footer and on /feedback. */
export function NewsletterSignup({ source }: { source: NewsletterSource }) {
  const id = useId();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Something went wrong. Please try again.");
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <p role="status" className="flex items-center gap-2 rounded-full bg-white px-4 py-3 text-sm font-semibold text-brand-cocoa">
        <Check className="h-4 w-4 flex-shrink-0 text-brand-orange" />
        You&apos;re in! Watch your inbox for new arrivals and offers.
      </p>
    );
  }

  const sending = status === "sending";
  return (
    <form onSubmit={onSubmit}>
      <div className="flex flex-col gap-3 sm:flex-row">
        <label htmlFor={id} className="sr-only">
          Email address
        </label>
        <Input
          id={id}
          type="email"
          required
          autoComplete="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={sending}
        />
        <Button type="submit" disabled={sending} className="flex-shrink-0 gap-2 sm:w-auto">
          {sending && <Loader2 className="h-4 w-4 animate-spin" />}
          {sending ? "Joining..." : "Subscribe"}
        </Button>
      </div>
      <p className="mt-2 px-1 text-xs text-brand-cocoa/60">We&apos;ll email you new arrivals and offers. Unsubscribe anytime.</p>
      {status === "error" && (
        <p role="alert" className="mt-2 px-1 text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </form>
  );
}
