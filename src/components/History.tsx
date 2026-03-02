import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Filter, ChevronLeft, ChevronRight, Calendar, Clock } from 'lucide-react';
import { useData } from '../contexts/DataContext';

interface HistoryProps {
  isOpen: boolean;
  onClose: () => void;
}

const History: React.FC<HistoryProps> = ({ isOpen, onClose }) => {
  const { 
    user, 
    transactions, 
    transactionsLoading, 
    transactionsReady, 
    tokenPrice
  } = useData();
  
  const [mixedTransactions, setMixedTransactions] = useState<any[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const itemsPerPage = 20;

  const defaultFilters = {
    ptc: false,
    offerWall: true,
    faucet: false,
    withdraw: true,
    deposit: true,
    taskAd: true,
    dailyBonus: true,
    other: true
  };

  const [transactionFilters, setTransactionFilters] = useState(() => {
    try {
      const savedFilters = localStorage.getItem('transactionFilters');
      if (savedFilters) {
        const parsedFilters = JSON.parse(savedFilters);
        if (parsedFilters && typeof parsedFilters === 'object') {
          return {
            ptc: parsedFilters.ptc ?? defaultFilters.ptc,
            offerWall: parsedFilters.offerWall ?? defaultFilters.offerWall,
            faucet: parsedFilters.faucet ?? defaultFilters.faucet,
            withdraw: parsedFilters.withdraw ?? defaultFilters.withdraw,
            deposit: parsedFilters.deposit ?? defaultFilters.deposit,
            taskAd: parsedFilters.taskAd ?? defaultFilters.taskAd,
            dailyBonus: parsedFilters.dailyBonus ?? defaultFilters.dailyBonus,
            other: parsedFilters.other ?? defaultFilters.other
          };
        }
      }
    } catch (error) {
      console.error('Error loading filters from localStorage:', error);
    }
    return defaultFilters;
  });

  useEffect(() => {
    localStorage.setItem('transactionFilters', JSON.stringify(transactionFilters));
  }, [transactionFilters]);

  useEffect(() => {
    if (!user || !transactionsReady) return;

    const combineTransactions = () => {
      const allTransactions: any[] = [];

      // Add regular transactions
      if (transactions && Array.isArray(transactions)) {
        transactions.forEach(transaction => {
          allTransactions.push({
            ...transaction,
            source: 'transaction',
            date: transaction.timestamp,
            displayDate: new Date(transaction.timestamp),
            amount: transaction.amount || 0,
            type: transaction.type || 'Transaction',
            status: transaction.status || '',
            filterType: getFilterType(transaction.type, 'transaction')
          });
        });
      }

      // Add daily bonus records
      if (user.dailyBonus && Array.isArray(user.dailyBonus)) {
        user.dailyBonus.forEach((bonus: any) => {
          allTransactions.push({
            ...bonus,
            source: 'dailyBonus',
            date: bonus.date || bonus.claimedAt,
            displayDate: new Date(bonus.date || bonus.claimedAt),
            amount: bonus.amount || bonus.bonusAmount || 0,
            type: 'Daily Bonus',
            description: 'Streak Bonus',
            filterType: 'dailyBonus'
          });
        });
      }

      // Add offer wall records
      if (user.offerWallRecords && Array.isArray(user.offerWallRecords)) {
        user.offerWallRecords.forEach((record: any) => {
          allTransactions.push({
            ...record,
            source: 'offerWall',
            date: record.date,
            displayDate: new Date(record.date),
            amount: record.amount || record.reward || 0,
            type: 'Offer Completed',
            description: record.offerName || record.description,
            filterType: 'offerWall'
          });
        });
      }

      // Add faucet claim records
      if (user.faucetClaimRecords && Array.isArray(user.faucetClaimRecords)) {
        user.faucetClaimRecords.forEach((record: any) => {
          allTransactions.push({
            ...record,
            source: 'faucet',
            date: record.date,
            displayDate: new Date(record.date),
            amount: record.amount || 0,
            type: 'Faucet Claim',
            filterType: 'faucet'
          });
        });
      }

      // Add PTC records
      if (user.ptcRecords && Array.isArray(user.ptcRecords)) {
        user.ptcRecords.forEach((record: any) => {
          allTransactions.push({
            ...record,
            source: 'ptc',
            date: record.date,
            displayDate: new Date(record.date),
            amount: record.amount || record.reward || 0,
            type: 'PTC Task',
            description: record.taskTitle || record.description,
            filterType: 'ptc'
          });
        });
      }

      // Sort by date (most recent first)
      const sortedTransactions = allTransactions.sort((a, b) => {
        return new Date(b.displayDate).getTime() - new Date(a.displayDate).getTime();
      });

      setMixedTransactions(sortedTransactions);
    };

    combineTransactions();
  }, [user, transactions, transactionsReady]);

  useEffect(() => {
    if (mixedTransactions.length > 0) {
      const filtered = mixedTransactions.filter(transaction => {
        return transactionFilters[transaction.filterType as keyof typeof transactionFilters];
      });
      setFilteredTransactions(filtered);
      setCurrentPage(0);
    }
  }, [mixedTransactions, transactionFilters]);

  const getFilterType = (type: string, source: string) => {
    const lowerType = type?.toLowerCase() || '';
    
    if (source === 'offerWall') return 'offerWall';
    if (source === 'faucet') return 'faucet';
    if (source === 'ptc') return 'ptc';
    if (source === 'dailyBonus') return 'dailyBonus';
    
    if (lowerType.includes('withdraw')) return 'withdraw';
    if (lowerType.includes('deposit')) return 'deposit';
    if (lowerType.includes('task') || lowerType.includes('ad')) return 'taskAd';
    
    return 'other';
  };

  const handleFilterToggle = () => {
    setShowFilterModal(!showFilterModal);
  };

  const handleFilterChange = (filterType: keyof typeof transactionFilters) => {
    setTransactionFilters(prev => ({
      ...prev,
      [filterType]: !prev[filterType]
    }));
  };

  const selectAllFilters = () => {
    setTransactionFilters({
      ptc: true,
      offerWall: true,
      faucet: true,
      withdraw: true,
      deposit: true,
      taskAd: true,
      dailyBonus: true,
      other: true
    });
  };

  const clearAllFilters = () => {
    setTransactionFilters({
      ptc: false,
      offerWall: false,
      faucet: false,
      withdraw: false,
      deposit: false,
      taskAd: false,
      dailyBonus: false,
      other: false
    });
  };

  const resetToDefault = () => {
    setTransactionFilters(defaultFilters);
  };

  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTransactions = filteredTransactions.slice(startIndex, endIndex);
  

  const formatAmount = (transaction: any) => {
    const amount = transaction.amountUsd || transaction.amountInUsd || transaction.amount * tokenPrice || transaction.finalReward * tokenPrice || 0;
    
    if (transaction.type?.toLowerCase().includes('withdraw')) {
      return `-$${amount.toLocaleString()}`;
    }
    
    if (transaction.type?.toLowerCase().includes('upgrade')) {
      return `$${amount.toLocaleString()}`;
    }
    
    if (transaction.type?.toLowerCase().includes('task created')) {
      const absoluteAmount = Math.abs(amount);
      return `-$${absoluteAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    
    if (transaction.type?.toLowerCase().includes('purchased')) {
      return `$${amount.toLocaleString()}`;
    }
    
    if (transaction.type?.toLowerCase().includes('task created') || 
        transaction.type?.toLowerCase().includes('ad created') ||
        transaction.type?.toLowerCase().includes('ad spend')) {
      return `$${amount.toLocaleString()}`;
    }
    
    return `+$${amount.toLocaleString()}`;
  };

  const getAmountColor = (transaction: any) => {
    const type = transaction.type?.toLowerCase() || '';
    if (type.includes('withdraw')) return 'text-red-400';
    if (type.includes('created')) return 'text-red-400';
    if (type.includes('upgrade') || type.includes('purchase')) return 'text-red-400';
    return 'text-emerald-400';
  };
  
const formatTransactionType = (type: string | undefined): string => {
  if (!type) return "";
  
  // Handle swap transactions (e.g., "Swap_xrp_to_bullfi")
  if (type.toLowerCase().startsWith('swap_')) {
    // Split by underscore
    const parts = type.split('_');
    
    if (parts.length >= 4) {
      // Format: Swap XRP to BULLFI
      const fromAsset = parts[1].toUpperCase();
      const toAsset = parts[3].toUpperCase();
      return `Swap ${fromAsset} to ${toAsset}`;
    }
    
    // Fallback for malformed swap strings
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
  
  // Handle other transaction types
  const words = type.split(/\s+/).slice(0, 2);
  return words.map((word: string) => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(" ");
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
        className="relative w-full min-h-[90vh] max-w-3xl glass p-8 rounded-[2.5rem] border border-white/10 max-h-[90vh] overflow-hidden flex flex-col"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-display font-bold">Transaction History</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handleFilterToggle}
              className="p-2 hover:bg-white/5 rounded-full transition-colors"
            >
              <Filter size={20} />
            </button>
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-white/5 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {transactionsLoading || !transactionsReady ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-bull-orange border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-zinc-400">Loading Transactions...</p>
            </div>
          ) : filteredTransactions.length > 0 ? (
            <div className="space-y-2">
              {currentTransactions.map((transaction, index) => {
                
                return (
                  <div key={index} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all">
                      <p className="font-bold flex justify-between gap-4 text-sm" style={{width: '100%'}}>{transaction.description || formatTransactionType(transaction.type)} <span className={`font-mono font-bold ${getAmountColor(transaction)}`}>
                        {formatAmount(transaction)}
                      </span></p>
                      <p className="text-xs text-zinc-500 flex items-center gap-1">
                        <Calendar size={10} />
                            {transaction.displayDate.toLocaleDateString()}
                        <Clock size={10} className="ml-1" />
                            {transaction.displayDate.toLocaleTimeString()}
                      </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <i className="fas fa-exchange-alt text-2xl text-zinc-500"></i>
              </div>
              <p className="text-zinc-400">No transactions found</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {filteredTransactions.length > itemsPerPage && (
          <div className="flex items-center justify-between pt-4 mt-4 border-t border-white/10">
            <button
              onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
              disabled={currentPage === 0}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm text-zinc-400">
              Page {currentPage + 1} of {Math.ceil(filteredTransactions.length / itemsPerPage)}
            </span>
            <button
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={endIndex >= filteredTransactions.length}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* Filter Modal */}
        {showFilterModal && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-10">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              className="w-full mx-4 max-w-md glass p-6 rounded-3xl border border-white/10"
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-bold">Filter Transactions</h4>
                <button
                  onClick={handleFilterToggle}
                  className="p-1 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-3 mb-4">
                <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
                  <input
                    type="checkbox"
                    checked={transactionFilters.ptc}
                    onChange={() => handleFilterChange('ptc')}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">PTC Tasks</span>
                </label>
                <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
                  <input
                    type="checkbox"
                    checked={transactionFilters.offerWall}
                    onChange={() => handleFilterChange('offerWall')}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Offer Wall</span>
                </label>
                <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
                  <input
                    type="checkbox"
                    checked={transactionFilters.faucet}
                    onChange={() => handleFilterChange('faucet')}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Faucet Claims</span>
                </label>
                <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
                  <input
                    type="checkbox"
                    checked={transactionFilters.withdraw}
                    onChange={() => handleFilterChange('withdraw')}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Withdrawals</span>
                </label>
                <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
                  <input
                    type="checkbox"
                    checked={transactionFilters.dailyBonus}
                    onChange={() => handleFilterChange('dailyBonus')}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Daily Bonuses</span>
                </label>
                <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
                  <input
                    type="checkbox"
                    checked={transactionFilters.deposit}
                    onChange={() => handleFilterChange('deposit')}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Deposits</span>
                </label>
                <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
                  <input
                    type="checkbox"
                    checked={transactionFilters.taskAd}
                    onChange={() => handleFilterChange('taskAd')}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Tasks & Ads</span>
                </label>
                <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
                  <input
                    type="checkbox"
                    checked={transactionFilters.other}
                    onChange={() => handleFilterChange('other')}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Other Transactions</span>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={selectAllFilters}
                  className="py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all text-sm font-bold"
                >
                  Select All
                </button>
                <button
                  onClick={clearAllFilters}
                  className="py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all text-sm font-bold"
                >
                  Clear All
                </button>
                <button
                  onClick={resetToDefault}
                  className="py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all text-sm font-bold col-span-2"
                >
                  Reset to Default
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default History;