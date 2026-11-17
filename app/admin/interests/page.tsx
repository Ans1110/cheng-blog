"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateInterest, useDeleteInterest, useInterests } from "@/hooks/useInterests";
import { Loader2, Plus, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminInterestsPage() {
  const { data: interests, isLoading } = useInterests();
  const createInterest = useCreateInterest();
  const deleteInterest = useDeleteInterest();
  const [name, setName] = useState("");

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    try {
      await createInterest.mutateAsync(trimmed);
      setName("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add interest");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteInterest.mutateAsync(id);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete interest");
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          Interests
        </h1>
        <p className="text-lg text-muted-foreground">
          Tags shown as bubbles on the About page
        </p>
      </div>

      <form onSubmit={handleAdd} className="flex gap-2 max-w-md">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Add an interest, e.g. kpop"
          maxLength={50}
        />
        <Button type="submit" disabled={!name.trim() || createInterest.isPending}>
          {createInterest.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Plus className="size-4" />
          )}
          Add
        </Button>
      </form>

      {isLoading ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Loading interests...
        </div>
      ) : !interests || interests.length === 0 ? (
        <p className="text-muted-foreground">No interests yet. Add your first one above.</p>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {interests.map((interest) => (
            <li
              key={interest.id}
              className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-muted/40 pl-3.5 pr-1 py-1 text-sm font-medium"
            >
              {interest.name}
              <button
                type="button"
                onClick={() => handleDelete(interest.id)}
                disabled={deleteInterest.isPending}
                aria-label={`Remove ${interest.name}`}
                className="size-6 rounded-full flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              >
                <X className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
