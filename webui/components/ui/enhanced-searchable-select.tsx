"use client";

import * as React from "react";
import { Check, ChevronDown, Search, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface SearchableSelectOption<T = any> {
  value: string;
  label: string;
  data?: T;
}

interface EnhancedSearchableSelectProps<T = any> {
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  className?: string;
  disabled?: boolean;
  size?: "sm" | "default" | "lg";
  // Async search support
  onSearch: (query: string) => Promise<SearchableSelectOption<T>[]>;
  onSelect: (option: SearchableSelectOption<T>) => void;
  onClear: () => void;
  value?: SearchableSelectOption<T> | null;
  searchDelay?: number;
}

export function EnhancedSearchableSelect<T = any>({
  placeholder = "Select option...",
  searchPlaceholder = "Search...",
  emptyMessage = "No options found.",
  className,
  disabled = false,
  size = "default",
  onSearch,
  onSelect,
  onClear,
  value,
  searchDelay = 300,
}: EnhancedSearchableSelectProps<T>) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");
  const [searchResults, setSearchResults] = React.useState<SearchableSelectOption<T>[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);
  const [highlightedIndex, setHighlightedIndex] = React.useState(-1);
  const searchTimeoutRef = React.useRef<NodeJS.Timeout>();
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Handle async search with debouncing
  React.useEffect(() => {
    if (!searchValue.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const results = await onSearch(searchValue);
        setSearchResults(results);
        setHighlightedIndex(-1);
      } catch (error) {
        console.error("Search error:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, searchDelay);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchValue, onSearch, searchDelay]);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < searchResults.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : searchResults.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && searchResults[highlightedIndex]) {
          handleSelect(searchResults[highlightedIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setOpen(false);
        break;
    }
  };

  const handleSelect = (option: SearchableSelectOption<T>) => {
    onSelect(option);
    setOpen(false);
    setSearchValue("");
    setSearchResults([]);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClear();
    setSearchValue("");
    setSearchResults([]);
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
    <div className={cn("relative w-full max-w-sm", className)} ref={dropdownRef}>
      {/* Trigger button */}
      <Button
        type="button"
        variant="outline"
        role="combobox"
        aria-expanded={open}
        className={cn("w-full justify-start text-left font-normal", getSizeClasses())}
        disabled={disabled}
        onClick={() => setOpen(!open)}
        onKeyDown={handleKeyDown}
      >
        <span className="flex-1 truncate">
          {value ? value.label : placeholder}
        </span>
        <div className="flex items-center gap-1">
          {value && (
            <X 
              className="h-4 w-4 opacity-50 hover:opacity-100 transition-opacity" 
              onClick={handleClear}
            />
          )}
          <ChevronDown className={cn("h-4 w-4 opacity-50 transition-transform", open && "rotate-180")} />
        </div>
      </Button>

      {/* Dropdown content */}
      {open && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-hidden">
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
                onKeyDown={handleKeyDown}
              />
              {isSearching && (
                <Loader2 className="ml-2 h-4 w-4 animate-spin opacity-50" />
              )}
            </div>

            {/* Options list */}
            <div className="max-h-48 overflow-y-auto">
              {isSearching ? (
                <div className="flex items-center justify-center py-4 text-sm text-muted-foreground">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </div>
              ) : searchResults.length > 0 ? (
                searchResults.map((option, index) => (
                  <button
                    key={option.value}
                    className={cn(
                      "w-full flex items-center px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer text-left",
                      index === highlightedIndex && "bg-gray-100",
                      value?.value === option.value && "bg-blue-50 text-blue-600"
                    )}
                    onClick={() => handleSelect(option)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value?.value === option.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span className="truncate">{option.label}</span>
                  </button>
                ))
              ) : searchValue.trim() ? (
                <div className="px-3 py-4 text-sm text-muted-foreground text-center">
                  {emptyMessage}
                </div>
              ) : (
                <div className="px-3 py-4 text-sm text-muted-foreground text-center">
                  Start typing to search...
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
