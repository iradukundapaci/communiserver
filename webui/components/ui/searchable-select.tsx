"use client";

import * as React from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface SearchableSelectOption {
  value: string;
  label: string;
  searchTerms?: string[]; // Additional terms to search by
}

interface SearchableSelectProps {
  options?: SearchableSelectOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  // Async search support
  onSearch?: (query: string) => Promise<SearchableSelectOption[]>;
  searchDelay?: number;
  size?: "sm" | "default" | "lg";
}

export function SearchableSelect({
  options = [],
  value,
  onValueChange,
  placeholder = "Select option...",
  searchPlaceholder = "Search...",
  emptyMessage = "No options found.",
  className,
  disabled = false,
  loading = false,
  onSearch,
  searchDelay = 300,
  size = "default",
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");
  const [searchResults, setSearchResults] = React.useState<SearchableSelectOption[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);

  // Handle async search
  React.useEffect(() => {
    if (!onSearch || !searchValue.trim()) {
      setSearchResults([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        setIsSearching(true);
        const results = await onSearch(searchValue.trim());
        setSearchResults(results);
      } catch (error) {
        console.error("Search error:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, searchDelay);

    return () => clearTimeout(timeoutId);
  }, [searchValue, onSearch, searchDelay]);

  // Filter options based on search (for static options)
  const filteredOptions = React.useMemo(() => {
    if (onSearch) {
      // Use search results for async search
      return searchValue.trim() ? searchResults : options;
    }

    // Use local filtering for static options
    if (!searchValue) return options;

    const searchLower = searchValue.toLowerCase();
    return options.filter((option) => {
      // Search in label
      if (option.label.toLowerCase().includes(searchLower)) {
        return true;
      }

      // Search in additional search terms
      if (option.searchTerms) {
        return option.searchTerms.some(term =>
          term.toLowerCase().includes(searchLower)
        );
      }

      return false;
    });
  }, [options, searchValue, searchResults, onSearch]);

  // Find selected option
  const selectedOption = options.find((option) => option.value === value);

  const handleSelect = (selectedValue: string) => {
    if (selectedValue === value) {
      onValueChange?.("");
    } else {
      onValueChange?.(selectedValue);
    }
    setOpen(false);
    setSearchValue("");
  };

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "h-8 text-xs px-2";
      case "lg":
        return "h-11 text-base px-4";
      default:
        return "h-9 text-sm px-3";
    }
  };

  return (
    <div className={cn("relative w-full max-w-sm", className)}>
      {/* Trigger button */}
      <Button
        variant="outline"
        role="combobox"
        aria-expanded={open}
        className={cn("w-full justify-between", getSizeClasses())}
        disabled={disabled || loading}
        onClick={() => setOpen(!open)}
      >
        <span className="truncate">
          {loading ? (
            "Loading..."
          ) : selectedOption ? (
            selectedOption.label
          ) : (
            placeholder
          )}
        </span>
        <ChevronDown className={cn("ml-2 h-4 w-4 shrink-0 opacity-50 transition-transform", open && "rotate-180")} />
      </Button>

      {/* Dropdown content */}
      {open && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
          <div className="flex flex-col">
            {/* Search input */}
            <div className="flex items-center border-b px-3 py-2">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <Input
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                autoFocus
              />
              {searchValue && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-1"
                  onClick={() => setSearchValue("")}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>

            {/* Options list */}
            <div className="max-h-60 overflow-y-auto">
              {isSearching ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-gray-400 mr-2"></div>
                    Searching...
                  </div>
                </div>
              ) : filteredOptions.length === 0 ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  {emptyMessage}
                </div>
              ) : (
                <div className="p-1">
                  {/* Clear selection option */}
                  {value && (
                    <div
                      className="flex cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm text-muted-foreground hover:bg-gray-100"
                      onClick={() => handleSelect("")}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          !value ? "opacity-100" : "opacity-0"
                        )}
                      />
                      Clear selection
                    </div>
                  )}

                  {filteredOptions.map((option) => (
                    <div
                      key={option.value}
                      className="flex cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm hover:bg-gray-100"
                      onClick={() => handleSelect(option.value)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === option.value ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <span className="truncate">{option.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Backdrop to close dropdown */}
      {open && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setOpen(false)}
        />
      )}
    </div>
  );
}
