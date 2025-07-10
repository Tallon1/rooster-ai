import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { CreateUserInput } from "@rooster-ai/shared";

const prisma = new PrismaClient();

export class UserManagementService {
  async createOwnerUser(data: CreateUserInput, adminUserId: string) {
    // Validate admin permissions
    await this.validateAdminUser(adminUserId);

    // Check company exists and has user capacity
    await this.validateCompanyCapacity(data.companyId, "owner");

    // Get owner role for the company
    const ownerRole = await prisma.role.findFirst({
      where: {
        tenantId: data.companyId,
        name: "owner",
      },
    });

    if (!ownerRole) {
      throw new Error("Owner role not found for company");
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 12);

    // Create owner user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: `${data.firstName} ${data.lastName}`,
        passwordHash,
        phone: data.phone,
        tenantId: data.companyId,
        roleId: ownerRole.id,
        isActive: true,
      },
      include: {
        role: true,
        tenant: true,
      },
    });

    return user;
  }

  /**
   * Get all users for a specific company (Owner access)
   */
  async getCompanyUsers(companyId: string, ownerUserId: string) {
    try {
      // Validate owner access
      const owner = await this.validateOwnerAccess(ownerUserId, companyId);

      const users = await prisma.user.findMany({
        where: {
          tenantId: companyId,
          role: {
            name: {
              in: ["manager", "staff"], // Owners can see Managers and Staff
            },
          },
        },
        include: {
          role: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return users;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      throw new Error(`Failed to fetch company users: ${errorMessage}`);
    }
  }

  /**
   * Update user role (Owner access)
   */
  async updateUserRole(userId: string, newRole: string, ownerUserId: string) {
    try {
      // Validate owner access
      const owner = await this.validateOwnerAccess(ownerUserId);

      // Get the user to update
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { role: true },
      });

      if (!user || user.tenantId !== owner.tenantId) {
        throw new Error("User not found or access denied");
      }

      // Validate new role
      if (!["manager", "staff"].includes(newRole)) {
        throw new Error(
          "Invalid role: Owners can only assign Manager or Staff roles"
        );
      }

      // Get the new role
      const role = await prisma.role.findFirst({
        where: {
          tenantId: owner.tenantId,
          name: newRole,
        },
      });

      if (!role) {
        throw new Error("Role not found");
      }

      // Update user role
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { roleId: role.id },
        include: {
          role: true,
          tenant: true,
        },
      });

      return updatedUser;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      throw new Error(`Failed to update user role: ${errorMessage}`);
    }
  }

  /**
   * Private helper method to validate Owner access
   */
  private async validateOwnerAccess(userId: string, companyId?: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: true,
        tenant: true,
      },
    });

    if (!user || !user.isActive) {
      throw new Error("User not found or inactive");
    }

    if (user.role.name !== "owner") {
      throw new Error("Owner access required");
    }

    if (companyId && user.tenantId !== companyId) {
      throw new Error("Access denied: User does not belong to this company");
    }

    return user;
  }

  async createManagerUser(data: CreateUserInput, creatorUserId: string) {
    // Validate creator permissions (admin or owner)
    const creator = await this.validateCreatorPermissions(creatorUserId, [
      "admin",
      "owner",
    ]);

    // Determine company ID
    const companyId =
      creator.role.name === "admin" ? data.companyId : creator.tenantId;

    // Check company capacity
    await this.validateCompanyCapacity(companyId, "manager");

    // Get manager role
    const managerRole = await prisma.role.findFirst({
      where: {
        tenantId: companyId,
        name: "manager",
      },
    });

    if (!managerRole) {
      throw new Error("Manager role not found for company");
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 12);

    // Create manager user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: `${data.firstName} ${data.lastName}`,
        passwordHash,
        phone: data.phone,
        tenantId: companyId,
        roleId: managerRole.id,
        isActive: true,
      },
      include: {
        role: true,
        tenant: true,
      },
    });

    return user;
  }

  async createStaffUser(data: CreateUserInput, creatorUserId: string) {
    // Validate creator permissions (admin, owner, or manager)
    const creator = await this.validateCreatorPermissions(creatorUserId, [
      "admin",
      "owner",
      "manager",
    ]);

    // Determine company ID
    const companyId =
      creator.role.name === "admin" ? data.companyId : creator.tenantId;

    // Check company capacity
    await this.validateCompanyCapacity(companyId, "staff");

    // Get staff role
    const staffRole = await prisma.role.findFirst({
      where: {
        tenantId: companyId,
        name: "staff",
      },
    });

    if (!staffRole) {
      throw new Error("Staff role not found for company");
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 12);

    // Create staff user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: `${data.firstName} ${data.lastName}`,
        passwordHash,
        phone: data.phone,
        tenantId: companyId,
        roleId: staffRole.id,
        isActive: true,
      },
      include: {
        role: true,
        tenant: true,
      },
    });

    return user;
  }

  async getAllUsers(filters: any, adminUserId: string) {
    // Validate admin access
    await this.validateAdminUser(adminUserId);

    const {
      companyId,
      role,
      search,
      page = 1,
      limit = 20,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = filters;

    // Build where clause
    const where: any = {};

    if (companyId) {
      where.tenantId = companyId;
    }

    if (role) {
      where.role = {
        name: role,
      };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get total count
    const total = await prisma.user.count({ where });

    // Get users
    const users = await prisma.user.findMany({
      where,
      include: {
        role: true,
        tenant: true,
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip,
      take: limit,
    });

    return {
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Private helper methods
  private async validateAdminUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: true,
        tenant: true,
      },
    });

    if (!user || user.role.name !== "admin") {
      throw new Error("Admin access required");
    }

    return user;
  }

  private async validateCreatorPermissions(
    userId: string,
    allowedRoles: string[]
  ) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: true,
        tenant: true,
      },
    });

    if (!user || !allowedRoles.includes(user.role.name)) {
      throw new Error("Insufficient permissions");
    }

    return user;
  }

  private async validateCompanyCapacity(companyId: string, userType: string) {
    const company = await prisma.tenant.findUnique({
      where: { id: companyId },
      include: {
        users: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!company) {
      throw new Error("Company not found");
    }

    // Check total user limit
    if (company.users.length >= company.userLimit) {
      throw new Error(
        `Company has reached its user limit of ${company.userLimit}`
      );
    }

    // Check manager limit if creating a manager
    if (userType === "manager") {
      const managerCount = company.users.filter(
        (u) => u.role.name === "manager"
      ).length;
      if (managerCount >= company.managerLimit) {
        throw new Error(
          `Company has reached its manager limit of ${company.managerLimit}`
        );
      }
    }

    return true;
  }
}
