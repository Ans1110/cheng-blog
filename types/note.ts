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
  /** ISO time; only sent when changed by hand in admin. */
  createdAt?: string;
}

export interface UpdateNote {
  slug?: string;
  title?: string;
  content?: string;
  category?: string;
  tags?: string[];
  pdfUrl?: string | null;
  /** ISO time; only sent when changed by hand in admin. */
  createdAt?: string;
}
