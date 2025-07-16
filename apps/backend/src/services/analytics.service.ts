import { PrismaClient } from '@prisma/client';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays, format } from 'date-fns';

const prisma = new PrismaClient();

export class AnalyticsService {
  async getDashboardMetrics(companyId: string) {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    const [
      totalStaff,
      activeStaff,
      totalRosters,
      publishedRosters,
      thisWeekShifts,
      thisMonthShifts,
      upcomingShifts,
      recentActivity
    ] = await Promise.all([
      // Staff metrics
      prisma.staff.count({ where: { companyId } }),
      prisma.staff.count({ where: { companyId, isActive: true } }),
      
      // Roster metrics
      prisma.roster.count({ where: { companyId, isTemplate: false } }),
      prisma.roster.count({ where: { companyId, isPublished: true, isTemplate: false } }),
      
      // Shift metrics
      prisma.shift.count({
        where: {
          roster: { companyId },
          startTime: { gte: weekStart, lte: weekEnd }
        }
      }),
      prisma.shift.count({
        where: {
          roster: { companyId },
          startTime: { gte: monthStart, lte: monthEnd }
        }
      }),
      prisma.shift.count({
        where: {
          roster: { companyId },
          startTime: { gte: now }
        }
      }),
      
      // Recent activity
      prisma.roster.findMany({
        where: { companyId },
        orderBy: { updatedAt: 'desc' },
        take: 5,
        select: {
          id: true,
          name: true,
          isPublished: true,
          updatedAt: true,
          _count: { select: { shifts: true } }
        }
      })
    ]);

    return {
      staff: {
        total: totalStaff,
        active: activeStaff,
        activePercentage: totalStaff > 0 ? (activeStaff / totalStaff) * 100 : 0
      },
      rosters: {
        total: totalRosters,
        published: publishedRosters,
        publishedPercentage: totalRosters > 0 ? (publishedRosters / totalRosters) * 100 : 0
      },
      shifts: {
        thisWeek: thisWeekShifts,
        thisMonth: thisMonthShifts,
        upcoming: upcomingShifts
      },
      recentActivity
    };
  }

  async getStaffUtilization(companyId: string, days = 30) {
    const endDate = new Date();
    const startDate = subDays(endDate, days);

    const staffUtilization = await prisma.staff.findMany({
      where: { companyId, isActive: true },
      select: {
        id: true,
        name: true,
        position: true,
        department: true,
        shifts: {
          where: {
            startTime: { gte: startDate, lte: endDate }
          },
          select: {
            startTime: true,
            endTime: true
          }
        }
      }
    });

    return staffUtilization.map(staff => {
      const totalHours = staff.shifts.reduce((sum, shift) => {
        const hours = (shift.endTime.getTime() - shift.startTime.getTime()) / (1000 * 60 * 60);
        return sum + hours;
      }, 0);

      return {
        id: staff.id,
        name: staff.name,
        position: staff.position,
        department: staff.department,
        totalShifts: staff.shifts.length,
        totalHours: Math.round(totalHours * 100) / 100,
        averageHoursPerShift: staff.shifts.length > 0 ? Math.round((totalHours / staff.shifts.length) * 100) / 100 : 0
      };
    });
  }

  async getDepartmentAnalytics(companyId: string) {
    const departments = await prisma.staff.groupBy({
      by: ['department'],
      where: { companyId, isActive: true },
      _count: { department: true },
      _avg: { hourlyRate: true }
    });

    const departmentShifts = await Promise.all(
      departments.map(async (dept) => {
        const shifts = await prisma.shift.count({
          where: {
            staff: {
              companyId,
              department: dept.department,
              isActive: true
            },
            startTime: {
              gte: startOfMonth(new Date())
            }
          }
        });
        return { department: dept.department, shifts };
      })
    );

    return departments.map(dept => {
      const shiftData = departmentShifts.find(s => s.department === dept.department);
      return {
        department: dept.department,
        staffCount: dept._count.department,
        averageHourlyRate: dept._avg.hourlyRate || 0,
        monthlyShifts: shiftData?.shifts || 0
      };
    });
  }

  async getSchedulingTrends(companyId: string, days = 30) {
    const endDate = new Date();
    const startDate = subDays(endDate, days);

    const dailyShifts = await prisma.shift.groupBy({
      by: ['startTime'],
      where: {
        roster: { companyId },
        startTime: { gte: startDate, lte: endDate }
      },
      _count: { id: true }
    });

    // Group by day
    const trendData = dailyShifts.reduce((acc: any, shift) => {
      const day = format(shift.startTime, 'yyyy-MM-dd');
      if (!acc[day]) {
        acc[day] = 0;
      }
      acc[day] += shift._count.id;
      return acc;
    }, {});

    return Object.keys(trendData).map(date => ({
      date,
      shifts: trendData[date]
    })).sort((a, b) => a.date.localeCompare(b.date));
  }

  async getPositionDistribution(companyId: string) {
    const positions = await prisma.staff.groupBy({
      by: ['position'],
      where: { companyId, isActive: true },
      _count: { position: true }
    });

    const total = positions.reduce((sum, pos) => sum + pos._count.position, 0);

    return positions.map(pos => ({
      position: pos.position,
      count: pos._count.position,
      percentage: total > 0 ? Math.round((pos._count.position / total) * 100) : 0
    }));
  }

  async getCostAnalysis(companyId: string, startDate: Date, endDate: Date) {
    const shifts = await prisma.shift.findMany({
      where: {
        roster: { companyId },
        startTime: { gte: startDate, lte: endDate }
      },
      include: {
        staff: {
          select: {
            hourlyRate: true,
            position: true,
            department: true
          }
        }
      }
    });

    let totalCost = 0;
    const departmentCosts: Record<string, number> = {};
    const positionCosts: Record<string, number> = {};

    shifts.forEach(shift => {
      const hours = (shift.endTime.getTime() - shift.startTime.getTime()) / (1000 * 60 * 60);
      const cost = hours * (shift.staff.hourlyRate?.toNumber() || 0);
      
      totalCost += cost;
      
      departmentCosts[shift.staff.department] = (departmentCosts[shift.staff.department] || 0) + cost;
      positionCosts[shift.staff.position] = (positionCosts[shift.staff.position] || 0) + cost;
    });

    return {
      totalCost: Math.round(totalCost * 100) / 100,
      totalShifts: shifts.length,
      averageCostPerShift: shifts.length > 0 ? Math.round((totalCost / shifts.length) * 100) / 100 : 0,
      departmentBreakdown: Object.keys(departmentCosts).map(dept => ({
        department: dept,
        cost: Math.round(departmentCosts[dept] * 100) / 100
      })),
      positionBreakdown: Object.keys(positionCosts).map(pos => ({
        position: pos,
        cost: Math.round(positionCosts[pos] * 100) / 100
      }))
    };
  }
}
