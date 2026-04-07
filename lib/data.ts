import type { Category, Product } from "@/types";

export const announcement = "Free nationwide delivery on orders over ₦15,000 – 2-day dispatch";

export const navAgeGroups = [
  { label: "0-12 Months", href: "/category/0-12-months" },
  { label: "1-3 Years", href: "/category/1-3-years" },
  { label: "4-7 Years", href: "/category/4-7-years" },
  { label: "8-12 Years", href: "/category/8-12-years" },
];

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

export const shopByAge = [
  { title: "0-12 Months", note: "Soft layers for newborns", href: "/category/0-12-months" },
  { title: "1-3 Years", note: "Built for everyday play", href: "/category/1-3-years" },
  { title: "4-7 Years", note: "School-ready essentials", href: "/category/4-7-years" },
  { title: "8-12 Years", note: "Style with confidence", href: "/category/8-12-years" },
];

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

export const products: Product[] = [
  {
    id: "tk-001",
    slug: "cloudsoft-hoodie-set",
    title: "CloudSoft Hoodie Set",
    price: 42,
    compareAtPrice: 54,
    badge: "20% Off",
    ageGroup: "4-7 Years",
    category: "Clothing",
    images: ["/images/product-placeholder.svg", "/images/product-placeholder.svg", "/images/product-placeholder.svg"],
    rating: 4.8,
    reviews: 128,
    colors: [
      { id: "coral", label: "Warm Coral" },
      { id: "sage", label: "Soft Sage" },
    ],
    sizes: [
      { id: "xs", label: "XS" },
      { id: "s", label: "S" },
      { id: "m", label: "M" },
    ],
    inStock: true,
  },
  {
    id: "tk-002",
    slug: "sunny-day-sneakers",
    title: "Sunny Day Sneakers",
    price: 36,
    badge: "Best Seller",
    ageGroup: "8-12 Years",
    category: "Shoes",
    images: ["/images/product-placeholder.svg", "/images/product-placeholder.svg"],
    rating: 4.7,
    reviews: 94,
    colors: [
      { id: "sand", label: "Sand" },
      { id: "sky", label: "Sky Blue" },
    ],
    sizes: [
      { id: "1", label: "1" },
      { id: "2", label: "2" },
      { id: "3", label: "3" },
    ],
    inStock: true,
  },
  {
    id: "tk-003",
    slug: "rainbow-block-set",
    title: "Rainbow Block Set",
    price: 28,
    ageGroup: "1-3 Years",
    category: "Toys",
    images: ["/images/product-placeholder.svg"],
    rating: 4.9,
    reviews: 210,
    colors: [{ id: "multi", label: "Multi" }],
    sizes: [{ id: "std", label: "Standard" }],
    inStock: true,
  },
  {
    id: "tk-004",
    slug: "mini-explorer-backpack",
    title: "Mini Explorer Backpack",
    price: 32,
    badge: "New",
    ageGroup: "4-7 Years",
    category: "School Supplies",
    images: ["/images/product-placeholder.svg"],
    rating: 4.6,
    reviews: 76,
    colors: [
      { id: "mint", label: "Mint" },
      { id: "apricot", label: "Apricot" },
    ],
    sizes: [{ id: "one", label: "One Size" }],
    inStock: true,
  },
  {
    id: "tk-005",
    slug: "cozy-baby-essentials",
    title: "Cozy Baby Essentials Kit",
    price: 58,
    compareAtPrice: 72,
    badge: "Bundle",
    ageGroup: "0-12 Months",
    category: "Baby Essentials",
    images: ["/images/product-placeholder.svg"],
    rating: 4.9,
    reviews: 184,
    colors: [{ id: "cream", label: "Cream" }],
    sizes: [{ id: "one", label: "One Size" }],
    inStock: true,
  },
  {
    id: "tk-006",
    slug: "soft-knit-beanie",
    title: "Soft Knit Beanie",
    price: 16,
    ageGroup: "1-3 Years",
    category: "Accessories",
    images: ["/images/product-placeholder.svg"],
    rating: 4.5,
    reviews: 38,
    colors: [
      { id: "cocoa", label: "Cocoa" },
      { id: "peach", label: "Peach" },
    ],
    sizes: [{ id: "one", label: "One Size" }],
    inStock: true,
  },
];

export const testimonials = [
  {
    name: "Alicia M.",
    note: "The fabrics are dreamy soft and the delivery was so fast.",
    location: "Chicago, IL",
  },
  {
    name: "Jordan P.",
    note: "Theo Kiddies feels premium without being fussy. Love the style.",
    location: "Austin, TX",
  },
  {
    name: "Samantha R.",
    note: "I grabbed school supplies and outfits in one cart. Perfect.",
    location: "Charlotte, NC",
  },
];

export const instagramImages = [
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
  {
    id: 8,
    src: "/images/gallery/envato-happy-expecting.jpg",
    alt: "Pregnant shopper browsing baby clothes in a kidswear store",
  },
  {
    id: 9,
    src: "/images/gallery/envato-shop-interior.jpg",
    alt: "Kids fashion store interior with mannequins and clothing racks",
  },
  {
    id: 10,
    src: "/images/gallery/envato-mother-daughter.jpg",
    alt: "Mother shopping with child in a children's clothing store",
  },
  {
    id: 11,
    src: "/images/gallery/envato-mother-son.jpg",
    alt: "Mother and son choosing children's outfits in a retail store",
  },
];

