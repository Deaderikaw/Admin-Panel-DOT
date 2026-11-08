
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

import { prisma } from "../services/lib/prisma";
import {
  createToken,
  verifyToken,
} from "../services/lib/auth";

// POST: Login admin
export async function login(request: NextRequest) {
  try {
    const body = await request.json();

    const email =
      typeof body.email === "string"
        ? body.email.trim()
        : "";

    const password =
      typeof body.password === "string"
        ? body.password
        : "";

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Email dan password wajib diisi",
        },
        { status: 400 }
      );
    }

    // Mencari admin berdasarkan email
    const admin = await prisma.admins.findUnique({
      where: { email },
    });

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: "Email atau password salah",
        },
        { status: 401 }
      );
    }

    // Memverifikasi password
    const passwordMatch = await bcrypt.compare(
      password,
      admin.password
    );

    if (!passwordMatch) {
      return NextResponse.json(
        {
          success: false,
          message: "Email atau password salah",
        },
        { status: 401 }
      );
    }

    // Membuat JWT
    const token = await createToken({
      id: admin.id,
      name: admin.name,
      email: admin.email,
    });

    const response = NextResponse.json({
      success: true,
      message: "Login berhasil",
      data: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
      },
    });

    // Menyimpan token dalam HTTP-only cookie
    response.cookies.set("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat login",
      },
      { status: 500 }
    );
  }
}

// GET: Mengecek admin yang sedang login
export async function getCurrentAdmin() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);

    if (!payload || typeof payload.id !== "number") {
      return NextResponse.json(
        {
          success: false,
          message: "Session tidak valid atau sudah kedaluwarsa",
        },
        { status: 401 }
      );
    }

    const admin = await prisma.admins.findUnique({
      where: {
        id: payload.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: "Admin tidak ditemukan",
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Admin berhasil ditemukan",
      data: admin,
    });
  } catch (error) {
    console.error("GET CURRENT ADMIN ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil data admin",
      },
      { status: 500 }
    );
  }
}

// POST: Logout admin
export async function logout() {
  const response = NextResponse.json({
    success: true,
    message: "Logout berhasil",
  });

  response.cookies.set("admin_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}
