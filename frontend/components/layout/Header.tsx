import React from "react";
import { Compass, Plus } from "lucide-react";

interface HeaderProps {
  isAgentActive?: boolean;
  onNewChat?: () => void;
}

/**
 * Application header with navigation and status indicator
 */
export const Header: React.FC<HeaderProps> = ({ 
  isAgentActive = false,
  onNewChat 
}) => {
  return (
    <header className="h-16 border-b border-stone-100 bg-white/90 backdrop-blur-xl sticky top-0 z-50 px-6 md:px-8 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="bg-stone-900 p-2 rounded-xl shadow-lg shadow-stone-200">
          <Compass className="text-white" size={18} />
        </div>
        <div>
          <span className="text-lg font-semibold tracking-tight text-stone-950">
            WanderWise AI
          </span>
          <p className="text-[10px] text-stone-500 uppercase tracking-wider font-bold">
            Travel Planning Assistant
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {onNewChat && (
          <button 
            onClick={onNewChat}
            className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition-all uppercase tracking-wider"
          >
            <Plus size={14} />
            New Chat
          </button>
        )}
        
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-50 border border-stone-100 text-[10px] font-bold text-stone-500 uppercase tracking-wider">
          <div
            className={`w-1.5 h-1.5 rounded-full ${
              isAgentActive
                ? "bg-amber-400 animate-pulse"
                : "bg-emerald-500"
            }`}
          ></div>
          {isAgentActive ? "AI Thinking" : "Ready"}
        </div>
      </div>
    </header>
  );
};
