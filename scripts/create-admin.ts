
import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../src/services/lib/prisma";

async function main() {
  const name = process.env.ADMIN_NAME;
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!name || !email || !password) {
    throw new Error(
      "ADMIN_NAME, ADMIN_EMAIL, dan ADMIN_PASSWORD wajib diisi"
    );
  }

  if (password.length < 8) {
    throw new Error("Password minimal 8 karakter");
  }

  const existingAdmin = await prisma.admins.findUnique({
    where: { email },
  });

  if (existingAdmin) {
    console.log("Admin dengan email tersebut sudah tersedia.");
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const admin = await prisma.admins.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  console.log("Admin berhasil dibuat:", {
    id: admin.id,
    name: admin.name,
    email: admin.email,
  });
}

main()
  .catch((error) => {
    console.error("CREATE ADMIN ERROR:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
