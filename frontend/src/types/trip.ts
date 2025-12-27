export interface TripFormData {
  destination: string;
  duration: number;
  travelers: number;
  budget: 'budget' | 'moderate' | 'luxury' | 'ultra-luxury';
  interests: string[];
}

export interface Activity {
  id: string;
  name: string;
  time: 'Morning' | 'Afternoon' | 'Evening' | 'Night';
  cost: number;
  description: string;
  location?: string;
  imageUrl?: string;
}

export interface DayItinerary {
  day: number;
  date?: string;
  activities: Activity[];
}

export interface TripPlan {
  title: string;
  destination: string;
  totalCost: number;
  budget: string;
  duration: number;
  travelers: number;
  itinerary: DayItinerary[];
}

export interface TripState {
  isLoading: boolean;
  plan: TripPlan | null;
  error: string | null;
}
