// components/PendingEarningsModal.tsx
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Clock, 
  X, 
  ChevronRight,
  DollarSign,
  Calendar,
  Shield,
} from 'lucide-react';

interface PendingEarning {
  amount: number;
  source: string;
  date: string;
  expiresAt?: string;
}

interface PendingEarningsModalProps {
  isOpen: boolean;
  onClose: () => void;
  pendingEarnings?: PendingEarning[];
  tokenPrice: number;
  pendingBalance: string;
}

const PendingEarningsModal: React.FC<PendingEarningsModalProps> = ({ 
  isOpen, 
  onClose, 
  pendingBalance,
  pendingEarnings = [],
  tokenPrice
}) => {

  // Format date to readable format and calculate days remaining
  const getDaysRemaining = (dateString: string) => {
    const earningDate = new Date(dateString);
    const tenDaysLater = new Date(earningDate);
    tenDaysLater.setDate(earningDate.getDate() + 10);
    
    const now = new Date();
    const timeDiff = tenDaysLater.getTime() - now.getTime();
    const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    
    if (daysRemaining > 0) {
      return {
        text: `${daysRemaining} day${daysRemaining === 1 ? '' : 's'} remaining`,
        status: 'pending'
      };
    } else if (daysRemaining === 0) {
      return {
        text: 'Available today',
        status: 'available'
      };
    } else {
      return {
        text: 'Processing',
        status: 'processing'
      };
    }
  };

  // Format date to display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none mb-0"
          >
            <div className="bg-bull-dark border border-white/10 rounded-3xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden pointer-events-auto">
              
              {/* Header */}
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-bull-orange/20 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-bull-orange" />
                  </div>
                  <div>
                    <h2 className="text-xl font-display font-bold">Pending Earnings</h2>
                    <p className="text-xs text-zinc-400">
                      {pendingEarnings.length} pending {pendingEarnings.length === 1 ? 'earning' : 'earnings'}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-zinc-400" />
                </button>
              </div>
              
              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(80vh-180px)] scrollbar-hide">
                
                {/* Info Box */}
                <div className="mb-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <Shield className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-blue-400 mb-1">Why are earnings pending?</h3>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        To prevent offerwall manipulations, earnings from offers and surveys are held for 10 days. 
                        After this period, if no issues are found, they will be automatically credited to your main balance.
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Total Pending */}
                <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-bull-orange/20 to-purple-500/20 border border-bull-orange/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-zinc-400 mb-1">Total Pending Value</p>
                      <p className="text-3xl font-display font-bold text-bull-orange">
                        ${pendingBalance}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-bull-orange/20 flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-bull-orange" />
                    </div>
                  </div>
                </div>
                
                {/* Earnings List */}
                {pendingEarnings.length > 0 ? (
                  <div className="space-y-3">
                    {pendingEarnings.map((earning, index) => {
                      const daysInfo = getDaysRemaining(earning.date);
                      const usdValue = earning.amount * tokenPrice;
                      
                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-bull-orange/30 transition-all group"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-bold text-sm flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-bull-orange/20 text-bull-orange text-xs flex items-center justify-center">
                                  {index + 1}
                                </span>
                                {earning.source}
                              </p>
                              <p className="text-xs text-zinc-500 mt-1">
                                {formatDate(earning.date)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-mono font-bold text-emerald-400">
                                ${usdValue.toFixed(4)}
                              </p>
                              <p className="text-[10px] text-zinc-500">
                                {earning.amount.toFixed(4)} BULLFI
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/5">
                            <div className="flex items-center gap-1 text-xs">
                              <Calendar className="w-3 h-3 text-zinc-500" />
                              <span className={`${
                                daysInfo.status === 'available' ? 'text-emerald-400' :
                                daysInfo.status === 'pending' ? 'text-bull-orange' :
                                'text-zinc-400'
                              }`}>
                                {daysInfo.text}
                              </span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-bull-orange transition-colors" />
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                      <Clock className="w-8 h-8 text-zinc-600" />
                    </div>
                    <p className="text-zinc-400 font-medium">No pending earnings</p>
                    <p className="text-xs text-zinc-600 mt-1">
                      Complete offers and surveys to start earning
                    </p>
                  </div>
                )}
              </div>
              
              {/* Footer */}
              <div className="p-4 border-t border-white/10 bg-white/5">
                <button
                  onClick={onClose}
                  className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-sm transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default PendingEarningsModal;