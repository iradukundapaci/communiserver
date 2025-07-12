"use client";

import * as React from "react";
import { CalendarIcon, X } from "lucide-react";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";

interface DatePickerWithRangeProps {
  date?: DateRange;
  onDateChange?: (date: DateRange | undefined) => void;
  className?: string;
  placeholder?: string;
  allowClear?: boolean;
  size?: "sm" | "default" | "lg";
}

export function DatePickerWithRange({
  date,
  onDateChange,
  className,
  placeholder = "Pick a date range",
  allowClear = true,
  size = "default",
}: DatePickerWithRangeProps) {
  const [open, setOpen] = React.useState(false);

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDateChange?.(undefined);
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
    <div className={cn("grid gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full max-w-sm justify-start text-left font-normal",
              getSizeClasses(),
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
            <span className="flex-1 truncate">
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "MMM dd, y")} -{" "}
                    {format(date.to, "MMM dd, y")}
                  </>
                ) : (
                  format(date.from, "MMM dd, y")
                )
              ) : (
                placeholder
              )}
            </span>
            {allowClear && date?.from && (
              <X
                className="ml-2 h-4 w-4 flex-shrink-0 opacity-50 hover:opacity-100 transition-opacity"
                onClick={handleClear}
              />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-3 border-b">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">Select Date Range</h4>
              {allowClear && date?.from && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    onDateChange?.(undefined);
                    setOpen(false);
                  }}
                  className="h-6 px-2 text-xs"
                >
                  Clear
                </Button>
              )}
            </div>
          </div>
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={(range) => {
              onDateChange?.(range);
              // Close popover when both dates are selected
              if (range?.from && range?.to) {
                setOpen(false);
              }
            }}
            numberOfMonths={2}
            className="p-3"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
