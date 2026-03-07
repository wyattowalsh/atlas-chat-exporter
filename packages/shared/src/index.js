export const DEFAULT_OPTIONS = {
    includeStatusUpdates: true,
    citationMode: "normalize",
    includeRoleHeadings: true,
    includeHorizontalRules: false,
    normalizeLinks: true,
    outputFormat: "markdown"
};
export const UI_NOISE_PATTERNS = [
    /^copy code$/i,
    /^edit message$/i,
    /^chatgpt said:?$/i,
    /^you said:?$/i,
    /^regenerate$/i
];
export function normalizeInlineWhitespace(value) {
    return value.replace(/\s+/g, " ").trim();
}
export function normalizeBlockWhitespace(value) {
    return value
        .replace(/\r\n/g, "\n")
        .replace(/\t/g, " ")
        .replace(/\u00a0/g, " ")
        .replace(/[ \f\v]+/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
}
