"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SearchableSelect, SearchableSelectOption } from "@/components/ui/searchable-select";
import { Globe, MapPin, Calendar, Users, Search, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { getPublicActivities, Activity, ActivityStatus, ActivityFilters } from "@/lib/api/activities";
import { searchVillages } from "@/lib/api/villages";
import { searchCells } from "@/lib/api/cells";
import { toast } from "sonner";

const statusOptions = [
  { value: "all", label: "All Statuses" },
  { value: ActivityStatus.UPCOMING, label: "Upcoming" },
  { value: ActivityStatus.ONGOING, label: "Ongoing" },
  { value: ActivityStatus.ACTIVE, label: "Active" },
  { value: ActivityStatus.COMPLETED, label: "Completed" },
];

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedVillage, setSelectedVillage] = useState("");
  const [selectedCell, setSelectedCell] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalItems, setTotalItems] = useState(0);

  // Search functions for dynamic loading
  const handleCellSearch = async (query: string): Promise<SearchableSelectOption[]> => {
    try {
      const results = await searchCells(query);
      return results.map(cell => ({
        value: cell.id,
        label: cell.name,
        searchTerms: [cell.name, cell.sector?.name || ""].filter(Boolean)
      }));
    } catch (error) {
      console.error("Error searching cells:", error);
      return [];
    }
  };

  const handleVillageSearch = async (query: string): Promise<SearchableSelectOption[]> => {
    try {
      const results = await searchVillages(query, selectedCell || undefined);
      return results.map(village => ({
        value: village.id,
        label: village.name,
        searchTerms: [village.name, village.cell?.name || ""].filter(Boolean)
      }));
    } catch (error) {
      console.error("Error searching villages:", error);
      return [];
    }
  };

  // Handle cell selection change - filter villages
  const handleCellChange = async (cellId: string) => {
    setSelectedCell(cellId);

    // Clear village selection when cell changes
    if (selectedVillage && cellId !== selectedCell) {
      setSelectedVillage("");
    }
  };

  // Handle village selection change
  const handleVillageChange = (villageId: string) => {
    setSelectedVillage(villageId);
  };

  // Load initial activities
  useEffect(() => {
    loadActivities(true);
  }, []);

  // Load activities with current filters
  const loadActivities = async (reset = false) => {
    try {
      if (reset) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      const filters: ActivityFilters = {
        page: reset ? 1 : currentPage,
        size: 20,
        q: searchTerm || undefined,
        status: selectedStatus !== "all" ? (selectedStatus as ActivityStatus) : undefined,
        villageId: selectedVillage || undefined,
        cellId: selectedCell || undefined,
      };

      const response = await getPublicActivities(filters);

      if (reset) {
        setActivities(response.items);
        setCurrentPage(1);
      } else {
        setActivities(prev => [...prev, ...response.items]);
      }

      setTotalItems(response.meta.totalItems);
      setHasMore(response.meta.currentPage < response.meta.totalPages);
      setCurrentPage(response.meta.currentPage);
    } catch (error) {
      console.error("Error loading activities:", error);
      toast.error("Failed to load activities. Please try again.");
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  // Handle filter changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadActivities(true);
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedStatus, selectedVillage, selectedCell]);

  // Load more activities
  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore) {
      setCurrentPage(prev => prev + 1);
      loadActivities(false);
    }
  };

  const getStatusColor = (status: ActivityStatus) => {
    const colors = {
      [ActivityStatus.UPCOMING]: "bg-blue-100 text-blue-800",
      [ActivityStatus.ONGOING]: "bg-green-100 text-green-800",
      [ActivityStatus.ACTIVE]: "bg-green-100 text-green-800",
      [ActivityStatus.COMPLETED]: "bg-gray-100 text-gray-800",
      [ActivityStatus.CANCELLED]: "bg-red-100 text-red-800",
      [ActivityStatus.POSTPONED]: "bg-yellow-100 text-yellow-800",
      [ActivityStatus.PENDING]: "bg-orange-100 text-orange-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const getLocationString = (activity: Activity) => {
    const parts = [];
    if (activity.village?.name) parts.push(activity.village.name);
    if (activity.village?.cell?.name) parts.push(activity.village.cell.name);
    if (activity.village?.cell?.sector?.name) parts.push(activity.village.cell.sector.name);
    if (activity.village?.cell?.sector?.district?.name) parts.push(activity.village.cell.sector.district.name);
    return parts.join(", ");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <Globe className="h-8 w-8 text-blue-600 mr-2" />
                <span className="text-xl font-bold text-gray-900">CommuniServer</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-gray-700 hover:text-blue-600 transition-colors">
                Home
              </Link>
              <Link href="/auth/login">
                <Button variant="outline" size="sm">
                  Login
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button size="sm">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Community Activities</h1>
          <p className="text-lg text-gray-600">
            Discover and join activities happening in your community
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search activities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <SearchableSelect
                onSearch={handleCellSearch}
                value={selectedCell}
                onValueChange={handleCellChange}
                placeholder="Search cells..."
                searchPlaceholder="Type to search cells..."
                emptyMessage="No cells found"
                className="w-48"
              />

              <SearchableSelect
                onSearch={handleVillageSearch}
                value={selectedVillage}
                onValueChange={handleVillageChange}
                placeholder="Search villages..."
                searchPlaceholder="Type to search villages..."
                emptyMessage="No villages found"
                className="w-48"
              />
            </div>
          </div>

          {/* Results summary */}
          <div className="mt-4 text-sm text-gray-600">
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading activities...
              </div>
            ) : (
              <span>
                Showing {activities.length} of {totalItems} activities
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Activities Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No activities found matching your criteria.</p>
            <p className="text-gray-400 mt-2">Try adjusting your filters or search terms.</p>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activities.map(activity => {
                const { date, time } = formatDate(activity.date.toString());
                const location = getLocationString(activity);

                return (
                  <Card key={activity.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start mb-2">
                        <Badge className={getStatusColor(activity.status)}>
                          {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                        </Badge>
                        <div className="text-sm text-gray-500">
                          {activity.tasks?.length || 0} tasks
                        </div>
                      </div>
                      <CardTitle className="text-lg">{activity.title}</CardTitle>
                      <CardDescription>{activity.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span className="truncate">{location || "Location TBD"}</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span>{date} at {time}</span>
                        </div>
                        {activity.village?.name && (
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-2 flex-shrink-0" />
                            <span>Village: {activity.village.name}</span>
                          </div>
                        )}
                      </div>
                      <div className="mt-4">
                        <Link href="/auth/register">
                          <Button className="w-full">
                            Join Activity
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="text-center mt-8">
                <Button
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  variant="outline"
                  size="lg"
                >
                  {isLoadingMore ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "Load More Activities"
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Globe className="h-6 w-6 mr-2" />
                <span className="text-lg font-bold">CommuniServer</span>
              </div>
              <p className="text-gray-400">
                Connecting communities, one neighborhood at a time.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
                <li><Link href="/activities" className="hover:text-white transition-colors">Activities</Link></li>
                <li><Link href="/auth/login" className="hover:text-white transition-colors">Login</Link></li>
                <li><Link href="/auth/register" className="hover:text-white transition-colors">Register</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Community</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Guidelines</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Safety</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 CommuniServer. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
