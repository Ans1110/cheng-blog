export interface Post {
  id: number;
  slug: string;
  title: string;
  content: string;
  excerpt: string | null;
  tags: string[];
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePost {
  slug: string;
  title: string;
  content: string;
  excerpt?: string | null;
  tags?: string[];
  published?: boolean;
}

export interface UpdatePost {
  slug?: string;
  title?: string;
  content?: string;
  excerpt?: string | null;
  tags?: string[];
  published?: boolean;
}
