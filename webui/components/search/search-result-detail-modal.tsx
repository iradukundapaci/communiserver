"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Activity, 
  CheckSquare, 
  FileText, 
  Users, 
  MapPin,
  Calendar,
  DollarSign,
  ExternalLink,
  Eye,
  X
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

interface SearchResult {
  id: string;
  title: string;
  description?: string;
  type: 'activity' | 'task' | 'report' | 'user' | 'location';
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt?: string;
}

interface SearchResultDetailModalProps {
  result: SearchResult | null;
  isOpen: boolean;
  onClose: () => void;
}

export function SearchResultDetailModal({ result, isOpen, onClose }: SearchResultDetailModalProps) {
  if (!result) return null;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'activity':
        return <Activity className="h-5 w-5" />;
      case 'task':
        return <CheckSquare className="h-5 w-5" />;
      case 'report':
        return <FileText className="h-5 w-5" />;
      case 'user':
        return <Users className="h-5 w-5" />;
      case 'location':
        return <MapPin className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'activity':
        return 'bg-blue-100 text-blue-800';
      case 'task':
        return 'bg-green-100 text-green-800';
      case 'report':
        return 'bg-purple-100 text-purple-800';
      case 'user':
        return 'bg-orange-100 text-orange-800';
      case 'location':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDetailsLink = (result: SearchResult) => {
    switch (result.type) {
      case 'activity':
        return `/dashboard/activities/${result.id}`;
      case 'task':
        return `/dashboard/activities?taskId=${result.id}`;
      case 'report':
        return `/dashboard/reports/${result.id}`;
      case 'user':
        return `/dashboard/users/${result.id}`;
      case 'location':
        return `/dashboard/locations/${result.id}`;
      default:
        return '#';
    }
  };

  const renderMetadata = () => {
    if (!result.metadata) return null;

    const metadataItems = [];

    // Common metadata fields
    if (result.metadata.village) {
      metadataItems.push({
        label: 'Village',
        value: result.metadata.village,
        icon: <MapPin className="h-4 w-4" />
      });
    }

    if (result.metadata.cell) {
      metadataItems.push({
        label: 'Cell',
        value: result.metadata.cell,
        icon: <MapPin className="h-4 w-4" />
      });
    }

    if (result.metadata.status) {
      metadataItems.push({
        label: 'Status',
        value: result.metadata.status,
        icon: <CheckSquare className="h-4 w-4" />
      });
    }

    if (result.metadata.role) {
      metadataItems.push({
        label: 'Role',
        value: result.metadata.role,
        icon: <Users className="h-4 w-4" />
      });
    }

    if (result.metadata.email) {
      metadataItems.push({
        label: 'Email',
        value: result.metadata.email,
        icon: <Users className="h-4 w-4" />
      });
    }

    if (result.metadata.phone) {
      metadataItems.push({
        label: 'Phone',
        value: result.metadata.phone,
        icon: <Users className="h-4 w-4" />
      });
    }

    if (result.metadata.estimatedCost) {
      metadataItems.push({
        label: 'Estimated Cost',
        value: `$${result.metadata.estimatedCost.toLocaleString()}`,
        icon: <DollarSign className="h-4 w-4" />
      });
    }

    if (result.metadata.actualCost) {
      metadataItems.push({
        label: 'Actual Cost',
        value: `$${result.metadata.actualCost.toLocaleString()}`,
        icon: <DollarSign className="h-4 w-4" />
      });
    }

    if (result.metadata.date) {
      metadataItems.push({
        label: 'Date',
        value: format(new Date(result.metadata.date), 'PPP'),
        icon: <Calendar className="h-4 w-4" />
      });
    }

    if (result.metadata.activity) {
      metadataItems.push({
        label: 'Activity',
        value: result.metadata.activity,
        icon: <Activity className="h-4 w-4" />
      });
    }

    if (result.metadata.task) {
      metadataItems.push({
        label: 'Task',
        value: result.metadata.task,
        icon: <CheckSquare className="h-4 w-4" />
      });
    }

    if (result.metadata.isibo) {
      metadataItems.push({
        label: 'Isibo',
        value: result.metadata.isibo,
        icon: <MapPin className="h-4 w-4" />
      });
    }

    if (result.metadata.hasEvidence) {
      metadataItems.push({
        label: 'Evidence',
        value: 'Available',
        icon: <FileText className="h-4 w-4" />
      });
    }

    if (result.metadata.type) {
      metadataItems.push({
        label: 'Type',
        value: result.metadata.type,
        icon: <MapPin className="h-4 w-4" />
      });
    }

    if (result.metadata.parent) {
      metadataItems.push({
        label: 'Parent Location',
        value: result.metadata.parent,
        icon: <MapPin className="h-4 w-4" />
      });
    }

    if (result.metadata.population) {
      metadataItems.push({
        label: 'Population',
        value: result.metadata.population.toLocaleString(),
        icon: <Users className="h-4 w-4" />
      });
    }

    if (result.metadata.leader) {
      metadataItems.push({
        label: 'Leader',
        value: result.metadata.leader,
        icon: <Users className="h-4 w-4" />
      });
    }

    return metadataItems;
  };

  const metadataItems = renderMetadata();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {getTypeIcon(result.type)}
                <Badge className={getTypeColor(result.type)}>
                  {result.type}
                </Badge>
              </div>
              <DialogTitle className="text-xl">{result.title}</DialogTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Description */}
          {result.description && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">{result.description}</p>
              </CardContent>
            </Card>
          )}

          {/* Metadata */}
          {metadataItems && metadataItems.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {metadataItems.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      {item.icon}
                      <span className="text-sm font-medium">{item.label}:</span>
                      <span className="text-sm text-gray-600">{item.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Timestamps */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Timestamps</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm font-medium">Created:</span>
                  <span className="text-sm text-gray-600">
                    {format(new Date(result.createdAt), 'PPP p')}
                  </span>
                </div>
                {result.updatedAt && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm font-medium">Updated:</span>
                    <span className="text-sm text-gray-600">
                      {format(new Date(result.updatedAt), 'PPP p')}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-2">
            <Button asChild className="flex-1">
              <Link href={getDetailsLink(result)}>
                <ExternalLink className="h-4 w-4 mr-2" />
                View Full Details
              </Link>
            </Button>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
