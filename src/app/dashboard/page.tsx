"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

type RecentProduct = {
  id: number;
  name: string;
  price: number | string;
  stock: number | null;
  status: string | null;
  categories: {
    name: string;
  };
};

type DashboardData = {
  totalProducts: number;
  totalCategories: number;
  totalStock: number;
  activeProducts: number;
  inactiveProducts: number;
  recentProducts: RecentProduct[];
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/dashboard", {
        credentials: "include",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Gagal mengambil data dashboard."
        );
      }

      setData(result.data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  function formatPrice(price: number | string) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(Number(price));
  }

  const statistics = [
    {
      title: "Total Produk",
      value: data?.totalProducts ?? 0,
      description: "Produk terdaftar",
      color: "bg-emerald-100 text-emerald-700",
    },
    {
      title: "Total Kategori",
      value: data?.totalCategories ?? 0,
      description: "Kategori tersedia",
      color: "bg-lime-100 text-lime-700",
    },
    {
      title: "Total Stok",
      value: data?.totalStock ?? 0,
      description: "Jumlah seluruh stok",
      color: "bg-teal-100 text-teal-700",
    },
    {
      title: "Produk Aktif",
      value: data?.activeProducts ?? 0,
      description: `${data?.inactiveProducts ?? 0} produk tidak aktif`,
      color: "bg-green-100 text-green-700",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Ringkasan informasi dan aktivitas pengelolaan produk.
          </p>
        </div>

        <button
          onClick={loadDashboard}
          disabled={loading}
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 disabled:opacity-50"
        >
          {loading ? "Memuat..." : "↻ Refresh Data"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {statistics.map((item) => (
          <div
            key={item.title}
            className="rounded-xl border border-emerald-100/70 bg-white p-5 shadow-sm shadow-emerald-900/5"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">
                {item.title}
              </p>
              <span className={`h-2 w-10 rounded-full ${item.color}`} />
            </div>

            <p className="mt-4 text-3xl font-bold text-gray-900">
              {loading ? "..." : item.value.toLocaleString("id-ID")}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              {item.description}
            </p>
          </div>
        ))}
      </div>

      {/* Quick Access */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Akses Cepat
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Link
            href="/dashboard/products"
            className="rounded-xl border border-emerald-100/70 bg-white p-5 shadow-sm transition hover:border-emerald-300 hover:shadow-md"
          >
            <h3 className="font-semibold text-gray-900">
              Manajemen Produk
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Tambah, edit, hapus, dan cari produk.
            </p>
            <p className="mt-4 text-sm font-medium text-emerald-700">
              Kelola Produk →
            </p>
          </Link>

          <Link
            href="/dashboard/categories"
            className="rounded-xl border border-emerald-100/70 bg-white p-5 shadow-sm transition hover:border-emerald-300 hover:shadow-md"
          >
            <h3 className="font-semibold text-gray-900">
              Manajemen Kategori
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Kelola kategori untuk mengelompokkan produk.
            </p>
            <p className="mt-4 text-sm font-medium text-emerald-700">
              Kelola Kategori →
            </p>
          </Link>
        </div>
      </div>

      {/* Recent Products */}
      <div className="overflow-hidden rounded-xl border border-emerald-100/70 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <h2 className="font-semibold text-gray-900">
              Produk Terbaru
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              Lima produk terakhir yang ditambahkan.
            </p>
          </div>

          <Link
            href="/dashboard/products"
            className="text-sm font-medium text-emerald-700 hover:text-emerald-800"
          >
            Lihat Semua →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-5 py-4">Nama Produk</th>
                <th className="px-5 py-4">Kategori</th>
                <th className="px-5 py-4">Harga</th>
                <th className="px-5 py-4">Stok</th>
                <th className="px-5 py-4">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-gray-500">
                    Memuat data...
                  </td>
                </tr>
              ) : !data?.recentProducts.length ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-gray-500">
                    Belum ada produk.
                  </td>
                </tr>
              ) : (
                data.recentProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4 font-medium text-gray-900">
                      {product.name}
                    </td>
                    <td className="px-5 py-4 text-gray-600">
                      {product.categories?.name ?? "-"}
                    </td>
                    <td className="px-5 py-4 text-gray-600">
                      {formatPrice(product.price)}
                    </td>
                    <td className="px-5 py-4 text-gray-600">
                      {product.stock ?? 0}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          product.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {product.status ?? "inactive"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}