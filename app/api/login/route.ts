import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabaseServer } from "@/lib/supabase";
import { createSessionCookie } from "@/lib/auth";

export async function POST(request: Request) {
  const formData = await request.formData();
  const companyCode = formData.get("companyCode");
  const pin = formData.get("pin");

  if (typeof companyCode !== "string" || typeof pin !== "string") {
    return NextResponse.redirect(new URL("/login?error=入力が不足しています", request.url));
  }

  if (companyCode !== process.env.COMPANY_CODE) {
    return NextResponse.redirect(new URL("/login?error=会社コードが正しくありません", request.url));
  }

  const supabase = supabaseServer();
  const { data: users, error } = await supabase
    .from("users")
    .select("id, display_name, color, role, pin_hash, is_active")
    .eq("is_active", true);

  if (error) {
    return NextResponse.redirect(new URL("/login?error=ユーザー取得に失敗しました", request.url));
  }

  const matchedUser = await findUserByPin(users ?? [], pin);

  if (!matchedUser) {
    return NextResponse.redirect(new URL("/login?error=PINが正しくありません", request.url));
  }

  await createSessionCookie({
    userId: matchedUser.id,
    role: matchedUser.role,
    displayName: matchedUser.display_name
  });

  return NextResponse.redirect(new URL("/", request.url));
}

type UserRecord = {
  id: string;
  display_name: string;
  role: "admin" | "editor";
  pin_hash: string;
  is_active: boolean;
};

async function findUserByPin(users: UserRecord[], pin: string) {
  for (const user of users) {
    if (await bcrypt.compare(pin, user.pin_hash)) {
      return user;
    }
  }
  return null;
}
