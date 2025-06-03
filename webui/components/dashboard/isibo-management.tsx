"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CreateIsiboDialog } from "@/components/isibos/create-isibo-dialog";
import { UpdateIsiboDialog } from "@/components/isibos/update-isibo-dialog";
import { getIsibos, deleteIsibo, type Isibo } from "@/lib/api/isibos";
import { searchVillages, type Village } from "@/lib/api/locations";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { useUser } from "@/lib/contexts/user-context";
import { 
  IconUsers, 
  IconMapPin, 
  IconSearch, 
  IconTrash, 
  IconUserCheck,
  IconFilter,
  IconX
} from "@tabler/icons-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface IsiboManagementProps {
  className?: string;
}

export function IsiboManagement({ className = "" }: IsiboManagementProps) {
  const { user } = useUser();
  const [isibos, setIsibos] = useState<Isibo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVillage, setSelectedVillage] = useState<Village | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchIsibos();
  }, [currentPage, selectedVillage]);

  const fetchIsibos = async () => {
    if (!selectedVillage) {
      setIsibos([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await getIsibos(
        selectedVillage.id,
        currentPage,
        10,
        searchQuery || undefined
      );
      setIsibos(response.items);
      setTotalPages(response.meta.totalPages);
    } catch (error) {
      console.error("Failed to fetch isibos:", error);
      toast.error("Failed to fetch isibos");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchIsibos();
  };

  const handleVillageSearch = async (query: string) => {
    try {
      const villages = await searchVillages(query);
      return villages.map(village => ({
        value: village.id,
        label: `${village.name} (${village.cell?.name})`,
        data: village,
      }));
    } catch (error) {
      console.error("Village search error:", error);
      return [];
    }
  };

  const handleDeleteIsibo = async (isiboId: string) => {
    if (!confirm("Are you sure you want to delete this isibo?")) {
      return;
    }

    try {
      await deleteIsibo(isiboId);
      toast.success("Isibo deleted successfully");
      fetchIsibos();
    } catch (error) {
      console.error("Delete isibo error:", error);
      toast.error("Failed to delete isibo");
    }
  };

  const clearFilters = () => {
    setSelectedVillage(null);
    setSearchQuery("");
    setCurrentPage(1);
  };

  // Check if user can manage isibos (admin or village leader)
  const canManageIsibos = user?.role === "ADMIN" || user?.role === "VILLAGE_LEADER";

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Isibo Management</h2>
          <p className="text-gray-600">Manage isibos and their members</p>
        </div>
        {canManageIsibos && (
          <CreateIsiboDialog onIsiboCreated={fetchIsibos} />
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <IconFilter className="h-5 w-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Village *</label>
              <SearchableSelect
                placeholder="Search and select village..."
                onSearch={handleVillageSearch}
                onSelect={(option) => setSelectedVillage(option.data)}
                onClear={() => setSelectedVillage(null)}
                value={selectedVillage ? {
                  value: selectedVillage.id,
                  label: `${selectedVillage.name} (${selectedVillage.cell?.name})`,
                  data: selectedVillage,
                } : null}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <IconSearch className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search isibos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex items-end space-x-2">
              <Button onClick={handleSearch} disabled={!selectedVillage}>
                Search
              </Button>
              {(selectedVillage || searchQuery) && (
                <Button variant="outline" onClick={clearFilters}>
                  <IconX className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Isibos List */}
      {!selectedVillage ? (
        <Card>
          <CardContent className="py-8 text-center">
            <IconMapPin className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">Please select a village to view isibos</p>
          </CardContent>
        </Card>
      ) : loading ? (
        <Card>
          <CardContent className="py-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading isibos...</p>
          </CardContent>
        </Card>
      ) : isibos.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <IconUsers className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">No isibos found</p>
            {canManageIsibos && (
              <CreateIsiboDialog 
                onIsiboCreated={fetchIsibos}
                trigger={
                  <Button className="mt-4">
                    Create First Isibo
                  </Button>
                }
              />
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isibos.map((isibo) => (
            <Card key={isibo.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{isibo.name}</CardTitle>
                  <div className="flex items-center space-x-2">
                    {isibo.hasLeader && (
                      <Badge variant="default" className="text-xs">
                        <IconUserCheck className="h-3 w-3 mr-1" />
                        Has Leader
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center text-sm text-gray-600">
                  <IconMapPin className="h-4 w-4 mr-2" />
                  {isibo.village?.name}
                </div>

                <div className="flex items-center text-sm text-gray-600">
                  <IconUsers className="h-4 w-4 mr-2" />
                  {isibo.members?.length || 0} members
                </div>

                {isibo.members && isibo.members.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Members:</p>
                    <div className="space-y-1 max-h-24 overflow-y-auto">
                      {isibo.members.slice(0, 3).map((member) => (
                        <div key={member.id} className="text-xs text-gray-600 flex items-center">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                          {member.names}
                        </div>
                      ))}
                      {isibo.members.length > 3 && (
                        <div className="text-xs text-gray-500">
                          +{isibo.members.length - 3} more members
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {canManageIsibos && (
                  <div className="flex items-center space-x-2 pt-2 border-t">
                    <UpdateIsiboDialog 
                      isibo={isibo}
                      onIsiboUpdated={fetchIsibos}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteIsibo(isibo.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <IconTrash className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
