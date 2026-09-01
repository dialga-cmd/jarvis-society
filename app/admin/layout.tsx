import { redirect } from "next/navigation";
import { getAdminIdentity } from "@/lib/admin-guard";
import { AdminShell } from "@/components/admin/AdminShell";

export const dynamic = "force-dynamic";

// Server-side gate for every /admin/* page. Middleware-equivalent: validates
// the session from cookies, then checks the email against the `admins` table.
// Not an admin -> straight back to /login.
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const identity = await getAdminIdentity();
  if (!identity) redirect("/login");
  return <AdminShell>{children}</AdminShell>;
}