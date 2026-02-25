import { motion, AnimatePresence } from 'motion/react';
import { useData } from '../contexts/DataContext';
import { 
  CheckCircle, 
  Info, 
  XCircle, 
  X,
  AlertTriangle
} from 'lucide-react';
import { useEffect } from 'react';

const CustomAlert = () => {
  const { isAlertActive, handleCloseAlert, alert } = useData();
  
  // Auto-close after 10 seconds
  useEffect(() => {
    if (isAlertActive) {
      const timer = setTimeout(() => {
        handleCloseAlert();
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [isAlertActive, handleCloseAlert]);

  const getAlertColor = () => {
    switch (alert.type) {
      case "error":
        return 'red';
      case "success":
        return 'emerald';
      case "info":
        return 'blue';
      case "warning":
        return 'yellow';
      default:
        return '#0000ff';
    }
  };

  const getAlertTitle = () => {
    switch (alert.type) {
      case "error":
        return 'Error';
      case "success":
        return 'Success';
      case "warning":
        return 'Warning';
      case "info":
        return 'Info';
      default:
        return 'Info';
    }
  };

  const Icon = () => {
    switch (alert.type) {
      case "error":
        return XCircle;
      case "success":
        return CheckCircle;
      case "warning":
        return AlertTriangle;
      case "info":
        return Info;
      default:
        return Info;
    }
  };

  const AlertIcon = Icon();
  const color = getAlertColor();
  const title = getAlertTitle();

  return (
    <AnimatePresence>
      {isAlertActive &&(
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.3 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
          className="fixed top-24 left-1/2 transform -translate-x-1/2 z-[2000] w-full max-w-md px-4"
        >
          <div className={`
            relative overflow-hidden
            glass 
            rounded-2xl 
            border border-${color}-500/30 
            bg-gradient-to-br from-${color}-500/10 to-transparent
            shadow-2xl
            backdrop-blur-xl
          `}>
            {/* Animated gradient border */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
            
            {/* Colored accent bar */}
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-${color}-500 to-${color}-300`} />

            <div className="relative p-5">
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`
                  flex-shrink-0
                  p-2.5 rounded-xl 
                  bg-${color}-500/20 
                  border border-${color}-500/30
                `} style={{border: 'none'}}>
                  <AlertIcon className={`w-6 h-6 text-${color}-400`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className={`font-display font-bold text-${color}-400`}>
                        {title}
                      </h4>
                      <p className="text-sm text-zinc-300 mt-1">
                        {alert.message}
                      </p>
                    </div>
                    <button
                      onClick={handleCloseAlert}
                      className="p-1 rounded-lg bg-white/10 transition-colors flex-shrink-0"
                      aria-label="Close"
                    >
                      <X className="w-4 h-4 text-zinc-400" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        )}
    </AnimatePresence>
  );
};

export default CustomAlert;