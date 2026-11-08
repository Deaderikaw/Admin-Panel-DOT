import { NextResponse } from "next/server";
import { prisma } from "../../../services/lib/prisma";
import { requireAdmin } from "../../../services/lib/admin-auth";

export async function GET() {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const [
      totalProducts,
      totalCategories,
      stockResult,
      activeProducts,
      inactiveProducts,
      recentProducts,
    ] = await Promise.all([
      prisma.products.count(),
      prisma.categories.count(),

      prisma.products.aggregate({
        _sum: { stock: true },
      }),

      prisma.products.count({
        where: { status: "active" },
      }),

      prisma.products.count({
        where: { status: "inactive" },
      }),

      prisma.products.findMany({
        take: 5,
        orderBy: { created_at: "desc" },
        include: {
          categories: true,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        totalProducts,
        totalCategories,
        totalStock: stockResult._sum.stock ?? 0,
        activeProducts,
        inactiveProducts,
        recentProducts,
      },
    });
  } catch (error) {
    console.error("Dashboard API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil statistik dashboard.",
      },
      { status: 500 }
    );
  }
}