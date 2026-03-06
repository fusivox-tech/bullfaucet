// components/LegalLayout.tsx
import { useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface LegalLayoutProps {
  children: React.ReactNode;
  title: string;
}

export const LegalLayout = ({ children, title }: LegalLayoutProps) => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogoClick = () => {
    navigate('/');
  };

  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-blue-500/5 pointer-events-none" />
      
      {/* Subtle grid */}
      <div className="fixed inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo - navigates to landing page */}
          <div 
            onClick={handleLogoClick}
            className="flex items-center gap-2 cursor-pointer"
          >
            <img 
              src="https://res.cloudinary.com/danuehpic/image/upload/v1771869815/logo_tflaaq.png" 
              alt="BullFaucet Logo" 
              className="h-8 object-contain" 
              referrerPolicy="no-referrer" 
            />
            <img 
              src="https://res.cloudinary.com/danuehpic/image/upload/v1772546097/justword_qjbquu.png"
              alt="BullFaucet Wordmark" 
              className="h-4 object-contain" 
              referrerPolicy="no-referrer" 
            />
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a href="/#features" className="text-sm text-zinc-400 hover:text-white transition-colors">Features</a>
            <a href="/#stats" className="text-sm text-zinc-400 hover:text-white transition-colors">Stats</a>
            <a href="/#testimonials" className="text-sm text-zinc-400 hover:text-white transition-colors">Testimonials</a>
            <span className="text-sm text-orange-400 font-medium">{title}</span>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <button 
              onClick={() => navigate('/')}
              className="px-4 py-2 text-sm bg-orange-500 hover:bg-orange-600 rounded-lg font-medium transition-all shadow-lg shadow-orange-500/25"
            >
              Back to Home
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-zinc-400 hover:text-white transition-colors"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden overflow-hidden border-t border-white/5 bg-[#0A0A0A]/95 backdrop-blur-xl"
            >
              <div className="px-6 py-4 space-y-4">
                {/* Navigation Links */}
                <div className="space-y-2">
                  <a 
                    href="/#features" 
                    onClick={handleLinkClick}
                    className="block py-2 text-zinc-300 hover:text-white transition-colors"
                  >
                    Features
                  </a>
                  <a 
                    href="/#stats" 
                    onClick={handleLinkClick}
                    className="block py-2 text-zinc-300 hover:text-white transition-colors"
                  >
                    Stats
                  </a>
                  <a 
                    href="/#testimonials" 
                    onClick={handleLinkClick}
                    className="block py-2 text-zinc-300 hover:text-white transition-colors"
                  >
                    Testimonials
                  </a>
                  <div className="py-2 text-orange-400 font-medium">
                    {title}
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-white/10" />

                {/* Mobile Action Button */}
                <div className="space-y-3 pt-2">
                  <button 
                    onClick={() => {
                      navigate('/');
                      handleLinkClick();
                    }}
                    className="w-full px-4 py-3 text-sm font-medium bg-orange-500 hover:bg-orange-600 rounded-lg transition-all shadow-lg shadow-orange-500/25"
                  >
                    Back to Home
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 pt-24">
        {children}
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img 
              src="https://res.cloudinary.com/danuehpic/image/upload/v1771869815/logo_tflaaq.png" 
              alt="BullFaucet" 
              className="h-6 w-6 object-contain"
              referrerPolicy="no-referrer"
            />
            <span className="text-sm text-zinc-500">© 2024 BullFaucet. All rights reserved.</span>
          </div>
          
          <div className="flex items-center gap-6">
            <a href="/terms" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">Terms</a>
            <a href="/privacy" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">Privacy</a>
            <a href="/#support" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
};