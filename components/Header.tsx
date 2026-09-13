import Link from "next/link";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { HeaderNav } from "@/components/HeaderNav";

export async function Header() {
  const session = await auth.api.getSession({ headers: await headers() });

  return (
    <header className="flex items-center justify-between border-b border-black/10 px-4 py-3 dark:border-white/10">
      <Link href="/dashboard" className="text-lg font-semibold tracking-tight">
        NextNotes
      </Link>
      <HeaderNav isAuthenticated={Boolean(session)} />
    </header>
  );
}
