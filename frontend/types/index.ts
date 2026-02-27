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

export interface DayItem {
  time: string;
  label: string;
  note: string;
  link?: string;
  map?: boolean;
  cost: string;
}

export interface Day {
  day: number;
  title: string;
  items: DayItem[];
}

export interface Insight {
  title: string;
  body: string;
}

export interface TripPlan {
  destination: string;
  duration: string;
  style: string;
  efficiency: string;
  days: Day[];
  insights: Insight[];
}
