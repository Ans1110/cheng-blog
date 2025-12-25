"use client";

import { ApiResponse } from "@/types/api";
import { CreateNote, Note, UpdateNote } from "@/types/note";
import {
  useMutation,
  UseMutationResult,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";

const API_URL = "/api/notes";

const fetchNotes = async (category?: string): Promise<Note[]> => {
  const url = category
    ? `${API_URL}?category=${encodeURIComponent(category)}`
    : API_URL;

  const res = await fetch(url);
  const data: ApiResponse<Note[]> = await res.json();

  if (!data.success) {
    throw new Error(data.error || "Failed to fetch notes");
  }

  return data.data || [];
};

const fetchNoteBySlug = async (slug: string): Promise<Note> => {
  const res = await fetch(`${API_URL}/${slug}`);
  const data: ApiResponse<Note> = await res.json();

  if (!data.success || !data.data) {
    throw new Error(data.error || "Failed to fetch note");
  }

  return data.data;
};

const createNote = async (data: CreateNote): Promise<number> => {
  const res = await fetch(API_URL, {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  });
  const response: ApiResponse<{ id: number }> = await res.json();

  if (!response.success || !response.data) {
    throw new Error(response.error || "Failed to create note");
  }

  return response.data.id;
};

const updateNote = async ({ id, data }: { id: number; data: UpdateNote }) => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  });
  const response: ApiResponse<void> = await res.json();

  if (!response.success) {
    throw new Error(response.error || "Failed to update note");
  }
};

const deleteNote = async (id: number): Promise<void> => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });
  const response: ApiResponse<void> = await res.json();

  if (!response.success) {
    throw new Error(response.error || "Failed to delete note");
  }
};

const useNotes = (category?: string): UseQueryResult<Note[], Error> => {
  return useQuery({
    queryKey: ["notes", category],
    queryFn: () => fetchNotes(category),
  });
};

const useNoteBySlug = (slug: string): UseQueryResult<Note, Error> => {
  return useQuery({
    queryKey: ["note", slug],
    queryFn: () => fetchNoteBySlug(slug),
    enabled: !!slug,
  });
};

const useCreateNote = (): UseMutationResult<number, Error, CreateNote> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};

const useUpdateNote = (): UseMutationResult<
  void,
  Error,
  { id: number; data: UpdateNote }
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateNote }) =>
      updateNote({ id, data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};

const useDeleteNote = (): UseMutationResult<void, Error, number> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};

export { useNotes, useNoteBySlug, useCreateNote, useUpdateNote, useDeleteNote };
