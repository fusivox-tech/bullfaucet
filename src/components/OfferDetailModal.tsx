import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, AlertTriangle, Trash2, Info, ListChecks, CheckCircle, Clock, Smartphone, Play } from 'lucide-react';
import { useData } from '../contexts/DataContext';

interface OfferDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  offer: any;
  onStart: (offer: any) => void;
}

const OfferDetailModal: React.FC<OfferDetailModalProps> = ({ isOpen, onClose, offer, onStart }) => {
  const { user, checkAuth } = useData();
  const [deviceType, setDeviceType] = useState('');
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const handleImageError = (itemId: string) => {
    setImageErrors(prev => ({ ...prev, [itemId]: true }));
  };
  
  const hasImageError = imageErrors[offer?.id];

  // Calculate reward multiplier based on membership
  const getRewardMultiplier = useCallback(() => {
    if (!user?.membership?.level) return 1;
    
    const membershipLevel = user?.membership?.level;
    switch(membershipLevel) {
      case 'juniorPartner': return 2;
      case 'mediumPartner': return 3;
      case 'seniorPartner': return 4;
      default: return 1;
    }
  }, [user?.membership?.level]);

  // Detect device type on mount
  useEffect(() => {
    const detectDevice = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      
      if (/android/.test(userAgent)) {
        return 'android';
      } else if (/iphone|ipad|ipod/.test(userAgent)) {
        return 'ios';
      } else if (/windows/.test(userAgent)) {
        return 'windows';
      } else if (/mac/.test(userAgent)) {
        return 'mac';
      } else if (/linux/.test(userAgent)) {
        return 'linux';
      } else {
        return 'unknown';
      }
    };

    setDeviceType(detectDevice());
  }, []);

const handleStartOffer = async () => {
  setIsStarting(true);
  
  try {
    // Check if this is a survey - skip tracking for surveys
    const isSurvey = offer?.type?.toLowerCase() === 'survey' || 
                     offer?.category?.toLowerCase() === 'survey' ||
                     offer?.title?.toLowerCase().includes('survey');
    
    // Only track non-survey offers
    if (!isSurvey && user?._id && offer) {
      try {
        await fetch('https://payment.bullfaucet.com/api/announcements/track-offer-start', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user._id,
            offer: {
              id: offer?.id,
              name: offer?.title,
              source: offer?.provider,
              payout: offer?.reward_usd
            },
            metadata: {
              timestamp: new Date().toISOString(),
              deviceType: deviceType,
              isSurvey: false
            }
          })
        });
        console.log('Offer start tracked successfully');
      } catch (trackingError) {
        console.error('Failed to track offer start:', trackingError);
      }
    } else if (isSurvey) {
      console.log('Survey started - skipping tracking');
    }

    // Call onStart callback
    onStart(offer);
    
    // Open the offer in a new tab
    window.open(offer?.click_url, '_blank');
    
    // Close modal
    onClose();
  } catch (error) {
    console.error('Failed to start offer:', error);
  } finally {
    setIsStarting(false);
  }
};

  const handleRemoveOffer = async () => {
    if (!checkAuth() || !user?._id || !offer?.id) return;
    
    setIsRemoving(true);
    try {
      const response = await fetch('https://payment.bullfaucet.com/api/announcements/remove-started-offer', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user._id,
          offerId: offer?.id
        })
      });

      const result = await response.json();
      
      if (result.success) {
        // Close the modal
        setShowRemoveConfirm(false);
        onClose();
      } else {
        console.error('Failed to remove offer:', result.error);
        alert('Failed to remove offer. Please try again.');
      }
    } catch (error) {
      console.error('Error removing offer:', error);
      alert('An error occurred while removing the offer.');
    } finally {
      setIsRemoving(false);
    }
  };

  const getDeviceIcon = () => {
    switch(deviceType) {
      case 'android': return 'fab fa-android';
      case 'ios': return 'fab fa-apple';
      case 'windows': return 'fab fa-windows';
      case 'mac': return 'fab fa-apple';
      default: return 'fas fa-question-circle';
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'completed': return 'text-emerald-400';
      case 'pending': return 'text-yellow-400';
      case 'incomplete': return 'text-zinc-400';
      default: return 'text-zinc-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch(status) {
      case 'completed': return 'Completed';
      case 'pending': return 'Pending';
      case 'incomplete': return 'Incomplete';
      default: return 'Unknown';
    }
  };
  
  const getDifficultyColor = (difficulty: string) => {
    switch(difficulty) {
      case 'Easy': return 'text-emerald-400 bg-emerald-500/20';
      case 'Medium': return 'text-amber-400 bg-amber-500/20';
      case 'Hard': return 'text-rose-400 bg-rose-500/20';
      default: return 'text-zinc-400 bg-white/5';
    }
  };
  
  const difficultyColor = getDifficultyColor(offer?.difficulty || 'Easy');

  // Calculate event payout with membership multiplier
  const calculateEventPayout = (event: any) => {
    const multiplier = getRewardMultiplier();
    let basePayout = 0;
    
    if (offer?.provider === 'Adscend') {
      basePayout = (event.points || event.payout || event.currency_count || 0) * 0.5;
    } else {
      basePayout = event.virtual_currency_value || event.points || event.payout || event.currency_count || 0;
    }
    
    return parseFloat(String(basePayout)) * multiplier;
  };

  if (!offer) return null;

  const isStarted = offer?.startedOffer || user?.startedOffers?.some((so: any) => so.id === offer?.id);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-bull-dark/80 backdrop-blur-sm" 
            onClick={onClose} 
          />
          
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-xl glass rounded-[2.5rem] border border-white/10 overflow-hidden max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="relative p-6 border-b border-white/10 bg-gradient-to-r from-bull-orange/10 to-transparent">
              <button 
                onClick={onClose} 
                className="absolute top-4 right-4 p-2 bg-bull-dark/50 hover:bg-white/10 rounded-full transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-4 max-w-[60%] md:gap-5">
                  {/* Offer Image */}
                  <div className="w-20 h-20 rounded-2xl bg-white/5 overflow-hidden flex-shrink-0">
                    {!hasImageError && offer?.image_url ? (
                      <img 
                        src={offer?.image_url} 
                        alt={offer?.title}
                        className="w-full h-full object-cover"
                        onError={() => handleImageError(offer?.id)}
                      />
                    ) : (
                      <img 
                        src={offer?.providerLogo}
                        alt={offer?.provider}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  
                  <h3 className="text-xl font-display font-bold mb-1 max-w-[70%] line-clamp-3">{offer?.title}</h3>
                </div>

                {/* Reward */}
                <div className="text-right">
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Total Reward</p>
                  <p className="text-3xl font-display font-bold text-emerald-400">${offer?.reward_usd?.toFixed(2)}</p>
                  {getRewardMultiplier() > 1 && (
                    <p className="text-[10px] text-emerald-400/60 mt-1">{getRewardMultiplier()}x multiplier active</p>
                  )}
                </div>
              </div>
              
              {/* Offer Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0 ml-23 mt-5">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${difficultyColor}`}>
                    {offer?.difficulty || 'Easy'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-white/5 text-zinc-400 text-[10px] font-bold uppercase tracking-wider">
                    {offer?.type || 'Offer'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-white/5 text-zinc-400 text-[10px] font-bold uppercase tracking-wider">
                    {offer?.provider}
                  </span>
                </div>

                {/* Device Icons */}
                <div className="flex items-center gap-2 mt-2">
                  {offer?.devices?.length > 0 ? (
                    offer?.devices.map((device: any, index: number) => {
                      const deviceName = device.name?.toLowerCase() || device?.toLowerCase();
                      return (
                        <i
                          key={index}
                          className={
                            deviceName.includes('android') ? "fab fa-android text-emerald-400" :
                            deviceName.includes('ios') || deviceName.includes('iphone') ? "fab fa-apple text-zinc-400" :
                            deviceName.includes('windows') ? "fab fa-windows text-blue-400" :
                            deviceName.includes('mac') ? "fab fa-apple text-zinc-400" :
                            deviceName.includes('desktop') ? "fas fa-desktop text-zinc-400" :
                            deviceName.includes('mobile') ? "fas fa-mobile-alt text-zinc-400" :
                            "fas fa-question-circle text-zinc-400"
                          }
                        />
                      );
                    })
                  ) : (
                    <i className={getDeviceIcon()}></i>
                  )}
                </div>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
              {/* Description */}
              {(offer?.description || offer?.requirements) && (
                <div className="mb-6">
                  <h4 className="flex items-center gap-2 text-sm font-display font-bold mb-3">
                    <Info className="w-4 h-4 text-bull-orange" />
                    Offer Description
                  </h4>
                  <div className="space-y-2 text-sm text-zinc-400">
                    <p>{offer?.description || offer?.requirements}</p>
                  </div>
                </div>
              )}

              {/* Tasks/Events */}
              {offer?.events && offer?.events.length > 0 && (
                <div className="mb-6">
                  <h4 className="flex items-center gap-2 text-sm font-display font-bold mb-3">
                    <ListChecks className="w-4 h-4 text-bull-orange" />
                    Task Breakdown
                  </h4>
                  <div className="space-y-2">
                    {offer?.events.map((event: any, index: number) => {
                      // Determine status
                      let status = '';
                      if (event.status) {
                        status = event.status.toLowerCase();
                      } else if (event.isCompleted !== undefined) {
                        status = event.isCompleted === 1 ? 'completed' : 'incomplete';
                      }

                      const eventPayout = calculateEventPayout(event);

                      return (
                        <div 
                          key={event.uuid || event.event_id || index}
                          className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10"
                        >
                          <div className="flex items-center gap-2 max-w-[70%]">
                            <span className={getStatusColor(status)}>
                              {getStatusIcon(status)}
                            </span>
                            <span className="text-sm text-zinc-300 line-clamp-3 max-w-[100%]">
                              {event.name || event.event_description || 'Unknown Task'}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`text-sm font-mono font-bold ${getStatusColor(status)}`}>
                              ${eventPayout.toFixed(2)}
                            </span>
                            {status && (
                              <span className={`text-[10px] px-2 py-1 rounded-full ${getStatusColor(status)} bg-white/5`}>
                                {getStatusText(status)}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                {isStarted ? (
                  <>
                    <button
                      onClick={() => window.open(offer?.click_url, '_blank')}
                      className="w-full py-4 rounded-2xl bg-bull-orange text-white font-bold hover:bg-orange-600 transition-all shadow-lg shadow-bull-orange/20 flex items-center justify-center gap-2"
                    >
                      <Play className="w-5 h-5" />
                      Continue Playing
                    </button>
                    <button
                      onClick={() => setShowRemoveConfirm(true)}
                      className="w-full py-4 rounded-2xl bg-red-500/10 text-red-400 font-bold hover:bg-red-500/20 transition-all flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-5 h-5" />
                      Remove from list
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleStartOffer}
                    disabled={isStarting}
                    className="w-full py-4 rounded-2xl bg-bull-orange text-white font-bold hover:bg-orange-600 transition-all shadow-lg shadow-bull-orange/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isStarting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Starting...
                      </>
                    ) : (
                      <>
                        <Smartphone className="w-5 h-5" />
                        Start Offer
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </motion.div>

          {/* Remove Confirmation Modal */}
          <AnimatePresence>
            {showRemoveConfirm && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[250] flex items-center justify-center p-4"
              >
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowRemoveConfirm(false)} />
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="relative w-full max-w-md glass rounded-2xl border border-white/10 p-6"
                >
                  <div className="flex items-center gap-3 mb-4 text-red-400">
                    <AlertTriangle className="w-6 h-6" />
                    <h3 className="text-xl font-display font-bold">Remove Offer</h3>
                  </div>
                  
                  <p className="text-zinc-300 mb-2">
                    Are you sure you want to remove <span className="font-bold text-bull-orange">{offer?.title}</span> from your started offers list?
                  </p>
                  
                  <p className="text-sm text-zinc-500 mb-6 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    This action cannot be undone.
                  </p>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowRemoveConfirm(false)}
                      disabled={isRemoving}
                      className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleRemoveOffer}
                      disabled={isRemoving}
                      className="flex-1 py-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all font-bold flex items-center justify-center gap-2"
                    >
                      {isRemoving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                          Removing...
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4" />
                          Remove
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </AnimatePresence>
  );
};

export default OfferDetailModal;