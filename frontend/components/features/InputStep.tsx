import React from "react";
import { Sparkles, ArrowRight } from "lucide-react";
import { Button, SearchInput, Badge } from "@/components/ui";

interface InputStepProps {
  query: string;
  onQueryChange: (value: string) => void;
  onStartPlanning: () => void;
}

/**
 * Initial input step for travel query
 */
export const InputStep: React.FC<InputStepProps> = ({
  query,
  onQueryChange,
  onStartPlanning,
}) => {
  // TODO: Replace with API call to fetch popular queries
  // Endpoint: GET /api/popular-queries
  // Should return trending/popular travel queries based on user data
  const popularQueries = [
    {
      label: "Rishikesh Budget",
      query:
        "Plan a 4-day solo backpacking trip to Rishikesh from Delhi next weekend with a total budget of ₹15,000.",
    },
    {
      label: "Kyoto / Osaka",
      query: "7-day exploration of Kyoto and Osaka under $3000 from Bengaluru.",
    },
  ];

  return (
    <div className="mt-12 md:mt-24 space-y-12 animate-in fade-in duration-700 max-w-3xl">
      <div className="space-y-4">
        <Badge variant="stone" className="inline-flex">
          <Sparkles size={12} className="text-amber-500" />
          Powered by Agentic AI
        </Badge>

        <h2 className="text-5xl md:text-6xl font-medium text-stone-900 tracking-tight leading-[1.1]">
          Plan your next trip with{" "}
          <span className="text-stone-400 font-medium italic">
            unrivaled wisdom.
          </span>
        </h2>

        <p className="text-stone-500 text-lg md:text-xl font-light max-w-xl">
          Our multi-agent system conducts real-world research to build
          actionable, budget-optimized journeys in seconds.
        </p>
      </div>

      <SearchInput
        value={query}
        onChange={onQueryChange}
        onSubmit={onStartPlanning}
        placeholder="e.g., 4-day trip to Rishikesh under ₹15,000..."
        submitButton={
          <Button
            variant="primary"
            size="lg"
            onClick={onStartPlanning}
            icon={<ArrowRight size={18} />}
          >
            Analyze
          </Button>
        }
      />

      <div className="flex flex-wrap gap-4 items-center">
        <span className="text-[11px] uppercase tracking-widest text-stone-400 font-black">
          Popular Queries:
        </span>
        {popularQueries.map((item, idx) => (
          <button
            key={idx}
            className="text-xs font-semibold text-stone-600 bg-white px-5 py-2.5 rounded-full border border-stone-100 hover:border-stone-900 transition-all"
            onClick={() => onQueryChange(item.query)}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
};
