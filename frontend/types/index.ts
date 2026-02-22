/**
 * Type definitions for WanderWise AI application
 */

export type StepType = "input" | "processing" | "direction" | "budget" | "final";

export interface AgentThinking {
  agent: string;
  msg: string;
}

export interface TravelOption {
  id: string;
  title: string;
  price: string;
  desc: string;
  meta: string;
}

export interface BudgetItem {
  cat: string;
  cost: number;
  icon: React.ReactNode;
  reason: string;
}

export interface ItineraryItem {
  time: string;
  label: string;
  cost: string;
  link?: string;
  map?: boolean;
  note: string;
}

export interface DayItinerary {
  day: number;
  title: string;
  items: ItineraryItem[];
}

export interface InsightTip {
  title: string;
  body: string;
}

export interface TripPlan {
  destination: string;
  duration: string;
  style: string;
  efficiency: string;
  totalBudget: string;
  strategyId: string;
  days: DayItinerary[];
  insights: InsightTip[];
  verificationChecks: string[];
}
