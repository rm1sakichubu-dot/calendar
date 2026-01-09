import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { fetchAssignmentById, fetchAuditLogs } from "@/lib/data";
import { AssignmentDetail } from "@/components/AssignmentDetail";

export default async function AssignmentPage({
  params
}: {
  params: { id: string };
}) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const assignment = await fetchAssignmentById(params.id);
  const auditLogs = await fetchAuditLogs(params.id);

  return <AssignmentDetail assignment={assignment} auditLogs={auditLogs} />;
}
