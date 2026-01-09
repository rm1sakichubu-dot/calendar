import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { fetchAssignmentsForWeek, fetchNotifications, fetchSites, fetchUsers } from "@/lib/data";
import { WeekView } from "@/components/WeekView";

export default async function Home({
  searchParams
}: {
  searchParams: { week?: string };
}) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const weekDate = searchParams.week ? new Date(searchParams.week) : new Date();

  const [users, sites, assignments, notifications] = await Promise.all([
    fetchUsers(),
    fetchSites(),
    fetchAssignmentsForWeek(weekDate),
    fetchNotifications(session.userId)
  ]);

  return (
    <WeekView
      currentUser={session}
      weekDate={weekDate.toISOString()}
      users={users}
      sites={sites}
      assignments={assignments}
      notifications={notifications}
    />
  );
}
