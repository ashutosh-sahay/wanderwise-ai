import React from "react";
import { Compass, CheckCircle2 } from "lucide-react";
import { AgentThinking } from "@/types";

interface ProcessingStepProps {
  currentThinking: string;
  completedSteps: AgentThinking[];
}

/**
 * Agent thinking visualization step
 */
export const ProcessingStep: React.FC<ProcessingStepProps> = ({
  currentThinking,
  completedSteps,
}) => {
  return (
    <div className="mt-20 flex flex-col items-center max-w-xl mx-auto space-y-12 animate-in fade-in duration-500">
      <div className="relative flex items-center justify-center">
        <div className="w-24 h-24 border border-stone-200 rounded-full animate-[spin_3s_linear_infinite]"></div>
        <div className="absolute w-16 h-16 border-b-2 border-stone-900 rounded-full animate-spin"></div>
        <Compass className="absolute text-stone-950" size={24} />
      </div>

      <div className="w-full space-y-8">
        <div className="text-center space-y-2">
          <h3 className="text-sm font-black uppercase tracking-[0.3em] text-stone-400">
            Agent Intelligence
          </h3>
          <p className="text-xl font-medium text-stone-900 italic">
            &quot;{currentThinking}&quot;
          </p>
        </div>

        <div className="space-y-3">
          {completedSteps.map((step, i) => (
            <div
              key={i}
              className="flex items-start gap-4 px-4 py-3 bg-white border border-stone-100 rounded-xl animate-in slide-in-from-bottom-2 duration-300 shadow-sm"
            >
              <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
              <span className="text-xs font-black text-stone-400 min-w-[100px] uppercase tracking-widest shrink-0">
                {step.agent}
              </span>
              <span className="text-sm text-stone-600 font-medium flex-1 leading-relaxed">
                {step.msg}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
