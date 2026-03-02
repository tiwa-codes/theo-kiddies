"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Settings,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard, exact: true },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="flex w-64 flex-shrink-0 flex-col border-r border-gray-200 bg-white">
        {/* Brand */}
        <div className="flex items-center gap-2.5 border-b border-gray-200 px-5 py-4">
          <Image
            src="/images/theokiddies1.png"
            alt="Theo Kiddies"
            width={32}
            height={32}
            className="rounded-lg"
          />
          <div>
            <p className="text-sm font-bold text-gray-900">Theo Kiddies</p>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-brand-orange">
              Admin
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-0.5 p-3">
          {navItems.map(({ label, href, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-brand-orange/10 text-brand-orange"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {label}
                {active && <ChevronRight className="ml-auto h-3 w-3 opacity-40" />}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-200 p-3">
          {process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && (
            <div className="mb-2 flex items-center gap-2 rounded-xl px-3 py-2">
              <UserButton afterSignOutUrl="/" />
              <span className="text-xs font-medium text-gray-500">Admin account</span>
            </div>
          )}
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-medium text-gray-500 transition hover:bg-gray-100"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            View storefront
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
