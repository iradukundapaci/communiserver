"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  IconDownload, 
  IconMail, 
  IconLoader2, 
  IconFileTypePdf,
  IconEye
} from "@tabler/icons-react";
import { toast } from "sonner";
import { 
  generateReportSummary, 
  emailReportSummary,
  GenerateReportSummaryInput,
  EmailReportSummaryInput 
} from "@/lib/api/reports";

interface ReportSummaryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: {
    activityId: string;
    searchQuery: string;
    dateFrom: string;
    dateTo: string;
    hasEvidence: "all" | "yes" | "no";
    minCost: string;
    maxCost: string;
    minParticipants: string;
    maxParticipants: string;
    isiboId: string;
  };
}

export function ReportSummaryDialog({ 
  open, 
  onOpenChange, 
  filters 
}: ReportSummaryDialogProps) {
  const [activeTab, setActiveTab] = useState("generate");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: "Community Reports Summary",
    subtitle: "",
    includeStats: true,
    includeReportDetails: true,
    recipientEmail: "",
    message: "",
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const prepareRequestData = (): GenerateReportSummaryInput => {
    return {
      title: formData.title,
      subtitle: formData.subtitle || undefined,
      includeStats: formData.includeStats,
      includeReportDetails: formData.includeReportDetails,
      activityId: filters.activityId !== "all_activities" ? filters.activityId : undefined,
      q: filters.searchQuery || undefined,
      dateFrom: filters.dateFrom || undefined,
      dateTo: filters.dateTo || undefined,
      hasEvidence: filters.hasEvidence === "all" ? undefined : filters.hasEvidence === "yes",
      minCost: filters.minCost ? parseFloat(filters.minCost) : undefined,
      maxCost: filters.maxCost ? parseFloat(filters.maxCost) : undefined,
      minParticipants: filters.minParticipants ? parseInt(filters.minParticipants) : undefined,
      maxParticipants: filters.maxParticipants ? parseInt(filters.maxParticipants) : undefined,
      isiboId: filters.isiboId !== "all_isibos" ? filters.isiboId : undefined,
    };
  };

  const handleGenerate = async () => {
    if (!formData.title.trim()) {
      toast.error("Please enter a title for the report");
      return;
    }

    setIsGenerating(true);
    try {
      const requestData = prepareRequestData();
      const blob = await generateReportSummary(requestData);
      
      // Clean up previous preview URL
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      
      setPreviewBlob(blob);
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      
      toast.success("Report generated successfully");
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to generate report");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!previewBlob) return;
    
    const url = URL.createObjectURL(previewBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${formData.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Report downloaded successfully");
  };

  const handlePreview = () => {
    if (!previewUrl) return;
    window.open(previewUrl, '_blank');
  };

  const handleEmail = async () => {
    if (!formData.title.trim()) {
      toast.error("Please enter a title for the report");
      return;
    }

    if (!formData.recipientEmail.trim()) {
      toast.error("Please enter a recipient email address");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.recipientEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSending(true);
    try {
      const requestData: EmailReportSummaryInput = {
        ...prepareRequestData(),
        recipientEmail: formData.recipientEmail,
        message: formData.message || undefined,
      };
      
      const result = await emailReportSummary(requestData);
      
      if (result.success) {
        toast.success(result.message);
        onOpenChange(false);
      } else {
        toast.error(result.message);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to send report");
      }
    } finally {
      setIsSending(false);
    }
  };

  const handleClose = () => {
    // Clean up preview URL when closing
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setPreviewBlob(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconFileTypePdf className="h-5 w-5" />
            Generate Report Summary
          </DialogTitle>
          <DialogDescription>
            Generate a comprehensive PDF summary of the filtered reports and optionally send it via email.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="generate">Generate & Download</TabsTrigger>
            <TabsTrigger value="email">Email Report</TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="space-y-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Report Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="Enter report title"
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subtitle">Subtitle (Optional)</Label>
                  <Input
                    id="subtitle"
                    value={formData.subtitle}
                    onChange={(e) => handleInputChange("subtitle", e.target.value)}
                    placeholder="Enter subtitle"
                    className="w-full"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label>Report Content</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeStats"
                    checked={formData.includeStats}
                    onCheckedChange={(checked) => handleInputChange("includeStats", checked)}
                  />
                  <Label htmlFor="includeStats" className="text-sm font-normal">
                    Include summary statistics
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeReportDetails"
                    checked={formData.includeReportDetails}
                    onCheckedChange={(checked) => handleInputChange("includeReportDetails", checked)}
                  />
                  <Label htmlFor="includeReportDetails" className="text-sm font-normal">
                    Include individual report details
                  </Label>
                </div>
              </div>

              {previewBlob && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Generated Report</CardTitle>
                    <CardDescription>
                      Your report has been generated successfully. You can preview or download it.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePreview}
                      className="flex items-center gap-2"
                    >
                      <IconEye className="h-4 w-4" />
                      Preview
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownload}
                      className="flex items-center gap-2"
                    >
                      <IconDownload className="h-4 w-4" />
                      Download
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleGenerate} disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <IconLoader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <IconFileTypePdf className="h-4 w-4 mr-2" />
                    Generate Report
                  </>
                )}
              </Button>
            </DialogFooter>
          </TabsContent>

          <TabsContent value="email" className="space-y-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email-title">Report Title *</Label>
                  <Input
                    id="email-title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="Enter report title"
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-subtitle">Subtitle (Optional)</Label>
                  <Input
                    id="email-subtitle"
                    value={formData.subtitle}
                    onChange={(e) => handleInputChange("subtitle", e.target.value)}
                    placeholder="Enter subtitle"
                    className="w-full"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="recipientEmail">Recipient Email *</Label>
                <Input
                  id="recipientEmail"
                  type="email"
                  value={formData.recipientEmail}
                  onChange={(e) => handleInputChange("recipientEmail", e.target.value)}
                  placeholder="Enter recipient email address"
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Additional Message (Optional)</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => handleInputChange("message", e.target.value)}
                  placeholder="Enter any additional message to include in the email"
                  rows={3}
                  className="w-full"
                />
              </div>

              <div className="space-y-3">
                <Label>Report Content</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="email-includeStats"
                    checked={formData.includeStats}
                    onCheckedChange={(checked) => handleInputChange("includeStats", checked)}
                  />
                  <Label htmlFor="email-includeStats" className="text-sm font-normal">
                    Include summary statistics
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="email-includeReportDetails"
                    checked={formData.includeReportDetails}
                    onCheckedChange={(checked) => handleInputChange("includeReportDetails", checked)}
                  />
                  <Label htmlFor="email-includeReportDetails" className="text-sm font-normal">
                    Include individual report details
                  </Label>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleEmail} disabled={isSending}>
                {isSending ? (
                  <>
                    <IconLoader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <IconMail className="h-4 w-4 mr-2" />
                    Send Report
                  </>
                )}
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
