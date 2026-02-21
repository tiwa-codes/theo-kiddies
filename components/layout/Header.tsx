"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { navAgeGroups, navCategories, navQuick, products } from "@/lib/data";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Drawer } from "@/components/ui/Drawer";
import { Input } from "@/components/ui/Input";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { useCartStore } from "@/store/cart";
import { cn } from "@/lib/utils";

export function Header() {
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState<"age" | "category" | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const cartItems = useCartStore((s) => s.items);
  const cartCount = mounted ? cartItems.reduce((t, i) => t + i.quantity, 0) : 0;

  useEffect(() => { setMounted(true); }, []);

  // Close search dropdown when clicking outside
  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  const searchResults =
    searchQuery.length >= 2
      ? products
          .filter(
            (p) =>
              p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              p.category.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .slice(0, 5)
      : [];

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/category/clothing?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-brand-orange/10 bg-white/80 backdrop-blur">
      <Container size="wide" className="flex items-center justify-between gap-6 py-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="rounded-full border border-brand-orange/15 p-2 lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/images/theokiddies1.png"
              alt="Theo Kiddies logo"
              width={44}
              height={44}
            />
            <span className="text-lg font-bold text-brand-cocoa">Theo Kiddies</span>
          </Link>
        </div>

        <nav className="hidden items-center gap-6 lg:flex">
          <div
            className="relative"
            onMouseEnter={() => setMegaMenuOpen("age")}
            onMouseLeave={() => setMegaMenuOpen(null)}
          >
            <button
              type="button"
              className="flex items-center gap-1 text-sm font-semibold text-brand-cocoa"
            >
              Shop by Age <ChevronDown className="h-4 w-4" />
            </button>
            <div
              className={cn(
                "absolute left-0 top-full mt-4 w-[420px] rounded-2xl bg-white p-6 shadow-float transition",
                megaMenuOpen === "age" ? "opacity-100" : "pointer-events-none opacity-0"
              )}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-orange/70">
                Age groups
              </p>
              <div className="mt-4 grid gap-3">
                {navAgeGroups.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="rounded-2xl border border-brand-orange/10 px-4 py-3 text-sm font-semibold text-brand-cocoa transition hover:bg-brand-cream"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div
            className="relative"
            onMouseEnter={() => setMegaMenuOpen("category")}
            onMouseLeave={() => setMegaMenuOpen(null)}
          >
            <button
              type="button"
              className="flex items-center gap-1 text-sm font-semibold text-brand-cocoa"
            >
              Shop by Category <ChevronDown className="h-4 w-4" />
            </button>
            <div
              className={cn(
                "absolute left-0 top-full mt-4 w-[560px] rounded-2xl bg-white p-6 shadow-float transition",
                megaMenuOpen === "category" ? "opacity-100" : "pointer-events-none opacity-0"
              )}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-orange/70">
                Categories
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {navCategories.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="rounded-2xl border border-brand-orange/10 px-4 py-3 text-sm font-semibold text-brand-cocoa transition hover:bg-brand-cream"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                {navQuick.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="rounded-full bg-brand-cream px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-cocoa"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {navQuick.map((item) => (
            <Link key={item.label} href={item.href} className="text-sm font-semibold text-brand-cocoa">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div ref={searchRef} className="relative hidden lg:block">
            <form onSubmit={handleSearchSubmit}>
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-cocoa/50" />
              <Input
                placeholder="Search essentials"
                hasIcon
                className="w-64"
                aria-label="Search products"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSearchOpen(true);
                }}
                onFocus={() => setSearchOpen(true)}
              />
            </form>
            {searchOpen && searchResults.length > 0 && (
              <div className="absolute left-0 top-full z-50 mt-2 w-80 rounded-2xl bg-white p-3 shadow-float">
                {searchResults.map((p) => (
                  <Link
                    key={p.id}
                    href={`/product/${p.slug}`}
                    className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition hover:bg-brand-cream"
                    onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                  >
                    <span className="flex-1 font-semibold text-brand-cocoa">{p.title}</span>
                    <span className="text-xs text-brand-cocoa/50">{p.category}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
          <button
            type="button"
            className="rounded-full border border-brand-orange/10 p-2"
            aria-label="Open search"
          >
            <Search className="h-4 w-4 lg:hidden" />
          </button>
          <Link
            href="/account"
            className="rounded-full border border-brand-orange/10 p-2"
            aria-label="Account"
          >
            <User className="h-4 w-4" />
          </Link>
          <button
            type="button"
            className="relative rounded-full border border-brand-orange/10 p-2"
            onClick={() => setCartOpen(true)}
            aria-label="Open cart"
          >
            <ShoppingBag className="h-4 w-4" />
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-orange text-[10px] font-semibold text-white">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </button>
        </div>
      </Container>

      <Drawer open={mobileOpen} onClose={() => setMobileOpen(false)} side="left">
        <div className="flex h-full flex-col gap-6 px-6 py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
              <Image src="/images/theokiddies1.png" alt="Theo Kiddies" width={38} height={38} />
              <span className="text-lg font-bold">Theo Kiddies</span>
            </Link>
            <button type="button" onClick={() => setMobileOpen(false)}>
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="space-y-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-orange/70">
                Shop by Age
              </p>
              <div className="mt-3 space-y-2">
                {navAgeGroups.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="block rounded-2xl border border-brand-orange/10 px-4 py-3 text-sm font-semibold"
                    onClick={() => setMobileOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-orange/70">
                Shop by Category
              </p>
              <div className="mt-3 space-y-2">
                {navCategories.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="block rounded-2xl border border-brand-orange/10 px-4 py-3 text-sm font-semibold"
                    onClick={() => setMobileOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {navQuick.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="rounded-full bg-brand-cream px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em]"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <Button className="w-full" onClick={() => setMobileOpen(false)}>
            Shop All
          </Button>
        </div>
      </Drawer>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </header>
  );
}
