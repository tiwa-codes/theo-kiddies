"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { navAgeGroups, navCategories, navQuick } from "@/lib/data";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Drawer } from "@/components/ui/Drawer";
import { Input } from "@/components/ui/Input";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { CurrencySelector } from "@/components/layout/CurrencySelector";
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
  const megaMenuCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();

  const cartItems = useCartStore((s) => s.items);
  const cartCount = mounted ? cartItems.reduce((t, i) => t + i.quantity, 0) : 0;

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    return () => {
      if (megaMenuCloseTimer.current) {
        clearTimeout(megaMenuCloseTimer.current);
      }
    };
  }, []);

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

  const searchResults: Array<{ id: string; slug: string; title: string; category: string }> = [];

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/category/clothing?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
    }
  }

  function openMegaMenu(menu: "age" | "category") {
    if (megaMenuCloseTimer.current) {
      clearTimeout(megaMenuCloseTimer.current);
    }
    setMegaMenuOpen(menu);
  }

  function closeMegaMenuSoon() {
    if (megaMenuCloseTimer.current) {
      clearTimeout(megaMenuCloseTimer.current);
    }
    megaMenuCloseTimer.current = setTimeout(() => {
      setMegaMenuOpen(null);
    }, 120);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-brand-orange/10 bg-white/80 backdrop-blur">
      <Container size="wide" className="flex items-center justify-between gap-3 py-3 sm:gap-6 sm:py-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            className="rounded-full border border-brand-orange/15 p-2 lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link href="/" className="flex items-center">
            <Image
              src="/images/theokiddies-logo-trimmed.png"
              alt="Theo Kiddies logo"
              width={240}
              height={48}
              className="h-8 w-auto sm:h-10"
              priority
            />
          </Link>
        </div>

        <nav className="hidden items-center gap-6 lg:flex">
          <div
            className="relative"
            onMouseEnter={() => openMegaMenu("age")}
            onMouseLeave={closeMegaMenuSoon}
          >
            <button
              type="button"
              className="flex items-center gap-1 text-sm font-semibold text-brand-cocoa"
              onClick={() => setMegaMenuOpen((prev) => (prev === "age" ? null : "age"))}
            >
              Shop by Age <ChevronDown className="h-4 w-4" />
            </button>
            <div
              className={cn(
                "absolute left-0 top-full z-50 w-[420px] pt-2 transition",
                megaMenuOpen === "age" ? "opacity-100" : "pointer-events-none opacity-0"
              )}
            >
              <div className="rounded-2xl bg-white p-6 shadow-float">
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
          </div>

          <div
            className="relative"
            onMouseEnter={() => openMegaMenu("category")}
            onMouseLeave={closeMegaMenuSoon}
          >
            <button
              type="button"
              className="flex items-center gap-1 text-sm font-semibold text-brand-cocoa"
              onClick={() => setMegaMenuOpen((prev) => (prev === "category" ? null : "category"))}
            >
              Shop by Category <ChevronDown className="h-4 w-4" />
            </button>
            <div
              className={cn(
                "absolute left-0 top-full z-50 w-[560px] pt-2 transition",
                megaMenuOpen === "category" ? "opacity-100" : "pointer-events-none opacity-0"
              )}
            >
              <div className="rounded-2xl bg-white p-6 shadow-float">
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
          </div>

          {navQuick.map((item) => (
            <Link key={item.label} href={item.href} className="text-sm font-semibold text-brand-cocoa">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden sm:block">
            <CurrencySelector />
          </div>
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
            className="rounded-full border border-brand-orange/10 p-2 lg:hidden"
            aria-label="Open search"
            onClick={() => router.push("/category/clothing")}
          >
            <Search className="h-4 w-4" />
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
              <Image src="/images/theokiddies-logo-trimmed.png" alt="Theo Kiddies" width={180} height={36} className="h-7 w-auto" />
              <span className="text-lg font-bold">Theo Kiddies</span>
            </Link>
            <button type="button" onClick={() => setMobileOpen(false)}>
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="space-y-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-orange/70">
                Currency
              </p>
              <div className="mt-3 max-w-[180px]">
                <CurrencySelector />
              </div>
            </div>
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
