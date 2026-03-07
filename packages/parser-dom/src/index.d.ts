import { type Block, type ConversationDoc, type ParseInput, type Role, type TurnNode } from "@atlas/shared";
export declare function discoverTurnNodes(root: ParentNode): TurnNode[];
export declare function inferRole(turnNode: TurnNode): Role;
export declare function isCitationNode(node: Element): boolean;
export declare function isUiNoiseText(text: string): boolean;
export declare function parseTurnBlocks(turnElement: Element): Block[];
export declare function parseConversationFromDom(input: ParseInput): ConversationDoc;
