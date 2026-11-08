
import { SignJWT, jwtVerify } from "jose";

const secret = process.env.AUTH_SECRET;

if (!secret) {
  throw new Error("20be64176c706ee5719f26086c38855a01e35d9611b1a576322a0331f1400579");
}

const secretKey = new TextEncoder().encode(secret);

// Membuat JWT
export async function createToken(admin: {
  id: number;
  name: string;
  email: string;
}) {
  return new SignJWT({
    id: admin.id,
    name: admin.name,
    email: admin.email,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1d")
    .sign(secretKey);
}

// Memverifikasi JWT
export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secretKey);

    return payload;
  } catch {
    return null;
  }
}
