"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { addDays, formatISO, isSameDay, parseISO, startOfWeek } from "date-fns";
import { formatDateLabel, formatTime, getWeekDays } from "@/lib/dates";
import { Assignment, Notification, Site, User } from "@/lib/types";
import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";

const badgeMap = {
  go: "bg-emerald-100 text-emerald-700",
  return: "bg-amber-100 text-amber-700",
  meeting: "bg-blue-100 text-blue-700"
};

type WeekViewProps = {
  currentUser: { userId: string; role: "admin" | "editor"; displayName: string };
  weekDate: string;
  users: User[];
  sites: Site[];
  assignments: Assignment[];
  notifications: Notification[];
};

export function WeekView({
  currentUser,
  weekDate,
  users,
  sites,
  assignments,
  notifications
}: WeekViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date(weekDate));
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Assignment | null>(null);
  const [filterUser, setFilterUser] = useState<string>("");
  const [filterSite, setFilterSite] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);

  const weekDays = useMemo(() => getWeekDays(selectedDate), [selectedDate]);

  const filteredAssignments = useMemo(() => {
    return assignments.filter((assignment) => {
      if (filterUser && assignment.user_id !== filterUser) return false;
      if (filterSite && assignment.site_id !== filterSite) return false;
      return true;
    });
  }, [assignments, filterSite, filterUser]);

  const dayAssignments = useMemo(() => {
    return filteredAssignments
      .filter((assignment) => isSameDay(parseISO(assignment.start_at), selectedDate))
      .sort((a, b) => a.start_at.localeCompare(b.start_at));
  }, [filteredAssignments, selectedDate]);

  const unreadCount = notifications.filter((item) => !item.is_read).length;

  const handleWeekMove = (offset: number) => {
    const nextDate = addDays(startOfWeek(selectedDate, { weekStartsOn: 1 }), offset * 7);
    setSelectedDate(nextDate);
    const search = new URLSearchParams({ week: formatISO(nextDate, { representation: "date" }) });
    window.history.replaceState(null, "", `/?${search.toString()}`);
  };

  const openNewModal = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEditModal = (assignment: Assignment) => {
    setEditing(assignment);
    setModalOpen(true);
  };

  const handleSubmit = async (formData: FormData) => {
    setError(null);
    const payload = {
      id: editing?.id,
      user_id: formData.get("user_id"),
      site_id: formData.get("site_id"),
      title: formData.get("title"),
      start_at: formData.get("start_at"),
      end_at: formData.get("end_at"),
      meeting_time: formData.get("meeting_time") || null,
      is_direct_go: formData.get("is_direct_go") === "on",
      is_direct_return: formData.get("is_direct_return") === "on",
      note: formData.get("note") || null
    };

    if (!payload.user_id || !payload.site_id || !payload.start_at || !payload.end_at) {
      setError("必須項目が入力されていません");
      return;
    }

    if (new Date(String(payload.start_at)) >= new Date(String(payload.end_at))) {
      setError("開始日時は終了日時より前にしてください");
      return;
    }

    const response = await fetch("/api/assignments", {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const data = await response.json();
      setError(data.message ?? "保存に失敗しました");
      return;
    }

    window.location.reload();
  };

  const handleDelete = async (assignmentId: string) => {
    if (!confirm("削除してよろしいですか？")) return;

    const response = await fetch("/api/assignments", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: assignmentId })
    });

    if (!response.ok) {
      const data = await response.json();
      setError(data.message ?? "削除に失敗しました");
      return;
    }

    window.location.reload();
  };

  const markNotificationsRead = async () => {
    await fetch("/api/notifications", { method: "PATCH" });
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => handleWeekMove(-1)}>
            前週
          </Button>
          <Button variant="secondary" onClick={() => handleWeekMove(0)}>
            今日
          </Button>
          <Button variant="secondary" onClick={() => handleWeekMove(1)}>
            次週
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <select
            className="rounded-md border px-3 py-2"
            value={filterUser}
            onChange={(event) => setFilterUser(event.target.value)}
          >
            <option value="">全ユーザー</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.display_name}
              </option>
            ))}
          </select>
          <select
            className="rounded-md border px-3 py-2"
            value={filterSite}
            onChange={(event) => setFilterSite(event.target.value)}
          >
            <option value="">全現場</option>
            {sites.map((site) => (
              <option key={site.id} value={site.id}>
                {site.name}
              </option>
            ))}
          </select>
          <Button onClick={openNewModal}>予定追加</Button>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setShowNotifications((prev) => !prev)}
            className="relative rounded-full border px-3 py-2 text-sm"
          >
            通知
            {unreadCount > 0 && (
              <span className="absolute -right-2 -top-2 rounded-full bg-rose-600 px-2 text-xs text-white">
                {unreadCount}
              </span>
            )}
          </button>
          {notifications.length > 0 && (
            <Button variant="secondary" onClick={markNotificationsRead}>
              全て既読
            </Button>
          )}
        </div>
      </section>

      {error && <div className="rounded-md bg-rose-100 px-4 py-2 text-sm text-rose-700">{error}</div>}

      {showNotifications && (
        <section className="rounded-lg border bg-white p-4">
          <h2 className="text-sm font-semibold">最新通知</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {notifications.length === 0 && <li className="text-slate-500">通知はありません。</li>}
            {notifications.map((notice) => (
              <li key={notice.id} className="rounded-md border px-3 py-2">
                <div className="flex items-center justify-between gap-2">
                  <span className={notice.is_read ? "text-slate-500" : "font-semibold"}>
                    {String(notice.payload.title ?? "予定更新")}
                  </span>
                  <span className="text-xs text-slate-400">
                    {new Date(notice.created_at).toLocaleString("ja-JP")}
                  </span>
                </div>
                <div className="text-xs text-slate-500">操作: {String(notice.payload.action ?? "")}</div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="overflow-auto rounded-lg border bg-white">
        <div className="min-w-[900px]">
          <div className="grid grid-cols-8 border-b bg-slate-50 text-sm">
            <div className="p-3 font-semibold">担当者</div>
            {weekDays.map((day) => (
              <button
                key={day.toISOString()}
                onClick={() => setSelectedDate(day)}
                className="p-3 text-left font-semibold hover:bg-slate-100"
              >
                {formatDateLabel(day)}
              </button>
            ))}
          </div>
          {users.map((user) => (
            <div key={user.id} className="grid grid-cols-8 border-b text-sm">
              <div className="flex items-center gap-2 p-3 font-medium">
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: user.color }} />
                {user.display_name}
              </div>
              {weekDays.map((day) => {
                const dayAssignmentsForUser = filteredAssignments.filter(
                  (assignment) =>
                    assignment.user_id === user.id &&
                    isSameDay(parseISO(assignment.start_at), day)
                );
                return (
                  <div key={day.toISOString()} className="min-h-[96px] border-l p-2">
                    <div className="space-y-2">
                      {dayAssignmentsForUser.map((assignment) => (
                        <button
                          key={assignment.id}
                          onClick={() => openEditModal(assignment)}
                          className="w-full rounded-md border-l-4 bg-slate-50 px-2 py-1 text-left"
                          style={{ borderColor: user.color }}
                        >
                          <div className="text-xs text-slate-500">
                            {formatTime(assignment.start_at)} - {formatTime(assignment.end_at)}
                          </div>
                          <div className="font-medium">{assignment.title}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-lg border bg-white p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{formatDateLabel(selectedDate)}の予定</h2>
          <span className="text-sm text-slate-500">モバイル表示に最適化</span>
        </div>
        <div className="mt-4 space-y-3">
          {dayAssignments.length === 0 && (
            <p className="text-sm text-slate-500">予定がありません。</p>
          )}
          {dayAssignments.map((assignment) => (
            <Link
              key={assignment.id}
              href={`/assignments/${assignment.id}`}
              className="block rounded-lg border p-4 hover:bg-slate-50"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="text-sm text-slate-500">
                    {formatTime(assignment.start_at)} - {formatTime(assignment.end_at)}
                  </div>
                  <div className="text-base font-semibold">{assignment.title}</div>
                  <div className="text-sm text-slate-600">担当: {assignment.user?.display_name}</div>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  {assignment.meeting_time && (
                    <span className={`rounded-full px-2 py-1 ${badgeMap.meeting}`}>
                      集合 {formatTime(assignment.meeting_time)}
                    </span>
                  )}
                  {assignment.is_direct_go && (
                    <span className={`rounded-full px-2 py-1 ${badgeMap.go}`}>直行</span>
                  )}
                  {assignment.is_direct_return && (
                    <span className={`rounded-full px-2 py-1 ${badgeMap.return}`}>直帰</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        <h2 className="mb-4 text-lg font-semibold">{editing ? "予定編集" : "予定追加"}</h2>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            handleSubmit(new FormData(event.currentTarget));
          }}
          className="space-y-4"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium">担当者</label>
              <select
                name="user_id"
                defaultValue={editing?.user_id}
                className="mt-1 w-full rounded-md border px-3 py-2"
                required
              >
                <option value="">選択してください</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.display_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">現場</label>
              <select
                name="site_id"
                defaultValue={editing?.site_id}
                className="mt-1 w-full rounded-md border px-3 py-2"
                required
              >
                <option value="">選択してください</option>
                {sites.map((site) => (
                  <option key={site.id} value={site.id}>
                    {site.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">開始日時</label>
              <input
                name="start_at"
                type="datetime-local"
                defaultValue={editing ? editing.start_at.slice(0, 16) : undefined}
                className="mt-1 w-full rounded-md border px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">終了日時</label>
              <input
                name="end_at"
                type="datetime-local"
                defaultValue={editing ? editing.end_at.slice(0, 16) : undefined}
                className="mt-1 w-full rounded-md border px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">集合時間</label>
              <input
                name="meeting_time"
                type="datetime-local"
                defaultValue={editing?.meeting_time ? editing.meeting_time.slice(0, 16) : undefined}
                className="mt-1 w-full rounded-md border px-3 py-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium">タイトル</label>
              <input
                name="title"
                defaultValue={editing?.title}
                className="mt-1 w-full rounded-md border px-3 py-2"
                placeholder="現場名"
                required
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input name="is_direct_go" type="checkbox" defaultChecked={editing?.is_direct_go} />
              直行
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                name="is_direct_return"
                type="checkbox"
                defaultChecked={editing?.is_direct_return}
              />
              直帰
            </label>
          </div>
          <div>
            <label className="text-sm font-medium">メモ</label>
            <textarea
              name="note"
              defaultValue={editing?.note ?? ""}
              className="mt-1 w-full rounded-md border px-3 py-2"
              rows={3}
            />
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            {editing && (
              <Button variant="danger" type="button" onClick={() => handleDelete(editing.id)}>
                削除
              </Button>
            )}
            <Button type="submit">保存</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
