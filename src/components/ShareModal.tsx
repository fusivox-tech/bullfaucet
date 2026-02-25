import React, { useState } from 'react';
import { X } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  platform: string | null;
  onClose: () => void;
  onShare: (message: string) => void;
  referralLink: string;
}

const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  platform,
  onClose,
  onShare,
  referralLink
}) => {
  const [selectedMessage, setSelectedMessage] = useState('casual');
  const [customMessage, setCustomMessage] = useState('');

  const messages = {
    casual: "Hey, I've been earning crypto on bullfaucet by completing simple tasks. Join me and start earning BULLFI token today. 🚀",
    professional: "Discover BullFaucet - a legitimate platform for earning crypto (BULLFI tokens), through surveys, offers, and tasks. Passive income opportunity with great potential."
  };

  const getShareMessage = () => {
    if (selectedMessage === "custom") {
      return customMessage;
    }
    return messages[selectedMessage as keyof typeof messages];
  };

  const getFullShareText = () => {
    const message = getShareMessage();
    return `${message}\n\nJoin now: ${referralLink}`;
  };

  const handleShare = () => {
    const fullText = getFullShareText();
    onShare(fullText);
  };

  if (!isOpen || !platform) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
      <div className="max-w-lg w-full rounded-3xl glass border border-white/10 overflow-hidden overflow-y-auto scrollbar-hide max-h-[90%]">
        <div className="flex sticky top-0 bg-[#20242a] items-center justify-between p-6 border-b border-white/10">
          <h3 className="text-xl font-bold">
            Share on {platform.charAt(0).toUpperCase() + platform.slice(1)}
          </h3>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full glass flex items-center justify-center hover:bg-white/10 transition-all"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <h4 className="font-bold">Choose your message:</h4>
            
            <div className="space-y-3">
              <label className="flex items-start gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                <input
                  type="radio"
                  name="messageType"
                  value="casual"
                  checked={selectedMessage === "casual"}
                  onChange={(e) => setSelectedMessage(e.target.value)}
                  className="mt-1"
                />
                <div>
                  <p className="font-bold mb-1">Casual Message</p>
                  <p className="text-sm text-zinc-400">{messages.casual}</p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                <input
                  type="radio"
                  name="messageType"
                  value="professional"
                  checked={selectedMessage === "professional"}
                  onChange={(e) => setSelectedMessage(e.target.value)}
                  className="mt-1"
                />
                <div>
                  <p className="font-bold mb-1">Professional Message</p>
                  <p className="text-sm text-zinc-400">{messages.professional}</p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                <input
                  type="radio"
                  name="messageType"
                  value="custom"
                  checked={selectedMessage === "custom"}
                  onChange={(e) => setSelectedMessage(e.target.value)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <p className="font-bold mb-2">Custom Message</p>
                  {selectedMessage === "custom" && (
                    <textarea
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      placeholder="Type your custom message here..."
                      rows={4}
                      className="w-full bg-bull-dark border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-bull-orange transition-colors"
                    />
                  )}
                </div>
              </label>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white/5">
            <h4 className="font-bold mb-2">Preview:</h4>
            <div className="text-sm space-y-2">
              <p className="text-zinc-300">{getShareMessage()}</p>
              <p className="text-bull-orange break-all">Join now: {referralLink}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all font-bold"
            >
              Cancel
            </button>
            <button
              onClick={handleShare}
              disabled={selectedMessage === "custom" && !customMessage.trim()}
              className="flex-1 py-3 rounded-xl bg-bull-orange hover:bg-orange-600 transition-all font-bold disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <i className={`fab fa-${platform}`}></i>
              Share
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;