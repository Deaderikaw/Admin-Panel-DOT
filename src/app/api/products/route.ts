import { NextRequest } from "next/server";
import {
  getProducts,
  createProduct,
} from "../../../controllers/product.controller";
import { requireAdmin } from "../../../services/lib/admin-auth";

export async function GET(request: NextRequest) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  return getProducts(request);
}

export async function POST(request: NextRequest) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  return createProduct(request);
}