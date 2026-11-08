
"use client";

import { useCallback, useEffect, useState, FormEvent } from "react";

type Category = {
  id: number;
  name: string;
};

type Product = {
  id: number;
  category_id: number;
  name: string;
  description: string | null;
  price: number | string;
  stock: number | null;
  status: string | null;
  categories?: Category;
};

type ProductForm = {
  category_id: string;
  name: string;
  description: string;
  price: string;
  stock: string;
  status: string;
};

const initialForm: ProductForm = {
  category_id: "",
  name: "",
  description: "",
  price: "",
  stock: "0",
  status: "active",
};

// Mendukung response API berbentuk { data: [...] }
// maupun { products: [...] }.
function getArray<T>(result: any): T[] {
  if (Array.isArray(result)) return result;
  if (Array.isArray(result.data)) return result.data;
  if (Array.isArray(result.products)) return result.products;
  if (Array.isArray(result.categories)) return result.categories;
  return [];
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ProductForm>(initialForm);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [productResponse, categoryResponse] = await Promise.all([
        fetch("/api/products", { credentials: "include" }),
        fetch("/api/categories", { credentials: "include" }),
      ]);

      const productResult = await productResponse.json();
      const categoryResult = await categoryResponse.json();

      if (!productResponse.ok) {
        throw new Error(productResult.message || "Gagal mengambil data produk.");
      }

      if (!categoryResponse.ok) {
        throw new Error(categoryResult.message || "Gagal mengambil data kategori.");
      }

      setProducts(getArray<Product>(productResult));
      setCategories(getArray<Category>(categoryResult));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory =
      !categoryFilter ||
      product.category_id === Number(categoryFilter);

    return matchesSearch && matchesCategory;
  });

  function openAddModal() {
    setEditingId(null);
    setForm(initialForm);
    setShowModal(true);
    setError("");
    setSuccess("");
  }

  function openEditModal(product: Product) {
    setEditingId(product.id);
    setForm({
      category_id: String(product.category_id),
      name: product.name,
      description: product.description ?? "",
      price: String(product.price),
      stock: String(product.stock ?? 0),
      status: product.status ?? "active",
    });
    setShowModal(true);
    setError("");
    setSuccess("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const url = editingId
        ? `/api/products/${editingId}`
        : "/api/products";

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          category_id: Number(form.category_id),
          name: form.name.trim(),
          description: form.description.trim(),
          price: Number(form.price),
          stock: Number(form.stock),
          status: form.status,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal menyimpan produk.");
      }

      setShowModal(false);
      setSuccess(editingId
        ? "Produk berhasil diperbarui."
        : "Produk berhasil ditambahkan."
      );

      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(product: Product) {
    const confirmed = window.confirm(
      `Yakin ingin menghapus produk "${product.name}"?`
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal menghapus produk.");
      }

      setSuccess("Produk berhasil dihapus.");
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    }
  }

  function formatPrice(price: number | string) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(Number(price));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Manajemen Produk
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Kelola seluruh data produk toko.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="rounded-lg bg-emerald-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-emerald-700"
        >
          + Tambah Produk
        </button>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
          {success}
        </div>
      )}

      <div       className="flex flex-col gap-3 rounded-xl border border-emerald-100/70 bg-white p-4 shadow-sm sm:flex-row">
        <input
          type="text"
          placeholder="Cari nama produk..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
        />

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
        >
          <option value="">Semua Kategori</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border border-emerald-100/70 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-emerald-50/60 text-slate-500">
              <tr>
                <th className="px-5 py-4">No.</th>
                <th className="px-5 py-4">Nama Produk</th>
                <th className="px-5 py-4">Kategori</th>
                <th className="px-5 py-4">Harga</th>
                <th className="px-5 py-4">Stok</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-gray-500">
                    Memuat data produk...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-gray-500">
                    Data produk tidak ditemukan.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product, index) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4">{index + 1}</td>
                    <td className="px-5 py-4 font-medium text-gray-900">
                      {product.name}
                    </td>
                    <td className="px-5 py-4">
                      {product.categories?.name ??
                        categories.find(c => c.id === product.category_id)?.name ??
                        "-"}
                    </td>
                    <td className="px-5 py-4">
                      {formatPrice(product.price)}
                    </td>
                    <td className="px-5 py-4">{product.stock ?? 0}</td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                        product.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}>
                        {product.status ?? "inactive"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-3">
                        <button
                          onClick={() => openEditModal(product)}
                          className="font-medium text-emerald-700 hover:text-emerald-800"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(product)}
                          className="font-medium text-red-600 hover:text-red-800"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t px-5 py-4 text-sm text-gray-500">
          Menampilkan {filteredProducts.length} dari {products.length} produk
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4">
          <div className="my-8 w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {editingId ? "Edit Produk" : "Tambah Produk"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-2xl text-gray-400 hover:text-gray-700"
                aria-label="Tutup"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Nama Produk
                </label>
                <input
                  required
                  maxLength={150}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  placeholder="Masukkan nama produk"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Kategori
                </label>
                <select
                  required
                  value={form.category_id}
                  onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                >
                  <option value="">Pilih kategori</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Deskripsi
                </label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  placeholder="Deskripsi produk"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Harga (Rp)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    placeholder="100000"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Stok
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    required
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Status
                </label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-emerald-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
                >
                  {saving ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
