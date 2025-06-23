import { IsUUID } from "class-validator";
import { Report } from "../entities/report.entity";
import { Task } from "../entities/task.entity";

export namespace ActivityReportDTO {
  export class Input {
    @IsUUID()
    activityId: string;
  }

  export class TaskPerformance {
    task: Task;
    report?: Report;
    performanceScore: number;
    costEfficiency: number;
    participantEngagement: number;
    completionQuality: number;
    riskLevel: 'low' | 'medium' | 'high';
    status: 'excellent' | 'good' | 'average' | 'needs_improvement';
  }

  export class IsiboPerformance {
    isiboId: string;
    isiboName: string;
    tasksCount: number;
    completedTasks: number;
    totalCost: number;
    totalParticipants: number;
    averagePerformanceScore: number;
    tasks: TaskPerformance[];
  }

  export class FinancialAnalysis {
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
  }

  export class ParticipantAnalysis {
    totalExpectedParticipants: number;
    totalActualParticipants: number;
    participationRate: number;
    participantVariance: number;
    averageParticipantsPerTask: number;
    participantDistribution: {
      taskId: string;
      taskTitle: string;
      expected: number;
      actual: number;
      variance: number;
    }[];
  }

  export class EvidenceSummary {
    totalFiles: number;
    filesByType: {
      images: number;
      documents: number;
      videos: number;
      other: number;
    };
    evidenceQuality: {
      high: number;
      medium: number;
      low: number;
    };
    evidenceUrls: string[];
  }

  export class ActivityInsights {
    overallPerformanceScore: number;
    keyStrengths: string[];
    areasForImprovement: string[];
    commonChallenges: string[];
    bestPractices: string[];
    recommendations: string[];
    riskAssessment: {
      level: 'low' | 'medium' | 'high';
      factors: string[];
    };
  }

  export class Output {
    activity: {
      id: string;
      title: string;
      description: string;
      date: Date;
      village: {
        id: string;
        name: string;
      };
    };
    summary: {
      totalTasks: number;
      completedTasks: number;
      completionRate: number;
      totalCost: number;
      totalParticipants: number;
      totalImpact: number;
    };
    financialAnalysis: FinancialAnalysis;
    participantAnalysis: ParticipantAnalysis;
    evidenceSummary: EvidenceSummary;
    insights: ActivityInsights;
    isiboPerformance: IsiboPerformance[];
    taskPerformance: TaskPerformance[];
    reports: Report[];
  }
} 