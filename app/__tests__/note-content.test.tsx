import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NoteContent, type TipTapDoc } from "@/components/notes/NoteContent";

describe("NoteContent", () => {
  it("renders headings, bold text, and bullet lists", () => {
    const doc: TipTapDoc = {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "Section title" }],
        },
        {
          type: "paragraph",
          content: [
            { type: "text", text: "Some " },
            { type: "text", text: "bold", marks: [{ type: "bold" }] },
            { type: "text", text: " text" },
          ],
        },
        {
          type: "bulletList",
          content: [
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "First item" }],
                },
              ],
            },
          ],
        },
      ],
    };

    render(<NoteContent doc={doc} />);

    const heading = screen.getByText("Section title");
    expect(heading.tagName).toBe("H2");
    expect(screen.getByText("bold").tagName).toBe("STRONG");
    const listItem = screen.getByText("First item").closest("li");
    expect(listItem).not.toBeNull();
  });

  it("renders code blocks inside pre/code", () => {
    const doc: TipTapDoc = {
      type: "doc",
      content: [
        {
          type: "codeBlock",
          content: [{ type: "text", text: "const x = 1;" }],
        },
      ],
    };

    render(<NoteContent doc={doc} />);

    const code = screen.getByText("const x = 1;");
    expect(code.tagName).toBe("CODE");
    expect(code.closest("pre")).not.toBeNull();
  });

  it("renders without throwing for malformed or unknown nodes", () => {
    const doc = {
      type: "doc",
      content: undefined,
    } as unknown as TipTapDoc;

    expect(() => render(<NoteContent doc={doc} />)).not.toThrow();

    const docWithUnknownNode: TipTapDoc = {
      type: "doc",
      content: [{ type: "footnote", content: [] }],
    };

    expect(() => render(<NoteContent doc={docWithUnknownNode} />)).not.toThrow();
  });

  it("renders nothing (never throws) for a null or non-object root doc", () => {
    const { container } = render(<NoteContent doc={null as unknown as TipTapDoc} />);
    expect(container).toBeEmptyDOMElement();

    expect(() =>
      render(<NoteContent doc={"garbage" as unknown as TipTapDoc} />),
    ).not.toThrow();
  });
});
