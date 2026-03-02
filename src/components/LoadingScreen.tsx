// components/LoadingScreen.tsx
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

interface LoadingScreenProps {
  message?: string;
}

// Tips array
const TIPS = [
  {
    icon: "🌾",
    text: "Unlock passive income by locking your crypto assets in our yield farm"
  },
  {
    icon: "👥",
    text: "Earn while you sleep through our affiliate program, invite your friends to start earning"
  },
  {
    icon: "🔧",
    text: "Switch off your ad blocker and VPN to access all ads, and to ensure rewards are credited correctly"
  },
  {
    icon: "🔄",
    text: "Earnings are credited in BULLFI, but you can swap to any token you want for withdrawal"
  }
];

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = "Loading your dashboard...", 
}) => {
  const [showMessage, setShowMessage] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTip, setCurrentTip] = useState(TIPS[0]);
  const [tipIndex, setTipIndex] = useState(0);

  // Select random tip on mount
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * TIPS.length);
    setCurrentTip(TIPS[randomIndex]);
    setTipIndex(randomIndex);
  }, []);

  // Rotate tips every 5 seconds after initial delay
  useEffect(() => {
    if (!showMessage) return;

    const interval = setInterval(() => {
      setTipIndex(prev => {
        const nextIndex = (prev + 1) % TIPS.length;
        setCurrentTip(TIPS[nextIndex]);
        return nextIndex;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [showMessage]);

  // Show loading message after a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowMessage(true);
    }, 2000); // Show tips after 2 seconds (reduced from 3)

    return () => clearTimeout(timer);
  }, []);

  // Simulate loading progress (optional)
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev; // Cap at 90% until actual loading completes
        return prev + 10;
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-bull-dark z-50 flex flex-col items-center justify-center p-6">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden p-6">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-bull-orange/5 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-600/5 blur-[100px] rounded-full animate-pulse delay-1000" />
      </div>

      {/* Logo and loading indicator */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="glass w-full flex flex-col items-center p-6 rounded-xl m-6">
        <motion.img
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          src="https://res.cloudinary.com/danuehpic/image/upload/v1771869182/wordmark_pynw6f.png"
          alt="BullFaucet"
          className="h-12 md:h-16 object-contain mb-8"
        />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="relative"
        >
          {/* Animated rings */}
          <div className="w-20 h-20 rounded-full border-4 border-bull-orange/20 border-t-bull-orange animate-spin" />
          
          {/* Progress indicator ring */}
          <svg className="absolute top-0 left-0 w-20 h-20 -rotate-90">
            <circle
              cx="40"
              cy="40"
              r="36"
              fill="none"
              stroke="rgba(227, 106, 13, 0.2)"
              strokeWidth="4"
            />
            <motion.circle
              cx="40"
              cy="40"
              r="36"
              fill="none"
              stroke="#e36a0d"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={226.2} // 2 * π * 36 ≈ 226.2
              initial={{ strokeDashoffset: 226.2 }}
              animate={{ strokeDashoffset: 226.2 * (1 - progress / 100) }}
              transition={{ duration: 0.3 }}
            />
          </svg>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 text-zinc-400 font-medium"
        >
          {message}
        </motion.p>
        
       </div>

        {/* Loading tips */}
        {showMessage && (
          <motion.div
            key={tipIndex} // Key helps with animation when tip changes
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
            className="text-center w-full p-6 glass w-full flex flex-col items-center rounded-xl m-6 mt-2"
          >
            <div className="flex items-start gap-3">
              <div className="flex-1 text-center">
                <p className="text-xs text-zinc-500 leading-relaxed">
                  <span className="text-bull-orange font-bold">Pro Tip:</span> {currentTip.text}
                </p>
                {/* Tip counter dots */}
                <div className="flex justify-center gap-1.5 mt-3">
                  {TIPS.map((_, index) => (
                    <div
                      key={index}
                      className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                        index === tipIndex 
                          ? 'bg-bull-orange w-3' 
                          : 'bg-zinc-600'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Version info */}
      <div className="absolute bottom-4 left-4 text-xs text-zinc-700">
        v2.0.0
      </div>
    </div>
  );
};

export default LoadingScreen;