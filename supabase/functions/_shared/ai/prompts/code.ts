/** AI Code Generator prompt builders (admin-only tool) */

export type CodeFramework =
  | "React"
  | "Next.js"
  | "HTML/CSS"
  | "Tailwind"
  | "Node.js"
  | "Supabase";

export type CodeOutputType =
  | "Component"
  | "Full Page"
  | "API Route"
  | "Database Schema"
  | "Landing Page";

export type CodeGenerationInput = {
  projectDescription: string;
  framework: CodeFramework;
  outputType: CodeOutputType;
};

export type CodeGenerationResult = {
  code: string;
  language: string;
  summary?: string;
};

const FRAMEWORKS = new Set<string>([
  "React",
  "Next.js",
  "HTML/CSS",
  "Tailwind",
  "Node.js",
  "Supabase",
]);

const OUTPUT_TYPES = new Set<string>([
  "Component",
  "Full Page",
  "API Route",
  "Database Schema",
  "Landing Page",
]);

export function validateCodeInput(input: CodeGenerationInput): string | null {
  const desc = input.projectDescription?.trim() ?? "";
  if (desc.length < 10) {
    return "Projektbeschreibung muss mindestens 10 Zeichen haben.";
  }
  if (!FRAMEWORKS.has(input.framework)) {
    return "Ungültiges Framework.";
  }
  if (!OUTPUT_TYPES.has(input.outputType)) {
    return "Ungültiger Output-Typ.";
  }
  return null;
}

function languageForFramework(framework: CodeFramework): string {
  switch (framework) {
    case "React":
    case "Next.js":
    case "Tailwind":
      return "tsx";
    case "HTML/CSS":
      return "html";
    case "Node.js":
      return "typescript";
    case "Supabase":
      return "sql";
    default:
      return "typescript";
  }
}

export function buildCodeSystemPrompt(
  framework: CodeFramework,
  outputType: CodeOutputType,
): string {
  const language = languageForFramework(framework);

  return `Du bist ein Senior Full-Stack Engineer bei NexTrends. Du schreibst sauberen, produktionsreifen Code.

Regeln:
- Nur Code ausgeben — keine Erklärungen außerhalb des JSON.
- Keine Platzhalter wie "// TODO" oder "..." — vollständiger, lauffähiger Code.
- TypeScript/React: strikte Typen, moderne Patterns, accessible UI wo relevant.
- Next.js: App Router Konventionen (app/, route.ts, Server/Client Components).
- Tailwind: utility-first, responsive, dark-mode-freundlich wo sinnvoll.
- Supabase: SQL Migrationen oder TypeScript Client-Code je nach Output-Typ.
- Antworte NUR mit JSON: {"code":"...","language":"${language}","summary":"1 Satz was gebaut wurde"}

Framework: ${framework}
Output-Typ: ${outputType}
Zielsprache: ${language}`;
}

export function buildCodeUserMessage(input: CodeGenerationInput): string {
  return `Projektbeschreibung:
${input.projectDescription.trim()}

Erstelle: ${input.outputType} für ${input.framework}.`;
}

export function parseCodeResponse(raw: string): CodeGenerationResult {
  let parsed: Record<string, unknown>;

  try {
    parsed = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    const fenced = raw.match(/```(?:\w+)?\n([\s\S]*?)```/);
    if (fenced?.[1]) {
      return {
        code: fenced[1].trim(),
        language: "typescript",
      };
    }
    throw new Error("Antwort konnte nicht als JSON gelesen werden.");
  }

  const code = typeof parsed.code === "string" ? parsed.code.trim() : "";
  if (!code) {
    throw new Error("Kein Code in der Antwort gefunden.");
  }

  const language = typeof parsed.language === "string" && parsed.language.trim()
    ? parsed.language.trim()
    : "typescript";

  const summary = typeof parsed.summary === "string"
    ? parsed.summary.trim()
    : undefined;

  return { code, language, summary };
}
