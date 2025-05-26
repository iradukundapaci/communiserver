"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Report, getReportById } from "@/lib/api/reports";
import { useUser } from "@/lib/contexts/user-context";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

export default function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Unwrap params using React.use()
  const resolvedParams = React.use(params);
  const reportId = resolvedParams.id;

  const router = useRouter();
  const { user } = useUser();
  const [report, setReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setIsLoading(true);
        const data = await getReportById(reportId);
        setReport(data);
      } catch (error: unknown) {
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("Failed to fetch report");
        }
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReport();
  }, [reportId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push("/dashboard/reports")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Report Details</h1>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : report ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Task Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                <div className="font-medium">Activity:</div>
                <div className="col-span-2">{report.activity.title}</div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="font-medium">Task:</div>
                <div className="col-span-2">{report.task.title}</div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="font-medium">Submitted:</div>
                <div className="col-span-2">
                  {formatDate(report.createdAt.toString())}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Report Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                <div className="font-medium">Comment:</div>
                <div className="col-span-2">
                  {report.comment || "No comment provided"}
                </div>
              </div>
              {report.evidenceUrls && report.evidenceUrls.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  <div className="font-medium">Evidence:</div>
                  <div className="col-span-2">
                    <ul className="space-y-2">
                      {report.evidenceUrls.map((url, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline flex items-center gap-1"
                          >
                            Evidence {index + 1}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
              {report.attendance && report.attendance.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  <div className="font-medium">Attendance:</div>
                  <div className="col-span-2">
                    <ul className="space-y-1">
                      {report.attendance.map((citizen, index) => (
                        <li key={index}>
                          {citizen.names} ({citizen.email} • {citizen.phone})
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="text-center py-8">Report not found</div>
      )}
    </div>
  );
}
