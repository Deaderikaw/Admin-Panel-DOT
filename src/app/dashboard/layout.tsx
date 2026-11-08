"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [loading, setLoading] = useState(true);
  const [adminName, setAdminName] = useState("Admin");

  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "include",
        });

        if (!response.ok) {
          router.replace("/login");
          return;
        }

        const result = await response.json();

        // Sesuaikan dengan struktur response endpoint /api/auth/me.
        setAdminName(result.data?.name ?? result.admin?.name ?? "Admin");
        setLoading(false);
      } catch {
        router.replace("/login");
      }
    }

    checkAuth();
  }, [router]);

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } finally {
      router.replace("/login");
      router.refresh();
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Memeriksa autentikasi...
      </div>
    );
  }

  const menus = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Kategori", href: "/dashboard/categories" },
    { label: "Produk", href: "/dashboard/products" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-64 bg-gray-900 p-6 text-white">
        <h1 className="mb-10 text-xl font-bold">Admin Panel</h1>

        <nav className="space-y-2">
          {menus.map((menu) => (
            <Link
              key={menu.href}
              href={menu.href}
              className={`block rounded-lg px-4 py-3 text-sm transition ${
                pathname === menu.href
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-gray-800"
              }`}
            >
              {menu.label}
            </Link>
          ))}
        </nav>

        <div className="mt-10 border-t border-gray-700 pt-5">
          <p className="mb-3 text-sm text-gray-300">
            Login sebagai: {adminName}
          </p>

          <button
            onClick={handleLogout}
            className="w-full rounded-lg bg-red-600 px-4 py-2 text-sm hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1 p-8">
        {children}
      </main>
    </div>
  );
}