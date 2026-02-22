"use client";

import React, { useState } from "react";
import { StepType, AgentThinking } from "@/types";
import { Header, Stepper } from "@/components/layout";
import {
  InputStep,
  ProcessingStep,
  DirectionStep,
  BudgetStep,
  FinalStep,
} from "@/components/features";
// TODO: Remove mock data imports when backend integration is complete
// Replace with API service functions
import {
  thinkingSequence,
  travelOptions,
  budgetItems,
  mockTripPlan,
} from "@/lib/mockData";

/**
 * Main application component for WanderWise AI
 * 
 * Manages the multi-step workflow for AI-powered travel planning
 */
export default function Home() {
  const [step, setStep] = useState<StepType>("input");
  const [query, setQuery] = useState("");
  const [currentThinking, setCurrentThinking] = useState("");
  const [completedSteps, setCompletedSteps] = useState<AgentThinking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // TODO: Add state for backend data when integrating with API
  // const [planId, setPlanId] = useState<string | null>(null);
  // const [travelOptions, setTravelOptions] = useState<TravelOption[]>([]);
  // const [budgetData, setBudgetData] = useState<BudgetItem[]>([]);
  // const [tripPlan, setTripPlan] = useState<TripPlan | null>(null);
  // const [error, setError] = useState<string | null>(null);
  // TODO: Add error handling UI component to display API errors
  // TODO: Add retry logic for failed API calls

  /**
   * Initiates the planning process with agent thinking simulation
   * 
   * TODO: Replace with real API call
   * POST /api/planning/start
   * Body: { query: string }
   * Response: { planId: string }
   * 
   * TODO: Replace setTimeout simulation with WebSocket/SSE for real-time agent thinking
   * Connect to: WS /api/planning/{planId}/stream
   * Listen for agent thinking updates in real-time
   */
  const handleStartPlanning = async () => {
    if (!query) return;
    setIsLoading(true);
    setStep("processing");
    setCompletedSteps([]);

    // TODO: Remove mock simulation - replace with real API call
    // const response = await fetch('/api/planning/start', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ query })
    // });
    // const { planId } = await response.json();
    // setPlanId(planId);
    
    // TODO: Replace with WebSocket connection for real-time updates
    // const ws = new WebSocket(`ws://localhost:8000/api/planning/${planId}/stream`);
    // ws.onmessage = (event) => {
    //   const data = JSON.parse(event.data);
    //   setCurrentThinking(data.message);
    //   setCompletedSteps(prev => [...prev, data]);
    // };

    // Mock simulation - REMOVE when backend is integrated
    for (let i = 0; i < thinkingSequence.length; i++) {
      setCurrentThinking(thinkingSequence[i].msg);
      await new Promise((r) => setTimeout(r, 1000)); // TODO: Remove artificial delay
      setCompletedSteps((prev) => [...prev, thinkingSequence[i]]);
    }

    setIsLoading(false);
    setStep("direction");
  };

  /**
   * Handles travel option selection
   * 
   * TODO: Replace with real API call
   * POST /api/planning/{planId}/select-option
   * Body: { optionId: string }
   * Response: { budget: BudgetItem[], totalBudget: string, strategyId: string }
   */
  const handleSelectOption = async (optionId: string) => {
    setIsLoading(true);
    setStep("processing");
    
    // TODO: Replace with real API call
    // const response = await fetch(`/api/planning/${planId}/select-option`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ optionId })
    // });
    // const budgetData = await response.json();
    // setBudgetData(budgetData.items);
    
    setCurrentThinking(
      "Allocating budget resources and checking live availability peaks...",
    );
    await new Promise((r) => setTimeout(r, 1500)); // TODO: Remove artificial delay
    setIsLoading(false);
    setStep("budget");
  };

  /**
   * Handles budget approval
   * 
   * TODO: Replace with real API call
   * POST /api/planning/{planId}/approve-budget
   * Body: { approved: true }
   * Response: { tripPlan: TripPlan }
   */
  const handleApproveBudget = async () => {
    setIsLoading(true);
    setStep("processing");
    
    // TODO: Replace with real API call
    // const response = await fetch(`/api/planning/${planId}/approve-budget`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ approved: true })
    // });
    // const tripPlan = await response.json();
    // setTripPlan(tripPlan);
    
    setCurrentThinking(
      "Validating logistics and generating final execution dossier...",
    );
    await new Promise((r) => setTimeout(r, 1500)); // TODO: Remove artificial delay
    setIsLoading(false);
    setStep("final");
  };

  /**
   * Handles budget recalibration request
   * 
   * TODO: Implement recalibration API call
   * POST /api/planning/{planId}/recalibrate
   * Body: { constraints: { budget?: number, duration?: number, ... } }
   * Response: { budget: BudgetItem[], totalBudget: string }
   */
  const handleRecalibrate = () => {
    // TODO: Replace with real API call
    // const response = await fetch(`/api/planning/${planId}/recalibrate`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ constraints: {} })
    // });
    // const updatedBudget = await response.json();
    // setBudgetData(updatedBudget.items);
    console.log("Recalibrating budget parameters...");
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-slate-900 font-sans selection:bg-stone-200">
      <Header currentStep={step} />

      <main className="max-w-5xl mx-auto px-6 pt-12 pb-32">
        {step === "input" && (
          <InputStep
            query={query}
            onQueryChange={setQuery}
            onStartPlanning={handleStartPlanning}
          />
        )}

        {step === "processing" && (
          <ProcessingStep
            currentThinking={currentThinking}
            completedSteps={completedSteps}
          />
        )}

        {step === "direction" && (
          <DirectionStep
            options={travelOptions} // TODO: Replace with travelOptions state from API
            onSelectOption={handleSelectOption}
          />
        )}

        {step === "budget" && (
          <BudgetStep
            totalBudget="13,400" // TODO: Replace with budgetData.totalBudget from API
            strategyId="RS-402" // TODO: Replace with budgetData.strategyId from API
            items={budgetItems} // TODO: Replace with budgetData.items from API
            onApprove={handleApproveBudget}
            onRecalibrate={handleRecalibrate}
          />
        )}

        {step === "final" && <FinalStep tripPlan={mockTripPlan} />} {/* TODO: Replace with tripPlan state from API */}
      </main>

      <Stepper currentStep={step} />
    </div>
  );
}
