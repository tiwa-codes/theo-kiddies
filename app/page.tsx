import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Hero } from "@/components/sections/Hero";
import { ShopByAge } from "@/components/sections/ShopByAge";
import { FeaturedCategories } from "@/components/sections/FeaturedCategories";
import { BestSellers } from "@/components/sections/BestSellers";
import { PromoBanner } from "@/components/sections/PromoBanner";
import { WhyShop } from "@/components/sections/WhyShop";

const Testimonials = dynamic(() => import("@/components/sections/Testimonials").then((mod) => mod.Testimonials), {
  loading: () => <div className="mx-auto h-40 max-w-6xl rounded-2xl bg-white shimmer" />,
});

const InstagramGrid = dynamic(
  () => import("@/components/sections/InstagramGrid").then((mod) => mod.InstagramGrid),
  {
    loading: () => <div className="mx-auto h-40 max-w-6xl rounded-2xl bg-white shimmer" />,
  }
);

export const metadata: Metadata = {
  title: "Home",
  description:
    "Shop premium kids essentials across clothing, shoes, toys, and more at Theo Kiddies.",
};

export default function Home() {
  return (
    <>
      <Hero />
      <ShopByAge />
      <FeaturedCategories />
      <BestSellers />
      <PromoBanner />
      <WhyShop />
      <Testimonials />
      <InstagramGrid />
    </>
  );
}
