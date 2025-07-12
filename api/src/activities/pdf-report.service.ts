import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import { Report } from './entities/report.entity';

export interface ReportSummaryData {
  title: string;
  subtitle?: string;
  generatedAt: Date;
  generatedBy: string;
  filters: {
    dateFrom?: string;
    dateTo?: string;
    activityId?: string;
    isiboId?: string;
    hasEvidence?: boolean;
    [key: string]: any;
  };
  summary: {
    totalReports: number;
    totalActivities: number;
    totalIsibos: number;
    totalCost: number;
    totalParticipants: number;
    averageAttendance: number;
    reportsWithEvidence: number;
    reportsWithChallenges: number;
    reportsWithSuggestions: number;
  };
  reports: Report[];
  includeStats: boolean;
  includeReportDetails: boolean;
}

@Injectable()
export class PdfReportService {
  async generateReportSummaryPDF(data: ReportSummaryData): Promise<Buffer> {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
      const page = await browser.newPage();
      
      const html = this.generateHTML(data);
      await page.setContent(html, { waitUntil: 'networkidle0' });
      
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm'
        }
      });

      return Buffer.from(pdfBuffer);
    } finally {
      await browser.close();
    }
  }

  private generateHTML(data: ReportSummaryData): string {
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('en-RW', {
        style: 'currency',
        currency: 'RWF'
      }).format(amount);
    };

    const formatDate = (date: string | Date) => {
      return new Date(date).toLocaleDateString('en-RW', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    const formatPercentage = (value: number, total: number) => {
      return total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
    };

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${data.title}</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
        }
        
        .header {
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          color: white;
          padding: 30px;
          text-align: center;
          margin-bottom: 30px;
        }
        
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: bold;
        }
        
        .header h2 {
          margin: 10px 0 0 0;
          font-size: 16px;
          font-weight: normal;
          opacity: 0.9;
        }
        
        .meta-info {
          background: #f8fafc;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 30px;
          border-left: 4px solid #3b82f6;
        }
        
        .meta-info p {
          margin: 5px 0;
          font-size: 14px;
        }
        
        .filters-section {
          background: #fff;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 30px;
          border: 1px solid #e2e8f0;
        }
        
        .filters-section h3 {
          margin-top: 0;
          color: #1e293b;
          border-bottom: 2px solid #e2e8f0;
          padding-bottom: 10px;
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-bottom: 30px;
        }
        
        .stat-card {
          background: white;
          padding: 20px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          text-align: center;
        }
        
        .stat-card h4 {
          margin: 0 0 10px 0;
          color: #64748b;
          font-size: 14px;
          font-weight: normal;
        }
        
        .stat-card .value {
          font-size: 24px;
          font-weight: bold;
          color: #1e293b;
          margin-bottom: 5px;
        }
        
        .stat-card .percentage {
          font-size: 12px;
          color: #64748b;
        }
        
        .reports-section {
          background: white;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          overflow: hidden;
        }
        
        .reports-section h3 {
          margin: 0;
          padding: 20px;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          color: #1e293b;
        }
        
        .report-item {
          padding: 20px;
          border-bottom: 1px solid #f1f5f9;
        }
        
        .report-item:last-child {
          border-bottom: none;
        }
        
        .report-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 15px;
        }
        
        .report-title {
          font-weight: bold;
          color: #1e293b;
          font-size: 16px;
        }
        
        .report-date {
          color: #64748b;
          font-size: 14px;
        }
        
        .report-details {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
          margin-bottom: 15px;
        }
        
        .detail-item {
          font-size: 14px;
        }
        
        .detail-label {
          color: #64748b;
          font-weight: 500;
        }
        
        .detail-value {
          color: #1e293b;
          margin-left: 5px;
        }
        
        .report-comment {
          background: #f8fafc;
          padding: 15px;
          border-radius: 6px;
          border-left: 3px solid #3b82f6;
          font-size: 14px;
          color: #475569;
          margin-top: 15px;
        }
        
        .footer {
          margin-top: 40px;
          padding: 20px;
          text-align: center;
          color: #64748b;
          font-size: 12px;
          border-top: 1px solid #e2e8f0;
        }
        
        @media print {
          .report-item {
            page-break-inside: avoid;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${data.title}</h1>
        ${data.subtitle ? `<h2>${data.subtitle}</h2>` : ''}
      </div>
      
      <div class="meta-info">
        <p><strong>Generated on:</strong> ${formatDate(data.generatedAt)} at ${data.generatedAt.toLocaleTimeString()}</p>
        <p><strong>Generated by:</strong> ${data.generatedBy}</p>
        <p><strong>Total Reports:</strong> ${data.summary.totalReports}</p>
      </div>
      
      ${this.generateFiltersSection(data.filters)}
      
      ${data.includeStats ? this.generateStatsSection(data.summary, formatCurrency, formatPercentage) : ''}
      
      ${data.includeReportDetails ? this.generateReportsSection(data.reports, formatDate, formatCurrency) : ''}
      
      <div class="footer">
        <p>Community Management System - Report Summary</p>
        <p>Generated automatically on ${formatDate(data.generatedAt)}</p>
      </div>
    </body>
    </html>
    `;
  }

  private generateFiltersSection(filters: any): string {
    const activeFilters = Object.entries(filters)
      .filter(([key, value]) => value !== undefined && value !== null && value !== '' && value !== 'all_activities' && value !== 'all_isibos')
      .map(([key, value]) => {
        const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        return `<p><span class="detail-label">${label}:</span><span class="detail-value">${value}</span></p>`;
      })
      .join('');

    if (!activeFilters) {
      return `
        <div class="filters-section">
          <h3>Applied Filters</h3>
          <p>No specific filters applied - showing all reports</p>
        </div>
      `;
    }

    return `
      <div class="filters-section">
        <h3>Applied Filters</h3>
        ${activeFilters}
      </div>
    `;
  }

  private generateStatsSection(summary: any, formatCurrency: Function, formatPercentage: Function): string {
    return `
      <div class="stats-grid">
        <div class="stat-card">
          <h4>Total Reports</h4>
          <div class="value">${summary.totalReports}</div>
        </div>
        
        <div class="stat-card">
          <h4>Total Activities</h4>
          <div class="value">${summary.totalActivities}</div>
        </div>
        
        <div class="stat-card">
          <h4>Total Isibos</h4>
          <div class="value">${summary.totalIsibos}</div>
        </div>
        
        <div class="stat-card">
          <h4>Total Cost</h4>
          <div class="value">${formatCurrency(summary.totalCost)}</div>
        </div>
        
        <div class="stat-card">
          <h4>Total Participants</h4>
          <div class="value">${summary.totalParticipants}</div>
        </div>
        
        <div class="stat-card">
          <h4>Average Attendance</h4>
          <div class="value">${summary.averageAttendance.toFixed(1)}</div>
        </div>
        
        <div class="stat-card">
          <h4>Reports with Evidence</h4>
          <div class="value">${summary.reportsWithEvidence}</div>
          <div class="percentage">${formatPercentage(summary.reportsWithEvidence, summary.totalReports)}%</div>
        </div>
        
        <div class="stat-card">
          <h4>Reports with Challenges</h4>
          <div class="value">${summary.reportsWithChallenges}</div>
          <div class="percentage">${formatPercentage(summary.reportsWithChallenges, summary.totalReports)}%</div>
        </div>
        
        <div class="stat-card">
          <h4>Reports with Suggestions</h4>
          <div class="value">${summary.reportsWithSuggestions}</div>
          <div class="percentage">${formatPercentage(summary.reportsWithSuggestions, summary.totalReports)}%</div>
        </div>
      </div>
    `;
  }

  private generateReportsSection(reports: Report[], formatDate: Function, formatCurrency: Function): string {
    if (!reports || reports.length === 0) {
      return `
        <div class="reports-section">
          <h3>Report Details</h3>
          <div style="padding: 20px; text-align: center; color: #64748b;">
            No reports found matching the specified criteria.
          </div>
        </div>
      `;
    }

    const reportItems = reports.map(report => `
      <div class="report-item">
        <div class="report-header">
          <div class="report-title">${report.activity?.title || 'Unknown Activity'}</div>
          <div class="report-date">${formatDate(report.activity?.date || report.createdAt)}</div>
        </div>
        
        <div class="report-details">
          <div class="detail-item">
            <span class="detail-label">Task:</span>
            <span class="detail-value">${report.task?.title || 'Unknown Task'}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Isibo:</span>
            <span class="detail-value">${report.task?.isibo?.name || 'Unknown Isibo'}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Village:</span>
            <span class="detail-value">${report.activity?.village?.name || 'Unknown Village'}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Participants:</span>
            <span class="detail-value">${report.task?.actualParticipants || 0} / ${report.task?.expectedParticipants || 0}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Actual Cost:</span>
            <span class="detail-value">${formatCurrency(report.task?.actualCost || 0)}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Evidence:</span>
            <span class="detail-value">${report.evidenceUrls && report.evidenceUrls.length > 0 ? 'Yes' : 'No'}</span>
          </div>
        </div>
        
        ${report.comment ? `
          <div class="report-comment">
            <strong>Comment:</strong> ${report.comment}
          </div>
        ` : ''}
        
        ${report.challengesFaced ? `
          <div class="report-comment">
            <strong>Challenges:</strong> ${report.challengesFaced}
          </div>
        ` : ''}
        
        ${report.suggestions ? `
          <div class="report-comment">
            <strong>Suggestions:</strong> ${report.suggestions}
          </div>
        ` : ''}
      </div>
    `).join('');

    return `
      <div class="reports-section">
        <h3>Report Details (${reports.length} reports)</h3>
        ${reportItems}
      </div>
    `;
  }
}
