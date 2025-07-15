import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  CreateUserInput,
  UpdateUserInput,
  UserFilterInput,
  PaginatedResponse,
} from "@rooster-ai/shared";

const prisma = new PrismaClient();

export class UserManagementService {
  /**
   * Admin creates Owner user for any company
   */
  async createOwnerUser(data: CreateUserInput, adminUserId: string) {
    try {
      // Validate admin permissions
      await this.validateAdminUser(adminUserId);

      // Validate company exists and has capacity
      await this.validateCompanyCapacity(data.companyId, "owner");

      // Check if owner already exists for this company
      const existingOwner = await prisma.user.findFirst({
        where: {
          tenantId: data.companyId,
          role: {
            name: "owner",
          },
        },
      });

      if (existingOwner) {
        throw new Error(
          "Company already has an owner. Only one owner per company is allowed."
        );
      }

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

      // Generate secure password
      const password = data.password || this.generateSecurePassword();
      const passwordHash = await bcrypt.hash(password, 12);

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

      // Send welcome email with credentials
      await this.sendWelcomeEmail(user, password);

      return { user, temporaryPassword: password };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      throw new Error(`Failed to create owner user: ${errorMessage}`);
    }
  }

  /**
   * Admin or Owner creates Manager user
   */
  async createManagerUser(data: CreateUserInput, creatorUserId: string) {
    try {
      // Validate creator permissions (admin or owner)
      const creator = await this.validateCreatorPermissions(creatorUserId, [
        "admin",
        "owner",
      ]);

      // Determine company ID
      const companyId =
        creator.role.name === "admin" ? data.companyId : creator.tenantId;

      // Validate company capacity for managers
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

      // Generate secure password
      const password = data.password || this.generateSecurePassword();
      const passwordHash = await bcrypt.hash(password, 12);

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

      // Send welcome email
      await this.sendWelcomeEmail(user, password);

      return { user, temporaryPassword: password };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      throw new Error(`Failed to create manager user: ${errorMessage}`);
    }
  }

  /**
   * Admin, Owner, or Manager creates Staff user
   */
  async createStaffUser(data: CreateUserInput, creatorUserId: string) {
    try {
      // Validate creator permissions (admin, owner, or manager)
      const creator = await this.validateCreatorPermissions(creatorUserId, [
        "admin",
        "owner",
        "manager",
      ]);

      // Determine company ID
      const companyId =
        creator.role.name === "admin" ? data.companyId : creator.tenantId;

      // Validate company capacity
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

      // Generate secure password
      const password = data.password || this.generateSecurePassword();
      const passwordHash = await bcrypt.hash(password, 12);

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

      // Create corresponding staff record if additional data provided
      if (data.staffData) {
        await this.createStaffRecord(user.id, companyId, data.staffData);
      }

      // Send welcome email
      await this.sendWelcomeEmail(user, password);

      return { user, temporaryPassword: password };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      throw new Error(`Failed to create staff user: ${errorMessage}`);
    }
  }

  /**
   * Get all users with filtering and pagination
   */
  async getAllUsers(
    filters: Partial<UserFilterInput> = {},
    requestorUserId: string
  ): Promise<PaginatedResponse> {
    try {
      const requestor = await this.validateUserAccess(requestorUserId);

      const {
        companyId,
        role,
        search,
        isActive,
        page = 1,
        limit = 20,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = filters;

      // Build where clause based on requestor role
      const where: any = {};

      if (requestor.role.name === "admin") {
        // Admins can see all users
        if (companyId) {
          where.tenantId = companyId;
        }
      } else {
        // Non-admins can only see users in their company
        where.tenantId = requestor.tenantId;

        // Owners and Managers cannot see admin users
        where.role = {
          name: {
            not: "admin",
          },
        };
      }

      if (role) {
        where.role = {
          ...where.role,
          name: role,
        };
      }

      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ];
      }

      if (typeof isActive === "boolean") {
        where.isActive = isActive;
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
          tenant: {
            select: {
              id: true,
              name: true,
              domain: true,
            },
          },
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
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      throw new Error(`Failed to fetch users: ${errorMessage}`);
    }
  }

  /**
   * Update user details
   */
  async updateUser(
    userId: string,
    data: UpdateUserInput,
    requestorUserId: string
  ) {
    try {
      const requestor = await this.validateUserAccess(requestorUserId);

      // Get user to update
      const userToUpdate = await prisma.user.findUnique({
        where: { id: userId },
        include: { role: true, tenant: true },
      });

      if (!userToUpdate) {
        throw new Error("User not found");
      }

      // Validate permissions
      if (
        requestor.role.name !== "admin" &&
        requestor.tenantId !== userToUpdate.tenantId
      ) {
        throw new Error(
          "Access denied: Cannot update users from other companies"
        );
      }

      // Prevent non-admins from updating admin users
      if (
        requestor.role.name !== "admin" &&
        userToUpdate.role.name === "admin"
      ) {
        throw new Error("Access denied: Cannot update admin users");
      }

      // Update user
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          ...(data.name && { name: data.name }),
          ...(data.email && { email: data.email }),
          ...(data.phone && { phone: data.phone }),
          ...(typeof data.isActive === "boolean" && {
            isActive: data.isActive,
          }),
        },
        include: {
          role: true,
          tenant: true,
        },
      });

      return updatedUser;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      throw new Error(`Failed to update user: ${errorMessage}`);
    }
  }

  /**
   * Deactivate user (soft delete)
   */
  async deactivateUser(userId: string, requestorUserId: string) {
    try {
      const requestor = await this.validateUserAccess(requestorUserId);

      // Get user to deactivate
      const userToDeactivate = await prisma.user.findUnique({
        where: { id: userId },
        include: { role: true },
      });

      if (!userToDeactivate) {
        throw new Error("User not found");
      }

      // Validate permissions
      if (
        requestor.role.name !== "admin" &&
        requestor.tenantId !== userToDeactivate.tenantId
      ) {
        throw new Error(
          "Access denied: Cannot deactivate users from other companies"
        );
      }

      // Prevent deactivating admin users (except by other admins)
      if (
        userToDeactivate.role.name === "admin" &&
        requestor.role.name !== "admin"
      ) {
        throw new Error("Access denied: Cannot deactivate admin users");
      }

      // Prevent self-deactivation
      if (userId === requestorUserId) {
        throw new Error("Cannot deactivate your own account");
      }

      // Deactivate user
      const deactivatedUser = await prisma.user.update({
        where: { id: userId },
        data: { isActive: false },
        include: {
          role: true,
          tenant: true,
        },
      });

      return deactivatedUser;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      throw new Error(`Failed to deactivate user: ${errorMessage}`);
    }
  }

  /**
   * Get all users for a specific company (Owner access)
   */
  async getCompanyUsers(companyId: string, ownerId: string) {
    try {
      // Validate owner access
      const owner = await this.validateCreatorPermissions(ownerId, ["owner"]);

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
  async updateUserRole(userId: string, newRole: string, ownerId: string) {
    try {
      // Validate owner access
      const owner = await this.validateCreatorPermissions(ownerId, ["owner"]);

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
   * Get user hierarchy statistics
   */
  async getUserHierarchyStats(requestorUserId: string) {
    try {
      const requestor = await this.validateUserAccess(requestorUserId);

      let whereClause: any = {};

      if (requestor.role.name === "admin") {
        // Admins can see global stats
      } else {
        // Others can only see their company stats
        whereClause.tenantId = requestor.tenantId;
      }

      const userStats = await prisma.user.groupBy({
        by: ["tenantId"],
        where: whereClause,
        _count: {
          id: true,
        },
        _sum: {
          id: true,
        },
      });

      const roleStats = await prisma.user.groupBy({
        by: ["roleId"],
        where: whereClause,
        _count: {
          id: true,
        },
        include: {
          role: {
            select: {
              name: true,
            },
          },
        },
      });

      return {
        totalUsers: userStats.reduce((sum, stat) => sum + stat._count.id, 0),
        usersByCompany: userStats,
        usersByRole: roleStats,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      throw new Error(
        `Failed to fetch user hierarchy statistics: ${errorMessage}`
      );
    }
  }

  /**
   * Private helper methods
   */
  private async validateAdminUser(userId: string) {
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

    if (user.role.name !== "admin") {
      throw new Error("Admin access required");
    }

    // Verify user belongs to Rooster AI company
    if (user.tenant.domain !== "roosterai.ie") {
      throw new Error("Invalid admin user: Must belong to Rooster AI company");
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

    if (!user || !user.isActive) {
      throw new Error("User not found or inactive");
    }

    if (!allowedRoles.includes(user.role.name)) {
      throw new Error(
        `Insufficient permissions: ${allowedRoles.join(", ")} access required`
      );
    }

    return user;
  }

  private async validateUserAccess(userId: string) {
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

    if (!company.isActive) {
      throw new Error("Company is suspended and cannot have new users created");
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

  private generateSecurePassword(): string {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  private async createStaffRecord(
    userId: string,
    tenantId: string,
    staffData: any
  ) {
    // Create corresponding staff record with additional details
    await prisma.staff.create({
      data: {
        name: staffData.name,
        email: staffData.email,
        phone: staffData.phone,
        position: staffData.position,
        department: staffData.department,
        hourlyRate: staffData.hourlyRate,
        startDate: new Date(staffData.startDate),
        tenantId,
        isActive: true,
      },
    });
  }

  private async sendWelcomeEmail(user: any, password: string) {
    // Implementation for sending welcome email with credentials
    // This would integrate with your email service (AWS SES, etc.)
    console.log(
      `Welcome email sent to ${user.email} with temporary password: ${password}`
    );
  }
}
