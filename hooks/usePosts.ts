import { ApiResponse } from "@/types/api";
import { CreatePost, Post, UpdatePost } from "@/types/post";
import {
  useMutation,
  UseMutationResult,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";

const API_URL = "/api/posts";

const fetchPosts = async (params?: {
  tag?: string;
  published?: boolean;
}): Promise<Post[]> => {
  const searchParams = new URLSearchParams();
  if (params?.tag) searchParams.set("tag", params.tag);
  if (params?.published)
    searchParams.set("published", params.published.toString());
  const url = searchParams.toString()
    ? `${API_URL}?${searchParams.toString()}`
    : API_URL;

  const res = await fetch(url);
  const data: ApiResponse<Post[]> = await res.json();

  if (!data.success) {
    throw new Error(data.error || "Failed to fetch posts");
  }

  return data.data || [];
};

const fetchPostBySlug = async (slug: string): Promise<Post> => {
  const res = await fetch(`${API_URL}/${slug}`);
  const data: ApiResponse<Post> = await res.json();

  if (!data.success || !data.data) {
    throw new Error(data.error || "Failed to fetch post");
  }

  return data.data;
};

const createPost = async (data: CreatePost): Promise<number> => {
  const res = await fetch(API_URL, {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  });
  const response: ApiResponse<{ id: number }> = await res.json();

  if (!response.success || !response.data) {
    throw new Error(response.error || "Failed to create post");
  }

  return response.data.id;
};

const updatePost = async (id: number, data: UpdatePost) => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  });
  const response: ApiResponse<void> = await res.json();

  if (!response.success) {
    throw new Error(response.error || "Failed to update post");
  }
};

const deletePost = async (id: number) => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });
  const response: ApiResponse<void> = await res.json();

  if (!response.success) {
    throw new Error(response.error || "Failed to delete post");
  }
};

const usePosts = (params?: {
  tag?: string;
  published?: boolean;
}): UseQueryResult<Post[], Error> => {
  return useQuery({
    queryKey: ["posts", params],
    queryFn: () => fetchPosts(params),
  });
};

const usePostBySlug = (slug: string): UseQueryResult<Post, Error> => {
  return useQuery({
    queryKey: ["post", slug],
    queryFn: () => fetchPostBySlug(slug),
    enabled: !!slug,
  });
};

const useCreatePost = (): UseMutationResult<number, Error, CreatePost> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
};

const useUpdatePost = (): UseMutationResult<
  void,
  Error,
  { id: number; data: UpdatePost }
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePost }) =>
      updatePost(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
};

const useDeletePost = (): UseMutationResult<void, Error, number> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
};

export { usePosts, usePostBySlug, useCreatePost, useUpdatePost, useDeletePost };
