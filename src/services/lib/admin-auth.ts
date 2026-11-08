import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "./prisma";
import { verifyToken } from "./auth";

export async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;

  if (!token) {
    return NextResponse.json(
      { success: false, message: "Unauthorized. Silakan login terlebih dahulu." },
      { status: 401 }
    );
  }

  const payload = await verifyToken(token);

  if (!payload || typeof payload.id !== "number") {
    return NextResponse.json(
      { success: false, message: "Token tidak valid atau sudah kedaluwarsa." },
      { status: 401 }
    );
  }

  const admin = await prisma.admins.findUnique({
    where: { id: payload.id },
    select: { id: true },
  });

  if (!admin) {
    return NextResponse.json(
      { success: false, message: "Admin tidak ditemukan." },
      { status: 401 }
    );
  }

  return null;
}