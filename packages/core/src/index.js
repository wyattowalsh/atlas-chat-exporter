import { discoverTurnsFromDocument, discoverTurnsFromHtml } from "@atlas/parser-dom";
import { renderJson } from "@atlas/render-json";
import { renderMarkdown } from "@atlas/render-markdown";
import { DEFAULT_EXPORT_OPTIONS, mergeOptions, toIsoNow } from "@atlas/shared";
import { applyTransforms } from "@atlas/transform";

export function buildConversationDoc(turns, source = "unknown") {
  return { title: undefined, source, exportedAt: toIsoNow(), turns };
}

export function exportFromDocument(doc, userOptions = {}, source = "chatgpt-web") {
  const options = mergeOptions(DEFAULT_EXPORT_OPTIONS, userOptions);
  const turns = applyTransforms(discoverTurnsFromDocument(doc), options);
  const conversation = buildConversationDoc(turns, source);
  return renderConversation(conversation, options);
}

export function exportFromHtml(html, userOptions = {}, source = "unknown") {
  const options = mergeOptions(DEFAULT_EXPORT_OPTIONS, userOptions);
  const turns = applyTransforms(discoverTurnsFromHtml(html), options);
  const conversation = buildConversationDoc(turns, source);
  return renderConversation(conversation, options);
}

export function renderConversation(conversation, options) {
  if (options.outputFormat === "json") {
    return { conversation, output: renderJson(conversation), options };
  }
  return { conversation, output: renderMarkdown(conversation, options), options };
}
