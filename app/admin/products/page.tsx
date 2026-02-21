"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, Search, ExternalLink } from "lucide-react";
import { products as initialProducts } from "@/lib/data";
import type { Product } from "@/types";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState("");

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this product? (This only affects the local mock data)")) return;
    setProducts((prev) => prev.filter((p) => p.id !== id));
    showToast("Product removed from view. Connect a real backend to persist changes.");
  }

  const filtered = products.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-2xl bg-brand-cocoa px-6 py-3 text-sm font-semibold text-white shadow-float">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="mt-1 text-sm text-gray-500">
            {products.length} products · Manage your catalogue
          </p>
        </div>
        <button
          type="button"
          onClick={() => showToast("Add product: connect a CMS or database to enable real creation.")}
          className="flex items-center gap-2 rounded-full bg-brand-orange px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-orange/90"
        >
          <Plus className="h-4 w-4" />
          Add product
        </button>
      </div>

      {/* Backend notice */}
      <div className="mb-5 rounded-2xl border border-dashed border-amber-300 bg-amber-50 px-5 py-3 text-sm text-amber-800">
        <strong>Mock data only.</strong> Connect a real CMS (Sanity, Contentful, Shopify) or database to
        enable persistent create, update, and delete operations.
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search products…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-4 text-sm focus:border-brand-orange/40 focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
        />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
              <th className="px-5 py-3">Product</th>
              <th className="px-5 py-3">Category</th>
              <th className="px-5 py-3">Age</th>
              <th className="px-5 py-3">Price</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Rating</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-gray-400">
                  No products found.
                </td>
              </tr>
            )}
            {filtered.map((product) => (
              <tr key={product.id} className="transition hover:bg-gray-50">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-brand-cream text-sm font-bold text-brand-orange">
                      {product.title[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{product.title}</p>
                      {product.badge && (
                        <span className="inline-block rounded-full bg-brand-orange/10 px-2 py-0.5 text-[10px] font-semibold text-brand-orange">
                          {product.badge}
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 text-gray-600">{product.category}</td>
                <td className="px-5 py-3 text-gray-600">{product.ageGroup}</td>
                <td className="px-5 py-3 font-semibold text-gray-900">
                  ₦{product.price}
                  {product.compareAtPrice && (
                    <span className="ml-1 text-xs text-gray-400 line-through">
                      ₦{product.compareAtPrice}
                    </span>
                  )}
                </td>
                <td className="px-5 py-3">
                  <span
                    className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                      product.inStock
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {product.inStock ? "In stock" : "Out of stock"}
                  </span>
                </td>
                <td className="px-5 py-3 text-gray-600">
                  ⭐ {product.rating} ({product.reviews})
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/product/${product.slug}`}
                      target="_blank"
                      className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                      title="View on storefront"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={() =>
                        showToast(`Edit "${product.title}": connect a backend to enable editing.`)
                      }
                      className="rounded-lg p-1.5 text-gray-400 transition hover:bg-blue-50 hover:text-blue-600"
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(product.id)}
                      className="rounded-lg p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
