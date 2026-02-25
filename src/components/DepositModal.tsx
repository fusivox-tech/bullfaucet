import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, ChevronDown, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import WalletDisplay from './WalletDisplay';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DepositModal: React.FC<DepositModalProps> = ({ isOpen, onClose }) => {
  const { user, tokenPrice, setAlert, handleGenerateWallet, handleReactivateWallet } = useData();
  const [selectedMethod, setSelectedMethod] = useState<any>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [usdAmount, setUsdAmount] = useState<number | null>(null);

  const methods = [
    { name: 'FaucetPay', image: 'https://res.cloudinary.com/danuehpic/image/upload/v1772022367/faucetpay_mpeacl.jpg', type: 'faucetpay' },
    { name: 'BullFaucet Coin', ticker: 'BULLFI', image: 'https://res.cloudinary.com/danuehpic/image/upload/v1771869815/logo_tflaaq.png', type: 'crypto' },
    { name: 'Solana', ticker: 'SOL', image: 'https://res.cloudinary.com/danuehpic/image/upload/v1771869814/sol_bdocle.png', type: 'crypto' },
    { name: 'Bitcoin', ticker: 'BTC', image: 'https://res.cloudinary.com/danuehpic/image/upload/v1771869814/bitcoin_lhzjiu.png', type: 'crypto' },
    { name: 'Binance Coin', ticker: 'BNB', image: 'https://res.cloudinary.com/danuehpic/image/upload/v1771869814/bnb_jrwljy.png', type: 'crypto' },
    { name: 'Ripple', ticker: 'XRP', image: 'https://res.cloudinary.com/danuehpic/image/upload/v1771869815/xrp_uhhwwx.png', type: 'crypto' },
  ];

  useEffect(() => {
    // Set default method
    if (!selectedMethod && methods.length > 0) {
      setSelectedMethod(methods[0]);
    }
  }, []);

  if (!isOpen) return null;

  const handleFaucetPaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!usdAmount || usdAmount < 1) {
      setAlert({ message: "Minimum deposit is $1.00", type: "error" });
      return;
    }

    const form = document.createElement("form");
    form.method = "POST";
    form.action = "https://faucetpay.io/merchant/webscr";

    const data = {
      merchant_username: "bullfaucet",
      item_description: "BullFaucet Deposit",
      amount1: usdAmount,
      currency1: "USD",
      custom: user?._id,
      callback_url: `https://payment.bullfaucet.com/api/deposits/faucetpay/ipn`,
      success_url: "https://www.bullfaucet.com/dashboard",
      cancel_url: "https://www.bullfaucet.com/dashboard"
    };

    for (let key in data) {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = String(data[key as keyof typeof data]);
      form.appendChild(input);
    }

    document.body.appendChild(form);
    form.submit();
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
        className="relative w-full max-w-md glass p-8 rounded-[2.5rem] border border-white/10 max-h-[90%] overflow-y-auto scrollbar-hide"
      >
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 p-2 hover:bg-white/5 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        <h3 className="text-2xl font-display font-bold mb-6">Deposit Funds</h3>
        
        <div className="space-y-6">
          {/* Method Selector Dropdown */}
          <div>
            <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-2 block">
              Deposit Method
            </label>
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:border-bull-orange/30 transition-all"
              >
                <div className="flex items-center gap-3">
                  <img 
                    src={selectedMethod?.image} 
                    alt={selectedMethod?.name}
                    className="w-6 h-6 object-contain"
                  />
                  <span className="text-sm font-bold">{selectedMethod?.name}</span>
                </div>
                <ChevronDown size={16} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 rounded-xl bg-[#15191f] border border-white/10 overflow-hidden z-10 max-h-60 overflow-y-auto">
                  {methods.map((method) => (
                    <button
                      key={method.name}
                      onClick={() => {
                        setSelectedMethod(method);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 p-3 hover:bg-white/5 transition-all ${
                        selectedMethod?.name === method.name ? 'bg-bull-orange/10' : ''
                      }`}
                    >
                      <img 
                        src={method.image} 
                        alt={method.name}
                        className="w-6 h-6 object-contain"
                      />
                      <span className="flex-1 text-left text-sm font-bold">{method.name}</span>
                      {selectedMethod?.name === method.name && (
                        <CheckCircle2 size={16} className="text-bull-orange" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* FaucetPay Deposit */}
          {selectedMethod?.type === 'faucetpay' && (
            <form onSubmit={handleFaucetPaySubmit} className="space-y-4">
              <div>
                <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-2 block">
                  Amount (USD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Enter Amount in USD"
                  value={usdAmount || ''}
                  onChange={(e) => setUsdAmount(parseFloat(e.target.value) || null)}
                  required
                  min="1"
                  className="w-full bg-bull-dark border border-white/10 rounded-xl px-4 py-3 font-mono focus:outline-none focus:border-bull-orange transition-colors"
                />
              </div>

              {usdAmount && (
                <div className="p-4 rounded-xl bg-white/5">
                  <p className="text-sm text-center">
                    You'll receive approximately{' '}
                    <span className="font-bold text-emerald-400">
                      {Math.round(usdAmount / (tokenPrice || 0.01)).toLocaleString()} BULLFI
                    </span>
                  </p>
                </div>
              )}

              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <p className="text-xs text-zinc-400 flex items-start gap-2">
                  <AlertCircle size={14} className="text-blue-400 flex-shrink-0 mt-0.5" />
                  <span>
                    You will be redirected to FaucetPay to complete your payment securely. 
                    Your deposit will be credited to your BULLFI balance.
                  </span>
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-2xl bg-bull-orange text-white font-bold hover:bg-orange-600 transition-all shadow-lg shadow-bull-orange/20"
              >
                Proceed to Payment
              </button>
            </form>
          )}
          
          {/* BULLFI Deposit Body */}
        {selectedMethod?.name === 'BullFaucet Coin' && (
            <WalletDisplay 
              tokenName="BULLFI" 
              user={user} 
              onGenerate={handleGenerateWallet}
              onReactivate={handleReactivateWallet}
            />
        )}

        {/* SOL Deposit Body */}
        {selectedMethod?.name === 'Solana' && (
            <WalletDisplay 
              tokenName="Solana" 
              user={user} 
              onGenerate={handleGenerateWallet}
              onReactivate={handleReactivateWallet}
            />
        )}
        
        {selectedMethod?.name === 'Bitcoin' && (
            <WalletDisplay 
              tokenName="Bitcoin" 
              user={user} 
              onGenerate={handleGenerateWallet}
              onReactivate={handleReactivateWallet}
            />
        )}
        
        {selectedMethod?.name === 'Binance Coin' && (
            <WalletDisplay 
              tokenName="Binance Coin" 
              user={user} 
              onGenerate={handleGenerateWallet}
              onReactivate={handleReactivateWallet}
            />
        )}
        
        {selectedMethod?.name === 'Ripple' && (
            <WalletDisplay 
              tokenName="Ripple" 
              user={user} 
              onGenerate={handleGenerateWallet}
              onReactivate={handleReactivateWallet}
            />
        )}
        </div>
      </motion.div>
    </div>
  );
};

export default DepositModal;