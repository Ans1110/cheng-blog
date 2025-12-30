import EditProjectClient from "./client";

export const dynamic = "force-static";
export const dynamicParams = true;

export function generateStaticParams() {
  return [];
}

export default function EditProjectPage() {
  return <EditProjectClient />;
}
