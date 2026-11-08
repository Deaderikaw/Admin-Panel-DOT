import { NextRequest, NextResponse } from "next/server";
import {
  getProductById,
  updateProduct,
  deleteProduct,
} from "../../../../controllers/product.controller";
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
  const productId = parseId(id);

  if (!productId) {
    return NextResponse.json(
      { success: false, message: "ID produk tidak valid." },
      { status: 400 }
    );
  }

  return getProductById(productId);
}

export async function PUT(
  request: NextRequest,
  { params }: RouteContext
) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const productId = parseId(id);

  if (!productId) {
    return NextResponse.json(
      { success: false, message: "ID produk tidak valid." },
      { status: 400 }
    );
  }

  return updateProduct(request, productId);
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteContext
) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const productId = parseId(id);

  if (!productId) {
    return NextResponse.json(
      { success: false, message: "ID produk tidak valid." },
      { status: 400 }
    );
  }

  return deleteProduct(productId);
}