"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Activity, getActivityById } from "@/lib/api/activities";
import { Report, getReports } from "@/lib/api/reports";
import { useUser } from "@/lib/contexts/user-context";
import { ArrowLeft, FileText, Users, DollarSign, Calendar, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ActivityReportPDFButton } from "@/components/pdf-report-button";

interface ActivityReportPageProps {
  params: {
    id: string;
  };
}

export default function ActivityReportPage({ params }: ActivityReportPageProps) {
  const router = useRouter();
  const { user } = useUser();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchActivityAndReports = async () => {
    try {
      setIsLoading(true);

      // Fetch activity details
      const activityData = await getActivityById(params.id);
      setActivity(activityData);

      // Fetch all reports for this activity
      let allReports: Report[] = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const response = await getReports(
          page,
          100,
          params.id, // activityId filter
          undefined,
          user?.role === "ISIBO_LEADER" && user?.isibo?.id ? user.isibo.id : undefined
        );

        allReports = [...allReports, ...response.items];
        hasMore = page < response.meta.totalPages;
        page++;
      }

      setReports(allReports);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to fetch activity report");
      }
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && params.id) {
      fetchActivityAndReports();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, params.id]);

  const calculateTotals = () => {
    return reports.reduce(
      (totals, report) => ({
        estimatedCost: totals.estimatedCost + (parseFloat(String(report.estimatedCost)) || 0),
        actualCost: totals.actualCost + (parseFloat(String(report.actualCost)) || 0),
        expectedParticipants: totals.expectedParticipants + (parseInt(String(report.expectedParticipants)) || 0),
        actualParticipants: totals.actualParticipants + (parseInt(String(report.actualParticipants)) || 0),
        expectedFinancialImpact: totals.expectedFinancialImpact + (parseFloat(String(report.expectedFinancialImpact)) || 0),
        actualFinancialImpact: totals.actualFinancialImpact + (parseFloat(String(report.actualFinancialImpact)) || 0),
      }),
      {
        estimatedCost: 0,
        actualCost: 0,
        expectedParticipants: 0,
        actualParticipants: 0,
        expectedFinancialImpact: 0,
        actualFinancialImpact: 0,
      }
    );
  };

  // Prepare data for PDF generation
  const preparePDFData = () => {
    if (!activity) return null;

    const totals = calculateTotals();

    return {
      activity,
      reports,
      totals,
      summary: {
        totalTasks: reports.length,
        completionRate: "100%", // All reports are for completed tasks
        totalCost: totals.actualCost,
        totalParticipants: totals.actualParticipants,
        totalImpact: totals.actualFinancialImpact
      }
    };
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Activity not found</p>
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard/reports")}
          className="mt-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Reports
        </Button>
      </div>
    );
  }

  const totals = calculateTotals();

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/reports")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Reports
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{activity.title}</h1>
            <p className="text-muted-foreground">Activity Report</p>
          </div>
        </div>
        <ActivityReportPDFButton
          data={preparePDFData()}
          title={`${activity.title} - Activity Report`}
          subtitle={`Detailed report for ${activity.title} activity`}
        />
      </div>

      {/* Activity Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Activity Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                <strong>Date:</strong> {format(new Date(activity.date), "PPP")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                <strong>Village:</strong> {activity.village?.name || "No village assigned"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                <strong>Tasks Completed:</strong> {reports.length}
              </span>
            </div>
          </div>
          <div>
            <p className="text-sm">
              <strong>Description:</strong> {activity.description}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Financial Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Financial Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h4 className="font-medium">Total Cost</h4>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Estimated:</span>
                  <span>{totals.estimatedCost.toLocaleString()} RWF</span>
                </div>
                <div className="flex justify-between text-sm font-medium">
                  <span>Actual:</span>
                  <span>{totals.actualCost.toLocaleString()} RWF</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Variance:</span>
                  <span className={totals.actualCost > totals.estimatedCost ? "text-red-600" : "text-green-600"}>
                    {(totals.actualCost - totals.estimatedCost).toLocaleString()} RWF
                  </span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Participants</h4>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Expected:</span>
                  <span>{totals.expectedParticipants}</span>
                </div>
                <div className="flex justify-between text-sm font-medium">
                  <span>Actual:</span>
                  <span>{totals.actualParticipants}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Variance:</span>
                  <span className={totals.actualParticipants > totals.expectedParticipants ? "text-green-600" : "text-red-600"}>
                    {totals.actualParticipants - totals.expectedParticipants}
                  </span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Financial Impact</h4>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Expected:</span>
                  <span>{totals.expectedFinancialImpact.toLocaleString()} RWF</span>
                </div>
                <div className="flex justify-between text-sm font-medium">
                  <span>Actual:</span>
                  <span>{totals.actualFinancialImpact.toLocaleString()} RWF</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Variance:</span>
                  <span className={totals.actualFinancialImpact > totals.expectedFinancialImpact ? "text-green-600" : "text-red-600"}>
                    {(totals.actualFinancialImpact - totals.expectedFinancialImpact).toLocaleString()} RWF
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Task Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Task Reports</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {reports.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No reports found for this activity
            </p>
          ) : (
            reports.map((report, index) => (
              <div key={report.id} className="space-y-4">
                {index > 0 && <Separator />}

                {/* Task Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{report.task.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <span>Isibo: {report.task.isibo?.names}</span>
                      <Badge variant="secondary">
                        COMPLETED
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    Submitted: {format(new Date(report.createdAt), "PPp")}
                  </div>
                </div>

                {/* Task Info */}
                <div>
                  <h4 className="font-medium mb-2">Task Information</h4>
                  <p className="text-sm text-muted-foreground">Task ID: {report.task.id}</p>
                </div>

                {/* Financial Data */}
                <div>
                  <h4 className="font-medium mb-3">Financial Data</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <div className="text-sm">
                        <div className="flex justify-between">
                          <span>Estimated Cost:</span>
                          <span>{(report.estimatedCost || 0).toLocaleString()} RWF</span>
                        </div>
                        <div className="flex justify-between font-medium">
                          <span>Actual Cost:</span>
                          <span>{(report.actualCost || 0).toLocaleString()} RWF</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm">
                        <div className="flex justify-between">
                          <span>Expected Participants:</span>
                          <span>{report.expectedParticipants || 0}</span>
                        </div>
                        <div className="flex justify-between font-medium">
                          <span>Actual Participants:</span>
                          <span>{report.actualParticipants || 0}</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm">
                        <div className="flex justify-between">
                          <span>Expected Impact:</span>
                          <span>{(report.expectedFinancialImpact || 0).toLocaleString()} RWF</span>
                        </div>
                        <div className="flex justify-between font-medium">
                          <span>Actual Impact:</span>
                          <span>{(report.actualFinancialImpact || 0).toLocaleString()} RWF</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Attendance */}
                {report.attendance && report.attendance.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Attendance ({report.attendance.length} people)</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {report.attendance.map((attendee) => (
                        <div key={attendee.id} className="text-sm p-2 bg-muted rounded">
                          {attendee.names}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Materials Used */}
                {report.materialsUsed && report.materialsUsed.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Materials Used</h4>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      {report.materialsUsed.map((material, idx) => (
                        <li key={idx}>{material}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Comments */}
                {report.comment && (
                  <div>
                    <h4 className="font-medium mb-2">Comments</h4>
                    <p className="text-sm text-muted-foreground">{report.comment}</p>
                  </div>
                )}

                {/* Challenges */}
                {report.challengesFaced && (
                  <div>
                    <h4 className="font-medium mb-2">Challenges Faced</h4>
                    <p className="text-sm text-muted-foreground">{report.challengesFaced}</p>
                  </div>
                )}

                {/* Suggestions */}
                {report.suggestions && (
                  <div>
                    <h4 className="font-medium mb-2">Suggestions</h4>
                    <p className="text-sm text-muted-foreground">{report.suggestions}</p>
                  </div>
                )}

                {/* Evidence Files */}
                {report.evidenceUrls && report.evidenceUrls.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Evidence Files ({report.evidenceUrls.length})</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {report.evidenceUrls.map((url, idx) => (
                        <div key={idx} className="p-2 border rounded">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline truncate"
                            >
                              File {idx + 1}
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
