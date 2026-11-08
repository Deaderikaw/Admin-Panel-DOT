
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../services/lib/prisma";

// GET: Mengambil semua kategori
export async function getCategories(request?: NextRequest) {
  try {
    // Mengambil keyword pencarian dari query parameter
    const search = request?.nextUrl.searchParams.get("search")?.trim();

    const categories = await prisma.categories.findMany({
      where: search
        ? {
            name: {
              contains: search,
            },
          }
        : undefined,
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: {
        id: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Data kategori berhasil diambil",
      data: categories,
    });
  } catch (error) {
    console.error("GET CATEGORIES ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil data kategori",
      },
      { status: 500 }
    );
  }
}

// POST: Menambahkan kategori
export async function createCategory(request: NextRequest) {
  try {
    const body = await request.json();

    const name =
      typeof body.name === "string" ? body.name.trim() : "";

    const description =
      typeof body.description === "string"
        ? body.description.trim()
        : null;

    // Validasi nama kategori
    if (!name) {
      return NextResponse.json(
        {
          success: false,
          message: "Nama kategori wajib diisi",
        },
        { status: 400 }
      );
    }

    // Validasi panjang nama
    if (name.length > 100) {
      return NextResponse.json(
        {
          success: false,
          message: "Nama kategori maksimal 100 karakter",
        },
        { status: 400 }
      );
    }

    // Validasi description
    if (
      body.description !== undefined &&
      body.description !== null &&
      typeof body.description !== "string"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Deskripsi kategori harus berupa teks",
        },
        { status: 400 }
      );
    }

    const category = await prisma.categories.create({
      data: {
        name,
        description: description || null,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Kategori berhasil ditambahkan",
        data: category,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("CREATE CATEGORY ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal menambahkan kategori",
      },
      { status: 500 }
    );
  }
}

// GET: Mengambil detail kategori berdasarkan ID
export async function getCategoryById(id: number) {
  try {
    const category = await prisma.categories.findUnique({
      where: { id },
      include: {
        products: true,
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          message: "Kategori tidak ditemukan",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Detail kategori berhasil diambil",
      data: category,
    });
  } catch (error) {
    console.error("GET CATEGORY ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil detail kategori",
      },
      { status: 500 }
    );
  }
}

// PUT: Mengubah kategori
export async function updateCategory(
  request: NextRequest,
  id: number
) {
  try {
    const body = await request.json();

    const name =
      typeof body.name === "string" ? body.name.trim() : "";

    const description =
      typeof body.description === "string"
        ? body.description.trim()
        : null;

    // Validasi nama kategori
    if (!name) {
      return NextResponse.json(
        {
          success: false,
          message: "Nama kategori wajib diisi",
        },
        { status: 400 }
      );
    }

    if (name.length > 100) {
      return NextResponse.json(
        {
          success: false,
          message: "Nama kategori maksimal 100 karakter",
        },
        { status: 400 }
      );
    }

    // Validasi description
    if (
      body.description !== undefined &&
      body.description !== null &&
      typeof body.description !== "string"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Deskripsi kategori harus berupa teks",
        },
        { status: 400 }
      );
    }

    const category = await prisma.categories.update({
      where: { id },
      data: {
        name,
        description: description || null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Kategori berhasil diperbarui",
      data: category,
    });
  } catch (error) {
    console.error("UPDATE CATEGORY ERROR:", error);

    // Data kategori tidak ditemukan
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Kategori tidak ditemukan",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Gagal memperbarui kategori",
      },
      { status: 500 }
    );
  }
}

// DELETE: Menghapus kategori
export async function deleteCategory(id: number) {
  try {
    await prisma.categories.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Kategori berhasil dihapus",
    });
  } catch (error) {
    console.error("DELETE CATEGORY ERROR:", error);

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error
    ) {
      // Kategori tidak ditemukan
      if (error.code === "P2025") {
        return NextResponse.json(
          {
            success: false,
            message: "Kategori tidak ditemukan",
          },
          { status: 404 }
        );
      }

      // Kategori masih digunakan oleh produk
      if (error.code === "P2003") {
        return NextResponse.json(
          {
            success: false,
            message:
              "Kategori tidak dapat dihapus karena masih digunakan oleh produk",
          },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        message: "Gagal menghapus kategori",
      },
      { status: 500 }
    );
  }
}
