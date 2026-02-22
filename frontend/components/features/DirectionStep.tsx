import React from "react";
import { ShieldCheck, Zap, ArrowRight } from "lucide-react";
import { TravelOption } from "@/types";
import { Badge } from "@/components/ui";

interface DirectionStepProps {
  options: TravelOption[];
  onSelectOption: (optionId: string) => void;
}

/**
 * Strategic direction selection step
 */
export const DirectionStep: React.FC<DirectionStepProps> = ({
  options,
  onSelectOption,
}) => {
  return (
    <div className="space-y-12 animate-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <h2 className="text-3xl font-semibold tracking-tight text-stone-900">
            Found Strategic Directions
          </h2>
          <p className="text-stone-500 font-light max-w-md">
            {/* TODO: Replace hardcoded text with dynamic count from API response */}
            Our agents analyzed 42 permutations and curated three
            high-feasibility paths for your trip.
          </p>
        </div>
        {/* TODO: Make validation badge dynamic based on API response */}
        {/* Show only if prices are validated via external APIs */}
        <Badge variant="amber" size="md">
          <ShieldCheck size={14} />
          Price Validated via Amadeus {/* TODO: Replace with actual validation source from API */}
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-5">
        {options.map((opt) => (
          <div
            key={opt.id}
            className="group bg-white border border-stone-200 p-8 rounded-[1.8rem] hover:border-stone-900 transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between shadow-sm hover:shadow-xl hover:-translate-y-1"
            onClick={() => onSelectOption(opt.id)}
          >
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-2xl text-stone-900 tracking-tight">
                  {opt.title}
                </h3>
                <span className="bg-stone-100 text-stone-500 text-[9px] font-black uppercase px-2 py-0.5 rounded tracking-[0.1em]">
                  {opt.meta}
                </span>
              </div>
              <p className="text-stone-500 text-base font-light leading-relaxed max-w-lg">
                {opt.desc}
              </p>
              <div className="flex items-center gap-6 pt-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-stone-400">
                  <Zap size={14} className="text-amber-500" />
                  {/* TODO: Replace hardcoded highlights with opt.highlights from API response */}
                  Agent-Curated Highlights: Rafting, Beatles Ashram, Aarti
                </div>
              </div>
            </div>
            <div className="mt-6 md:mt-0 text-right md:pl-10 md:border-l border-stone-100">
              <p className="text-[10px] text-stone-400 uppercase font-black tracking-widest mb-1">
                Estimated Capital
              </p>
              <p className="text-4xl font-light text-stone-950 tracking-tighter">
                ₹{opt.price}
              </p>
              <button className="mt-4 text-[11px] font-bold text-stone-900 flex items-center gap-2 group-hover:gap-3 transition-all ml-auto uppercase tracking-widest underline underline-offset-4">
                Explore Logistics <ArrowRight size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
