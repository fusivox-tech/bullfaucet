import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { X, ChevronDown, ArrowUpDown, AlertCircle } from 'lucide-react';
import { User } from '../types';
import { useData } from '../contexts/DataContext';
import API_BASE_URL from '../config';

interface SwapModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  prices: Record<string, number>;
  onSwap: (from: string, to: string, amount: number, receiveAmount: number) => void;
}

const SwapModal: React.FC<SwapModalProps> = ({ isOpen, onClose, user, prices, onSwap }) => {
  const { setAlert } = useData();
  const [fromCoin, setFromCoin] = useState('BULLFI');
  const [toCoin, setToCoin] = useState('SOL');
  const [amount, setAmount] = useState('');
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);
  const [isConverting, setIsConverting] = useState(false);

  const fromDropdownRef = useRef<HTMLDivElement>(null);
  const toDropdownRef = useRef<HTMLDivElement>(null);

  const tokens = [
    { id: 'BULLFI', name: 'BullFaucet Coin', symbol: 'BULLFI', network: 'Solana', minUsd: 1, decimals: 0, icon: 'https://res.cloudinary.com/danuehpic/image/upload/v1771869815/logo_tflaaq.png' },
    { id: 'SOL', name: 'Solana', symbol: 'SOL', network: 'Solana', minUsd: 2, decimals: 4, icon: 'https://res.cloudinary.com/danuehpic/image/upload/v1771869814/sol_bdocle.png' },
    { id: 'BTC', name: 'Bitcoin', symbol: 'BTC', network: 'Bitcoin', minUsd: 20, decimals: 8, icon: 'https://res.cloudinary.com/danuehpic/image/upload/v1771869814/bitcoin_lhzjiu.png' },
    { id: 'BNB', name: 'Binance Coin', symbol: 'BNB', network: 'BEP20', minUsd: 5, decimals: 4, icon: 'https://res.cloudinary.com/danuehpic/image/upload/v1771869814/bnb_jrwljy.png' },
    { id: 'XRP', name: 'Ripple', symbol: 'XRP', network: 'Ripple', minUsd: 5, decimals: 4, icon: 'https://res.cloudinary.com/danuehpic/image/upload/v1771869815/xrp_uhhwwx.png' },
  ];

  const fromToken = tokens.find(t => t.id === fromCoin)!;
  const toToken = tokens.find(t => t.id === toCoin)!;

  const getBalance = (coin: string) => {
    const balanceMap: Record<string, number> = {
      BULLFI: user?.bullfiBalance || 0,
      SOL: user?.solanaBalance || 0,
      BTC: user?.bitcoinBalance || 0,
      BNB: user?.bnbBalance || 0,
      XRP: user?.xrpBalance || 0,
    };
    return balanceMap[coin] || 0;
  };

  const fromBalance = getBalance(fromCoin);
  const fromPrice = prices[fromCoin] || 0;
  const toPrice = prices[toCoin] || 0;
  
  const receiveAmount = (parseFloat(amount) * fromPrice) / (toPrice || 1);
  const usdValue = parseFloat(amount) * fromPrice;
  const isUnderMinimum = usdValue < 1.00 && parseFloat(amount) > 0;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (fromDropdownRef.current && !fromDropdownRef.current.contains(event.target as Node)) {
        setShowFromDropdown(false);
      }
      if (toDropdownRef.current && !toDropdownRef.current.contains(event.target as Node)) {
        setShowToDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSwitch = () => {
    setFromCoin(toCoin);
    setToCoin(fromCoin);
    setAmount('');
  };

  const setMax = () => {
    setAmount(fromBalance.toString());
  };

  const setHalf = () => {
    setAmount((fromBalance / 2).toString());
  };

  const setQuarter = () => {
    setAmount((fromBalance / 4).toString());
  };

  const handleFromSelect = (coinId: string) => {
    if (coinId === toCoin) {
      setToCoin(fromCoin);
    }
    setFromCoin(coinId);
    setShowFromDropdown(false);
    setAmount('');
  };

  const handleToSelect = (coinId: string) => {
    if (coinId === fromCoin) {
      setFromCoin(toCoin);
    }
    setToCoin(coinId);
    setShowToDropdown(false);
    setAmount('');
  };

  const handleSwapSubmit = async () => {
    if (isUnderMinimum) {
      setAlert({ message: "Minimum swap amount is $1.00 USD", type: "error" });
      return;
    }

    setIsConverting(true);
    const direction = `${fromCoin}_TO_${toCoin}`;
    
    try {
      const response = await fetch(`${API_BASE_URL}/users/swap-tokens`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${localStorage.getItem("token")}` 
        },
        body: JSON.stringify({
          userId: user?._id,
          amount: parseFloat(amount),
          direction: direction
        })
      });
      
      const data = await response.json();

      if (response.ok) {
        setAlert({ message: "Swap Successful", type: "success" });
        onSwap(fromCoin, toCoin, parseFloat(amount), receiveAmount);
        setAmount('');
        onClose();
      } else {
        setAlert({ message: data.message || "Swap Failed", type: "error" });
      }
    } catch (err) {
      setAlert({ message: "Network Error", type: "error" });
    } finally {
      setIsConverting(false);
    }
  };

  if (!isOpen) return null;

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
        className="relative w-full max-w-md glass p-8 rounded-[2.5rem] border border-white/10"
      >
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 p-2 hover:bg-white/5 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        <h3 className="text-2xl font-display font-bold mb-6">Swap Tokens</h3>
        
        <div className="space-y-4 relative">
          {/* From */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
            <div className="flex justify-between mb-2">
              <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">From</label>
              <span className="text-[10px] text-zinc-500 font-bold">
                Balance: {fromCoin === 'BULLFI' ? Math.round(fromBalance).toLocaleString() : fromBalance.toFixed(fromToken.decimals)} {fromCoin}
              </span>
            </div>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step={fromCoin === 'BTC' ? '0.00000001' : '0.01'}
                  className="w-full bg-transparent border-none p-0 text-xl font-mono focus:outline-none"
                />
              </div>
              
              {/* From Token Dropdown */}
              <div className="relative" ref={fromDropdownRef}>
                <button
                  onClick={() => setShowFromDropdown(!showFromDropdown)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-bull-dark border border-white/10 hover:border-bull-orange/30 transition-all"
                >
                  <img src={fromToken.icon} alt={fromCoin} className="w-5 h-5 object-contain" />
                  <span className="text-sm font-bold">{fromCoin}</span>
                  <ChevronDown size={14} className={`transition-transform ${showFromDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showFromDropdown && (
                  <div className="absolute top-full right-0 mt-2 w-48 rounded-xl bg-[#15191f] border border-white/10 overflow-hidden z-100">
                    {tokens.map((token) => (
                      <button
                        key={token.id}
                        onClick={() => handleFromSelect(token.id)}
                        className={`w-full flex items-center gap-3 p-3 hover:bg-white/5 transition-all ${
                          fromCoin === token.id ? 'bg-bull-orange/10' : ''
                        }`}
                      >
                        <img src={token.icon} alt={token.id} className="w-5 h-5 object-contain" />
                        <div className="flex-1 text-left">
                          <p className="text-sm font-bold">{token.symbol}</p>
                          <p className="text-[10px] text-zinc-500">{token.name}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-zinc-500">≈ ${usdValue.toFixed(2)}</span>
              <div className="flex gap-1">
                <button 
                  onClick={setQuarter}
                  className="text-[10px] px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 transition-colors font-bold"
                >
                  ¼
                </button>
                <button 
                  onClick={setHalf}
                  className="text-[10px] px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 transition-colors font-bold"
                >
                  ½
                </button>
                <button 
                  onClick={setMax}
                  className="text-[10px] px-2 py-1 rounded-lg bg-bull-orange hover:bg-orange-600 transition-colors font-bold"
                >
                  MAX
                </button>
              </div>
            </div>
          </div>

          {/* Switch Button */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <button 
              onClick={handleSwitch}
              className="p-2 bg-bull-orange rounded-full shadow-lg shadow-bull-orange/20 hover:scale-110 transition-transform"
            >
              <ArrowUpDown className="w-6 h-6" />
            </button>
          </div>

          {/* To */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
            <div className="flex justify-between mb-2">
              <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">To</label>
              <span className="text-[10px] text-zinc-500 font-bold">
                Balance: {toCoin === 'BULLFI' ? Math.round(getBalance(toCoin)).toLocaleString() : getBalance(toCoin).toFixed(toToken.decimals)} {toCoin}
              </span>
            </div>
            <div className="flex gap-3">
              <div className="flex-1 text-xl font-mono text-zinc-400 py-2">
                {!isNaN(receiveAmount) && isFinite(receiveAmount) ? receiveAmount.toFixed(toToken.decimals) : '0.00'}
              </div>
              
              {/* To Token Dropdown */}
              <div className="relative" ref={toDropdownRef}>
                <button
                  onClick={() => setShowToDropdown(!showToDropdown)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-bull-dark border border-white/10 hover:border-bull-orange/30 transition-all"
                >
                  <img src={toToken.icon} alt={toCoin} className="w-5 h-5 object-contain" />
                  <span className="text-sm font-bold">{toCoin}</span>
                  <ChevronDown size={14} className={`transition-transform ${showToDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showToDropdown && (
                  <div className="absolute top-full right-0 mt-2 w-48 rounded-xl bg-[#15191f] border border-white/10 overflow-hidden z-100">
                    {tokens.map((token) => (
                      <button
                        key={token.id}
                        onClick={() => handleToSelect(token.id)}
                        className={`w-full flex items-center gap-3 p-3 hover:bg-white/5 transition-all ${
                          toCoin === token.id ? 'bg-bull-orange/10' : ''
                        }`}
                      >
                        <img src={token.icon} alt={token.id} className="w-5 h-5 object-contain" />
                        <div className="flex-1 text-left">
                          <p className="text-sm font-bold">{token.symbol}</p>
                          <p className="text-[10px] text-zinc-500">{token.name}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-end mt-2">
              <span className="text-xs text-zinc-500">≈ ${(receiveAmount * toPrice).toFixed(2)}</span>
            </div>
          </div>
          
        </div>

          {/* Rate Info */}
          <div className="p-4 mt-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-zinc-500">Exchange Rate</span>
              <span className="text-zinc-300 font-mono">
                1 {fromCoin} = {(fromPrice / (toPrice || 1)).toFixed(6)} {toCoin}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-zinc-500">Swap Fee</span>
              <span className="text-emerald-400 font-bold uppercase">Free</span>
            </div>
          </div>

          {isUnderMinimum && (
            <p className="text-xs mt-4 text-red-400 flex items-center justify-center gap-1">
              <AlertCircle size={12} />
              Minimum swap amount is $1.00 USD
            </p>
          )}

          {/* Submit Button */}
          <button
            disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > fromBalance || isUnderMinimum || fromCoin === toCoin || isConverting}
            onClick={handleSwapSubmit}
            className="w-full py-4 mt-4 rounded-2xl bg-bull-orange text-white font-bold hover:bg-orange-600 transition-all shadow-lg shadow-bull-orange/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {fromCoin === toCoin 
              ? 'Select different tokens' 
              : parseFloat(amount) > fromBalance 
                ? 'Insufficient Balance' 
                : isConverting
                  ? 'Swapping...'
                  : 'Confirm Swap'
            }
          </button>
      </motion.div>
    </div>
  );
};

export default SwapModal;