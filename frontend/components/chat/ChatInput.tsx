import React, { useState, KeyboardEvent } from "react";
import { Send } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

/**
 * Simple chat input component
 */
export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  disabled = false,
  placeholder = "Message WanderWise AI...",
}) => {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (input.trim() && !disabled) {
      onSendMessage(input.trim());
      setInput("");
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-stone-200 bg-white p-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex gap-3 items-end bg-white rounded-2xl border border-stone-200 focus-within:border-stone-400 transition-colors p-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="flex-1 resize-none outline-none text-[15px] placeholder:text-stone-400 disabled:opacity-50 max-h-32 overflow-y-auto"
            style={{
              minHeight: "24px",
            }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = "24px";
              target.style.height = Math.min(target.scrollHeight, 128) + "px";
            }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || disabled}
            className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
              input.trim() && !disabled
                ? "bg-stone-900 text-white hover:bg-stone-800"
                : "bg-stone-100 text-stone-400 cursor-not-allowed"
            }`}
          >
            <Send size={16} />
          </button>
        </div>
        <div className="text-[11px] text-stone-400 text-center mt-2">
          WanderWise AI can make mistakes. Verify important travel information.
        </div>
      </div>
    </div>
  );
};
