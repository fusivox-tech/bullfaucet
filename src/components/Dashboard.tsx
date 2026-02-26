// components/Dashboard.tsx
import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowDownCircle,
  ArrowUpCircle,
  ArrowLeftRight,
  BadgeDollarSign,
  Wallet,
  Trophy,
  Award,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { User, COINS } from '../types';
import { useData } from '../contexts/DataContext';
import PendingEarningsModal from './PendingEarningsModal';
import GlobalActivitiesFeed from './GlobalActivitiesFeed';
import History from './History';
import TokenInfoModal from './TokenInfoModal';

// Helper function to get balance key
const getBalanceKey = (coin: string) => {
  switch (coin.toUpperCase()) {
    case 'BULLFI': return 'bullfiBalance';
    case 'BTC': return 'bitcoinBalance';
    case 'SOL': return 'solanaBalance';
    case 'BNB': return 'bnbBalance';
    case 'XRP': return 'xrpBalance';
    default: return 'bullfiBalance';
  }
};

// Faucet unlock order with permanent unlock requirements
const FAUCET_ORDER = [
  { id: 'BULLFI', name: 'BULLFI Faucet', ads: 10, permanentUsd: 2 },
  { id: 'SOL', name: 'SOL Faucet', ads: 20, permanentUsd: 5 },
  { id: 'XRP', name: 'XRP Faucet', ads: 30, permanentUsd: 10 },
  { id: 'BNB', name: 'BNB Faucet', ads: 50, permanentUsd: 25 },
  { id: 'BTC', name: 'BTC Faucet', ads: 100, permanentUsd: 100 },
];

interface DashboardProps {
  user: User | null;
  onDeposit: () => void;
  onWithdraw: () => void;
  onSwap: () => void;
  prices: Record<string, number>;
  balance: string;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  user, 
  onDeposit, 
  onWithdraw, 
  onSwap, 
  prices, 
  balance
}) => {
  const { 
    dailyActivity, 
    tokenPrice, 
    bitcoinPrice, 
    solanaPrice, 
    binancePrice, 
    ripplePrice,
    volumes,
    priceChanges,
    marketCaps,
  } = useData();
  
  const [isPendingModalOpen, setIsPendingModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
  const [selectedToken, setSelectedToken] = useState<any>(null);
  
  // Get today's PTC count from dailyActivity
  const ptcToday = useMemo(() => {
    return dailyActivity?.ptcToday || user?.ads_completed_today || 0;
  }, [dailyActivity, user?.ads_completed_today]);

  // Lifetime offer earnings in USD
  const lifetimeOfferEarningUsd = useMemo(() => {
    return (user?.lifetimeOfferEarning || 0) * tokenPrice;
  }, [user?.lifetimeOfferEarning, tokenPrice]);
  
  const pendingUsd = (user?.pendingBalance || 0) * tokenPrice;
  
  const pendingBalance = pendingUsd < 0.02 ? pendingUsd?.toFixed(4) : pendingUsd?.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })

  // Calculate faucet status with permanent unlock info
  const faucetStatus = useMemo(() => {
    return FAUCET_ORDER.map(faucet => {
      const isDailyUnlocked = ptcToday >= faucet.ads;
      const isPermanentlyUnlocked = lifetimeOfferEarningUsd >= faucet.permanentUsd;
      const isUnlocked = isDailyUnlocked || isPermanentlyUnlocked;
      
      return {
        ...faucet,
        isDailyUnlocked,
        isPermanentlyUnlocked,
        isUnlocked,
        dailyProgress: Math.min((ptcToday / faucet.ads) * 100, 100),
        permanentProgress: Math.min((lifetimeOfferEarningUsd / faucet.permanentUsd) * 100, 100),
        remainingDaily: Math.max(0, faucet.ads - ptcToday),
        remainingPermanent: Math.max(0, faucet.permanentUsd - lifetimeOfferEarningUsd)
      };
    });
  }, [ptcToday, lifetimeOfferEarningUsd]);

  // Calculate next faucet to unlock (excluding permanently unlocked ones)
  const nextFaucet = useMemo(() => {
    const lockedFaucets = faucetStatus.filter(f => !f.isUnlocked);
    if (lockedFaucets.length === 0) return null;
    
    const next = lockedFaucets[0];
    return {
      ...next,
      remaining: next.remainingDaily,
      progress: next.dailyProgress
    };
  }, [faucetStatus]);

  // Check if all faucets are unlocked (either daily or permanent)
  const allFaucetsUnlocked = useMemo(() => {
    return faucetStatus.every(f => f.isUnlocked);
  }, [faucetStatus]);

  // Get faucet unlock message
  const getUnlockMessage = () => {
    if (allFaucetsUnlocked) {
      return "🎉 All faucets unlocked!";
    }
    if (nextFaucet) {
      return `Next To Unlock: ${nextFaucet.name} (${nextFaucet.remaining} more ads)`;
    }
    return "Loading...";
  };

  // Get today's earnings summary
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
    
    const totalUsd = ptcUsd + faucetUsd + offersUsd;
    
    return {
      ptc: dailyActivity?.ptcEarningsToday || 0,
      faucet: dailyActivity?.faucetEarningsToday || 0,
      offers: dailyActivity?.offerWallEarningsToday || 0,
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

const handleCoinClick = (coin: typeof COINS[0]) => {
  const getMarketCapForCoin = () => {
    if (coin.id === 'BULLFI') {
      return marketCaps.BULLFI ? parseFloat(marketCaps.BULLFI as unknown as string) : null;
    }
    return marketCaps[coin.id] || null;
  };

  // Helper to safely parse volume
  const getVolumeForCoin = () => {
    if (coin.id === 'BULLFI') {
      return volumes.BULLFI ? parseFloat(volumes.BULLFI as unknown as string) : null;
    }
    return volumes[coin.id] || null;
  };

  const tokenData = {
    id: coin.id,
    name: coin.name,
    ticker: coin.symbol,
    image: coin.icon,
    balance: (user as any)?.[getBalanceKey(coin.id)] || 0,
    balanceUsd: ((user as any)?.[getBalanceKey(coin.id)] || 0) * (prices[coin.id] || 0),
    price: prices[coin.id] || 0,
    priceChangePercentage24h: priceChanges[coin.id],
    marketCap: getMarketCapForCoin(),
    tradingVolume24h: getVolumeForCoin(),
    network: getNetworkForCoin(coin.id),
    contractAddress: getContractAddress(coin.id),
    websiteUrl: getWebsiteUrl(coin.id),
    about: getAboutText(coin.id),
  };
  
  setSelectedToken(tokenData);
  setIsTokenModalOpen(true);
};

  // Helper functions for token data
  const getNetworkForCoin = (coinId: string) => {
    switch(coinId) {
      case 'BULLFI': return 'Solana';
      case 'SOL': return 'Solana';
      case 'BTC': return 'Bitcoin';
      case 'BNB': return 'BEP20';
      case 'XRP': return 'Ripple';
      default: return 'Unknown';
    }
  };

  const getContractAddress = (coinId: string) => {
    switch(coinId) {
      case 'BULLFI': return '2cGkyb8NCjQXeSV4CCwQRVFKTRMhMMaPmZvt6UxeXWwj';
      default: return undefined;
    }
  };

  const getWebsiteUrl = (coinId: string) => {
    switch(coinId) {
      case 'BULLFI': return 'https://www.geckoterminal.com/solana/pools/1M4GtWkWoZCqGeuYdRN1FLcQmSRvKNvLhz54jRmHM7G?utm_source=coingecko&utm_medium=referral&utm_campaign=searchresults';
      case 'SOL': return 'https://solana.com';
      case 'BTC': return 'https://bitcoin.org';
      case 'BNB': return 'https://binance.com/en/bnb';
      case 'XRP': return 'https://ripple.com/xrp';
      default: return undefined;
    }
  };

  const getAboutText = (coinId: string) => {
    switch(coinId) {
      case 'BULLFI':
        return 'BULLFI is the native token of the BullFaucet project, launched as an SPL token on the Solana blockchain. To ensure total transparency and to protect the community, the liquidity pool token has been burnt, ensuring no foul play from the team. BULLFI is designed to grow alongside the BullFaucet platform. If you believe in the project, buy some BULLFI and hold, to secure a place for yourself in our future.';
      case 'SOL':
        return 'Solana is an innovative blockchain platform that supports scalable and decentralized applications. It was developed by Solana Labs, founded by Anatoly Yakovenko, and is governed by the Solana Foundation. Solana\'s dual consensus mechanism of proof-of-stake and proof-of-history allows for high transaction throughput. It has transaction speed and cost advantages over competitors like Ethereum.';
      case 'BTC':
        return 'Bitcoin uses peer-to-peer technology to operate with no central authority or banks; managing transactions and the issuing of bitcoins is carried out collectively by the network. Bitcoin is open-source; its design is public, nobody owns or controls Bitcoin and everyone can take part. Through many of its unique properties, Bitcoin allows exciting uses that could not be covered by any previous payment system.';
      case 'BNB':
        return 'BNB is the native token of the decentralized BNB Chain, where it powers transactions, pays for fees, and allows for participation in governance. It can also be used on the Binance exchange for benefits such as trading fee discounts, token airdrops, and VIP membership. The BNB burn mechanism involves periodically buying back and permanently destroying a portion of BNB tokens to reduce the total supply.';
      case 'XRP':
        return 'XRP enables businesses and financial institutions to drive their blockchain-based applications at scale. XRP is the native token of the XRP Ledger (XRPL), similar to ETH for the Ethereum blockchain or BTC for Bitcoin. XRP facilitates transactions on the network, protects the ledger from spam, and bridges currencies in the XRP Ledger\'s native decentralized exchange (DEX).';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Portfolio Value - Mobile */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-3xl glass relative overflow-hidden group block flex flex-col h-[100%] justify-center md:gap-3"
        >
          <div className="absolute top-[50%] right-0 p-4 opacity-2 transition-opacity" style={{transform: 'translateY(-50%)'}}>
            <BadgeDollarSign className="w-24 h-24 text-white" />
          </div>
          <p className="text-zinc-400 text-sm font-medium mb-1 ">Portfolio USD Value</p>
          <h3 onClick={() => setIsHistoryOpen(true)} className="text-4xl font-display font-bold md:text-5xl">${balance}</h3>
          {(user?.pendingBalance || 0) > 0 && (
            <button 
              onClick={() => setIsPendingModalOpen(true)}
              className="text-bull-orange flex items-center gap-2 text-sm font-medium mt-2 hover:text-orange-400 transition-colors group"
            >
              <span>${pendingBalance} Pending</span>
              <Info className="w-4 h-4 text-zinc-600 group-hover:text-bull-orange transition-colors" />
            </button>
          )}
        </motion.div>
        
        {/* Mobile Action Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex md:hidden gap-2 px-2"
        >
          <button 
            onClick={onDeposit}
            className="flex items-center gap-2 px-4 py-2 rounded-[20px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold text-sm flex-1 justify-center"
          >
            <ArrowDownCircle className="w-4 h-4" />
            Deposit
          </button>
          <button 
            onClick={onWithdraw}
            className="flex items-center gap-2 px-4 py-2 rounded-[20px] bg-bull-orange/10 text-bull-orange border border-bull-orange/20 font-bold text-sm flex-1 justify-center"
          >
            <ArrowUpCircle className="w-4 h-4" />
            Withdraw
          </button>
        </motion.div>

        {/* Today's Earnings Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="p-6 rounded-3xl glass relative overflow-hidden group"
        >
          <p className="text-zinc-400 text-sm font-medium mb-1">Today's Earnings</p>
          <h3 className="text-4xl font-display font-bold text-emerald-400">${todayEarnings.totalUsd > 0.01 ? todayEarnings.totalUsd.toFixed(2) : todayEarnings.totalUsd === 0 ? 0 : todayEarnings.totalUsd.toFixed(4)}</h3>
          <div className="mt-4 grid grid-cols-3 gap-2 text-[10px]">
            <div>
              <p className="text-zinc-500">PTC</p>
              <p className="font-mono font-bold text-bull-orange">${todayEarnings.ptcUsd > 0.01 ? todayEarnings.ptcUsd.toFixed(2) : todayEarnings.ptcUsd.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 4 })}</p>
            </div>
            <div>
              <p className="text-zinc-500">Faucet</p>
              <p className="font-mono font-bold text-emerald-400">${todayEarnings.faucetUsd > 0.01 ? todayEarnings.faucetUsd.toFixed(2) : todayEarnings.faucetUsd.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 4 })}</p>
            </div>
            <div>
              <p className="text-zinc-500">Offers</p>
              <p className="font-mono font-bold text-blue-400">${todayEarnings.offersUsd > 0.01 ? todayEarnings.offersUsd.toFixed(2) : todayEarnings.offersUsd.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 4 })}</p>
            </div>
          </div>
        </motion.div>

        {/* Referral Earnings Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-3xl glass relative overflow-hidden group"
        >
          <p className="text-zinc-400 text-sm font-medium mb-1">Referral Earnings</p>
          <h3 className="text-4xl font-display font-bold">${(user?.totalReferralEarningUsd || 0).toFixed(2)}</h3>
          <p className="mt-4 text-xs text-zinc-500">You earn 10% of your referrals' activity!</p>
          <div className="mt-2 flex items-center gap-1 text-[10px] text-zinc-600">
            <span>Referrals today: {dailyActivity?.referralsToday || 0}</span>
          </div>
        </motion.div>
        
        {/* Ads Completed Today Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-3xl glass relative overflow-hidden group"
        >
          <p className="text-zinc-400 text-sm font-medium mb-1">Ads Completed Today</p>
          <h3 className="text-4xl font-display font-bold">{ptcToday}</h3>
          <div className="mt-4 w-full bg-white/5 h-2 rounded-full overflow-hidden">
            <div 
              className="h-full bg-bull-orange transition-all duration-500" 
              style={{ width: `${allFaucetsUnlocked ? 100 : (nextFaucet?.progress || 0)}%` }} 
            />
          </div>
          <p className="mt-2 text-[8px] text-zinc-500 font-bold uppercase tracking-widest flex items-center justify-between">
            <span>{getUnlockMessage()}</span>
            {!allFaucetsUnlocked && nextFaucet && (
              <span className="text-bull-orange">{Math.round(nextFaucet.progress)}%</span>
            )}
          </p>
        </motion.div>
      </div>
      
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Portfolio Section */}
        <div className="p-6 rounded-3xl glass">
          <h4 className="font-display font-bold text-lg mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-bull-orange" />
              Portfolio
            </div>
            <button 
              onClick={onSwap}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-all text-xs font-bold"
            >
              <ArrowLeftRight className="w-3 h-3" />
              Swap Tokens
            </button>
          </h4>
          <div className="space-y-3">
            {COINS.map((coin) => {
              const balance = (user as any)?.[getBalanceKey(coin.id)] || 0;
              const price = prices[coin.id] || 0;
              const usdValue = balance * price;
              return (
                <div 
                  key={coin.id} 
                  className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-bull-orange/30 hover:bg-white/10 transition-all cursor-pointer group"
                  onClick={() => handleCoinClick(coin)}
                >
                  <div className="flex items-center gap-3">
                    <img src={coin.icon} alt={coin.name} className="w-8 h-8 object-contain" referrerPolicy="no-referrer" />
                    <div>
                      <p className="font-bold text-sm group-hover:text-bull-orange transition-colors">{coin.name}</p>
                      <p className="text-[10px] text-zinc-500 font-mono">
                        {coin.symbol} • <span className="text-emerald-400">${price > 1 ? price.toLocaleString() : price.toFixed(4)}</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-bold text-sm group-hover:text-white transition-colors">
                      {coin.id === 'BULLFI' ? Math.round(balance).toLocaleString() : balance.toFixed(coin.id === 'BTC' ? 8 : 4)}
                    </p>
                    <p className="text-[10px] text-zinc-500 group-hover:text-zinc-400 transition-colors">${usdValue.toFixed(2)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Faucet Unlock Progress with Permanent Unlock Indicators */}
        <div className="p-6 rounded-3xl glass">
          <h4 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-bull-orange" />
            <span className="flex justify-between flex-col md:flex-row md:items-center">
            Faucet Unlock Progress
            {lifetimeOfferEarningUsd > 0 && (
              <span className="text-[10px] md:px-2 md:py-1 rounded-full md:bg-emerald-500/20 text-emerald-400 md:ml-2 sm:p-0">
                ${lifetimeOfferEarningUsd.toFixed(2)} Earned from Offers
              </span>
            )}
            </span>
          </h4>
          
          <div className="space-y-4">
            {faucetStatus.map((faucet) => {
              let statusColor = 'text-zinc-400';
              
              if (faucet.isPermanentlyUnlocked) {
                statusColor = 'text-purple-400';
              } else if (faucet.isDailyUnlocked) {
                statusColor = 'text-emerald-400';
              }
              
              return (
                <div key={faucet.id} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className={`font-display font-bold ${statusColor}`}>
                        {faucet.name}
                      </span>
                      {faucet.isPermanentlyUnlocked ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 flex items-center gap-1">
                          <Award className="w-3 h-3" /> Permanent
                        </span>
                      ) : faucet.isDailyUnlocked ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Daily
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-500/20 text-zinc-400">
                          {faucet.remainingDaily} ads left
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-zinc-500">{Math.round(faucet.dailyProgress)}%</span>
                  </div>
                  
                  {/* Daily Progress Bar */}
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        faucet.isPermanentlyUnlocked ? 'bg-purple-400' : 
                        faucet.isDailyUnlocked ? 'bg-emerald-400' : 'bg-bull-orange'
                      }`}
                      style={{ width: `${faucet.dailyProgress}%` }}
                    />
                  </div>
                  
                  {/* Permanent Progress Indicator (if not permanently unlocked) */}
                  {!faucet.isPermanentlyUnlocked && (
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-purple-400/50"
                          style={{ width: `${faucet.permanentProgress}%` }}
                        />
                      </div>
                      <span className="text-[8px] text-zinc-600">
                        ${faucet.remainingPermanent.toFixed(2)} to permanent
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Quick Stats */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-white/5">
              <p className="text-[10px] text-zinc-500">PTC Ads Today</p>
              <p className="text-lg font-display font-bold">{ptcToday}</p>
            </div>
            <div className="p-3 rounded-xl bg-white/5">
              <p className="text-[10px] text-zinc-500">Faucet Claims</p>
              <p className="text-lg font-display font-bold">{dailyActivity?.faucetToday || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Global Activity Feed */}
      <GlobalActivitiesFeed maxHeight="300px" showTitle={true} />
      
      <PendingEarningsModal
        isOpen={isPendingModalOpen}
        onClose={() => setIsPendingModalOpen(false)}
        pendingEarnings={user?.pendingEarnings}
        tokenPrice={tokenPrice}
        pendingBalance={pendingBalance}
      />
     
      <History 
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />
      
      <TokenInfoModal
        token={selectedToken}
        active={isTokenModalOpen}
        onClose={() => setIsTokenModalOpen(false)}
      />
    </div>
  );
};

export default Dashboard;