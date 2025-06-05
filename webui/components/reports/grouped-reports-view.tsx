"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { type Report } from "@/lib/api/reports";
import { formatCurrency, formatDate } from "@/lib/utils";
import { 
  IconChevronDown, 
  IconChevronRight, 
  IconCalendar, 
  IconMapPin, 
  IconUsers, 
  IconCurrencyDollar,
  IconFileText,
  IconDownload,
  IconEye
} from "@tabler/icons-react";
import { useState } from "react";

interface GroupedReport {
  activity: {
    id: string;
    title: string;
    description: string;
    date: Date;
    village?: {
      id: string;
      name: string;
      cell?: {
        name: string;
        sector?: {
          name: string;
        };
      };
    };
  };
  reports: Report[];
  summary: {
    totalTasks: number;
    completedTasks: number;
    totalEstimatedCost: number;
    totalActualCost: number;
    totalExpectedParticipants: number;
    totalActualParticipants: number;
    totalExpectedFinancialImpact: number;
    totalActualFinancialImpact: number;
  };
}

interface GroupedReportsViewProps {
  groupedReports: GroupedReport[];
  onViewReport: (report: Report) => void;
  onDownloadReport?: (report: Report) => void;
  className?: string;
}

export function GroupedReportsView({ 
  groupedReports, 
  onViewReport, 
  onDownloadReport,
  className = "" 
}: GroupedReportsViewProps) {
  const [expandedActivities, setExpandedActivities] = useState<Set<string>>(new Set());

  const toggleActivity = (activityId: string) => {
    const newExpanded = new Set(expandedActivities);
    if (newExpanded.has(activityId)) {
      newExpanded.delete(activityId);
    } else {
      newExpanded.add(activityId);
    }
    setExpandedActivities(newExpanded);
  };

  const getCompletionPercentage = (completed: number, total: number) => {
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const getCostVariancePercentage = (actual: number, estimated: number) => {
    if (estimated === 0) return 0;
    return Math.round(((actual - estimated) / estimated) * 100);
  };

  const getParticipationRate = (actual: number, expected: number) => {
    return expected > 0 ? Math.round((actual / expected) * 100) : 0;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {groupedReports.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <IconFileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">No reports found</p>
          </CardContent>
        </Card>
      ) : (
        groupedReports.map((group) => {
          const isExpanded = expandedActivities.has(group.activity.id);
          const completionPercentage = getCompletionPercentage(
            group.summary.completedTasks, 
            group.summary.totalTasks
          );
          const costVariance = getCostVariancePercentage(
            group.summary.totalActualCost,
            group.summary.totalEstimatedCost
          );
          const participationRate = getParticipationRate(
            group.summary.totalActualParticipants,
            group.summary.totalExpectedParticipants
          );

          return (
            <Card key={group.activity.id} className="overflow-hidden">
              <Collapsible open={isExpanded} onOpenChange={() => toggleActivity(group.activity.id)}>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {isExpanded ? (
                          <IconChevronDown className="h-5 w-5 text-gray-500" />
                        ) : (
                          <IconChevronRight className="h-5 w-5 text-gray-500" />
                        )}
                        <div>
                          <CardTitle className="text-lg">{group.activity.title}</CardTitle>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                            <div className="flex items-center">
                              <IconCalendar className="h-4 w-4 mr-1" />
                              {formatDate(group.activity.date)}
                            </div>
                            {group.activity.village && (
                              <div className="flex items-center">
                                <IconMapPin className="h-4 w-4 mr-1" />
                                {group.activity.village.name}
                                {group.activity.village.cell && (
                                  <span className="text-gray-500">
                                    , {group.activity.village.cell.name}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {group.summary.completedTasks}/{group.summary.totalTasks} Tasks
                          </div>
                          <Progress value={completionPercentage} className="w-20 h-2" />
                        </div>
                        
                        <div className="text-right">
                          <div className="text-sm font-medium">Cost Variance</div>
                          <Badge 
                            variant={costVariance > 10 ? "destructive" : costVariance < -10 ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {costVariance > 0 ? "+" : ""}{costVariance}%
                          </Badge>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-sm font-medium">Participation</div>
                          <Badge 
                            variant={participationRate >= 80 ? "default" : participationRate >= 60 ? "secondary" : "destructive"}
                            className="text-xs"
                          >
                            {participationRate}%
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    {/* Activity Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {formatCurrency(group.summary.totalActualCost)}
                        </div>
                        <div className="text-sm text-gray-600">Total Actual Cost</div>
                        <div className="text-xs text-gray-500">
                          Est: {formatCurrency(group.summary.totalEstimatedCost)}
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {group.summary.totalActualParticipants}
                        </div>
                        <div className="text-sm text-gray-600">Total Participants</div>
                        <div className="text-xs text-gray-500">
                          Expected: {group.summary.totalExpectedParticipants}
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {formatCurrency(group.summary.totalActualFinancialImpact)}
                        </div>
                        <div className="text-sm text-gray-600">Financial Impact</div>
                        <div className="text-xs text-gray-500">
                          Expected: {formatCurrency(group.summary.totalExpectedFinancialImpact)}
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {group.summary.completedTasks}
                        </div>
                        <div className="text-sm text-gray-600">Completed Tasks</div>
                        <div className="text-xs text-gray-500">
                          of {group.summary.totalTasks} total
                        </div>
                      </div>
                    </div>

                    {/* Task Reports */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900">Task Reports</h4>
                      {group.reports.map((report) => (
                        <div 
                          key={report.id} 
                          className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3">
                                <h5 className="font-medium">{report.task.title}</h5>
                                <Badge variant="outline">
                                  {report.task.isibo.names}
                                </Badge>
                              </div>
                              
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
                                <div>
                                  <span className="text-gray-600">Cost:</span>
                                  <div className="font-medium">
                                    {formatCurrency(report.actualCost)}
                                    <span className="text-gray-500 text-xs ml-1">
                                      (Est: {formatCurrency(report.estimatedCost)})
                                    </span>
                                  </div>
                                </div>
                                
                                <div>
                                  <span className="text-gray-600">Participants:</span>
                                  <div className="font-medium">
                                    {report.actualParticipants}
                                    <span className="text-gray-500 text-xs ml-1">
                                      (Expected: {report.expectedParticipants})
                                    </span>
                                  </div>
                                </div>
                                

                                
                                <div>
                                  <span className="text-gray-600">Impact:</span>
                                  <div className="font-medium">
                                    {formatCurrency(report.actualFinancialImpact)}
                                  </div>
                                </div>
                              </div>
                              
                              {report.comment && (
                                <div className="mt-2 text-sm text-gray-600">
                                  <span className="font-medium">Comment:</span> {report.comment}
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-center space-x-2 ml-4">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onViewReport(report)}
                              >
                                <IconEye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                              
                              {onDownloadReport && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => onDownloadReport(report)}
                                >
                                  <IconDownload className="h-4 w-4 mr-1" />
                                  Export
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          );
        })
      )}
    </div>
  );
}
