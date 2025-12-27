import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, DollarSign } from 'lucide-react';
import axios from 'axios';
import { Activity } from '@/types/trip';

interface ActivityCardProps {
  activity: Activity;
  destination: string;
  index: number;
}

const timeColors: Record<string, string> = {
  'Morning': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  'Afternoon': 'bg-sky-500/20 text-sky-400 border-sky-500/30',
  'Evening': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  'Night': 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
};

const ActivityCard = ({ activity, destination, index }: ActivityCardProps) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const query = encodeURIComponent(`${activity.name} ${destination} scenic`);
        const response = await axios.get(`http://127.0.0.1:8000/api/image?query=${query}`);
        if (response.data?.url) {
          setImageUrl(response.data.url);
        }
      } catch (error) {
        console.error('Failed to fetch image:', error);
        setImageError(true);
      }
    };

    // Stagger the image fetches to avoid overwhelming the API
    const timer = setTimeout(fetchImage, index * 200);
    return () => clearTimeout(timer);
  }, [activity.name, destination, index]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      whileHover={{ scale: 1.03, y: -5 }}
      className="glass-card-hover overflow-hidden group cursor-pointer"
    >
      {/* Image Container */}
      <div className="relative h-48 overflow-hidden">
        {/* Skeleton Loader */}
        {!isImageLoaded && !imageError && (
          <div className="absolute inset-0 skeleton" />
        )}
        
        {/* Actual Image */}
        {imageUrl && (
          <motion.img
            src={imageUrl}
            alt={activity.name}
            initial={{ opacity: 0 }}
            animate={{ opacity: isImageLoaded ? 1 : 0 }}
            transition={{ duration: 0.5 }}
            onLoad={() => setIsImageLoaded(true)}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        )}

        {/* Fallback gradient if image fails */}
        {imageError && (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
            <span className="text-4xl opacity-50">🏛️</span>
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-60" />

        {/* Time Badge */}
        <div className="absolute top-3 left-3">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${timeColors[activity.time] || timeColors['Morning']}`}>
            <Clock className="w-3 h-3" />
            {activity.time}
          </span>
        </div>

        {/* Cost Pill */}
        <div className="absolute top-3 right-3">
          <span className="cost-pill flex items-center gap-1">
            <DollarSign className="w-3 h-3" />
            {activity.cost}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {activity.name}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-3">
          {activity.description}
        </p>
        {activity.location && (
          <p className="text-xs text-primary/70 mt-3 flex items-center gap-1">
            📍 {activity.location}
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default ActivityCard;
