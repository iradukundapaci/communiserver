"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WideDialog, WideDialogContent, WideDialogTrigger, WideDialogHeader, WideDialogTitle, WideDialogBody } from "@/components/ui/wide-dialog";
import { type Report } from "@/lib/api/reports";
import { formatCurrency, formatDate } from "@/lib/utils";
import { 
  IconEye, 
  IconCalendar, 
  IconMapPin, 
  IconUsers, 
  IconCurrencyDollar,
  IconFileText,
  IconDownload,
  IconExternalLink,
  IconTrendingUp,
  IconTrendingDown,
  IconMinus
} from "@tabler/icons-react";
import { useState } from "react";

interface ViewReportDialogProps {
  report: Report;
  trigger?: React.ReactNode;
  onDownload?: (report: Report) => void;
}

export function ViewReportDialog({ report, trigger, onDownload }: ViewReportDialogProps) {
  const [open, setOpen] = useState(false);

  const getCostVariance = () => {
    const variance = report.actualCost - report.estimatedCost;
    const percentage = report.estimatedCost > 0 ? (variance / report.estimatedCost) * 100 : 0;
    return { variance, percentage };
  };

  const getParticipationRate = () => {
    return report.expectedParticipants > 0 
      ? (report.actualParticipants / report.expectedParticipants) * 100 
      : 0;
  };

  const getImpactVariance = () => {
    const variance = report.actualFinancialImpact - report.expectedFinancialImpact;
    const percentage = report.expectedFinancialImpact > 0 
      ? (variance / report.expectedFinancialImpact) * 100 
      : 0;
    return { variance, percentage };
  };

  const getVarianceIcon = (percentage: number) => {
    if (percentage > 5) return <IconTrendingUp className="h-4 w-4 text-red-500" />;
    if (percentage < -5) return <IconTrendingDown className="h-4 w-4 text-green-500" />;
    return <IconMinus className="h-4 w-4 text-gray-500" />;
  };

  const getVarianceColor = (percentage: number) => {
    if (percentage > 10) return "text-red-600";
    if (percentage > 5) return "text-orange-600";
    if (percentage < -10) return "text-green-600";
    if (percentage < -5) return "text-blue-600";
    return "text-gray-600";
  };

  const costVariance = getCostVariance();
  const participationRate = getParticipationRate();
  const impactVariance = getImpactVariance();

  return (
    <WideDialog open={open} onOpenChange={setOpen}>
      <WideDialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <IconEye className="h-4 w-4 mr-2" />
            View Report
          </Button>
        )}
      </WideDialogTrigger>
      
      <WideDialogContent size="2xl">
        <WideDialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <WideDialogTitle>Task Report: {report.task.title}</WideDialogTitle>
              <div className="flex items-center space-x-4 text-sm text-gray-600 mt-2">
                <div className="flex items-center">
                  <IconCalendar className="h-4 w-4 mr-1" />
                  {formatDate(report.createdAt)}
                </div>
                <div className="flex items-center">
                  <IconUsers className="h-4 w-4 mr-1" />
                  {report.task.isibo.names}
                </div>
                <Badge variant="outline">
                  Activity: {report.activity.title}
                </Badge>
              </div>
            </div>
            
            {onDownload && (
              <Button variant="outline" onClick={() => onDownload(report)}>
                <IconDownload className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            )}
          </div>
        </WideDialogHeader>
        
        <WideDialogBody>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Financial Analysis */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <IconCurrencyDollar className="h-5 w-5 mr-2" />
                    Financial Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-lg font-bold text-blue-600">
                        {formatCurrency(report.estimatedCost)}
                      </div>
                      <div className="text-sm text-gray-600">Estimated Cost</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-lg font-bold text-green-600">
                        {formatCurrency(report.actualCost)}
                      </div>
                      <div className="text-sm text-gray-600">Actual Cost</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">Cost Variance:</span>
                    <div className="flex items-center space-x-2">
                      {getVarianceIcon(costVariance.percentage)}
                      <span className={`font-bold ${getVarianceColor(costVariance.percentage)}`}>
                        {formatCurrency(Math.abs(costVariance.variance))} 
                        ({costVariance.percentage > 0 ? "+" : ""}{costVariance.percentage.toFixed(1)}%)
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-lg font-bold text-purple-600">
                        {formatCurrency(report.expectedFinancialImpact)}
                      </div>
                      <div className="text-sm text-gray-600">Expected Impact</div>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <div className="text-lg font-bold text-orange-600">
                        {formatCurrency(report.actualFinancialImpact)}
                      </div>
                      <div className="text-sm text-gray-600">Actual Impact</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">Impact Variance:</span>
                    <div className="flex items-center space-x-2">
                      {getVarianceIcon(impactVariance.percentage)}
                      <span className={`font-bold ${getVarianceColor(impactVariance.percentage)}`}>
                        {formatCurrency(Math.abs(impactVariance.variance))} 
                        ({impactVariance.percentage > 0 ? "+" : ""}{impactVariance.percentage.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <IconUsers className="h-5 w-5 mr-2" />
                    Participation Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-lg font-bold text-blue-600">
                        {report.expectedParticipants}
                      </div>
                      <div className="text-sm text-gray-600">Expected</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-lg font-bold text-green-600">
                        {report.actualParticipants}
                      </div>
                      <div className="text-sm text-gray-600">Actual</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-lg font-bold text-purple-600">
                        {participationRate.toFixed(0)}%
                      </div>
                      <div className="text-sm text-gray-600">Rate</div>
                    </div>
                  </div>


                </CardContent>
              </Card>
            </div>

            {/* Right Column - Report Details */}
            <div className="space-y-6">
              {report.comment && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <IconFileText className="h-5 w-5 mr-2" />
                      Comments
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 whitespace-pre-wrap">{report.comment}</p>
                  </CardContent>
                </Card>
              )}

              {report.materialsUsed && report.materialsUsed.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Materials Used</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1">
                      {report.materialsUsed.map((material, index) => (
                        <li key={index} className="flex items-center">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                          {material}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {report.challengesFaced && (
                <Card>
                  <CardHeader>
                    <CardTitle>Challenges Faced</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 whitespace-pre-wrap">{report.challengesFaced}</p>
                  </CardContent>
                </Card>
              )}

              {report.suggestions && (
                <Card>
                  <CardHeader>
                    <CardTitle>Suggestions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 whitespace-pre-wrap">{report.suggestions}</p>
                  </CardContent>
                </Card>
              )}

              {report.evidenceUrls && report.evidenceUrls.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Evidence Files</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {report.evidenceUrls.map((url, index) => {
                        const filename = url.split('/').pop() || `file-${index + 1}`;
                        const originalFilename = filename.replace(/^\d+_[a-z0-9]+_/, '').replace(/_/g, ' ');
                        
                        return (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <span className="text-sm truncate">{originalFilename}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(url, '_blank')}
                            >
                              <IconExternalLink className="h-4 w-4" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {report.attendance && report.attendance.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Attendance ({report.attendance.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {report.attendance.map((attendee) => (
                        <div key={attendee.id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                            {attendee.names.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{attendee.names}</p>
                            <p className="text-xs text-gray-500">{attendee.user.email}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </WideDialogBody>
      </WideDialogContent>
    </WideDialog>
  );
}
