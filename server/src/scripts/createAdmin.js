// PROMOTE AN EXISTING USER OR CREATE A NEW ADMIN ACCOUNT.

import "dotenv/config";
import bcrypt from "bcryptjs";
import prisma from "../db.js";

const [email, name, password] = process.argv.slice(2);

if (!email) {
  console.error(
    "Usage: node src/scripts/createAdmin.js <email> [<name> <password>]"
  );
  process.exit(1);
}

const existing = await prisma.user.findUnique({ where: { email } });

if (existing) {
  const user = await prisma.user.update({
    where: { email },
    data: { role: "ADMIN" },
  });
  console.log(`Promoted ${user.email} to ADMIN`);
} else {
  if (!name || !password) {
    console.error("User does not exist. Provide <name> and <password> to create.");
    process.exit(1);
  }
  const user = await prisma.user.create({
    data: {
      email,
      name,
      passwordHash: await bcrypt.hash(password, 10),
      role: "ADMIN",
    },
  });
  console.log(`Created ADMIN ${user.email}`);
}

await prisma.$disconnect();
