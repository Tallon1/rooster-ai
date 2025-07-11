import { PrismaClient } from "@prisma/client";
import {
  CreateStoreLocationInput,
  UpdateStoreLocationInput,
  AssignStaffToLocationInput,
  StoreLocationFilterInput,
  PaginatedResponse,
} from "@rooster-ai/shared";

const prisma = new PrismaClient();

export class StoreLocationService {
  /**
   * Create a new store location
   */
  async createStoreLocation(
    data: CreateStoreLocationInput,
    tenantId: string,
    userId: string
  ) {
    try {
      // Validate user has permission to create locations
      await this.validateUserAccess(userId, tenantId, [
        "admin",
        "owner",
        "manager",
      ]);

      const location = await prisma.storeLocation.create({
        data: {
          name: data.name,
          address: data.address,
          isActive: data.isActive ?? true,
          tenantId,
        },
        include: {
          _count: {
            select: {
              staffAssignments: true,
            },
          },
        },
      });

      // Log the creation for audit
      await this.logLocationAction(
        userId,
        location.id,
        "CREATE",
        null,
        location
      );

      return location;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      throw new Error(`Failed to create store location: ${errorMessage}`);
    }
  }

  /**
   * Get store location by ID
   */
  async getStoreLocationById(id: string, tenantId: string, userId: string) {
    try {
      await this.validateUserAccess(userId, tenantId);

      const location = await prisma.storeLocation.findFirst({
        where: {
          id,
          tenantId,
        },
        include: {
          staffAssignments: {
            include: {
              staff: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  position: true,
                  department: true,
                  isActive: true,
                },
              },
            },
          },
          _count: {
            select: {
              staffAssignments: true,
            },
          },
        },
      });

      if (!location) {
        throw new Error("Store location not found");
      }

      return location;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      throw new Error(`Failed to fetch store location: ${errorMessage}`);
    }
  }

  /**
   * Get all store locations for a company
   */
  async getAllStoreLocations(
    tenantId: string,
    userId: string,
    filters: Partial<StoreLocationFilterInput> = {}
  ): Promise<PaginatedResponse> {
    try {
      await this.validateUserAccess(userId, tenantId);

      const {
        search,
        isActive,
        page = 1,
        limit = 20,
        sortBy = "name",
        sortOrder = "asc",
      } = filters;

      // Build where clause
      const where: any = { tenantId };

      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { address: { contains: search, mode: "insensitive" } },
        ];
      }

      if (typeof isActive === "boolean") {
        where.isActive = isActive;
      }

      // Calculate pagination
      const skip = (page - 1) * limit;

      // Get total count
      const total = await prisma.storeLocation.count({ where });

      // Get locations
      const locations = await prisma.storeLocation.findMany({
        where,
        include: {
          staffAssignments: {
            include: {
              staff: {
                select: {
                  id: true,
                  name: true,
                  position: true,
                },
              },
            },
          },
          _count: {
            select: {
              staffAssignments: true,
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
        data: locations,
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
      throw new Error(`Failed to fetch store locations: ${errorMessage}`);
    }
  }

  /**
   * Update store location
   */
  async updateStoreLocation(
    id: string,
    data: UpdateStoreLocationInput,
    tenantId: string,
    userId: string
  ) {
    try {
      await this.validateUserAccess(userId, tenantId, [
        "admin",
        "owner",
        "manager",
      ]);

      // Get existing location for audit
      const existingLocation = await prisma.storeLocation.findFirst({
        where: { id, tenantId },
      });

      if (!existingLocation) {
        throw new Error("Store location not found");
      }

      // Update location
      const updatedLocation = await prisma.storeLocation.update({
        where: { id },
        data: {
          ...(data.name && { name: data.name }),
          ...(data.address && { address: data.address }),
          ...(typeof data.isActive === "boolean" && {
            isActive: data.isActive,
          }),
        },
        include: {
          staffAssignments: {
            include: {
              staff: {
                select: {
                  id: true,
                  name: true,
                  position: true,
                },
              },
            },
          },
          _count: {
            select: {
              staffAssignments: true,
            },
          },
        },
      });

      // Log the update for audit
      await this.logLocationAction(
        userId,
        id,
        "UPDATE",
        existingLocation,
        updatedLocation
      );

      return updatedLocation;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      throw new Error(`Failed to update store location: ${errorMessage}`);
    }
  }

  /**
   * Delete store location
   */
  async deleteStoreLocation(id: string, tenantId: string, userId: string) {
    try {
      await this.validateUserAccess(userId, tenantId, ["admin", "owner"]);

      // Check if location exists
      const existingLocation = await prisma.storeLocation.findFirst({
        where: { id, tenantId },
        include: {
          _count: {
            select: {
              staffAssignments: true,
            },
          },
        },
      });

      if (!existingLocation) {
        throw new Error("Store location not found");
      }

      // Check if location has staff assignments
      if (existingLocation._count.staffAssignments > 0) {
        throw new Error(
          "Cannot delete location with assigned staff. Please remove all staff assignments first."
        );
      }

      // Delete location
      await prisma.storeLocation.delete({
        where: { id },
      });

      // Log the deletion for audit
      await this.logLocationAction(
        userId,
        id,
        "DELETE",
        existingLocation,
        null
      );

      return { message: "Store location deleted successfully" };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      throw new Error(`Failed to delete store location: ${errorMessage}`);
    }
  }

  /**
   * Assign staff to location
   */
  async assignStaffToLocation(
    locationId: string,
    data: AssignStaffToLocationInput,
    tenantId: string,
    userId: string
  ) {
    try {
      await this.validateUserAccess(userId, tenantId, [
        "admin",
        "owner",
        "manager",
      ]);

      // Verify location exists and belongs to tenant
      const location = await prisma.storeLocation.findFirst({
        where: { id: locationId, tenantId },
      });

      if (!location) {
        throw new Error("Store location not found");
      }

      // Verify all staff members exist and belong to tenant
      const staff = await prisma.staff.findMany({
        where: {
          id: { in: data.staffIds },
          tenantId,
          isActive: true,
        },
      });

      if (staff.length !== data.staffIds.length) {
        throw new Error("One or more staff members not found or inactive");
      }

      // Remove existing assignments for this location
      await prisma.staffStoreLocation.deleteMany({
        where: { storeLocationId: locationId },
      });

      // Create new assignments
      const assignments = data.staffIds.map((staffId) => ({
        staffId,
        storeLocationId: locationId,
      }));

      await prisma.staffStoreLocation.createMany({
        data: assignments,
      });

      // Get updated location with assignments
      const updatedLocation = await this.getStoreLocationById(
        locationId,
        tenantId,
        userId
      );

      // Log the assignment for audit
      await this.logLocationAction(
        userId,
        locationId,
        "STAFF_ASSIGNMENT",
        { staffIds: [] },
        { staffIds: data.staffIds }
      );

      return updatedLocation;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      throw new Error(`Failed to assign staff to location: ${errorMessage}`);
    }
  }

  /**
   * Get staff assigned to a location
   */
  async getLocationStaff(locationId: string, tenantId: string, userId: string) {
    try {
      await this.validateUserAccess(userId, tenantId);

      const location = await prisma.storeLocation.findFirst({
        where: { id: locationId, tenantId },
        include: {
          staffAssignments: {
            include: {
              staff: {
                include: {
                  availability: true,
                },
              },
            },
          },
        },
      });

      if (!location) {
        throw new Error("Store location not found");
      }

      return location.staffAssignments.map((assignment) => assignment.staff);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      throw new Error(`Failed to fetch location staff: ${errorMessage}`);
    }
  }

  /**
   * Get store location statistics
   */
  async getLocationStats(tenantId: string, userId: string) {
    try {
      await this.validateUserAccess(userId, tenantId);

      const [
        totalLocations,
        activeLocations,
        totalAssignments,
        locationsWithStaff,
      ] = await Promise.all([
        prisma.storeLocation.count({ where: { tenantId } }),
        prisma.storeLocation.count({ where: { tenantId, isActive: true } }),
        prisma.staffStoreLocation.count({
          where: {
            storeLocation: { tenantId },
          },
        }),
        prisma.storeLocation.count({
          where: {
            tenantId,
            staffAssignments: {
              some: {},
            },
          },
        }),
      ]);

      return {
        totalLocations,
        activeLocations,
        inactiveLocations: totalLocations - activeLocations,
        totalStaffAssignments: totalAssignments,
        locationsWithStaff,
        locationsWithoutStaff: totalLocations - locationsWithStaff,
        averageStaffPerLocation:
          totalLocations > 0 ? totalAssignments / totalLocations : 0,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      throw new Error(`Failed to fetch location statistics: ${errorMessage}`);
    }
  }

  /**
   * Private helper methods
   */
  private async validateUserAccess(
    userId: string,
    tenantId: string,
    allowedRoles?: string[]
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

    if (user.tenantId !== tenantId && user.role.name !== "admin") {
      throw new Error("Access denied: User does not belong to this company");
    }

    if (allowedRoles && !allowedRoles.includes(user.role.name)) {
      throw new Error(
        `Insufficient permissions: ${allowedRoles.join(", ")} access required`
      );
    }

    return user;
  }

  private async logLocationAction(
    userId: string,
    locationId: string,
    action: string,
    oldData: any,
    newData: any
  ) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { tenantId: true },
      });

      if (user) {
        await prisma.auditLog.create({
          data: {
            action,
            entity: "StoreLocation",
            entityId: locationId,
            oldData: oldData || {},
            newData: newData || {},
            userId,
            tenantId: user.tenantId,
            ipAddress: null,
            userAgent: null,
          },
        });
      }
    } catch (error) {
      // Log audit error but don't fail the main operation
      console.error("Failed to log location action:", error);
    }
  }
}
