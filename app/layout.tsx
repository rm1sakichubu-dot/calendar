import "./globals.css";
import Link from "next/link";
import { getSession } from "@/lib/auth";

export const metadata = {
  title: "現場アサイン・カレンダー",
  description: "現場アサインを週表示で確認できるPWA"
};

export default async function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <html lang="ja">
      <body>
        <div className="min-h-screen">
          <header className="border-b bg-white">
            <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
              <div className="flex items-center gap-4">
                <Link href="/" className="text-lg font-bold">
                  現場アサイン・カレンダー
                </Link>
                {session?.role === "admin" && (
                  <Link href="/admin" className="text-sm text-slate-600">
                    管理画面
                  </Link>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-slate-600">
                {session ? (
                  <>
                    <span>{session.displayName}</span>
                    <form action="/api/logout" method="post">
                      <button className="rounded-md border px-3 py-1">ログアウト</button>
                    </form>
                  </>
                ) : (
                  <Link href="/login" className="rounded-md border px-3 py-1">
                    ログイン
                  </Link>
                )}
              </div>
            </div>
          </header>
          <main className="mx-auto w-full max-w-6xl px-4 py-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
