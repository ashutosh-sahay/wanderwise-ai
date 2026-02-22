import React from "react";
import {
  Navigation,
  Hotel,
  Activity,
  MapPin,
  Wallet,
} from "lucide-react";
import { BudgetItem } from "@/types";
import { Card, Button } from "@/components/ui";

interface BudgetStepProps {
  totalBudget: string;
  strategyId: string;
  items: BudgetItem[];
  onApprove: () => void;
  onRecalibrate: () => void;
}

/**
 * Budget breakdown and allocation step
 */
export const BudgetStep: React.FC<BudgetStepProps> = ({
  totalBudget,
  strategyId,
  items,
  onApprove,
  onRecalibrate,
}) => {
  return (
    <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-700 max-w-3xl mx-auto">
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-semibold tracking-tight text-stone-900">
          Fiscal Strategy
        </h2>
        <p className="text-stone-400 font-light">
          {/* TODO: Replace hardcoded text with dynamic strategy name from API */}
          Validation of the "Balanced Equilibrium" allocation.
        </p>
      </div>

      <Card variant="elevated" padding="sm" rounded="3xl" className="overflow-hidden">
        <div className="bg-[#121417] p-10 text-white flex justify-between items-end">
          <div className="space-y-4">
            <div className="inline-flex px-3 py-1 rounded-full bg-stone-800 text-stone-400 text-[10px] font-black uppercase tracking-[0.2em]">
              Strategy ID: {strategyId}
            </div>
            <p className="text-3xl font-medium text-stone-100 tracking-tight italic">
              Allocated Resources
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-stone-500 uppercase font-black tracking-widest mb-1">
              Total Projected
            </p>
            <p className="text-5xl font-light text-stone-100 tracking-tighter">
              ₹{totalBudget}
            </p>
          </div>
        </div>

        <div className="p-10 space-y-8">
          {items.map((item, i) => (
            <div key={i} className="flex items-center justify-between group">
              <div className="flex items-center gap-5 text-stone-700">
                <div className="p-3 bg-stone-50 rounded-2xl text-stone-400 group-hover:bg-stone-950 group-hover:text-white transition-all duration-300 shadow-sm">
                  {item.icon}
                </div>
                <div className="space-y-1">
                  <span className="font-semibold text-stone-900 text-lg">
                    {item.cat}
                  </span>
                  <p className="text-[11px] text-stone-400 font-medium italic">
                    Agent Reason: {item.reason}
                  </p>
                </div>
              </div>
              <span className="font-bold text-stone-950 text-xl tracking-tight">
                ₹{item.cost}
              </span>
            </div>
          ))}
        </div>

        <div className="p-8 bg-stone-50 border-t border-stone-100 flex flex-col sm:flex-row gap-4">
          <Button
            variant="secondary"
            size="lg"
            fullWidth
            onClick={onRecalibrate}
          >
            Recalibrate Parameters
          </Button>
          <Button variant="primary" size="lg" fullWidth onClick={onApprove}>
            Execute Strategy
          </Button>
        </div>
      </Card>
    </div>
  );
};
