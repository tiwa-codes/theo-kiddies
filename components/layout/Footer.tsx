import Link from "next/link";
import { Facebook, Instagram, Twitter } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Input } from "@/components/ui/Input";
import { siteConfig } from "@/lib/config";

const quickLinks = [
  { label: "New Arrivals", href: "/category/new-arrivals" },
  { label: "Best Sellers", href: "/category/best-sellers" },
  { label: "Deals", href: "/category/deals" },
  { label: "Gift Ideas", href: "/category/gift-ideas" },
];

const customerService = [
  { label: "Order Tracking", href: "/" },
  { label: "Returns & Exchanges", href: "/" },
  { label: "FAQs", href: "/" },
  { label: "Size Guide", href: "/" },
];

const deliveryPolicy = [
  { label: "Delivery Areas", href: "/" },
  { label: "Shipping Times", href: "/" },
  { label: "Pickup Locations", href: "/" },
  { label: "International", href: "/" },
];

export function Footer() {
  return (
    <footer className="bg-white">
      <Container size="wide" className="space-y-12 py-12">
        <div className="grid gap-8 lg:grid-cols-[1.4fr,1fr,1fr,1fr]">
          <div>
            <h3 className="text-lg font-semibold text-brand-cocoa">Theo Kiddies</h3>
            <p className="mt-3 text-sm text-brand-cocoa/70">
              Nationwide children's essentials, curated with warmth and quality for every stage.
            </p>
            <div className="mt-4 text-sm text-brand-cocoa/70">
              <p>Call: {siteConfig.phone}</p>
              <p>Email: {siteConfig.email}</p>
              <p>{siteConfig.hours}</p>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <Link href={siteConfig.instagram} target="_blank" rel="noreferrer" className="rounded-full bg-brand-cream p-2">
                <Instagram className="h-4 w-4" />
              </Link>
              <Link href={siteConfig.facebook} target="_blank" rel="noreferrer" className="rounded-full bg-brand-cream p-2">
                <Facebook className="h-4 w-4" />
              </Link>
              <Link href={siteConfig.twitter} target="_blank" rel="noreferrer" className="rounded-full bg-brand-cream p-2">
                <Twitter className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-orange/70">
              Quick links
            </h4>
            <ul className="mt-4 space-y-2 text-sm">
              {quickLinks.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-brand-cocoa/80 hover:text-brand-cocoa">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-orange/70">
              Customer service
            </h4>
            <ul className="mt-4 space-y-2 text-sm">
              {customerService.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-brand-cocoa/80 hover:text-brand-cocoa">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-orange/70">
              Delivery policy
            </h4>
            <ul className="mt-4 space-y-2 text-sm">
              {deliveryPolicy.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-brand-cocoa/80 hover:text-brand-cocoa">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="grid gap-6 rounded-2xl bg-brand-cream p-6 lg:grid-cols-[1.3fr,1fr]">
          <div>
            <h4 className="text-lg font-semibold text-brand-cocoa">Join our newsletter</h4>
            <p className="mt-2 text-sm text-brand-cocoa/70">
              Get early access to new drops, deals, and school-season essentials.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input placeholder="Enter your email" type="email" />
            <Button className="sm:w-auto">Subscribe</Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-brand-orange/10 pt-6 text-xs text-brand-cocoa/60">
          <p>© {new Date().getFullYear()} Theo Kiddies. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/">Privacy Policy</Link>
            <Link href="/">Terms</Link>
            <Link href="/">Contact</Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
