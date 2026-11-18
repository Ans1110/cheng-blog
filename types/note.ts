export interface Note {
  id: number;
  slug: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  pdfUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateNote {
  slug: string;
  title: string;
  content: string;
  category: string;
  tags?: string[];
  pdfUrl?: string | null;
}

export interface UpdateNote {
  slug?: string;
  title?: string;
  content?: string;
  category?: string;
  tags?: string[];
  pdfUrl?: string | null;
}
