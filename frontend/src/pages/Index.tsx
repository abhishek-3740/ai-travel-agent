import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import HeroSection from '@/components/HeroSection';
import TripForm from '@/components/TripForm';
import LoadingState from '@/components/LoadingState';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // ✅ New Import

// --- CUSTOM UTILITIES ---
import { generatePDF } from "@/utils/generatePDF"; 
import TripMap from "@/components/TripMap";       

// --- 🌐 API CONFIGURATION ---
// Automatically switches between Localhost and Deployment URL
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

// --- 1. ACTIVITY CARD COMPONENT (With Image Proxy) ---
const ActivityCard = ({ activity, destination }: { activity: any, destination: string }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchImage = async () => {
      try {
        const query = `${activity.name} ${destination} scenic`;
        // ✅ Uses dynamic API_BASE_URL
        const res = await axios.get(`${API_BASE_URL}/api/image?query=${query}`);
        if (isMounted) setImageUrl(res.data.url);
      } catch (err) {
        if (isMounted) setImageUrl("https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=1000&auto=format&fit=crop");
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchImage();
    return () => { isMounted = false; };
  }, [activity.name, destination]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative overflow-hidden rounded-xl bg-white/5 border border-white/10 hover:border-cyan-500/50 transition-all duration-300 shadow-lg"
    >
      <div className="aspect-video w-full overflow-hidden bg-slate-800 relative">
        {loading ? (
          <div className="absolute inset-0 animate-pulse bg-slate-700" />
        ) : (
          <img 
            src={imageUrl || ""} 
            alt={activity.name} 
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        )}
        <div className="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded text-xs text-cyan-400 font-bold backdrop-blur-md border border-white/10">
          {activity.cost_estimate || activity.cost}
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-white leading-tight">{activity.name}</h3>
            <span className="text-[10px] uppercase tracking-wider text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded">
                {activity.time}
            </span>
        </div>
        <p className="text-sm text-slate-400 line-clamp-2">{activity.description}</p>
        <div className="mt-3 text-xs text-slate-500 flex items-center gap-1">
            <span>📍</span> {activity.category}
        </div>
      </div>
    </motion.div>
  );
};

// --- 2. MAIN PAGE COMPONENT ---
const Index = () => {
  const { toast } = useToast();
  const planSectionRef = useRef<HTMLDivElement>(null);
  const [showForm, setShowForm] = useState(false);
  const [tripState, setTripState] = useState<any>({
    isLoading: false,
    plan: null,
    error: null,
  });

  const handleStartPlanning = () => {
    setShowForm(true);
    setTimeout(() => {
      planSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSubmit = async (formData: any) => {
    setTripState({ isLoading: true, plan: null, error: null });

    try {
      // 1. NORMALIZE BUDGET
      let safeBudget = "Moderate";
      const rawBudget = String(formData.budget || "").toLowerCase();
      if (rawBudget.includes("cheap") || rawBudget.includes("low")) safeBudget = "Cheap";
      else if (rawBudget.includes("luxury") || rawBudget.includes("high")) safeBudget = "Luxury";

      // 2. CONSTRUCT PAYLOAD
      const cleanPayload = {
        destination: String(formData.destination || "Paris"),
        duration_days: Number(formData.duration),
        budget_tier: safeBudget,
        pacing: "Moderate",
        interests: Array.isArray(formData.interests) ? formData.interests : ["General"],
        group_size: Number(formData.travelers)
      };

      // ✅ Uses dynamic API_BASE_URL
      const response = await axios.post(`${API_BASE_URL}/plan_trip`, cleanPayload);

      setTripState({ isLoading: false, plan: response.data, error: null });
      toast({ title: "Success!", description: "Trip generated successfully." });

    } catch (error: any) {
      console.error("❌ API Error:", error);
      let errorMessage = "Failed to connect to backend.";
      
      if (error.response?.status === 422) {
        const detail = error.response.data.detail;
        if (Array.isArray(detail) && detail.length > 0) {
          const field = detail[0].loc[detail[0].loc.length - 1];
          errorMessage = `Validation Error (${field}): ${detail[0].msg}`;
        } else {
          errorMessage = "Validation Error: Please check your inputs.";
        }
      } else if (error.code === "ERR_NETWORK") {
        errorMessage = "Backend is offline. Is 'python main.py' running?";
      }

      setTripState({ isLoading: false, plan: null, error: errorMessage });
      toast({ variant: "destructive", title: "Planning Failed", description: errorMessage });
    }
  };

  return (
    <div className="min-h-screen bg-[#020817] text-white selection:bg-cyan-500/30 font-sans">
      
      {/* HERO SECTION */}
      <AnimatePresence mode="wait">
        {!tripState.plan && !tripState.isLoading && (
          <motion.div key="hero" exit={{ opacity: 0, y: -50 }} transition={{ duration: 0.5 }}>
            <HeroSection onStartPlanning={handleStartPlanning} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN CONTENT AREA */}
      <div ref={planSectionRef} className="container mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          
          {/* 1. INPUT FORM */}
          {showForm && !tripState.plan && !tripState.isLoading && (
            <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="max-w-xl mx-auto"
            >
              <TripForm onSubmit={handleSubmit} isLoading={tripState.isLoading} />
            </motion.div>
          )}

          {/* 2. LOADING STATE */}
          {tripState.isLoading && (
             <LoadingState />
          )}

          {/* 3. RESULTS DASHBOARD */}
          {tripState.plan && (
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="max-w-7xl mx-auto"
            >
              
              {/* HEADER: Title & Actions */}
              <div className="flex flex-col md:flex-row justify-between items-end mb-8 border-b border-white/10 pb-6 gap-6">
                <div>
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent mb-3">
                        Trip to {tripState.plan.destination}
                    </h1>
                    <div className="flex flex-wrap gap-3 text-sm text-slate-300">
                        <span className="bg-white/5 px-4 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
                            💰 <span className="text-cyan-400">{tripState.plan.total_estimated_cost}</span>
                        </span>
                        <span className="bg-white/5 px-4 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
                            📅 {tripState.plan.duration || tripState.plan.daily_plans?.length} Days
                        </span>
                    </div>
                </div>
                
                <div className="flex gap-3 w-full md:w-auto">
                    <button 
                        onClick={() => setTripState({ plan: null })}
                        className="flex-1 md:flex-none px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors border border-transparent hover:border-white/10"
                    >
                        New Trip
                    </button>
                    <button 
                        onClick={() => generatePDF(tripState.plan)}
                        className="flex-1 md:flex-none bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold px-6 py-2 rounded-lg shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2"
                    >
                        📄 Download PDF
                    </button>
                </div>
              </div>

              {/* RESULTS TABS */}
              <Tabs defaultValue="itinerary" className="w-full">
                <TabsList className="bg-slate-900/50 border border-white/10 mb-8 p-1 h-auto w-full md:w-auto flex">
                    <TabsTrigger value="itinerary" className="flex-1 md:flex-none px-8 py-3 data-[state=active]:bg-cyan-500 data-[state=active]:text-black font-semibold transition-all">
                        📅 Daily Itinerary
                    </TabsTrigger>
                    <TabsTrigger value="map" className="flex-1 md:flex-none px-8 py-3 data-[state=active]:bg-purple-500 data-[state=active]:text-white font-semibold transition-all">
                        🗺️ Map View
                    </TabsTrigger>
                </TabsList>

                {/* TAB CONTENT: ITINERARY */}
                <TabsContent value="itinerary" className="space-y-12 animate-in fade-in-50 slide-in-from-bottom-5">
                    {tripState.plan.daily_plans?.map((day: any) => (
                        <div key={day.day_number} className="relative pl-8 border-l-2 border-slate-800 pb-12 last:pb-0">
                            {/* Day Marker */}
                            <span className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.6)] ring-4 ring-[#020817]"></span>
                            
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                                Day {day.day_number} 
                                <span className="text-sm font-normal text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
                                    {day.theme}
                                </span>
                            </h2>
                            
                            {/* Activity Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {day.activities.map((act: any, idx: number) => (
                                    <ActivityCard 
                                        key={idx} 
                                        activity={act} 
                                        destination={tripState.plan.destination} 
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </TabsContent>

                {/* TAB CONTENT: MAP */}
                <TabsContent value="map" className="animate-in fade-in-50">
                    <TripMap tripData={tripState.plan} />
                </TabsContent>
              </Tabs>

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Index;