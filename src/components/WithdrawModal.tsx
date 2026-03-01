import React, { useState, useMemo, useCallback } from 'react';
import { motion } from 'motion/react';
import { X, AlertCircle, CheckCircle2, ChevronDown } from 'lucide-react';
import { User } from '../types';
import { useData } from '../contexts/DataContext';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onWithdraw: (coin: string, amount: number) => void;
}

const WithdrawModal: React.FC<WithdrawModalProps> = ({ isOpen, onClose, user, onWithdraw }) => {
  const { tokenPrice, bitcoinPrice, solanaPrice, binancePrice, ripplePrice } = useData();
  const [selectedCoin, setSelectedCoin] = useState('BULLFI');
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState('');
  const [transactionError, setTransactionError] = useState('');

  const tokens = [
    { id: 'BULLFI', name: 'BullFaucet Coin', ticker: 'BULLFI', network: 'Solana', minUsd: 1, decimals: 0, icon: 'https://res.cloudinary.com/danuehpic/image/upload/v1771869815/logo_tflaaq.png' },
    { id: 'SOL', name: 'Solana', ticker: 'SOL', network: 'Solana', minUsd: 2, decimals: 4, icon: 'https://res.cloudinary.com/danuehpic/image/upload/v1771869814/sol_bdocle.png' },
    { id: 'BTC', name: 'Bitcoin', ticker: 'BTC', network: 'Bitcoin', minUsd: 20, decimals: 8, icon: 'https://res.cloudinary.com/danuehpic/image/upload/v1771869814/bitcoin_lhzjiu.png' },
    { id: 'BNB', name: 'Binance Coin', ticker: 'BNB', network: 'BEP20', minUsd: 5, decimals: 4, icon: 'https://res.cloudinary.com/danuehpic/image/upload/v1771869814/bnb_jrwljy.png' },
    { id: 'XRP', name: 'Ripple', ticker: 'XRP', network: 'Ripple', minUsd: 5, decimals: 4, icon: 'https://res.cloudinary.com/danuehpic/image/upload/v1771869815/xrp_uhhwwx.png' },
  ];

  const selectedToken = tokens.find(t => t.id === selectedCoin)!;
  
  const getBalance = useCallback(() => {
    const balanceMap: Record<string, number> = {
      BULLFI: user?.bullfiBalance || 0,
      SOL: user?.solanaBalance || 0,
      BTC: user?.bitcoinBalance || 0,
      BNB: user?.bnbBalance || 0,
      XRP: user?.xrpBalance || 0,
    };
    return balanceMap[selectedCoin] || 0;
  }, [selectedCoin, user]);

  const balance = getBalance();

  const validateAddress = (address: string, ticker: string) => {
    if (!address) return false;
    
    const patterns: Record<string, RegExp> = {
      SOL: /^[1-9A-HJ-NP-Za-km-z]{32,44}$/,
      BULLFI: /^[1-9A-HJ-NP-Za-km-z]{32,44}$/,
      BTC: /^(1[a-km-zA-HJ-NP-Z1-9]{25,34}|3[a-km-zA-HJ-NP-Z1-9]{25,34}|bc1[a-zA-HJ-NP-Z0-9]{25,59})$/,
      BNB: /^0x[a-fA-F0-9]{40}$/,
      XRP: /^r[0-9a-zA-Z]{24,34}$/
    };

    const regex = patterns[ticker];
    return regex ? regex.test(address) : false;
  };

  const calculateFee = useCallback(() => {
    if (!selectedToken || !amount) return 0;
    
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) return 0;
    
    const networkFeesUsd: Record<string, number> = {
      BULLFI: 0.10,
      SOL: 0.10,
      BTC: 4.00,
      BNB: 0.50,
      XRP: 0.50
    };
    
    const priceMap: Record<string, number> = {
      BULLFI: tokenPrice,
      SOL: solanaPrice,
      BTC: bitcoinPrice,
      BNB: binancePrice,
      XRP: ripplePrice
    };
    
    const baseFeeUsd = networkFeesUsd[selectedCoin] || 1.00;
    const serviceFeePercent = 0.005;
    const amountInUsd = numAmount * (priceMap[selectedCoin] || 0);
    const variableFeeUsd = amountInUsd * serviceFeePercent;
    const totalFeeUsd = baseFeeUsd + variableFeeUsd;
    
    return totalFeeUsd / (priceMap[selectedCoin] || 1);
  }, [selectedCoin, amount, selectedToken, user]);

  const totalFee = calculateFee();
  const netAmount = parseFloat(amount) - totalFee;

  const isFormValid = useMemo(() => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return false;
    if (numAmount > balance) return false;
    if (!validateAddress(address, selectedCoin)) return false;
    if (numAmount <= totalFee) return false;
    
    // Check minimum USD value
    const priceMap: Record<string, number> = {
      BULLFI: 0.01,
      SOL: 100,
      BTC: 50000,
      BNB: 300,
      XRP: 0.5
    };
    const usdValue = numAmount * (priceMap[selectedCoin] || 0);
    if (usdValue < selectedToken.minUsd) return false;
    
    return true;
  }, [amount, balance, address, selectedCoin, totalFee, selectedToken]);

  const amountError = useMemo(() => {
    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount)) return null;
    if (numAmount > balance) return "Insufficient balance";
    
    const priceMap: Record<string, number> = {
      BULLFI: 0.01,
      SOL: 100,
      BTC: 50000,
      BNB: 300,
      XRP: 0.5
    };
    const usdValue = numAmount * (priceMap[selectedCoin] || 0);
    if (usdValue < selectedToken.minUsd) {
      return `Minimum withdrawal is $${selectedToken.minUsd} for ${selectedCoin}`;
    }
    
    return null;
  }, [amount, balance, selectedCoin, selectedToken]);

  const addressError = useMemo(() => {
    if (!address) return null;
    return validateAddress(address, selectedCoin) 
      ? null 
      : `Invalid ${selectedCoin} address format`;
  }, [address, selectedCoin]);

  const handleFraction = (fraction: number) => {
    const amount = (balance * fraction).toFixed(selectedCoin === 'BTC' ? 8 : 4);
    setAmount(amount);
  };

  const handleWithdrawSubmit = () => {
    if (!isFormValid) return;
    setIsConfirmationModalOpen(true);
  };

  const handleConfirmWithdrawal = async () => {
    setTransactionStatus('loading');
    setTransactionError('');
    
    const normalizedTicker = selectedCoin.toLowerCase();

    try {
      const response = await fetch(`https://payment.bullfaucet.com/api/withdrawals/withdraw-${normalizedTicker}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?._id,
          walletAddress: address,
          amount: selectedCoin === 'BULLFI' ? Math.floor(parseFloat(amount)) : parseFloat(amount)
        }),
      });

      const data = await response.json();

      if (data.success) {
        setTransactionStatus('success');
        onWithdraw(selectedCoin, parseFloat(amount));
      } else {
        setTransactionStatus('error');
        setTransactionError(data.message || 'Withdrawal failed. Please try again.');
      }
    } catch (error) {
      setTransactionStatus('error');
      setTransactionError('Network error. Please check your connection and try again.');
    }
  };

  const handleRetry = () => {
    setTransactionStatus('');
    setTransactionError('');
  };

  const handleCancel = () => {
    setIsConfirmationModalOpen(false);
    setTransactionStatus('');
    setTransactionError('');
  };

  const handleSuccessClose = () => {
    setIsConfirmationModalOpen(false);
    onClose();
    setTransactionStatus('');
    setTransactionError('');
    setAmount('');
    setAddress('');
  };

  if (!isOpen) return null;

  return (
    <>
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
          className="relative w-full max-w-md glass p-8 rounded-[2.5rem] border border-white/10 overflow-y-auto scrollbar-hide max-h-[90%]"
        >
          <button 
            onClick={onClose} 
            className="absolute top-6 right-6 p-2 hover:bg-white/5 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <h3 className="text-2xl font-display font-bold mb-6">Withdraw Crypto</h3>
          
          <div className="space-y-6">
            {/* Token Selector Dropdown */}
            <div>
              <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-2 block">Token</label>
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:border-bull-orange/30 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <img 
                      src={selectedToken.icon} 
                      alt={selectedCoin}
                      className="w-6 h-6 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/icons/default.png';
                      }}
                    />
                    <div className="text-left">
                      <p className="text-sm font-bold">{selectedToken.name}</p>
                      <p className="text-xs text-zinc-500">{selectedToken.network}</p>
                    </div>
                  </div>
                  <ChevronDown size={16} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 rounded-xl bg-[#15191f] border border-white/10 overflow-hidden z-10">
                    {tokens.map((token) => (
                      <button
                        key={token.id}
                        onClick={() => {
                          setSelectedCoin(token.id);
                          setIsDropdownOpen(false);
                          setAmount('');
                          setAddress('');
                        }}
                        className={`w-full flex items-center gap-3 p-3 hover:bg-white/5 transition-all ${
                          selectedCoin === token.id ? 'bg-bull-orange/10' : ''
                        }`}
                      >
                        <img 
                          src={token.icon}
                          alt={token.id}
                          className="w-6 h-6 object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/icons/default.png';
                          }}
                        />
                        <div className="flex-1 text-left">
                          <p className="text-sm font-bold">{token.name}</p>
                          <p className="text-xs text-zinc-500">{token.network}</p>
                        </div>
                        {selectedCoin === token.id && (
                          <CheckCircle2 size={16} className="text-bull-orange" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Network & Minimum Info */}
            <div className="p-4 rounded-xl bg-white/5 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Network</span>
                <span className="font-bold text-bull-orange">{selectedToken.network}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Min. Withdrawal</span>
                <span className="font-bold">${selectedToken.minUsd}</span>
              </div>
            </div>

            <p className="text-xs text-zinc-500 bg-red-500/10 p-3 rounded-xl">
              {selectedCoin === 'BULLFI' ? (
                <span className="flex items-start gap-2">
                  <AlertCircle size={14} className="text-red-400 flex-shrink-0 mt-0.5" />
                  <span>Use a non-custodial solana address for BULLFI withdrawal. <span className="text-red-400 font-bold">Recommended - Phantom Wallet</span>. Using a custodial wallet like binance will result in a permanent loss of fund.</span>
                </span>
              ) : (
                <span className="flex items-start gap-2">
                  <AlertCircle size={14} className="text-red-400 flex-shrink-0 mt-0.5" />
                  <span>Only withdraw to {selectedToken.network} compatible addresses. Sent assets to the wrong network cannot be recovered.</span>
                </span>
              )}
            </p>

            {/* Address Input */}
            <div>
              <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-2 block">
                Recipient Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={selectedCoin === 'BULLFI' ? 'Enter Non-Custodial Solana Address' : `Enter ${selectedCoin} address`}
                className="w-full bg-bull-dark border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-bull-orange transition-colors"
              />
              {addressError && (
                <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle size={12} />
                  {addressError}
                </p>
              )}
            </div>

            {/* Amount Input */}
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Amount</label>
                <span className="text-xs text-zinc-500">
                  Balance: {selectedCoin === 'BULLFI' ? Math.round(balance).toLocaleString() : balance.toFixed(selectedCoin === 'BTC' ? 8 : 4)} {selectedCoin}
                </span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step={selectedCoin === 'BTC' ? '0.00000001' : '0.01'}
                  className="w-full bg-bull-dark border border-white/10 rounded-xl px-4 py-3 font-mono focus:outline-none focus:border-bull-orange transition-colors"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                  <button 
                    onClick={() => handleFraction(0.25)}
                    className="text-[10px] px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 transition-colors font-bold"
                  >
                    ¼
                  </button>
                  <button 
                    onClick={() => handleFraction(0.5)}
                    className="text-[10px] px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 transition-colors font-bold"
                  >
                    ½
                  </button>
                  <button 
                    onClick={() => handleFraction(1)}
                    className="text-[10px] px-2 py-1 rounded-lg bg-bull-orange hover:bg-orange-600 transition-colors font-bold"
                  >
                    MAX
                  </button>
                </div>
              </div>
              {amountError && (
                <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle size={12} />
                  {amountError}
                </p>
              )}
            </div>

            {/* Fee Breakdown */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Network Fee</span>
                <span className="font-mono">
                  {totalFee.toFixed(selectedCoin === 'BTC' ? 8 : 4)} {selectedCoin}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold">
                <span className="text-zinc-500">You will receive</span>
                <span className="text-emerald-400 font-mono">
                  {netAmount > 0 ? netAmount.toFixed(selectedCoin === 'BTC' ? 8 : 4) : '0.00'} {selectedCoin}
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleWithdrawSubmit}
              disabled={!isFormValid}
              className="w-full py-4 rounded-2xl bg-bull-orange text-white font-bold hover:bg-orange-600 transition-all shadow-lg shadow-bull-orange/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirm Withdrawal
            </button>
          </div>
        </motion.div>
      </div>

      {/* Confirmation Modal */}
      {isConfirmationModalOpen && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
            onClick={transactionStatus !== 'loading' ? handleCancel : undefined} 
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            className="relative w-full max-w-md glass p-8 rounded-[2.5rem] border border-white/10"
          >
            {transactionStatus === 'loading' && (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 border-4 border-bull-orange border-t-transparent rounded-full animate-spin"></div>
                <h3 className="text-xl font-bold mb-2">Processing Withdrawal...</h3>
                <p className="text-sm text-zinc-400">Please wait while we process your transaction</p>
              </div>
            )}

            {transactionStatus === 'success' && (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">Withdrawal Successful!</h3>
                <p className="text-sm text-zinc-400 mb-4">Your withdrawal has been processed successfully.</p>
                <div className="p-4 rounded-xl bg-white/5 mb-6 text-left">
                  <p className="text-sm mb-1">
                    <span className="text-zinc-500">Amount:</span>{' '}
                    <span className="font-bold">{parseFloat(amount).toLocaleString()} {selectedCoin}</span>
                  </p>
                  <p className="text-sm">
                    <span className="text-zinc-500">To:</span>{' '}
                    <span className="font-mono text-xs break-all">{address.slice(0, 8)}...{address.slice(-8)}</span>
                  </p>
                </div>
                <button
                  onClick={handleSuccessClose}
                  className="w-full py-3 rounded-xl bg-bull-orange hover:bg-orange-600 transition-all font-bold"
                >
                  Close
                </button>
              </div>
            )}

            {transactionStatus === 'error' && (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-red-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">Withdrawal Failed</h3>
                <p className="text-sm text-zinc-400 mb-6">{transactionError}</p>
                <div className="flex gap-3">
                  <button
                    onClick={handleRetry}
                    className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all font-bold"
                  >
                    Retry
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex-1 py-3 rounded-xl bg-bull-orange hover:bg-orange-600 transition-all font-bold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {!transactionStatus && (
              <>
                <h3 className="text-xl font-bold mb-6 text-center">Confirm Withdrawal</h3>
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between p-3 rounded-xl bg-white/5">
                    <span className="text-zinc-500">Amount</span>
                    <span className="font-bold">{parseFloat(amount).toLocaleString()} {selectedCoin}</span>
                  </div>
                  <div className="flex justify-between p-3 rounded-xl bg-white/5">
                    <span className="text-zinc-500">To Address</span>
                    <span className="font-mono text-sm">{address.slice(0, 8)}...{address.slice(-8)}</span>
                  </div>
                  <div className="flex justify-between p-3 rounded-xl bg-white/5">
                    <span className="text-zinc-500">Network Fee</span>
                    <span className="font-mono">{totalFee.toFixed(selectedCoin === 'BTC' ? 8 : 4)} {selectedCoin}</span>
                  </div>
                  <div className="flex justify-between p-3 rounded-xl bg-emerald-500/10">
                    <span className="text-zinc-500">You'll Receive</span>
                    <span className="font-bold text-emerald-400">
                      {netAmount.toFixed(selectedCoin === 'BTC' ? 8 : 4)} {selectedCoin}
                    </span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleCancel}
                    className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmWithdrawal}
                    className="flex-1 py-3 rounded-xl bg-bull-orange hover:bg-orange-600 transition-all font-bold"
                  >
                    Confirm
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </>
  );
};

export default WithdrawModal;