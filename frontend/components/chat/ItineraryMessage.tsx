import React from "react";
import { TripPlan } from "@/types";
import { Card } from "@/components/ui";
import { Calendar, Sparkles, CheckCircle } from "lucide-react";

interface ItineraryMessageProps {
  itinerary: TripPlan;
}

/**
 * Chat message component for displaying final itinerary
 */
export const ItineraryMessage: React.FC<ItineraryMessageProps> = ({
  itinerary,
}) => {
  return (
    <div className="space-y-6">
      <Card variant="dark" padding="lg" rounded="2xl">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-2xl font-bold text-white">
                {itinerary.destination}
              </h3>
              <p className="text-stone-400 mt-1">{itinerary.duration}</p>
            </div>
            <div className="text-right">
              <div className="text-xs text-stone-500 uppercase tracking-wider">
                Total Budget
              </div>
              <div className="text-2xl font-bold text-white">
                ${itinerary.totalBudget}
              </div>
            </div>
          </div>

          <div className="flex gap-4 text-xs">
            <div className="flex items-center gap-2">
              <Sparkles size={12} className="text-amber-400" />
              <span className="text-stone-400">{itinerary.style}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle size={12} className="text-emerald-400" />
              <span className="text-stone-400">{itinerary.efficiency}</span>
            </div>
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        {itinerary.days.map((day) => (
          <Card key={day.day} variant="outlined" padding="md" rounded="2xl">
            <div className="space-y-4">
              <div className="flex items-center gap-3 border-b border-stone-200 pb-3">
                <Calendar size={20} className="text-stone-600" />
                <div>
                  <h4 className="font-bold text-stone-900">Day {day.day}</h4>
                  <p className="text-sm text-stone-600">{day.title}</p>
                </div>
              </div>

              <div className="space-y-3">
                {day.items.map((item, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className="flex-shrink-0 w-16 text-xs font-semibold text-stone-500">
                      {item.time}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-1">
                        <h5 className="font-semibold text-stone-900">
                          {item.label}
                        </h5>
                        <span className="text-xs font-bold text-stone-600">
                          {item.cost}
                        </span>
                      </div>
                      <p className="text-xs text-stone-600">{item.note}</p>
                      {item.link && (
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-stone-500 hover:text-stone-900 underline mt-1 inline-block"
                        >
                          View details
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {itinerary.insights.length > 0 && (
        <Card variant="elevated" padding="md" rounded="2xl">
          <h4 className="font-bold text-stone-900 mb-3 flex items-center gap-2">
            <Sparkles size={16} className="text-amber-500" />
            Pro Tips
          </h4>
          <div className="space-y-2">
            {itinerary.insights.map((insight, idx) => (
              <div key={idx} className="text-sm">
                <h5 className="font-semibold text-stone-900">{insight.title}</h5>
                <p className="text-stone-600">{insight.body}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
