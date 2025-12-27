import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Users, Wallet, Heart, Sparkles, X } from 'lucide-react';
import { TripFormData } from '@/types/trip';

const INTERESTS = [
  'Adventure', 'Beach', 'Culture', 'Food', 'History', 
  'Nature', 'Nightlife', 'Photography', 'Relaxation', 'Shopping'
];

const BUDGETS = [
  { value: 'budget', label: 'Budget', desc: '$500 - $1,500' },
  { value: 'moderate', label: 'Moderate', desc: '$1,500 - $4,000' },
  { value: 'luxury', label: 'Luxury', desc: '$4,000 - $10,000' },
  { value: 'ultra-luxury', label: 'Ultra Luxury', desc: '$10,000+' },
];

interface TripFormProps {
  onSubmit: (data: TripFormData) => void;
  isLoading: boolean;
  onClose?: () => void;
}

const TripForm = ({ onSubmit, isLoading, onClose }: TripFormProps) => {
  const [formData, setFormData] = useState<TripFormData>({
    destination: '',
    duration: 5,
    travelers: 2,
    budget: 'moderate',
    interests: [],
  });

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="glass-card p-6 lg:p-8 h-fit sticky top-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Plan Your Journey</h2>
          <p className="text-sm text-muted-foreground mt-1">Fill in your travel preferences</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted/50 transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Destination */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <MapPin className="w-4 h-4 text-primary" />
            Destination
          </label>
          <input
            type="text"
            value={formData.destination}
            onChange={(e) => setFormData(prev => ({ ...prev, destination: e.target.value }))}
            placeholder="e.g., Tokyo, Japan"
            className="input-glass"
            required
          />
        </div>

        {/* Duration & Travelers */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Calendar className="w-4 h-4 text-primary" />
              Duration
            </label>
            <select
              value={formData.duration}
              onChange={(e) => setFormData(prev => ({ ...prev, duration: Number(e.target.value) }))}
              className="input-glass"
            >
              {[3, 5, 7, 10, 14, 21].map(days => (
                <option key={days} value={days} className="bg-card">{days} days</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Users className="w-4 h-4 text-primary" />
              Travelers
            </label>
            <select
              value={formData.travelers}
              onChange={(e) => setFormData(prev => ({ ...prev, travelers: Number(e.target.value) }))}
              className="input-glass"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                <option key={num} value={num} className="bg-card">{num} {num === 1 ? 'person' : 'people'}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Budget */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Wallet className="w-4 h-4 text-primary" />
            Budget Level
          </label>
          <div className="grid grid-cols-2 gap-2">
            {BUDGETS.map(budget => (
              <button
                key={budget.value}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, budget: budget.value as TripFormData['budget'] }))}
                className={`p-3 rounded-lg text-left transition-all duration-200 ${
                  formData.budget === budget.value
                    ? 'bg-primary/20 border border-primary text-primary'
                    : 'bg-muted/30 border border-transparent hover:border-muted-foreground/30'
                }`}
              >
                <div className="text-sm font-medium">{budget.label}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{budget.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Interests */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Heart className="w-4 h-4 text-primary" />
            Interests
          </label>
          <div className="flex flex-wrap gap-2">
            {INTERESTS.map(interest => (
              <button
                key={interest}
                type="button"
                onClick={() => handleInterestToggle(interest)}
                className={formData.interests.includes(interest) ? 'chip-active' : 'chip'}
              >
                {interest}
              </button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={isLoading || !formData.destination}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full btn-glow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
              />
              Crafting Your Journey...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate Itinerary
            </>
          )}
        </motion.button>
      </form>
    </motion.div>
  );
};

export default TripForm;
