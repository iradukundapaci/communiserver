"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Target,
  AlertTriangle,
  CheckCircle
} from "lucide-react";

interface EnhancedFinancialSummaryProps {
  financialAnalysis: {
    totalEstimatedCost: number;
    totalActualCost: number;
    costVariance: number;
    costVariancePercentage: number;
    budgetUtilization: number;
    costPerParticipant: number;
    costPerTask: number;
    roiScore: number;
    costBreakdown: {
      taskId: string;
      taskTitle: string;
      estimatedCost: number;
      actualCost: number;
      variance: number;
      percentage: number;
    }[];
  };
}

export function EnhancedFinancialSummary({ financialAnalysis }: EnhancedFinancialSummaryProps) {
  const getVarianceColor = (variance: number) => {
    if (variance > 0) return "text-red-600";
    if (variance < 0) return "text-green-600";
    return "text-gray-600";
  };

  const getVarianceIcon = (variance: number) => {
    if (variance > 0) return <TrendingUp className="h-4 w-4" />;
    if (variance < 0) return <TrendingDown className="h-4 w-4" />;
    return <Target className="h-4 w-4" />;
  };

  const getBudgetStatus = (utilization: number) => {
    if (utilization > 110) return { status: "Over Budget", color: "text-red-600", icon: <AlertTriangle className="h-4 w-4" /> };
    if (utilization > 100) return { status: "At Budget", color: "text-yellow-600", icon: <Target className="h-4 w-4" /> };
    return { status: "Under Budget", color: "text-green-600", icon: <CheckCircle className="h-4 w-4" /> };
  };

  // Ensure all values are numbers with fallbacks
  const safeFinancialAnalysis = {
    totalEstimatedCost: Number(financialAnalysis.totalEstimatedCost) || 0,
    totalActualCost: Number(financialAnalysis.totalActualCost) || 0,
    costVariance: Number(financialAnalysis.costVariance) || 0,
    costVariancePercentage: Number(financialAnalysis.costVariancePercentage) || 0,
    budgetUtilization: Number(financialAnalysis.budgetUtilization) || 0,
    costPerParticipant: Number(financialAnalysis.costPerParticipant) || 0,
    costPerTask: Number(financialAnalysis.costPerTask) || 0,
    roiScore: Number(financialAnalysis.roiScore) || 0,
    costBreakdown: financialAnalysis.costBreakdown.map(task => ({
      ...task,
      estimatedCost: Number(task.estimatedCost) || 0,
      actualCost: Number(task.actualCost) || 0,
      variance: Number(task.variance) || 0,
      percentage: Number(task.percentage) || 0,
    })),
  };

  const budgetStatus = getBudgetStatus(safeFinancialAnalysis.budgetUtilization);

  return (
    <div className="space-y-6">
      {/* Main Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Estimated Cost */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-sm font-medium">Estimated Cost</div>
                <div className="text-2xl font-bold">
                  {safeFinancialAnalysis.totalEstimatedCost.toLocaleString()} RWF
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Actual Cost */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-sm font-medium">Actual Cost</div>
                <div className="text-2xl font-bold">
                  {safeFinancialAnalysis.totalActualCost.toLocaleString()} RWF
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cost Variance */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              {getVarianceIcon(safeFinancialAnalysis.costVariance)}
              <div>
                <div className="text-sm font-medium">Cost Variance</div>
                <div className={`text-2xl font-bold ${getVarianceColor(safeFinancialAnalysis.costVariance)}`}>
                  {safeFinancialAnalysis.costVariance.toLocaleString()} RWF
                </div>
                <div className={`text-sm ${getVarianceColor(safeFinancialAnalysis.costVariance)}`}>
                  {safeFinancialAnalysis.costVariancePercentage > 0 ? '+' : ''}{safeFinancialAnalysis.costVariancePercentage.toFixed(1)}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ROI Score */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              <div>
                <div className="text-sm font-medium">ROI Score</div>
                <div className="text-2xl font-bold">
                  {safeFinancialAnalysis.roiScore.toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground">
                  Return on Investment
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Utilization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Budget Utilization
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {budgetStatus.icon}
              <span className={`font-medium ${budgetStatus.color}`}>
                {budgetStatus.status}
              </span>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">
                {safeFinancialAnalysis.budgetUtilization.toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">
                {safeFinancialAnalysis.totalActualCost.toLocaleString()} / {safeFinancialAnalysis.totalEstimatedCost.toLocaleString()} RWF
              </div>
            </div>
          </div>
          <Progress 
            value={Math.min(safeFinancialAnalysis.budgetUtilization, 120)} 
            className="h-3"
          />
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Cost per Participant</div>
              <div className="font-medium">
                {safeFinancialAnalysis.costPerParticipant.toLocaleString()} RWF
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Cost per Task</div>
              <div className="font-medium">
                {safeFinancialAnalysis.costPerTask.toLocaleString()} RWF
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Efficiency</div>
              <div className="font-medium">
                {safeFinancialAnalysis.budgetUtilization <= 100 ? 'Good' : 'Needs Review'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cost Breakdown by Task */}
      <Card>
        <CardHeader>
          <CardTitle>Cost Breakdown by Task</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {safeFinancialAnalysis.costBreakdown.map((task) => (
              <div key={task.taskId} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">{task.taskTitle}</div>
                  <div className="text-sm text-muted-foreground">
                    {task.percentage.toFixed(1)}% of total budget
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">
                    {task.actualCost.toLocaleString()} RWF
                  </div>
                  <div className={`text-sm ${getVarianceColor(task.variance)}`}>
                    {task.variance > 0 ? '+' : ''}{task.variance.toLocaleString()} RWF
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 