import { PrismaClient, Staff } from "@prisma/client";
import bcrypt from "bcryptjs";
import { startOfWeek, addWeeks, addDays, setHours, setMinutes } from "date-fns";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // 1. Create Rooster AI Company (Admin Company)
  console.log("📊 Creating Rooster AI admin company...");
  const roosterAICompany = await prisma.tenant.upsert({
    where: { domain: "roosterai.ie" },
    update: {},
    create: {
      name: "Rooster AI",
      domain: "roosterai.ie",
      address: "Dublin, Ireland",
      employeeCount: 10,
      isActive: true,
      userLimit: 100,
      managerLimit: 50,
      tokenLimit: 1000000,
      settings: {
        timezone: "Europe/Dublin",
        currency: "EUR",
        weekStartDay: 1,
        isAdminCompany: true,
      },
    },
  });

  // 2. Create Demo Restaurant Company
  console.log("🏪 Creating demo restaurant company...");
  const demoCompany = await prisma.tenant.upsert({
    where: { domain: "demo.rooster-ai.com" },
    update: {},
    create: {
      name: "Demo Restaurant",
      domain: "demo.rooster-ai.com",
      address: "123 Main Street, Dublin, Ireland",
      employeeCount: 25,
      isActive: true,
      userLimit: 50,
      managerLimit: 10,
      tokenLimit: 50000,
      settings: {
        timezone: "Europe/Dublin",
        currency: "EUR",
        weekStartDay: 1,
      },
    },
  });

  // 3. Create roles for Rooster AI Company (Admin roles)
  console.log("👑 Creating admin roles...");
  const adminRole = await prisma.role.upsert({
    where: {
      tenantId_name: {
        tenantId: roosterAICompany.id,
        name: "admin",
      },
    },
    update: {},
    create: {
      name: "admin",
      description: "Rooster AI Administrator with full system access",
      permissions: [
        "*",
        "company:create",
        "company:read",
        "company:update",
        "company:delete",
        "company:suspend",
        "user:create",
        "user:read",
        "user:update",
        "user:delete",
        "token:manage",
        "token:track",
        "reports:all",
      ],
      isSystem: true,
      tenantId: roosterAICompany.id,
    },
  });

  // 4. Create roles for Demo Company (Standard roles)
  console.log("🎭 Creating standard roles...");
  const ownerRole = await prisma.role.upsert({
    where: {
      tenantId_name: {
        tenantId: demoCompany.id,
        name: "owner",
      },
    },
    update: {},
    create: {
      name: "owner",
      description: "Company Owner with full company management access",
      permissions: [
        "company:read",
        "company:update",
        "user:create",
        "user:read",
        "user:update",
        "user:delete",
        "staff:*",
        "roster:*",
        "reports:company",
        "token:view",
      ],
      isSystem: true,
      tenantId: demoCompany.id,
    },
  });

  const managerRole = await prisma.role.upsert({
    where: {
      tenantId_name: {
        tenantId: demoCompany.id,
        name: "manager",
      },
    },
    update: {},
    create: {
      name: "manager",
      description: "Manager with staff and roster management access",
      permissions: [
        "staff:create",
        "staff:read",
        "staff:update",
        "roster:create",
        "roster:read",
        "roster:update",
        "roster:publish",
        "ai:use",
        "token:view",
        "reports:basic",
      ],
      isSystem: true,
      tenantId: demoCompany.id,
    },
  });

  const staffRole = await prisma.role.upsert({
    where: {
      tenantId_name: {
        tenantId: demoCompany.id,
        name: "staff",
      },
    },
    update: {},
    create: {
      name: "staff",
      description: "Staff member with limited access to personal schedules",
      permissions: ["roster:read", "profile:update", "requests:create"],
      isSystem: true,
      tenantId: demoCompany.id,
    },
  });

  // 5. Create Admin Users (Karl Tallon and Olivia Hone)
  console.log("👨‍💼 Creating admin users...");
  const karlPasswordHash = await bcrypt.hash("R00sterAI123!", 12);
  const karlTallon = await prisma.user.upsert({
    where: { email: "karl@roosterai.ie" },
    update: {},
    create: {
      email: "karl@roosterai.ie",
      name: "Karl Tallon",
      passwordHash: karlPasswordHash,
      phone: "+353 1 234 5678",
      tenantId: roosterAICompany.id,
      roleId: adminRole.id,
      isActive: true,
    },
  });

  const oliviaPasswordHash = await bcrypt.hash("R00sterAI123!", 12);
  const oliviaHone = await prisma.user.upsert({
    where: { email: "olivia@roosterai.ie" },
    update: {},
    create: {
      email: "olivia@roosterai.ie",
      name: "Olivia Hone",
      passwordHash: oliviaPasswordHash,
      phone: "+353 1 234 5679",
      tenantId: roosterAICompany.id,
      roleId: adminRole.id,
      isActive: true,
    },
  });

  // 6. Create Store Locations for Demo Company
  console.log("🏢 Creating store locations...");
  const storeLocation1 = await prisma.storeLocation.create({
    data: {
      name: "Main Street Location",
      address: "123 Main Street, Dublin, Ireland",
      tenantId: demoCompany.id,
      isActive: true,
    },
  });

  const storeLocation2 = await prisma.storeLocation.create({
    data: {
      name: "Temple Bar Location",
      address: "456 Temple Bar, Dublin, Ireland",
      tenantId: demoCompany.id,
      isActive: true,
    },
  });

  // 7. Create Demo Company Users
  console.log("👥 Creating demo company users...");

  // Owner User
  const ownerPasswordHash = await bcrypt.hash("DemoOwner123!", 12);
  const ownerUser = await prisma.user.create({
    data: {
      email: "owner@demo.rooster-ai.com",
      name: "Demo Owner",
      passwordHash: ownerPasswordHash,
      phone: "+353 1 555 0001",
      tenantId: demoCompany.id,
      roleId: ownerRole.id,
      isActive: true,
    },
  });

  // Manager User
  const managerPasswordHash = await bcrypt.hash("DemoManager123!", 12);
  const managerUser = await prisma.user.create({
    data: {
      email: "manager@demo.rooster-ai.com",
      name: "Demo Manager",
      passwordHash: managerPasswordHash,
      phone: "+353 1 555 0002",
      tenantId: demoCompany.id,
      roleId: managerRole.id,
      isActive: true,
    },
  });

  // 8. Create Sample Staff Members
  console.log("👨‍🍳 Creating sample staff members...");

  const createdStaff: Staff[] = [];

  const staffMembers = [
    {
      name: "John Smith",
      email: "john.smith@demo.rooster-ai.com",
      phone: "+353 1 555 0101",
      position: "Server",
      department: "Front of House",
      hourlyRate: 15.5,
      startDate: new Date("2024-01-15"),
      weeklyAvailability: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
      ],
      shiftPreferences: ["Midday Shifts", "Late Shifts"],
      contractType: "Full-time",
      isActive: true,
      tenantId: demoCompany.id,
    },
    {
      name: "Jane Doe",
      email: "jane.doe@demo.rooster-ai.com",
      phone: "+353 1 555 0102",
      position: "Bartender",
      department: "Bar",
      hourlyRate: 18.0,
      startDate: new Date("2024-02-01"),
      weeklyAvailability: [
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      shiftPreferences: ["Late Shifts"],
      contractType: "Full-time",
      isActive: true,
      tenantId: demoCompany.id,
    },
    {
      name: "Mike Johnson",
      email: "mike.johnson@demo.rooster-ai.com",
      phone: "+353 1 555 0103",
      position: "Cook",
      department: "Kitchen",
      hourlyRate: 16.75,
      startDate: new Date("2024-01-20"),
      weeklyAvailability: ["Monday", "Tuesday", "Wednesday", "Thursday"],
      shiftPreferences: ["Early Shifts", "Midday Shifts"],
      contractType: "Part-time",
      isActive: true,
      tenantId: demoCompany.id,
    },
    {
      name: "Sarah Wilson",
      email: "sarah.wilson@demo.rooster-ai.com",
      phone: "+353 1 555 0104",
      position: "Host",
      department: "Front of House",
      hourlyRate: 14.0,
      startDate: new Date("2024-03-01"),
      weeklyAvailability: ["Friday", "Saturday", "Sunday"],
      shiftPreferences: ["Early Shifts", "Midday Shifts"],
      contractType: "Part-time",
      isActive: true,
      tenantId: demoCompany.id,
    },
    {
      name: "David Brown",
      email: "david.brown@demo.rooster-ai.com",
      phone: "+353 1 555 0105",
      position: "Sous Chef",
      department: "Kitchen",
      hourlyRate: 19.0,
      startDate: new Date("2024-02-15"),
      weeklyAvailability: [
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],
      shiftPreferences: ["Midday Shifts", "Late Shifts"],
      contractType: "Full-time",
      isActive: true,
      tenantId: demoCompany.id,
    },
    {
      name: "Emma Kelly",
      email: "emma.kelly@demo.rooster-ai.com",
      phone: "+353 1 555 0106",
      position: "Server",
      department: "Front of House",
      hourlyRate: 15.0,
      startDate: new Date("2024-03-10"),
      weeklyAvailability: [
        "Monday",
        "Wednesday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      shiftPreferences: ["Early Shifts", "Midday Shifts"],
      contractType: "Part-time",
      isActive: true,
      tenantId: demoCompany.id,
    },
  ];

  for (const staffData of staffMembers) {
    const staff = await prisma.staff.upsert({
      where: {
        tenantId_email: {
          tenantId: staffData.tenantId,
          email: staffData.email,
        },
      },
      update: {},
      create: staffData,
    });
    createdStaff.push(staff);
  }

  // 9. Assign Staff to Store Locations
  console.log("🏪 Assigning staff to store locations...");
  for (const staff of createdStaff) {
    await prisma.staffStoreLocation.createMany({
      data: [
        {
          staffId: staff.id,
          storeLocationId: storeLocation1.id,
        },
        {
          staffId: staff.id,
          storeLocationId: storeLocation2.id,
        },
      ],
      skipDuplicates: true,
    });
  }

  // 10. Create Staff User Accounts
  console.log("🔐 Creating staff user accounts...");
  for (const staff of createdStaff) {
    const staffPasswordHash = await bcrypt.hash("Staff123!", 12);
    await prisma.user.create({
      data: {
        email: staff.email,
        name: staff.name,
        passwordHash: staffPasswordHash,
        phone: staff.phone,
        tenantId: demoCompany.id,
        roleId: staffRole.id,
        isActive: true,
      },
    });
  }

  // 11. Create Sample Roster Folders
  console.log("📁 Creating roster folders...");
  const weeklyFolder = await prisma.rosterFolder.create({
    data: {
      name: "Weekly Rosters",
      color: "#3B82F6",
      tenantId: demoCompany.id,
    },
  });

  const specialEventsFolder = await prisma.rosterFolder.create({
    data: {
      name: "Special Events",
      color: "#EF4444",
      tenantId: demoCompany.id,
    },
  });

  // 12. Create Example Rosters for Last 4 Weeks
  console.log("📅 Creating example rosters for the last 4 weeks...");

  // Get current date and calculate the last 4 weeks
  const currentDate = new Date();
  const currentWeekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday start

  // Create rosters for the last 4 weeks
  const rostersToCreate = [];
  for (let weekOffset = -3; weekOffset <= 0; weekOffset++) {
    const weekStart = addWeeks(currentWeekStart, weekOffset);
    const weekEnd = addDays(weekStart, 6); // Sunday end

    const weekNumber =
      Math.abs(weekOffset) === 0
        ? "Current Week"
        : Math.abs(weekOffset) === 1
          ? "Last Week"
          : `${Math.abs(weekOffset)} Weeks Ago`;

    rostersToCreate.push({
      name: `Weekly Roster - ${weekNumber}`,
      startDate: weekStart,
      endDate: weekEnd,
      isPublished: weekOffset < 0, // Past rosters are published, current might be draft
      isTemplate: false,
      folderId: weeklyFolder.id,
      tenantId: demoCompany.id,
      notes: `Automatically generated roster for week starting ${weekStart.toLocaleDateString()}`,
    });
  }

  // Create the rosters
  const createdRosters = [];
  for (const rosterData of rostersToCreate) {
    const roster = await prisma.roster.create({
      data: rosterData,
    });
    createdRosters.push(roster);
  }

  // 13. Create Realistic Shifts for Each Roster
  console.log("⏰ Creating realistic shifts for each roster...");

  // Define shift templates for different days and positions
  const shiftTemplates = {
    weekday: {
      "Front of House": [
        { start: 9, end: 17, position: "Host" },
        { start: 11, end: 19, position: "Server" },
        { start: 17, end: 23, position: "Server" },
      ],
      Kitchen: [
        { start: 8, end: 16, position: "Cook" },
        { start: 10, end: 18, position: "Sous Chef" },
        { start: 16, end: 24, position: "Cook" },
      ],
      Bar: [{ start: 16, end: 24, position: "Bartender" }],
    },
    weekend: {
      "Front of House": [
        { start: 9, end: 17, position: "Host" },
        { start: 10, end: 18, position: "Server" },
        { start: 11, end: 19, position: "Server" },
        { start: 17, end: 23, position: "Server" },
        { start: 18, end: 24, position: "Server" },
      ],
      Kitchen: [
        { start: 8, end: 16, position: "Cook" },
        { start: 10, end: 18, position: "Sous Chef" },
        { start: 12, end: 20, position: "Cook" },
        { start: 16, end: 24, position: "Cook" },
      ],
      Bar: [
        { start: 14, end: 22, position: "Bartender" },
        { start: 18, end: 24, position: "Bartender" },
      ],
    },
  };

  // Helper function to get available staff for a department and day
  const getAvailableStaff = (department: string, dayName: string): Staff[] => {
    return createdStaff.filter(
      (staff: Staff) =>
        staff.department === department &&
        staff.weeklyAvailability.includes(dayName)
    );
  };

  // Helper function to assign staff to shifts intelligently
  const assignStaffToShift = (
    availableStaff: Staff[],
    position: string,
    usedStaff: Set<string>
  ): Staff | null => {
    // Prefer staff with matching position, then any available staff
    const preferredStaff = availableStaff.filter(
      (staff: Staff) => staff.position === position && !usedStaff.has(staff.id)
    );

    if (preferredStaff.length > 0) {
      const selectedStaff =
        preferredStaff[Math.floor(Math.random() * preferredStaff.length)];
      usedStaff.add(selectedStaff.id);
      return selectedStaff;
    }

    // Fallback to any available staff
    const fallbackStaff = availableStaff.filter(
      (staff: Staff) => !usedStaff.has(staff.id)
    );
    if (fallbackStaff.length > 0) {
      const selectedStaff =
        fallbackStaff[Math.floor(Math.random() * fallbackStaff.length)];
      usedStaff.add(selectedStaff.id);
      return selectedStaff;
    }

    return null;
  };

  // Create shifts for each roster
  for (const roster of createdRosters) {
    const shiftsToCreate = [];

    // Generate shifts for each day of the week
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const shiftDate = addDays(roster.startDate, dayOffset);
      const dayName = shiftDate.toLocaleDateString("en-US", {
        weekday: "long",
      });
      const isWeekend = dayName === "Saturday" || dayName === "Sunday";
      const templates = isWeekend
        ? shiftTemplates.weekend
        : shiftTemplates.weekday;

      // Track used staff for this day to avoid double-booking
      const usedStaffToday = new Set<string>();

      // Create shifts for each department
      for (const [department, departmentShifts] of Object.entries(templates)) {
        const availableStaff = getAvailableStaff(department, dayName);

        for (const shiftTemplate of departmentShifts) {
          const assignedStaff = assignStaffToShift(
            availableStaff,
            shiftTemplate.position,
            usedStaffToday
          );

          if (assignedStaff) {
            const startTime = setMinutes(
              setHours(shiftDate, shiftTemplate.start),
              0
            );
            const endTime = setMinutes(
              setHours(shiftDate, shiftTemplate.end),
              0
            );

            shiftsToCreate.push({
              rosterId: roster.id,
              staffId: assignedStaff.id,
              startTime,
              endTime,
              position: shiftTemplate.position,
              isConfirmed: roster.isPublished,
              notes: roster.isPublished ? null : "Pending confirmation",
            });
          }
        }
      }
    }

    // Create all shifts for this roster
    if (shiftsToCreate.length > 0) {
      await prisma.shift.createMany({
        data: shiftsToCreate,
      });
    }
  }

  // 14. Create a Template Roster
  console.log("📋 Creating template roster...");
  const templateRoster = await prisma.roster.create({
    data: {
      name: "Standard Weekly Template",
      startDate: new Date("2024-01-01"), // Template date
      endDate: new Date("2024-01-07"),
      isPublished: false,
      isTemplate: true,
      folderId: weeklyFolder.id,
      tenantId: demoCompany.id,
      notes: "Standard weekly roster template for regular operations",
    },
  });

  // Create template shifts (simplified version)
  const templateShifts = [
    // Monday shifts
    {
      staffId: createdStaff[0].id,
      start: 9,
      end: 17,
      position: "Server",
      day: 0,
    },
    {
      staffId: createdStaff[2].id,
      start: 8,
      end: 16,
      position: "Cook",
      day: 0,
    },
    {
      staffId: createdStaff[1].id,
      start: 17,
      end: 23,
      position: "Bartender",
      day: 0,
    },

    // Tuesday shifts
    {
      staffId: createdStaff[1].id,
      start: 11,
      end: 19,
      position: "Server",
      day: 1,
    },
    {
      staffId: createdStaff[4].id,
      start: 10,
      end: 18,
      position: "Sous Chef",
      day: 1,
    },

    // Add more template shifts as needed...
  ];

  for (const template of templateShifts) {
    const shiftDate = addDays(templateRoster.startDate, template.day);
    const startTime = setMinutes(setHours(shiftDate, template.start), 0);
    const endTime = setMinutes(setHours(shiftDate, template.end), 0);

    await prisma.shift.create({
      data: {
        rosterId: templateRoster.id,
        staffId: template.staffId,
        startTime,
        endTime,
        position: template.position,
        isConfirmed: false,
        notes: "Template shift",
      },
    });
  }

  // 15. Initialize Token Usage Tracking
  console.log("🎯 Initializing token usage tracking...");
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  await prisma.tokenUsage.create({
    data: {
      tenantId: demoCompany.id,
      userId: managerUser.id,
      month: currentMonth,
      year: currentYear,
      tokensUsed: 1250,
      cost: 0.75,
    },
  });

  console.log("✅ Database seeding completed successfully!");
  console.log("\n📊 Seed Summary:");
  console.log("🏢 Companies created: 2 (Rooster AI + Demo Restaurant)");
  console.log("👑 Admin users: 2 (Karl Tallon + Olivia Hone)");
  console.log("👥 Demo users: 8 (1 Owner + 1 Manager + 6 Staff)");
  console.log("🏪 Store locations: 2");
  console.log("📁 Roster folders: 2");
  console.log("📅 Rosters created: 5 (4 weekly + 1 template)");
  console.log("⏰ Shifts created: ~84 shifts across all rosters");
  console.log("🎭 Roles: 4 (Admin + Owner + Manager + Staff)");
  console.log("\n🔑 Login Credentials:");
  console.log("Admin: karl@roosterai.ie / R00sterAI123!");
  console.log("Admin: olivia@roosterai.ie / R00sterAI123!");
  console.log("Owner: owner@demo.rooster-ai.com / DemoOwner123!");
  console.log("Manager: manager@demo.rooster-ai.com / DemoManager123!");
  console.log("Staff: john.smith@demo.rooster-ai.com / Staff123!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
