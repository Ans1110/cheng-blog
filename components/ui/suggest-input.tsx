"use client";

import { useId, useState } from "react";

import { cn } from "@/lib/utils";
import { Input } from "./input";
import { Popover, PopoverAnchor, PopoverContent } from "./popover";

/**
 * Free-text input with a styled suggestion list (replaces <datalist>).
 * Typing filters the suggestions; arrow keys + Enter pick one.
 */
export function SuggestInput({
  id,
  value,
  onChange,
  suggestions,
  placeholder,
  disabled,
  maxLength,
  className,
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
  className?: string;
}) {
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const q = value.trim().toLowerCase();
  const matches = suggestions.filter((s) => s.toLowerCase().includes(q) && s !== value);
  const show = open && !disabled && matches.length > 0;

  const pick = (s: string) => {
    onChange(s);
    setOpen(false);
  };

  return (
    <Popover open={show} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <Input
          id={id}
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          className={className}
          role="combobox"
          aria-expanded={show}
          aria-controls={listId}
          aria-autocomplete="list"
          autoComplete="off"
          onChange={(e) => {
            onChange(e.target.value);
            setActive(0);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onKeyDown={(e) => {
            if (!show) return;
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActive((i) => (i + 1) % matches.length);
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((i) => (i - 1 + matches.length) % matches.length);
            } else if (e.key === "Enter") {
              e.preventDefault();
              pick(matches[Math.min(active, matches.length - 1)]);
            } else if (e.key === "Escape") {
              setOpen(false);
            }
          }}
        />
      </PopoverAnchor>
      <PopoverContent
        id={listId}
        role="listbox"
        className="w-(--radix-popover-trigger-width) max-h-60 overflow-y-auto p-1"
        // Keep focus in the input while the list is open.
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        {matches.map((s, i) => (
          <button
            key={s}
            type="button"
            role="option"
            aria-selected={i === active}
            // mousedown fires before the input's blur closes the list
            onMouseDown={(e) => {
              e.preventDefault();
              pick(s);
            }}
            onMouseEnter={() => setActive(i)}
            className={cn(
              "flex w-full items-center rounded-sm px-2 py-1.5 text-left text-sm outline-none",
              i === active && "bg-accent text-accent-foreground",
            )}
          >
            {s}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}
