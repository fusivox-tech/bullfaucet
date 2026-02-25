import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Briefcase, 
  Filter,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { useData } from '../contexts/DataContext';
import OfferDetailModal from './OfferDetailModal';
import { SingleSurvey } from './SurveyDisplay';

// Provider logo mapping for fallbacks
const PROVIDER_LOGOS: Record<string, string> = {
  'BitLabs': 'https://res.cloudinary.com/danuehpic/image/upload/v1771932037/bitlabs_uumted.png',
  'CPX': 'https://res.cloudinary.com/danuehpic/image/upload/v1771932038/cpx_ucbnon.png',
  'Wannads': 'https://res.cloudinary.com/danuehpic/image/upload/v1771932038/wannads_ppwygk.png',
  'Adscend': 'https://res.cloudinary.com/danuehpic/image/upload/v1771932037/adscend_qensby.png',
  'Notik': 'https://res.cloudinary.com/danuehpic/image/upload/v1771932038/notik_iv5krg.png',
  'Featured': '/default-offer.png',
  'default': '/default-offer.png'
};

interface OffersSectionProps {
  onComplete: (offer: any) => void;
  onViewDetail: (offer: any) => void;
}

// Helper function to determine difficulty based on reward amount
const getDifficultyFromReward = (reward: number): string => {
  if (reward < 50) return 'Easy';
  if (reward >= 50 && reward < 300) return 'Medium';
  return 'Hard';
};

const OffersSection: React.FC<OffersSectionProps> = ({ onComplete }) => {
  const {
    user,
    bitlabsOffers,
    bitlabsLoading,
    notikOffers,
    notikLoading,
    wannadsOffers,
    wannadsLoading,
    adscendOffers,
    adscendLoading,
    featuredOffers,
    featuredOffersLoading,
    surveys,
    cpxLoading,
    bitlabsSurveys,
    bitlabsSurveyLoading,
    fetchBitlabsOffers,
    fetchNotikOffers,
    fetchWannadsOffers,
    fetchAdscendOffers,
    fetchFeaturedOffers,
    fetchBitLabsSurveys,
    setBitlabsLoading,
    setNotikLoading,
    setWannadsLoading,
    setAdscendLoading,
    loadingTimeout,
    setLoadingTimeout,
  } = useData();

  const [selectedOffer, setSelectedOffer] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sourceFilter, setSourceFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const CPX_APP_ID = "27568";
  const userId = localStorage.getItem('userId');

  // Track image errors per item
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const handleImageError = (itemId: string) => {
    setImageErrors(prev => ({ ...prev, [itemId]: true }));
  };

  const getProviderLogo = (provider: string): string => {
    return PROVIDER_LOGOS[provider] || PROVIDER_LOGOS.default;
  };

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

  // Calculate actual payout with multiplier
  const calculateActualPayout = useCallback((basePayout: number) => {
    const multiplier = getRewardMultiplier();
    return {
      actualPayout: basePayout * multiplier,
      multiplier,
      basePayout
    };
  }, [getRewardMultiplier]);

  // Transform offers with multiplier and source identification
  const transformedOffers = useMemo(() => {
    const allOffers: any[] = [];

    // Add BitLabs offers
    if (bitlabsOffers?.length) {
      bitlabsOffers.forEach((offer: any) => {
        const payoutCalc = calculateActualPayout(offer.payout || 0);
        allOffers.push({
          ...offer,
          id: `bitlabs-${offer.id}`,
          originalId: offer.id,
          title: offer.name || offer.title,
          description: offer.description || '',
          reward_usd: payoutCalc.actualPayout,
          originalReward: payoutCalc.basePayout,
          multiplier: payoutCalc.multiplier,
          provider: 'BitLabs',
          type: offer.is_game ? 'Game' : (offer.categories?.includes('survey') ? 'Survey' : 'Offer'),
          image_url: offer.image_url || offer.icon || getProviderLogo('BitLabs'),
          click_url: offer.click_url,
          difficulty: getDifficultyFromReward(payoutCalc.actualPayout),
          icon: offer.icon || getProviderLogo('BitLabs'),
          source: 'BitLabs',
          category: 'offer',
          providerLogo: getProviderLogo('BitLabs')
        });
      });
    }

    // Add Notik offers
    if (notikOffers?.length) {
      notikOffers.forEach((offer: any) => {
        const payoutCalc = calculateActualPayout(offer.payout || 0);
        allOffers.push({
          ...offer,
          id: `notik-${offer.id}`,
          originalId: offer.id,
          title: offer.name || offer.title,
          description: offer.description || offer.description2 || '',
          reward_usd: payoutCalc.actualPayout,
          originalReward: payoutCalc.basePayout,
          multiplier: payoutCalc.multiplier,
          provider: 'Notik',
          type: 'Offer',
          image_url: offer.image_url || getProviderLogo('Notik'),
          click_url: offer.click_url,
          difficulty: getDifficultyFromReward(payoutCalc.actualPayout),
          icon: offer.image_url || getProviderLogo('Notik'),
          source: 'Notik',
          category: 'offer',
          providerLogo: getProviderLogo('Notik')
        });
      });
    }

    // Add Wannads offers
    if (wannadsOffers?.length) {
      wannadsOffers.forEach((offer: any) => {
        const payoutCalc = calculateActualPayout(offer.payout || 0);
        allOffers.push({
          ...offer,
          id: `wannads-${offer.id}`,
          originalId: offer.id,
          title: offer.name || offer.title,
          description: offer.description || '',
          reward_usd: payoutCalc.actualPayout,
          originalReward: payoutCalc.basePayout,
          multiplier: payoutCalc.multiplier,
          provider: 'Wannads',
          type: 'Offer',
          image_url: offer.image_url || getProviderLogo('Wannads'),
          click_url: offer.click_url,
          difficulty: getDifficultyFromReward(payoutCalc.actualPayout),
          icon: offer.image_url || getProviderLogo('Wannads'),
          source: 'Wannads',
          category: 'offer',
          providerLogo: getProviderLogo('Wannads')
        });
      });
    }

    // Add Adscend offers
    if (adscendOffers?.length) {
      adscendOffers.forEach((offer: any) => {
        const payoutCalc = calculateActualPayout(offer.payout || 0);
        allOffers.push({
          ...offer,
          id: `adscend-${offer.id}`,
          originalId: offer.id,
          title: offer.name || offer.title,
          description: offer.description || '',
          reward_usd: payoutCalc.actualPayout,
          originalReward: payoutCalc.basePayout,
          multiplier: payoutCalc.multiplier,
          provider: 'Adscend',
          type: 'Offer',
          image_url: offer.image_url || getProviderLogo('Adscend'),
          click_url: offer.click_url,
          difficulty: getDifficultyFromReward(payoutCalc.actualPayout),
          icon: offer.image_url || getProviderLogo('Adscend'),
          source: 'Adscend',
          category: 'offer',
          providerLogo: getProviderLogo('Adscend')
        });
      });
    }

    // Add featured offers as fallback
    if (featuredOffers?.length) {
      featuredOffers.forEach((offer: any) => {
        const payoutCalc = calculateActualPayout(offer.payout || 0);
        allOffers.push({
          ...offer,
          id: `featured-${offer.id}`,
          title: offer.name || offer.title,
          description: offer.description || '',
          reward_usd: payoutCalc.actualPayout,
          originalReward: payoutCalc.basePayout,
          multiplier: payoutCalc.multiplier,
          provider: 'Featured',
          type: offer.type || 'Offer',
          image_url: offer.image_url || getProviderLogo('Featured'),
          click_url: offer.click_url,
          difficulty: getDifficultyFromReward(payoutCalc.actualPayout),
          icon: offer.icon || getProviderLogo('Featured'),
          source: 'Featured',
          category: 'offer',
          providerLogo: getProviderLogo('Featured')
        });
      });
    }

    return allOffers;
  }, [bitlabsOffers, notikOffers, wannadsOffers, adscendOffers, featuredOffers, calculateActualPayout]);

  // Transform surveys with multiplier
  const transformedSurveys = useMemo(() => {
    const allSurveys: any[] = [];

    // Add CPX surveys
    if (surveys?.length) {
      surveys.forEach((survey: any) => {
        const payoutCalc = calculateActualPayout(survey.payout || 0);
        allSurveys.push({
          ...survey,
          id: `cpx-${survey.id}`,
          title: `${survey.source?.toUpperCase() || 'CPX'} Survey`,
          description: survey.description || 'Complete this survey to earn rewards',
          reward_usd: payoutCalc.actualPayout,
          originalReward: payoutCalc.basePayout,
          multiplier: payoutCalc.multiplier,
          provider: 'CPX',
          type: 'Survey',
          image_url: getProviderLogo('CPX'),
          click_url: survey.url || `https://offers.cpx-research.com/index.php?app_id=27568&ext_user_id=${user?._id}&survey_id=${survey.id}`,
          difficulty: getDifficultyFromReward(payoutCalc.actualPayout),
          icon: getProviderLogo('CPX'),
          source: 'CPX',
          category: 'survey',
          providerLogo: getProviderLogo('CPX')
        });
      });
    }

    // Add BitLabs surveys
    if (bitlabsSurveys?.length) {
      bitlabsSurveys.forEach((survey: any) => {
        const payoutCalc = calculateActualPayout(survey.value || survey.payout || 0);
        allSurveys.push({
          ...survey,
          id: `bitlabs-survey-${survey.id}`,
          title: survey.title || 'BitLabs Survey',
          description: survey.description || 'Complete this survey to earn rewards',
          reward_usd: payoutCalc.actualPayout,
          originalReward: payoutCalc.basePayout,
          multiplier: payoutCalc.multiplier,
          provider: 'BitLabs',
          type: 'Survey',
          image_url: survey.image_url || getProviderLogo('BitLabs'),
          click_url: survey.click_url,
          difficulty: getDifficultyFromReward(payoutCalc.actualPayout),
          icon: getProviderLogo('BitLabs'),
          source: 'BitLabs',
          category: 'survey',
          providerLogo: getProviderLogo('BitLabs')
        });
      });
    }

    return allSurveys;
  }, [surveys, bitlabsSurveys, calculateActualPayout, user?._id]);

  // Combine and randomize items with highest survey at top
  const randomizedItems = useMemo(() => {
    // Separate surveys and offers
    const surveys = transformedSurveys.filter(item => item.category === 'survey');
    const offers = transformedOffers.filter(item => item.category === 'offer');

    // Find the survey with the highest reward
    let highestSurvey = null;
    let remainingSurveys = [...surveys];

    if (surveys.length > 0) {
      // Sort surveys by reward to find the highest
      const sortedSurveys = [...surveys].sort((a, b) => b.reward_usd - a.reward_usd);
      highestSurvey = sortedSurveys[0];
      remainingSurveys = sortedSurveys.slice(1);
    }

    // Shuffle remaining surveys and offers separately
    const shuffledRemainingSurveys = [...remainingSurveys].sort(() => Math.random() - 0.5);
    const shuffledOffers = [...offers].sort(() => Math.random() - 0.5);

    // Interleave remaining surveys with offers
    const interleaved: any[] = [];
    const maxLength = Math.max(shuffledRemainingSurveys.length, shuffledOffers.length);

    for (let i = 0; i < maxLength; i++) {
      if (i < shuffledOffers.length) {
        interleaved.push(shuffledOffers[i]);
      }
      if (i < shuffledRemainingSurveys.length) {
        interleaved.push(shuffledRemainingSurveys[i]);
      }
    }

    // Place highest survey at the beginning if it exists
    if (highestSurvey) {
      return [highestSurvey, ...interleaved];
    }

    return interleaved;
  }, [transformedOffers, transformedSurveys]);

  // Get unique sources for filter
  const availableSources = useMemo(() => {
    const sources = new Set<string>();
    sources.add('all');
    
    randomizedItems.forEach(item => {
      if (item.source) sources.add(item.source);
    });
    
    return Array.from(sources);
  }, [randomizedItems]);

  // Filter items
  const filteredItems = useMemo(() => {
    let filtered = [...randomizedItems];

    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(item => item.category === typeFilter);
    }

    // Apply source filter
    if (sourceFilter !== 'all') {
      filtered = filtered.filter(item => item.source === sourceFilter);
    }

    // Remove started offers
    const startedIds = new Set(user?.startedOffers?.map((so: any) => so.id) || []);
    filtered = filtered.filter(item => !startedIds.has(item.id));

    return filtered;
  }, [randomizedItems, sourceFilter, typeFilter, user?.startedOffers]);

  // Loading timeout effect
  useEffect(() => {
    const anyLoading = bitlabsLoading || notikLoading || wannadsLoading || adscendLoading || featuredOffersLoading || cpxLoading || bitlabsSurveyLoading;
    
    if (anyLoading) {
      const timeoutId = setTimeout(() => {
        setLoadingTimeout(true);
        setBitlabsLoading(false);
        setWannadsLoading(false);
        setAdscendLoading(false);
        setNotikLoading(false);
      }, 10000);

      return () => clearTimeout(timeoutId);
    } else {
      setLoadingTimeout(false);
    }
  }, [bitlabsLoading, notikLoading, wannadsLoading, adscendLoading, featuredOffersLoading, cpxLoading, bitlabsSurveyLoading]);

  // Fetch data on mount
  useEffect(() => {
    fetchBitlabsOffers();
    fetchNotikOffers();
    fetchWannadsOffers();
    fetchAdscendOffers();
    fetchFeaturedOffers();
    fetchBitLabsSurveys();
  }, []);

  const handleOfferClick = (item: any) => {
    setSelectedOffer(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedOffer(null), 300);
  };

  const getFilterDisplayText = () => {
    return sourceFilter === 'all' ? 'All Providers' : sourceFilter;
  };

  const getTypeDisplayText = () => {
    switch(typeFilter) {
      case 'all': return 'All Types';
      case 'offer': return 'Offers Only';
      case 'survey': return 'Surveys Only';
      default: return 'All Types';
    }
  };

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'offer', label: 'Offers Only' },
    { value: 'survey', label: 'Surveys Only' }
  ];

  const filterOptions = availableSources.map(source => ({
    value: source,
    label: source === 'all' ? 'All Providers' : source
  }));

  const isLoading = bitlabsLoading || notikLoading || wannadsLoading || adscendLoading || featuredOffersLoading || cpxLoading || bitlabsSurveyLoading;

  // Difficulty badge colors
  const getDifficultyColor = (difficulty: string) => {
    switch(difficulty) {
      case 'Easy': return 'text-emerald-400 bg-emerald-500/20';
      case 'Medium': return 'text-amber-400 bg-amber-500/20';
      case 'Hard': return 'text-rose-400 bg-rose-500/20';
      default: return 'text-zinc-400 bg-white/5';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-8 rounded-[2rem] glass bg-gradient-to-br from-bull-orange/10 to-transparent border border-bull-orange/20">
        <div className="max-w-2xl">
          <h3 className="text-3xl font-display font-bold mb-4">Offers & Surveys</h3>
          <p className="text-zinc-400 leading-relaxed">
            Complete offers and surveys from our trusted partners to earn massive BULLFI rewards. 
            Your earnings contribute towards <span className="text-bull-orange font-bold">permanent faucet unlocks</span>.
          </p>
          {getRewardMultiplier() > 1 && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 text-emerald-400 text-sm">
              <Sparkles className="w-4 h-4" />
              <span>Your membership: {getRewardMultiplier()}x rewards multiplier active!</span>
            </div>
          )}
        </div>
      </div>
      
      <div style={{ display: "none", flexWrap: 'wrap' }}>
        <div style={{ width: '48%', marginRight: '2%' }}>
          <SingleSurvey appId={CPX_APP_ID} userId={userId} />
        </div>
        <div style={{ width: '48%' }}>
          <SingleSurvey appId={CPX_APP_ID} userId={userId} />
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 justify-between items-center">
        <div className="flex gap-2">
          {/* Type Filter */}
          <button
            onClick={() => setShowTypeModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl glass hover:bg-white/5 transition-all text-sm"
          >
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">{getTypeDisplayText()}</span>
            <span className="sm:hidden">Type</span>
            <ChevronDown className="w-4 h-4" />
          </button>

          {/* Source Filter */}
          <button
            onClick={() => setShowFilterModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl glass hover:bg-white/5 transition-all text-sm"
          >
            <Briefcase className="w-4 h-4" />
            <span className="hidden sm:inline">{getFilterDisplayText()}</span>
            <span className="sm:hidden">Provider</span>
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Items Grid */}
      {isLoading && !loadingTimeout ? (
        <div className="flex flex-col items-center justify-center p-12 glass rounded-3xl">
          <div className="w-12 h-12 border-4 border-bull-orange border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-zinc-400">Loading offers and surveys...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 glass rounded-3xl">
          <Briefcase className="w-16 h-16 text-zinc-500 mb-4" />
          <p className="text-zinc-400 text-center">
            No offers or surveys available at the moment.<br />
            <span className="text-xs text-zinc-600">Check back soon for new opportunities!</span>
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => {
            const hasImageError = imageErrors[item.id];
            const difficultyColor = getDifficultyColor(item.difficulty);
            
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass p-4 rounded-2xl hover:border-bull-orange/30 transition-all cursor-pointer group"
                onClick={() => handleOfferClick(item)}
              >
                <div className="flex items-start gap-3">
                  {/* Icon/Image with fallback */}
                  <div className="w-16 h-16 rounded-xl bg-white/5 flex items-center justify-center overflow-hidden">
                    {!hasImageError && item.image_url ? (
                      <img 
                        src={item.image_url} 
                        alt={item.title}
                        className="w-full h-full object-cover"
                        onError={() => handleImageError(item.id)}
                      />
                    ) : (
                      <img 
                        src={item.providerLogo}
                        alt={item.provider}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-display font-bold text-sm line-clamp-2 flex-1">
                        {item.title}
                      </h4>
                      <div className="flex items-center gap-1 text-emerald-400 font-mono font-bold text-sm whitespace-nowrap">
                        ${item.reward_usd.toFixed(2)}
                      </div>
                    </div>

                    <p className="text-xs text-zinc-500 line-clamp-2 mt-1">
                      {item.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className="text-[8px] px-2 py-0.5 rounded-full bg-white/5 text-zinc-400 border border-white/10">
                        {item.provider}
                      </span>
                      <span className="text-[8px] px-2 py-0.5 rounded-full bg-white/5 text-zinc-400 border border-white/10">
                        {item.type}
                      </span>
                      <span className={`text-[8px] px-2 py-0.5 rounded-full border border-white/10 ${difficultyColor}`}>
                        {item.difficulty}
                      </span>
                      {item.multiplier > 1 && (
                        <span className="text-[8px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                          {item.multiplier}x
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Type Filter Modal */}
      <AnimatePresence>
        {showTypeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-end justify-center"
            onClick={() => setShowTypeModal(false)}
          >
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="w-full max-w-md bg-bull-dark border-t border-white/10 rounded-t-3xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-display font-bold mb-4">Filter by Type</h3>
              <div className="space-y-2">
                {typeOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setTypeFilter(option.value);
                      setShowTypeModal(false);
                    }}
                    className={`w-full p-4 rounded-xl text-left transition-all ${
                      typeFilter === option.value
                        ? 'bg-bull-orange/20 border border-bull-orange'
                        : 'bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Provider Filter Modal */}
      <AnimatePresence>
        {showFilterModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-end justify-center"
            onClick={() => setShowFilterModal(false)}
          >
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="w-full max-w-md bg-bull-dark border-t border-white/10 rounded-t-3xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-display font-bold mb-4">Filter by Provider</h3>
              <div className="space-y-2">
                {filterOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setSourceFilter(option.value);
                      setShowFilterModal(false);
                    }}
                    className={`w-full p-4 rounded-xl text-left transition-all ${
                      sourceFilter === option.value
                        ? 'bg-bull-orange/20 border border-bull-orange'
                        : 'bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Offer Detail Modal */}
      <OfferDetailModal
        isOpen={isModalOpen}
        onClose={closeModal}
        offer={selectedOffer}
        onStart={onComplete}
      />
    </div>
  );
};

export default OffersSection;