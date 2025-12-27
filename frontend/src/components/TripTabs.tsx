import { useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, Map } from 'lucide-react';
import { TripPlan } from '@/types/trip';
import ItineraryView from './ItineraryView';
import MapView from './MapView';

interface TripTabsProps {
  plan: TripPlan;
}

const tabs = [
  { id: 'itinerary', label: 'Daily Itinerary', icon: CalendarDays },
  { id: 'map', label: 'Map View', icon: Map },
];

const TripTabs = ({ plan }: TripTabsProps) => {
  const [activeTab, setActiveTab] = useState('itinerary');

  return (
    <div className="space-y-6">
      {/* Tab Headers */}
      <div className="flex gap-2 p-1.5 rounded-xl bg-muted/30 backdrop-blur-sm w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-primary rounded-lg"
                  initial={false}
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <Icon className="w-4 h-4" />
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'itinerary' && <ItineraryView plan={plan} />}
        {activeTab === 'map' && <MapView plan={plan} />}
      </motion.div>
    </div>
  );
};

export default TripTabs;
