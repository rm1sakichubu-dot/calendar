import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase";

export async function PATCH() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: "認証が必要です" }, { status: 401 });
  }

  const supabase = supabaseServer();
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", session.userId)
    .eq("is_read", false);

  if (error) {
    return NextResponse.json({ message: "既読化に失敗しました" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
