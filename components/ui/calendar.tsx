"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import * as React from "react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";

/** Month grid styled to match the admin inputs. */
function Calendar({ className, classNames, ...props }: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays
      className={cn("text-sm", className)}
      classNames={{
        months: "relative flex flex-col gap-4",
        month: "space-y-3",
        month_caption: "flex h-8 items-center justify-center",
        caption_label: "text-sm font-medium",
        nav: "absolute inset-x-0 top-0 flex h-8 items-center justify-between",
        button_previous:
          "inline-flex size-8 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground disabled:opacity-40",
        button_next:
          "inline-flex size-8 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground disabled:opacity-40",
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday: "w-9 text-center text-[0.75rem] font-normal text-muted-foreground",
        week: "mt-1 flex w-full",
        day: "size-9 p-0 text-center",
        day_button:
          "inline-flex size-9 items-center justify-center rounded-md font-normal outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring",
        selected:
          "[&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:hover:bg-primary [&>button]:hover:text-primary-foreground",
        today: "[&>button]:font-semibold [&>button]:underline [&>button]:underline-offset-4",
        outside: "text-muted-foreground opacity-50",
        disabled: "text-muted-foreground opacity-40",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) =>
          orientation === "left" ? <ChevronLeft className="size-4" /> : <ChevronRight className="size-4" />,
      }}
      {...props}
    />
  );
}

export { Calendar };
