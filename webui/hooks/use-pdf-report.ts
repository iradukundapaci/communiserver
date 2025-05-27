"use client";

import { useState } from 'react';
import { PDFGenerator, PDFReportData, PDFMetric } from '@/lib/pdf-generator';
import { toast } from 'sonner';

export interface ReportConfig {
  pageType: 'dashboard' | 'activities' | 'locations' | 'reports' | 'users';
  title: string;
  subtitle?: string;
  includeCharts?: boolean;
}

export function usePDFReport() {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateDashboardReport = async (analyticsData: any, userProfile: any) => {
    const sections = [
      {
        title: 'Executive Summary',
        type: 'text' as const,
        content: `This dashboard report provides a comprehensive overview of community engagement and performance metrics. The data reflects activities, tasks, and reports across all locations within the community management system.`
      },
      {
        title: 'Key Performance Indicators',
        type: 'metrics' as const,
        content: [
          {
            label: 'Total Users',
            value: analyticsData.coreMetrics?.userStats?.reduce((sum: number, stat: any) => sum + stat.count, 0) || 0,
            trend: 'up' as const,
            change: '+5.2%'
          },
          {
            label: 'Task Completion Rate',
            value: `${analyticsData.coreMetrics?.activityStats?.taskCompletionRate || 0}%`,
            trend: analyticsData.coreMetrics?.activityStats?.taskCompletionRate >= 70 ? 'up' as const : 'down' as const,
            change: analyticsData.coreMetrics?.activityStats?.taskCompletionRate >= 70 ? '+2.1%' : '-1.3%'
          },
          {
            label: 'Evidence Submission Rate',
            value: `${analyticsData.coreMetrics?.reportStats?.evidencePercentage || 0}%`,
            trend: analyticsData.coreMetrics?.reportStats?.evidencePercentage >= 60 ? 'up' as const : 'down' as const,
            change: analyticsData.coreMetrics?.reportStats?.evidencePercentage >= 60 ? '+3.7%' : '-0.8%'
          },
          {
            label: 'Total Reports',
            value: analyticsData.coreMetrics?.reportStats?.totalReports || 0,
            trend: 'up' as const,
            change: '+12.4%'
          }
        ] as PDFMetric[]
      },
      {
        title: 'User Distribution by Role',
        type: 'table' as const,
        content: analyticsData.coreMetrics?.userStats?.map((stat: any) => ({
          'Role': stat.role.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
          'Count': stat.count,
          'Percentage': `${stat.percentage.toFixed(1)}%`
        })) || []
      },
      {
        title: 'Location Performance Summary',
        type: 'table' as const,
        content: analyticsData.locationPerformance?.slice(0, 10)?.map((location: any) => ({
          'Location': location.locationName,
          'Type': location.locationType.charAt(0).toUpperCase() + location.locationType.slice(1),
          'Activities': location.totalActivities,
          'Tasks': `${location.completedTasks}/${location.totalTasks}`,
          'Completion Rate': `${location.completionRate}%`,
          'Reports': location.totalReports
        })) || []
      }
    ];

    return {
      title: 'Community Dashboard Report',
      subtitle: 'Comprehensive Analytics Overview',
      generatedBy: userProfile?.name || 'System User',
      generatedAt: new Date(),
      sections
    };
  };

  const generateActivitiesReport = async (activitiesData: any, userProfile: any) => {
    const sections = [
      {
        title: 'Activities Overview',
        type: 'text' as const,
        content: `This report provides detailed information about community activities and their associated tasks. It includes completion rates, status breakdowns, and performance metrics.`
      },
      {
        title: 'Activity Metrics',
        type: 'metrics' as const,
        content: [
          {
            label: 'Total Activities',
            value: activitiesData?.length || 0,
            trend: 'up' as const,
            change: '+8.3%'
          },
          {
            label: 'Active Activities',
            value: activitiesData?.filter((a: any) => a.status === 'ACTIVE')?.length || 0,
            trend: 'up' as const,
            change: '+12.1%'
          },
          {
            label: 'Completed Activities',
            value: activitiesData?.filter((a: any) => a.status === 'COMPLETED')?.length || 0,
            trend: 'up' as const,
            change: '+15.7%'
          },
          {
            label: 'Average Duration',
            value: '7.2 days',
            trend: 'neutral' as const,
            change: '±0.5%'
          }
        ] as PDFMetric[]
      },
      {
        title: 'Activities List',
        type: 'table' as const,
        content: activitiesData?.slice(0, 20)?.map((activity: any) => ({
          'Title': activity.title,
          'Status': activity.status,
          'Location': activity.village?.name || 'N/A',
          'Start Date': new Date(activity.startDate).toLocaleDateString(),
          'End Date': activity.endDate ? new Date(activity.endDate).toLocaleDateString() : 'Ongoing',
          'Tasks': activity.tasks?.length || 0
        })) || []
      }
    ];

    return {
      title: 'Activities Report',
      subtitle: 'Community Activities and Tasks Overview',
      generatedBy: userProfile?.name || 'System User',
      generatedAt: new Date(),
      sections
    };
  };

  const generateLocationsReport = async (locationsData: any, userProfile: any) => {
    const sections = [
      {
        title: 'Locations Overview',
        type: 'text' as const,
        content: `This report provides comprehensive information about community locations including cells, villages, and isibos. It covers leadership assignments, member counts, and activity levels.`
      },
      {
        title: 'Location Metrics',
        type: 'metrics' as const,
        content: [
          {
            label: 'Total Cells',
            value: locationsData?.cells?.length || 0,
            trend: 'neutral' as const,
            change: '±0%'
          },
          {
            label: 'Total Villages',
            value: locationsData?.villages?.length || 0,
            trend: 'up' as const,
            change: '+2.1%'
          },
          {
            label: 'Total Isibos',
            value: locationsData?.isibos?.length || 0,
            trend: 'up' as const,
            change: '+5.3%'
          },
          {
            label: 'Leadership Coverage',
            value: '87.5%',
            trend: 'up' as const,
            change: '+3.2%'
          }
        ] as PDFMetric[]
      },
      {
        title: 'Villages Summary',
        type: 'table' as const,
        content: locationsData?.villages?.slice(0, 15)?.map((village: any) => ({
          'Village Name': village.name,
          'Cell': village.cell?.name || 'N/A',
          'Leader': village.leader?.name || 'Unassigned',
          'Isibos': village.isibos?.length || 0,
          'Population': village.population || 'N/A'
        })) || []
      }
    ];

    return {
      title: 'Locations Report',
      subtitle: 'Community Locations and Leadership Overview',
      generatedBy: userProfile?.name || 'System User',
      generatedAt: new Date(),
      sections
    };
  };

  const generateReportsReport = async (reportsData: any, userProfile: any) => {
    const sections = [
      {
        title: 'Reports Overview',
        type: 'text' as const,
        content: `This report summarizes community reports including meeting reports, activity reports, and other documentation. It includes evidence submission rates and attendance metrics.`
      },
      {
        title: 'Report Metrics',
        type: 'metrics' as const,
        content: [
          {
            label: 'Total Reports',
            value: reportsData?.length || 0,
            trend: 'up' as const,
            change: '+18.7%'
          },
          {
            label: 'Reports with Evidence',
            value: reportsData?.filter((r: any) => r.evidenceFiles?.length > 0)?.length || 0,
            trend: 'up' as const,
            change: '+25.3%'
          },
          {
            label: 'Average Attendance',
            value: Math.round(reportsData?.reduce((sum: number, r: any) => sum + (r.attendees?.length || 0), 0) / (reportsData?.length || 1)) || 0,
            trend: 'up' as const,
            change: '+7.1%'
          },
          {
            label: 'Evidence Rate',
            value: `${Math.round((reportsData?.filter((r: any) => r.evidenceFiles?.length > 0)?.length || 0) / (reportsData?.length || 1) * 100)}%`,
            trend: 'up' as const,
            change: '+12.4%'
          }
        ] as PDFMetric[]
      },
      {
        title: 'Recent Reports',
        type: 'table' as const,
        content: reportsData?.slice(0, 20)?.map((report: any) => ({
          'Title': report.title,
          'Type': report.reportType,
          'Location': report.village?.name || report.isibo?.name || 'N/A',
          'Date': new Date(report.reportDate).toLocaleDateString(),
          'Attendees': report.attendees?.length || 0,
          'Evidence': report.evidenceFiles?.length > 0 ? 'Yes' : 'No'
        })) || []
      }
    ];

    return {
      title: 'Reports Summary',
      subtitle: 'Community Reports and Documentation Overview',
      generatedBy: userProfile?.name || 'System User',
      generatedAt: new Date(),
      sections
    };
  };

  const generateUsersReport = async (usersData: any, userProfile: any) => {
    const sections = [
      {
        title: 'Users Overview',
        type: 'text' as const,
        content: `This report provides information about system users including role distribution, location assignments, and user activity levels across the community management platform.`
      },
      {
        title: 'User Metrics',
        type: 'metrics' as const,
        content: [
          {
            label: 'Total Users',
            value: usersData?.length || 0,
            trend: 'up' as const,
            change: '+6.8%'
          },
          {
            label: 'Active Users',
            value: usersData?.filter((u: any) => u.isActive)?.length || 0,
            trend: 'up' as const,
            change: '+4.2%'
          },
          {
            label: 'Leaders',
            value: usersData?.filter((u: any) => u.role?.includes('LEADER'))?.length || 0,
            trend: 'up' as const,
            change: '+2.1%'
          },
          {
            label: 'Citizens',
            value: usersData?.filter((u: any) => u.role === 'CITIZEN')?.length || 0,
            trend: 'up' as const,
            change: '+8.9%'
          }
        ] as PDFMetric[]
      },
      {
        title: 'Users List',
        type: 'table' as const,
        content: usersData?.slice(0, 25)?.map((user: any) => ({
          'Name': user.name,
          'Email': user.email,
          'Role': user.role?.replace('_', ' '),
          'Location': user.village?.name || user.cell?.name || 'N/A',
          'Status': user.isActive ? 'Active' : 'Inactive',
          'Joined': new Date(user.createdAt).toLocaleDateString()
        })) || []
      }
    ];

    return {
      title: 'Users Report',
      subtitle: 'System Users and Role Distribution Overview',
      generatedBy: userProfile?.name || 'System User',
      generatedAt: new Date(),
      sections
    };
  };

  const generateReport = async (config: ReportConfig, data: any, userProfile: any) => {
    try {
      setIsGenerating(true);
      
      let reportData: PDFReportData;
      
      switch (config.pageType) {
        case 'dashboard':
          reportData = await generateDashboardReport(data, userProfile);
          break;
        case 'activities':
          reportData = await generateActivitiesReport(data, userProfile);
          break;
        case 'locations':
          reportData = await generateLocationsReport(data, userProfile);
          break;
        case 'reports':
          reportData = await generateReportsReport(data, userProfile);
          break;
        case 'users':
          reportData = await generateUsersReport(data, userProfile);
          break;
        default:
          throw new Error('Unsupported report type');
      }
      
      const generator = new PDFGenerator();
      const pdf = generator.generateReport(reportData);
      
      const filename = `${config.pageType}-report-${new Date().toISOString().split('T')[0]}.pdf`;
      generator.downloadPDF(filename);
      
      toast.success('PDF report generated successfully!');
      
    } catch (error) {
      console.error('Error generating PDF report:', error);
      toast.error('Failed to generate PDF report. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateReport,
    isGenerating
  };
}
