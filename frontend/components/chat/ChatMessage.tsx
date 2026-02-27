import React from "react";
import { Message } from "@/types";
import { User, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { TravelPlansCard } from "./TravelPlansCard";
import { ItineraryCard } from "./ItineraryCard";

interface ChatMessageProps {
  message: Message;
  onSelectPlan?: (planName: string) => void;
}

/**
 * Chat message component with markdown support and custom card components
 * Displays travel plans and itinerary using styled card components
 */
export const ChatMessage: React.FC<ChatMessageProps> = ({ message, onSelectPlan }) => {
  const isUser = message.role === "user";
  
  // Extract itinerary and plans from metadata
  const hasItinerary = message.metadata?.has_itinerary === true && message.metadata?.itinerary;
  const hasTravelPlans = message.metadata?.has_travel_plans === true && message.metadata?.travel_plans;

  return (
    <div className={`flex gap-3 mb-6 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="shrink-0 w-8 h-8 rounded-full bg-stone-900 flex items-center justify-center">
          <Sparkles size={16} className="text-white" />
        </div>
      )}
      
      <div className={`max-w-[85%] ${isUser ? "order-first" : ""}`}>
        {/* Main message bubble */}
        <div 
          className={`px-4 py-3 rounded-2xl ${
            isUser 
              ? "bg-stone-900 text-white" 
              : "bg-stone-100 text-stone-900"
          }`}
        >
          {isUser ? (
            <div className="text-[15px] leading-relaxed">
              {message.content}
            </div>
          ) : (
            <div className="text-[15px] leading-relaxed prose prose-sm prose-stone max-w-none prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-1 prose-headings:mt-3 prose-headings:mb-2">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Travel Plans Cards - Only show if no itinerary exists (plans are for selection) */}
        {!isUser && hasTravelPlans && !hasItinerary && message.metadata?.travel_plans && onSelectPlan && (
          <TravelPlansCard
            plans={message.metadata.travel_plans as Record<string, any>}
            onSelectPlan={onSelectPlan}
          />
        )}

        {/* Itinerary Card */}
        {!isUser && hasItinerary && message.metadata?.itinerary && (
          <ItineraryCard itinerary={message.metadata.itinerary as any} />
        )}
        
        {/* Timestamp */}
        <div className={`mt-1 px-2 text-[10px] text-stone-400 ${isUser ? "text-right" : "text-left"}`}>
          {new Date(message.timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </div>

      {isUser && (
        <div className="shrink-0 w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center">
          <User size={16} className="text-stone-600" />
        </div>
      )}
    </div>
  );
};
