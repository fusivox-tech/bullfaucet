import React from 'react';
import { motion } from 'motion/react';
import { X, TrendingUp, TrendingDown, ExternalLink, Copy, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

interface TokenInfoModalProps {
  token: any;
  active: boolean;
  onClose: () => void;
  openWithdrawalModal: (token: any) => void;
  openDepositModal: (method: any) => void;
}

const TokenInfoModal: React.FC<TokenInfoModalProps> = ({
  token,
  active,
  onClose,
  openWithdrawalModal,
  openDepositModal
}) => {
  if (!active || !token) return null;

  const formatLargeNumber = (num: number) => {
    if (!num) return 'N/A';
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

  const formatPercentage = (change: number) => {
    if (change === undefined) return null;
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
        className="relative w-full max-w-2xl glass p-8 rounded-[2.5rem] border border-white/10 max-h-[90vh] overflow-y-auto"
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
            <p className="text-lg font-bold">${typeof token.price === 'number' ? token.price.toFixed(6) : token.price}</p>
          </div>
          <div className="p-4 rounded-2xl bg-white/5">
            <p className="text-xs text-zinc-500 mb-1">24h Change</p>
            <div className="text-lg font-bold">
              {formatPercentage(token.priceChangePercentage24h)}
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-white/5">
            <p className="text-xs text-zinc-500 mb-1">Market Cap</p>
            <p className="text-lg font-bold">{formatLargeNumber(token.marketCap)}</p>
          </div>
          <div className="p-4 rounded-2xl bg-white/5">
            <p className="text-xs text-zinc-500 mb-1">24h Volume</p>
            <p className="text-lg font-bold">{formatLargeNumber(token.tradingVolume24h)}</p>
          </div>
        </div>

        {/* Balance Info */}
        <div className="p-6 rounded-2xl bg-bull-orange/10 border border-bull-orange/20 mb-6">
          <div className="flex justify-between items-center mb-2">
            <p className="text-zinc-400">Your Balance</p>
            <p className="text-2xl font-bold text-bull-orange">{token.balance || '0'} {token.ticker}</p>
          </div>
          <p className="text-right text-zinc-500">≈ ${token.balanceUsd || '0.00'} USD</p>
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
                  onClick={() => {
                    navigator.clipboard.writeText(token.contractAddress);
                    // You'd want to use your alert system here
                  }}
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

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => {
              onClose();
              openDepositModal(token);
            }}
            className="py-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all font-bold flex items-center justify-center gap-2"
          >
            <ArrowDownCircle size={18} />
            Deposit
          </button>
          <button
            onClick={() => {
              onClose();
              openWithdrawalModal(token);
            }}
            className="py-3 rounded-xl bg-bull-orange/10 text-bull-orange border border-bull-orange/20 hover:bg-bull-orange/20 transition-all font-bold flex items-center justify-center gap-2"
          >
            <ArrowUpCircle size={18} />
            Withdraw
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default TokenInfoModal;