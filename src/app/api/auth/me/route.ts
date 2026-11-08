import { getCurrentAdmin } from "../../../../controllers/auth.controller";

export async function GET() {
  return getCurrentAdmin();
}