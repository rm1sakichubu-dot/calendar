"use client";

import { useState } from "react";
import { Site, User } from "@/lib/types";
import { Button } from "@/components/Button";

export function AdminDashboard({ users, sites }: { users: User[]; sites: Site[] }) {
  const [error, setError] = useState<string | null>(null);

  const handleUserSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const formData = new FormData(event.currentTarget);
    const payload = {
      display_name: formData.get("display_name"),
      color: formData.get("color"),
      role: formData.get("role"),
      pin: formData.get("pin")
    };
    const response = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      const data = await response.json();
      setError(data.message ?? "ユーザー作成に失敗しました");
      return;
    }
    window.location.reload();
  };

  const handleSiteSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const formData = new FormData(event.currentTarget);
    const payload = {
      name: formData.get("name"),
      address: formData.get("address"),
      map_url: formData.get("map_url")
    };
    const response = await fetch("/api/sites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      const data = await response.json();
      setError(data.message ?? "現場作成に失敗しました");
      return;
    }
    window.location.reload();
  };

  const toggleUserActive = async (userId: string, isActive: boolean) => {
    const response = await fetch("/api/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: userId, is_active: !isActive })
    });
    if (!response.ok) {
      const data = await response.json();
      setError(data.message ?? "ユーザー更新に失敗しました");
      return;
    }
    window.location.reload();
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">管理画面</h1>
      {error && <div className="rounded-md bg-rose-100 px-4 py-2 text-sm text-rose-700">{error}</div>}

      <section className="rounded-lg border bg-white p-6">
        <h2 className="text-lg font-semibold">ユーザー管理</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <form onSubmit={handleUserSubmit} className="space-y-3">
            <div>
              <label className="text-sm font-medium">名前</label>
              <input name="display_name" required className="mt-1 w-full rounded-md border px-3 py-2" />
            </div>
            <div>
              <label className="text-sm font-medium">表示色</label>
              <input name="color" defaultValue="#2563eb" className="mt-1 w-full rounded-md border px-3 py-2" />
            </div>
            <div>
              <label className="text-sm font-medium">PIN</label>
              <input name="pin" required className="mt-1 w-full rounded-md border px-3 py-2" />
            </div>
            <div>
              <label className="text-sm font-medium">権限</label>
              <select name="role" className="mt-1 w-full rounded-md border px-3 py-2">
                <option value="editor">editor</option>
                <option value="admin">admin</option>
              </select>
            </div>
            <Button type="submit">ユーザー追加</Button>
          </form>
          <div className="space-y-2 text-sm">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between rounded-md border px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: user.color }} />
                  {user.display_name}
                  <span className="text-xs text-slate-500">({user.role})</span>
                </div>
                <Button
                  variant={user.is_active ? "secondary" : "primary"}
                  onClick={() => toggleUserActive(user.id, user.is_active)}
                >
                  {user.is_active ? "無効化" : "有効化"}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-lg border bg-white p-6">
        <h2 className="text-lg font-semibold">現場マスタ</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <form onSubmit={handleSiteSubmit} className="space-y-3">
            <div>
              <label className="text-sm font-medium">現場名</label>
              <input name="name" required className="mt-1 w-full rounded-md border px-3 py-2" />
            </div>
            <div>
              <label className="text-sm font-medium">住所</label>
              <input name="address" className="mt-1 w-full rounded-md border px-3 py-2" />
            </div>
            <div>
              <label className="text-sm font-medium">地図URL</label>
              <input name="map_url" className="mt-1 w-full rounded-md border px-3 py-2" />
            </div>
            <Button type="submit">現場追加</Button>
          </form>
          <div className="space-y-2 text-sm">
            {sites.map((site) => (
              <div key={site.id} className="rounded-md border px-3 py-2">
                <div className="font-medium">{site.name}</div>
                <div className="text-xs text-slate-500">{site.address}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
