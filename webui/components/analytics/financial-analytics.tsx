"use client";

import * as React from "react";
import { IconCurrencyDollar, IconTrendingUp, IconTrendingDown, IconCalculator } from "@tabler/icons-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface FinancialAnalytics {
  totalEstimatedCost: number;
  totalActualCost: number;
  costVariance: number;
  costVariancePercentage: number;
  totalEstimatedImpact: number;
  totalActualImpact: number;
  impactVariance: number;
  impactVariancePercentage: number;
  averageCostPerActivity: number;
  averageCostPerTask: number;
  budgetEfficiency: number;
}

interface FinancialAnalyticsProps {
  className?: string;
}

export function FinancialAnalytics({ className }: FinancialAnalyticsProps) {
  const [financialData, setFinancialData] = React.useState<FinancialAnalytics | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchFinancialData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const token = localStorage.getItem('accessToken');
        const response = await fetch('/api/v1/analytics/core-metrics?timeRange=30d', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch financial analytics');
        }

        const data = await response.json();
        setFinancialData(data.financialAnalytics);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFinancialData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getVarianceColor = (percentage: number) => {
    if (percentage > 10) return "text-red-600";
    if (percentage > 0) return "text-yellow-600";
    return "text-green-600";
  };

  const getVarianceIcon = (percentage: number) => {
    return percentage >= 0 ? IconTrendingUp : IconTrendingDown;
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconCurrencyDollar className="h-5 w-5" />
            Financial Analytics
          </CardTitle>
          <CardDescription>Budget performance and cost analysis</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconCurrencyDollar className="h-5 w-5" />
            Financial Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-600">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!financialData) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconCurrencyDollar className="h-5 w-5" />
            Financial Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No financial data available</p>
        </CardContent>
      </Card>
    );
  }

  const VarianceIcon = getVarianceIcon(financialData.costVariancePercentage);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconCurrencyDollar className="h-5 w-5" />
          Financial Analytics
        </CardTitle>
        <CardDescription>
          Budget performance and cost analysis
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Cost Overview */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <IconCalculator className="h-4 w-4" />
                Total Estimated Cost
              </div>
              <div className="text-lg font-bold">
                {formatCurrency(financialData.totalEstimatedCost)}
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <IconCurrencyDollar className="h-4 w-4" />
                Total Actual Cost
              </div>
              <div className="text-lg font-bold">
                {formatCurrency(financialData.totalActualCost)}
              </div>
            </div>
          </div>

          {/* Budget Efficiency */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Budget Efficiency</span>
              <Badge variant={financialData.budgetEfficiency <= 100 ? "default" : "destructive"}>
                {financialData.budgetEfficiency.toFixed(1)}%
              </Badge>
            </div>
            <Progress 
              value={Math.min(financialData.budgetEfficiency, 150)} 
              className="h-2"
            />
          </div>

          {/* Cost Variance */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Cost Variance</span>
              <div className={`flex items-center gap-1 text-sm font-medium ${getVarianceColor(financialData.costVariancePercentage)}`}>
                <VarianceIcon className="h-4 w-4" />
                {financialData.costVariancePercentage >= 0 ? '+' : ''}{financialData.costVariancePercentage.toFixed(1)}%
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              {formatCurrency(Math.abs(financialData.costVariance))} {financialData.costVariance >= 0 ? 'over' : 'under'} budget
            </div>
          </div>

          {/* Financial Impact */}
          <div className="space-y-2">
            <div className="text-sm font-medium">Financial Impact</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <div className="text-muted-foreground">Expected</div>
                <div className="font-medium">{formatCurrency(financialData.totalEstimatedImpact)}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Actual</div>
                <div className="font-medium">{formatCurrency(financialData.totalActualImpact)}</div>
              </div>
            </div>
          </div>

          {/* Averages */}
          <div className="space-y-2">
            <div className="text-sm font-medium">Average Costs</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <div className="text-muted-foreground">Per Activity</div>
                <div className="font-medium">{formatCurrency(financialData.averageCostPerActivity)}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Per Task</div>
                <div className="font-medium">{formatCurrency(financialData.averageCostPerTask)}</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
