import { PrismaClient } from '@prisma/client';
import { CreateRosterInput, UpdateRosterInput, RosterFilterInput } from '@rooster-ai/shared';

const prisma = new PrismaClient();

export class RosterService {
  async createRoster(data: CreateRosterInput, tenantId: string) {
    // Validate date range
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    
    if (startDate >= endDate) {
      throw new Error('End date must be after start date');
    }

    // Check for overlapping rosters
    const overlappingRoster = await prisma.roster.findFirst({
      where: {
        tenantId,
        AND: [
          {
            OR: [
              {
                startDate: {
                  lte: endDate
                },
                endDate: {
                  gte: startDate
                }
              }
            ]
          }
        ]
      }
    });

    if (overlappingRoster && !data.isTemplate) {
      throw new Error('Roster dates overlap with existing roster');
    }

    // Create roster
    const roster = await prisma.roster.create({
      data: {
        name: data.name,
        startDate,
        endDate,
        isTemplate: data.isTemplate || false,
        notes: data.notes,
        tenantId,
        shifts: {
          create: data.shifts?.map(shift => ({
            staffId: shift.staffId,
            startTime: new Date(shift.startTime),
            endTime: new Date(shift.endTime),
            position: shift.position,
            notes: shift.notes,
            isConfirmed: false
          })) || []
        }
      },
      include: {
        shifts: {
          include: {
            staff: {
              select: {
                id: true,
                name: true,
                email: true,
                position: true,
                department: true
              }
            }
          }
        }
      }
    });

    return roster;
  }

  async getRosterById(id: string, tenantId: string) {
    const roster = await prisma.roster.findFirst({
      where: {
        id,
        tenantId
      },
      include: {
        shifts: {
          include: {
            staff: {
              select: {
                id: true,
                name: true,
                email: true,
                position: true,
                department: true,
                avatar: true
              }
            }
          },
          orderBy: {
            startTime: 'asc'
          }
        }
      }
    });

    if (!roster) {
      throw new Error('Roster not found');
    }

    return roster;
  }

  async getAllRosters(tenantId: string, filters: Partial<RosterFilterInput> = {}) {
    const {
      startDate,
      endDate,
      isPublished,
      isTemplate,
      page = 1,
      limit = 20,
      sortBy = 'startDate',
      sortOrder = 'desc'
    } = filters;

    // Build where clause
    const where: any = {
      tenantId
    };

    if (startDate) {
      where.startDate = {
        gte: new Date(startDate)
      };
    }

    if (endDate) {
      where.endDate = {
        lte: new Date(endDate)
      };
    }

    if (typeof isPublished === 'boolean') {
      where.isPublished = isPublished;
    }

    if (typeof isTemplate === 'boolean') {
      where.isTemplate = isTemplate;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get total count
    const total = await prisma.roster.count({ where });

    // Get rosters with pagination
    const rosters = await prisma.roster.findMany({
      where,
      include: {
        shifts: {
          include: {
            staff: {
              select: {
                id: true,
                name: true,
                position: true
              }
            }
          }
        },
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
      data: rosters,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async updateRoster(id: string, data: UpdateRosterInput, tenantId: string) {
    // Verify roster exists and belongs to tenant
    const existingRoster = await prisma.roster.findFirst({
      where: { id, tenantId }
    });

    if (!existingRoster) {
      throw new Error('Roster not found');
    }

    // Check if roster is published and prevent certain updates
    if (existingRoster.isPublished && data.shifts) {
      throw new Error('Cannot modify shifts of a published roster');
    }

    // Update roster
    const updatedRoster = await prisma.roster.update({
      where: { id },
      data: {
        name: data.name,
        notes: data.notes,
        ...(data.startDate && { startDate: new Date(data.startDate) }),
        ...(data.endDate && { endDate: new Date(data.endDate) })
      },
      include: {
        shifts: {
          include: {
            staff: {
              select: {
                id: true,
                name: true,
                email: true,
                position: true,
                department: true
              }
            }
          }
        }
      }
    });

    return updatedRoster;
  }

  async deleteRoster(id: string, tenantId: string) {
    // Verify roster exists and belongs to tenant
    const existingRoster = await prisma.roster.findFirst({
      where: { id, tenantId }
    });

    if (!existingRoster) {
      throw new Error('Roster not found');
    }

    // Check if roster is published
    if (existingRoster.isPublished) {
      throw new Error('Cannot delete a published roster');
    }

    // Delete roster (cascades to shifts)
    await prisma.roster.delete({
      where: { id }
    });

    return { message: 'Roster deleted successfully' };
  }

  async publishRoster(id: string, tenantId: string) {
    // Verify roster exists and belongs to tenant
    const roster = await prisma.roster.findFirst({
      where: { id, tenantId },
      include: {
        shifts: {
          include: {
            staff: true
          }
        }
      }
    });

    if (!roster) {
      throw new Error('Roster not found');
    }

    if (roster.isPublished) {
      throw new Error('Roster is already published');
    }

    // Validate roster before publishing
    await this.validateRosterForPublishing(roster);

    // Publish roster
    const publishedRoster = await prisma.roster.update({
      where: { id },
      data: { isPublished: true },
      include: {
        shifts: {
          include: {
            staff: {
              select: {
                id: true,
                name: true,
                email: true,
                position: true
              }
            }
          }
        }
      }
    });

    // TODO: Send notifications to staff members
    // await this.notifyStaffOfPublishedRoster(publishedRoster);

    return publishedRoster;
  }

  async addShiftToRoster(rosterId: string, shiftData: any, tenantId: string) {
    // Verify roster exists and belongs to tenant
    const roster = await prisma.roster.findFirst({
      where: { id: rosterId, tenantId }
    });

    if (!roster) {
      throw new Error('Roster not found');
    }

    if (roster.isPublished) {
      throw new Error('Cannot add shifts to a published roster');
    }

    // Validate shift timing
    const startTime = new Date(shiftData.startTime);
    const endTime = new Date(shiftData.endTime);

    if (startTime >= endTime) {
      throw new Error('Shift end time must be after start time');
    }

    // Check for conflicts
    await this.checkShiftConflicts(shiftData.staffId, startTime, endTime, rosterId);

    // Create shift
    const shift = await prisma.shift.create({
      data: {
        rosterId,
        staffId: shiftData.staffId,
        startTime,
        endTime,
        position: shiftData.position,
        notes: shiftData.notes,
        isConfirmed: false
      },
      include: {
        staff: {
          select: {
            id: true,
            name: true,
            email: true,
            position: true,
            department: true
          }
        }
      }
    });

    return shift;
  }

  async updateShift(shiftId: string, shiftData: any, tenantId: string) {
    // Verify shift exists and belongs to tenant
    const existingShift = await prisma.shift.findFirst({
      where: {
        id: shiftId,
        roster: {
          tenantId
        }
      },
      include: {
        roster: true
      }
    });

    if (!existingShift) {
      throw new Error('Shift not found');
    }

    if (existingShift.roster.isPublished) {
      throw new Error('Cannot modify shifts in a published roster');
    }

    // Validate timing if provided
    if (shiftData.startTime && shiftData.endTime) {
      const startTime = new Date(shiftData.startTime);
      const endTime = new Date(shiftData.endTime);

      if (startTime >= endTime) {
        throw new Error('Shift end time must be after start time');
      }

      // Check for conflicts (excluding current shift)
      await this.checkShiftConflicts(
        shiftData.staffId || existingShift.staffId,
        startTime,
        endTime,
        existingShift.rosterId,
        shiftId
      );
    }

    // Update shift
    const updatedShift = await prisma.shift.update({
      where: { id: shiftId },
      data: {
        ...(shiftData.staffId && { staffId: shiftData.staffId }),
        ...(shiftData.startTime && { startTime: new Date(shiftData.startTime) }),
        ...(shiftData.endTime && { endTime: new Date(shiftData.endTime) }),
        ...(shiftData.position && { position: shiftData.position }),
        ...(shiftData.notes !== undefined && { notes: shiftData.notes }),
        ...(shiftData.isConfirmed !== undefined && { isConfirmed: shiftData.isConfirmed })
      },
      include: {
        staff: {
          select: {
            id: true,
            name: true,
            email: true,
            position: true,
            department: true
          }
        }
      }
    });

    return updatedShift;
  }

  async deleteShift(shiftId: string, tenantId: string) {
    // Verify shift exists and belongs to tenant
    const existingShift = await prisma.shift.findFirst({
      where: {
        id: shiftId,
        roster: {
          tenantId
        }
      },
      include: {
        roster: true
      }
    });

    if (!existingShift) {
      throw new Error('Shift not found');
    }

    if (existingShift.roster.isPublished) {
      throw new Error('Cannot delete shifts from a published roster');
    }

    // Delete shift
    await prisma.shift.delete({
      where: { id: shiftId }
    });

    return { message: 'Shift deleted successfully' };
  }

  async createRosterFromTemplate(templateId: string, startDate: string, endDate: string, tenantId: string) {
    // Get template
    const template = await prisma.roster.findFirst({
      where: {
        id: templateId,
        tenantId,
        isTemplate: true
      },
      include: {
        shifts: true
      }
    });

    if (!template) {
      throw new Error('Template not found');
    }

    const newStartDate = new Date(startDate);
    const newEndDate = new Date(endDate);
    const templateDuration = template.endDate.getTime() - template.startDate.getTime();

    // Create new roster from template
    const newRoster = await prisma.roster.create({
      data: {
        name: `${template.name} - ${newStartDate.toLocaleDateString()}`,
        startDate: newStartDate,
        endDate: newEndDate,
        tenantId,
        isTemplate: false,
        isPublished: false,
        shifts: {
          create: template.shifts.map(shift => {
            // Calculate time offset
            const shiftOffset = shift.startTime.getTime() - template.startDate.getTime();
            const newShiftStart = new Date(newStartDate.getTime() + shiftOffset);
            const shiftDuration = shift.endTime.getTime() - shift.startTime.getTime();
            const newShiftEnd = new Date(newShiftStart.getTime() + shiftDuration);

            return {
              staffId: shift.staffId,
              startTime: newShiftStart,
              endTime: newShiftEnd,
              position: shift.position,
              notes: shift.notes,
              isConfirmed: false
            };
          })
        }
      },
      include: {
        shifts: {
          include: {
            staff: {
              select: {
                id: true,
                name: true,
                email: true,
                position: true,
                department: true
              }
            }
          }
        }
      }
    });

    return newRoster;
  }

  private async checkShiftConflicts(
    staffId: string,
    startTime: Date,
    endTime: Date,
    rosterId: string,
    excludeShiftId?: string
  ) {
    // Check for overlapping shifts for the same staff member
    const conflictingShifts = await prisma.shift.findMany({
      where: {
        staffId,
        id: excludeShiftId ? { not: excludeShiftId } : undefined,
        AND: [
          {
            startTime: {
              lt: endTime
            }
          },
          {
            endTime: {
              gt: startTime
            }
          }
        ]
      },
      include: {
        roster: true
      }
    });

    if (conflictingShifts.length > 0) {
      throw new Error(`Staff member has conflicting shifts during this time period`);
    }

    // Check staff availability
    const dayOfWeek = startTime.getDay();
    const startTimeStr = startTime.toTimeString().substring(0, 5);
    const endTimeStr = endTime.toTimeString().substring(0, 5);

    const availability = await prisma.staffAvailability.findFirst({
      where: {
        staffId,
        dayOfWeek,
        isActive: true,
        startTime: {
          lte: startTimeStr
        },
        endTime: {
          gte: endTimeStr
        }
      }
    });

    if (!availability) {
      throw new Error('Staff member is not available during this time');
    }
  }

  private async validateRosterForPublishing(roster: any) {
    // Check if roster has any shifts
    if (roster.shifts.length === 0) {
      throw new Error('Cannot publish an empty roster');
    }

    // Check if all shifts have confirmed staff
    const unconfirmedShifts = roster.shifts.filter((shift: any) => !shift.isConfirmed);
    if (unconfirmedShifts.length > 0) {
      throw new Error('All shifts must be confirmed before publishing');
    }

    // Additional validation rules can be added here
  }

  async getRosterStats(tenantId: string) {
    const [
      totalRosters,
      publishedRosters,
      templateRosters,
      totalShifts,
      confirmedShifts
    ] = await Promise.all([
      prisma.roster.count({ where: { tenantId, isTemplate: false } }),
      prisma.roster.count({ where: { tenantId, isPublished: true, isTemplate: false } }),
      prisma.roster.count({ where: { tenantId, isTemplate: true } }),
      prisma.shift.count({
        where: {
          roster: {
            tenantId,
            isTemplate: false
          }
        }
      }),
      prisma.shift.count({
        where: {
          roster: {
            tenantId,
            isTemplate: false
          },
          isConfirmed: true
        }
      })
    ]);

    return {
      totalRosters,
      publishedRosters,
      templateRosters,
      totalShifts,
      confirmedShifts,
      confirmationRate: totalShifts > 0 ? (confirmedShifts / totalShifts) * 100 : 0
    };
  }
}
