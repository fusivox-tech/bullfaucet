import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Briefcase, Lock, Unlock, Info, Volume2, VolumeX, ChevronDown } from 'lucide-react';
import { User, FaucetClaim, FaucetToken } from '../types';
import Counter from './Counter';
import confetti from 'canvas-confetti';
import API_BASE_URL from '../config';
import { useData } from '../contexts/DataContext';

interface DailyActivity {
  ptcToday: number;
  ptcEarningsToday: number;
  faucetToday: number;
  faucetEarningsToday: number;
  offerWallToday: number;
  offerWallEarningsToday: number;
  referralsToday: number;
  tasksCreatedToday: number;
  lastBonusDay: string | null;
  faucetEarnings: any;
}

interface FaucetSectionProps {
  user: User | null;
  claims: FaucetClaim[];
  dailyActivity?: DailyActivity;
  onSpin: (coin: string, roll: string, prize: number) => Promise<void>;
  setAlert: (alert: { message: string; type: string }) => void;
  checkAuth: () => boolean;
  tokenPrice: number;
  solanaPrice: number;
  bitcoinPrice: number;
  binancePrice: number;
  ripplePrice: number;
}

const FaucetSection: React.FC<FaucetSectionProps> = ({ 
  user, 
  dailyActivity,
  onSpin, 
  setAlert,
  checkAuth,
  tokenPrice,
  solanaPrice,
  bitcoinPrice,
  binancePrice,
  ripplePrice
}) => {

  const faucetTokens: FaucetToken[] = useMemo(() => [
    {
      id: 'BULLFI',
      name: 'BullFaucet Coin',
      ticker: 'BULLFI',
      image: 'https://res.cloudinary.com/danuehpic/image/upload/v1771869815/logo_tflaaq.png',
      color: '#e36a0d',
      dailyPtcRequirement: 10,
      permanentUnlockRequirement: 2,
      multiplier: tokenPrice,
      price: tokenPrice,
      network: 'Solana',
      timestampField: 'lastBULLFIClaim'
    },
    {
      id: 'SOL',
      name: 'Solana',
      ticker: 'SOL',
      image: 'https://res.cloudinary.com/danuehpic/image/upload/v1771869814/sol_bdocle.png',
      color: '#9333ea',
      dailyPtcRequirement: 30,
      permanentUnlockRequirement: 5,
      multiplier: solanaPrice,
      price: solanaPrice,
      network: 'Solana',
      timestampField: 'lastSOLClaim'
    },
    {
      id: 'XRP',
      name: 'Ripple',
      ticker: 'XRP',
      image: 'https://res.cloudinary.com/danuehpic/image/upload/v1771869815/xrp_uhhwwx.png',
      color: '#60a5fa',
      dailyPtcRequirement: 50,
      permanentUnlockRequirement: 10,
      multiplier: ripplePrice,
      price: ripplePrice,
      network: 'Ripple',
      timestampField: 'lastXRPClaim'
    },
    {
      id: 'BNB',
      name: 'Binance Coin',
      ticker: 'BNB',
      image: 'https://res.cloudinary.com/danuehpic/image/upload/v1771869814/bnb_jrwljy.png',
      color: '#eab308',
      dailyPtcRequirement: 75,
      permanentUnlockRequirement: 20,
      multiplier: binancePrice,
      price: binancePrice,
      network: 'BEP20',
      timestampField: 'lastBNBClaim'
    },
    {
      id: 'BTC',
      name: 'Bitcoin',
      ticker: 'BTC',
      image: 'https://res.cloudinary.com/danuehpic/image/upload/v1771869814/bitcoin_lhzjiu.png',
      color: '#fb923c',
      dailyPtcRequirement: 100,
      permanentUnlockRequirement: 50,
      multiplier: bitcoinPrice,
      price: bitcoinPrice,
      network: 'Bitcoin',
      timestampField: 'lastBTCClaim'
    }
  ], [tokenPrice, solanaPrice, bitcoinPrice, binancePrice, ripplePrice]);

  const { selectedToken, setSelectedToken } = useData();
  const [showTokenSelector, setShowTokenSelector] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  
  // Spinning state
  const [rolling, setRolling] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [digits, setDigits] = useState(['0', '0', '0']);
  const [wonAmount, setWonAmount] = useState<{ usd: number; token: number } | null>(null);
  
  // Timer state
  const [timeLeft, setTimeLeft] = useState<Record<string, number>>({});
  
  // Animation states
  const [showPrizeAnimation, setShowPrizeAnimation] = useState(false);
  const [prizePosition, setPrizePosition] = useState({ x: 0, y: 0 });
  
  // Sound
  const [isMuted, setIsMuted] = useState(false);
  const diceSoundRef = useRef<HTMLAudioElement | null>(null);
  const confettiSoundRef = useRef<HTMLAudioElement | null>(null);

  // Lifetime offer earnings in USD
  const lifetimeOfferEarningUsd = (user?.lifetimeOfferEarning || 0) * tokenPrice;
  
  const todayEarnings = useMemo(() => {
  const ptcUsd = (dailyActivity?.ptcEarningsToday || 0) * tokenPrice;
  const offersUsd = (dailyActivity?.offerWallEarningsToday || 0) * tokenPrice;
  let faucetUsd = 0;
  
  if (dailyActivity?.faucetEarnings) {
    faucetUsd += (dailyActivity.faucetEarnings.bullfiFaucetEarningsToday || 0) * tokenPrice;
    faucetUsd += (dailyActivity.faucetEarnings.solFaucetEarningsToday || 0) * solanaPrice;
    faucetUsd += (dailyActivity.faucetEarnings.xrpFaucetEarningsToday || 0) * ripplePrice;
    faucetUsd += (dailyActivity.faucetEarnings.bnbFaucetEarningsToday || 0) * binancePrice;
    faucetUsd += (dailyActivity.faucetEarnings.btcFaucetEarningsToday || 0) * bitcoinPrice;
  }
  
  // Total USD earnings
  const totalUsd = ptcUsd + faucetUsd + offersUsd;
  
  return {
    ptc: dailyActivity?.ptcEarningsToday || 0,
    faucet: dailyActivity?.faucetEarningsToday || 0,
    offers: dailyActivity?.offerWallEarningsToday || 0,
    
    // USD values
    ptcUsd,
    faucetUsd,
    offersUsd,
    totalUsd,
    
    faucetBreakdown: {
      bullfiUsd: (dailyActivity?.faucetEarnings?.bullfiFaucetEarningsToday || 0) * tokenPrice,
      solUsd: (dailyActivity?.faucetEarnings?.solFaucetEarningsToday || 0) * solanaPrice,
      xrpUsd: (dailyActivity?.faucetEarnings?.xrpFaucetEarningsToday || 0) * ripplePrice,
      bnbUsd: (dailyActivity?.faucetEarnings?.bnbFaucetEarningsToday || 0) * binancePrice,
      btcUsd: (dailyActivity?.faucetEarnings?.btcFaucetEarningsToday || 0) * bitcoinPrice,
    }
  };
}, [dailyActivity, tokenPrice, solanaPrice, ripplePrice, binancePrice, bitcoinPrice]);

  // Get today's PTC count from dailyActivity (more reliable than user.ads_completed_today)
  const ptcToday = useMemo(() => {
    return dailyActivity?.ptcToday || user?.ads_completed_today || 0;
  }, [dailyActivity, user?.ads_completed_today]);

  // Reward tiers
  const rewardTiers = useMemo(() => [
    { range: '0 - 985', reward: 0.0002 },
    { range: '986 - 989', reward: 0.002 },
    { range: '990 - 992', reward: 0.02 },
    { range: '993 - 996', reward: 0.2 },
    { range: '997 - 998', reward: 2 },
    { range: '999', reward: 20 }
  ], []);

  // Calculate time left for each token
  const calculateTimeLeft = useCallback(() => {
    const newTimeLeft: Record<string, number> = {};
    faucetTokens.forEach(token => {
      const lastClaimTime = user?.[token.timestampField as keyof User];
      if (lastClaimTime && typeof lastClaimTime === 'string') {
        const now = new Date();
        const lastClaim = new Date(lastClaimTime);
        const diffInSeconds = Math.floor((now.getTime() - lastClaim.getTime()) / 1000);
        const remaining = Math.max(0, (30 * 60) - diffInSeconds);
        newTimeLeft[token.id] = remaining;
      } else {
        newTimeLeft[token.id] = 0;
      }
    });
    setTimeLeft(newTimeLeft);
  }, [user, faucetTokens]);

  useEffect(() => {
    calculateTimeLeft();
  }, [calculateTimeLeft]);

  // Timer countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(tokenId => {
          if (updated[tokenId] > 0) {
            updated[tokenId] = updated[tokenId] - 1;
          }
        });
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Load sound preferences
  useEffect(() => {
    const savedMutePreference = localStorage.getItem('diceSoundMuted');
    if (savedMutePreference !== null) {
      setIsMuted(JSON.parse(savedMutePreference));
    }
  }, []);

  // Initialize audio elements
  useEffect(() => {
    diceSoundRef.current = new Audio('/slot.wav');
    diceSoundRef.current.preload = 'auto';
    diceSoundRef.current.volume = 0.10;
    
    confettiSoundRef.current = new Audio('/confetti.wav');
    confettiSoundRef.current.preload = 'auto';
    confettiSoundRef.current.volume = 0.5;
    
    return () => {
      diceSoundRef.current?.pause();
      confettiSoundRef.current?.pause();
    };
  }, []);

  const toggleMute = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    localStorage.setItem('diceSoundMuted', JSON.stringify(newMutedState));
  };

  const playConfettiSound = () => {
    if (confettiSoundRef.current && !isMuted) {
      confettiSoundRef.current.currentTime = 0;
      confettiSoundRef.current.play().catch(console.log);
    }
  };

  const triggerConfetti = () => {
    const count = 200;
    const defaults = { origin: { y: 0.7 }, spread: 90, ticks: 100 };

    const fire = (particleRatio: number, opts: any) => {
      confetti({ ...defaults, ...opts, particleCount: Math.floor(count * particleRatio) });
    };

    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });
  };

  const showFlyingPrize = (amount: number, tokenAmount: number) => {
    const diceDisplay = document.querySelector('.dice-display');
    if (diceDisplay) {
      const rect = diceDisplay.getBoundingClientRect();
      setPrizePosition({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      });
    }
    
    setWonAmount({ usd: amount, token: tokenAmount });
    setShowPrizeAnimation(true);
    
    setTimeout(() => {
      setShowPrizeAnimation(false);
    }, 3000);
  };

  const formatTime = (seconds: number) => {
    if (!seconds) return "Ready";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s < 10 ? '0' : ''}${s}s`;
  };

  const formatNumber = (num: number, token: FaucetToken) => {
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M ${token.ticker}`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K ${token.ticker}`;
    return `${token.ticker === "BULLFI" ? Math.round(num) : num.toFixed(8)} ${token.ticker}`;
  };

  // Check if faucet is unlocked using dailyActivity.ptcToday
  const isFaucetUnlocked = (token: FaucetToken) => {
    // Check permanent unlock via lifetime offer earnings
    if (lifetimeOfferEarningUsd >= token.permanentUnlockRequirement) {
      return true;
    }
    
    // Check daily unlock via PTC ads from dailyActivity
    return ptcToday >= token.dailyPtcRequirement;
  };

  // Get unlock progress using dailyActivity
  const getUnlockProgress = (token: FaucetToken) => {
    const lifetimeOfferEarning = user?.lifetimeOfferEarning || 0;
    const lifetimeOfferEarningUsd = lifetimeOfferEarning * tokenPrice;
    
    const dailyProgress = Math.min(ptcToday / token.dailyPtcRequirement, 1);
    const permanentProgress = Math.min(lifetimeOfferEarningUsd / token.permanentUnlockRequirement, 1);
    
    return {
      dailyProgress,
      permanentProgress,
      remainingDaily: Math.max(0, token.dailyPtcRequirement - ptcToday),
      remainingPermanent: Math.max(0, token.permanentUnlockRequirement - lifetimeOfferEarningUsd),
      isPermanentlyUnlocked: lifetimeOfferEarningUsd >= token.permanentUnlockRequirement
    };
  };

  const calculateTokenReward = (usdAmount: number) => {
    return usdAmount / selectedToken.price;
  };

  const rollDice = async () => {
    if (!checkAuth()) return;
    
    if (rolling || spinning || !isFaucetUnlocked(selectedToken) || timeLeft[selectedToken.id] > 0) return;

    setRolling(true);
    setWonAmount(null);
    setShowPrizeAnimation(false);

    if (diceSoundRef.current && !isMuted) {
      diceSoundRef.current.currentTime = 0;
      diceSoundRef.current.play().catch(console.log);
    }

    const duration = 3000;
    const startTime = Date.now();

    const rollInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      if (progress < 1) {
        setDigits(Array(3).fill(0).map(() => Math.floor(Math.random() * 10).toString()));
      } else {
        clearInterval(rollInterval);
        executeSpin();
      }
    }, 100);
  };

  const executeSpin = async () => {
    try {
      setSpinning(true);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/referral/spin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ faucetToken: selectedToken.id })
      });

      const data = await response.json();
      
      if (diceSoundRef.current) {
        diceSoundRef.current.pause();
        diceSoundRef.current.currentTime = 0;
      }

      if (!response.ok) {
        if (response.status === 429 && data.timeLeft) {
          setTimeLeft(prev => ({ ...prev, [selectedToken.id]: data.timeLeft }));
          throw new Error(`Cooldown active: ${formatTime(data.timeLeft)} remaining`);
        }
        throw new Error(data.message || 'Spin failed');
      }

      if (!data.success) {
        throw new Error(data.message || 'Spin failed');
      }

      setDigits(data.roll.split(''));
      setRolling(false);
      
      // Update time left
      setTimeLeft(prev => ({ ...prev, [selectedToken.id]: 30 * 60 }));
      
      // Call parent handler
      await onSpin(selectedToken.id, data.roll, data.prize);
      
      if (data.prize > 0) {
        showFlyingPrize(data.prizeUsd || 0, data.prize);
        playConfettiSound();
        triggerConfetti();
      }

    } catch (error: any) {
      console.error('Spin error:', error);
      setAlert({ message: error.message, type: 'error' });
      setRolling(false);
    } finally {
      setSpinning(false);
    }
  };

  const progress = getUnlockProgress(selectedToken);

  return (
    <div className="space-y-6">
      {/* Header with Token Selector and Controls */}
      <div className="flex flex-row gap-4 justify-between items-center px-1">
        <button 
          onClick={() => setShowTokenSelector(true)}
          className="flex items-center gap-3 px-4 py-2 rounded-2xl glass hover:bg-white/5 transition-all"
          disabled={rolling || spinning}
        >
          <img src={selectedToken.image} alt={selectedToken.name} className="w-8 h-8 object-contain" />
          <div className="text-left">
            <h3 className="font-display font-bold">{selectedToken.ticker}</h3>
            <p className="text-xs text-zinc-400">{selectedToken.name}</p>
          </div>
          <ChevronDown className="w-5 h-5 text-zinc-400" />
        </button>

        <div className="flex gap-2">
          <button
            onClick={() => setShowRulesModal(true)}
            className="p-2 rounded-xl glass hover:bg-white/5 transition-all"
          >
            <Info className="w-5 h-5 text-zinc-400" />
          </button>
          <button
            onClick={toggleMute}
            className={`p-2 rounded-xl glass hover:bg-white/5 transition-all ${isMuted ? 'text-red-400' : 'text-zinc-400'}`}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Today's Progress Summary - New section showing daily stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 px-1">
        <div className="p-3 rounded-xl glass">
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider">PTC Today</p>
          <p className="text-lg font-display font-bold text-bull-orange">{ptcToday}</p>
        </div>
        <div className="p-3 rounded-xl glass">
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider">PTC Earnings</p>
          <p className="text-lg font-display font-bold text-emerald-400">${todayEarnings.ptcUsd > 0.01 ? todayEarnings.ptcUsd.toFixed(2) : todayEarnings.ptcUsd.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 4 })}</p>
        </div>
        <div className="p-3 rounded-xl glass">
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Faucet Claims</p>
          <p className="text-lg font-display font-bold text-bull-orange">{dailyActivity?.faucetToday || 0}</p>
        </div>
        <div className="p-3 rounded-xl glass">
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Faucet Earnings</p>
          <p className="text-lg font-display font-bold text-emerald-400">${todayEarnings.faucetUsd > 0.01 ? todayEarnings.faucetUsd.toFixed(2) : todayEarnings.faucetUsd.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 4 })}</p>
        </div>
      </div>

      {/* Main Faucet Display */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-8 rounded-[2rem] glass relative overflow-hidden flex flex-col items-center justify-center min-h-[400px]">
          {!isFaucetUnlocked(selectedToken) ? (
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                <Briefcase className="w-10 h-10 text-zinc-500" />
              </div>
              <h3 className="text-2xl font-display font-bold">Faucet Locked</h3>
              <p className="text-zinc-400 max-w-xs mx-auto">
                Complete <span className="text-bull-orange font-bold">{selectedToken.dailyPtcRequirement} PTC Ads</span> today to unlock the {selectedToken.ticker} faucet.
              </p>
              <div className="pt-4">
                <div className="w-48 h-2 bg-white/5 rounded-full mx-auto overflow-hidden">
                  <div 
                    className="h-full bg-bull-orange" 
                    style={{ width: `${progress.dailyProgress * 100}%` }} 
                  />
                </div>
                <p className="text-[10px] text-zinc-500 mt-2 font-bold uppercase tracking-widest">
                  {ptcToday} / {selectedToken.dailyPtcRequirement} Completed
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex gap-4 mb-12 dice-display">
                {digits.map((digit, i) => (
                  <motion.div
                    key={i}
                    animate={rolling ? { y: [0, -20, 0] } : {}}
                    transition={{ repeat: Infinity, duration: 0.2, delay: i * 0.1 }}
                  >
                    <Counter 
                      value={rolling ? Math.floor(Math.random() * 10) : parseInt(digit)}
                      fontSize={80}
                      places={[1]}
                      spinSpeed={30}
                    />
                  </motion.div>
                ))}
              </div>

              <button
                disabled={rolling || spinning || timeLeft[selectedToken.id] > 0}
                onClick={rollDice}
                className={`px-12 py-4 rounded-2xl font-display font-bold text-xl transition-all ${
                  timeLeft[selectedToken.id] > 0
                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
                    : 'bg-bull-orange hover:scale-105 active:scale-95 shadow-xl shadow-bull-orange/20'
                }`}
              >
                {timeLeft[selectedToken.id] > 0 
                  ? formatTime(timeLeft[selectedToken.id])
                  : rolling || spinning ? 'Spinning...' : 'SPIN NOW'}
              </button>
              
              {timeLeft[selectedToken.id] === 0 && (
                <p className="mt-4 text-xs text-zinc-500 font-medium">Faucet available every 30 minutes</p>
              )}
            </>
          )}
        </div>

        {/* Reward Tiers Panel */}
        <div className="p-6 rounded-[2rem] glass space-y-6">
          <h4 className="font-display font-bold text-lg">Reward Tiers</h4>
          <div className="space-y-3">
            {rewardTiers.map((tier, index) => {
              const tokenAmount = calculateTokenReward(tier.reward);
              return (
                <div 
                  key={tier.range} 
                  className={`p-4 rounded-2xl flex items-center justify-between border ${
                    index === 5 ? 'border-bull-orange bg-bull-orange/10' : 'border-white/5 bg-white/5'
                  }`}
                >
                  <span className="text-sm font-medium text-zinc-400">{tier.range}</span>
                  <span className={`font-mono font-bold ${index === 5 ? 'text-bull-orange' : ''}`}>
                    {selectedToken.ticker === 'BULLFI' 
                      ? Math.round(tokenAmount).toLocaleString() 
                      : tokenAmount.toFixed(selectedToken.ticker === 'BTC' ? 8 : 4)} {selectedToken.ticker}
                  </span>
                </div>
              );
            })}
          </div>
          
          {/* Unlock Progress */}
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
              <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider mb-1">
                {progress.isPermanentlyUnlocked ? '✓ Permanently Unlocked' : 'Permanent Unlock Progress'}
              </p>
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden mb-2">
                <div 
                  className="h-full bg-emerald-400" 
                  style={{ width: `${progress.permanentProgress * 100}%` }} 
                />
              </div>
              <p className="text-xs text-zinc-400">
                {progress.isPermanentlyUnlocked 
                  ? 'Faucet permanently unlocked!'
                  : `Earn $${progress.remainingPermanent.toFixed(2)} more from offers`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Flying Prize Animation */}
      <AnimatePresence>
        {showPrizeAnimation && wonAmount && (
          <motion.div 
            className="fixed pointer-events-none z-50 text-4xl font-display font-bold"
            style={{
              left: prizePosition.x,
              top: prizePosition.y,
              color: selectedToken.color,
              textShadow: `0 0 20px ${selectedToken.color}80`
            }}
            initial={{ opacity: 1, scale: 1, y: 0 }}
            animate={{ 
              opacity: 0, 
              scale: 2, 
              y: -200,
              transition: { duration: 2, ease: "easeOut" }
            }}
            exit={{ opacity: 0 }}
          >
            +{formatNumber(wonAmount.token, selectedToken)}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Token Selector Modal */}
      <AnimatePresence>
        {showTokenSelector && (
          <motion.div 
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowTokenSelector(false)}
          >
            <motion.div 
              className="bg-bull-dark border border-white/10 rounded-3xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <h2 className="text-2xl font-display font-bold">Select Faucet Token</h2>
                <button 
                  onClick={() => setShowTokenSelector(false)}
                  className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all"
                >
                  ✕
                </button>
              </div>
              
              <div className="p-4 overflow-y-auto max-h-[60vh]">
                <div className="space-y-2">
                  {faucetTokens.map(token => {
                    const isUnlocked = isFaucetUnlocked(token);
                    const tokenProgress = getUnlockProgress(token);
                    
                    return (
                      <button
                        key={token.id}
                        onClick={() => {
                          setSelectedToken(token);
                          setShowTokenSelector(false);
                        }}
                        className={`w-full p-4 rounded-2xl flex items-center pr-6 pb-6 gap-4 transition-all ${
                          selectedToken.id === token.id 
                            ? 'bg-bull-orange/20 border-2 border-bull-orange' 
                            : 'bg-white/5 hover:bg-white/10 border border-white/10'
                        }`}
                      >
                        <img src={token.image} alt={token.name} className="w-12 h-12 object-contain" />
                        
                        <div className="flex-1 text-left">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-display font-bold text-lg">{token.ticker}</h3>
                            {isUnlocked ? (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-1">
                                <Unlock className="w-3 h-3" /> Unlocked
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-zinc-500/20 text-zinc-400 text-xs font-bold flex items-center gap-1">
                                <Lock className="w-3 h-3" /> Locked
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-zinc-400 mb-2">{token.name}</p>
                          
                          {/* Unlock progress bars */}
                          <div className="space-y-2">
                            <div>
                              <div className="flex justify-between text-[10px] text-zinc-500 mb-1">
                                <span>Daily PTC</span>
                                <span>{token.dailyPtcRequirement} ads</span>
                              </div>
                              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-bull-orange"
                                  style={{ width: `${tokenProgress.dailyProgress * 100}%` }}
                                />
                              </div>
                              <div className="text-right text-[8px] text-zinc-600 mt-0.5">
                                {ptcToday}/{token.dailyPtcRequirement}
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between text-[10px] text-zinc-500 mb-1">
                                <span>Permanent</span>
                                <span>${token.permanentUnlockRequirement}</span>
                              </div>
                              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-emerald-400"
                                  style={{ width: `${tokenProgress.permanentProgress * 100}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rules Modal */}
      <AnimatePresence>
        {showRulesModal && (
          <motion.div 
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowRulesModal(false)}
          >
            <motion.div 
              className="bg-bull-dark border border-white/10 rounded-3xl max-w-2xl w-full max-h-[90%] overflow-y-auto scrollbar-hide"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-white/10 flex items-center justify-between sticky top-0 bg-[#20242a] z-10">
                <h2 className="text-2xl font-display font-bold">How It Works</h2>
                <button 
                  onClick={() => setShowRulesModal(false)}
                  className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all"
                >
                  ✕
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="space-y-4">
                  {[
                    "Select a token faucet from the dropdown",
                    "Unlock the faucet by completing PTC ads or earning from offers",
                    "Click spin to generate a random 3-digit number (000-999)",
                    "Reward depends on the number range",
                    "Wait 30 minutes to spin again for the same token"
                  ].map((step, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="w-6 h-6 rounded-full bg-bull-orange/20 flex items-center justify-center text-sm font-bold text-bull-orange flex-shrink-0">
                        {index + 1}
                      </div>
                      <p className="text-zinc-300">{step}</p>
                    </div>
                  ))}
                </div>

                <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                  <h3 className="font-display font-bold text-lg mb-4">Unlock Requirements</h3>
                  
                  {/* Desktop Table - Hidden on mobile */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-xs text-zinc-500">
                          <th className="text-left py-2">Token</th>
                          <th className="text-left py-2">Daily PTC Ads</th>
                          <th className="text-left py-2">Permanent ($ from offers)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {faucetTokens.map(token => (
                          <tr key={token.id} className="border-t border-white/5">
                            <td className="py-3 font-medium">{token.ticker}</td>
                            <td className="py-3">{token.dailyPtcRequirement}</td>
                            <td className="py-3">${token.permanentUnlockRequirement}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Mobile Card Layout - Visible only on mobile */}
                  <div className="md:hidden space-y-3">
                    {faucetTokens.map(token => (
                      <div key={token.id} className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <div className="flex items-center gap-3 mb-3">
                          <img src={token.image} alt={token.name} className="w-8 h-8 object-contain" />
                          <div>
                            <h4 className="font-display font-bold">{token.ticker}</h4>
                            <p className="text-xs text-zinc-400">{token.name}</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="p-2 rounded-lg bg-white/5">
                            <p className="text-[10px] text-zinc-500 mb-1">Daily PTC</p>
                            <p className="font-mono font-bold text-bull-orange">{token.dailyPtcRequirement} ads</p>
                          </div>
                          <div className="p-2 rounded-lg bg-white/5">
                            <p className="text-[10px] text-zinc-500 mb-1">Permanent</p>
                            <p className="font-mono font-bold text-emerald-400">${token.permanentUnlockRequirement}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-zinc-500 p-2">
                  <p>Note: Permanent unlock is achieved when you earn the specified amount from offers. Once permanently unlocked, the faucet no longer requires daily PTC ads.</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FaucetSection;