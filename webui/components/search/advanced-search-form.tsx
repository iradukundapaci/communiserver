"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Search, Filter, Calendar, MapPin, Users, DollarSign } from "lucide-react";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";

export interface SearchFilter {
  id: string;
  label: string;
  type: 'text' | 'select' | 'multiselect' | 'date-range' | 'number-range';
  options?: { value: string; label: string }[];
  placeholder?: string;
  icon?: React.ReactNode;
}

export interface SearchFormData {
  q?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  dateRange?: DateRange;
  [key: string]: any;
}

interface AdvancedSearchFormProps {
  filters: SearchFilter[];
  onSearch: (data: SearchFormData) => void;
  onReset: () => void;
  isLoading?: boolean;
  placeholder?: string;
  showAdvanced?: boolean;
}

export function AdvancedSearchForm({
  filters,
  onSearch,
  onReset,
  isLoading = false,
  placeholder = "Search...",
  showAdvanced = true,
}: AdvancedSearchFormProps) {
  const [searchData, setSearchData] = useState<SearchFormData>({});
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const handleInputChange = (key: string, value: any) => {
    setSearchData(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSearch = () => {
    onSearch(searchData);
  };

  const handleReset = () => {
    setSearchData({});
    setActiveFilters([]);
    onReset();
  };

  const addFilter = (filterId: string) => {
    if (!activeFilters.includes(filterId)) {
      setActiveFilters(prev => [...prev, filterId]);
    }
  };

  const removeFilter = (filterId: string) => {
    setActiveFilters(prev => prev.filter(id => id !== filterId));
    setSearchData(prev => {
      const newData = { ...prev };
      delete newData[filterId];
      return newData;
    });
  };

  const getFilterIcon = (type: string) => {
    switch (type) {
      case 'date-range':
        return <Calendar className="h-4 w-4" />;
      case 'select':
      case 'multiselect':
        return <Filter className="h-4 w-4" />;
      default:
        return <Search className="h-4 w-4" />;
    }
  };

  const renderFilter = (filter: SearchFilter) => {
    const value = searchData[filter.id];

    switch (filter.type) {
      case 'text':
        return (
          <Input
            placeholder={filter.placeholder}
            value={value || ''}
            onChange={(e) => handleInputChange(filter.id, e.target.value)}
          />
        );

      case 'select':
        return (
          <Select value={value || ''} onValueChange={(val) => handleInputChange(filter.id, val)}>
            <SelectTrigger>
              <SelectValue placeholder={filter.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {filter.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'multiselect':
        return (
          <div className="space-y-2">
            <Select onValueChange={(val) => {
              const currentValues = value || [];
              if (!currentValues.includes(val)) {
                handleInputChange(filter.id, [...currentValues, val]);
              }
            }}>
              <SelectTrigger>
                <SelectValue placeholder={filter.placeholder} />
              </SelectTrigger>
              <SelectContent>
                {filter.options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {value && value.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {value.map((val: string) => (
                  <Badge key={val} variant="secondary" className="text-xs">
                    {filter.options?.find(opt => opt.value === val)?.label || val}
                    <X
                      className="h-3 w-3 ml-1 cursor-pointer"
                      onClick={() => {
                        const newValues = value.filter((v: string) => v !== val);
                        handleInputChange(filter.id, newValues.length > 0 ? newValues : undefined);
                      }}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>
        );

      case 'date-range':
        return (
          <DatePickerWithRange
            date={value}
            onDateChange={(dateRange) => handleInputChange(filter.id, dateRange)}
          />
        );

      case 'number-range':
        return (
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={value?.min || ''}
              onChange={(e) => handleInputChange(filter.id, {
                ...value,
                min: e.target.value ? Number(e.target.value) : undefined
              })}
            />
            <Input
              type="number"
              placeholder="Max"
              value={value?.max || ''}
              onChange={(e) => handleInputChange(filter.id, {
                ...value,
                max: e.target.value ? Number(e.target.value) : undefined
              })}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Advanced Search
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main search input */}
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              placeholder={placeholder}
              value={searchData.q || ''}
              onChange={(e) => handleInputChange('q', e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button onClick={handleSearch} disabled={isLoading}>
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
          <Button variant="outline" onClick={handleReset}>
            Reset
          </Button>
        </div>

        {/* Advanced filters toggle */}
        {showAdvanced && (
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Advanced Filters
            </Button>
            {activeFilters.length > 0 && (
              <Badge variant="secondary">
                {activeFilters.length} filter{activeFilters.length !== 1 ? 's' : ''} active
              </Badge>
            )}
          </div>
        )}

        {/* Advanced filters */}
        {showAdvancedFilters && (
          <div className="space-y-4 border-t pt-4">
            {/* Add filter dropdown */}
            <div>
              <Label>Add Filter</Label>
              <Select onValueChange={addFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a filter to add" />
                </SelectTrigger>
                <SelectContent>
                  {filters
                    .filter(filter => !activeFilters.includes(filter.id))
                    .map((filter) => (
                      <SelectItem key={filter.id} value={filter.id}>
                        <div className="flex items-center gap-2">
                          {filter.icon || getFilterIcon(filter.type)}
                          {filter.label}
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Active filters */}
            {activeFilters.map((filterId) => {
              const filter = filters.find(f => f.id === filterId);
              if (!filter) return null;

              return (
                <div key={filterId} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      {filter.icon || getFilterIcon(filter.type)}
                      {filter.label}
                    </Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFilter(filterId)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  {renderFilter(filter)}
                </div>
              );
            })}

            {/* Sorting */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Sort By</Label>
                <Select
                  value={searchData.sortBy || ''}
                  onValueChange={(val) => handleInputChange('sortBy', val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt">Created Date</SelectItem>
                    <SelectItem value="updatedAt">Updated Date</SelectItem>
                    <SelectItem value="title">Title</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Sort Order</Label>
                <Select
                  value={searchData.sortOrder || 'DESC'}
                  onValueChange={(val) => handleInputChange('sortOrder', val)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DESC">Newest First</SelectItem>
                    <SelectItem value="ASC">Oldest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
