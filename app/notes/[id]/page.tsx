import { verifySession } from "@/lib/session";

export default async function NoteEditorPage() {
  await verifySession();

  return <div>Note editor page</div>;
}
