import Link from "next/link";
import { verifySession } from "@/lib/session";

export default async function DashboardPage() {
  await verifySession();

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <Link
          href="/notes/new"
          className="rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background"
        >
          New Note
        </Link>
      </div>
    </div>
  );
}
