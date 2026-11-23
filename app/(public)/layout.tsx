import { DesktopHint } from "@/components/layout/DesktopHint";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <DesktopHint />
    </>
  );
}
