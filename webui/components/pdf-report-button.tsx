"use client";

import * as React from "react";
import { IconDownload, IconFileTypePdf, IconLoader2 } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePDFReport, ReportConfig } from "@/hooks/use-pdf-report";
import { useUser } from "@/lib/contexts/user-context";

interface PDFReportButtonProps {
  pageType: ReportConfig['pageType'];
  data: unknown;
  title?: string;
  subtitle?: string;
  variant?: "default" | "outline" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  showDropdown?: boolean;
}

export function PDFReportButton({
  pageType,
  data,
  title,
  subtitle,
  variant = "outline",
  size = "default",
  className,
  showDropdown = false
}: PDFReportButtonProps) {
  const { generateReport, isGenerating } = usePDFReport();
  const { user } = useUser();

  const handleGenerateReport = async (includeCharts: boolean = false) => {
    const config: ReportConfig = {
      pageType,
      title: title || `${pageType.charAt(0).toUpperCase() + pageType.slice(1)} Report`,
      subtitle,
      includeCharts
    };

    await generateReport(config, data, user);
  };

  const getPageDisplayName = (type: string) => {
    switch (type) {
      case 'dashboard':
        return 'Dashboard Analytics';
      case 'activities':
        return 'Activities & Tasks';
      case 'locations':
        return 'Locations & Leadership';
      case 'reports':
        return 'Community Reports';
      case 'users':
        return 'Users & Roles';
      case 'activity-report':
        return 'Activity Report';
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  if (showDropdown) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={variant}
            size={size}
            className={className}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <IconLoader2 className="h-4 w-4 animate-spin" />
            ) : (
              <IconFileTypePdf className="h-4 w-4" />
            )}
            {size !== "icon" && (
              <span className="ml-2">
                {isGenerating ? "Generating..." : "Export PDF"}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Export Options</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => handleGenerateReport(false)}
            disabled={isGenerating}
          >
            <IconFileTypePdf className="h-4 w-4 mr-2" />
            Standard Report
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleGenerateReport(true)}
            disabled={isGenerating}
          >
            <IconFileTypePdf className="h-4 w-4 mr-2" />
            Report with Charts
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={() => handleGenerateReport(false)}
      disabled={isGenerating}
    >
      {isGenerating ? (
        <IconLoader2 className="h-4 w-4 animate-spin" />
      ) : (
        <IconDownload className="h-4 w-4" />
      )}
      {size !== "icon" && (
        <span className="ml-2">
          {isGenerating ? "Generating..." : `Export ${getPageDisplayName(pageType)}`}
        </span>
      )}
    </Button>
  );
}

// Specialized components for each page type
export function DashboardPDFButton({ data, className }: { data: unknown; className?: string }) {
  return (
    <PDFReportButton
      pageType="dashboard"
      data={data}
      title="Community Dashboard Report"
      subtitle="Comprehensive Analytics Overview"
      className={className}
      showDropdown={true}
    />
  );
}

export function ActivitiesPDFButton({ data, className }: { data: unknown; className?: string }) {
  return (
    <PDFReportButton
      pageType="activities"
      data={data}
      title="Activities Report"
      subtitle="Community Activities and Tasks Overview"
      className={className}
    />
  );
}

export function LocationsPDFButton({ data, className }: { data: unknown; className?: string }) {
  return (
    <PDFReportButton
      pageType="locations"
      data={data}
      title="Locations Report"
      subtitle="Community Locations and Leadership Overview"
      className={className}
    />
  );
}

export function ReportsPDFButton({ data, className }: { data: unknown; className?: string }) {
  return (
    <PDFReportButton
      pageType="reports"
      data={data}
      title="Reports Summary"
      subtitle="Community Reports and Documentation Overview"
      className={className}
    />
  );
}

export function UsersPDFButton({ data, className }: { data: unknown; className?: string }) {
  return (
    <PDFReportButton
      pageType="users"
      data={data}
      title="Users Report"
      subtitle="System Users and Role Distribution Overview"
      className={className}
    />
  );
}

export function ActivityReportPDFButton({
  data,
  title,
  subtitle,
  className
}: {
  data: unknown;
  title?: string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <PDFReportButton
      pageType={"activity-report" as any}
      data={data}
      title={title || "Activity Report"}
      subtitle={subtitle || "Detailed Activity Report"}
      className={className}
      variant="default"
    />
  );
}
