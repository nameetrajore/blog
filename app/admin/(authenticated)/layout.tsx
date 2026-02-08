import { AdminNav } from "@/components/admin/admin-nav";

export default function AuthenticatedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AdminNav />
      <main>{children}</main>
    </>
  );
}
