import React from "react";
import { Message } from "@/types";
import { User, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChatMessageProps {
  message: Message;
}

/**
 * Simple chat message component with markdown support
 */
export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-3 mb-6 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-stone-900 flex items-center justify-center">
          <Sparkles size={16} className="text-white" />
        </div>
      )}
      
      <div className={`max-w-[80%] ${isUser ? "order-first" : ""}`}>
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
        
        <div className={`mt-1 px-2 text-[10px] text-stone-400 ${isUser ? "text-right" : "text-left"}`}>
          {new Date(message.timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </div>

      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center">
          <User size={16} className="text-stone-600" />
        </div>
      )}
    </div>
  );
};
