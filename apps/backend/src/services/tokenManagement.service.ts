import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class TokenManagementService {
  async getAdminTokenStats(adminUserId: string, month?: number, year?: number) {
    // Validate admin access
    await this.validateAdminUser(adminUserId);

    const currentDate = new Date();
    const targetMonth = month || currentDate.getMonth() + 1;
    const targetYear = year || currentDate.getFullYear();

    // Get token usage across all companies
    const tokenStats = await prisma.tokenUsage.groupBy({
      by: ["tenantId"],
      where: {
        month: targetMonth,
        year: targetYear,
      },
      _sum: {
        tokensUsed: true,
        cost: true,
      },
      _count: {
        userId: true,
      },
    });

    // Get company details
    const companies = await prisma.tenant.findMany({
      where: {
        id: {
          in: tokenStats.map((stat) => stat.tenantId),
        },
      },
      select: {
        id: true,
        name: true,
        tokenLimit: true,
      },
    });

    // Combine data
    const result = tokenStats.map((stat) => {
      const company = companies.find((c) => c.id === stat.tenantId);

      // Handle null values properly
      const tokensUsed = stat._sum.tokensUsed || 0;
      const cost = stat._sum.cost ? stat._sum.cost.toNumber() : 0;

      return {
        companyId: stat.tenantId,
        companyName: company?.name || "Unknown",
        tokenLimit: company?.tokenLimit || 0,
        tokensUsed,
        cost,
        activeUsers: stat._count.userId,
        utilizationPercentage: company?.tokenLimit
          ? (tokensUsed / company.tokenLimit) * 100
          : 0,
      };
    });

    return {
      month: targetMonth,
      year: targetYear,
      totalCompanies: result.length,
      totalTokensUsed: result.reduce((sum, r) => sum + r.tokensUsed, 0),
      totalCost: result.reduce((sum, r) => sum + r.cost, 0),
      companies: result,
    };
  }

  async getCompanyTokenUsage(
    companyId: string,
    adminUserId: string,
    month?: number,
    year?: number
  ) {
    // Validate admin access
    await this.validateAdminUser(adminUserId);

    const currentDate = new Date();
    const targetMonth = month || currentDate.getMonth() + 1;
    const targetYear = year || currentDate.getFullYear();

    // Get company token usage
    const usage = await prisma.tokenUsage.findMany({
      where: {
        tenantId: companyId,
        month: targetMonth,
        year: targetYear,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        tokensUsed: "desc",
      },
    });

    // Get company details
    const company = await prisma.tenant.findUnique({
      where: { id: companyId },
      select: {
        id: true,
        name: true,
        tokenLimit: true,
      },
    });

    if (!company) {
      throw new Error("Company not found");
    }

    const totalUsed = usage.reduce((sum, u) => sum + u.tokensUsed, 0);
    // Proper null handling for Decimal cost values
    const totalCost = usage.reduce(
      (sum, u) => sum + (u.cost ? u.cost.toNumber() : 0),
      0
    );

    return {
      company,
      month: targetMonth,
      year: targetYear,
      tokenLimit: company.tokenLimit,
      totalTokensUsed: totalUsed,
      totalCost,
      remainingTokens: company.tokenLimit - totalUsed,
      utilizationPercentage: (totalUsed / company.tokenLimit) * 100,
      userUsage: usage.map((u) => ({
        userId: u.userId,
        userName: u.user.name,
        userEmail: u.user.email,
        userRole: u.user.role.name,
        tokensUsed: u.tokensUsed,
        cost: u.cost ? u.cost.toNumber() : 0,
      })),
    };
  }

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
}
