import { Metadata } from "next";
import { AdminLayoutClient } from "@/components/admin";

export const metadata: Metadata = {
  title: {
    default: "Admin Dashboard",
    template: "%s | Admin",
  },
  description: "Admin panel for managing blog content",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
