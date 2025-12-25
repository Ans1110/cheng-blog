"use client";

import { ApiResponse } from "@/types/api";
import {
  CreateNoteCategory,
  NoteCategory,
  UpdateNoteCategory,
} from "@/types/category";
import {
  useMutation,
  UseMutationResult,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";

const API_URL = "/api/categories";

const fetchCategories = async (): Promise<NoteCategory[]> => {
  const res = await fetch(API_URL);
  const data: ApiResponse<NoteCategory[]> = await res.json();

  if (!data.success) {
    throw new Error(data.error || "Failed to fetch categories");
  }

  return data.data || [];
};

const fetchCategoryById = async (id: string): Promise<NoteCategory> => {
  const res = await fetch(`${API_URL}/${id}`);
  const data: ApiResponse<NoteCategory> = await res.json();

  if (!data.success || !data.data) {
    throw new Error(data.error || "Failed to fetch category");
  }

  return data.data;
};

const createCategory = async (data: CreateNoteCategory): Promise<string> => {
  const res = await fetch(API_URL, {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  });
  const response: ApiResponse<{ id: string }> = await res.json();

  if (!response.success || !response.data) {
    throw new Error(response.error || "Failed to create category");
  }

  return response.data.id;
};

const updateCategory = async ({
  id,
  data,
}: {
  id: string;
  data: UpdateNoteCategory;
}): Promise<void> => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  });
  const response: ApiResponse<void> = await res.json();

  if (!response.success) {
    throw new Error(response.error || "Failed to update category");
  }
};

const deleteCategory = async (id: string): Promise<void> => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });
  const response: ApiResponse<void> = await res.json();

  if (!response.success) {
    throw new Error(response.error || "Failed to delete category");
  }
};

const useCategories = (): UseQueryResult<NoteCategory[], Error> => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });
};

const useCategoryById = (id: string): UseQueryResult<NoteCategory, Error> => {
  return useQuery({
    queryKey: ["category", id],
    queryFn: () => fetchCategoryById(id),
    enabled: !!id,
  });
};

const useCreateCategory = (): UseMutationResult<
  string,
  Error,
  CreateNoteCategory
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};

const useUpdateCategory = (): UseMutationResult<
  void,
  Error,
  { id: string; data: UpdateNoteCategory }
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateNoteCategory }) =>
      updateCategory({ id, data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};

const useDeleteCategory = (): UseMutationResult<void, Error, string> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};

export {
  useCategories,
  useCategoryById,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
};
