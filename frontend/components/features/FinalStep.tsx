import React from "react";
import {
  Compass,
  Calendar,
  LayoutDashboard,
  Wallet,
  ExternalLink,
  ShieldCheck,
  Zap,
  Clock,
  MapPin,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { TripPlan } from "@/types";
import { Card, Button } from "@/components/ui";

interface FinalStepProps {
  tripPlan: TripPlan;
}

/**
 * Final trip dossier with complete itinerary
 */
export const FinalStep: React.FC<FinalStepProps> = ({ tripPlan }) => {
  return (
    <div className="space-y-16 animate-in fade-in duration-1000 pb-40">
      {/* Dossier Cover */}
      <Card
        variant="outlined"
        padding="lg"
        rounded="3xl"
        className="relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] rotate-12">
          <Compass size={300} />
        </div>
        <div className="flex flex-col md:flex-row justify-between items-start gap-12 relative z-10">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="text-[11px] uppercase font-black tracking-[0.4em] text-stone-400">
                Verified Plan TEP-1
              </span>
              <div className="h-[1px] w-12 bg-stone-200"></div>
            </div>
            <h2 className="text-6xl font-medium text-stone-950 tracking-tighter leading-none italic">
              {tripPlan.destination}{" "}
              <span className="text-stone-300">Expedition</span>
            </h2>
            <div className="flex flex-wrap gap-10 text-[13px] text-stone-500 font-bold uppercase tracking-[0.15em]">
              <span className="flex items-center gap-2.5">
                <Calendar size={16} className="text-stone-300" />
                {tripPlan.duration}
              </span>
              <span className="flex items-center gap-2.5">
                <LayoutDashboard size={16} className="text-stone-300" />
                {tripPlan.style}
              </span>
              <span className="flex items-center gap-2.5">
                <Wallet size={16} className="text-stone-300" />
                Efficiency: {tripPlan.efficiency}
              </span>
            </div>
          </div>
          <div className="space-y-4 shrink-0 w-full md:w-auto">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              icon={<ExternalLink size={14} />}
              onClick={() => {
                // TODO: Implement export functionality
                // Option 1: API endpoint GET /api/planning/{planId}/export?format=pdf|json|html
                // Option 2: Generate PDF/JSON client-side from tripPlan data
                // Should download itinerary in selected format
              }}
            >
              Export Itinerary
            </Button>
            <div className="flex items-center justify-center gap-4 text-[10px] text-stone-400 font-bold uppercase tracking-widest">
              <span className="flex items-center gap-1">
                <ShieldCheck size={12} /> Amadeus Verified
              </span>
              <span className="flex items-center gap-1">
                <Zap size={12} /> Agentic Optimization
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Itinerary Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        <div className="lg:col-span-8 space-y-20">
          {tripPlan.days.map((day, i) => (
            <div key={i} className="relative group">
              <div className="flex items-center gap-8 mb-12">
                <div className="bg-stone-950 text-white w-14 h-14 rounded-[1.2rem] flex items-center justify-center font-bold text-base shadow-2xl">
                  D{day.day}
                </div>
                <div>
                  <h3 className="text-3xl font-medium text-stone-900 tracking-tight leading-none">
                    {day.title}
                  </h3>
                  <p className="text-stone-400 text-xs font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
                    <Clock size={12} /> Strategic Schedule Logged
                  </p>
                </div>
              </div>

              <div className="ml-7 pl-12 border-l border-stone-100 space-y-10">
                {day.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6 group/item"
                  >
                    <div className="absolute top-1/2 -left-12 w-6 h-[1px] bg-stone-200"></div>
                    <div className="flex gap-8">
                      <span className="text-[10px] font-black text-stone-300 mt-1 uppercase tracking-[0.2em] w-20 shrink-0">
                        {item.time}
                      </span>
                      <div className="space-y-2">
                        <p className="font-semibold text-stone-950 text-xl tracking-tight leading-none">
                          {item.label}
                        </p>
                        <div className="flex items-center gap-2 py-1 px-2.5 bg-stone-50 rounded-lg w-fit">
                          <Zap size={10} className="text-amber-500 shrink-0" />
                          <p className="text-stone-500 text-[11px] font-medium leading-tight">
                            {item.note}
                          </p>
                        </div>
                        <div className="flex gap-6 pt-1">
                          {item.link && (
                            <a
                              href={`https://${item.link}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-stone-950 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 border-b border-stone-200 hover:border-stone-900 transition-all"
                            >
                              Direct Booking <ExternalLink size={10} />
                            </a>
                          )}
                          {item.map && (
                            <span className="text-stone-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 cursor-pointer hover:text-stone-950 transition-all">
                              <MapPin size={10} /> Global Maps
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <span className="text-lg font-light text-stone-950 tracking-tight px-4 py-1.5 bg-stone-50 rounded-xl shrink-0 text-center min-w-[80px]">
                      {item.cost}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar Insights */}
        <div className="lg:col-span-4 space-y-10">
          {/* Dynamic Replanning */}
          <Card
            variant="default"
            padding="lg"
            rounded="3xl"
            className="bg-stone-50 text-center"
          >
            <h5 className="text-lg font-medium text-stone-900 tracking-tight leading-tight mb-6">
              Need to recalibrate the agentic objective?
            </h5>
            <p className="text-stone-400 text-xs font-light px-4 mb-6">
              Our agents can adjust the entire workflow based on new constraints
              like "Reduce budget to ₹10k" or "Add extra day for trekking".
            </p>
            <Button 
              variant="outline" 
              size="md" 
              fullWidth
              onClick={() => {
                // TODO: Implement re-initialization
                // POST /api/planning/{planId}/replan
                // Body: { constraints: string } (e.g., "Reduce budget to ₹10k")
                // Should reset workflow and start new planning process
              }}
            >
              Re-Initialize Flow
            </Button>
          </Card>

          {/* Agent Intelligence Outcome */}
          <Card variant="dark" padding="lg" rounded="3xl" className="relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10 opacity-5">
              <Sparkles size={100} />
            </div>
            <div className="flex items-center gap-3 text-stone-100 relative z-10">
              <TrendingUp size={20} className="text-amber-500" />
              <h4 className="font-bold uppercase tracking-[0.3em] text-[10px]">
                Intelligence Summary
              </h4>
            </div>
            <div className="space-y-8 relative z-10 mt-8">
              {tripPlan.insights.map((tip, i) => (
                <div key={i} className="space-y-2 border-l border-stone-800 pl-6">
                  <p className="text-stone-500 text-[9px] font-black uppercase tracking-[0.2em]">
                    {tip.title}
                  </p>
                  <p className="text-sm leading-relaxed text-stone-300 font-light italic">
                    "{tip.body}"
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
