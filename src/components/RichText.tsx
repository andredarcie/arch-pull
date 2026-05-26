import { CodeBlock } from "./CodeBlock";

type Segment =
  | { type: "text"; content: string }
  | { type: "code"; content: string; language: string };

function parse(text: string): Segment[] {
  const segments: Segment[] = [];
  const regex = /```(\w*)\n([\s\S]*?)```/g;
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > cursor) {
      segments.push({ type: "text", content: text.slice(cursor, match.index) });
    }
    segments.push({
      type: "code",
      language: match[1] || "typescript",
      content: match[2].replace(/\n$/, ""),
    });
    cursor = match.index + match[0].length;
  }

  if (cursor < text.length) {
    segments.push({ type: "text", content: text.slice(cursor) });
  }

  return segments;
}

interface RichTextProps {
  text: string;
}

export function RichText({ text }: RichTextProps) {
  const segments = parse(text);
  return (
    <>
      {segments.map((seg, i) =>
        seg.type === "code" ? (
          <CodeBlock key={i} code={seg.content} language={seg.language} />
        ) : (
          <p key={i} className="flashcard-prose">
            {seg.content.trim()}
          </p>
        )
      )}
    </>
  );
}
