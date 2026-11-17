export interface BoardMessage {
  id: number;
  content: string;
  imageUrl: string | null;
  createdAt: string;
}

export interface BoardPage {
  items: BoardMessage[];
  nextCursor: number | null;
}
