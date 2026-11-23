"use client";

import { format, isValid, parse } from "date-fns";
import { CalendarIcon, X } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Calendar } from "./calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";

const DATE = "yyyy-MM-dd";
const DATE_TIME = "yyyy-MM-dd'T'HH:mm";

const parseOr = (value: string, pattern: string) => {
  const d = value ? parse(value, pattern, new Date()) : null;
  return d && isValid(d) ? d : undefined;
};

const triggerClass =
  "w-full justify-start gap-2 px-3 font-normal data-[empty=true]:text-muted-foreground";

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

/** Date field with a calendar popover. Value is "yyyy-MM-dd" (or "" when empty). */
export function DatePicker({
  id,
  value,
  onChange,
  placeholder = "Pick a date",
  className,
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const date = parseOr(value, DATE);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          data-empty={!date}
          className={cn(triggerClass, className)}
        >
          <CalendarIcon className="size-4 opacity-60" />
          {date ? format(date, "MMM d, yyyy") : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto">
        <Calendar
          mode="single"
          selected={date}
          defaultMonth={date}
          onSelect={(d) => {
            if (!d) return;
            onChange(format(d, DATE));
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

/**
 * Date + time field: a calendar and hour / minute selects in one popover.
 * Value is "yyyy-MM-ddTHH:mm" in local time (or "" when empty).
 */
export function DateTimePicker({
  id,
  value,
  onChange,
  placeholder = "Pick a date and time",
  clearable = false,
  className,
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  clearable?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const current = parseOr(value, DATE_TIME);

  const update = (next: { day?: Date; hour?: string; minute?: string }) => {
    const base = next.day ?? current ?? new Date();
    const d = new Date(base);
    d.setHours(Number(next.hour ?? format(current ?? base, "HH")));
    d.setMinutes(Number(next.minute ?? format(current ?? base, "mm")), 0, 0);
    onChange(format(d, DATE_TIME));
  };

  return (
    <div className={cn("flex gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button id={id} type="button" variant="outline" data-empty={!current} className={cn(triggerClass, "flex-1")}>
            <CalendarIcon className="size-4 opacity-60" />
            {current ? format(current, "MMM d, yyyy · HH:mm") : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto space-y-3">
          <Calendar
            mode="single"
            selected={current}
            defaultMonth={current}
            onSelect={(d) => d && update({ day: d })}
          />
          <div className="flex items-center gap-2 border-t pt-3">
            <span className="text-sm text-muted-foreground">Time</span>
            <Select value={current ? format(current, "HH") : undefined} onValueChange={(hour) => update({ hour })}>
              <SelectTrigger size="sm" className="w-18" aria-label="Hour">
                <SelectValue placeholder="HH" />
              </SelectTrigger>
              <SelectContent position="popper" className="max-h-60">
                {HOURS.map((h) => (
                  <SelectItem key={h} value={h}>
                    {h}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-muted-foreground">:</span>
            <Select value={current ? format(current, "mm") : undefined} onValueChange={(minute) => update({ minute })}>
              <SelectTrigger size="sm" className="w-18" aria-label="Minute">
                <SelectValue placeholder="MM" />
              </SelectTrigger>
              <SelectContent position="popper" className="max-h-60">
                {MINUTES.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="button" size="sm" className="ml-auto" onClick={() => setOpen(false)}>
              Done
            </Button>
          </div>
        </PopoverContent>
      </Popover>
      {clearable && current && (
        <Button type="button" variant="ghost" size="icon" aria-label="Clear" onClick={() => onChange("")}>
          <X className="size-4" />
        </Button>
      )}
    </div>
  );
}
