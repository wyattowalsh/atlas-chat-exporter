import type { Role } from "../../shared/src/types.ts";

export interface TurnShell {
  attrs: Record<string, string>;
  classes: string[];
}

export function inferRole(turn: TurnShell): Role {
  const role = turn.attrs["data-role"]?.toLowerCase();
  if (role === "user" || role === "assistant" || role === "system") return role;
  if (turn.classes.includes("user")) return "user";
  if (turn.classes.includes("assistant")) return "assistant";
  return "unknown";
}

export function isCitationText(text: string): boolean {
  return /citation-chip|data-citation/.test(text);
}

export function normalizeText(text: string): string {
  return text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export function parseAttrs(tag: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  for (const m of tag.matchAll(/([\w-]+)=(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g)) {
    attrs[m[1]] = m[2] ?? m[3] ?? m[4] ?? "";
  }
  return attrs;
}
