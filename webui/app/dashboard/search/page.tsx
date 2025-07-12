"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Activity,
  CheckSquare,
  FileText,
  Users,
  MapPin,
  Clock,
  TrendingUp,
  Eye,
  ExternalLink,
  DollarSign
} from "lucide-react";
import Link from "next/link";
import { getAuthTokens } from "@/lib/api/auth";
import { SearchResultDetailModal } from "@/components/search/search-result-detail-modal";

interface SearchResult {
  id: string;
  title: string;
  description?: string;
  type: 'activity' | 'task' | 'report' | 'user' | 'location';
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt?: string;
}

interface GlobalSearchResponse {
  results: {
    activities: SearchResult[];
    tasks: SearchResult[];
    reports: SearchResult[];
    users: SearchResult[];
    locations: SearchResult[];
  };
  totalResults: number;
  meta: {
    query: string;
    searchTime: number;
    entitiesSearched: string[];
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}

export default function GlobalSearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<GlobalSearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEntities, setSelectedEntities] = useState<string[]>(['all']);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("all");
  const [error, setError] = useState<string | null>(null);
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const entityOptions = [
    { value: 'all', label: 'All', icon: <Search className="h-4 w-4" /> },
    { value: 'activities', label: 'Activities', icon: <Activity className="h-4 w-4" /> },
    { value: 'tasks', label: 'Tasks', icon: <CheckSquare className="h-4 w-4" /> },
    { value: 'reports', label: 'Reports', icon: <FileText className="h-4 w-4" /> },
    { value: 'users', label: 'Users', icon: <Users className="h-4 w-4" /> },
    { value: 'locations', label: 'Locations', icon: <MapPin className="h-4 w-4" /> },
  ];

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError("Please enter a search term");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const tokens = getAuthTokens();
      if (!tokens) {
        throw new Error('Not authenticated');
      }

      const params = new URLSearchParams({
        q: searchQuery,
        page: currentPage.toString(),
        size: '20',
        entities: selectedEntities.includes('all') ? 'all' : selectedEntities.join(','),
      });

      const response = await fetch(`/api/v1/search/global?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokens.accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }

      const data = await response.json();
      const results = data.payload || data;
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      setError(error instanceof Error ? error.message : "An error occurred while searching");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEntityToggle = (entity: string) => {
    if (entity === 'all') {
      setSelectedEntities(['all']);
    } else {
      setSelectedEntities(prev => {
        const newEntities = prev.filter(e => e !== 'all');
        if (newEntities.includes(entity)) {
          const filtered = newEntities.filter(e => e !== entity);
          return filtered.length === 0 ? ['all'] : filtered;
        } else {
          return [...newEntities, entity];
        }
      });
    }
  };

  const handleViewDetails = (result: SearchResult) => {
    setSelectedResult(result);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setSelectedResult(null);
    setIsDetailModalOpen(false);
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

  const getResultCount = (type: string): number => {
    if (!searchResults) return 0;

    switch (type) {
      case 'activities':
        return searchResults.results.activities.length;
      case 'tasks':
        return searchResults.results.tasks.length;
      case 'reports':
        return searchResults.results.reports.length;
      case 'users':
        return searchResults.results.users.length;
      case 'locations':
        return searchResults.results.locations.length;
      default:
        return searchResults.totalResults;
    }
  };

  const renderResults = (results: SearchResult[]) => {
    if (results.length === 0) {
      return (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Search className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-500 text-center">
              Try adjusting your search terms to find what you're looking for.
            </p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-4">
        {results.map((result) => (
          <Card key={result.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">{result.type}</Badge>
                    <h3 className="font-medium">{result.title}</h3>
                  </div>
                  {result.description && (
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{result.description}</p>
                  )}

                  {/* Metadata preview */}
                  {result.metadata && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {result.metadata.village && (
                        <Badge variant="secondary" className="text-xs">
                          <MapPin className="h-3 w-3 mr-1" />
                          {result.metadata.village}
                        </Badge>
                      )}
                      {result.metadata.status && (
                        <Badge variant="secondary" className="text-xs">
                          <CheckSquare className="h-3 w-3 mr-1" />
                          {result.metadata.status}
                        </Badge>
                      )}
                      {result.metadata.role && (
                        <Badge variant="secondary" className="text-xs">
                          <Users className="h-3 w-3 mr-1" />
                          {result.metadata.role}
                        </Badge>
                      )}
                      {result.metadata.estimatedCost && (
                        <Badge variant="secondary" className="text-xs">
                          <DollarSign className="h-3 w-3 mr-1" />
                          ${result.metadata.estimatedCost.toLocaleString()}
                        </Badge>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500">
                      Created: {new Date(result.createdAt).toLocaleDateString()}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(result)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={getDetailsLink(result)}>
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Open
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Global Search</h1>
          <p className="text-gray-600">Search across all activities, tasks, reports, users, and locations</p>
        </div>
      </div>

      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Search for activities, tasks, reports, users, or locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch} disabled={isLoading}>
              <Search className="h-4 w-4 mr-2" />
              {isLoading ? 'Searching...' : 'Search'}
            </Button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Entity Filters */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Search in:</label>
            <div className="flex flex-wrap gap-2">
              {entityOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={selectedEntities.includes(option.value) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleEntityToggle(option.value)}
                  className="flex items-center gap-2"
                >
                  {option.icon}
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchResults && (
        <div className="space-y-6">
          {/* Search Summary */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="font-medium">{searchResults.totalResults} results found</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {searchResults.meta.searchTime}ms
                    </span>
                  </div>
                </div>
                <Badge variant="outline">
                  Query: "{searchResults.meta.query}"
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Results Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="all" className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                All ({searchResults.totalResults})
              </TabsTrigger>
              <TabsTrigger value="activities" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Activities ({getResultCount('activities')})
              </TabsTrigger>
              <TabsTrigger value="tasks" className="flex items-center gap-2">
                <CheckSquare className="h-4 w-4" />
                Tasks ({getResultCount('tasks')})
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Reports ({getResultCount('reports')})
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Users ({getResultCount('users')})
              </TabsTrigger>
              <TabsTrigger value="locations" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Locations ({getResultCount('locations')})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              {renderResults([
                ...searchResults.results.activities,
                ...searchResults.results.tasks,
                ...searchResults.results.reports,
                ...searchResults.results.users,
                ...searchResults.results.locations,
              ])}
            </TabsContent>

            <TabsContent value="activities" className="mt-6">
              {renderResults(searchResults.results.activities)}
            </TabsContent>

            <TabsContent value="tasks" className="mt-6">
              {renderResults(searchResults.results.tasks)}
            </TabsContent>

            <TabsContent value="reports" className="mt-6">
              {renderResults(searchResults.results.reports)}
            </TabsContent>

            <TabsContent value="users" className="mt-6">
              {renderResults(searchResults.results.users)}
            </TabsContent>

            <TabsContent value="locations" className="mt-6">
              {renderResults(searchResults.results.locations)}
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* Empty State */}
      {!searchResults && !isLoading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Search className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Start searching</h3>
            <p className="text-gray-500 text-center">
              Enter a search term above to find activities, tasks, reports, users, and locations.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Detail Modal */}
      <SearchResultDetailModal
        result={selectedResult}
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
      />
    </div>
  );
}
