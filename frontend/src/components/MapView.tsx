import { motion } from 'framer-motion';
import { MapPin, Navigation } from 'lucide-react';
import { TripPlan } from '@/types/trip';

interface MapViewProps {
  plan: TripPlan;
}

const MapView = ({ plan }: MapViewProps) => {
  // Extract all unique locations from activities
  const locations = plan.itinerary.flatMap(day => 
    day.activities.map(activity => ({
      name: activity.name,
      location: activity.location || activity.name,
      day: day.day,
      time: activity.time,
    }))
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="glass-card p-6 md:p-8"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
          <Navigation className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Trip Map</h2>
          <p className="text-sm text-muted-foreground">{plan.destination}</p>
        </div>
      </div>

      {/* Map Placeholder */}
      <div className="relative aspect-video rounded-xl overflow-hidden mb-6">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-card to-secondary/10 flex items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
              <MapPin className="w-10 h-10 text-primary" />
            </div>
            <p className="text-lg font-medium text-foreground">{plan.destination}</p>
            <p className="text-sm text-muted-foreground mt-1">Interactive map coming soon</p>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-4 right-4 w-3 h-3 rounded-full bg-primary animate-pulse" />
        <div className="absolute top-1/3 left-1/4 w-2 h-2 rounded-full bg-secondary animate-pulse" style={{ animationDelay: '0.5s' }} />
        <div className="absolute bottom-1/3 right-1/3 w-2.5 h-2.5 rounded-full bg-primary animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Location List */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">All Locations</h3>
        <div className="grid gap-2 max-h-64 overflow-y-auto pr-2">
          {locations.map((loc, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary">
                D{loc.day}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{loc.name}</p>
                <p className="text-xs text-muted-foreground">{loc.time}</p>
              </div>
              <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default MapView;
