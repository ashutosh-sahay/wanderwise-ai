import React from "react";
import { Compass } from "lucide-react";
import { StepType } from "@/types";

interface HeaderProps {
  currentStep: StepType;
}

/**
 * Application header with navigation and status indicator
 */
export const Header: React.FC<HeaderProps> = ({ currentStep }) => {
  return (
    <header className="h-20 border-b border-stone-100 bg-white/70 backdrop-blur-xl sticky top-0 z-50 px-6 md:px-12 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <div className="bg-stone-900 p-2 rounded-xl shadow-lg shadow-stone-200">
          <Compass className="text-white" size={20} />
        </div>
        <span className="text-xl font-semibold tracking-tight text-stone-950">
          WanderWise
        </span>
      </div>

      <nav className="hidden md:flex items-center gap-8 text-[13px] font-medium text-stone-400">
        <button className="text-stone-900 border-b-2 border-stone-900 py-6">
          Planning
        </button>
        <button className="hover:text-stone-900 transition-colors">
          Past Trips
        </button>
      </nav>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-50 border border-stone-100 text-[11px] font-bold text-stone-500 uppercase tracking-wider">
          <div
            className={`w-1.5 h-1.5 rounded-full ${
              currentStep === "final"
                ? "bg-emerald-500"
                : "bg-amber-400 animate-pulse"
            }`}
          ></div>
          {currentStep === "final" ? "Agent Finalized" : "Agent Active"}
        </div>
      </div>
    </header>
  );
};
