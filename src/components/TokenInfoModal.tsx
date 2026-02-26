// components/TokenInfoModal.tsx
import React from 'react';
import { motion } from 'motion/react';
import { X, TrendingUp, TrendingDown, ExternalLink, Copy } from 'lucide-react';
import { useData } from '../contexts/DataContext';

interface TokenInfoModalProps {
  token: any;
  active: boolean;
  onClose: () => void;
}

const TokenInfoModal: React.FC<TokenInfoModalProps> = ({
  token,
  active,
  onClose,
}) => {
  const { setAlert } = useData();

  if (!active || !token) return null;

  const formatLargeNumber = (num: number) => {
    // Check if number exists and is valid
    if (num === undefined || num === null || isNaN(num)) return 'N/A';
    
    // Handle trillion (1T = 1,000,000,000,000)
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    
    // For numbers less than 1000, show with 2 decimal places if needed
    return `$${num.toFixed(2)}`;
  };

  const formatPercentage = (change: number) => {
    if (change === undefined || change === null) return null;
    const isPositive = change > 0;
    const color = isPositive ? 'text-emerald-400' : 'text-red-400';
    const Icon = isPositive ? TrendingUp : TrendingDown;
    return (
      <span className={`flex items-center gap-1 ${color}`}>
        <Icon size={14} />
        {Math.abs(change).toFixed(2)}%
      </span>
    );
  };

  const handleCopyAddress = () => {
    if (token.contractAddress) {
      navigator.clipboard.writeText(token.contractAddress);
      setAlert({ message: 'Contract address copied!', type: 'success' });
    }
  };

  // Helper to safely parse market cap from fdv_usd which might be a string
  const getMarketCap = () => {
    if (token.marketCap !== undefined && token.marketCap !== null) {
      // If it's a number or string, try to convert to number
      const numValue = typeof token.marketCap === 'string' 
        ? parseFloat(token.marketCap) 
        : token.marketCap;
      
      if (!isNaN(numValue)) return numValue;
    }
    
    // For BULLFI, try to use fdv_usd from tokenData if available
    // This is handled in your Dashboard's handleCoinClick function
    return null;
  };

  const marketCap = getMarketCap();

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        className="absolute inset-0 bg-bull-dark/80 backdrop-blur-sm" 
        onClick={onClose} 
      />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        className="relative w-full max-w-2xl glass p-8 rounded-[2.5rem] border border-white/10 max-h-[90vh] overflow-y-auto scrollbar-hide"
      >
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 p-2 hover:bg-white/5 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-4 mb-6">
          <img src={token.image} alt={token.name} className="w-16 h-16 object-contain" />
          <div>
            <h3 className="text-2xl font-display font-bold">{token.name}</h3>
            <p className="text-zinc-400">{token.ticker}</p>
          </div>
        </div>

        {/* Price & Market Data */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 rounded-2xl bg-white/5">
            <p className="text-xs text-zinc-500 mb-1">Price</p>
            <p className="text-lg font-bold">
              ${typeof token.price === 'number' 
                ? token.price < 0.01 
                  ? token.price.toFixed(6) 
                  : token.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                : '0.00'}
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-white/5">
            <p className="text-xs text-zinc-500 mb-1">24h Change</p>
            <div className="text-lg font-bold">
              {formatPercentage(token.priceChangePercentage24h) || 'N/A'}
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-white/5">
            <p className="text-xs text-zinc-500 mb-1">Market Cap</p>
            <p className="text-lg font-bold">
              {marketCap ? formatLargeNumber(marketCap) : 'N/A'}
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-white/5">
            <p className="text-xs text-zinc-500 mb-1">24h Volume</p>
            <p className="text-lg font-bold">
              {token.tradingVolume24h ? formatLargeNumber(token.tradingVolume24h) : 'N/A'}
            </p>
          </div>
        </div>

        {/* Balance Info */}
        <div className="p-6 rounded-2xl bg-bull-orange/10 border border-bull-orange/20 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-center mb-2">
            <p className="text-zinc-400">Your Balance</p>
            <p className="text-2xl font-bold text-bull-orange">
              {token.ticker === 'BULLFI' 
                ? Math.round(token.balance).toLocaleString() 
                : token.ticker === 'BTC'
                  ? token.balance.toFixed(8)
                  : token.balance.toFixed(4)} {token.ticker}
            </p>
          </div>
          <p className="text-center md:text-right text-zinc-500">≈ ${typeof token.balanceUsd === 'number' ? token.balanceUsd.toFixed(2) : '0.00'} USD</p>
        </div>

        {/* About */}
        <div className="mb-6">
          <h4 className="font-bold mb-2">About {token.name}</h4>
          <p className="text-sm text-zinc-400 leading-relaxed">{token.about}</p>
        </div>

        {/* Network & Contract */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
            <span className="text-sm text-zinc-500">Network</span>
            <span className="text-sm font-bold">{token.network}</span>
          </div>
          {token.contractAddress && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
              <span className="text-sm text-zinc-500">Contract</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono">{token.contractAddress.slice(0, 8)}...{token.contractAddress.slice(-6)}</span>
                <button 
                  onClick={handleCopyAddress}
                  className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <Copy size={14} />
                </button>
              </div>
            </div>
          )}
          {token.websiteUrl && (
            <a 
              href={token.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
            >
              <span className="text-sm text-zinc-500">Website</span>
              <span className="text-sm font-bold flex items-center gap-1">
                Visit <ExternalLink size={14} />
              </span>
            </a>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default TokenInfoModal;