"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Activity, 
  CheckSquare, 
  FileText, 
  Users, 
  MapPin, 
  Calendar,
  DollarSign,
  Eye,
  ExternalLink
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

export interface SearchResult {
  id: string;
  title: string;
  description?: string;
  type: 'activity' | 'task' | 'report' | 'user' | 'location';
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt?: string;
  relevanceScore?: number;
}

interface SearchResultsProps {
  results: SearchResult[];
  isLoading?: boolean;
  totalResults?: number;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  onViewDetails?: (result: SearchResult) => void;
}

export function SearchResults({
  results,
  isLoading = false,
  totalResults = 0,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  onViewDetails,
}: SearchResultsProps) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'activity':
        return <Activity className="h-4 w-4" />;
      case 'task':
        return <CheckSquare className="h-4 w-4" />;
      case 'report':
        return <FileText className="h-4 w-4" />;
      case 'user':
        return <Users className="h-4 w-4" />;
      case 'location':
        return <MapPin className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
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
        return `/dashboard/tasks/${result.id}`;
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

  const formatMetadata = (metadata: Record<string, any>) => {
    const items = [];
    
    if (metadata.village) {
      items.push({ icon: <MapPin className="h-3 w-3" />, text: metadata.village });
    }
    if (metadata.cell) {
      items.push({ icon: <MapPin className="h-3 w-3" />, text: metadata.cell });
    }
    if (metadata.status) {
      items.push({ icon: <CheckSquare className="h-3 w-3" />, text: metadata.status });
    }
    if (metadata.role) {
      items.push({ icon: <Users className="h-3 w-3" />, text: metadata.role });
    }
    if (metadata.estimatedCost) {
      items.push({ 
        icon: <DollarSign className="h-3 w-3" />, 
        text: `$${metadata.estimatedCost.toLocaleString()}` 
      });
    }
    if (metadata.date) {
      items.push({ 
        icon: <Calendar className="h-3 w-3" />, 
        text: format(new Date(metadata.date), 'MMM dd, yyyy') 
      });
    }

    return items.slice(0, 3); // Limit to 3 items
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-5 w-16" />
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
          <p className="text-gray-500 text-center">
            Try adjusting your search terms or filters to find what you're looking for.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Results summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {results.length} of {totalResults} results
        </p>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => onPageChange?.(currentPage - 1)}
            >
              Previous
            </Button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange?.(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* Results */}
      {results.map((result) => (
        <Card key={result.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <div className="flex items-center gap-2">
                  {getTypeIcon(result.type)}
                  <Badge className={getTypeColor(result.type)}>
                    {result.type}
                  </Badge>
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg leading-tight">
                    {result.title}
                  </CardTitle>
                  {result.description && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {result.description}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {result.relevanceScore && (
                  <Badge variant="outline" className="text-xs">
                    {Math.round(result.relevanceScore)}% match
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewDetails?.(result)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={getDetailsLink(result)}>
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs text-gray-500">
                {result.metadata && formatMetadata(result.metadata).map((item, index) => (
                  <div key={index} className="flex items-center gap-1">
                    {item.icon}
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
              <div className="text-xs text-gray-500">
                {format(new Date(result.createdAt), 'MMM dd, yyyy')}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              disabled={currentPage <= 1}
              onClick={() => onPageChange?.(currentPage - 1)}
            >
              Previous
            </Button>
            {[...Array(Math.min(5, totalPages))].map((_, i) => {
              const page = Math.max(1, currentPage - 2) + i;
              if (page > totalPages) return null;
              
              return (
                <Button
                  key={page}
                  variant={page === currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange?.(page)}
                >
                  {page}
                </Button>
              );
            })}
            <Button
              variant="outline"
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange?.(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
