import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { fetchSites, fetchUsers } from "@/lib/data";
import { AdminDashboard } from "@/components/AdminDashboard";

export default async function AdminPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  if (session.role !== "admin") {
    redirect("/");
  }

  const [users, sites] = await Promise.all([fetchUsers(), fetchSites()]);

  return <AdminDashboard users={users} sites={sites} />;
}
