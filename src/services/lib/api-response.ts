
import { NextResponse } from "next/server";

// Response ketika request berhasil
export function successResponse<T>(
  data: T,
  message = "Request berhasil",
  status = 200
) {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
    },
    { status }
  );
}

// Response ketika request gagal
export function errorResponse(
  message: string,
  status = 400
) {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    { status }
  );
}

// Standardisasi error dari API dan Prisma
export function handleApiError(error: unknown) {
  console.error("API Error:", error);

  const prismaError = error as {
    code?: string;
  };

  switch (prismaError?.code) {
    // Data duplikat
    case "P2002":
      return errorResponse(
        "Data sudah tersedia atau terjadi duplikasi.",
        409
      );

    // Data tidak ditemukan
    case "P2025":
      return errorResponse(
        "Data tidak ditemukan.",
        404
      );

    // Relasi masih digunakan
    case "P2003":
      return errorResponse(
        "Data tidak dapat diproses karena masih memiliki relasi dengan data lain.",
        409
      );

    // Database tidak dapat dijangkau
    case "P1001":
    case "P1002":
    case "P1017":
      return errorResponse(
        "Database sedang tidak dapat diakses. Silakan coba kembali.",
        503
      );

    default:
      return errorResponse(
        "Terjadi kesalahan pada server. Silakan coba kembali.",
        500
      );
  }
}
