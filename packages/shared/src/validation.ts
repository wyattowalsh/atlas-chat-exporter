import { DEFAULT_EXPORT_OPTIONS, withDefaultExportOptions } from "./defaults";
import { ValidationError } from "./errors";
import type {
  Block,
  CitationMode,
  ConversationDoc,
  ExportOptions,
  ListItem,
  OutputFormat,
  Role,
  Turn,
} from "./types";

const ROLES: readonly Role[] = ["user", "assistant", "system", "unknown"] as const;
const CITATION_MODES: readonly CitationMode[] = ["keep", "normalize", "strip"] as const;
const OUTPUT_FORMATS: readonly OutputFormat[] = [
  "markdown",
  "json",
  "html",
  "text",
] as const;
const SOURCES = ["chatgpt-atlas", "chatgpt-web", "unknown"] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function assertString(value: unknown, path: string): string {
  if (typeof value !== "string") {
    throw new ValidationError(path, "must be a string");
  }

  return value;
}

function assertBoolean(value: unknown, path: string): boolean {
  if (typeof value !== "boolean") {
    throw new ValidationError(path, "must be a boolean");
  }

  return value;
}

function assertEnum<T extends string>(
  value: unknown,
  allowed: readonly T[],
  path: string,
): T {
  if (typeof value !== "string" || !allowed.includes(value as T)) {
    throw new ValidationError(path, `must be one of: ${allowed.join(", ")}`);
  }

  return value as T;
}

function assertListItem(value: unknown, path: string): ListItem {
  if (!isRecord(value)) {
    throw new ValidationError(path, "must be an object");
  }

  const text = assertString(value.text, `${path}.text`);
  let children: ListItem[] | undefined;

  if (value.children !== undefined) {
    if (!Array.isArray(value.children)) {
      throw new ValidationError(`${path}.children`, "must be an array");
    }

    children = value.children.map((item, index) =>
      assertListItem(item, `${path}.children[${index}]`),
    );
  }

  return { text, children };
}

function assertBlock(value: unknown, path: string): Block {
  if (!isRecord(value)) {
    throw new ValidationError(path, "must be an object");
  }

  const kind = assertEnum(
    value.kind,
    ["heading", "paragraph", "code", "blockquote", "list", "table", "rule", "raw"],
    `${path}.kind`,
  );

  switch (kind) {
    case "heading": {
      const level = value.level;
      if (typeof level !== "number" || ![1, 2, 3, 4, 5, 6].includes(level)) {
        throw new ValidationError(`${path}.level`, "must be an integer between 1 and 6");
      }

      return { kind, level: level as 1 | 2 | 3 | 4 | 5 | 6, text: assertString(value.text, `${path}.text`) };
    }
    case "paragraph":
      return { kind, text: assertString(value.text, `${path}.text`) };
    case "code": {
      const block: Block = { kind, code: assertString(value.code, `${path}.code`) };
      if (value.language !== undefined) {
        block.language = assertString(value.language, `${path}.language`);
      }
      return block;
    }
    case "blockquote":
      return { kind, text: assertString(value.text, `${path}.text`) };
    case "list": {
      if (!Array.isArray(value.items)) {
        throw new ValidationError(`${path}.items`, "must be an array");
      }

      return {
        kind,
        ordered: assertBoolean(value.ordered, `${path}.ordered`),
        items: value.items.map((item, index) => assertListItem(item, `${path}.items[${index}]`)),
      };
    }
    case "table": {
      if (!Array.isArray(value.rows)) {
        throw new ValidationError(`${path}.rows`, "must be an array");
      }

      const rows = value.rows.map((row, rowIndex) => {
        if (!Array.isArray(row)) {
          throw new ValidationError(`${path}.rows[${rowIndex}]`, "must be an array of strings");
        }

        return row.map((cell, colIndex) =>
          assertString(cell, `${path}.rows[${rowIndex}][${colIndex}]`),
        );
      });

      return { kind, rows };
    }
    case "rule":
      return { kind };
    case "raw":
      return { kind, text: assertString(value.text, `${path}.text`) };
    default:
      throw new ValidationError(`${path}.kind`, "unsupported block kind");
  }
}

function assertTurn(value: unknown, path: string): Turn {
  if (!isRecord(value)) {
    throw new ValidationError(path, "must be an object");
  }

  if (!Array.isArray(value.blocks)) {
    throw new ValidationError(`${path}.blocks`, "must be an array");
  }

  return {
    role: assertEnum(value.role, ROLES, `${path}.role`),
    blocks: value.blocks.map((block, index) => assertBlock(block, `${path}.blocks[${index}]`)),
  };
}

export function validateExportOptions(options: unknown): ExportOptions {
  if (!isRecord(options)) {
    throw new ValidationError("options", "must be an object");
  }

  const merged = withDefaultExportOptions(options as Partial<ExportOptions>);

  return {
    includeStatusUpdates: assertBoolean(
      merged.includeStatusUpdates,
      "options.includeStatusUpdates",
    ),
    citationMode: assertEnum(merged.citationMode, CITATION_MODES, "options.citationMode"),
    includeRoleHeadings: assertBoolean(
      merged.includeRoleHeadings,
      "options.includeRoleHeadings",
    ),
    includeHorizontalRules: assertBoolean(
      merged.includeHorizontalRules,
      "options.includeHorizontalRules",
    ),
    normalizeLinks: assertBoolean(merged.normalizeLinks, "options.normalizeLinks"),
    outputFormat: assertEnum(merged.outputFormat, OUTPUT_FORMATS, "options.outputFormat"),
    filenameTemplate:
      merged.filenameTemplate === undefined
        ? undefined
        : assertString(merged.filenameTemplate, "options.filenameTemplate"),
  };
}

export function validateConversationDoc(doc: unknown): ConversationDoc {
  if (!isRecord(doc)) {
    throw new ValidationError("doc", "must be an object");
  }

  if (!Array.isArray(doc.turns)) {
    throw new ValidationError("doc.turns", "must be an array");
  }

  const conversationDoc: ConversationDoc = {
    source: assertEnum(doc.source, SOURCES, "doc.source"),
    exportedAt: assertString(doc.exportedAt, "doc.exportedAt"),
    turns: doc.turns.map((turn, index) => assertTurn(turn, `doc.turns[${index}]`)),
  };

  if (doc.title !== undefined) {
    conversationDoc.title = assertString(doc.title, "doc.title");
  }

  return conversationDoc;
}

export function cloneDefaultExportOptions(): ExportOptions {
  return { ...DEFAULT_EXPORT_OPTIONS };
}
