import Link from "next/link";
import { getSession } from "@/lib/session";
import { HeaderNav } from "@/components/HeaderNav";

export async function Header() {
  const session = await getSession();

  return (
    <header className="flex items-center justify-between border-b border-black/10 px-4 py-3 dark:border-white/10">
      <Link href="/dashboard" className="text-lg font-semibold tracking-tight">
        NextNotes
      </Link>
      <HeaderNav isAuthenticated={Boolean(session)} />
    </header>
  );
}
