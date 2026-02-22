import React, { useRef, useEffect } from "react";
import { Search } from "lucide-react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  submitButton?: React.ReactNode;
}

/**
 * Search input component with submit button and auto-expanding textarea
 * Automatically expands vertically to accommodate longer queries
 */
export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  onSubmit,
  placeholder = "Enter your travel query...",
  submitButton,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea based on content
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = "auto";
      // Set height based on scrollHeight, with min-height of single line
      const scrollHeight = textarea.scrollHeight;
      const minHeight = 56; // Approximate height for single line (py-4 = 16px top + 16px bottom + 24px line-height)
      textarea.style.height = `${Math.max(scrollHeight, minHeight)}px`;
    }
  }, [value]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter (but not Shift+Enter)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="relative group">
      <div className="absolute -inset-1 bg-gradient-to-r from-stone-200 to-stone-300 rounded-[2.5rem] blur opacity-20 transition duration-1000 group-hover:opacity-40"></div>
      <div className="relative bg-white p-3 rounded-[2rem] shadow-xl shadow-stone-200/50 border border-stone-100 flex flex-col md:flex-row gap-3">
        <div className="flex-1 flex items-start px-6">
          <Search size={20} className="text-stone-300 shrink-0 mt-4" />
          <textarea
            ref={textareaRef}
            className="w-full bg-transparent px-4 py-4 outline-none text-xl text-stone-800 placeholder:text-stone-300 font-light resize-none overflow-hidden min-h-[56px] leading-relaxed"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyPress={handleKeyPress}
            rows={1}
          />
        </div>
        <div className="flex items-start pt-2 md:pt-0">
          {submitButton}
        </div>
      </div>
    </div>
  );
};
