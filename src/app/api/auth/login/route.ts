import { NextRequest } from "next/server";
import { login } from "../../../../controllers/auth.controller";

export async function POST(request: NextRequest) {
  return login(request);
}