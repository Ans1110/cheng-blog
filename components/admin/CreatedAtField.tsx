"use client";

import { format } from "date-fns";
import { DateTimePicker } from "../ui/date-picker";
import { Label } from "../ui/label";

/** "yyyy-MM-ddTHH:mm" in the browser's time zone, the DateTimePicker value format. */
export const toLocalInput = (value?: Date | string | null) =>
  value ? format(new Date(value), "yyyy-MM-dd'T'HH:mm") : "";

/**
 * Upload time for a post or note. Left empty on a new item it means "now";
 * the editors only send it when it differs from what was loaded, so saving
 * without touching it never shifts the stored time.
 */
export function CreatedAtField({
  value,
  onChange,
  isNew,
}: {
  value: string;
  onChange: (v: string) => void;
  isNew: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor="created-at">Upload time</Label>
      <DateTimePicker
        id="created-at"
        value={value}
        onChange={onChange}
        placeholder={isNew ? "Now (when you publish)" : "Pick a date and time"}
        clearable={isNew}
      />
      <p className="text-xs text-muted-foreground">
        {isNew ? "Leave empty to use the time you publish." : "Shown on the site and used for sorting."}
      </p>
    </div>
  );
}
