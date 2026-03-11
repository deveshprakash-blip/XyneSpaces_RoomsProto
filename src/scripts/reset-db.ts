import { prisma } from "@/lib/prisma";

async function resetDatabase() {
  console.log("🗑️  Clearing database...");

  try {
    // Use raw SQL to truncate all tables (faster and handles foreign keys)
    await prisma.$executeRawUnsafe(`
      TRUNCATE TABLE 
        "Activity",
        "Ticket",
        "Board",
        "CanvasAnnotation",
        "Canvas",
        "Message",
        "Chat",
        "RoomMember",
        "Room",
        "Project",
        "Notification",
        "UserOrganization",
        "Organization",
        "Account",
        "Session",
        "VerificationToken",
        "User"
      RESTART IDENTITY CASCADE;
    `);

    console.log("✅ Database cleared!");
    console.log("\n📝 You can now:");
    console.log("   1. Visit http://localhost:3000");
    console.log("   2. Sign up with a new email/password");
    console.log("   3. Start using the app!");
  } catch (error) {
    console.error("❌ Error clearing database:", error);
    throw error;
  }
}

resetDatabase()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
