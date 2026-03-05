// components/LoadingScreen.tsx
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = "", 
}) => {
  const [progress, setProgress] = useState(0);

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
      <div className="relative z-10 flex flex-col items-center w-full max-w-md">
        <div className="w-full flex flex-col items-center p-6 rounded-xl m-6">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex  flex-col gap-2 items-center"
          >
            <img
              src="https://res.cloudinary.com/danuehpic/image/upload/v1771869815/logo_tflaaq.png"
              className="hidden h-36 object-contain mb-8"
            />
            
            <div>
              <img src="https://res.cloudinary.com/danuehpic/image/upload/v1772546097/justword_qjbquu.png" alt="" className="h-4 w-auto mt-[-4px] mb-2"/>
              <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="w-full max-w-xs space-y-2 mb-6"
          >
            <div className="w-full h-1 bg-white/10 overflow-hidden">
              <motion.div
                className="h-full bg-bull-orange"
                initial={{ width: "0%" }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              />
            </div>
            <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="hidden mt-[-5px] text-zinc-400 font-medium text-left text-[10px] flex items-center justify-between"
          >
            <span>Loading...</span>{message}
          </motion.p>
          </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Version info */}
      <div className="absolute bottom-4 left-0 w-full text-xs text-zinc-700 text-center">
        v2.0.0
      </div>
    </div>
  );
};

export default LoadingScreen;