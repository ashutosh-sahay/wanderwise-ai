import React from "react";
import { StepType } from "@/types";

interface StepperProps {
  currentStep: StepType;
}

const steps: StepType[] = ["input", "processing", "direction", "budget", "final"];

/**
 * Floating step indicator for desktop
 */
export const Stepper: React.FC<StepperProps> = ({ currentStep }) => {
  return (
    <div className="hidden xl:flex fixed right-12 top-1/2 -translate-y-1/2 flex-col gap-10 items-center bg-white p-5 rounded-full border border-stone-100 shadow-2xl shadow-stone-200/50">
      {steps.map((step, i) => (
        <div
          key={i}
          className={`w-2.5 h-2.5 rounded-full transition-all duration-700 ${
            currentStep === step
              ? "bg-stone-950 scale-150 ring-4 ring-stone-100"
              : "bg-stone-200"
          }`}
        ></div>
      ))}
    </div>
  );
};
