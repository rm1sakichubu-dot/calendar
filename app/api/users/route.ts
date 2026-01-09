import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSession } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ message: "権限がありません" }, { status: 403 });
  }

  const payload = await request.json();
  const { display_name, color, role, pin } = payload;

  if (!display_name || !color || !role || !pin) {
    return NextResponse.json({ message: "必須項目が不足しています" }, { status: 400 });
  }

  const supabase = supabaseServer();
  const pin_hash = await bcrypt.hash(pin, 10);

  const { error } = await supabase.from("users").insert({
    display_name,
    color,
    role,
    pin_hash
  });

  if (error) {
    return NextResponse.json({ message: "ユーザー作成に失敗しました" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ message: "権限がありません" }, { status: 403 });
  }

  const payload = await request.json();
  const { id, is_active } = payload;

  if (!id) {
    return NextResponse.json({ message: "IDが不足しています" }, { status: 400 });
  }

  const supabase = supabaseServer();
  const { error } = await supabase.from("users").update({ is_active }).eq("id", id);

  if (error) {
    return NextResponse.json({ message: "ユーザー更新に失敗しました" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
