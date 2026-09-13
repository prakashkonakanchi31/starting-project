"use client";

import { useActionState, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { EditorToolbar } from "./EditorToolbar";
import { EMPTY_TIPTAP_DOC, type NoteFormState } from "@/app/lib/note-validation";

const initialState: NoteFormState = {};

export function NoteForm({
  action,
  initialTitle = "",
  initialContentJson = EMPTY_TIPTAP_DOC,
  submitLabel,
}: {
  action: (prevState: NoteFormState, formData: FormData) => Promise<NoteFormState>;
  initialTitle?: string;
  initialContentJson?: string;
  submitLabel: string;
}) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [contentJson, setContentJson] = useState(initialContentJson);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        link: false,
        underline: false,
      }),
    ],
    content: JSON.parse(initialContentJson),
    immediatelyRender: false,
    editorProps: {
      attributes: {
        role: "textbox",
        "aria-labelledby": "content-label",
        class: "prose prose-sm max-w-none focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => setContentJson(JSON.stringify(editor.getJSON())),
  });

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.error && (
        <p
          role="alert"
          className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-600"
        >
          {state.error}
        </p>
      )}

      <div className="flex flex-col gap-1">
        <label htmlFor="title" className="text-sm font-medium">
          Title
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          defaultValue={initialTitle}
          className="rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm dark:border-white/15"
        />
      </div>

      <div className="flex flex-col gap-2">
        <span id="content-label" className="text-sm font-medium">
          Content
        </span>
        <EditorToolbar editor={editor} />
        <div className="min-h-40 rounded-md border border-black/15 px-3 py-2 text-sm dark:border-white/15">
          <EditorContent editor={editor} />
        </div>
        <input type="hidden" name="contentJson" value={contentJson} readOnly />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background disabled:opacity-50"
      >
        {submitLabel}
      </button>
    </form>
  );
}
