export type UserRole = "admin" | "editor";

export type User = {
  id: string;
  display_name: string;
  color: string;
  role: UserRole;
  is_active: boolean;
};

export type Site = {
  id: string;
  name: string;
  address: string | null;
  map_url: string | null;
};

export type Assignment = {
  id: string;
  user_id: string;
  site_id: string;
  title: string;
  start_at: string;
  end_at: string;
  meeting_time: string | null;
  is_direct_go: boolean;
  is_direct_return: boolean;
  note: string | null;
  created_by: string;
  updated_by: string;
  site?: Site;
  user?: User;
};

export type AuditLog = {
  id: string;
  entity_type: string;
  entity_id: string;
  action: "create" | "update" | "delete";
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  actor_user_id: string;
  created_at: string;
  actor?: User;
};

export type Notification = {
  id: string;
  user_id: string;
  type: string;
  payload: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
};
