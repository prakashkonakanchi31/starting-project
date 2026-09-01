import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { parseAuthMode } from "@/app/lib/auth-validation";
import { AuthForm } from "./AuthForm";

export default async function AuthenticationPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string | string[] }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session) redirect("/dashboard");

  const { mode: modeParam } = await searchParams;
  const mode = parseAuthMode(modeParam);

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-6 text-center text-xl font-semibold">
          {mode === "signup" ? "Create an account" : "Sign in"}
        </h1>
        <AuthForm mode={mode} />
      </div>
    </main>
  );
}
