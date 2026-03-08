export function buildCliExportCommand(outputPath = '~/Downloads/chat-export.md'): string {
  return `atlas-chat-exporter export --format markdown --out ${outputPath}`;
}
