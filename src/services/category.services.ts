import { prisma } from "./lib/prisma";

export const CategoryService = {
  // Mengambil semua kategori
  async getAll(search?: string) {
    return prisma.categories.findMany({
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
  },

  // Mengambil kategori berdasarkan ID
  async getById(id: number) {
    return prisma.categories.findUnique({
      where: { id },
      include: {
        products: true,
      },
    });
  },

  // Membuat kategori
  async create(data: {
    name: string;
    description?: string | null;
  }) {
    return prisma.categories.create({
      data: {
        name: data.name,
        description: data.description ?? null,
      },
    });
  },

  // Mengubah kategori
  async update(
    id: number,
    data: {
      name: string;
      description?: string | null;
    }
  ) {
    return prisma.categories.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description ?? null,
      },
    });
  },

  // Menghapus kategori
  async delete(id: number) {
    return prisma.categories.delete({
      where: { id },
    });
  },
};