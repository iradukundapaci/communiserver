"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  Users, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  Clock
} from "lucide-react";

interface StickySummaryBarProps {
  summary: {
    totalTasks: number;
    completedTasks: number;
    completionRate: number;
    totalCost: number;
    totalParticipants: number;
    totalImpact: number;
  };
  insights: {
    overallPerformanceScore: number;
    riskAssessment: {
      level: 'low' | 'medium' | 'high';
    };
  };
}

export function StickySummaryBar({ summary, insights }: StickySummaryBarProps) {
  const getRiskColor = (level: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  const getRiskIcon = (level: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'low': return <CheckCircle className="h-4 w-4" />;
      case 'medium': return <AlertTriangle className="h-4 w-4" />;
      case 'high': return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <Card className="border-0 shadow-none">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 items-center">
            {/* Completion Rate */}
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-sm font-medium">
                  {summary.completionRate.toFixed(1)}%
                </div>
                <div className="text-xs text-muted-foreground">
                  {summary.completedTasks}/{summary.totalTasks} tasks
                </div>
              </div>
            </div>

            {/* Total Cost */}
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-sm font-medium">
                  {summary.totalCost.toLocaleString()} RWF
                </div>
                <div className="text-xs text-muted-foreground">Total Cost</div>
              </div>
            </div>

            {/* Total Participants */}
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              <div>
                <div className="text-sm font-medium">
                  {summary.totalParticipants}
                </div>
                <div className="text-xs text-muted-foreground">Participants</div>
              </div>
            </div>

            {/* Total Impact */}
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              <div>
                <div className="text-sm font-medium">
                  {summary.totalImpact.toLocaleString()} RWF
                </div>
                <div className="text-xs text-muted-foreground">Impact</div>
              </div>
            </div>

            {/* Performance Score */}
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                <span className="text-xs text-white font-bold">
                  {insights.overallPerformanceScore.toFixed(0)}
                </span>
              </div>
              <div>
                <div className="text-sm font-medium">Score</div>
                <div className="text-xs text-muted-foreground">Performance</div>
              </div>
            </div>

            {/* Risk Level */}
            <div className="flex items-center gap-2">
              <Badge 
                variant="outline" 
                className={`${getRiskColor(insights.riskAssessment.level)} border`}
              >
                {getRiskIcon(insights.riskAssessment.level)}
                <span className="ml-1 capitalize">
                  {insights.riskAssessment.level} Risk
                </span>
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 