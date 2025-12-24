export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface SearchResult {
  posts: Array<{
    id: number;
    slug: string;
    title: string;
    excerpt: string | null;
    tags: string[] | null;
    published: boolean | null;
  }>;
  notes: Array<{
    id: number;
    slug: string;
    title: string;
    category: string;
  }>;
}
