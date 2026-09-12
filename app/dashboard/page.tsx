import Link from "next/link";
import { verifySession } from "@/lib/session";

export default async function DashboardPage() {
  await verifySession();

  return (
    <div>
      Dashboard page
      <Link href="/logout">Log out</Link>
    </div>
  );
}
