import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: "認証が必要です" }, { status: 401 });
  }

  const payload = await request.json();
  const { user_id, site_id, title, start_at, end_at, meeting_time, is_direct_go, is_direct_return, note } =
    payload;

  if (!user_id || !site_id || !start_at || !end_at) {
    return NextResponse.json({ message: "必須項目が不足しています" }, { status: 400 });
  }

  if (new Date(start_at) >= new Date(end_at)) {
    return NextResponse.json({ message: "開始日時は終了日時より前にしてください" }, { status: 400 });
  }

  const supabase = supabaseServer();
  const siteTitle = title || (await resolveSiteName(supabase, site_id));

  const { error } = await supabase.from("assignments").insert({
    user_id,
    site_id,
    title: siteTitle,
    start_at,
    end_at,
    meeting_time,
    is_direct_go,
    is_direct_return,
    note,
    created_by: session.userId,
    updated_by: session.userId
  });

  if (error) {
    return NextResponse.json({ message: "予定の作成に失敗しました" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function PUT(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: "認証が必要です" }, { status: 401 });
  }

  const payload = await request.json();
  const { id, user_id, site_id, title, start_at, end_at, meeting_time, is_direct_go, is_direct_return, note } =
    payload;

  if (!id) {
    return NextResponse.json({ message: "IDが不足しています" }, { status: 400 });
  }

  if (new Date(start_at) >= new Date(end_at)) {
    return NextResponse.json({ message: "開始日時は終了日時より前にしてください" }, { status: 400 });
  }

  const supabase = supabaseServer();
  const siteTitle = title || (await resolveSiteName(supabase, site_id));

  const { error } = await supabase
    .from("assignments")
    .update({
      user_id,
      site_id,
      title: siteTitle,
      start_at,
      end_at,
      meeting_time,
      is_direct_go,
      is_direct_return,
      note,
      updated_by: session.userId
    })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ message: "予定の更新に失敗しました" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: "認証が必要です" }, { status: 401 });
  }

  const payload = await request.json();
  const { id } = payload;

  if (!id) {
    return NextResponse.json({ message: "IDが不足しています" }, { status: 400 });
  }

  const supabase = supabaseServer();
  const { error } = await supabase.from("assignments").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ message: "予定の削除に失敗しました" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

async function resolveSiteName(supabase: ReturnType<typeof supabaseServer>, siteId: string) {
  const { data } = await supabase.from("sites").select("name").eq("id", siteId).single();
  return data?.name ?? "現場";
}
