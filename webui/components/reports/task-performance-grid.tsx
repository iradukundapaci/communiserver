"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  ChevronDown, 
  ChevronRight, 
  Users, 
  DollarSign, 
  Target,
  CheckCircle,
  AlertTriangle,
  Clock,
  FileText,
  MessageSquare
} from "lucide-react";
import { format } from "date-fns";

interface TaskPerformance {
  task: {
    id: string;
    title: string;
    description: string;
    estimatedCost: number;
    actualCost: number;
    expectedParticipants: number;
    actualParticipants: number;
    expectedFinancialImpact: number;
    actualFinancialImpact: number;
    isibo: {
      id: string;
      name: string;
    };
  };
  report?: {
    id: string;
    comment?: string;
    materialsUsed?: string[];
    challengesFaced?: string;
    suggestions?: string;
    evidenceUrls?: string[];
    attendance?: any[];
    createdAt: Date;
  };
  performanceScore: number;
  costEfficiency: number;
  participantEngagement: number;
  completionQuality: number;
  riskLevel: 'low' | 'medium' | 'high';
  status: 'excellent' | 'good' | 'average' | 'needs_improvement';
}

interface TaskPerformanceGridProps {
  taskPerformance: TaskPerformance[];
}

export function TaskPerformanceGrid({ taskPerformance }: TaskPerformanceGridProps) {
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());

  const toggleTask = (taskId: string) => {
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedTasks(newExpanded);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-100 text-green-800 border-green-200';
      case 'good': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'average': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'needs_improvement': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRiskColor = (level: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent': return <CheckCircle className="h-4 w-4" />;
      case 'good': return <Target className="h-4 w-4" />;
      case 'average': return <Clock className="h-4 w-4" />;
      case 'needs_improvement': return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Task Performance Overview</h3>
        <div className="text-sm text-muted-foreground">
          {taskPerformance.length} tasks • {taskPerformance.filter(t => t.report).length} completed
        </div>
      </div>

      <div className="grid gap-4">
        {taskPerformance.map((taskPerf, index) => (
          <Card key={taskPerf.task.id} className="overflow-hidden">
            {/* Task Header */}
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleTask(taskPerf.task.id)}
                    className="p-1 h-6 w-6"
                  >
                    {expandedTasks.has(taskPerf.task.id) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                  <div>
                    <CardTitle className="text-base">{taskPerf.task.title}</CardTitle>
                    <div className="text-sm text-muted-foreground">
                      Isibo: {taskPerf.task.isibo.name}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant="outline" 
                    className={`${getStatusColor(taskPerf.status)} border`}
                  >
                    {getStatusIcon(taskPerf.status)}
                    <span className="ml-1 capitalize">{taskPerf.status.replace('_', ' ')}</span>
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className={`${getRiskColor(taskPerf.riskLevel)} border`}
                  >
                    {taskPerf.riskLevel} Risk
                  </Badge>
                </div>
              </div>
            </CardHeader>

            {/* Task Summary */}
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {taskPerf.performanceScore.toFixed(0)}
                  </div>
                  <div className="text-xs text-muted-foreground">Performance Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {taskPerf.costEfficiency.toFixed(0)}%
                  </div>
                  <div className="text-xs text-muted-foreground">Cost Efficiency</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {taskPerf.participantEngagement.toFixed(0)}%
                  </div>
                  <div className="text-xs text-muted-foreground">Engagement</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {taskPerf.completionQuality.toFixed(0)}%
                  </div>
                  <div className="text-xs text-muted-foreground">Quality</div>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedTasks.has(taskPerf.task.id) && (
                <div className="space-y-4 border-t pt-4">
                  {/* Financial Data */}
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Financial Data
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Estimated Cost</div>
                        <div className="font-medium">{taskPerf.task.estimatedCost.toLocaleString()} RWF</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Actual Cost</div>
                        <div className="font-medium">{taskPerf.task.actualCost.toLocaleString()} RWF</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Expected Impact</div>
                        <div className="font-medium">{taskPerf.task.expectedFinancialImpact.toLocaleString()} RWF</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Actual Impact</div>
                        <div className="font-medium">{taskPerf.task.actualFinancialImpact.toLocaleString()} RWF</div>
                      </div>
                    </div>
                  </div>

                  {/* Participant Data */}
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Participant Data
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Expected Participants</div>
                        <div className="font-medium">{taskPerf.task.expectedParticipants}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Actual Participants</div>
                        <div className="font-medium">{taskPerf.task.actualParticipants}</div>
                      </div>
                    </div>
                  </div>

                  {/* Report Details */}
                  {taskPerf.report && (
                    <>
                      <Separator />
                      <div className="space-y-3">
                        <h4 className="font-medium flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Report Details
                        </h4>
                        
                        {taskPerf.report.comment && (
                          <div>
                            <div className="text-sm font-medium mb-1">Comments</div>
                            <div className="text-sm text-muted-foreground bg-muted p-3 rounded">
                              {taskPerf.report.comment}
                            </div>
                          </div>
                        )}

                        {taskPerf.report.challengesFaced && (
                          <div>
                            <div className="text-sm font-medium mb-1">Challenges Faced</div>
                            <div className="text-sm text-muted-foreground bg-muted p-3 rounded">
                              {taskPerf.report.challengesFaced}
                            </div>
                          </div>
                        )}

                        {taskPerf.report.suggestions && (
                          <div>
                            <div className="text-sm font-medium mb-1">Suggestions</div>
                            <div className="text-sm text-muted-foreground bg-muted p-3 rounded">
                              {taskPerf.report.suggestions}
                            </div>
                          </div>
                        )}

                        {taskPerf.report.materialsUsed && taskPerf.report.materialsUsed.length > 0 && (
                          <div>
                            <div className="text-sm font-medium mb-1">Materials Used</div>
                            <div className="flex flex-wrap gap-2">
                              {taskPerf.report.materialsUsed.map((material, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {material}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {taskPerf.report.evidenceUrls && taskPerf.report.evidenceUrls.length > 0 && (
                          <div>
                            <div className="text-sm font-medium mb-1">Evidence Files ({taskPerf.report.evidenceUrls.length})</div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                              {taskPerf.report.evidenceUrls.map((url, idx) => (
                                <a
                                  key={idx}
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-blue-600 hover:underline p-2 border rounded"
                                >
                                  File {idx + 1}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="text-xs text-muted-foreground">
                          Submitted: {format(new Date(taskPerf.report.createdAt), "PPp")}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 