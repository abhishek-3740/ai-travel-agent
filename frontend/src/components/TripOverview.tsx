import { motion } from 'framer-motion';
import { MapPin, Calendar, Users, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { TripPlan } from '@/types/trip';

interface TripOverviewProps {
  plan: TripPlan;
}

const getBudgetHealth = (totalCost: number, budget: string) => {
  const budgetRanges: Record<string, { min: number; max: number }> = {
    'budget': { min: 500, max: 1500 },
    'moderate': { min: 1500, max: 4000 },
    'luxury': { min: 4000, max: 10000 },
    'ultra-luxury': { min: 10000, max: 50000 },
  };

  const range = budgetRanges[budget] || budgetRanges['moderate'];
  const midpoint = (range.min + range.max) / 2;
  
  if (totalCost <= range.min + (midpoint - range.min) * 0.3) {
    return { status: 'healthy', label: 'Under Budget', icon: TrendingDown };
  } else if (totalCost <= midpoint + (range.max - midpoint) * 0.5) {
    return { status: 'warning', label: 'On Budget', icon: Minus };
  } else {
    return { status: 'danger', label: 'Over Budget', icon: TrendingUp };
  }
};

const TripOverview = ({ plan }: TripOverviewProps) => {
  const budgetHealth = getBudgetHealth(plan.totalCost, plan.budget);
  const BudgetIcon = budgetHealth.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 md:p-8"
    >
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        {/* Trip Title & Destination */}
        <div className="space-y-2">
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-3xl md:text-4xl font-bold text-foreground"
          >
            {plan.title}
          </motion.h1>
          <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-primary" />
              {plan.destination}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-primary" />
              {plan.duration} days
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-primary" />
              {plan.travelers} {plan.travelers === 1 ? 'traveler' : 'travelers'}
            </span>
          </div>
        </div>

        {/* Cost & Budget Health */}
        <div className="flex items-center gap-6">
          {/* Total Cost */}
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Total Cost</p>
            <p className="text-3xl md:text-4xl font-bold text-gradient-cyan">
              ${plan.totalCost.toLocaleString()}
            </p>
          </div>

          {/* Budget Health Indicator */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl ${
              budgetHealth.status === 'healthy' ? 'bg-emerald-500/10 border border-emerald-500/30' :
              budgetHealth.status === 'warning' ? 'bg-amber-500/10 border border-amber-500/30' :
              'bg-red-500/10 border border-red-500/30'
            }`}
          >
            <BudgetIcon className={`w-5 h-5 ${
              budgetHealth.status === 'healthy' ? 'budget-healthy' :
              budgetHealth.status === 'warning' ? 'budget-warning' :
              'budget-danger'
            }`} />
            <span className={`text-sm font-medium ${
              budgetHealth.status === 'healthy' ? 'budget-healthy' :
              budgetHealth.status === 'warning' ? 'budget-warning' :
              'budget-danger'
            }`}>
              {budgetHealth.label}
            </span>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default TripOverview;
