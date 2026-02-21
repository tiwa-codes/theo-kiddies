const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY ?? "";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const reference = searchParams.get("reference");

  if (!reference) {
    return Response.json({ error: "Reference is required" }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` },
        // Don't cache — always verify live
        next: { revalidate: 0 },
      }
    );

    const data = await res.json();

    if (!res.ok || !data.status) {
      throw new Error(data.message ?? "Verification failed");
    }

    const tx = data.data;

    return Response.json({
      status: tx.status, // "success" | "failed" | "abandoned"
      reference: tx.reference,
      amount: tx.amount / 100, // convert back from kobo
      currency: tx.currency,
      email: tx.customer?.email,
      paidAt: tx.paid_at,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Verification error";
    return Response.json({ error: message }, { status: 500 });
  }
}
