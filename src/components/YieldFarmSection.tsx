import React, { useState, useEffect, useRef } from 'react';
import { Sprout, Info, X, CheckCircle, AlertCircle, Lock, ChevronDown } from 'lucide-react';
import { User, COINS, YieldFarm } from '../types';
import { useData } from '../contexts/DataContext';

interface YieldFarmSectionProps {
  user: User | null;
  farms: YieldFarm[];
  onLock: (data: {
    token: string;
    amount: number;
    farmType: string;
    days: number;
    rate: number;
  }) => void;
}

// Yield tiers data (matching old app)
const YIELD_TIERS = [
  {
    id: 'allotment',
    name: 'Allotment',
    days: 10,
    dailyRate: 0.5,
    apr: 182.5,
    minAmountUsd: 5,
    badge: null,
    description: 'Short-term commitment with moderate yields'
  },
  {
    id: 'homestead',
    name: 'Homestead',
    days: 30,
    dailyRate: 0.6,
    apr: 219,
    minAmountUsd: 10,
    badge: 'popular',
    description: 'Perfect balance of duration and yield'
  },
  {
    id: 'plantation',
    name: 'Plantation',
    days: 90,
    dailyRate: 0.7,
    apr: 255.5,
    minAmountUsd: 15,
    badge: null,
    description: 'Medium-term farm with enhanced rewards'
  },
  {
    id: 'estate',
    name: 'Estate',
    days: 180,
    dailyRate: 0.8,
    apr: 292,
    minAmountUsd: 20,
    badge: null,
    description: 'Substantial commitment for serious farmers'
  },
  {
    id: 'industrial',
    name: 'Industrial Complex',
    days: 270,
    dailyRate: 0.9,
    apr: 328.5,
    minAmountUsd: 25,
    badge: 'best',
    description: 'Premium tier for maximum returns'
  },
  {
    id: 'conglomerate',
    name: 'Conglomerate',
    days: 360,
    dailyRate: 1.0,
    apr: 365,
    minAmountUsd: 30,
    badge: null,
    description: 'Ultimate long-term farming experience'
  }
];

// Token configuration with prices from user context
const getTokens = (user: User | null, prices: Record<string, number>) => [
  {
    symbol: 'BULLFI',
    name: 'BullFaucet Coin',
    image: COINS.find(c => c.id === 'BULLFI')?.icon || '',
    decimals: 9,
    balance: user?.bullfiBalance || 0,
    price: prices.BULLFI || 0.01,
    minFarmAmount: 10,
  },
  {
    symbol: 'SOL',
    name: 'Solana',
    image: COINS.find(c => c.id === 'SOL')?.icon || '',
    decimals: 9,
    balance: user?.solanaBalance || 0,
    price: prices.SOL || 0,
    minFarmAmount: 0.01,
  },
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    image: COINS.find(c => c.id === 'BTC')?.icon || '',
    decimals: 8,
    balance: user?.bitcoinBalance || 0,
    price: prices.BTC || 0,
    minFarmAmount: 0.0001,
  },
  {
    symbol: 'BNB',
    name: 'Binance Coin',
    image: COINS.find(c => c.id === 'BNB')?.icon || '',
    decimals: 18,
    balance: user?.bnbBalance || 0,
    price: prices.BNB || 0,
    minFarmAmount: 0.01,
  },
  {
    symbol: 'XRP',
    name: 'Ripple',
    image: COINS.find(c => c.id === 'XRP')?.icon || '',
    decimals: 6,
    balance: user?.xrpBalance || 0,
    price: prices.XRP || 0,
    minFarmAmount: 1,
  }
];

const YieldFarmSection: React.FC<YieldFarmSectionProps> = ({ user, farms, onLock }) => {
  const { prices } = useData();
  const [selectedTier, setSelectedTier] = useState<typeof YIELD_TIERS[0] | null>(null);
  const [showPlantModal, setShowPlantModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [plantAmount, setPlantAmount] = useState('');
  const [selectedCoin, setSelectedCoin] = useState('BULLFI');
  const [showTokenDropdown, setShowTokenDropdown] = useState(false);
  const [estimatedYield, setEstimatedYield] = useState({ daily: 0, total: 0, dailyUsd: 0, totalUsd: 0 });
  
  const tokenDropdownRef = useRef<HTMLDivElement>(null);
  const tiersContainerRef = useRef<HTMLDivElement>(null);

  const tokens = getTokens(user, prices);
  const selectedTokenInfo = tokens.find(t => t.symbol === selectedCoin);
  
  const totalPendingRewards = farms.reduce((total, farm) => {
    const token = tokens.find(t => t.symbol === farm.token);
    const tokenPrice = token?.price || 0;
    const daysPassed = (Date.now() - new Date(farm.startDate).getTime()) / (1000 * 60 * 60 * 24);
    const accrued = farm.amount * (farm.dailyYield / 100) * Math.min(daysPassed, farm.duration || 0);
    return total + (accrued * tokenPrice);
  }, 0);

  // Calculate total yields received in USD
  const totalYieldsReceived = farms.reduce((total, farm) => {
    const token = tokens.find(t => t.symbol === farm.token);
    const tokenPrice = token?.price || 0;
    return total + ((farm.totalYieldReceived || 0) * tokenPrice);
  }, 0);

  // Calculate farm statistics
  const totalLockedValue = farms.reduce((total, farm) => {
    return total + (farm.amountUsd || 0);
  }, 0);

  const calculateProgress = (farm: YieldFarm) => {
    const now = new Date().getTime();
    const start = new Date(farm.startDate).getTime();
    const end = new Date(farm.endDate).getTime();
    const totalDuration = end - start;
    const elapsed = now - start;
    return Math.min((elapsed / totalDuration) * 100, 100);
  };

  const calculateFarmRewards = (farm: YieldFarm) => {
    const now = new Date().getTime();
    const start = new Date(farm.startDate).getTime();
    const end = new Date(farm.endDate).getTime();
    const daysPassed = (now - start) / (1000 * 60 * 60 * 24);
    const totalDays = farm.duration || 0; // Add fallback in case duration is undefined
    
    const accrued = farm.amount * (farm.dailyYield / 100) * Math.min(daysPassed, totalDays);
    const pending = farm.amount * (farm.dailyYield / 100) * Math.max(0, totalDays - daysPassed);
    
    return { 
      accrued, 
      pending,
      total: accrued + pending,
      canHarvest: now >= end
    };
  };

  const formatDuration = (days: number) => {
    if (days < 30) return `${days} days`;
    if (days < 365) return `${Math.floor(days / 30)} months`;
    return `${Math.floor(days / 365)} year`;
  };

  // Calculate estimated yield when amount or tier changes
  useEffect(() => {
    if (selectedTier && plantAmount && selectedTokenInfo) {
      const amount = parseFloat(plantAmount) || 0;
      const dailyYieldAmount = amount * (selectedTier.dailyRate / 100);
      const totalYieldAmount = dailyYieldAmount * selectedTier.days;
      
      setEstimatedYield({
        daily: dailyYieldAmount,
        total: totalYieldAmount,
        dailyUsd: dailyYieldAmount * selectedTokenInfo.price,
        totalUsd: totalYieldAmount * selectedTokenInfo.price
      });
    }
  }, [plantAmount, selectedTier, selectedTokenInfo]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tokenDropdownRef.current && !tokenDropdownRef.current.contains(event.target as Node)) {
        setShowTokenDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTierSelect = (tier: typeof YIELD_TIERS[0]) => {
    setSelectedTier(tier);
    setShowPlantModal(true);
    setPlantAmount('');
    setShowTokenDropdown(false);
  };

  const handleTokenSelect = (tokenSymbol: string) => {
    setSelectedCoin(tokenSymbol);
    setShowTokenDropdown(false);
    setPlantAmount('');
  };

  const handleLockSubmit = () => {
    if (!selectedTier || !plantAmount || !selectedCoin) return;

    const amount = parseFloat(plantAmount);
    const selectedToken = tokens.find(t => t.symbol === selectedCoin);
    const amountUsd = amount * (selectedToken?.price || 0);

    if (amountUsd < selectedTier.minAmountUsd) {
      alert(`Minimum amount for ${selectedTier.name} is $${selectedTier.minAmountUsd}`);
      return;
    }

    onLock({
      token: selectedCoin, // Changed from 'coin' to 'token' to match interface
      amount: amount,
      farmType: selectedTier.name,
      days: selectedTier.days,
      rate: selectedTier.dailyRate / 100 // Convert percentage to decimal
    });

    setShowPlantModal(false);
    setPlantAmount('');
    setSelectedTier(null);
  };

  const minAmountInToken = selectedTier && selectedTokenInfo 
    ? selectedTier.minAmountUsd / selectedTokenInfo.price 
    : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="p-8 rounded-[2rem] glass bg-gradient-to-br from-bull-orange/10 to-transparent border border-bull-orange/20">
        <div className="max-w-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-3xl font-display font-bold">Yield Farming</h3>
            <button
              onClick={() => setShowInfoModal(true)}
              className="flex items-center gap-2 md:px-4 md:py-2 rounded-xl md:glass hover:bg-white/10 transition-all"
            >
              <Info size={16} className="text-bull-orange" />
              <span className="text-xs font-bold hidden sm:inline">How it works</span>
            </button>
          </div>
          <p className="text-zinc-400 leading-relaxed">
            Lock your assets in our specialized farms to earn passive daily returns. 
            The longer you lock, the higher your yield. Rewards are paid in full upon maturity.
          </p>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 rounded-2xl glass border border-white/5">
          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-2">Total Farm Value</p>
          <p className="text-2xl font-display font-bold">
            ${totalLockedValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-zinc-500 mt-1">
            {farms.length > 0 ? `${farms.length} Farms Active` : 'No active farms'}
          </p>
        </div>

        <div className="p-6 rounded-2xl glass border border-white/5">
          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-2">Pending Yields</p>
          <p className="text-2xl font-display font-bold text-emerald-400">
            ${totalPendingRewards.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
          </p>
          <p className="text-xs text-zinc-500 mt-1">{totalPendingRewards > 0 ? 'Accruing daily' : 'No pending yields'}</p>
        </div>

        <div className="p-6 rounded-2xl glass border border-white/5">
          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-2">Total Yields Received</p>
          <p className="text-2xl font-display font-bold">
            ${totalYieldsReceived.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
          </p>
          <p className="text-xs text-zinc-500 mt-1">{totalYieldsReceived > 0 ? 'All time' : 'Start farming!'}</p>
        </div>
      </div>

      {/* Active Farms */}
      {farms.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-display font-bold flex items-center gap-2">
            <Sprout size={20} className="text-bull-orange" />
            Your Active Farms
          </h4>
          
          <div className="space-y-3">
            {farms.map((farm) => {
              const progress = calculateProgress(farm);
              const rewards = calculateFarmRewards(farm);
              const tokenInfo = tokens.find(t => t.symbol === farm.token);
              const rewardsValueUsd = rewards.accrued * (tokenInfo?.price || 0);
              const tier = YIELD_TIERS.find(t => t.id === farm.tierId);

              return (
                <div key={farm.id} className="p-4 rounded-xl glass border border-white/5 hover:border-bull-orange/20 transition-all">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <img 
                        src={tokenInfo?.image} alt={farm.token}
                        className="w-8 h-8 object-contain"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <h5 className="font-bold">{farm.token} {tier?.name || farm.tierName} Farm</h5>
                        <p className="text-xs text-zinc-500"><p className="text-xs text-zinc-500">
  {farm.token === 'BTC' 
    ? farm.amount.toFixed(8) 
    : farm.token === 'BULLFI' 
      ? Math.round(farm.amount).toLocaleString()
      : farm.amount.toFixed(4)} {farm.token} · Started {new Date(farm.startDate).toLocaleDateString()}
</p>
                        </p>
                      </div>
                    </div>

                    <div className="flex-1 max-w-md">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-zinc-500">Progress</span>
                        <span className="font-mono">{progress.toFixed(1)}%</span>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-bull-orange to-orange-500 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-4 justify-between">
                      <div className="text-left md:text-right">
                        <p className="text-xs text-zinc-500">Accrued</p>
                        <p className="font-mono text-sm text-emerald-400 ml-0 pl-0">${rewardsValueUsd.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                      </div>
                      
                      {rewards.canHarvest ? (
                        <button 
                          className="px-4 py-2 rounded-xl bg-emerald-500 text-xs font-bold hover:bg-emerald-600 transition-all"
                        >
                          Harvest
                        </button>
                      ) : (
                        <div className="flex items-center gap-1 text-xs text-zinc-500">
                          <Lock size={12} />
                          {Math.ceil((new Date(farm.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days left
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {farms.length === 0 && (
        <div className="p-12 rounded-3xl glass border border-white/5 text-center">
          <Sprout size={48} className="mx-auto mb-4 text-bull-orange opacity-50" />
          <h4 className="text-xl font-display font-bold mb-2">No Active Farms</h4>
          <p className="text-sm text-zinc-500 mb-6">Plant your first seed to start earning yields</p>
        </div>
      )}

      {/* Yield Tiers Header */}
      <div className="flex items-center justify-between">
        <h4 className="font-display font-bold flex items-center gap-2">
          <Sprout size={20} className="text-bull-orange" />
          Create A Farm
        </h4>
      </div>

      {/* Yield Tiers - Desktop/Horizontal Scroll */}
      <div 
        ref={tiersContainerRef}
        className="hidden md:flex gap-4 overflow-x-auto pb-4 scrollbar-hide scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {YIELD_TIERS.map((tier) => (
          <div 
            key={tier.id}
            className="flex-none w-72 p-6 rounded-2xl glass border border-white/5 hover:border-bull-orange/30 transition-all group"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h5 className="font-display font-bold text-lg">{tier.name}</h5>
                <p className="text-xs text-zinc-500">{formatDuration(tier.days)}</p>
              </div>
              {tier.badge && (
                <span className={`text-[10px] px-2 py-1 rounded-full ${
                  tier.badge === 'popular' 
                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                }`}>
                  {tier.badge === 'popular' ? '🔥 Popular' : '✨ Best Value'}
                </span>
              )}
            </div>

            <p className="text-xs text-zinc-500 mb-4">{tier.description}</p>

            <div className="mb-4">
              <p className="text-3xl font-display font-bold text-emerald-400">{tier.dailyRate}%</p>
              <p className="text-xs text-zinc-500">Daily Yield</p>
            </div>

            <div className="flex justify-between text-xs mb-6">
              <span className="text-zinc-500">APR</span>
              <span className="font-bold">{tier.apr}%</span>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-6">
              <div className="p-2 rounded-lg bg-white/5">
                <p className="text-[10px] text-zinc-500">Min Lock</p>
                <p className="text-xs font-bold">${tier.minAmountUsd}</p>
              </div>
              <div className="p-2 rounded-lg bg-white/5">
                <p className="text-[10px] text-zinc-500">Total Return</p>
                <p className="text-xs font-bold">{Math.round(tier.days * tier.dailyRate)}%</p>
              </div>
            </div>

            <button
              onClick={() => handleTierSelect(tier)}
              className="w-full py-3 rounded-xl bg-bull-orange font-bold hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Plant Seed
            </button>
          </div>
        ))}
      </div>

      {/* Yield Tiers - Mobile/Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden">
        {YIELD_TIERS.map((tier) => (
          <div 
            key={tier.id}
            className="p-4 rounded-xl glass border border-white/5 hover:border-bull-orange/30 transition-all group"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h5 className="font-display font-bold">{tier.name}</h5>
                <p className="text-[10px] text-zinc-500">{formatDuration(tier.days)}</p>
              </div>
              {tier.badge && (
                <span className={`text-[8px] px-2 py-0.5 rounded-full ${
                  tier.badge === 'popular' 
                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                }`}>
                  {tier.badge === 'popular' ? '🔥' : '✨'}
                </span>
              )}
            </div>

            <div className="mb-3">
              <p className="text-2xl font-display font-bold text-emerald-400">{tier.dailyRate}%</p>
              <p className="text-[10px] text-zinc-500">Daily Yield</p>
            </div>

            <div className="flex justify-between text-[10px] mb-3">
              <span className="text-zinc-500">APR</span>
              <span className="font-bold">{tier.apr}%</span>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="p-1.5 rounded-lg bg-white/5">
                <p className="text-[8px] text-zinc-500">Min</p>
                <p className="text-[10px] font-bold">${tier.minAmountUsd}</p>
              </div>
              <div className="p-1.5 rounded-lg bg-white/5">
                <p className="text-[8px] text-zinc-500">Total</p>
                <p className="text-[10px] font-bold">{Math.round(tier.days * tier.dailyRate)}%</p>
              </div>
            </div>

            <button
              onClick={() => handleTierSelect(tier)}
              className="w-full py-2 rounded-lg bg-bull-orange text-xs font-bold hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Plant
            </button>
          </div>
        ))}
      </div>

      {/* Plant Seed Modal */}
      {showPlantModal && selectedTier && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowPlantModal(false)}
        >
          <div 
            className="max-w-md w-full rounded-3xl glass border border-white/10 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-display font-bold">Create {selectedTier.name} Farm</h3>
              <button
                onClick={() => setShowPlantModal(false)}
                className="w-8 h-8 rounded-full glass flex items-center justify-center hover:bg-white/10 transition-all"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Token Selector */}
              <div ref={tokenDropdownRef}>
                <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-2 block">
                  Select Token
                </label>
                <div className="relative">
                  <button
                    onClick={() => setShowTokenDropdown(!showTokenDropdown)}
                    className="w-full flex items-center justify-between p-3 rounded-xl glass border border-white/10 hover:border-bull-orange/30 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      {selectedTokenInfo && (
                        <>
                          <img 
                            src={selectedTokenInfo.image} 
                            alt={selectedTokenInfo.name}
                            className="w-6 h-6 object-contain"
                            referrerPolicy="no-referrer"
                          />
                          <div className="text-left">
                            <p className="text-sm font-bold">{selectedTokenInfo.name}</p>
                            <p className="text-xs text-zinc-500">{selectedTokenInfo.symbol}</p>
                          </div>
                        </>
                      )}
                    </div>
                    <ChevronDown size={16} className={`transition-transform ${showTokenDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  {showTokenDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-2 rounded-xl bg-[#15191f] border border-white/10 overflow-hidden z-10 max-h-60 overflow-y-auto scrollbar-hide">
                      {tokens.map((token) => {
                        const tokenValueUsd = token.balance * token.price;
                        const isSufficient = tokenValueUsd >= selectedTier.minAmountUsd;
                        const isSelected = selectedCoin === token.symbol;

                        return (
                          <button
                            key={token.symbol}
                            onClick={() => handleTokenSelect(token.symbol)}
                            className={`w-full flex items-center gap-3 p-3 hover:bg-white/5 transition-all ${
                              isSelected ? 'bg-bull-orange/10' : ''
                            }`}
                          >
                            <img 
                              src={token.image} 
                              alt={token.name}
                              className="w-6 h-6 object-contain"
                              referrerPolicy="no-referrer"
                            />
                            <div className="flex-1 text-left">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-bold">{token.symbol}</p>
                                {isSelected && <CheckCircle size={14} className="text-bull-orange" />}
                              </div>
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-zinc-500">
                                  {token.balance.toFixed(4)} {token.symbol}
                                </span>
                                <span className="text-zinc-500">
                                  ≈ ${tokenValueUsd.toFixed(2)}
                                </span>
                              </div>
                            </div>
                            {!isSufficient && (
                              <AlertCircle size={14} className="text-red-400" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Amount Input */}
              <div>
                <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-2 block">
                  Amount to Lock ({selectedCoin})
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={plantAmount}
                    onChange={(e) => setPlantAmount(e.target.value)}
                    placeholder={`Min: ${minAmountInToken.toFixed(selectedCoin === 'BTC' ? 8 : 4)}`}
                    min={minAmountInToken}
                    step={selectedCoin === 'BTC' ? '0.00000001' : '0.01'}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 font-mono focus:outline-none focus:border-bull-orange transition-colors"
                  />
                  <button
                    onClick={() => setPlantAmount(selectedTokenInfo?.balance.toString() || '0')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-bull-orange hover:text-white transition-colors"
                  >
                    MAX
                  </button>
                </div>
                <div className="mt-2 flex justify-between text-[10px]">
                  <span className="text-zinc-500">
                    Balance: {selectedTokenInfo?.balance.toFixed(selectedCoin === 'BTC' ? 8 : 4)} {selectedCoin}
                  </span>
                  <span className="text-zinc-500">
                    ≈ ${((selectedTokenInfo?.balance || 0) * (selectedTokenInfo?.price || 0)).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Lock Duration */}
              <div>
                <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-2 block">
                  Lock Duration
                </label>
                <input
                  type="text"
                  value={`${selectedTier.days} days (${formatDuration(selectedTier.days)})`}
                  disabled
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 font-mono opacity-50"
                />
              </div>

              {/* Yield Preview */}
              <div className="p-4 rounded-xl bg-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold">Yield Preview</h4>
                  <span className="text-[10px] px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400">
                    APR: {selectedTier.apr}%
                  </span>
                </div>

                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500">Daily Yield</span>
                  <span>{selectedTier.dailyRate}%</span>
                </div>

                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500">Est. Daily Reward</span>
                  <span className="font-mono">
                    {selectedCoin === 'BULLFI' 
                      ? Math.round(estimatedYield.daily).toLocaleString()
                      : estimatedYield.daily.toFixed(selectedCoin === 'BTC' ? 8 : 4)
                    } {selectedCoin}
                    <span className="text-[10px] text-zinc-500 ml-1">
                      ≈ ${estimatedYield.dailyUsd.toFixed(2)}
                    </span>
                  </span>
                </div>

                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500">Total Return</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {selectedCoin === 'BULLFI' 
                      ? Math.round(estimatedYield.total).toLocaleString()
                      : estimatedYield.total.toFixed(selectedCoin === 'BTC' ? 8 : 4)
                    } {selectedCoin}
                    <span className="text-[10px] text-zinc-500 ml-1">
                      ≈ ${estimatedYield.totalUsd.toFixed(2)}
                    </span>
                  </span>
                </div>

                <div className="pt-2 border-t border-white/5">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500">Total at Maturity</span>
                    <span className="font-mono font-bold">
                      {(parseFloat(plantAmount || '0') + estimatedYield.total).toFixed(
                        selectedCoin === 'BTC' ? 8 : 4
                      )} {selectedCoin}
                      <span className="text-[10px] text-zinc-500 ml-1">
                        ≈ ${(
                          (parseFloat(plantAmount || '0') * (selectedTokenInfo?.price || 0)) + 
                          estimatedYield.totalUsd
                        ).toFixed(2)}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleLockSubmit}
                disabled={
                  !plantAmount || 
                  parseFloat(plantAmount) < minAmountInToken || 
                  parseFloat(plantAmount) > (selectedTokenInfo?.balance || 0)
                }
                className="w-full py-4 rounded-xl bg-gradient-to-r from-bull-orange to-orange-600 font-bold hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm & Lock {parseFloat(plantAmount || '0').toFixed(selectedCoin === 'BTC' ? 8 : 4)} {selectedCoin}
              </button>

              {/* Terms Notice */}
              <p className="text-[10px] text-zinc-500 text-center">
                <AlertCircle size={12} className="inline mr-1" />
                Your tokens will be locked for {selectedTier.days} days. Yields are paid daily in BULLFI tokens.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Info Modal */}
      {showInfoModal && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowInfoModal(false)}
        >
          <div 
            className="max-w-2xl w-full rounded-3xl glass border border-white/10 p-6 max-h-[80vh] overflow-y-auto pt-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6 sticky top-0 bg-[#20242a] backdrop-blur-sm -m-6 p-6 border-b border-white/5">
              <h3 className="text-xl font-display font-bold">How Yield Farm Works</h3>
              <button
                onClick={() => setShowInfoModal(false)}
                className="w-8 h-8 rounded-full glass flex items-center justify-center hover:bg-white/10 transition-all"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-6 pt-2">
              <div>
                <h4 className="font-bold mb-2 mt-5">What is Yield Farming?</h4>
                <p className="text-sm text-zinc-400">
                  Yield Farming is a liquidity provisioning protocol where you can lock your crypto tokens 
                  (BULLFI, SOL, BTC, BNB, XRP) to earn attractive yields. The longer you commit your assets, 
                  the higher your daily yield percentage.
                </p>
              </div>

              <div>
                <h4 className="font-bold mb-4">How It Works</h4>
                <div className="space-y-4">
                  {[
                    'Choose Your Token - Select from 5 supported tokens: BULLFI, SOL, BTC, BNB, or XRP',
                    'Select Your Tier - Choose from 6 tiers based on lock duration (10-360 days)',
                    'Lock Your Tokens - Deposit your tokens into the selected farm tier',
                    'Earn Daily Yields - Start earning daily yields based on your selected tier percentage',
                    'Harvest at Maturity - After lock period ends, receive your principal + accumulated yields'
                  ].map((step, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-bull-orange/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-bull-orange">{index + 1}</span>
                      </div>
                      <p className="text-sm text-zinc-400">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-bold mb-4">Tier System</h4>
                
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/5">
                        <th className="text-left py-2 text-xs font-bold text-zinc-500">Tier</th>
                        <th className="text-left py-2 text-xs font-bold text-zinc-500">Duration</th>
                        <th className="text-left py-2 text-xs font-bold text-zinc-500">Daily Yield</th>
                        <th className="text-left py-2 text-xs font-bold text-zinc-500">APR</th>
                        <th className="text-left py-2 text-xs font-bold text-zinc-500">Min Lock</th>
                      </tr>
                    </thead>
                    <tbody>
                      {YIELD_TIERS.map((tier) => (
                        <tr key={tier.id} className="border-b border-white/5">
                          <td className="py-2">{tier.name}</td>
                          <td className="py-2">{tier.days} days</td>
                          <td className="py-2 text-emerald-400">{tier.dailyRate}%</td>
                          <td className="py-2">{tier.apr}%</td>
                          <td className="py-2">${tier.minAmountUsd}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-3">
                  {YIELD_TIERS.map((tier) => (
                    <div key={tier.id} className="p-3 rounded-lg bg-white/5 border border-white/5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold">{tier.name}</span>
                        <span className="text-xs text-zinc-500">{tier.days} days</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <p className="text-[10px] text-zinc-500">Daily</p>
                          <p className="text-emerald-400">{tier.dailyRate}%</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-zinc-500">APR</p>
                          <p>{tier.apr}%</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-zinc-500">Min</p>
                          <p>${tier.minAmountUsd}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10">
                <h4 className="font-bold text-red-400 mb-2">Important Notice</h4>
                <ul className="space-y-2 text-sm text-zinc-400 list-disc pl-5">
                  <li>Your tokens are locked for the selected duration and cannot be withdrawn early</li>
                  <li>Yields are calculated daily and paid in BULLFI tokens</li>
                  <li>All yields are based on the USD value of the planted asset at the time of farm creation</li>
                  <li>Market conditions may affect token prices during lock period</li>
                  <li>Yields begin accruing immediately after farm creation</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default YieldFarmSection;