
import { NextResponse } from "next/server";
import { prisma } from "../../../services/lib/prisma";

export async function GET() {
  try {
    const result = await prisma.$queryRaw<
      Array<{ db_name: string }>
    >`SELECT DATABASE() AS db_name`;

    return NextResponse.json({
      success: true,
      message: "Database connected successfully",
      database: result[0]?.db_name,
    });
  } catch (error) {
    console.error("DATABASE ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : String(error),
      },
      { status: 500 }
    );
  }
}
