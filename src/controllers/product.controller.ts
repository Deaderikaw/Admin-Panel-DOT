
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../services/lib/prisma";

// GET: Mengambil semua produk
export async function getProducts(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const search = searchParams.get("search")?.trim();
    const categoryIdParam = searchParams.get("category_id");

    // Validasi filter category_id
    let categoryId: number | undefined;

    if (categoryIdParam) {
      categoryId = Number(categoryIdParam);

      if (!Number.isInteger(categoryId) || categoryId <= 0) {
        return NextResponse.json(
          {
            success: false,
            message: "Category ID tidak valid",
          },
          { status: 400 }
        );
      }
    }

    const products = await prisma.products.findMany({
      where: {
        ...(search
          ? {
              name: {
                contains: search,
              },
            }
          : {}),
        ...(categoryId
          ? {
              category_id: categoryId,
            }
          : {}),
      },
      include: {
        categories: true,
      },
      orderBy: {
        id: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Data produk berhasil diambil",
      data: products,
    });
  } catch (error) {
    console.error("GET PRODUCTS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil data produk",
      },
      { status: 500 }
    );
  }
}

// POST: Menambahkan produk
export async function createProduct(request: NextRequest) {
  try {
    const body = await request.json();

    const name =
      typeof body.name === "string" ? body.name.trim() : "";

    const description =
      typeof body.description === "string"
        ? body.description.trim()
        : null;

    const categoryId = Number(body.category_id);
    const price = Number(body.price);

    const stock =
      body.stock === undefined ? 0 : Number(body.stock);

    const status =
      body.status === undefined ? "active" : body.status;

    // Validasi nama produk
    if (!name) {
      return NextResponse.json(
        {
          success: false,
          message: "Nama produk wajib diisi",
        },
        { status: 400 }
      );
    }

    if (name.length > 150) {
      return NextResponse.json(
        {
          success: false,
          message: "Nama produk maksimal 150 karakter",
        },
        { status: 400 }
      );
    }

    // Validasi kategori
    if (!Number.isInteger(categoryId) || categoryId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Category ID wajib diisi dan harus valid",
        },
        { status: 400 }
      );
    }

    // Validasi harga
    if (!Number.isFinite(price) || price < 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Harga harus berupa angka dan tidak boleh negatif",
        },
        { status: 400 }
      );
    }

    // Validasi stok
    if (!Number.isInteger(stock) || stock < 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Stok harus berupa bilangan bulat dan tidak boleh negatif",
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
          message: "Deskripsi harus berupa teks",
        },
        { status: 400 }
      );
    }

    // Validasi status
    if (!["active", "inactive"].includes(status)) {
      return NextResponse.json(
        {
          success: false,
          message: "Status harus active atau inactive",
        },
        { status: 400 }
      );
    }

    // Memastikan kategori tersedia
    const category = await prisma.categories.findUnique({
      where: {
        id: categoryId,
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

    const product = await prisma.products.create({
      data: {
        name,
        description: description || null,
        category_id: categoryId,
        price,
        stock,
        status,
      },
      include: {
        categories: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Produk berhasil ditambahkan",
        data: product,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("CREATE PRODUCT ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal menambahkan produk",
      },
      { status: 500 }
    );
  }
}

// GET: Mengambil detail produk berdasarkan ID
export async function getProductById(id: number) {
  try {
    const product = await prisma.products.findUnique({
      where: {
        id,
      },
      include: {
        categories: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message: "Produk tidak ditemukan",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Detail produk berhasil diambil",
      data: product,
    });
  } catch (error) {
    console.error("GET PRODUCT ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil detail produk",
      },
      { status: 500 }
    );
  }
}

// PUT: Mengubah produk
export async function updateProduct(
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

    const categoryId = Number(body.category_id);
    const price = Number(body.price);

    const stock = Number(body.stock);
    const status = body.status;

    // Validasi nama produk
    if (!name) {
      return NextResponse.json(
        {
          success: false,
          message: "Nama produk wajib diisi",
        },
        { status: 400 }
      );
    }

    if (name.length > 150) {
      return NextResponse.json(
        {
          success: false,
          message: "Nama produk maksimal 150 karakter",
        },
        { status: 400 }
      );
    }

    // Validasi kategori
    if (!Number.isInteger(categoryId) || categoryId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Category ID tidak valid",
        },
        { status: 400 }
      );
    }

    // Validasi harga
    if (!Number.isFinite(price) || price < 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Harga harus berupa angka dan tidak boleh negatif",
        },
        { status: 400 }
      );
    }

    // Validasi stok
    if (!Number.isInteger(stock) || stock < 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Stok harus berupa bilangan bulat dan tidak boleh negatif",
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
          message: "Deskripsi harus berupa teks",
        },
        { status: 400 }
      );
    }

    // Validasi status
    if (!["active", "inactive"].includes(status)) {
      return NextResponse.json(
        {
          success: false,
          message: "Status harus active atau inactive",
        },
        { status: 400 }
      );
    }

    // Memastikan kategori tersedia
    const category = await prisma.categories.findUnique({
      where: {
        id: categoryId,
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

    const product = await prisma.products.update({
      where: {
        id,
      },
      data: {
        name,
        description: description || null,
        category_id: categoryId,
        price,
        stock,
        status,
      },
      include: {
        categories: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Produk berhasil diperbarui",
      data: product,
    });
  } catch (error) {
    console.error("UPDATE PRODUCT ERROR:", error);

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Produk tidak ditemukan",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Gagal memperbarui produk",
      },
      { status: 500 }
    );
  }
}

// DELETE: Menghapus produk
export async function deleteProduct(id: number) {
  try {
    await prisma.products.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Produk berhasil dihapus",
    });
  } catch (error) {
    console.error("DELETE PRODUCT ERROR:", error);

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Produk tidak ditemukan",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Gagal menghapus produk",
      },
      { status: 500 }
    );
  }
}
