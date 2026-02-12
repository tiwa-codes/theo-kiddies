export type ProductVariant = {
  id: string;
  label: string;
};

export type Product = {
  id: string;
  slug: string;
  title: string;
  price: number;
  compareAtPrice?: number;
  badge?: string;
  ageGroup: string;
  category: string;
  images: string[];
  rating: number;
  reviews: number;
  colors: ProductVariant[];
  sizes: ProductVariant[];
  inStock: boolean;
};

export type Category = {
  title: string;
  slug: string;
  description: string;
  icon: string;
};
