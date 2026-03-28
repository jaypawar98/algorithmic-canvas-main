import { Fragment, ReactNode } from "react";

type TokenKind =
  | "plain"
  | "comment"
  | "string"
  | "keyword"
  | "number"
  | "type"
  | "function";

type Token = {
  value: string;
  kind: TokenKind;
};

const KEYWORDS = new Set([
  "if",
  "else",
  "for",
  "while",
  "return",
  "function",
  "const",
  "let",
  "var",
  "class",
  "new",
  "true",
  "false",
  "null",
  "undefined",
  "public",
  "private",
  "static",
  "boolean",
  "int",
  "void",
  "include",
  "define",
  "bool",
]);

const TYPES = new Set([
  "Array",
  "String",
  "Math",
]);

const TOKEN_RE =
  /(\/\/[^\n]*|\/\*[\s\S]*?\*\/|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|\b\d+(?:\.\d+)?\b|\b[A-Za-z_]\w*\b|[^\w\s]|\s+)/g;

function classifyToken(value: string, nextValue: string | undefined): TokenKind {
  if (value.startsWith("//") || value.startsWith("/*")) return "comment";
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'")) ||
    (value.startsWith("`") && value.endsWith("`"))
  ) {
    return "string";
  }
  if (/^\d/.test(value)) return "number";
  if (KEYWORDS.has(value)) return "keyword";
  if (TYPES.has(value) || /^[A-Z][A-Za-z0-9_]*$/.test(value)) return "type";
  if (/^[A-Za-z_]\w*$/.test(value) && nextValue === "(") return "function";
  return "plain";
}

function tokenize(code: string): Token[] {
  const rawTokens = code.match(TOKEN_RE) ?? [code];
  return rawTokens.map((value, index) => ({
    value,
    kind: classifyToken(value, rawTokens[index + 1]),
  }));
}

export function renderHighlightedCode(code: string): ReactNode[] {
  return tokenize(code).map((token, index) => {
    if (token.kind === "plain") {
      return <Fragment key={index}>{token.value}</Fragment>;
    }

    const className = {
      comment: "text-muted-foreground italic",
      string: "text-emerald-300",
      keyword: "text-cyan-300",
      number: "text-amber-300",
      type: "text-violet-300",
      function: "text-sky-300",
    }[token.kind];

    return (
      <span key={index} className={className}>
        {token.value}
      </span>
    );
  });
}
