import React from "react";
import { Card, Button } from "@/components/ui";
import { Calendar, Clock, MapPin, ExternalLink, CheckCircle, Sparkles, Download } from "lucide-react";
import { generateItineraryPDFFromBackend } from "@/utils/pdfGenerator";

interface DayActivity {
  time: string;
  activity_name: string;
  description: string;
  location?: string;
  estimated_cost?: number;
  travel_time_from_previous?: string;
  notes?: string;
}

interface DayPlan {
  day_number: number;
  date: string;
  title: string;
  activities: DayActivity[];
  accommodation?: string;
  total_estimated_cost?: number;
  notes?: string;
}

interface BackendItinerary {
  destination: string;
  start_date: string;
  end_date: string;
  total_days: number;
  daily_plans: DayPlan[];
  total_estimated_cost?: number;
  packing_suggestions?: string[];
  travel_tips?: string[];
}

interface ItineraryCardProps {
  itinerary: BackendItinerary;
}

/**
 * Determines special indicator for an activity
 */
function getActivityIndicator(activity: DayActivity, index: number): string | null {
  if (index === 0) return "Agent selected";
  if (activity.notes) return "RAG Insight";
  if (activity.location) return "Location verified";
  return null;
}

/**
 * Display itinerary in clean card format matching reference design
 */
export const ItineraryCard: React.FC<ItineraryCardProps> = ({ itinerary }) => {
  return (
    <div className="space-y-6 my-6">
      {/* Header Card */}
      <Card variant="dark" padding="lg" rounded="2xl">
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-2xl font-bold text-white">
                {itinerary.destination}
              </h3>
              <div className="flex items-center gap-2 mt-2">
                <div className="bg-stone-800 px-3 py-1 rounded-lg">
                  <span className="text-xs text-stone-300">
                    {itinerary.start_date} to {itinerary.end_date}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-3 shrink-0">
              {itinerary.total_estimated_cost != null && (
                <div className="text-right">
                  <div className="text-xs text-stone-500 uppercase tracking-wider">
                    Total Budget
                  </div>
                  <div className="text-2xl font-bold text-white">
                    ₹{itinerary.total_estimated_cost.toFixed(0)}
                  </div>
                </div>
              )}
              <Button
                variant="secondary"
                size="sm"
                icon={<Download size={14} />}
                onClick={() => generateItineraryPDFFromBackend(itinerary)}
                className="bg-stone-700! text-white! border-stone-600! hover:bg-stone-600!"
              >
                Download PDF
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-stone-400">
            <Clock size={12} />
            <span className="uppercase tracking-wider">
              STRATEGIC SCHEDULE LOGGED
            </span>
          </div>
        </div>
      </Card>

      {/* Day Cards */}
      {itinerary.daily_plans.map((day) => (
        <Card key={day.day_number} variant="outlined" padding="md" rounded="2xl">
          <div className="space-y-4">
            {/* Day Header */}
            <div className="flex items-center gap-4 border-b border-stone-200 pb-4">
              <div className="shrink-0 w-12 h-12 rounded-xl bg-stone-900 flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  D{day.day_number}
                </span>
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-stone-900 text-lg">{day.title}</h4>
                <p className="text-sm text-stone-500">{day.date}</p>
              </div>
              {day.total_estimated_cost && (
                <div className="text-right">
                  <div className="text-xs text-stone-500">Day Total</div>
                  <div className="font-bold text-stone-900">
                    ₹{day.total_estimated_cost.toFixed(0)}
                  </div>
                </div>
              )}
            </div>

            {/* Activities Timeline */}
            <div className="space-y-4">
              {day.activities.map((activity, idx) => {
                const indicator = getActivityIndicator(activity, idx);

                return (
                  <div key={idx} className="flex gap-4">
                    {/* Time Column */}
                    <div className="shrink-0 w-20 text-right">
                      <span className="text-sm font-bold text-stone-500">
                        {activity.time}
                      </span>
                    </div>

                    {/* Activity Details */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h5 className="font-bold text-stone-900">
                            {activity.activity_name}
                          </h5>
                          {indicator && (
                            <div className="flex items-center gap-1 mt-1">
                              <Sparkles size={10} className="text-amber-500" />
                              <span className="text-xs text-stone-500">
                                {indicator}
                              </span>
                            </div>
                          )}
                        </div>
                        {activity.estimated_cost !== undefined &&
                          activity.estimated_cost > 0 && (
                            <span className="text-sm font-bold text-stone-900">
                              ₹{activity.estimated_cost.toFixed(0)}
                            </span>
                          )}
                      </div>

                      <p className="text-sm text-stone-600 leading-relaxed">
                        {activity.description}
                      </p>

                      {/* Location & Links */}
                      <div className="flex items-center gap-4 flex-wrap">
                        {activity.location && (
                          <div className="flex items-center gap-1 text-xs text-stone-500">
                            <MapPin size={12} />
                            <span>{activity.location}</span>
                            <button className="ml-1 hover:text-stone-900">
                              <ExternalLink size={10} />
                            </button>
                          </div>
                        )}
                        {activity.travel_time_from_previous && (
                          <div className="flex items-center gap-1 text-xs text-stone-500">
                            <Clock size={12} />
                            <span>{activity.travel_time_from_previous} travel</span>
                          </div>
                        )}
                      </div>

                      {/* Notes */}
                      {activity.notes && (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                          <p className="text-xs text-amber-900">
                            <span className="font-semibold">Tip:</span>{" "}
                            {activity.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Day Footer */}
            {day.accommodation && (
              <div className="border-t border-stone-200 pt-4 flex items-center gap-2 text-sm text-stone-600">
                <div className="w-6 h-6 rounded bg-stone-100 flex items-center justify-center">
                  <span className="text-xs">🏨</span>
                </div>
                <span className="font-semibold">Accommodation:</span>
                <span>{day.accommodation}</span>
              </div>
            )}

            {day.notes && (
              <div className="border-t border-stone-200 pt-4">
                <p className="text-sm text-stone-600 italic">{day.notes}</p>
              </div>
            )}
          </div>
        </Card>
      ))}

      {/* Packing & Tips Cards */}
      {(itinerary.packing_suggestions || itinerary.travel_tips) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {itinerary.packing_suggestions &&
            itinerary.packing_suggestions.length > 0 && (
              <Card variant="elevated" padding="md" rounded="2xl">
                <h4 className="font-bold text-stone-900 mb-3 flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-stone-900 flex items-center justify-center">
                    <span className="text-xs">🎒</span>
                  </div>
                  Packing Suggestions
                </h4>
                <ul className="space-y-2">
                  {itinerary.packing_suggestions.map((item, idx) => (
                    <li
                      key={idx}
                      className="text-sm text-stone-600 flex items-start gap-2"
                    >
                      <CheckCircle size={14} className="text-stone-400 mt-0.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

          {itinerary.travel_tips && itinerary.travel_tips.length > 0 && (
            <Card variant="elevated" padding="md" rounded="2xl">
              <h4 className="font-bold text-stone-900 mb-3 flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-amber-500 flex items-center justify-center">
                  <span className="text-xs">💡</span>
                </div>
                Travel Tips
              </h4>
              <ul className="space-y-2">
                {itinerary.travel_tips.map((tip, idx) => (
                  <li
                    key={idx}
                    className="text-sm text-stone-600 flex items-start gap-2"
                  >
                    <CheckCircle size={14} className="text-amber-500 mt-0.5 shrink-0" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};
