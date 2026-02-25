import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, AlertCircle, CheckCircle2, RefreshCw, Ban } from 'lucide-react';
import { useData } from '../contexts/DataContext';

interface WalletDisplayProps {
  tokenName: string;
  user: any;
  onGenerate: (token: string) => Promise<any>;
  onReactivate: (token: string) => Promise<any>;
}

interface WalletData {
  address: string;
  privateKey?: string;
  createdAt: string;
  updatedAt?: string;
  lastChecked: number;
  status: 'active' | 'inactive';
  inactivatedAt?: string | null;
}

const WalletDisplay: React.FC<WalletDisplayProps> = ({
  tokenName,
  user,
  onGenerate,
  onReactivate
}) => {
  const { setAlert } = useData();
  const [loading, setLoading] = useState(false);
  const [reactivating, setReactivating] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const [isInactive, setIsInactive] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Get the wallet for this token
  const wallet = user?.wallets?.[tokenName] as WalletData | undefined;

  useEffect(() => {
    if (!wallet) {
      setWalletAddress(null);
      return;
    }

    setWalletAddress(wallet.address);

    // Check if wallet is inactive
    if (wallet.status === 'inactive') {
      setIsInactive(true);
      setIsExpired(false);
      setTimeLeft(null);
      return;
    }

    // For active wallets, check the 1-hour expiry
    const checkExpiry = () => {
      const createdAt = new Date(wallet.createdAt);
      const expiryTime = new Date(createdAt.getTime() + (60 * 60 * 1000)); // 1 hour
      const now = new Date();
      const timeRemaining = expiryTime.getTime() - now.getTime();

      if (timeRemaining <= 0) {
        setIsExpired(true);
        setIsInactive(false);
        setTimeLeft(0);
      } else {
        setIsExpired(false);
        setIsInactive(false);
        setTimeLeft(timeRemaining);
      }
    };

    checkExpiry();
    const interval = setInterval(checkExpiry, 1000);
    return () => clearInterval(interval);
  }, [wallet, wallet?.createdAt, wallet?.status]);

  const copyWallet = () => {
    if (!walletAddress) return;
    
    if (isExpired || isInactive) {
      setAlert({ 
        message: isInactive 
          ? "This wallet is inactive. Please re-activate it to use." 
          : "This wallet has expired. Please generate a new one.", 
        type: "warning" 
      });
      return;
    }
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    setAlert({ message: `${tokenName} address copied successfully!`, type: "success" });
  };

  const formatTime = (ms: number) => {
    if (ms <= 0) return "00:00:00";
    
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      await onGenerate(tokenName);
      // Success message will come from parent
    } catch (error) {
      // Error is already handled in onGenerate
    } finally {
      setLoading(false);
    }
  };

  const handleReactivate = async () => {
    if (!wallet || !onReactivate) return;
    
    setReactivating(true);
    try {
      await onReactivate(tokenName);
      // Success message will come from parent
    } catch (error) {
      setAlert({ message: "Failed to re-activate wallet", type: "error" });
    } finally {
      setReactivating(false);
    }
  };

  // No wallet generated yet
  if (!wallet || !walletAddress) {
    return (
      <div className="text-center py-8">
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="px-6 py-3 bg-bull-orange rounded-xl font-bold hover:bg-orange-600 transition-all disabled:opacity-50 flex items-center gap-2 mx-auto"
        >
          {loading ? (
            <>
              <RefreshCw size={18} className="animate-spin" />
              Generating...
            </>
          ) : (
            <>
              Generate {tokenName} Address
            </>
          )}
        </button>
        <p className="text-xs text-zinc-500 mt-4">
          Generate a permanent deposit address. It will be active for 1 hour after generation/reactivation.
        </p>
      </div>
    );
  }

  // Wallet is inactive (needs reactivation)
  if (isInactive) {
    return (
      <div className="space-y-6">

        {/* Address Display */}
        <div className="space-y-2">
          <p className="text-xs text-zinc-500 text-center">Your {tokenName} Deposit Address</p>
          <div className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10">
            <p className="flex-1 font-mono text-sm text-zinc-500 break-all">{walletAddress}</p>
            <button
              onClick={copyWallet}
              className="p-2 text-zinc-500 cursor-not-allowed"
              disabled
            >
              <Ban size={18} />
            </button>
          </div>
        </div>

        {/* Inactive Note */}
        <div className="p-4 rounded-xl bg-zinc-500/10 border border-zinc-500/20 flex items-start gap-3">
          <AlertCircle size={18} className="text-zinc-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-zinc-400 mb-1">This wallet address is inactive.</p>
            <p className="text-xs text-zinc-500">
              Re-activate it to enable deposits. The same address will be used.
            </p>
          </div>
        </div>

        {/* Reactivate Button */}
        <button
          onClick={handleReactivate}
          disabled={reactivating}
          className="w-full py-3 rounded-xl bg-bull-orange hover:bg-orange-600 transition-all font-bold disabled:opacity-50"
        >
          {reactivating ? 'Re-activating...' : 'Re-activate Address'}
        </button>
      </div>
    );
  }

  // Active or Expired wallet - this always shows the wallet info
  return (
    <div className="space-y-6">
      {/* QR Code */}
      <div className="flex justify-center">
        <div className="p-4 bg-white rounded-xl">
          <QRCodeSVG 
            value={walletAddress} 
            size={180} 
            fgColor="#000000"
          />
        </div>
      </div>

      {/* Address Display */}
      <div className="space-y-2">
        <p className="text-xs text-zinc-500 text-center">Your {tokenName} Deposit Address</p>
        <div className={`flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10`}>
          <p className={`flex-1 font-mono text-sm break-all`}>
            {walletAddress}
          </p>
          <button
            onClick={copyWallet}
            disabled={isExpired}
            className={`p-2 hover:bg-white/10 rounded-lg transition-colors ${isExpired ? 'text-zinc-500 cursor-not-allowed' : ''}`}
          >
            {copied ? (
              <CheckCircle2 size={18} className="text-emerald-400" />
            ) : (
              <Copy size={18} />
            )}
          </button>
        </div>
      </div>

      <div className={`p-4 relative rounded-xl flex items-start gap-3 bg-blue-500/10 border border-blue-500/20`}>
          <AlertCircle size={18} className={`flex-shrink-0 mt-0.5 text-blue-400`} />
          <div>
            <p className={`text-sm font-bold text-blue-400 mb-1`}>Important</p>
            <p className="text-xs text-zinc-500">This address is only valid for 1 hour. Send only ${tokenName} to this address.</p>
          </div>
          <span className="absolute top-4 right-4 text-sm font-mono font-bold text-emerald-400 whitespace-nowrap">
            {timeLeft ? formatTime(timeLeft) : '00:00:00'}
          </span>
      </div>
    </div>
  );
};

export default WalletDisplay;