import { Request, Response } from 'express';
import { ExportService } from '../services/export.service';
import { ApiResponse } from '@rooster-ai/shared';

const exportService = new ExportService();

export const exportRoster = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { format } = req.query;
    const companyId = req.user!.companyId;

    let buffer: Buffer | string;
    let contentType: string;
    let filename: string;

    switch (format) {
      case 'excel':
        buffer = await exportService.exportRosterToExcel(id, companyId);
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        filename = `roster-${id}.xlsx`;
        break;
      case 'pdf':
        buffer = await exportService.exportRosterToPDF(id, companyId);
        contentType = 'application/pdf';
        filename = `roster-${id}.pdf`;
        break;
      case 'csv':
        buffer = await exportService.exportRosterToCSV(id, companyId);
        contentType = 'text/csv';
        filename = `roster-${id}.csv`;
        break;
      default:
        const response: ApiResponse = {
          success: false,
          error: 'Invalid export format. Supported formats: excel, pdf, csv'
        };
        res.status(400).json(response);
        return;
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Export failed'
    };

    res.status(400).json(response);
  }
};

export const exportStaffList = async (req: Request, res: Response): Promise<void> => {
  try {
    const companyId = req.user!.companyId;

    const buffer = await exportService.exportStaffListToExcel(companyId);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="staff-list.xlsx"');
    res.send(buffer);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: 'Failed to export staff list'
    };

    res.status(500).json(response);
  }
};
