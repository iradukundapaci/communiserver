"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EnhancedSearchableSelect } from "@/components/ui/enhanced-searchable-select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IconFilter, IconX, IconSearch, IconMapPin } from "@tabler/icons-react";
import { useState, useEffect } from "react";
import { Cell, searchCells, Sector } from "@/lib/api/cells";
import { searchVillages, Village } from "@/lib/api/villages";
import { searchSectors } from "@/lib/api/sectors";

export interface ActivityFilterState {
  q?: string;
  villageId?: string;
  cellId?: string;
  sectorId?: string;
  dateFrom?: string;
  dateTo?: string;
}

interface ActivityFiltersProps {
  filters: ActivityFilterState;
  onFiltersChange: (filters: ActivityFilterState) => void;
  onApplyFilters: () => void;
  className?: string;
}

export function ActivityFilters({ 
  filters, 
  onFiltersChange, 
  onApplyFilters,
  className = "" 
}: ActivityFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedVillage, setSelectedVillage] = useState<Village | null>(null);
  const [selectedCell, setSelectedCell] = useState<Cell | null>(null);
  const [selectedSector, setSector] = useState<Sector | null>(null);

  // Update local state when filters change externally
  useEffect(() => {
    if (!filters.villageId) setSelectedVillage(null);
    if (!filters.cellId) setSelectedCell(null);
    if (!filters.sectorId) setSector(null);
  }, [filters]);

  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, q: value || undefined });
  };

  const handleDateFromChange = (value: string) => {
    onFiltersChange({ ...filters, dateFrom: value || undefined });
  };

  const handleDateToChange = (value: string) => {
    onFiltersChange({ ...filters, dateTo: value || undefined });
  };

  const handleStatusChange = (status: string) => {
    onFiltersChange({ ...filters, status: status || undefined });
  };

  const handleTypeChange = (type: string) => {
    onFiltersChange({ ...filters, type: type || undefined });
  };

  const handleVillageSelect = (village: Village | null) => {
    setSelectedVillage(village);
    onFiltersChange({
      ...filters,
      villageId: village?.id,
      cellId: village?.cell?.id,
      sectorId: undefined // Village data doesn't include sector info
    });

    if (village?.cell) {
      // Convert village.cell to Cell type
      const cellData: Cell = {
        id: village.cell.id,
        name: village.cell.name,
        hasLeader: false,
        leaderId: null,
      };
      setSelectedCell(cellData);
      // Clear sector since village data doesn't include sector info
      setSector(null);
    }
  };

  const handleCellSelect = (cell: Cell | null) => {
    setSelectedCell(cell);
    setSelectedVillage(null); // Clear village when cell changes
    onFiltersChange({ 
      ...filters, 
      villageId: undefined,
      cellId: cell?.id,
      sectorId: cell?.sector?.id
    });
    
    if (cell?.sector) {
      setSector(cell.sector);
    }
  };

  const handleSectorSelect = (sector: Sector | null) => {
    setSector(sector);
    setSelectedCell(null); // Clear cell when sector changes
    setSelectedVillage(null); // Clear village when sector changes
    onFiltersChange({ 
      ...filters, 
      villageId: undefined,
      cellId: undefined,
      sectorId: sector?.id
    });
  };

  const clearAllFilters = () => {
    setSelectedVillage(null);
    setSelectedCell(null);
    setSector(null);
    onFiltersChange({});
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

  const handleCellSearch = async (query: string) => {
    try {
      const cells = await searchCells(query);
      return cells.map(cell => ({
        value: cell.id,
        label: `${cell.name} (${cell.sector?.name})`,
        data: cell,
      }));
    } catch (error) {
      console.error("Cell search error:", error);
      return [];
    }
  };

  const handleSectorSearch = async (query: string) => {
    try {
      const sectors = await searchSectors(query);
      return sectors.map(sector => ({
        value: sector.id,
        label: `${sector.name} (${sector.district?.name})`,
        data: sector,
      }));
    } catch (error) {
      console.error("Sector search error:", error);
      return [];
    }
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.q) count++;
    if (filters.villageId) count++;
    if (filters.cellId && !filters.villageId) count++;
    if (filters.sectorId && !filters.cellId && !filters.villageId) count++;
    if (filters.dateFrom) count++;
    if (filters.dateTo) count++;
    if (filters.status) count++;
    if (filters.type) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CardTitle className="text-lg flex items-center">
              <IconFilter className="h-5 w-5 mr-2" />
              Filters
            </CardTitle>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary">{activeFiltersCount}</Badge>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-red-600 hover:text-red-700"
              >
                <IconX className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? "Collapse" : "Expand"}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Always visible - Search */}
        <div className="flex items-center gap-2 w-1/3 mb-4">
          <div className="flex-1">
            <Label htmlFor="search">Search Activities</Label>
            <div className="flex gap-2 mt-1">
              <div className="relative flex-1">
                <IconSearch className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by title or description..."
                  value={filters.q || ""}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
              <Button onClick={onApplyFilters} size="default" className="shrink-0">
                Apply Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Expandable filters */}
        {isExpanded && (
          <>
            {/* Location Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="max-w-sm">
                <Label>Sector</Label>
                <EnhancedSearchableSelect
                  placeholder="Search sectors..."
                  onSearch={handleSectorSearch}
                  onSelect={(option) => handleSectorSelect(option.data)}
                  onClear={() => handleSectorSelect(null)}
                  value={selectedSector ? {
                    value: selectedSector.id,
                    label: `${selectedSector.name} (${selectedSector.district?.name})`,
                    data: selectedSector,
                  } : null}
                  className="w-full"
                />
              </div>

              <div className="max-w-sm">
                <Label>Cell</Label>
                <EnhancedSearchableSelect
                  placeholder="Search cells..."
                  onSearch={handleCellSearch}
                  onSelect={(option) => handleCellSelect(option.data)}
                  onClear={() => handleCellSelect(null)}
                  value={selectedCell ? {
                    value: selectedCell.id,
                    label: `${selectedCell.name} (${selectedCell.sector?.name})`,
                    data: selectedCell,
                  } : null}
                  className="w-full"
                />
              </div>

              <div className="max-w-sm">
                <Label>Village</Label>
                <EnhancedSearchableSelect
                  placeholder="Search villages..."
                  onSearch={handleVillageSearch}
                  onSelect={(option) => handleVillageSelect(option.data)}
                  onClear={() => handleVillageSelect(null)}
                  value={selectedVillage ? {
                    value: selectedVillage.id,
                    label: `${selectedVillage.name} (${selectedVillage.cell?.name})`,
                    data: selectedVillage,
                  } : null}
                  className="w-full"
                />
              </div>
            </div>

            {/* Date Range Filters */}
            <div className="space-y-3">
              <Label>Date Range</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
                <div>
                  <Label htmlFor="dateFrom" className="text-sm text-muted-foreground">From</Label>
                  <Input
                    id="dateFrom"
                    type="date"
                    value={filters.dateFrom || ""}
                    onChange={(e) => handleDateFromChange(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="dateTo" className="text-sm text-muted-foreground">To</Label>
                  <Input
                    id="dateTo"
                    type="date"
                    value={filters.dateTo || ""}
                    onChange={(e) => handleDateToChange(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
              </div>
              {(filters.dateFrom || filters.dateTo) && (
                <div className="text-sm text-muted-foreground">
                  {filters.dateFrom && filters.dateTo ? (
                    `Showing activities from ${filters.dateFrom} to ${filters.dateTo}`
                  ) : filters.dateFrom ? (
                    `Showing activities from ${filters.dateFrom} onwards`
                  ) : (
                    `Showing activities up to ${filters.dateTo}`
                  )}
                </div>
              )}
            </div>

            {/* Status and Type Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={filters.status || ""}
                  onValueChange={(value) => handleStatusChange(value)}
                >
                  <SelectTrigger className="max-w-sm">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="type">Type</Label>
                <Select
                  value={filters.type || ""}
                  onValueChange={(value) => handleTypeChange(value)}
                >
                  <SelectTrigger className="max-w-sm">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MEETING">Meeting</SelectItem>
                    <SelectItem value="TRAINING">Training</SelectItem>
                    <SelectItem value="COMMUNITY_SERVICE">Community Service</SelectItem>
                    <SelectItem value="HEALTH_CAMPAIGN">Health Campaign</SelectItem>
                    <SelectItem value="EDUCATION">Education</SelectItem>
                    <SelectItem value="INFRASTRUCTURE">Infrastructure</SelectItem>
                    <SelectItem value="AGRICULTURE">Agriculture</SelectItem>
                    <SelectItem value="ENVIRONMENT">Environment</SelectItem>
                    <SelectItem value="SOCIAL_WELFARE">Social Welfare</SelectItem>
                    <SelectItem value="ECONOMIC_DEVELOPMENT">Economic Development</SelectItem>
                    <SelectItem value="CULTURAL">Cultural</SelectItem>
                    <SelectItem value="SPORTS">Sports</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Active Filters Display */}
            {activeFiltersCount > 0 && (
              <div className="pt-2 border-t">
                <Label className="text-sm font-medium">Active Filters:</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {filters.q && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <IconSearch className="h-3 w-3" />
                      Search: {filters.q}
                      <IconX 
                        className="h-3 w-3 cursor-pointer hover:text-red-600" 
                        onClick={() => handleSearchChange("")}
                      />
                    </Badge>
                  )}
                  {selectedVillage && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <IconMapPin className="h-3 w-3" />
                      Village: {selectedVillage.name}
                      <IconX 
                        className="h-3 w-3 cursor-pointer hover:text-red-600" 
                        onClick={() => handleVillageSelect(null)}
                      />
                    </Badge>
                  )}
                  {selectedCell && !selectedVillage && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <IconMapPin className="h-3 w-3" />
                      Cell: {selectedCell.name}
                      <IconX 
                        className="h-3 w-3 cursor-pointer hover:text-red-600" 
                        onClick={() => handleCellSelect(null)}
                      />
                    </Badge>
                  )}
                  {selectedSector && !selectedCell && !selectedVillage && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <IconMapPin className="h-3 w-3" />
                      Sector: {selectedSector.name}
                      <IconX 
                        className="h-3 w-3 cursor-pointer hover:text-red-600" 
                        onClick={() => handleSectorSelect(null)}
                      />
                    </Badge>
                  )}
                  {filters.dateFrom && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      From: {filters.dateFrom}
                      <IconX 
                        className="h-3 w-3 cursor-pointer hover:text-red-600" 
                        onClick={() => handleDateFromChange("")}
                      />
                    </Badge>
                  )}
                  {filters.dateTo && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      To: {filters.dateTo}
                      <IconX
                        className="h-3 w-3 cursor-pointer hover:text-red-600"
                        onClick={() => handleDateToChange("")}
                      />
                    </Badge>
                  )}
                  {filters.status && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      Status: {filters.status}
                      <IconX
                        className="h-3 w-3 cursor-pointer hover:text-red-600"
                        onClick={() => handleStatusChange("")}
                      />
                    </Badge>
                  )}
                  {filters.type && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      Type: {filters.type}
                      <IconX
                        className="h-3 w-3 cursor-pointer hover:text-red-600"
                        onClick={() => handleTypeChange("")}
                      />
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
