'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getActivityReport, ActivityReportData } from '@/lib/api/activities';
import { useUser } from '@/lib/contexts/user-context';
import {
  ArrowLeft,
  FileText,
  Users,
  DollarSign,
  Calendar,
  MapPin,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, use } from 'react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ActivityReportPDFButton } from '@/components/pdf-report-button';

interface ActivityReportPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ActivityReportPage({
  params,
}: ActivityReportPageProps) {
  const router = useRouter();
  const { user } = useUser();
  const [reportData, setReportData] = useState<ActivityReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());

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
        toast.error('Failed to fetch activity report');
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

  const toggleTaskExpansion = (taskId: string) => {
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedTasks(newExpanded);
  };

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
          onClick={() => router.push('/dashboard/reports')}
          className="mt-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Reports
        </Button>
      </div>
    );
  }

  const {
    activity,
    summary,
    financialAnalysis,
    participantAnalysis,
    taskOverview,
    insights,
  } = reportData;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Main Content */}
      <div className="flex-1 p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard/reports')}
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
            data={reportData}
            title={`${activity.title} - Activity Report`}
            subtitle={`Report for ${activity.title}`}
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
                  <strong>Date:</strong>{' '}
                  {format(new Date(activity.date), 'PPP')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <strong>Village:</strong>{' '}
                  {activity.village?.name || 'No village assigned'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <strong>Tasks:</strong> {summary.totalTasks} total,{' '}
                  {summary.completedTasks} completed
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

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {summary.completionRate}%
                </div>
                <div className="text-sm text-muted-foreground">
                  Completion Rate
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  ${summary.totalCost.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Total Cost</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {summary.totalParticipants}
                </div>
                <div className="text-sm text-muted-foreground">
                  Total Participants
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {participantAnalysis.participationRate}%
                </div>
                <div className="text-sm text-muted-foreground">
                  Participation Rate
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Overall Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {insights.overallStatus === 'excellent' ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : insights.overallStatus === 'good' ? (
                <CheckCircle className="h-5 w-5 text-blue-600" />
              ) : insights.overallStatus === 'average' ? (
                <AlertCircle className="h-5 w-5 text-yellow-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
              Overall Status:{' '}
              {insights.overallStatus.charAt(0).toUpperCase() +
                insights.overallStatus.slice(1)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {insights.keyPoints.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">Key Points</h4>
                  <div className="space-y-2">
                    {insights.keyPoints.map((point, index) => (
                      <div
                        key={index}
                        className="text-sm bg-green-50 p-3 rounded-lg border border-green-200"
                      >
                        {point}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {insights.recommendations.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">Recommendations</h4>
                  <div className="space-y-2">
                    {insights.recommendations.map((rec, index) => (
                      <div
                        key={index}
                        className="text-sm bg-blue-50 p-3 rounded-lg border border-blue-200"
                      >
                        {rec}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Main Tabs */}
        <Tabs defaultValue="financial" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="financial">Financial Analysis</TabsTrigger>
            <TabsTrigger value="participants">Participants</TabsTrigger>
            <TabsTrigger value="tasks">Task Overview</TabsTrigger>
          </TabsList>

          <TabsContent value="financial" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Financial Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      ${financialAnalysis.totalEstimatedCost.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Estimated Cost
                    </div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      ${financialAnalysis.totalActualCost.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Actual Cost
                    </div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div
                      className={`text-2xl font-bold ${
                        financialAnalysis.costVariance >= 0
                          ? 'text-red-600'
                          : 'text-green-600'
                      }`}
                    >
                      $
                      {Math.abs(
                        financialAnalysis.costVariance,
                      ).toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {financialAnalysis.costVariance >= 0
                        ? 'Over Budget'
                        : 'Under Budget'}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Cost Breakdown by Task</h4>
                  {financialAnalysis.costBreakdown.map((task) => (
                    <div
                      key={task.taskId}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="font-medium">{task.taskTitle}</div>
                        <div className="text-sm text-muted-foreground">
                          Estimated: ${task.estimatedCost.toLocaleString()} •
                          Actual: ${task.actualCost.toLocaleString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`font-medium ${
                            task.variance >= 0
                              ? 'text-red-600'
                              : 'text-green-600'
                          }`}
                        >
                          ${Math.abs(task.variance).toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {task.variance >= 0 ? 'Over' : 'Under'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {participantAnalysis.totalExpectedParticipants}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Expected Participants
                    </div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {participantAnalysis.totalActualParticipants}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Actual Participants
                    </div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {participantAnalysis.averageParticipantsPerTask}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Avg per Task
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">
                    Participant Distribution by Task
                  </h4>
                  {participantAnalysis.participantDistribution.map((task) => (
                    <div key={task.taskId} className="border rounded-lg">
                      <div className="flex items-center justify-between p-3">
                        <div className="flex-1">
                          <div className="font-medium">{task.taskTitle}</div>
                          <div className="text-sm text-muted-foreground">
                            Expected: {task.expected} • Actual: {task.actual}
                          </div>
                        </div>
                        <div className="text-right">
                          <div
                            className={`font-medium ${
                              task.variance >= 0
                                ? 'text-green-600'
                                : 'text-red-600'
                            }`}
                          >
                            {task.variance > 0 ? '+' : ''}
                            {task.variance}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Variance
                          </div>
                        </div>
                        {task.participants.length > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleTaskExpansion(task.taskId)}
                            className="ml-2"
                          >
                            {expandedTasks.has(task.taskId) ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </div>
                      {expandedTasks.has(task.taskId) &&
                        task.participants.length > 0 && (
                          <div className="border-t p-3 bg-gray-50">
                            <div className="space-y-1">
                              {task.participants.map((participant) => (
                                <div key={participant.id} className="text-sm">
                                  {participant.name}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-4">
            <div className="space-y-4">
              {taskOverview.map((taskItem) => (
                <Card key={taskItem.task.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        {taskItem.task.title}
                      </div>
                      <Badge
                        variant={taskItem.report ? 'default' : 'secondary'}
                      >
                        {taskItem.report ? 'Completed' : 'Pending'}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {taskItem.task.description}
                      </p>
                      <p className="text-sm mt-2">
                        <strong>Isibo:</strong> {taskItem.task.isibo.name}
                      </p>
                    </div>

                    {taskItem.report && (
                      <>
                        <Separator />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium mb-2">
                              Financial Report
                            </h4>
                            <div className="space-y-2 text-sm">
                              <div>
                                Estimated Cost: $
                                {taskItem.report.estimatedCost.toLocaleString()}
                              </div>
                              <div>
                                Actual Cost: $
                                {taskItem.report.actualCost.toLocaleString()}
                              </div>
                              <div
                                className={`font-medium ${
                                  taskItem.report.actualCost >
                                  taskItem.report.estimatedCost
                                    ? 'text-red-600'
                                    : 'text-green-600'
                                }`}
                              >
                                Variance: $
                                {(
                                  taskItem.report.actualCost -
                                  taskItem.report.estimatedCost
                                ).toLocaleString()}
                              </div>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2">
                              Participation Report
                            </h4>
                            <div className="space-y-2 text-sm">
                              <div>
                                Expected: {taskItem.report.expectedParticipants}
                              </div>
                              <div>
                                Actual: {taskItem.report.actualParticipants}
                              </div>
                              <div
                                className={`font-medium ${
                                  taskItem.report.actualParticipants >=
                                  taskItem.report.expectedParticipants
                                    ? 'text-green-600'
                                    : 'text-red-600'
                                }`}
                              >
                                Variance:{' '}
                                {taskItem.report.actualParticipants -
                                  taskItem.report.expectedParticipants}
                              </div>
                            </div>
                          </div>
                        </div>

                        {taskItem.report.participants.length > 0 && (
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium">
                                Participants (
                                {taskItem.report.participants.length})
                              </h4>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  toggleTaskExpansion(taskItem.task.id)
                                }
                              >
                                {expandedTasks.has(taskItem.task.id) ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                            {expandedTasks.has(taskItem.task.id) && (
                              <div className="border rounded-lg p-3 bg-gray-50">
                                <div className="space-y-1">
                                  {taskItem.report.participants.map(
                                    (participant) => (
                                      <div
                                        key={participant.id}
                                        className="text-sm"
                                      >
                                        {participant.name}
                                      </div>
                                    ),
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {taskItem.report.comment && (
                          <div>
                            <h4 className="font-medium mb-2">Comments</h4>
                            <p className="text-sm text-muted-foreground">
                              {taskItem.report.comment}
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
