import jsPDF from 'jspdf';

export interface PDFReportData {
  title: string;
  subtitle?: string;
  generatedBy: string;
  generatedAt: Date;
  sections: PDFSection[];
}

export interface PDFSection {
  title: string;
  type: 'text' | 'table' | 'metrics' | 'chart';
  content: unknown;
}

export interface PDFMetric {
  label: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export class PDFGenerator {
  private doc: jsPDF;
  private currentY: number = 20;
  private pageHeight: number = 297; // A4 height in mm
  private margin: number = 20;

  constructor() {
    this.doc = new jsPDF();
  }

  private addHeader(title: string, subtitle?: string) {
    // Add logo/header area
    this.doc.setFillColor(59, 130, 246); // Blue background
    this.doc.rect(0, 0, 210, 30, 'F');

    // Title
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(20);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(title, this.margin, 20);

    if (subtitle) {
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(subtitle, this.margin, 26);
    }

    this.currentY = 40;
  }

  private addFooter(generatedBy: string, generatedAt: Date) {
    const pageCount = this.doc.internal.getNumberOfPages();

    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);

      // Footer line
      this.doc.setDrawColor(200, 200, 200);
      this.doc.line(this.margin, this.pageHeight - 15, 210 - this.margin, this.pageHeight - 15);

      // Footer text
      this.doc.setTextColor(100, 100, 100);
      this.doc.setFontSize(8);
      this.doc.setFont('helvetica', 'normal');

      const footerText = `Generated by ${generatedBy} on ${generatedAt.toLocaleDateString()} at ${generatedAt.toLocaleTimeString()}`;
      this.doc.text(footerText, this.margin, this.pageHeight - 8);

      // Page number
      this.doc.text(`Page ${i} of ${pageCount}`, 210 - this.margin - 20, this.pageHeight - 8);
    }
  }

  private checkPageBreak(requiredHeight: number = 20) {
    if (this.currentY + requiredHeight > this.pageHeight - 30) {
      this.doc.addPage();
      this.currentY = 20;
    }
  }

  private addSectionTitle(title: string) {
    this.checkPageBreak(15);

    this.doc.setTextColor(0, 0, 0);
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(title, this.margin, this.currentY);

    // Underline
    const textWidth = this.doc.getTextWidth(title);
    this.doc.setDrawColor(59, 130, 246);
    this.doc.line(this.margin, this.currentY + 2, this.margin + textWidth, this.currentY + 2);

    this.currentY += 15;
  }

  private addTextSection(content: string) {
    this.checkPageBreak(20);

    this.doc.setTextColor(60, 60, 60);
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');

    const lines = this.doc.splitTextToSize(content, 170);
    this.doc.text(lines, this.margin, this.currentY);

    this.currentY += lines.length * 5 + 10;
  }

  private addMetricsSection(metrics: PDFMetric[]) {
    this.checkPageBreak(60);

    const cols = 2;
    const rows = Math.ceil(metrics.length / cols);
    const boxWidth = 80;
    const boxHeight = 25;
    const spacing = 10;

    for (let i = 0; i < metrics.length; i++) {
      const metric = metrics[i];
      const col = i % cols;
      const row = Math.floor(i / cols);

      const x = this.margin + col * (boxWidth + spacing);
      const y = this.currentY + row * (boxHeight + spacing);

      // Box background
      this.doc.setFillColor(248, 250, 252);
      this.doc.setDrawColor(226, 232, 240);
      this.doc.rect(x, y, boxWidth, boxHeight, 'FD');

      // Metric label
      this.doc.setTextColor(100, 100, 100);
      this.doc.setFontSize(9);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(metric.label, x + 5, y + 8);

      // Metric value
      this.doc.setTextColor(0, 0, 0);
      this.doc.setFontSize(16);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(metric.value.toString(), x + 5, y + 18);

      // Trend indicator
      if (metric.change && metric.trend) {
        const trendColor = metric.trend === 'up' ? [34, 197, 94] :
                          metric.trend === 'down' ? [239, 68, 68] : [156, 163, 175];
        this.doc.setTextColor(trendColor[0], trendColor[1], trendColor[2]);
        this.doc.setFontSize(8);
        this.doc.text(metric.change, x + boxWidth - 25, y + 18);
      }
    }

    this.currentY += rows * (boxHeight + spacing) + 10;
  }

  private addTableSection(data: unknown) {
    if (!Array.isArray(data) || data.length === 0) return;

    this.checkPageBreak(40);

    const headers = Object.keys(data[0] as Record<string, unknown>);
    const rows = data.map((item: unknown) =>
      headers.map(header => {
        const record = item as Record<string, unknown>;
        return record[header]?.toString() || '';
      })
    );

    // Use simple text-based table
    this.addSimpleTable(headers, rows);

    this.currentY += 10;
  }

  private addSimpleTable(headers: string[], rows: string[][]) {
    // Calculate column width
    const availableWidth = 210 - (this.margin * 2); // A4 width minus margins
    const columnWidth = availableWidth / headers.length;

    // Add header background
    this.doc.setFillColor(59, 130, 246);
    this.doc.rect(this.margin, this.currentY - 5, availableWidth, 12, 'F');

    // Add headers
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');

    headers.forEach((header, index) => {
      const x = this.margin + (index * columnWidth) + 2;
      this.doc.text(header, x, this.currentY + 2);
    });

    this.currentY += 15;

    // Add rows
    this.doc.setTextColor(0, 0, 0);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(9);

    rows.forEach((row, rowIndex) => {
      this.checkPageBreak(10);

      // Alternate row background
      if (rowIndex % 2 === 1) {
        this.doc.setFillColor(248, 250, 252);
        this.doc.rect(this.margin, this.currentY - 3, availableWidth, 8, 'F');
      }

      row.forEach((cell, index) => {
        const x = this.margin + (index * columnWidth) + 2;
        // Truncate long text to fit in column
        const maxLength = Math.floor(columnWidth / 2.5); // Approximate character width
        const truncatedCell = cell.length > maxLength ? cell.substring(0, maxLength - 3) + '...' : cell;
        this.doc.text(truncatedCell, x, this.currentY);
      });
      this.currentY += 8;
    });

    // Add border
    this.doc.setDrawColor(200, 200, 200);
    this.doc.rect(this.margin, this.currentY - (rows.length * 8) - 15, availableWidth, (rows.length * 8) + 15);
  }

  public generateReport(reportData: PDFReportData): jsPDF {
    // Add header
    this.addHeader(reportData.title, reportData.subtitle);

    // Add generation info
    this.doc.setTextColor(100, 100, 100);
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(`Generated on ${reportData.generatedAt.toLocaleDateString()} at ${reportData.generatedAt.toLocaleTimeString()}`, this.margin, this.currentY);
    this.currentY += 15;

    // Add sections
    for (const section of reportData.sections) {
      this.addSectionTitle(section.title);

      switch (section.type) {
        case 'text':
          this.addTextSection(section.content as string);
          break;
        case 'metrics':
          this.addMetricsSection(section.content as PDFMetric[]);
          break;
        case 'table':
          this.addTableSection(section.content);
          break;
        default:
          break;
      }
    }

    // Add footer
    this.addFooter(reportData.generatedBy, reportData.generatedAt);

    return this.doc;
  }

  public downloadPDF(filename: string) {
    this.doc.save(filename);
  }
}
