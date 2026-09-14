import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export const getSession = cache(async () => {
  return auth.api.getSession({ headers: await headers() });
});

export const verifySession = cache(async () => {
  const result = await getSession();
  if (!result) redirect("/authentication");
  return result;
});
