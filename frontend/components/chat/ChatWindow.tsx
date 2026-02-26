import React, { useRef, useEffect } from "react";
import { Message } from "@/types";
import { ChatMessage } from "./ChatMessage";
import { Loader2 } from "lucide-react";

interface ChatWindowProps {
  messages: Message[];
  isTyping?: boolean;
  onSelectPlan?: (planName: string) => void;
}

/**
 * Simple chat window displaying messages with auto-scroll
 */
export const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  isTyping = false,
  onSelectPlan,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  return (
    <div className="flex-1 overflow-y-auto px-6 py-8">
      <div className="max-w-3xl mx-auto">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} onSelectPlan={onSelectPlan} />
        ))}

        {isTyping && (
          <div className="flex gap-3 mb-6">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-stone-900 flex items-center justify-center">
              <Loader2 size={16} className="text-white animate-spin" />
            </div>
            <div className="bg-stone-100 px-4 py-3 rounded-2xl">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-stone-400 animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 rounded-full bg-stone-400 animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 rounded-full bg-stone-400 animate-bounce"></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};
