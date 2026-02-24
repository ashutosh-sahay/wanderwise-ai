/**
 * Type definitions for WanderWise AI application
 */

export type MessageRole = "user" | "assistant" | "system";

export type MessageType = "text";

export interface Message {
  id: string;
  role: MessageRole;
  type: MessageType;
  content: string;
  timestamp: Date;
  metadata?: MessageMetadata;
}

export interface MessageMetadata {
  // Reserved for future use (e.g., sources, citations, etc.)
  [key: string]: unknown;
}
