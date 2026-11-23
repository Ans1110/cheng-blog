import { redirect } from "next/navigation";

/** Categories are managed as a tab of admin Notes now. */
export default function AdminCategoriesPage() {
  redirect("/admin/notes?tab=categories");
}
