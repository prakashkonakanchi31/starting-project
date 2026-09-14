import { Fragment, type ReactNode } from "react";

type Mark = { type: "bold" | "italic" | "code"; attrs?: Record<string, unknown> };

type TipTapNode = {
  type: string;
  attrs?: Record<string, unknown>;
  content?: TipTapNode[];
  text?: string;
  marks?: Mark[];
};

export type TipTapDoc = TipTapNode;

const HEADING_CLASSES: Record<number, string> = {
  1: "text-2xl font-semibold",
  2: "text-xl font-semibold",
  3: "text-lg font-medium",
};

function renderMarks(text: string, marks: Mark[] | undefined): ReactNode {
  return (marks ?? []).reduce<ReactNode>((child, mark) => {
    switch (mark.type) {
      case "code":
        return (
          <code className="rounded bg-black/5 px-1 py-0.5 font-mono text-xs dark:bg-white/10">
            {child}
          </code>
        );
      case "bold":
        return <strong>{child}</strong>;
      case "italic":
        return <em>{child}</em>;
      default:
        return child;
    }
  }, text);
}

function renderNodes(nodes: TipTapNode[] | undefined, prefix: string): ReactNode[] {
  if (!Array.isArray(nodes)) return [];
  return nodes.map((node, index) => renderNode(node, `${prefix}-${index}`));
}

function getCodeBlockText(node: TipTapNode): string {
  if (!Array.isArray(node.content)) return "";
  return node.content
    .filter((child) => typeof child.text === "string")
    .map((child) => child.text)
    .join("");
}

function renderNode(node: TipTapNode, key: string): ReactNode {
  if (!node || typeof node.type !== "string") return null;

  switch (node.type) {
    case "doc":
      return (
        <div key={key} className="flex flex-col gap-3">
          {renderNodes(node.content, key)}
        </div>
      );
    case "paragraph":
      return (
        <p key={key} className="text-sm leading-relaxed">
          {renderNodes(node.content, key)}
        </p>
      );
    case "heading": {
      const level = Number(node.attrs?.level);
      const className = HEADING_CLASSES[level];
      if (!className) return null;
      const children = renderNodes(node.content, key);
      if (level === 1) return <h1 key={key} className={className}>{children}</h1>;
      if (level === 2) return <h2 key={key} className={className}>{children}</h2>;
      return <h3 key={key} className={className}>{children}</h3>;
    }
    case "bulletList":
      return (
        <ul key={key} className="list-disc space-y-1 pl-6 text-sm">
          {renderNodes(node.content, key)}
        </ul>
      );
    case "listItem":
      return <li key={key}>{renderNodes(node.content, key)}</li>;
    case "codeBlock":
      return (
        <pre
          key={key}
          className="overflow-x-auto rounded-md bg-black/5 p-3 font-mono text-xs dark:bg-white/10"
        >
          <code>{getCodeBlockText(node)}</code>
        </pre>
      );
    case "horizontalRule":
      return <hr key={key} className="border-black/10 dark:border-white/10" />;
    case "hardBreak":
      return <br key={key} />;
    case "text":
      if (typeof node.text !== "string") return null;
      return <Fragment key={key}>{renderMarks(node.text, node.marks)}</Fragment>;
    default:
      return null;
  }
}

export function NoteContent({ doc }: { doc: TipTapDoc }) {
  return <>{renderNode(doc, "root")}</>;
}
