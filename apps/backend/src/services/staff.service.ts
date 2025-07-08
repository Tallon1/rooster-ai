import { PrismaClient } from '@prisma/client';
import { CreateStaffInput, UpdateStaffInput, StaffFilterInput } from '@rooster-ai/shared';

const prisma = new PrismaClient();

export class StaffService {
  async createStaff(data: CreateStaffInput, tenantId: string) {
    // Check if staff member already exists with same email in tenant
    const existingStaff = await prisma.staff.findUnique({
      where: {
        tenantId_email: {
          tenantId,
          email: data.email
        }
      }
    });

    if (existingStaff) {
      throw new Error('Staff member already exists with this email');
    }

    // Create staff member
    const staff = await prisma.staff.create({
      data: {
        ...data,
        tenantId,
        startDate: new Date(data.startDate),
        ...(data.endDate && { endDate: new Date(data.endDate) })
      },
      include: {
        availability: true
      }
    });

    return staff;
  }

  async getStaffById(id: string, tenantId: string) {
    const staff = await prisma.staff.findFirst({
      where: {
        id,
        tenantId
      },
      include: {
        availability: true,
        shifts: {
          include: {
            roster: true
          },
          orderBy: {
            startTime: 'desc'
          },
          take: 10 // Last 10 shifts
        }
      }
    });

    if (!staff) {
      throw new Error('Staff member not found');
    }

    return staff;
  }

  async getAllStaff(tenantId: string, filters: Partial<StaffFilterInput> = {}) {
    const {
      department,
      position,
      isActive,
      search,
      page = 1,
      limit = 20,
      sortBy = 'name',
      sortOrder = 'asc'
    } = filters;

    // Build where clause
    const where: any = {
      tenantId
    };

    if (department) {
      where.department = department;
    }

    if (position) {
      where.position = position;
    }

    if (typeof isActive === 'boolean') {
      where.isActive = isActive;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get total count
    const total = await prisma.staff.count({ where });

    // Get staff with pagination
    const staff = await prisma.staff.findMany({
      where,
      include: {
        availability: true,
        _count: {
          select: {
            shifts: true
          }
        }
      },
      orderBy: {
        [sortBy]: sortOrder
      },
      skip,
      take: limit
    });

    return {
      data: staff,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async updateStaff(id: string, data: UpdateStaffInput, tenantId: string) {
    // Verify staff exists and belongs to tenant
    const existingStaff = await prisma.staff.findFirst({
      where: { id, tenantId }
    });

    if (!existingStaff) {
      throw new Error('Staff member not found');
    }

    // Check email uniqueness if email is being updated
    if (data.email && data.email !== existingStaff.email) {
      const emailExists = await prisma.staff.findUnique({
        where: {
          tenantId_email: {
            tenantId,
            email: data.email
          }
        }
      });

      if (emailExists) {
        throw new Error('Staff member already exists with this email');
      }
    }

    // Update staff member
    const updatedStaff = await prisma.staff.update({
      where: { id },
      data: {
        ...data,
        ...(data.startDate && { startDate: new Date(data.startDate) }),
        ...(data.endDate && { endDate: new Date(data.endDate) })
      },
      include: {
        availability: true
      }
    });

    return updatedStaff;
  }

  async deleteStaff(id: string, tenantId: string) {
    // Verify staff exists and belongs to tenant
    const existingStaff = await prisma.staff.findFirst({
      where: { id, tenantId }
    });

    if (!existingStaff) {
      throw new Error('Staff member not found');
    }

    // Check if staff has future shifts
    const futureShifts = await prisma.shift.count({
      where: {
        staffId: id,
        startTime: {
          gte: new Date()
        }
      }
    });

    if (futureShifts > 0) {
      throw new Error('Cannot delete staff member with future shifts. Please reassign or cancel shifts first.');
    }

    // Soft delete by setting isActive to false
    const deletedStaff = await prisma.staff.update({
      where: { id },
      data: { isActive: false }
    });

    return deletedStaff;
  }

  async getStaffStats(tenantId: string) {
    const [
      totalStaff,
      activeStaff,
      departments,
      positions
    ] = await Promise.all([
      prisma.staff.count({ where: { tenantId } }),
      prisma.staff.count({ where: { tenantId, isActive: true } }),
      prisma.staff.groupBy({
        by: ['department'],
        where: { tenantId, isActive: true },
        _count: true
      }),
      prisma.staff.groupBy({
        by: ['position'],
        where: { tenantId, isActive: true },
        _count: true
      })
    ]);

    return {
      totalStaff,
      activeStaff,
      departments: departments.map((d: any) => ({
        name: d.department,
        count: d._count
      })),
      positions: positions.map((p: any) => ({
        name: p.position,
        count: p._count
      }))
    };
  }

  async updateStaffAvailability(staffId: string, availability: any[], tenantId: string) {
    // Verify staff exists and belongs to tenant
    const staff = await prisma.staff.findFirst({
      where: { id: staffId, tenantId }
    });

    if (!staff) {
      throw new Error('Staff member not found');
    }

    // Delete existing availability
    await prisma.staffAvailability.deleteMany({
      where: { staffId }
    });

    // Create new availability records
    if (availability.length > 0) {
      await prisma.staffAvailability.createMany({
        data: availability.map(avail => ({
          staffId,
          dayOfWeek: avail.dayOfWeek,
          startTime: avail.startTime,
          endTime: avail.endTime,
          isActive: avail.isActive ?? true
        }))
      });
    }

    // Return updated staff with availability
    return this.getStaffById(staffId, tenantId);
  }
}
