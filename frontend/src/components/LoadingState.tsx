import { motion } from 'framer-motion';
import { Plane, Sparkles, Map, Calendar } from 'lucide-react';

const loadingSteps = [
  { icon: Map, text: 'Analyzing destination...' },
  { icon: Calendar, text: 'Crafting your itinerary...' },
  { icon: Sparkles, text: 'Finding hidden gems...' },
  { icon: Plane, text: 'Finalizing your journey...' },
];

const LoadingState = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-20"
    >
      {/* Animated Plane */}
      <motion.div
        animate={{
          y: [0, -20, 0],
          rotate: [0, 5, -5, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="relative mb-10"
      >
        <div className="w-24 h-24 rounded-2xl glass-card flex items-center justify-center">
          <Plane className="w-12 h-12 text-primary" />
        </div>
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-2xl blur-xl bg-primary/30 -z-10" />
      </motion.div>

      {/* Loading Steps */}
      <div className="space-y-4 w-full max-w-sm">
        {loadingSteps.map((step, index) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.5, duration: 0.5 }}
              className="flex items-center gap-4"
            >
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: index * 0.3,
                }}
                className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center"
              >
                <Icon className="w-5 h-5 text-primary" />
              </motion.div>
              <motion.span
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: index * 0.3,
                }}
                className="text-muted-foreground"
              >
                {step.text}
              </motion.span>
            </motion.div>
          );
        })}
      </div>

      {/* Progress Bar */}
      <motion.div
        className="mt-10 h-1 w-64 rounded-full overflow-hidden bg-muted"
      >
        <motion.div
          animate={{ x: ['-100%', '100%'] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="h-full w-1/2 bg-gradient-to-r from-transparent via-primary to-transparent"
        />
      </motion.div>
    </motion.div>
  );
};

export default LoadingState;
