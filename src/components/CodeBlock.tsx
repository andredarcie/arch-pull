import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import typescript from "react-syntax-highlighter/dist/esm/languages/prism/typescript";
import javascript from "react-syntax-highlighter/dist/esm/languages/prism/javascript";

SyntaxHighlighter.registerLanguage("typescript", typescript);
SyntaxHighlighter.registerLanguage("javascript", javascript);
SyntaxHighlighter.registerLanguage("ts", typescript);
SyntaxHighlighter.registerLanguage("js", javascript);

interface CodeBlockProps {
  code: string;
  language?: string;
}

export function CodeBlock({ code, language = "typescript" }: CodeBlockProps) {
  return (
    <SyntaxHighlighter
      language={language}
      style={vscDarkPlus}
      wrapLongLines
      customStyle={{
        margin: "8px 0",
        borderRadius: "8px",
        fontSize: "0.78rem",
        lineHeight: "1.6",
        padding: "12px 14px",
        background: "#1e1e1e",
        overflowX: "hidden",
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
        flexShrink: 0,
      }}
      codeTagProps={{
        style: { fontFamily: "'Fira Code', 'Cascadia Code', 'Courier New', monospace" },
      }}
    >
      {code}
    </SyntaxHighlighter>
  );
}
