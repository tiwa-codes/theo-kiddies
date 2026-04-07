import { supabase } from "@/lib/supabase";

const HERO_IMAGE_KEY = "home_hero_image_url";
const HERO_ALT_KEY = "home_hero_image_alt";

export type HomeHeroContent = {
  imageUrl: string;
  imageAlt: string;
};

const DEFAULT_HERO: HomeHeroContent = {
  imageUrl: "/images/gallery/envato-mother-son.jpg",
  imageAlt: "Mother and son choosing children's outfits in a retail store",
};

export async function getHomeHeroContent(): Promise<HomeHeroContent> {
  try {
    const { data, error } = await supabase
      .from("site_content")
      .select("key, value")
      .in("key", [HERO_IMAGE_KEY, HERO_ALT_KEY]);

    if (error) throw error;

    const map = new Map<string, string>();
    (data ?? []).forEach((row) => {
      map.set(row.key as string, row.value as string);
    });

    return {
      imageUrl: map.get(HERO_IMAGE_KEY) || DEFAULT_HERO.imageUrl,
      imageAlt: map.get(HERO_ALT_KEY) || DEFAULT_HERO.imageAlt,
    };
  } catch {
    return DEFAULT_HERO;
  }
}

export const HOME_HERO_KEYS = {
  image: HERO_IMAGE_KEY,
  alt: HERO_ALT_KEY,
};
