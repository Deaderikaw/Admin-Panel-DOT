
import { NextRequest } from "next/server";

import { requireAdmin } from "../../../services/lib/admin-auth";

import {
  getCategories,
  createCategory,
} from "../../../controllers/category.controller";

export async function GET(request: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  return await getCategories(request);
}

export async function POST(request: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  return await createCategory(request);
}
