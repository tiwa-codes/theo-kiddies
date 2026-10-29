import { supabase } from "@/lib/supabase";
import { collectAllPages } from "@/lib/utils";
import {
  mergeSubscribers,
  type CheckoutOptInRow,
  type NewsletterSource,
  type Subscriber,
  type SubscriberRow,
} from "@/lib/newsletter";

/** Adds an email to the list. Signing up again is a no-op, not an error. */
export async function addSubscriber(email: string, source: NewsletterSource): Promise<void> {
  const { error } = await supabase
    .from("newsletter_subscribers")
    .upsert({ email, source }, { onConflict: "email", ignoreDuplicates: true });
  if (error) throw error;
}

/** Everyone who agreed to the newsletter, from the signup box and from checkout. */
export async function listSubscribers(): Promise<Subscriber[]> {
  const [signups, checkoutOptIns] = await Promise.all([
    collectAllPages<SubscriberRow>((from, to) =>
      supabase
        .from("newsletter_subscribers")
        .select("email, source, consented_at")
        .order("created_at", { ascending: true })
        .range(from, to),
    ),
    collectAllPages<CheckoutOptInRow>((from, to) =>
      supabase
        .from("orders")
        .select("email, newsletter_opt_in_at")
        .eq("newsletter_opt_in", true)
        .order("created_at", { ascending: true })
        .range(from, to),
    ),
  ]);
  return mergeSubscribers(signups, checkoutOptIns);
}
