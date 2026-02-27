import React from "react";
import { Card } from "@/components/ui";
import { MapPin } from "lucide-react";

interface PlaceToVisit {
  name: string;
  description: string;
  rationale: string;
  sources: string[];
}

interface WeatherDetails {
  weather_trends: string;
  best_time_to_visit: string;
  current_temperature: string;
  current_weather_condition: string;
  sources: string[];
}

interface StayOption {
  area: string;
  type_of_stay: string;
  estimated_price_range: string;
  rationale: string;
  sources: string[];
}

interface TravelResearch {
  places_to_visit?: {
    places_to_visit: PlaceToVisit[];
  };
  weather_details?: WeatherDetails;
  transportation_routes?: {
    routes: Array<{
      start_point: string;
      end_point: string;
      mode_of_transport: string;
      duration: string;
      estimated_cost?: number;
    }>;
  };
  stay_options?: {
    options: StayOption[];
  };
  total_plan_cost?: number;
}

interface TravelPlansCardProps {
  plans: Record<string, TravelResearch>;
  onSelectPlan: (planName: string) => void;
  duration?: number; // Optional duration in days
}

/**
 * Calculates total estimated cost for the plan including transportation and accommodation
 * Prioritizes using total_plan_cost from backend if available, otherwise calculates from components
 */
function estimateCost(plan: TravelResearch, duration: number = 4): string {
  // 1. If backend already calculated total_plan_cost, use that directly
  if (plan.total_plan_cost && plan.total_plan_cost > 0) {
    return `₹${Math.round(plan.total_plan_cost).toLocaleString()}`;
  }

  // 2. Otherwise, fallback to calculating from components
  let totalCost = 0;
  let hasValidCost = false;

  // Add transportation costs
  if (plan.transportation_routes?.routes && plan.transportation_routes.routes.length > 0) {
    const transportCosts = plan.transportation_routes.routes
      .filter(route => route.estimated_cost && route.estimated_cost > 0)
      .reduce((sum, route) => sum + (route.estimated_cost || 0), 0);
    
    if (transportCosts > 0) {
      totalCost += transportCosts;
      hasValidCost = true;
    }
  }

  // Add accommodation costs (per night × duration)
  if (plan.stay_options?.options && plan.stay_options.options.length > 0) {
    const firstStay = plan.stay_options.options[0];
    const priceRange = firstStay.estimated_price_range || "";

    // Try multiple patterns to extract price per night
    // Pattern 1: "$50-100 per night" or "₹500-1000 per night"
    const perNightMatch = priceRange.match(/(?:[\$₹]|Rs\.?)\s*([\d,]+)(?:\s*[-–]\s*[\d,]+)?/i);
    if (perNightMatch) {
      const pricePerNight = parseInt(perNightMatch[1].replace(/,/g, ""));
      totalCost += pricePerNight * duration;
      hasValidCost = true;
    } else {
      // Pattern 2: Just numbers "500-1000"
      const numberMatch = priceRange.match(/([\d,]+)(?:\s*[-–]\s*[\d,]+)?/);
      if (numberMatch) {
        const pricePerNight = parseInt(numberMatch[1].replace(/,/g, ""));
        totalCost += pricePerNight * duration;
        hasValidCost = true;
      }
    }
  }

  // Return formatted total or fallback message
  if (hasValidCost && totalCost > 0) {
    return `₹${totalCost.toLocaleString()}`;
  }

  return "Contact for pricing";
}

/**
 * Determines plan badge based on plan name and characteristics
 */
function getPlanBadge(planName: string, plan: TravelResearch): string {
  const name = planName.toLowerCase();

  if (name.includes("budget") || name.includes("economical") || name.includes("backpacker")) {
    return "BUDGET CHOICE";
  }
  if (name.includes("luxury") || name.includes("premium") || name.includes("deluxe")) {
    return "EXPERIENCE MAX";
  }
  if (name.includes("balanced") || name.includes("moderate")) {
    return "BEST VALUE";
  }
  if (name.includes("adventure") || name.includes("thrill") || name.includes("explorer")) {
    return "ADVENTURE SEEKER";
  }
  if (name.includes("relax") || name.includes("wellness") || name.includes("leisure")) {
    return "RELAXATION FOCUS";
  }

  return "RECOMMENDED";
}

/**
 * Generates description based on plan content
 */
function generateDescription(planName: string, plan: TravelResearch): string {
  const placesCount = plan.places_to_visit?.places_to_visit?.length || 0;
  const stayType = plan.stay_options?.options?.[0]?.type_of_stay || "accommodations";
  const name = planName.toLowerCase();

  if (name.includes("relax") || name.includes("wellness") || name.includes("leisure")) {
    return `A peaceful itinerary focused on relaxation and wellness. Features ${placesCount} serene locations with ${stayType.toLowerCase()} for ultimate comfort.`;
  }
  if (name.includes("adventure") || name.includes("explorer") || name.includes("thrill")) {
    return `High-energy itinerary packed with adventures and unique experiences. Includes ${placesCount} exciting destinations with ${stayType.toLowerCase()}.`;
  }
  if (name.includes("luxury") || name.includes("premium")) {
    return `Premium experience with upscale ${stayType.toLowerCase()} and exclusive access. Discover ${placesCount} curated locations in style.`;
  }
  if (name.includes("budget") || name.includes("economical")) {
    return `Cost-effective itinerary maximizing value without compromising experience. Visit ${placesCount} attractions with budget-friendly ${stayType.toLowerCase()}.`;
  }

  return `A multi-modal focus combining the best experiences. Features ${placesCount} destinations with carefully selected ${stayType.toLowerCase()}.`;
}

/**
 * Extracts key highlights from places to visit
 */
function getHighlights(plan: TravelResearch): string[] {
  const highlights: string[] = [];

  if (plan.places_to_visit?.places_to_visit) {
    const topPlaces = plan.places_to_visit.places_to_visit.slice(0, 3);
    highlights.push(...topPlaces.map((place) => place.name));
  }

  if (plan.weather_details) {
    highlights.push(plan.weather_details.current_weather_condition);
  }

  return highlights;
}

/**
 * Display travel plans as styled cards matching reference design
 */
export const TravelPlansCard: React.FC<TravelPlansCardProps> = ({
  plans,
  onSelectPlan,
  duration = 4,
}) => {
  // Handle case where plans might be nested incorrectly
  let planEntries: Array<[string, TravelResearch]> = [];
  
  if (plans && typeof plans === 'object') {
    // Check if plans has a 'travel_plans' property (nested structure)
    if ('travel_plans' in plans && typeof plans.travel_plans === 'object') {
      planEntries = Object.entries(plans.travel_plans as Record<string, TravelResearch>);
    } else {
      // Direct structure
      planEntries = Object.entries(plans);
    }
  }

  // Filter out any invalid entries
  planEntries = planEntries.filter(([name, details]) => 
    name && 
    name !== 'travel_plans' && 
    details && 
    typeof details === 'object'
  );

  if (planEntries.length === 0) {
    console.warn('No valid travel plans found in data:', plans);
    return null;
  }

  return (
    <div className="space-y-6 my-6">
      {planEntries.map(([planName, planDetails]) => {
        const badge = getPlanBadge(planName, planDetails);
        const description = generateDescription(planName, planDetails);
        const highlights = getHighlights(planDetails);
        const estimatedCost = estimateCost(planDetails, duration);

        return (
          <Card
            key={planName}
            variant="outlined"
            padding="md"
            rounded="2xl"
            hoverable
            onClick={() => onSelectPlan(planName)}
            className="cursor-pointer transition-all duration-200"
          >
            <div className="space-y-3">
              {/* Header with title, badge, and cost */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <h3 className="text-lg font-bold text-stone-900">
                      {planName.charAt(0).toUpperCase() +
                        planName.slice(1).replace(/-/g, " ")}
                    </h3>
                    <span className="text-xs font-semibold text-stone-500 uppercase tracking-wide">
                      {badge}
                    </span>
                  </div>
                  <p className="text-sm text-stone-600 leading-relaxed line-clamp-2">
                    {description}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs text-stone-500 uppercase tracking-wide mb-0.5">
                    ESTIMATED
                  </div>
                  <div className="text-xl font-bold text-stone-900">
                    {estimatedCost}
                  </div>
                </div>
              </div>

              {/* Highlights - simplified */}
              {highlights.length > 0 && (
                <div className="pt-2 border-t border-stone-100">
                  <div className="flex flex-wrap gap-1.5">
                    {highlights.slice(0, 3).map((highlight, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 text-xs text-stone-600 bg-stone-50 px-2 py-1 rounded-md"
                      >
                        <MapPin size={10} className="text-stone-400 shrink-0" />
                        <span className="truncate max-w-[120px]">{highlight}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
};
