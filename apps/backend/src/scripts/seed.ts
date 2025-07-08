import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create default tenant
  const tenant = await prisma.tenant.upsert({
    where: { domain: "demo.rooster-ai.com" },
    update: {},
    create: {
      name: "Demo Restaurant",
      domain: "demo.rooster-ai.com",
      isActive: true,
      maxUsers: 50,
      settings: {
        timezone: "UTC",
        currency: "USD",
        weekStartDay: 1, // Monday
      },
    },
  });

  // Create default roles
  const adminRole = await prisma.role.upsert({
    where: {
      tenantId_name: {
        tenantId: tenant.id,
        name: "admin",
      },
    },
    update: {},
    create: {
      name: "admin",
      description: "Administrator with full access",
      permissions: ["*"],
      isSystem: true,
      tenantId: tenant.id,
    },
  });

  const managerRole = await prisma.role.upsert({
    where: {
      tenantId_name: {
        tenantId: tenant.id,
        name: "manager",
      },
    },
    update: {},
    create: {
      name: "manager",
      description: "Manager with staff and roster management access",
      permissions: ["staff:read", "staff:write", "roster:read", "roster:write"],
      isSystem: true,
      tenantId: tenant.id,
    },
  });

  const staffRole = await prisma.role.upsert({
    where: {
      tenantId_name: {
        tenantId: tenant.id,
        name: "staff",
      },
    },
    update: {},
    create: {
      name: "staff",
      description: "Staff member with limited access",
      permissions: ["roster:read"],
      isSystem: true,
      tenantId: tenant.id,
    },
  });

  // Create admin user
  const passwordHash = await bcrypt.hash("admin123", 12);
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@demo.rooster-ai.com" },
    update: {},
    create: {
      email: "admin@demo.rooster-ai.com",
      name: "Admin User",
      passwordHash,
      tenantId: tenant.id,
      roleId: adminRole.id,
      isActive: true,
    },
  });

  // Create sample staff members
  const staffMembers = [
    {
      name: "John Smith",
      email: "john.smith@demo.rooster-ai.com",
      phone: "+1-555-0101",
      position: "Server",
      department: "Front of House",
      hourlyRate: 15.5,
      startDate: new Date("2024-01-15"),
      isActive: true,
      tenantId: tenant.id,
    },
    {
      name: "Jane Doe",
      email: "jane.doe@demo.rooster-ai.com",
      phone: "+1-555-0102",
      position: "Bartender",
      department: "Bar",
      hourlyRate: 18.0,
      startDate: new Date("2024-02-01"),
      isActive: true,
      tenantId: tenant.id,
    },
    {
      name: "Mike Johnson",
      email: "mike.johnson@demo.rooster-ai.com",
      phone: "+1-555-0103",
      position: "Cook",
      department: "Kitchen",
      hourlyRate: 16.75,
      startDate: new Date("2024-01-20"),
      isActive: true,
      tenantId: tenant.id,
    },
  ];

  for (const staffData of staffMembers) {
    await prisma.staff.upsert({
      where: {
        tenantId_email: {
          tenantId: staffData.tenantId,
          email: staffData.email,
        },
      },
      update: {},
      create: staffData,
    });
  }

  console.log("✅ Seed data created successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
