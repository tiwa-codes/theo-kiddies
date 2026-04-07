import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Hero } from "@/components/sections/Hero";
import { ShopByAge } from "@/components/sections/ShopByAge";
import { FeaturedCategories } from "@/components/sections/FeaturedCategories";
import { BestSellers } from "@/components/sections/BestSellers";
import { PromoBanner } from "@/components/sections/PromoBanner";
import { StoreStory } from "@/components/sections/StoreStory";
import { WhyShop } from "@/components/sections/WhyShop";
import { getHomeHeroContent } from "@/lib/site-content";

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

export default async function Home() {
  const hero = await getHomeHeroContent();

  return (
    <>
      <Hero imageUrl={hero.imageUrl} imageAlt={hero.imageAlt} />
      <ShopByAge />
      <FeaturedCategories />
      <BestSellers />
      <PromoBanner />
      <StoreStory />
      <WhyShop />
      <Testimonials />
      <InstagramGrid />
    </>
  );
}
