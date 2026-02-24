import React from "react";
import { Sparkles, Compass, Zap, Globe } from "lucide-react";
import { Card } from "@/components/ui";

/**
 * Welcome screen component for empty chat state
 */
export const ChatWelcome: React.FC = () => {
  const features = [
    {
      icon: <Compass size={20} />,
      title: "Multi-Agent Planning",
      description: "Our AI agents collaborate to research and plan your trip",
    },
    {
      icon: <Zap size={20} />,
      title: "Real-Time Research",
      description: "Live data from weather, places, and travel APIs",
    },
    {
      icon: <Globe size={20} />,
      title: "Budget Optimized",
      description: "Smart allocation across transport, stay, and activities",
    },
  ];

  return (
    <div className="flex-1 flex items-center justify-center px-6 py-12">
      <div className="max-w-2xl w-full space-y-8 text-center animate-in fade-in duration-700">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-stone-100 text-stone-600 text-xs font-bold uppercase tracking-wider">
            <Sparkles size={14} className="text-amber-500" />
            Powered by Agentic AI
          </div>
          
          <h1 className="text-5xl md:text-6xl font-medium text-stone-900 tracking-tight leading-[1.1]">
            Your AI Travel
            <br />
            <span className="text-stone-400 italic">Planning Assistant</span>
          </h1>
          
          <p className="text-stone-500 text-lg md:text-xl font-light max-w-xl mx-auto">
            Tell me about your dream trip and I&apos;ll help you create the perfect itinerary with real-time research and budget optimization.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          {features.map((feature, idx) => (
            <Card key={idx} variant="outlined" padding="md" rounded="2xl">
              <div className="space-y-3 text-left">
                <div className="w-10 h-10 rounded-xl bg-stone-900 text-white flex items-center justify-center">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-stone-900 text-sm mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-stone-600">
                    {feature.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="pt-4">
          <p className="text-xs text-stone-400 uppercase tracking-wider font-bold mb-3">
            Try asking:
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            <span className="px-4 py-2 bg-stone-50 text-stone-600 rounded-full text-xs border border-stone-200">
              4-day trip to Rishikesh under ₹15,000
            </span>
            <span className="px-4 py-2 bg-stone-50 text-stone-600 rounded-full text-xs border border-stone-200">
              Weekend getaway to Goa
            </span>
            <span className="px-4 py-2 bg-stone-50 text-stone-600 rounded-full text-xs border border-stone-200">
              7 days in Kyoto and Osaka
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
