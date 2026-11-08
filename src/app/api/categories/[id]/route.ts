import { NextRequest, NextResponse } from "next/server";
import {
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../../../../controllers/category.controller";
import { requireAdmin } from "../../../../services/lib/admin-auth";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function parseId(id: string) {
  const parsed = Number(id);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export async function GET(
  request: NextRequest,
  { params }: RouteContext
) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const categoryId = parseId(id);

  if (!categoryId) {
    return NextResponse.json(
      { success: false, message: "ID kategori tidak valid." },
      { status: 400 }
    );
  }

  return getCategoryById(categoryId);
}

export async function PUT(
  request: NextRequest,
  { params }: RouteContext
) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const categoryId = parseId(id);

  if (!categoryId) {
    return NextResponse.json(
      { success: false, message: "ID kategori tidak valid." },
      { status: 400 }
    );
  }

  return updateCategory(request, categoryId);
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteContext
) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const categoryId = parseId(id);

  if (!categoryId) {
    return NextResponse.json(
      { success: false, message: "ID kategori tidak valid." },
      { status: 400 }
    );
  }

  return deleteCategory(categoryId);
}