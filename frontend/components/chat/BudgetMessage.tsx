import React from "react";
import { BudgetData } from "@/types";
import { Card, Button } from "@/components/ui";
import { Check, X } from "lucide-react";

interface BudgetMessageProps {
  budget: BudgetData;
  onApprove: () => void;
  onRecalibrate: () => void;
}

/**
 * Chat message component for displaying budget breakdown
 */
export const BudgetMessage: React.FC<BudgetMessageProps> = ({
  budget,
  onApprove,
  onRecalibrate,
}) => {
  return (
    <Card variant="elevated" padding="lg" rounded="2xl">
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-stone-200 pb-4">
          <div>
            <h3 className="text-2xl font-bold text-stone-900">
              ${budget.totalBudget}
            </h3>
            <p className="text-xs text-stone-500 mt-1">
              Strategy ID: {budget.strategyId}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {budget.items.map((item, idx) => (
            <div
              key={idx}
              className="flex items-start gap-4 p-4 bg-stone-50 rounded-xl"
            >
              <div className="flex-shrink-0 w-10 h-10 bg-white rounded-lg flex items-center justify-center text-stone-700">
                {item.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-semibold text-stone-900">{item.cat}</h4>
                  <span className="font-bold text-stone-900">
                    ${item.cost.toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-stone-600">{item.reason}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={onApprove}
            icon={<Check size={18} />}
          >
            Approve Budget
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={onRecalibrate}
            icon={<X size={18} />}
          >
            Recalibrate
          </Button>
        </div>
      </div>
    </Card>
  );
};
