import React from "react";
import { TravelOption } from "@/types";
import { Card } from "@/components/ui";
import { MapPin, DollarSign } from "lucide-react";

interface OptionsMessageProps {
  options: TravelOption[];
  onSelectOption: (optionId: string) => void;
}

/**
 * Chat message component for displaying travel options
 */
export const OptionsMessage: React.FC<OptionsMessageProps> = ({
  options,
  onSelectOption,
}) => {
  return (
    <div className="space-y-4">
      {options.map((option) => (
        <Card
          key={option.id}
          variant="outlined"
          padding="md"
          rounded="2xl"
          hoverable
          onClick={() => onSelectOption(option.id)}
          className="cursor-pointer"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              <h4 className="font-semibold text-stone-900 text-lg">
                {option.title}
              </h4>
              <p className="text-stone-600 text-sm">{option.desc}</p>
              <div className="flex items-center gap-2 text-xs text-stone-500">
                <MapPin size={12} />
                <span>{option.meta}</span>
              </div>
            </div>
            <div className="flex-shrink-0">
              <div className="bg-stone-900 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-1">
                <DollarSign size={14} />
                {option.price}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
