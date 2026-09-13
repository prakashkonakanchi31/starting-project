"use client";

import { useEditorState, type Editor } from "@tiptap/react";

type ToolbarButtonProps = {
  label: string;
  isActive?: boolean;
  disabled?: boolean;
  onClick: () => void;
};

function ToolbarButton({ label, isActive, disabled, onClick }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={isActive}
      disabled={disabled}
      onClick={onClick}
      className={`rounded-md border border-black/15 px-2 py-1 text-sm disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/15 ${
        isActive ? "bg-foreground text-background" : "bg-transparent"
      }`}
    >
      {label}
    </button>
  );
}

const INACTIVE_STATE = {
  bold: false,
  italic: false,
  h1: false,
  h2: false,
  h3: false,
  paragraph: false,
  bulletList: false,
  code: false,
  codeBlock: false,
};

export function EditorToolbar({ editor }: { editor: Editor | null }) {
  // Note: `state` reflects live cursor formatting once TipTap's internal
  // subscription catches up to the editor instance; it can briefly stay
  // null/stale right after the editor mounts (immediatelyRender: false
  // delays creation past the initial render). Never gate the toolbar's
  // *existence* on it — only use it for the "pressed" styling, falling
  // back to all-inactive — otherwise the toolbar can fail to ever appear.
  const state = useEditorState({
    editor,
    selector: (ctx) =>
      ctx.editor
        ? {
            bold: ctx.editor.isActive("bold"),
            italic: ctx.editor.isActive("italic"),
            h1: ctx.editor.isActive("heading", { level: 1 }),
            h2: ctx.editor.isActive("heading", { level: 2 }),
            h3: ctx.editor.isActive("heading", { level: 3 }),
            paragraph: ctx.editor.isActive("paragraph"),
            bulletList: ctx.editor.isActive("bulletList"),
            code: ctx.editor.isActive("code"),
            codeBlock: ctx.editor.isActive("codeBlock"),
          }
        : null,
  }) ?? INACTIVE_STATE;

  if (!editor) {
    return null;
  }

  return (
    <div
      role="toolbar"
      aria-label="Formatting"
      className="flex flex-wrap items-center gap-1 rounded-md border border-black/15 p-1 dark:border-white/15"
    >
      <ToolbarButton
        label="Bold"
        isActive={state.bold}
        onClick={() => editor.chain().focus().toggleBold().run()}
      />
      <ToolbarButton
        label="Italic"
        isActive={state.italic}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      />
      <ToolbarButton
        label="H1"
        isActive={state.h1}
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      />
      <ToolbarButton
        label="H2"
        isActive={state.h2}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      />
      <ToolbarButton
        label="H3"
        isActive={state.h3}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      />
      <ToolbarButton
        label="Paragraph"
        isActive={state.paragraph}
        onClick={() => editor.chain().focus().setParagraph().run()}
      />
      <ToolbarButton
        label="Bullet list"
        isActive={state.bulletList}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      />
      <ToolbarButton
        label="Inline code"
        isActive={state.code}
        onClick={() => editor.chain().focus().toggleCode().run()}
      />
      <ToolbarButton
        label="Code block"
        isActive={state.codeBlock}
        disabled={!editor.can().chain().focus().toggleCodeBlock().run()}
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
      />
      <ToolbarButton
        label="Horizontal rule"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
      />
    </div>
  );
}
