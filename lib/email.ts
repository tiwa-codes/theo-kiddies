import { Resend } from "resend";
import type { OrderItem } from "@/lib/supabase";

// The "from" address must be on a domain you've verified in Resend.
// e.g. add theokiddies.com in Resend → Domains, then use orders@theokiddies.com
const FROM = process.env.RESEND_FROM_ADDRESS ?? "Theo Kiddies <orders@theokiddies.com>";

// Lazily create the Resend client so the build doesn't fail before the env var is set.
function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY env var is not set.");
  return new Resend(key);
}

export async function sendOrderConfirmation({
  email,
  reference,
  amount,
  currency,
  items,
}: {
  email: string;
  reference: string;
  amount: number;
  currency: string;
  items: OrderItem[];
}) {
  const formattedAmount = amount.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
  });

  const itemRows = items
    .map(
      (item) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #f0ece6;font-size:14px;color:#3b2314;">${item.display_name}</td>
        <td style="padding:10px 0;border-bottom:1px solid #f0ece6;font-size:14px;color:#3b2314;text-align:right;">${item.value}</td>
      </tr>`
    )
    .join("");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Order Confirmed – Theo Kiddies</title>
</head>
<body style="margin:0;padding:0;background:#fdf6f0;font-family:'Nunito',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#fdf6f0;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">

          <!-- Header -->
          <tr>
            <td style="background:#c95f1a;padding:32px 40px;text-align:center;">
              <p style="margin:0;font-size:22px;font-weight:800;color:#fff;letter-spacing:-0.3px;">Theo Kiddies</p>
              <p style="margin:6px 0 0;font-size:12px;font-weight:600;color:rgba(255,255,255,0.7);letter-spacing:0.2em;text-transform:uppercase;">Order Confirmed</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <p style="margin:0 0 8px;font-size:24px;font-weight:800;color:#3b2314;">Thank you! 🎉</p>
              <p style="margin:0 0 24px;font-size:15px;color:#7a5f50;line-height:1.6;">
                Hi there, your order has been confirmed and will be dispatched within <strong>1–2 business days</strong>.
              </p>

              <!-- Order summary box -->
              <div style="background:#fdf6f0;border-radius:16px;padding:24px;margin-bottom:24px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="font-size:11px;font-weight:700;color:#c95f1a;letter-spacing:0.2em;text-transform:uppercase;padding-bottom:12px;">Order Summary</td>
                  </tr>
                  ${itemRows}
                  <tr>
                    <td style="padding-top:16px;font-size:16px;font-weight:800;color:#3b2314;">Total</td>
                    <td style="padding-top:16px;font-size:16px;font-weight:800;color:#3b2314;text-align:right;">₦${formattedAmount} ${currency}</td>
                  </tr>
                </table>
              </div>

              <!-- Reference -->
              <p style="text-align:center;font-size:11px;font-weight:700;color:#c95f1a;letter-spacing:0.2em;text-transform:uppercase;background:#fdf6f0;border-radius:99px;padding:10px 20px;display:inline-block;">
                Ref: ${reference.toUpperCase()}
              </p>

              <!-- What's next -->
              <div style="margin-top:32px;">
                <p style="font-size:13px;font-weight:700;color:#3b2314;margin:0 0 12px;">What happens next?</p>
                <p style="margin:0 0 8px;font-size:14px;color:#7a5f50;">📦 Your order is packed and will be dispatched within 1–2 business days.</p>
                <p style="margin:0 0 8px;font-size:14px;color:#7a5f50;">🚚 Delivery typically takes 2–5 business days nationwide.</p>
                <p style="margin:0;font-size:14px;color:#7a5f50;">💬 Questions? Reply to this email or WhatsApp us.</p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#fdf6f0;padding:24px 40px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#b09080;">© ${new Date().getFullYear()} Theo Kiddies. All rights reserved.</p>
              <p style="margin:4px 0 0;font-size:12px;color:#b09080;">Curated picks for busy parents.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const { error } = await getResend().emails.send({
    from: FROM,
    to: email,
    subject: `Your Theo Kiddies order is confirmed – ${reference.toUpperCase()}`,
    html,
  });

  if (error) {
    console.error("Resend error:", error);
  }
}
