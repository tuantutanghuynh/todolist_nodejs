import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import "dotenv/config";

const prisma = new PrismaClient();

async function main() {
  //delete existing data
  await prisma.todo.deleteMany();
  await prisma.user.deleteMany();
  await prisma.category.deleteMany();

  //create demo user
  const hashedPassword = await bcrypt.hash("password123", 10);
  const user = await prisma.user.create({
    data: {
      name: "Demo User",
      email: "demo@gmail.com",
      password: hashedPassword,
    },
  });

  //create demo categories
  const workCategory = await prisma.category.create({
    data: {
      name: "Work",
      color: "#3B82F6",
      userId: user.id,
    },
  });

  const personalCategory = await prisma.category.create({
    data: {
      name: "Personal",
      color: "#10B981",
      userId: user.id,
    },
  });

  //create demo todos
  await prisma.todo.createMany({
    data: [
      {
        title: "Setup project structure",
        description: "Create folders and install dependencies",
        priority: 3,
        isCompleted: true,
        completedAt: new Date(),
        userId: user.id,
        categoryId: workCategory.id,
      },
      {
        title: "Write API documentation",
        priority: 2,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 ngày tới
        userId: user.id,
        categoryId: workCategory.id,
      },
      {
        title: "Buy groceries",
        priority: 1,
        userId: user.id,
        categoryId: personalCategory.id,
      },
      {
        title: "Read React Query docs",
        priority: 2,
        dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Hôm qua (overdue)
        userId: user.id,
      },
    ],
  });

  console.log("✅ Seed completed");
  console.log(`   User: demo@gmail.com / password123`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
