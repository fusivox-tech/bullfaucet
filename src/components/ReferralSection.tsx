import React, { useState } from 'react';
import { Users, ChevronDown, ChevronUp, Copy, Share2, Facebook, Twitter, MessageCircle, Send } from 'lucide-react';
import { User } from '../types';
import { useData } from '../contexts/DataContext';
import ShareModal from './ShareModal';

interface ReferralSectionProps {
  user: User | null;
}

const ReferralSection: React.FC<ReferralSectionProps> = ({ user }) => {
  const { 
    referralLink, 
    referralUsers, 
    isLoadingReferrals, 
    setAlert,
    tokenPrice
  } = useData();
  
  const [showDetail, setShowDetail] = useState<number | null>(null);
  const [shareModal, setShareModal] = useState({ isOpen: false, platform: null as string | null });
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 5;

  const totalReferrals = user?.referrals?.length || 0;
  const totalReferralEarning = user?.totalReferralEarningUsd || 0;

  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = referralUsers.slice(startIndex, endIndex);

  const getRegistrationDate = (objectId: string) => {
    const timestamp = objectId.toString().substring(0, 8);
    const date = new Date(parseInt(timestamp, 16) * 1000);
    return date;
  };

  const formatRegistrationDate = (objectId: string) => {
    const date = getRegistrationDate(objectId);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    setAlert({ message: "Referral link copied to clipboard!", type: "success" });
  };

  const copyMessageToClipboard = (messageType: 'casual' | 'professional') => {
    
    const messages = {
      casual: "Hey, I've been earning crypto on bullfaucet by completing simple tasks. Join me and start earning BULLFI token today. 🚀",
      professional: "Discover BullFaucet - a legitimate platform for earning crypto (BULLFI tokens), through surveys, offers, and tasks. Passive income opportunity with great potential."
    };
    
    navigator.clipboard.writeText(messages[messageType]);
    setAlert({ 
      message: `${messageType.charAt(0).toUpperCase() + messageType.slice(1)} message copied!`, 
      type: "success" 
    });
  };

  const openShareModal = (platform: string) => {
    setShareModal({ isOpen: true, platform });
  };

  const closeShareModal = () => {
    setShareModal({ isOpen: false, platform: null });
  };

const handleShare = (fullText: string) => {
  const encodedText = encodeURIComponent(fullText);
  const encodedLink = encodeURIComponent(referralLink);
  
  if (!shareModal.platform) return;
  
  switch (shareModal.platform) {
    case 'facebook':
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedLink}&quote=${encodedText}`, '_blank');
      break;
    case 'twitter':
      window.open(`https://twitter.com/intent/tweet?text=${encodedText}`, '_blank');
      break;
    case 'whatsapp':
      window.open(`https://wa.me/?text=${encodedText}`, '_blank');
      break;
    case 'telegram':
      window.open(`https://t.me/share/url?url=${encodedLink}&text=${encodeURIComponent(fullText.split('\n\n')[0])}`, '_blank');
      break;
    default:
      break;
  }
  
  // Format platform name with safe navigation
  const platformName = shareModal.platform.charAt(0).toUpperCase() + shareModal.platform.slice(1);
  
  setAlert({ 
    message: `Sharing to ${platformName}...`, 
    type: "success" 
  });
  closeShareModal();
};

  const nextPage = () => {
    if (endIndex < referralUsers.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-bull-orange/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <Users className="w-10 h-10 text-bull-orange" />
        </div>
        <h2 className="text-4xl font-display font-bold">Affiliate Program</h2>
        <p className="text-zinc-400 max-w-lg mx-auto">
          Earn passive income by referring friends to BullFaucet. Get <span className="text-bull-orange font-bold">10% commission</span> on their earnings and <span className="text-bull-orange font-bold">5%</span> on their ad spending.
        </p>
      </div>

      {/* Stats Dashboard */}
      <div className="p-8 rounded-[2.5rem] glass space-y-6">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Users size={20} className="text-bull-orange" />
          Your Performance
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-6 rounded-3xl bg-white/5 border border-white/5 text-center">
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Total Referrals</p>
            <p className="text-3xl font-display font-bold">{totalReferrals.toLocaleString()}</p>
          </div>
          <div className="p-6 rounded-3xl bg-white/5 border border-white/5 text-center">
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Earnings</p>
            <p className="text-3xl font-display font-bold text-emerald-400">
              ${totalReferralEarning.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 3 })}
            </p>
          </div>
          <div className="p-6 rounded-3xl bg-white/5 border border-white/5 text-center">
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Commission Rate</p>
            <p className="text-3xl font-display font-bold">10%</p>
          </div>
        </div>
      </div>

      {/* Referral Link */}
      <div className="p-8 rounded-[2.5rem] glass space-y-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Copy size={20} className="text-bull-orange" />
          Your Referral Link
        </h3>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            readOnly
            value={referralLink}
            className="flex-1 bg-bull-dark border border-white/10 rounded-2xl px-6 py-3 font-mono text-sm focus:outline-none truncate"
          />
          <button 
            onClick={copyReferralLink}
            className="px-6 py-3 bg-bull-orange rounded-2xl font-bold hover:bg-orange-600 transition-colors whitespace-nowrap flex items-center justify-center gap-2"
          >
            <Copy size={16} />
            Copy Link
          </button>
        </div>
      </div>

      {/* Social Sharing */}
      <div className="p-8 rounded-[2.5rem] glass space-y-6">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Share2 size={20} className="text-bull-orange" />
          Share On Social Media
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => openShareModal('facebook')}
            className="p-4 rounded-xl bg-[#1877f2]/10 hover:bg-[#1877f2]/20 transition-all flex flex-col items-center gap-2 group"
          >
            <Facebook size={24} className="text-[#1877f2]" />
            <span className="text-xs font-bold">Facebook</span>
          </button>

          <button
            onClick={() => openShareModal('twitter')}
            className="p-4 rounded-xl bg-black/30 hover:bg-black/50 transition-all flex flex-col items-center gap-2 group"
          >
            <Twitter size={24} className="text-white" />
            <span className="text-xs font-bold">X (Twitter)</span>
          </button>

          <button
            onClick={() => openShareModal('whatsapp')}
            className="p-4 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 transition-all flex flex-col items-center gap-2 group"
          >
            <MessageCircle size={24} className="text-[#25D366]" />
            <span className="text-xs font-bold">WhatsApp</span>
          </button>

          <button
            onClick={() => openShareModal('telegram')}
            className="p-4 rounded-xl bg-[#0088cc]/10 hover:bg-[#0088cc]/20 transition-all flex flex-col items-center gap-2 group"
          >
            <Send size={24} className="text-[#0088cc]" />
            <span className="text-xs font-bold">Telegram</span>
          </button>
        </div>

        <div className="space-y-4">
          <h4 className="font-bold">Pre-written Messages</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="font-bold mb-2">Casual Message</p>
              <p className="text-sm text-zinc-400 mb-3 line-clamp-2">
                Hey, I've been earning crypto on bullfaucet by completing simple tasks. Join me and start earning BULLFI token today. 🚀
              </p>
              <button
                onClick={() => copyMessageToClipboard('casual')}
                className="w-full py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all text-sm font-bold"
              >
                Copy Message
              </button>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="font-bold mb-2">Professional Message</p>
              <p className="text-sm text-zinc-400 mb-3 line-clamp-2">
                Discover BullFaucet - a legitimate platform for earning crypto (BULLFI tokens), through surveys, offers, and tasks. Passive income opportunity with great potential.
              </p>
              <button
                onClick={() => copyMessageToClipboard('professional')}
                className="w-full py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all text-sm font-bold"
              >
                Copy Message
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Referrals List */}
      <div className="p-8 rounded-[2.5rem] glass space-y-6">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Users size={20} className="text-bull-orange" />
          Your Referrals
        </h3>

        {isLoadingReferrals ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-bull-orange border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-zinc-400">Loading referrals...</p>
          </div>
        ) : referralUsers.length > 0 ? (
          <div className="space-y-3">
            {currentUsers.map((referral, index) => (
              <div key={index} className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={referral.profileImage || "/abstract.jpg"}
                      alt={referral.name}
                      className="w-10 h-10 rounded-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/abstract.jpg";
                      }}
                    />
                    <div>
                      <p className="font-bold">{referral.name}</p>
                      <p className="text-xs text-zinc-500">
                        Joined {formatRegistrationDate(referral._id)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowDetail(showDetail === index ? null : index)}
                    className="w-8 h-8 rounded-full glass flex items-center justify-center hover:bg-white/10 transition-all"
                  >
                    {showDetail === index ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                  </button>
                </div>

                {showDetail === index && (
                  <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-[10px] text-zinc-500 font-bold uppercase">Earned</p>
                      <p className="font-bold">${(referral.earnings * tokenPrice).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-zinc-500 font-bold uppercase">Spent</p>
                      <p className="font-bold">${(referral.spendings * tokenPrice).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-zinc-500 font-bold uppercase">Commission</p>
                      <p className="font-bold text-emerald-400">${(referral.commissions * tokenPrice).toLocaleString()}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Pagination */}
            {referralUsers.length > itemsPerPage && (
              <div className="flex items-center justify-between pt-4">
                <button
                  onClick={prevPage}
                  disabled={currentPage === 0}
                  className="w-8 h-8 rounded-full glass flex items-center justify-center hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronUp size={16} className="rotate-90" />
                </button>
                <span className="text-sm text-zinc-400">
                  Page {currentPage + 1} of {Math.ceil(referralUsers.length / itemsPerPage)}
                </span>
                <button
                  onClick={nextPage}
                  disabled={endIndex >= referralUsers.length}
                  className="w-8 h-8 rounded-full glass flex items-center justify-center hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronDown size={16} className="rotate-90" />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <Users size={48} className="mx-auto mb-4 text-zinc-600" />
            <p className="text-zinc-400">You don't have any referrals yet.</p>
            <p className="text-sm text-zinc-500 mt-2">
              Share your referral link to start earning passive income!
            </p>
          </div>
        )}
      </div>

      {/* Program Rules */}
      <div className="p-8 rounded-[2.5rem] glass space-y-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Users size={20} className="text-bull-orange" />
          Program Rules
        </h3>

        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-emerald-400 text-xs">✓</span>
            </div>
            <p className="text-sm text-zinc-300">
              Earn <span className="text-emerald-400 font-bold">10% commission</span> on all referral earnings from offers, surveys, PTC, and faucet spin.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-emerald-400 text-xs">✓</span>
            </div>
            <p className="text-sm text-zinc-300">
              Earn <span className="text-emerald-400 font-bold">5% commission</span> on all ad spending by your referrals.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-emerald-400 text-xs">✓</span>
            </div>
            <p className="text-sm text-zinc-300">
              Commissions are paid instantly in BULLFI tokens.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-red-400 text-xs">✗</span>
            </div>
            <p className="text-sm text-zinc-300">
              Self referrals and fake accounts are strictly prohibited.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-red-400 text-xs">✗</span>
            </div>
            <p className="text-sm text-zinc-300">
              Spam or misleading promotional content is not allowed.
            </p>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="p-8 rounded-[2.5rem] glass space-y-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Users size={20} className="text-bull-orange" />
          Frequently Asked Questions
        </h3>

        <div className="space-y-4">
          <div>
            <p className="font-bold mb-1">How quickly do I receive commissions?</p>
            <p className="text-sm text-zinc-400">
              Commissions are credited to your account instantly when your referrals complete tasks or spend on ads.
            </p>
          </div>
          <div>
            <p className="font-bold mb-1">Is there a limit to how much I can earn?</p>
            <p className="text-sm text-zinc-400">
              No, there is no limit! The more active referrals you have, the more you can earn.
            </p>
          </div>
          <div>
            <p className="font-bold mb-1">Can I track my referrals activities?</p>
            <p className="text-sm text-zinc-400">
              Yes, you can see anonymized data about your referrals' earnings and spendings in your dashboard.
            </p>
          </div>
          <div>
            <p className="font-bold mb-1">What happens if my referral becomes inactive?</p>
            <p className="text-sm text-zinc-400">
              You will still earn from their past activities, but no new commissions until they become active again.
            </p>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={shareModal.isOpen}
        platform={shareModal.platform}
        onClose={closeShareModal}
        onShare={handleShare}
        referralLink={referralLink}
      />
    </div>
  );
};

export default ReferralSection;