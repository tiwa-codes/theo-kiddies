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
    <div className="min-h-screen bg-gray-50 lg:flex">
      {/* Sidebar */}
      <aside className="border-b border-gray-200 bg-white lg:flex lg:w-64 lg:flex-shrink-0 lg:flex-col lg:border-b-0 lg:border-r">
        {/* Brand */}
        <div className="flex items-center gap-2.5 border-b border-gray-200 px-4 py-3 lg:px-5 lg:py-4">
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
        <nav className="overflow-x-auto px-2 py-2 lg:flex-1 lg:space-y-0.5 lg:overflow-visible lg:p-3">
          <div className="flex min-w-max gap-1.5 lg:block lg:min-w-0 lg:space-y-0.5 lg:gap-0">
          {navItems.map(({ label, href, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors lg:gap-3 lg:py-2.5",
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
          </div>
        </nav>

        {/* Footer */}
        <div className="hidden border-t border-gray-200 p-3 lg:block">
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
      <main className="min-w-0 flex-1 overflow-auto">{children}</main>
    </div>
  );
}
