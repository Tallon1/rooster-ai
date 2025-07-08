import { PrismaClient } from "@prisma/client";
import * as XLSX from "xlsx";
import PDFDocument from "pdfkit";
import { format } from "date-fns";

const prisma = new PrismaClient();

export class ExportService {
  async exportRosterToExcel(
    rosterId: string,
    tenantId: string
  ): Promise<Buffer> {
    const roster = await this.getRosterWithDetails(rosterId, tenantId);

    // Create workbook
    const workbook = XLSX.utils.book_new();

    // Prepare roster data
    const rosterData = [
      ["Roster Name", roster.name],
      ["Start Date", format(roster.startDate, "yyyy-MM-dd")],
      ["End Date", format(roster.endDate, "yyyy-MM-dd")],
      ["Status", roster.isPublished ? "Published" : "Draft"],
      ["Total Shifts", roster.shifts.length],
      [""],
      [
        "Staff Name",
        "Position",
        "Department",
        "Date",
        "Start Time",
        "End Time",
        "Hours",
        "Notes",
      ],
    ];

    // Add shift data
    roster.shifts.forEach((shift) => {
      const hours =
        (shift.endTime.getTime() - shift.startTime.getTime()) /
        (1000 * 60 * 60);
      rosterData.push([
        shift.staff.name,
        shift.staff.position,
        shift.staff.department,
        format(shift.startTime, "yyyy-MM-dd"),
        format(shift.startTime, "HH:mm"),
        format(shift.endTime, "HH:mm"),
        hours.toFixed(2),
        shift.notes || "",
      ]);
    });

    // Create worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(rosterData);

    // Set column widths
    worksheet["!cols"] = [
      { width: 20 }, // Staff Name
      { width: 15 }, // Position
      { width: 15 }, // Department
      { width: 12 }, // Date
      { width: 10 }, // Start Time
      { width: 10 }, // End Time
      { width: 8 }, // Hours
      { width: 30 }, // Notes
    ];

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Roster");

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
    return buffer;
  }

  async exportRosterToPDF(rosterId: string, tenantId: string): Promise<Buffer> {
    const roster = await this.getRosterWithDetails(rosterId, tenantId);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const buffers: Buffer[] = [];

      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
      doc.on("error", reject);

      // Header
      doc.fontSize(20).text("Rooster AI - Staff Schedule", { align: "center" });
      doc.moveDown();

      // Roster details
      doc.fontSize(16).text(roster.name, { align: "center" });
      doc.fontSize(12);
      doc.text(
        `Period: ${format(roster.startDate, "MMM dd, yyyy")} - ${format(roster.endDate, "MMM dd, yyyy")}`
      );
      doc.text(`Status: ${roster.isPublished ? "Published" : "Draft"}`);
      doc.text(`Total Shifts: ${roster.shifts.length}`);
      doc.moveDown();

      // Group shifts by date
      const shiftsByDate = roster.shifts.reduce((acc: any, shift) => {
        const date = format(shift.startTime, "yyyy-MM-dd");
        if (!acc[date]) acc[date] = [];
        acc[date].push(shift);
        return acc;
      }, {});

      // Render shifts by date
      Object.keys(shiftsByDate)
        .sort()
        .forEach((date) => {
          doc.fontSize(14).text(format(new Date(date), "EEEE, MMM dd, yyyy"), {
            underline: true,
          });
          doc.moveDown(0.5);

          shiftsByDate[date].forEach((shift: any) => {
            const startTime = format(shift.startTime, "HH:mm");
            const endTime = format(shift.endTime, "HH:mm");
            const hours = (
              (shift.endTime.getTime() - shift.startTime.getTime()) /
              (1000 * 60 * 60)
            ).toFixed(1);

            doc.fontSize(10);
            doc.text(`${startTime} - ${endTime} (${hours}h)`, 70, doc.y, {
              width: 120,
            });
            doc.text(shift.staff.name, 200, doc.y, { width: 120 });
            doc.text(shift.position, 330, doc.y, { width: 100 });
            doc.text(shift.staff.department, 440, doc.y, { width: 100 });

            if (shift.notes) {
              doc.moveDown(0.3);
              doc
                .fontSize(8)
                .fillColor("gray")
                .text(`Notes: ${shift.notes}`, 70);
              doc.fillColor("black");
            }

            doc.moveDown(0.5);
          });

          doc.moveDown();
        });

      // Footer
      doc.fontSize(8).fillColor("gray");
      doc.text(
        `Generated on ${format(new Date(), "MMM dd, yyyy HH:mm")}`,
        50,
        doc.page.height - 50
      );
      doc.text("Rooster AI Staff Scheduling System", 0, doc.page.height - 50, {
        align: "right",
      });

      doc.end();
    });
  }

  async exportRosterToCSV(rosterId: string, tenantId: string): Promise<string> {
    const roster = await this.getRosterWithDetails(rosterId, tenantId);

    const csvRows = [
      "Staff Name,Position,Department,Date,Start Time,End Time,Hours,Notes",
    ];

    roster.shifts.forEach((shift) => {
      const hours =
        (shift.endTime.getTime() - shift.startTime.getTime()) /
        (1000 * 60 * 60);
      const row = [
        `"${shift.staff.name}"`,
        `"${shift.staff.position}"`,
        `"${shift.staff.department}"`,
        format(shift.startTime, "yyyy-MM-dd"),
        format(shift.startTime, "HH:mm"),
        format(shift.endTime, "HH:mm"),
        hours.toFixed(2),
        `"${shift.notes || ""}"`,
      ].join(",");

      csvRows.push(row);
    });

    return csvRows.join("\n");
  }

  async exportStaffListToExcel(tenantId: string): Promise<Buffer> {
    const staff = await prisma.staff.findMany({
      where: { tenantId, isActive: true },
      include: {
        availability: true,
        _count: {
          select: { shifts: true },
        },
      },
      orderBy: { name: "asc" },
    });

    const workbook = XLSX.utils.book_new();

    // Staff list data
    const staffData = [
      [
        "Name",
        "Email",
        "Phone",
        "Position",
        "Department",
        "Hourly Rate",
        "Start Date",
        "Total Shifts",
        "Status",
      ],
    ];

    staff.forEach((member) => {
      staffData.push([
        member.name,
        member.email,
        member.phone || "",
        member.position,
        member.department,
        member.hourlyRate?.toString() || "",
        format(member.startDate, "yyyy-MM-dd"),
        member._count.shifts.toString(), // Fix: Convert number to string
        member.isActive ? "Active" : "Inactive",
      ]);
    });

    const worksheet = XLSX.utils.aoa_to_sheet(staffData);
    worksheet["!cols"] = [
      { width: 20 },
      { width: 25 },
      { width: 15 },
      { width: 15 },
      { width: 15 },
      { width: 12 },
      { width: 12 },
      { width: 10 },
      { width: 10 },
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, "Staff List");

    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
    return buffer;
  }

  private async getRosterWithDetails(rosterId: string, tenantId: string) {
    const roster = await prisma.roster.findFirst({
      where: { id: rosterId, tenantId },
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
              },
            },
          },
          orderBy: { startTime: "asc" },
        },
      },
    });

    if (!roster) {
      throw new Error("Roster not found");
    }

    return roster;
  }
}
