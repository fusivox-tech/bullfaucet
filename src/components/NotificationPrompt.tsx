// components/NotificationPrompt.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, X, AlertCircle } from 'lucide-react';
import { registerPushNotifications } from '../utils/pushNotifications';
import { useData } from '../contexts/DataContext';

interface NotificationPromptProps {
  isVisible: boolean;
  setIsVisible: (visible: boolean) => void;
}

const NotificationPrompt: React.FC<NotificationPromptProps> = ({ isVisible, setIsVisible }) => {
  const { user } = useData();
  const [isSubscribed, setIsSubscribed] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      try {
        if (!('serviceWorker' in navigator)) {
          setIsSubscribed(false);
          return;
        }

        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        setIsSubscribed(!!subscription);
        
        if (user && !isSubscribed) {
          setIsVisible(true);
        }
        
        if (isSubscribed) {
          setIsVisible(false);
        }
      } catch (err) {
        console.error('Error checking subscription:', err);
        setIsSubscribed(false);
      }
    };

    checkSubscriptionStatus();
  }, [isSubscribed, setIsVisible, user]);

  const handleSubscribe = async () => {
    if (!user?._id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const success = await registerPushNotifications(user._id);
      setIsSubscribed(success);
      if (!success) {
        setError('Failed to enable notifications. Please try again.');
      } else {
        setIsVisible(false);
      }
    } catch (err) {
      console.error('Subscription error:', err);
      setError(err instanceof Error ? err.message : 'Failed to enable notifications');
      setIsSubscribed(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  // Don't show if not visible, already subscribed, or notifications not supported
  if (!isVisible || isSubscribed === true || !('Notification' in window) || isSubscribed === null) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-6 right-6 z-50 max-w-md w-full"
      >
        <div className="glass p-6 rounded-2xl border border-white/10 shadow-2xl ml-12 md:ml-0 w-[calc(100% - 60px)]">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-1 hover:bg-white/5 rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4 text-zinc-400" />
          </button>

          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-bull-orange/20 flex items-center justify-center">
              <Bell className="w-6 h-6 text-bull-orange" />
            </div>
            
            <div className="flex-1">
              <h3 className="font-display font-bold text-lg mb-1">Don't Miss Opportunities!</h3>
              <p className="text-sm text-zinc-400 mb-4">
                Enable push notifications to stay updated with the latest rewards and opportunities.
              </p>
              
              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <p className="text-xs text-red-400">{error}</p>
                </div>
              )}
              
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSubscribe}
                  disabled={isLoading}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-bull-orange hover:bg-orange-600 text-white font-bold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Bell className="w-4 h-4" />
                      Enable
                    </>
                  )}
                </button>
                <button
                  onClick={handleClose}
                  disabled={isLoading}
                  className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm transition-colors disabled:opacity-50"
                >
                  Later
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default NotificationPrompt;