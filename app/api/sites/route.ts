import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ message: "権限がありません" }, { status: 403 });
  }

  const payload = await request.json();
  const { name, address, map_url } = payload;

  if (!name) {
    return NextResponse.json({ message: "現場名が不足しています" }, { status: 400 });
  }

  const supabase = supabaseServer();
  const { error } = await supabase.from("sites").insert({
    name,
    address,
    map_url
  });

  if (error) {
    return NextResponse.json({ message: "現場作成に失敗しました" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
