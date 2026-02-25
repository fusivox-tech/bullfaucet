import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Sprout, Users, ChevronRight, ChevronLeft } from 'lucide-react';

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
  
  const slides: IconSlide[] = [
    {
      title: "Earn Premium Crypto",
      description: "Complete tasks, PTC ads, and offers to earn BTC, BNB, SOL, XRP, and BULLFI directly to your wallet.",
      icon: <Trophy className="w-20 h-20 text-bull-orange mb-6" />
    },
    {
      title: "Yield Farming",
      description: "Stake your earned assets in our specialized farms to generate passive daily returns and grow your portfolio.",
      icon: <Sprout className="w-20 h-20 text-emerald-400 mb-6" />
    },
    {
      title: "Referral Program",
      description: "Invite friends and earn a massive 10% commission on all their faucet claims, PTC ads, and completed offers.",
      icon: <Users className="w-20 h-20 text-blue-400 mb-6" />
    }
  ];

  const mobileSlides: MobileSlide[] = [
    ...slides,
    {
      title: "Get Started Now",
      description: "Join thousands of users earning premium crypto rewards every day.",
      isAuthSlide: true
    }
  ];

  const nextSlide = () => {
    if (currentSlide < mobileSlides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
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
          <img src="https://res.cloudinary.com/danuehpic/image/upload/v1771869182/wordmark_pynw6f.png" alt="Bull Faucet" className="h-12 object-contain mx-auto mb-4" referrerPolicy="no-referrer" />
          <h1 className="text-4xl md:text-6xl font-display font-bold mb-4">Premium Crypto Rewards</h1>
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
        <div className="md:hidden relative h-[350px] mb-8">
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
              <p className="text-zinc-400 leading-relaxed mb-6">{mobileSlides[currentSlide].description}</p>
              
              {'isAuthSlide' in mobileSlides[currentSlide] && mobileSlides[currentSlide].isAuthSlide && (
                <div className="w-full flex flex-col gap-3 mt-0">
                  <button 
                    onClick={onLogin}
                    className="w-full py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 font-bold transition-all"
                  >
                    Log In
                  </button>
                  <button 
                    onClick={onRegister}
                    className="w-full py-3 rounded-xl bg-bull-orange text-white font-bold hover:bg-orange-600 transition-all shadow-lg shadow-bull-orange/20"
                  >
                    Create Account
                  </button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
          
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
            {mobileSlides.map((_, idx) => (
              <div key={idx} className={`w-2 h-2 rounded-full transition-all ${currentSlide === idx ? 'bg-bull-orange w-6' : 'bg-white/20'}`} />
            ))}
          </div>
        </div>

        {/* Navigation / Actions */}
        <div className="flex flex-col items-center gap-4 max-w-md mx-auto w-full">
          <div className="md:hidden w-full flex gap-4 mb-4">
            <button 
              onClick={prevSlide} 
              disabled={currentSlide === 0}
              className="flex-1 py-4 rounded-2xl glass font-bold disabled:opacity-50 flex items-center justify-center"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={nextSlide} 
              disabled={currentSlide === mobileSlides.length - 1}
              className="flex-1 py-4 rounded-2xl glass font-bold disabled:opacity-50 flex items-center justify-center"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="hidden md:flex w-full flex-col sm:flex-row gap-4 transition-all duration-500">
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
    </div>
  );
};