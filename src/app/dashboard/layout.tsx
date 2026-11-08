"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";

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
    <div className="flex min-h-screen bg-[#f6faf7]">
    <aside className="w-64 border-r border-emerald-100 bg-white p-6 text-slate-800">
      <div className="mb-10 flex items-center gap-3">
        <Image
          src="/logo.png"
          alt="Logo Admin Panel"
          width={40}
          height={40}
          className="h-10 w-10 object-contain"
        />
        <h1 className="text-xl font-bold tracking-tight">Admin Panel</h1>
      </div>

        <nav className="space-y-2">
          {menus.map((menu) => (
            <Link
              key={menu.href}
              href={menu.href}
              className={`block rounded-lg px-4 py-3 text-sm transition ${
                pathname === menu.href
                  ? "bg-emerald-50 font-semibold text-emerald-700"
                  : "text-slate-500 hover:bg-emerald-50 hover:text-emerald-700"
              }`}
            >
              {menu.label}
            </Link>
          ))}
        </nav>

        <div className="mt-10 border-t border-slate-100 pt-5">
          <p className="mb-3 text-sm text-slate-500">
            Login sebagai: {adminName}
          </p>

          <button
            onClick={handleLogout}
            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
          >
            Logout
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1 p-6 sm:p-8">
        {children}
      </main>
    </div>
  );
}