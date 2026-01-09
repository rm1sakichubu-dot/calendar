import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function LoginPage({
  searchParams
}: {
  searchParams: { error?: string };
}) {
  const session = await getSession();
  if (session) {
    redirect("/");
  }

  return (
    <div className="mx-auto max-w-md rounded-lg bg-white p-6 shadow">
      <h1 className="mb-4 text-xl font-semibold">ログイン</h1>
      {searchParams.error && (
        <div className="rounded-md bg-rose-100 px-3 py-2 text-sm text-rose-700">
          {decodeURIComponent(searchParams.error)}
        </div>
      )}
      <form action="/api/login" method="post" className="space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-700">会社コード</label>
          <input
            name="companyCode"
            className="mt-1 w-full rounded-md border px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">PIN（4〜8桁）</label>
          <input
            name="pin"
            type="password"
            inputMode="numeric"
            className="mt-1 w-full rounded-md border px-3 py-2"
            required
          />
        </div>
        <button className="w-full rounded-md bg-blue-600 px-4 py-2 text-white">
          ログイン
        </button>
      </form>
    </div>
  );
}
