import { AGE_BANDS } from "@/lib/ageGroups";
import type { Category } from "@/types";

export const announcement = "Free nationwide delivery on orders over ₦150,000 – 2-day dispatch";

export const navCategories = [
  { label: "Clothing", href: "/category/clothing" },
  { label: "Shoes", href: "/category/shoes" },
  { label: "Toys", href: "/category/toys" },
  { label: "School Supplies", href: "/category/school-supplies" },
  { label: "Accessories", href: "/category/accessories" },
  { label: "Baby Essentials", href: "/category/baby-essentials" },
];

export const navQuick = [
  { label: "New Arrivals", href: "/category/new-arrivals" },
  { label: "Best Sellers", href: "/category/best-sellers" },
  { label: "Deals", href: "/category/deals" },
  { label: "Gift Ideas", href: "/category/gift-ideas" },
];

export const shopByAge = AGE_BANDS.map((band) => ({
  title: band.range,
  note: band.note,
  href: `/category/${band.slug}`,
}));

export const featuredCategories: Category[] = [
  {
    title: "Clothing",
    slug: "clothing",
    description: "Soft tees, sets, and cozy layers",
    icon: "shirt",
  },
  {
    title: "Shoes",
    slug: "shoes",
    description: "Supportive sneakers and sandals",
    icon: "shoe",
  },
  {
    title: "Toys",
    slug: "toys",
    description: "Imaginative play for every age",
    icon: "toy",
  },
  {
    title: "School Supplies",
    slug: "school-supplies",
    description: "Backpacks, stationery, and more",
    icon: "backpack",
  },
  {
    title: "Baby Essentials",
    slug: "baby-essentials",
    description: "Gentle care for tiny humans",
    icon: "baby",
  },
  {
    title: "Accessories",
    slug: "accessories",
    description: "Hats, socks, and little extras",
    icon: "accessory",
  },
];

export const storeStoryImages = [
  {
    id: 1,
    src: "/images/gallery/store-3364.jpg",
    alt: "Physical Theo Kiddies store with colorful children's outfits on display",
  },
  {
    id: 2,
    src: "/images/gallery/store-3365.jpg",
    alt: "Inside view of Theo Kiddies store showing organized kidswear racks",
  },
  {
    id: 3,
    src: "/images/gallery/store-3366.jpg",
    alt: "Theo Kiddies store section with neatly arranged baby and toddler clothing",
  },
  {
    id: 4,
    src: "/images/gallery/store-3368.jpg",
    alt: "Physical store shelves and rails filled with children's fashion items",
  },
  {
    id: 5,
    src: "/images/gallery/store-3370.jpg",
    alt: "Theo Kiddies retail floor showcasing kids essentials and accessories",
  },
  {
    id: 6,
    src: "/images/gallery/store-3371.jpg",
    alt: "In-store children clothing section with bright and playful styles",
  },
  {
    id: 7,
    src: "/images/gallery/store-3372.jpg",
    alt: "Display area in Theo Kiddies physical store with infant and kids products",
  },
];
