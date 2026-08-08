/**
 * Script untuk membuat akun admin pertama.
 *
 * Cara pakai (setelah DATABASE_URL diisi di .env dan migrasi sudah dijalankan):
 *   npx tsx prisma/create-admin.ts <username> <password>
 *
 * Contoh:
 *   npx tsx prisma/create-admin.ts ketuakelas Rahasia123!
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const [, , username, password] = process.argv;

  if (!username || !password) {
    console.error("Pemakaian: npx tsx prisma/create-admin.ts <username> <password>");
    process.exit(1);
  }

  if (password.length < 8) {
    console.error("Password sebaiknya minimal 8 karakter.");
    process.exit(1);
  }

  const hashed = await bcrypt.hash(password, 10);

  const existing = await prisma.admin.findUnique({ where: { username } });
  if (existing) {
    await prisma.admin.update({
      where: { username },
      data: { password: hashed },
    });
    console.log(`Password untuk admin "${username}" berhasil diperbarui.`);
  } else {
    await prisma.admin.create({
      data: { username, password: hashed },
    });
    console.log(`Admin "${username}" berhasil dibuat.`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
