export type FilmKind = "movie" | "series" | "anime" | "documentary";

export interface FilmReview {
  id: number;
  title: string;
  /** Original-language title, shown under the main one when different. */
  originalTitle?: string | null;
  year: number;
  kind: FilmKind;
  /** 0–5, half steps allowed (e.g. 3.5). */
  rating: number;
  genres: string[];
  posterUrl?: string | null;
  /** One-line verdict shown on the card. */
  verdict: string;
  /** Full review (Markdown), shown in the modal. */
  review: string;
  /** YYYY-MM-DD */
  watchedAt: string;
  /** 1–5 when picked for the Top 5 section, otherwise null. */
  topRank?: number | null;
  createdAt?: string;
  updatedAt?: string;
}
