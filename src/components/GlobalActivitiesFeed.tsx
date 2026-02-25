// components/GlobalActivitiesFeed.tsx
import React, { useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Globe, 
  Zap, 
  Gift, 
  Users, 
  Trophy, 
  DollarSign,
  TrendingUp,
  Loader2,
  Wifi
} from 'lucide-react';
import { useGlobalActivities } from '../hooks/useGlobalActivities';

interface GlobalActivitiesFeedProps {
  maxHeight?: string;
  showTitle?: boolean;
}

const GlobalActivitiesFeed: React.FC<GlobalActivitiesFeedProps> = ({ 
  maxHeight = '400px',
  showTitle = true 
}) => {
  const { activities, loading, hasMore, loadMore } = useGlobalActivities(20);
  const listRef = useRef<HTMLDivElement>(null);

  // Infinite scroll handler
  const handleScroll = useCallback(() => {
    const el = listRef.current;
    if (!el || loading || !hasMore) return;

    const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 100;

    if (nearBottom) {
      loadMore();
    }
  }, [loading, hasMore, loadMore]);

  // Get icon based on activity type
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'offer_wall':
      case 'offer_completed':
        return <DollarSign className="w-4 h-4 text-emerald-400" />;
      case 'faucet_claim':
        return <Zap className="w-4 h-4 text-bull-orange" />;
      case 'daily_bonus':
        return <Gift className="w-4 h-4 text-purple-400" />;
      case 'referral_earning':
        return <Users className="w-4 h-4 text-blue-400" />;
      case 'contest_win':
        return <Trophy className="w-4 h-4 text-yellow-400" />;
      case 'ptc_completed':
        return <TrendingUp className="w-4 h-4 text-green-400" />;
      default:
        return <Globe className="w-4 h-4 text-zinc-400" />;
    }
  };

  // Get background color based on activity type
  const getActivityBg = (type: string) => {
    switch (type) {
      case 'offer_wall':
      case 'offer_completed':
        return 'bg-emerald-500/20';
      case 'faucet_claim':
        return 'bg-bull-orange/20';
      case 'daily_bonus':
        return 'bg-purple-500/20';
      case 'referral_earning':
        return 'bg-blue-500/20';
      case 'contest_win':
        return 'bg-yellow-500/20';
      case 'ptc_completed':
        return 'bg-green-500/20';
      default:
        return 'bg-white/5';
    }
  };

  // Format timestamp
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="glass rounded-3xl overflow-hidden">
      {showTitle && (
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h4 className="font-display font-bold text-lg flex items-center gap-2">
            <Globe className="w-5 h-5 text-bull-orange" />
            Global Activity Feed
          </h4>
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400">
              Live
            </span>
              <Wifi className="w-4 h-4 text-emerald-400" />
          </div>
        </div>
      )}

      {/* Scrollable Activities List */}
      <div
        ref={listRef}
        className="overflow-y-auto p-4"
        style={{ maxHeight }}
        onScroll={handleScroll}
      >
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {activities.length > 0 ? (
              activities.map((activity, index) => (
                <motion.div
                  key={activity._id || activity.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="flex items-start gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group"
                >
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full ${getActivityBg(activity.type)} flex items-center justify-center`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-zinc-300 group-hover:text-white transition-colors">
                      {activity.description}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-zinc-500">
                        {formatTime(activity.timestamp)}
                      </span>
                      {activity.amount && (
                        <>
                          <span className="text-[10px] text-zinc-600">•</span>
                          <span className="text-[10px] font-mono text-emerald-400">
                            +${activity.amount.toFixed(4)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
                  <Globe className="w-8 h-8 text-zinc-600" />
                </div>
                <p className="text-zinc-400 text-sm">No activities yet</p>
                <p className="text-xs text-zinc-600 mt-1">
                  Activities from users will appear here
                </p>
              </div>
            )}
          </AnimatePresence>

          {/* Loading Indicator */}
          {loading && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin text-bull-orange" />
              <span className="text-xs text-zinc-400 ml-2">Loading more...</span>
            </div>
          )}

          {/* No More Activities */}
          {!hasMore && activities.length > 0 && (
            <div className="text-center py-4">
              <p className="text-xs text-zinc-600">No more activities to load</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GlobalActivitiesFeed;