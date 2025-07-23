import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("123456@", 10);

  await prisma.user.createMany({
    data: [
      {
        email: "admin@demo.test",
        password: passwordHash,
        role: "ADMIN",
        firstName: "Alice",
        lastName: "Admin",
        businessName: "Admin Solutions",
        country: "Vietnam",
        phoneNumber: "+84 987654321",
        timezone: "Asia/Ho_Chi_Minh",
        postalCode: "700000",
        businessWebsite: "https://adminsolutions.vn",
      },
      {
        email: "john.doe@demo.test",
        password: passwordHash,
        role: "CUSTOMER",
        firstName: "John",
        lastName: "Doe",
        businessName: "Doe Ventures",
        country: "USA",
        phoneNumber: "+1 212 555 7890",
        timezone: "America/New_York",
        postalCode: "10001",
        businessWebsite: "https://doeventures.com",
      },
      {
        email: "jane.smith@demo.test",
        password: passwordHash,
        role: "CUSTOMER",
        firstName: "Jane",
        lastName: "Smith",
        businessName: "Smith Co.",
        country: "Canada",
        phoneNumber: "+1 416 555 1234",
        timezone: "America/Toronto",
        postalCode: "M4B 1B3",
        businessWebsite: "https://smithco.ca",
      },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Seed completed");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
