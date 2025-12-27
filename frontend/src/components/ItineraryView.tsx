import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';
import { TripPlan } from '@/types/trip';
import ActivityCard from './ActivityCard';

interface ItineraryViewProps {
  plan: TripPlan;
}

const ItineraryView = ({ plan }: ItineraryViewProps) => {
  return (
    <div className="space-y-10">
      {plan.itinerary.map((day, dayIndex) => (
        <motion.div
          key={day.day}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: dayIndex * 0.15, duration: 0.5 }}
        >
          {/* Day Header */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/20 border border-primary/30">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Day {day.day}</h2>
              {day.date && (
                <p className="text-sm text-muted-foreground">{day.date}</p>
              )}
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent ml-4" />
          </div>

          {/* Activities Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {day.activities.map((activity, activityIndex) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                destination={plan.destination}
                index={dayIndex * day.activities.length + activityIndex}
              />
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default ItineraryView;
