"use client";

import { useState } from "react";
import Link from "next/link";
import { formatDateTime, formatTime } from "@/lib/dates";
import { Assignment, AuditLog } from "@/lib/types";
import { Button } from "@/components/Button";

export function AssignmentDetail({
  assignment,
  auditLogs
}: {
  assignment: Assignment;
  auditLogs: AuditLog[];
}) {
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!confirm("削除してよろしいですか？")) return;
    const response = await fetch("/api/assignments", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: assignment.id })
    });

    if (!response.ok) {
      const data = await response.json();
      setError(data.message ?? "削除に失敗しました");
      return;
    }

    window.location.href = "/";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/" className="text-sm text-blue-600">
          ← 週表示に戻る
        </Link>
        <Button variant="danger" onClick={handleDelete}>
          削除
        </Button>
      </div>

      {error && <div className="rounded-md bg-rose-100 px-4 py-2 text-sm text-rose-700">{error}</div>}

      <section className="rounded-lg border bg-white p-6">
        <h1 className="text-xl font-semibold">{assignment.title}</h1>
        <div className="mt-2 text-sm text-slate-600">
          {formatDateTime(assignment.start_at)} - {formatDateTime(assignment.end_at)}
        </div>
        <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
          <div>
            <span className="font-medium">担当者:</span> {assignment.user?.display_name}
          </div>
          <div>
            <span className="font-medium">現場:</span> {assignment.site?.name}
          </div>
          {assignment.site?.address && (
            <div>
              <span className="font-medium">住所:</span> {assignment.site.address}
            </div>
          )}
          {assignment.site?.map_url && (
            <div>
              <span className="font-medium">地図:</span> {assignment.site.map_url}
            </div>
          )}
          {assignment.meeting_time && (
            <div>
              <span className="font-medium">集合時間:</span> {formatTime(assignment.meeting_time)}
            </div>
          )}
          <div>
            <span className="font-medium">直行:</span> {assignment.is_direct_go ? "あり" : "なし"}
          </div>
          <div>
            <span className="font-medium">直帰:</span> {assignment.is_direct_return ? "あり" : "なし"}
          </div>
          {assignment.note && (
            <div className="md:col-span-2">
              <span className="font-medium">メモ:</span> {assignment.note}
            </div>
          )}
        </div>
      </section>

      <section className="rounded-lg border bg-white p-6">
        <h2 className="text-lg font-semibold">履歴</h2>
        <div className="mt-4 space-y-3 text-sm">
          {auditLogs.length === 0 && <p className="text-slate-500">履歴がありません。</p>}
          {auditLogs.map((log) => (
            <div key={log.id} className="rounded-md border px-3 py-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-medium">{log.action.toUpperCase()}</span>
                <span className="text-xs text-slate-500">{formatDateTime(log.created_at)}</span>
              </div>
              <div className="text-xs text-slate-500">
                変更者: {log.actor?.display_name ?? log.actor_user_id}
              </div>
              <pre className="mt-2 overflow-auto rounded bg-slate-50 p-2 text-xs text-slate-600">
                {JSON.stringify(log.after ?? log.before, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
