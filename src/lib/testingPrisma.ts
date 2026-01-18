import { prisma } from "./prisma";

async function testPrisma() {
  try {
    // Count rows
    const count = await prisma.electricitydata.count();
    console.log("Total rows in electricitydata:", count);

    // Fetch first 5 rows
    const firstFive = await prisma.electricitydata.findMany({
      take: 5,
      orderBy: { starttime: "asc" },
    });
    console.log("First 5 rows:", firstFive);
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

testPrisma();
