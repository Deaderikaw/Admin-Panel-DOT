import { logout } from "../../../../controllers/auth.controller";

export async function POST() {
  return logout();
}