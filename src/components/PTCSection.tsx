import React, { useState, useEffect, useCallback } from 'react';
import { MousePointer2, Clock, ExternalLink } from 'lucide-react';
import { useData } from '../contexts/DataContext';

interface PTCSectionProps {
  ads: any[]; // BullFaucet ads
  bitcoTasks: any[]; // Add this
  user: any;
  onComplete: (adId: number, reward: number) => void;
  onBitcoTaskComplete: (taskId: string, reward: number) => void; // Add this
  checkAuth: () => boolean;
  openRegister: () => void;
  tokenPrice?: number;
  getRewardMultiplier?: () => number;
  bitcoTasksLoading?: boolean; // Add this
}

const PTCSection: React.FC<PTCSectionProps> = ({ 
  ads, 
  bitcoTasks = [], // Add default
  user,
  onComplete, 
  onBitcoTaskComplete,
  checkAuth,
  openRegister,
  tokenPrice = 1,
  getRewardMultiplier = () => 1,
  bitcoTasksLoading = false
}) => {
  const [activeAd, setActiveAd] = useState<any | null>(null);
  const { setAlert } = useData();
  const [timeLeft, setTimeLeft] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);
  const [webProgress, setWebProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  // Calculate reward with multiplier for BullFaucet ads
  const calculateBullFaucetReward = (baseReward: number) => {
    const multiplier = getRewardMultiplier();
    const calculatedBaseReward = Math.floor((baseReward / 2) / tokenPrice);
    return Math.floor(calculatedBaseReward * multiplier);
  };

  // Calculate reward for BitcoTasks
  const calculateBitcoTaskReward = useCallback((baseReward: number | string) => {
    let cleanBaseReward: number;
    if (typeof baseReward === 'string') {
      cleanBaseReward = parseFloat(baseReward.replace(/,/g, ''));
    } else {
      cleanBaseReward = baseReward;
    }
    
    if (isNaN(cleanBaseReward)) {
      cleanBaseReward = 0;
    }

    const calculatedBaseReward = Math.floor((cleanBaseReward / 2) / tokenPrice);
    const multiplier = getRewardMultiplier();
    return Math.floor(calculatedBaseReward * multiplier);
  }, [getRewardMultiplier, tokenPrice]);

  // Combine all tasks and sort by reward
  const allTasks = React.useMemo(() => {
    const combined = [];
    
    // Add BullFaucet ads
    if (ads?.length > 0) {
      combined.push(...ads.map(ad => ({
        ...ad,
        type: 'bullfaucet',
        uniqueId: `bull-${ad._id}`,
        calculatedReward: calculateBullFaucetReward(ad.taskReward),
        displayReward: calculateBullFaucetReward(ad.taskReward),
        duration: ad.taskDuration || 15,
        title: ad.title,
        description: ad.taskDescription,
      })));
    }
    
    // Add BitcoTasks
    if (bitcoTasks?.length > 0) {
      combined.push(...bitcoTasks.map(task => ({
        ...task,
        type: 'bitcotasks',
        uniqueId: `bitco-${task.id}`,
        calculatedReward: calculateBitcoTaskReward(task.reward),
        displayReward: calculateBitcoTaskReward(task.reward),
        duration: task.duration || 15,
        title: task.title || 'BitcoTask',
        description: task.description || 'Complete this task to earn',
        imageUrl: task.image || '/globe.png',
        taskUrl: task.url
      })));
    }
    
    return combined.sort((a, b) => b.calculatedReward - a.calculatedReward);
  }, [ads, bitcoTasks, calculateBullFaucetReward, calculateBitcoTaskReward]);

  // Handle countdown completion
  useEffect(() => {
    if (activeAd && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (activeAd && timeLeft === 0 && !isCompleting) {
      completeAd(activeAd);
    }
  }, [activeAd, timeLeft]);

  // Handle message from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const { type, taskId, timeLeft: iframeTimeLeft, isPaused: iframePaused } = event.data;

      if (type === 'TASK_PROGRESS' && activeAd && 
          (activeAd._id === taskId || activeAd.id === taskId)) {
        setTimeLeft(iframeTimeLeft);
        setIsPaused(iframePaused);
        const total = parseInt(activeAd.taskDuration || activeAd.duration || 15);
        setWebProgress(((total - iframeTimeLeft) / total) * 100);
      }

      if (type === 'TASK_COMPLETED' && activeAd && 
          (activeAd._id === taskId || activeAd.id === taskId)) {
        const reward = activeAd.type === 'bullfaucet' 
          ? calculateBullFaucetReward(activeAd.taskReward)
          : calculateBitcoTaskReward(activeAd.reward);
        
        setAlert({
          message: `🪙 You earned ${reward} BULLFI!`,
          type: "success"
        });
        
        if (activeAd.type === 'bullfaucet') {
          onComplete(activeAd._id, reward);
        } else {
          onBitcoTaskComplete(activeAd.id, reward);
        }
        
        setActiveAd(null);
        setIsCompleting(false);
        setIsPaused(false);
        setWebProgress(0);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [activeAd, onComplete, onBitcoTaskComplete, setAlert, calculateBullFaucetReward, calculateBitcoTaskReward]);

  // Complete ad function
  const completeAd = (ad: any) => {
    setIsCompleting(true);
    const reward = ad.type === 'bullfaucet' 
      ? calculateBullFaucetReward(ad.taskReward)
      : calculateBitcoTaskReward(ad.reward);
    
    setAlert({
      message: `🪙 You earned ${reward} BULLFI!`,
      type: "success"
    });
    
    if (ad.type === 'bullfaucet') {
      onComplete(ad._id, reward);
    } else {
      onBitcoTaskComplete(ad.id, reward);
    }
    
    setActiveAd(null);
    setIsCompleting(false);
    setIsConfirming(false);
    setCountdown(null);
  };

  // Handle Links type ads (BullFaucet)
  const handleLinksAd = (ad: any) => {
    setIsConfirming(true);
    setActiveAd(ad);
    setCountdown(15);
    window.open(ad.taskUrl, "_blank");
    
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev && prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev ? prev - 1 : 0;
      });
    }, 1000);
    
    // Complete after 15 seconds
    setTimeout(() => {
      const reward = calculateBullFaucetReward(ad.taskReward);
      setAlert({
        message: `🪙 You earned ${reward} BULLFI!`,
        type: "success"
      });
      
      onComplete(ad._id, reward);
      setCountdown(null);
      setActiveAd(null);
      setIsConfirming(false);
      clearInterval(timer);
    }, 15000);
  };

  // Handle Website type ads (BullFaucet)
  const handleWebsiteAd = (ad: any) => {
    const duration = parseInt(ad.taskDuration, 10) || 0;
    if (duration > 0) {
      setActiveAd(ad);
      setTimeLeft(duration);
      const taskViewUrl = `/iframe-task?url=${encodeURIComponent(ad.taskUrl)}&duration=${duration}&taskId=${ad._id}`;
      window.open(taskViewUrl, "_blank");
    }
  };

  // Handle BitcoTasks
  const handleBitcoTask = (task: any) => {
    // Open in new tab and remove immediately
    window.open(task.url, "_blank", "noopener,noreferrer");
    
    const reward = calculateBitcoTaskReward(task.reward);
    setAlert({
      message: `🪙 You earned ${reward} BULLFI!`,
      type: "success"
    });
    
    onBitcoTaskComplete(task.id, reward);
  };

  // Start ad function
  const startAd = (ad: any) => {
    if (!checkAuth()) {
      openRegister();
      return;
    }

    if (activeAd) {
      setAlert({
        message: "You must complete your current task before starting a new one.",
        type: "error",
      });
      return;
    }

    if (ad.type === 'bullfaucet') {
      // Handle BullFaucet ads based on campaign type
      if (ad.campaignType === "Links") {
        handleLinksAd(ad);
      } else if (ad.campaignType === "Website") {
        handleWebsiteAd(ad);
      } else if (ad.taskCategory === "Twitter Followers") {
        if (!user || !user.twitterUsername) {
          setAlert({
            message: "Please set up your Twitter username in your profile before starting this task.",
            type: "error",
          });
          return;
        }
        setActiveAd(ad);
        window.open(ad.taskUrl, "_blank");
      } else {
        // Default handling for other types
        setActiveAd(ad);
        window.open(ad.taskUrl, "_blank");
      }
    } else if (ad.type === 'bitcotasks') {
      handleBitcoTask(ad);
    }
  };

  // Active ad overlay
  if (activeAd && (timeLeft > 0 || countdown !== null)) {
    const currentTimeLeft = timeLeft || countdown || 0;
    const totalDuration = parseInt(activeAd.taskDuration || activeAd.duration || 15);
    const progress = isPaused ? webProgress : ((totalDuration - currentTimeLeft) / totalDuration) * 100;

    return (
      <div className="fixed inset-0 z-[100] bg-bull-dark/90 backdrop-blur-xl flex flex-col items-center justify-center p-6">
        <div className="w-32 h-32 rounded-full border-4 border-white/10 flex items-center justify-center relative">
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle
              cx="64" cy="64" r="60"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              className="text-bull-orange"
              strokeDasharray={377}
              strokeDashoffset={377 - (377 * progress / 100)}
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
          </svg>
          <span className="text-4xl font-display font-bold">{currentTimeLeft}s</span>
        </div>
        <h3 className="mt-8 text-2xl font-display font-bold">
          {isConfirming ? 'Confirming Visit' : 'Viewing Advertisement'}
        </h3>
        <p className="text-zinc-400 mt-2">
          {isConfirming 
            ? 'Please wait while we confirm your visit...' 
            : 'Keep the window open to receive your reward.'}
        </p>
        {isPaused && (
          <p className="mt-4 text-yellow-400 font-bold">
            Paused! Return to the Ad tab.
          </p>
        )}
        <p className="mt-4 font-mono text-bull-orange font-bold">{activeAd.title}</p>
        
        {/* Progress bar for website ads */}
        {!isConfirming && (
          <div className="w-64 mt-6">
            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-bull-orange transition-all duration-1000"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  const isLoading = bitcoTasksLoading;

  return (
    <div className="space-y-6">
<div className="p-8 rounded-[2rem] glass bg-gradient-to-br from-bull-orange/10 to-transparent border border-bull-orange/20">
  <div className="max-w-2xl">
    <h3 className="text-3xl font-display font-bold mb-4">PTC Ads</h3>
    <p className="text-zinc-400 leading-relaxed">
      Earn BULLFI rewards by viewing advertisements from our advertisers. 
      Complete ads daily to unlock premium faucets.
    </p>
    <p className="text-[10px] text-zinc-500 mt-4 leading-normal max-w-lg">
      <span className="text-bull-orange font-bold">Disclaimer:</span> Any link served through advertisements is not an endorsement or recommendation by BullFaucet. Please exercise your due diligence before use.
    </p>
  </div>
</div>

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full flex flex-col items-center justify-center p-12 glass rounded-3xl">
            <div className="w-8 h-8 border-4 border-bull-orange border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-zinc-400">Loading ADs...</p>
          </div>
        ) : allTasks.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center p-12 glass rounded-3xl">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
              <MousePointer2 className="w-8 h-8 text-zinc-500" />
            </div>
            <p className="text-zinc-400 text-center">
              No PTC Ads available at the moment.<br />
              <span className="text-xs text-zinc-600 mt-2 block">
                Turn off your VPN and Ad Blocker to access PTC Ads.
              </span>
            </p>
          </div>
        ) : (
          allTasks.map((ad) => {
            return (
              <div 
                key={ad.uniqueId} 
                className="p-6 rounded-3xl glass border border-white/5 hover:border-bull-orange/30 transition-all group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center group-hover:bg-bull-orange/10 transition-colors">
 {ad.type === 'bitcotasks' ? (
  <div className="w-6 h-6 flex items-center justify-center">
    <img 
      src={ad.imageUrl} 
      alt="" 
      className="w-6 h-6 rounded-full"
      onError={(e) => {
        e.currentTarget.style.display = 'none';
        // Show the MousePointer icon by replacing the img with the icon
        const parent = e.currentTarget.parentElement;
        if (parent) {
          parent.innerHTML = '<svg class="w-6 h-6 text-bull-orange" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/><path d="M13 13l6 6"/></svg>';
        }
      }}
    />
  </div>
) : (
  <MousePointer2 className="w-6 h-6 text-bull-orange" />
)}
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                      Reward
                    </p>
                    <p className="font-mono font-bold text-emerald-400">
                      +{ad.displayReward} BULLFI
                    </p>
                  </div>
                </div>
                
                <h4 className="font-display font-bold text-lg mb-1 line-clamp-1">
                  {ad.title || ad.taskTitle}
                </h4>
                <p className="text-xs text-zinc-500 mb-4 line-clamp-2 h-8">
                  {ad.description}
                </p>
                
                <div className="flex items-center gap-4 text-xs text-zinc-500 mb-6">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {ad.duration}s
                  </span>
                  <span className="flex items-center gap-1">
                    <ExternalLink className="w-3 h-3" />
                    {ad.type === 'bitcotasks' ? 'BitcoTask' : ad.campaignType === 'Links' ? 'Frameless' : ad.campaignType === 'Website' ? 'Framed' : 'Direct Link'}
                  </span>
                </div>
                
                <button
                  onClick={() => startAd(ad)}
                  disabled={!!activeAd}
                  className="w-full py-3 rounded-xl bg-white/5 hover:bg-bull-orange font-bold transition-all group-hover:shadow-lg group-hover:shadow-bull-orange/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {activeAd ? 'Task in Progress' : 'View Ad'}
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default PTCSection;