import { PrismaClient, Prisma } from "@prisma/client";
import {
  CreateCompanyInput,
  UpdateCompanyInput,
  CompanyFilterInput,
  ApiResponse,
  PaginatedResponse,
} from "@rooster-ai/shared";

const prisma = new PrismaClient();

export class CompanyService {
  /**
   * Create a new company with validation and limits
   * Only admin users can create companies
   */
  async createCompany(data: CreateCompanyInput, adminUserId: string) {
    try {
      // Validate admin user has permission to create companies
      const adminUser = await this.validateAdminUser(adminUserId);

      // Check if company domain already exists
      const existingCompany = await prisma.tenant.findUnique({
        where: { domain: data.domain },
      });

      if (existingCompany) {
        throw new Error("Company with this domain already exists");
      }

      // Create company with default settings
      const company = await prisma.tenant.create({
        data: {
          name: data.name,
          domain: data.domain,
          address: data.address,
          employeeCount: data.employeeCount,
          userLimit: data.userLimit || 50,
          managerLimit: data.managerLimit || 10,
          tokenLimit: data.tokenLimit || 50000,
          isActive: true,
          settings: {
            timezone: data.timezone || "Europe/Dublin",
            currency: data.currency || "EUR",
            weekStartDay: 1, // Monday
            ...data.settings,
          },
        },
        include: {
          storeLocations: true,
          users: {
            include: {
              role: true,
            },
          },
          _count: {
            select: {
              users: true,
              staff: true,
              rosters: true,
            },
          },
        },
      });

      // Create default roles for the new company
      await this.createDefaultRoles(company.id);

      // Create store locations if provided
      if (data.storeLocations && data.storeLocations.length > 0) {
        await this.createStoreLocations(company.id, data.storeLocations);
      }

      // Log the company creation for audit
      await this.logCompanyAction(
        adminUserId,
        company.id,
        "CREATE",
        null,
        company
      );

      return company;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      throw new Error(`Failed to create company: ${errorMessage}`);
    }
  }

  /**
   * Get all companies with filtering and pagination
   * Admin-only access with comprehensive company data
   */
  async getAllCompanies(
    filters: Partial<CompanyFilterInput> = {},
    adminUserId: string
  ): Promise<PaginatedResponse> {
    try {
      // Validate admin access
      await this.validateAdminUser(adminUserId);

      const {
        search,
        isActive,
        page = 1,
        limit = 20,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = filters;

      // Build where clause for filtering
      const where: any = {};

      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { domain: { contains: search, mode: "insensitive" } },
          { address: { contains: search, mode: "insensitive" } },
        ];
      }

      if (typeof isActive === "boolean") {
        where.isActive = isActive;
      }

      // Calculate pagination
      const skip = (page - 1) * limit;

      // Get total count for pagination
      const total = await prisma.tenant.count({ where });

      // Get companies with comprehensive data
      const companies = await prisma.tenant.findMany({
        where,
        include: {
          storeLocations: true,
          users: {
            include: {
              role: true,
            },
          },
          tokenUsage: {
            where: {
              month: new Date().getMonth() + 1,
              year: new Date().getFullYear(),
            },
          },
          _count: {
            select: {
              users: true,
              staff: true,
              rosters: true,
              storeLocations: true,
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
        data: companies,
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
      throw new Error(`Failed to fetch companies: ${errorMessage}`);
    }
  }

  /**
   * Get company by ID with full details
   * Admin-only access
   */
  async getCompanyById(companyId: string, adminUserId: string) {
    try {
      // Validate admin access
      await this.validateAdminUser(adminUserId);

      const company = await prisma.tenant.findUnique({
        where: { id: companyId },
        include: {
          storeLocations: true,
          users: {
            include: {
              role: true,
            },
            orderBy: {
              createdAt: "desc",
            },
          },
          staff: {
            where: { isActive: true },
            orderBy: {
              name: "asc",
            },
          },
          rosters: {
            orderBy: {
              createdAt: "desc",
            },
            take: 10, // Latest 10 rosters
          },
          tokenUsage: {
            where: {
              month: new Date().getMonth() + 1,
              year: new Date().getFullYear(),
            },
          },
          _count: {
            select: {
              users: true,
              staff: true,
              rosters: true,
              storeLocations: true,
            },
          },
        },
      });

      if (!company) {
        throw new Error("Company not found");
      }

      return company;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      throw new Error(`Failed to fetch company: ${errorMessage}`);
    }
  }

  /**
   * Update company details with validation
   * Admin-only access with audit logging
   */
  async updateCompany(
    companyId: string,
    data: UpdateCompanyInput,
    adminUserId: string
  ) {
    try {
      // Validate admin access
      await this.validateAdminUser(adminUserId);

      // Get existing company for audit logging
      const existingCompany = await prisma.tenant.findUnique({
        where: { id: companyId },
      });

      if (!existingCompany) {
        throw new Error("Company not found");
      }

      // Check domain uniqueness if domain is being updated
      if (data.domain && data.domain !== existingCompany.domain) {
        const domainExists = await prisma.tenant.findUnique({
          where: { domain: data.domain },
        });

        if (domainExists) {
          throw new Error("Domain already exists for another company");
        }
      }

      // Fix: Proper settings handling
      let updatedSettings: Prisma.InputJsonValue | undefined;
      if (data.settings) {
        const currentSettings =
          (existingCompany.settings as Record<string, any>) || {};
        updatedSettings = {
          ...currentSettings,
          ...data.settings,
        } as Prisma.InputJsonValue;
      }

      // Update company with proper data object construction
      const updateData: Prisma.TenantUpdateInput = {};

      if (data.name) updateData.name = data.name;
      if (data.domain) updateData.domain = data.domain;
      if (data.address) updateData.address = data.address;
      if (data.employeeCount) updateData.employeeCount = data.employeeCount;
      if (data.userLimit) updateData.userLimit = data.userLimit;
      if (data.managerLimit) updateData.managerLimit = data.managerLimit;
      if (data.tokenLimit) updateData.tokenLimit = data.tokenLimit;
      if (typeof data.isActive === "boolean")
        updateData.isActive = data.isActive;
      if (updatedSettings) updateData.settings = updatedSettings;

      const updatedCompany = await prisma.tenant.update({
        where: { id: companyId },
        data: updateData,
        include: {
          storeLocations: true,
          users: {
            include: {
              role: true,
            },
          },
          _count: {
            select: {
              users: true,
              staff: true,
              rosters: true,
            },
          },
        },
      });

      // Log the update for audit
      await this.logCompanyAction(
        adminUserId,
        companyId,
        "UPDATE",
        existingCompany,
        updatedCompany
      );

      return updatedCompany;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      throw new Error(`Failed to update company: ${errorMessage}`);
    }
  }

  /**
   * Suspend/Unsuspend company
   * Temporarily disable company access without deleting data
   */
  async suspendCompany(
    companyId: string,
    adminUserId: string,
    suspend: boolean = true
  ) {
    try {
      // Validate admin access
      await this.validateAdminUser(adminUserId);

      const existingCompany = await prisma.tenant.findUnique({
        where: { id: companyId },
        include: {
          users: {
            where: {
              role: {
                name: "owner",
              },
            },
          },
        },
      });

      if (!existingCompany) {
        throw new Error("Company not found");
      }

      // Update company status
      const updatedCompany = await prisma.tenant.update({
        where: { id: companyId },
        data: { isActive: !suspend },
      });

      // Send notification to owner users if suspending
      if (suspend && existingCompany.users.length > 0) {
        await this.notifyCompanySuspension(existingCompany.users);
      }

      // Log the suspension/unsuspension
      await this.logCompanyAction(
        adminUserId,
        companyId,
        suspend ? "SUSPEND" : "UNSUSPEND",
        existingCompany,
        updatedCompany
      );

      return updatedCompany;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      throw new Error(
        `Failed to ${suspend ? "suspend" : "unsuspend"} company: ${errorMessage}`
      );
    }
  }

  /**
   * Update company token limit
   * Admin-only functionality for AI usage management
   */
  async updateTokenLimit(
    companyId: string,
    tokenLimit: number,
    adminUserId: string
  ) {
    try {
      // Validate admin access
      await this.validateAdminUser(adminUserId);

      // Validate token limit is positive
      if (tokenLimit < 0) {
        throw new Error("Token limit must be a positive number");
      }

      const updatedCompany = await prisma.tenant.update({
        where: { id: companyId },
        data: { tokenLimit },
      });

      // Log the token limit update
      await this.logCompanyAction(
        adminUserId,
        companyId,
        "TOKEN_LIMIT_UPDATE",
        { tokenLimit: updatedCompany.tokenLimit },
        { tokenLimit }
      );

      return updatedCompany;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      throw new Error(`Failed to update token limit: ${errorMessage}`);
    }
  }

  /**
   * Get company statistics for admin dashboard
   */
  async getCompanyStats(adminUserId: string) {
    try {
      // Validate admin access
      await this.validateAdminUser(adminUserId);

      const [
        totalCompanies,
        activeCompanies,
        totalUsers,
        totalStaff,
        totalRosters,
        monthlyTokenUsage,
      ] = await Promise.all([
        prisma.tenant.count(),
        prisma.tenant.count({ where: { isActive: true } }),
        prisma.user.count(),
        prisma.staff.count({ where: { isActive: true } }),
        prisma.roster.count(),
        prisma.tokenUsage.aggregate({
          where: {
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear(),
          },
          _sum: {
            tokensUsed: true,
            cost: true,
          },
        }),
      ]);

      return {
        companies: {
          total: totalCompanies,
          active: activeCompanies,
          suspended: totalCompanies - activeCompanies,
        },
        users: {
          total: totalUsers,
          staff: totalStaff,
        },
        rosters: {
          total: totalRosters,
        },
        tokens: {
          monthlyUsage: monthlyTokenUsage._sum.tokensUsed || 0,
          monthlyCost: monthlyTokenUsage._sum.cost || 0,
        },
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      throw new Error(`Failed to fetch company statistics: ${errorMessage}`);
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
      throw new Error("Insufficient permissions: Admin access required");
    }

    // Verify user belongs to Rooster AI company
    if (user.tenant.domain !== "roosterai.ie") {
      throw new Error("Invalid admin user: Must belong to Rooster AI company");
    }

    return user;
  }

  private async createDefaultRoles(tenantId: string) {
    const defaultRoles = [
      {
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
        tenantId,
      },
      {
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
        tenantId,
      },
      {
        name: "staff",
        description: "Staff member with limited access to personal schedules",
        permissions: ["roster:read", "profile:update", "requests:create"],
        isSystem: true,
        tenantId,
      },
    ];

    await prisma.role.createMany({
      data: defaultRoles,
      skipDuplicates: true,
    });
  }

  private async createStoreLocations(tenantId: string, locations: string[]) {
    const storeLocationData = locations.map((location) => ({
      name: location,
      address: location, // For now, use name as address
      tenantId,
      isActive: true,
    }));

    await prisma.storeLocation.createMany({
      data: storeLocationData,
    });
  }

  private async logCompanyAction(
    userId: string,
    companyId: string,
    action: string,
    oldData: any,
    newData: any
  ) {
    await prisma.auditLog.create({
      data: {
        action,
        entity: "Company",
        entityId: companyId,
        oldData: oldData || {},
        newData: newData || {},
        userId,
        tenantId: companyId,
        ipAddress: null, // Will be set by controller
        userAgent: null, // Will be set by controller
      },
    });
  }

  private async notifyCompanySuspension(ownerUsers: any[]) {
    // Implementation for sending suspension notifications
    // This would integrate with your notification service
    console.log(
      `Notifying ${ownerUsers.length} owner users of company suspension`
    );
  }
}
