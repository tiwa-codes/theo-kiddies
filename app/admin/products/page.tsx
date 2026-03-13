"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, Search, ExternalLink, X, Loader2, Upload, ChevronLeft, ChevronRight } from "lucide-react";
import { slugify } from "@/lib/utils";
import type { DbProduct } from "@/lib/supabase";

// ─── Form state type ────────────────────────────────────────────────────────
type FormState = {
  title: string;
  slug: string;
  price: string;
  compare_at_price: string;
  badge: string;
  age_group: string;
  category: string;
  images: string;      // newline-separated image URLs
  colors: string;      // comma-separated e.g. "Coral:coral, Sage:sage"
  sizes: string;       // comma-separated e.g. "XS:xs, S:s"
  in_stock: boolean;
  description: string;
};

const EMPTY_FORM: FormState = {
  title: "", slug: "", price: "", compare_at_price: "", badge: "",
  age_group: "Not specified", category: "Clothing",
  images: "", colors: "", sizes: "", in_stock: true, description: "",
};

const AGE_GROUPS = ["Not specified", "0-12 Months", "1-3 Years", "4-7 Years", "8-12 Years"];
const CATEGORIES = ["Clothing", "Shoes", "Toys", "School Supplies", "Baby Essentials", "Accessories"];
const AGE_OPTIONAL_CATEGORIES = new Set(["Shoes", "Accessories", "School Supplies"]);

// ─── Helpers ────────────────────────────────────────────────────────────────
function parseVariants(raw: string) {
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => {
      const [label, id] = s.split(":").map((x) => x.trim());
      return { id: id ?? slugify(label), label };
    });
}

function variantsToString(variants: { id: string; label: string }[]) {
  return variants.map((v) => `${v.label}:${v.id}`).join(", ");
}

function dbToForm(p: DbProduct): FormState {
  return {
    title: p.title,
    slug: p.slug,
    price: String(p.price),
    compare_at_price: p.compare_at_price ? String(p.compare_at_price) : "",
    badge: p.badge ?? "",
    age_group: p.age_group,
    category: p.category,
    images: p.images.join("\n"),
    colors: variantsToString(p.colors),
    sizes: variantsToString(p.sizes),
    in_stock: p.in_stock,
    description: p.description ?? "",
  };
}

// ─── Main page ───────────────────────────────────────────────────────────────
export default function AdminProductsPage() {
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [draggedImageIndex, setDraggedImageIndex] = useState<number | null>(null);
  const [importing, setImporting] = useState(false);
  const [importCategory, setImportCategory] = useState(CATEGORIES[0]);
  const [importAgeGroup, setImportAgeGroup] = useState(AGE_GROUPS[0]);

  // ── Load products ──────────────────────────────────────────────────────────
  async function loadProducts() {
    setLoading(true);
    const res = await fetch("/api/admin/products");
    const data = await res.json();
    setProducts(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => { loadProducts(); }, []);

  // ── Toast helper ──────────────────────────────────────────────────────────
  function showToast(msg: string, ok = true) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 4000);
  }

  // ── Open modal ────────────────────────────────────────────────────────────
  function openAdd() {
    setEditId(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  }

  function openEdit(p: DbProduct) {
    setEditId(p.id);
    setForm(dbToForm(p));
    setModalOpen(true);
  }

  // ── Field change ──────────────────────────────────────────────────────────
  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      // Auto-update slug when title changes (only for new products)
      if (key === "title" && !editId) {
        next.slug = slugify(value as string);
      }
      // For categories where age is usually irrelevant, default to Not specified.
      if (key === "category" && AGE_OPTIONAL_CATEGORIES.has(String(value)) && next.age_group !== "Not specified") {
        next.age_group = "Not specified";
      }
      return next;
    });
  }

  // ── Save ──────────────────────────────────────────────────────────────────
  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const body = {
        ...form,
        price: Number(form.price),
        compare_at_price: form.compare_at_price ? Number(form.compare_at_price) : null,
        images: form.images.split("\n").map((s) => s.trim()).filter(Boolean),
        colors: parseVariants(form.colors),
        sizes: parseVariants(form.sizes),
      };

      const url = editId ? `/api/admin/products/${editId}` : "/api/admin/products";
      const method = editId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed");

      showToast(editId ? "Product updated ✓" : "Product created ✓");
      setModalOpen(false);
      await loadProducts();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Error saving product", false);
    } finally {
      setSaving(false);
    }
  }

  async function uploadFiles(files: File[]) {
    if (!files.length) return;
    setUploading(true);
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));

      const res = await fetch("/api/admin/products/upload-image", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");

      const urls = Array.isArray(data.urls) ? data.urls : [];
      if (!urls.length) throw new Error("No uploaded image URL returned");

      setForm((prev) => ({
        ...prev,
        images: [prev.images, ...urls].filter(Boolean).join("\n"),
      }));
      showToast(`${urls.length} image${urls.length > 1 ? "s" : ""} uploaded ✓`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Image upload failed", false);
    } finally {
      setUploading(false);
    }
  }

  async function handleUploadImages(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    await uploadFiles(Array.from(files));
    e.target.value = "";
  }

  async function handleDropUpload(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files ?? []);
    if (!files.length) return;
    await uploadFiles(files);
  }

  const imageList = form.images
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  function updateImageList(next: string[]) {
    setField("images", next.join("\n"));
  }

  function removeImageAt(index: number) {
    const next = imageList.filter((_, i) => i !== index);
    updateImageList(next);
  }

  function moveImage(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= imageList.length) return;
    const next = [...imageList];
    const [picked] = next.splice(index, 1);
    next.splice(target, 0, picked);
    updateImageList(next);
  }

  function setCoverImage(index: number) {
    if (index <= 0 || index >= imageList.length) return;
    const next = [...imageList];
    const [picked] = next.splice(index, 1);
    next.unshift(picked);
    updateImageList(next);
  }

  function handleImageDragStart(index: number) {
    setDraggedImageIndex(index);
  }

  function handleImageDrop(index: number) {
    if (draggedImageIndex === null || draggedImageIndex === index) {
      setDraggedImageIndex(null);
      return;
    }

    const next = [...imageList];
    const [picked] = next.splice(draggedImageIndex, 1);
    next.splice(index, 0, picked);
    updateImageList(next);
    setDraggedImageIndex(null);
  }

  async function handleImportCsv(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    setImporting(true);
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));
      formData.append("category", importCategory);
      formData.append("age_group", importAgeGroup);

      const res = await fetch("/api/admin/products/import", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Import failed");

      showToast(`Imported ${data.imported} product${data.imported === 1 ? "" : "s"} from ${data.files} CSV file${data.files === 1 ? "" : "s"} ✓`);
      await loadProducts();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "CSV import failed", false);
    } finally {
      setImporting(false);
      e.target.value = "";
    }
  }

  // ── Delete ────────────────────────────────────────────────────────────────
  async function handleDelete(p: DbProduct) {
    if (!confirm(`Delete "${p.title}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/products/${p.id}`, { method: "DELETE" });
    if (res.ok) {
      showToast("Product deleted");
      setProducts((prev) => prev.filter((x) => x.id !== p.id));
    } else {
      showToast("Delete failed", false);
    }
  }

  const filtered = products.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  );

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-2xl px-6 py-3 text-sm font-semibold text-white shadow-float ${toast.ok ? "bg-brand-cocoa" : "bg-red-600"}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="mt-1 text-sm text-gray-500">
            {loading ? "Loading…" : `${products.length} product${products.length !== 1 ? "s" : ""} · Manage your catalogue`}
          </p>
        </div>
        <button
          type="button"
          onClick={openAdd}
          className="flex items-center gap-2 rounded-full bg-brand-orange px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-orange/90"
        >
          <Plus className="h-4 w-4" />
          Add product
        </button>
      </div>

      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-gray-900">Bulk import from Prokip CSV</h2>
            <p className="mt-1 text-sm text-gray-500">
              Upload one or many Prokip product export files. This importer uses only product name, selling price, and stock status.
            </p>
          </div>
          <label className={`inline-flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white transition ${importing ? "bg-brand-orange/70" : "bg-brand-orange hover:bg-brand-orange/90"}`}>
            {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {importing ? "Importing…" : "Upload CSV files"}
            <input
              type="file"
              accept=".csv,text/csv"
              multiple
              className="hidden"
              onChange={handleImportCsv}
              disabled={importing}
            />
          </label>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">Default age group (optional)</label>
            <select value={importAgeGroup} onChange={(e) => setImportAgeGroup(e.target.value)} className={inputCls} disabled={importing}>
              {AGE_GROUPS.map((age) => <option key={age}>{age}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">Default category</label>
            <select
              value={importCategory}
              onChange={(e) => {
                const category = e.target.value;
                setImportCategory(category);
                if (AGE_OPTIONAL_CATEGORIES.has(category) && importAgeGroup !== "Not specified") {
                  setImportAgeGroup("Not specified");
                }
              }}
              className={inputCls}
              disabled={importing}
            >
              {CATEGORIES.map((category) => <option key={category}>{category}</option>)}
            </select>
          </div>
        </div>

        <p className="mt-3 text-xs text-gray-400">
          Because the Prokip export does not include your storefront category or age group, every uploaded file in this batch will use the defaults above. For Shoes, Accessories, and School Supplies, age is auto-switched to "Not specified".
        </p>
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
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                <th className="px-5 py-3">Product</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Age</th>
                <th className="px-5 py-3">Price</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-gray-400">
                    {products.length === 0 ? "No products yet — click \u201cAdd product\u201d to create your first one." : "No products match your search."}
                  </td>
                </tr>
              )}
              {filtered.map((product) => (
                <tr key={product.id} className="transition hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      {product.images[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={product.images[0]} alt={product.title} className="h-9 w-9 flex-shrink-0 rounded-xl object-cover" />
                      ) : (
                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-brand-cream text-sm font-bold text-brand-orange">
                          {product.title[0]}
                        </div>
                      )}
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
                  <td className="px-5 py-3 text-gray-600">{product.age_group === "Not specified" ? "-" : product.age_group}</td>
                  <td className="px-5 py-3 font-semibold text-gray-900">
                    ₦{Number(product.price).toLocaleString("en-NG")}
                    {product.compare_at_price && (
                      <span className="ml-1 text-xs text-gray-400 line-through">₦{Number(product.compare_at_price).toLocaleString("en-NG")}</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${product.in_stock ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                      {product.in_stock ? "In stock" : "Out of stock"}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/product/${product.slug}`} target="_blank" className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700" title="View on storefront">
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                      <button type="button" onClick={() => openEdit(product)} className="rounded-lg p-1.5 text-gray-400 transition hover:bg-blue-50 hover:text-blue-600" title="Edit">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button type="button" onClick={() => handleDelete(product)} className="rounded-lg p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-600" title="Delete">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>

      {/* ── Add / Edit Modal ──────────────────────────────────────────────── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-3 pt-6 sm:p-4 sm:pt-12">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl">
            {/* Modal header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-bold text-gray-900">
                {editId ? "Edit product" : "Add product"}
              </h2>
              <button type="button" onClick={() => setModalOpen(false)} className="rounded-full p-1 text-gray-400 hover:bg-gray-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="divide-y divide-gray-100">
              <div className="space-y-4 px-6 py-5">
                <p className="text-xs font-semibold uppercase tracking-widest text-brand-orange/70">Basic info</p>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Product title <span className="text-red-500">*</span></label>
                  <input required value={form.title} onChange={(e) => setField("title", e.target.value)} className={inputCls} placeholder="e.g. CloudSoft Hoodie Set" />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-700">Slug <span className="text-red-500">*</span></label>
                    <input required value={form.slug} onChange={(e) => setField("slug", e.target.value)} className={inputCls} placeholder="auto-generated" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-700">Badge <span className="text-gray-400 font-normal">(optional)</span></label>
                    <input value={form.badge} onChange={(e) => setField("badge", e.target.value)} className={inputCls} placeholder="e.g. New, Best Seller" />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-700">Age group <span className="text-gray-400 font-normal">(optional)</span></label>
                    <select value={form.age_group} onChange={(e) => setField("age_group", e.target.value)} className={inputCls}>
                      {AGE_GROUPS.map((a) => <option key={a}>{a}</option>)}
                    </select>
                    <p className="mt-1 text-xs text-gray-400">
                      {AGE_OPTIONAL_CATEGORIES.has(form.category)
                        ? "This category usually does not need age tagging."
                        : "Choose Not specified if age does not apply."}
                    </p>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-700">Category <span className="text-red-500">*</span></label>
                    <select required value={form.category} onChange={(e) => setField("category", e.target.value)} className={inputCls}>
                      {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Description <span className="text-gray-400 font-normal">(shown on product page)</span></label>
                  <textarea rows={2} value={form.description} onChange={(e) => setField("description", e.target.value)} className={inputCls} placeholder="Short description of the product…" />
                </div>
              </div>

              <div className="space-y-4 px-6 py-5">
                <p className="text-xs font-semibold uppercase tracking-widest text-brand-orange/70">Pricing</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-700">Price (₦) <span className="text-red-500">*</span></label>
                    <input required type="number" min="0" step="0.01" value={form.price} onChange={(e) => setField("price", e.target.value)} className={inputCls} placeholder="e.g. 4200" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-700">Compare-at price (₦) <span className="text-gray-400 font-normal">(optional)</span></label>
                    <input type="number" min="0" step="0.01" value={form.compare_at_price} onChange={(e) => setField("compare_at_price", e.target.value)} className={inputCls} placeholder="Leave blank if no sale" />
                  </div>
                </div>
              </div>

              <div className="space-y-4 px-6 py-5">
                <p className="text-xs font-semibold uppercase tracking-widest text-brand-orange/70">Images &amp; variants</p>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Image URLs <span className="text-gray-400 font-normal">(one per line)</span></label>
                  <textarea rows={3} value={form.images} onChange={(e) => setField("images", e.target.value)} className={inputCls} placeholder={"https://your-bucket.supabase.co/storage/v1/object/public/products/img1.jpg\nhttps://…"} />
                  <div
                    className={`mt-3 rounded-2xl border-2 border-dashed p-4 text-center transition ${
                      dragActive ? "border-brand-orange bg-brand-orange/5" : "border-brand-orange/20 bg-gray-50"
                    }`}
                    onDragEnter={(e) => {
                      e.preventDefault();
                      setDragActive(true);
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragActive(true);
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      setDragActive(false);
                    }}
                    onDrop={handleDropUpload}
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-orange/70">
                      Drag and drop images here
                    </p>
                    <p className="mt-1 text-xs text-gray-500">PNG, JPG, WebP up to your Supabase bucket limit</p>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-brand-orange/20 px-3 py-1.5 text-xs font-semibold text-brand-orange transition hover:bg-brand-orange/5">
                      {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                      {uploading ? "Uploading..." : "Upload image files"}
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleUploadImages}
                        disabled={uploading}
                      />
                    </label>
                    <p className="text-xs text-gray-400">or paste image URLs manually.</p>
                  </div>

                  {imageList.length > 0 && (
                    <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {imageList.map((url, index) => (
                        <div
                          key={`${url}-${index}`}
                          className={`overflow-hidden rounded-xl border bg-white ${
                            draggedImageIndex === index ? "border-brand-orange" : "border-gray-200"
                          }`}
                          draggable
                          onDragStart={() => handleImageDragStart(index)}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={() => handleImageDrop(index)}
                          onDragEnd={() => setDraggedImageIndex(null)}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={url} alt={`Product image ${index + 1}`} className="h-24 w-full object-cover" />
                          <div className="flex items-center justify-between gap-1 p-2">
                            <div>
                              <p className="text-[10px] font-semibold text-gray-500">#{index + 1}</p>
                              {index === 0 && (
                                <p className="text-[10px] font-semibold text-brand-orange">Cover</p>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                className="rounded-md p-1 text-brand-orange hover:bg-brand-orange/10 disabled:opacity-40"
                                onClick={() => setCoverImage(index)}
                                disabled={index === 0}
                                aria-label="Set as cover image"
                                title="Set as cover"
                              >
                                <Upload className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                className="rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                                onClick={() => moveImage(index, -1)}
                                disabled={index === 0}
                                aria-label="Move image left"
                              >
                                <ChevronLeft className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                className="rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                                onClick={() => moveImage(index, 1)}
                                disabled={index === imageList.length - 1}
                                aria-label="Move image right"
                              >
                                <ChevronRight className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                className="rounded-md p-1 text-red-500 hover:bg-red-50"
                                onClick={() => removeImageAt(index)}
                                aria-label="Remove image"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-700">Colors <span className="text-gray-400 font-normal">(Label:id, …)</span></label>
                    <input value={form.colors} onChange={(e) => setField("colors", e.target.value)} className={inputCls} placeholder="Warm Coral:coral, Soft Sage:sage" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-700">Sizes <span className="text-gray-400 font-normal">(Label:id, …)</span></label>
                    <input value={form.sizes} onChange={(e) => setField("sizes", e.target.value)} className={inputCls} placeholder="XS:xs, S:s, M:m" />
                  </div>
                </div>

                <label className="flex cursor-pointer items-center gap-3">
                  <input type="checkbox" checked={form.in_stock} onChange={(e) => setField("in_stock", e.target.checked)} className="h-4 w-4 rounded accent-brand-orange" />
                  <span className="text-sm font-semibold text-gray-700">In stock</span>
                </label>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 px-6 py-4">
                <button type="button" onClick={() => setModalOpen(false)} className="rounded-full border border-gray-200 px-5 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="flex items-center gap-2 rounded-full bg-brand-orange px-5 py-2 text-sm font-semibold text-white hover:bg-brand-orange/90 disabled:opacity-60">
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {saving ? "Saving…" : editId ? "Save changes" : "Create product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const inputCls = "w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:border-brand-orange/40 focus:outline-none focus:ring-2 focus:ring-brand-orange/20";
