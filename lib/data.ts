import { startOfWeek, endOfWeek } from "date-fns";
import { supabaseServer } from "@/lib/supabase";
import { Assignment, AuditLog, Notification, Site, User } from "@/lib/types";

export async function fetchUsers() {
  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from("users")
    .select("id, display_name, color, role, is_active")
    .eq("is_active", true)
    .order("created_at");
  if (error) throw error;
  return data as User[];
}

export async function fetchSites() {
  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from("sites")
    .select("id, name, address, map_url")
    .order("name");
  if (error) throw error;
  return data as Site[];
}

export async function fetchAssignmentsForWeek(date: Date) {
  const supabase = supabaseServer();
  const weekStart = startOfWeek(date, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(date, { weekStartsOn: 1 });
  const { data, error } = await supabase
    .from("assignments")
    .select(
      "id, user_id, site_id, title, start_at, end_at, meeting_time, is_direct_go, is_direct_return, note, created_by, updated_by, site:sites(id, name, address, map_url), user:users(id, display_name, color, role, is_active)"
    )
    .gte("start_at", weekStart.toISOString())
    .lte("end_at", weekEnd.toISOString())
    .order("start_at");
  if (error) throw error;
  return data as Assignment[];
}

export async function fetchAssignmentById(id: string) {
  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from("assignments")
    .select(
      "id, user_id, site_id, title, start_at, end_at, meeting_time, is_direct_go, is_direct_return, note, created_by, updated_by, site:sites(id, name, address, map_url), user:users(id, display_name, color, role, is_active)"
    )
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as Assignment;
}

export async function fetchAuditLogs(entityId: string) {
  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from("audit_logs")
    .select("id, entity_type, entity_id, action, before, after, actor_user_id, created_at, actor:users(id, display_name, color, role, is_active)")
    .eq("entity_id", entityId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as AuditLog[];
}

export async function fetchNotifications(userId: string) {
  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from("notifications")
    .select("id, user_id, type, payload, is_read, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);
  if (error) throw error;
  return data as Notification[];
}
