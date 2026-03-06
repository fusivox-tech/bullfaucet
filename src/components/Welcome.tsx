import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sprout, Users, BadgeDollarSign, Rocket } from 'lucide-react';

interface Slide {
  title: string;
  description: string;
}

interface IconSlide extends Slide {
  icon: React.ReactElement;
  isAuthSlide?: never;
}

interface AuthSlide extends Slide {
  isAuthSlide: boolean;
  icon?: never;
}

type MobileSlide = IconSlide | AuthSlide;

export const Welcome = ({ onLogin, onRegister }: { onLogin: () => void, onRegister: () => void }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const slideContainerRef = useRef<HTMLDivElement>(null);
  
  const slides: IconSlide[] = [
    {
      title: "Earn Free Coins",
      description: "View PTC ads, and complete offers to earn BTC, BNB, SOL, XRP, and BULLFI directly to your wallet.",
      icon: <BadgeDollarSign className="w-20 h-20 text-bull-orange mb-6" />
    },
    {
      title: "Yield Farming",
      description: "Stake your crypto assets in our specialized yield farming program to generate passive daily returns and grow your portfolio.",
      icon: <Sprout className="w-20 h-20 text-emerald-400 mb-6" />
    },
    {
      title: "Referral & Earn",
      description: "Invite friends and earn a massive 10% commission on all their faucet claims, PTC ads, and completed offers.",
      icon: <Users className="w-20 h-20 text-blue-400 mb-6" />
    }
  ];

  const mobileSlides: MobileSlide[] = [
    ...slides,
    {
      title: "Get Started Now",
      description: "Join our smart users earning premium crypto rewards every day.",
      icon: <Rocket className="w-20 h-20 text-bull-orange mb-6" /> 
    }
  ];

  // Minimum swipe distance required
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe && currentSlide < mobileSlides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
    if (isRightSwipe && currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  return (
    <div className="min-h-screen bg-bull-dark flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-bull-orange/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-600/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="w-full max-w-6xl z-10">
        <div className="text-center mb-12">
          <div className="flex items-center gap-2 mx-auto my-4 justify-center mr-1 mb-6">
            <img src="https://res.cloudinary.com/danuehpic/image/upload/v1771869815/logo_tflaaq.png" alt="BullFaucet Logo" className="h-10 object-contain" referrerPolicy="no-referrer" />
            <img src="https://res.cloudinary.com/danuehpic/image/upload/v1772546097/justword_qjbquu.png" alt="BullFaucet Wordmark" className="h-6 object-contain" referrerPolicy="no-referrer" />
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-bold mb-6">Premium Crypto Rewards</h1>
          <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto">The most rewarding platform to earn, stake, and multiply your crypto assets.</p>
        </div>

        {/* Desktop View */}
        <div className="hidden md:grid grid-cols-3 gap-8 mb-16">
          {slides.map((slide, idx) => (
            <div key={idx} className="p-8 rounded-[2rem] glass flex flex-col items-center text-center hover:border-bull-orange/30 transition-colors">
              {slide.icon}
              <h3 className="text-2xl font-display font-bold mb-4">{slide.title}</h3>
              <p className="text-zinc-400 leading-relaxed">{slide.description}</p>
            </div>
          ))}
        </div>

        {/* Mobile View */}
        <div className="md:hidden">
          <div 
            ref={slideContainerRef}
            className="relative h-[350px] mb-6"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 p-8 rounded-[2rem] glass flex flex-col items-center text-center justify-center"
              >
                {'icon' in mobileSlides[currentSlide] && mobileSlides[currentSlide].icon}
                <h3 className="text-2xl font-display font-bold mb-4">{mobileSlides[currentSlide].title}</h3>
                <p className="text-zinc-400 leading-relaxed">{mobileSlides[currentSlide].description}</p>
              </motion.div>
            </AnimatePresence>
            
            {/* Slide Indicators */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
              {mobileSlides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                    currentSlide === idx ? 'bg-bull-orange w-6' : 'bg-white/20'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Action Buttons - Always visible on mobile */}
          <div className="w-full flex flex-col gap-3 mt-4">
            <button 
              onClick={onRegister}
              className="w-full py-4 rounded-2xl bg-bull-orange text-white font-bold text-lg hover:bg-orange-600 transition-all shadow-lg shadow-bull-orange/20"
            >
              Start Earning
            </button>
            <button 
              onClick={onLogin}
              className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 font-bold text-lg transition-all"
            >
              Log In
            </button>
          </div>
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex w-full flex-col sm:flex-row gap-4 max-w-md mx-auto">
          <button 
            onClick={onLogin}
            className="flex-1 py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 font-bold text-lg transition-all"
          >
            Log In
          </button>
          <button 
            onClick={onRegister}
            className="flex-1 py-4 rounded-2xl bg-bull-orange text-white font-bold text-lg hover:bg-orange-600 transition-all shadow-lg shadow-bull-orange/20"
          >
            Create Account
          </button>
        </div>
      </div>
    </div>
  );
};