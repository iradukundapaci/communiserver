import { IsUUID } from "class-validator";
import { Report } from "../entities/report.entity";
import { Task } from "../entities/task.entity";

export namespace ActivityReportDTO {
  export class Input {
    @IsUUID()
    activityId: string;
  }

  export class TaskOverview {
    task: {
      id: string;
      title: string;
      description: string;
      status: string;
      isibo: {
        id: string;
        name: string;
      };
    };
    report?: {
      estimatedCost: number;
      actualCost: number;
      expectedParticipants: number;
      actualParticipants: number;
      comment?: string;
      materialsUsed: string[];
      challengesFaced?: string;
      suggestions?: string;
      evidenceUrls: string[];
      participants: {
        id: string;
        name: string;
        email?: string;
      }[];
    } | null;
  }

  export class FinancialAnalysis {
    totalEstimatedCost: number;
    totalActualCost: number;
    costVariance: number;
    costVariancePercentage: number;
    costPerParticipant: number;
    costBreakdown: {
      taskId: string;
      taskTitle: string;
      estimatedCost: number;
      actualCost: number;
      variance: number;
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
      participants: {
        id: string;
        name: string;
        email?: string;
      }[];
    }[];
  }

  export class Insights {
    overallStatus: "excellent" | "good" | "average" | "needs_improvement";
    keyPoints: string[];
    recommendations: string[];
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
    };
    financialAnalysis: FinancialAnalysis;
    participantAnalysis: ParticipantAnalysis;
    taskOverview: TaskOverview[];
    insights: Insights;
  }
}
