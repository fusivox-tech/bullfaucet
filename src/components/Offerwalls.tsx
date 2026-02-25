import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Briefcase, ExternalLink, X, ShieldCheck, Award } from 'lucide-react';

export const Offerwalls = () => {
  const [activeOfferwall, setActiveOfferwall] = useState<any>(null);
  const userId = localStorage.getItem('userId');
  
  const BITLABS_TOKEN = 'ba2926e9-79e9-4618-a141-c906cac15bef';
  const NOTIK_APP_ID = 'dWbgpFGF0y';
  const NOTIK_PUB_ID = 'fUzrux';
  const NOTIK_API_KEY = 'Tz1oJT37K3j8OrDHyZIG5NDlVZVErY3i';
  
  const bitcoTasksUrl = `https://bitcotasks.com//offerwall/jzd0ze44qn0un9q1cqs7spi130mjtu/${userId}`;
  const bitlabsUrl = `https://web.bitlabs.ai/?uid=${userId}&token=${BITLABS_TOKEN}&theme='DARK'`;
  const myleadUrl = `https://reward-me.eu/f6cd6f42-4061-11f0-ac94-8a5fb7be40ea?player_id=${userId}`;
  const notikUrl = `https://notik.me/coins?api_key=${NOTIK_API_KEY}&pub_id=${NOTIK_PUB_ID}&app_id=${NOTIK_APP_ID}&user_id=${userId}`;
  const wannadsUrl = `https://earn.wannads.com/wall?apiKey=683d4abc953dc543649825&userId=${userId}`;
  const adscendUrl = `https://asmwall.com/adwall/publisher/116746/profile/20327?subid1=${userId}`;
  const cpxUrl = `https://offers.cpx-research.com/index.php?app_id=27568&ext_user_id=${userId}`;
  const timewallUrl = `https://timewall.io/users/login?oid=aac41a30ee429e74&uid=${userId}`;

  const offerwalls = [
    {
      id: 'bitlabs',
      name: 'BitLabs',
      description: 'High-paying surveys and app offers from top advertisers worldwide.',
      logo: 'https://res.cloudinary.com/danuehpic/image/upload/v1771932037/bitlabs_uumted.png',
      bonus: null,
      tags: ['Surveys', 'Apps', 'Games', 'High-Paying'],
      features: ['Instant Crediting', '24/7 Support', 'Global Availability'],
      url: bitlabsUrl,
      color: '#3b82f6'
    },
    {
      id: 'cpx',
      name: 'CPX Research',
      description: 'Premium market research surveys tailored to your demographics.',
      logo: 'https://res.cloudinary.com/danuehpic/image/upload/v1771932038/cpx_ucbnon.png',
      bonus: null,
      tags: ['Surveys', 'Market Research', 'High-Quality'],
      features: ['Profile Matching', 'No Disqualifications', 'Fast Payouts'],
      url: cpxUrl,
      color: '#10b981'
    },
    {
      id: 'wannads',
      name: 'Wannads',
      description: 'Huge variety of offers, tasks, videos, and app installs.',
      logo: 'https://res.cloudinary.com/danuehpic/image/upload/v1771932038/wannads_ppwygk.png',
      bonus: null,
      tags: ['Apps', 'Tasks', 'Videos', 'Surveys'],
      features: ['Daily Tasks', 'Video Rewards', 'Referral Program'],
      url: wannadsUrl,
      color: '#f97316'
    },
    {
      id: 'adscend',
      name: 'Adscend Media',
      description: 'Watch videos, complete surveys, download apps, and more.',
      logo: 'https://res.cloudinary.com/danuehpic/image/upload/v1771932037/adscend_qensby.png',
      bonus: null,
      tags: ['Videos', 'Apps', 'Surveys', 'Email Submits'],
      features: ['Video Playlist', 'Daily Bonuses', 'Loyalty Program'],
      url: adscendUrl,
      color: '#ef4444'
    },
    {
      id: 'notik',
      name: 'Notik',
      description: 'Fast-paying offers and unique tasks with instant crediting.',
      logo: 'https://res.cloudinary.com/danuehpic/image/upload/v1771932038/notik_iv5krg.png',
      bonus: null,
      tags: ['Tasks', 'Apps', 'Quick Offers'],
      features: ['Instant Credit', '24/7 Support', 'Low Minimum'],
      url: notikUrl,
      color: '#8b5cf6'
    },
    {
      id: 'bitcotasks',
      name: 'BitcoTasks',
      description: 'Complete simple tasks and micro-jobs for crypto rewards.',
      logo: 'https://res.cloudinary.com/danuehpic/image/upload/v1771932038/bitcotasks_tmduhj.png',
      bonus: null,
      tags: ['Micro-Tasks', 'Data Entry', 'Social Media'],
      features: ['Flexible Hours', 'Skill-Based', 'Instant Payout'],
      url: bitcoTasksUrl,
      color: '#f59e0b'
    },
    {
      id: 'timewall',
      name: 'TimeWall',
      description: 'Earn by completing offers, surveys, and engaging with content.',
      logo: 'https://res.cloudinary.com/danuehpic/image/upload/v1771932040/timewall_jiatl0.png',
      bonus: null,
      tags: ['Offers', 'Surveys', 'Content'],
      features: ['Smart Matching', 'Weekend Bonuses', 'Leaderboards'],
      url: timewallUrl,
      color: '#06b6d4'
    },
    {
      id: 'mylead',
      name: 'MyLead',
      description: 'International offerwall with high-converting campaigns.',
      logo: 'https://res.cloudinary.com/danuehpic/image/upload/v1771932038/mylead_rcdqji.png',
      bonus: null,
      tags: ['International', 'Apps', 'Surveys'],
      features: ['Localized Offers', 'High Conversion', 'Multi-language'],
      url: myleadUrl,
      color: '#ec4899'
    },
  ];

  const openOfferwall = (wall: any) => {
    setActiveOfferwall(wall);
  };

  const closeOfferwall = () => {
    setActiveOfferwall(null);
  };

  const openExternally = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-bull-orange/20 mb-6">
          <Briefcase className="w-10 h-10 text-bull-orange" />
        </div>
        <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">Partner Offerwalls</h2>
        <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
          Complete surveys, download apps, and play games from our trusted partners to earn massive rewards.
        </p>
      </div>

      {/* Offerwalls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {offerwalls.map((wall, idx) => (
          <motion.div 
            key={wall.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass p-6 rounded-3xl flex flex-col hover:border-bull-orange/30 transition-colors group relative overflow-hidden"
          >
            {wall.bonus && (
              <div className="absolute top-0 right-0 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl z-10 flex items-center gap-1">
                <Award className="w-3 h-3" />
                {wall.bonus} Bonus
              </div>
            )}
            
            <div className="flex items-start justify-between mb-4">
              <div className="w-16 h-16 flex items-center justify-center p-0">
                <img src={wall.logo} alt={wall.name} className="w-full h-full object-contain filter group-hover:grayscale-0 transition-all rounded-xl" />
              </div>
            </div>
            
            <h3 className="text-xl font-display font-bold mb-2 flex items-center gap-2">
              {wall.name}
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </h3>
            
            <p className="text-sm text-zinc-400 mb-4 flex-grow">{wall.description}</p>
            
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {wall.tags.map(tag => (
                <span key={tag} className="text-[8px] font-bold uppercase tracking-wider px-2 py-1 rounded-md bg-white/5 text-zinc-300 border border-white/10">
                  {tag}
                </span>
              ))}
            </div>

            {/* Features Preview */}
            <div className="flex items-center gap-3 mb-4 text-[10px] text-zinc-500">
              {wall.features.slice(0, 2).map(feature => (
                <span key={feature} className="flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  {feature}
                </span>
              ))}
            </div>

            <button 
              onClick={() => openOfferwall(wall)}
              className="w-full py-3 rounded-xl bg-bull-orange/10 text-bull-orange font-bold group-hover:bg-bull-orange group-hover:text-white transition-all flex items-center justify-center gap-2"
            >
              Open Offerwall
              <ExternalLink className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </div>

      {/* Offerwall Iframe Modal */}
      <AnimatePresence>
        {activeOfferwall && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8"
          >
            <div className="absolute inset-0 bg-bull-dark/90 backdrop-blur-sm" onClick={closeOfferwall} />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-6xl h-[80vh] glass rounded-[2rem] border border-white/10 flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/10 bg-bull-dark/50">
                <div className="flex items-center gap-3">
                  <img src={activeOfferwall.logo} alt={activeOfferwall.name} className="h-8 w-8 object-contain" />
                  <div>
                    <h3 className="font-display font-bold text-lg">{activeOfferwall.name}</h3>
                    <p className="text-xs text-zinc-400">{activeOfferwall.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {/* Open Externally Button */}
                  <button 
                    onClick={() => openExternally(activeOfferwall.url)}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors text-bull-orange"
                    title="Open in new tab"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={closeOfferwall}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Iframe */}
              <div className="flex-grow bg-white relative">
                <iframe 
                  src={activeOfferwall.url}
                  title={activeOfferwall.name}
                  className="absolute inset-0 w-full h-full border-0"
                  sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation allow-popups-to-escape-sandbox"
                  allow="payment *; clipboard-read *; clipboard-write *"
                  loading="lazy"
                />
              </div>

              {/* Footer - Clean with just the bonus if available */}
              {activeOfferwall.bonus && (
                <div className="p-3 border-t border-white/10 bg-bull-dark/50 flex items-center justify-center">
                  <span className="text-emerald-400 font-bold flex items-center gap-1 text-sm">
                    <Award className="w-4 h-4" />
                    {activeOfferwall.bonus} Bonus Available
                  </span>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};