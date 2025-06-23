"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getActivityReport, ActivityReportData } from "@/lib/api/activities";
import { useUser } from "@/lib/contexts/user-context";
import { ArrowLeft, FileText, Users, DollarSign, Calendar, MapPin, TrendingUp, AlertTriangle, CheckCircle, Target } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, use } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ActivityReportPDFButton } from "@/components/pdf-report-button";
import { StickySummaryBar } from "@/components/reports/sticky-summary-bar";
import { EnhancedFinancialSummary } from "@/components/reports/enhanced-financial-summary";
import { TaskPerformanceGrid } from "@/components/reports/task-performance-grid";
import { EvidenceGallery } from "@/components/reports/evidence-gallery";

interface ActivityReportPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ActivityReportPage({ params }: ActivityReportPageProps) {
  const router = useRouter();
  const { user } = useUser();
  const [reportData, setReportData] = useState<ActivityReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Unwrap params using React.use()
  const { id } = use(params);

  const fetchActivityReport = async () => {
    try {
      setIsLoading(true);
      const data = await getActivityReport(id);
      setReportData(data);
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
    if (user && id) {
      fetchActivityReport();
    }
  }, [user, id]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Activity report not found</p>
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

  const { activity, summary, financialAnalysis, participantAnalysis, evidenceSummary, insights, taskPerformance } = reportData;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Sticky Summary Bar */}
      <StickySummaryBar summary={summary} insights={insights} />

      {/* Main Content */}
      <div className="flex-1 p-6 space-y-6">
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
              <p className="text-muted-foreground">Enhanced Activity Report</p>
            </div>
          </div>
          <ActivityReportPDFButton
            data={reportData}
            title={`${activity.title} - Enhanced Activity Report`}
            subtitle={`Comprehensive analysis and insights for ${activity.title}`}
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
                  <strong>Tasks:</strong> {summary.totalTasks} total, {summary.completedTasks} completed
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

        {/* Insights & Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Insights & Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Key Strengths */}
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Key Strengths
                </h4>
                <div className="space-y-2">
                  {insights.keyStrengths.length > 0 ? (
                    insights.keyStrengths.map((strength, index) => (
                      <div key={index} className="text-sm bg-green-50 p-3 rounded-lg border border-green-200">
                        {strength}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No specific strengths identified</p>
                  )}
                </div>
              </div>

              {/* Areas for Improvement */}
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-600" />
                  Areas for Improvement
                </h4>
                <div className="space-y-2">
                  {insights.areasForImprovement.length > 0 ? (
                    insights.areasForImprovement.map((area, index) => (
                      <div key={index} className="text-sm bg-blue-50 p-3 rounded-lg border border-blue-200">
                        {area}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No improvement areas identified</p>
                  )}
                </div>
              </div>
            </div>

            {/* Risk Assessment */}
            <div className="mt-6">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                Risk Assessment
              </h4>
              <div className="flex items-center gap-4">
                <Badge 
                  variant="outline" 
                  className={`${
                    insights.riskAssessment.level === 'low' ? 'bg-green-100 text-green-800 border-green-200' :
                    insights.riskAssessment.level === 'medium' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                    'bg-red-100 text-red-800 border-red-200'
                  }`}
                >
                  {insights.riskAssessment.level.toUpperCase()} RISK
                </Badge>
                <div className="text-sm text-muted-foreground">
                  {insights.riskAssessment.factors.join(', ')}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Tabs */}
        <Tabs defaultValue="financial" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="financial">Financial Analysis</TabsTrigger>
            <TabsTrigger value="tasks">Task Performance</TabsTrigger>
            <TabsTrigger value="evidence">Evidence & Files</TabsTrigger>
            <TabsTrigger value="participants">Participants</TabsTrigger>
          </TabsList>

          <TabsContent value="financial" className="space-y-4">
            <EnhancedFinancialSummary financialAnalysis={financialAnalysis} />
          </TabsContent>

          <TabsContent value="tasks" className="space-y-4">
            <TaskPerformanceGrid taskPerformance={taskPerformance} />
          </TabsContent>

          <TabsContent value="evidence" className="space-y-4">
            <EvidenceGallery evidenceSummary={evidenceSummary} />
          </TabsContent>

          <TabsContent value="participants" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Participant Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Participation Rate */}
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {participantAnalysis.participationRate.toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Participation Rate</div>
                  </div>

                  {/* Total Participants */}
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {participantAnalysis.totalActualParticipants}
                    </div>
                    <div className="text-sm text-muted-foreground">Actual Participants</div>
                  </div>

                  {/* Average per Task */}
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {participantAnalysis.averageParticipantsPerTask.toFixed(1)}
                    </div>
                    <div className="text-sm text-muted-foreground">Avg per Task</div>
                  </div>
                </div>

                {/* Participant Distribution */}
                <div className="mt-6">
                  <h4 className="font-medium mb-3">Participant Distribution by Task</h4>
                  <div className="space-y-3">
                    {participantAnalysis.participantDistribution.map((task) => (
                      <div key={task.taskId} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">{task.taskTitle}</div>
                          <div className="text-sm text-muted-foreground">
                            Expected: {task.expected} • Actual: {task.actual}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`font-medium ${
                            task.variance >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {task.variance > 0 ? '+' : ''}{task.variance}
                          </div>
                          <div className="text-sm text-muted-foreground">Variance</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
