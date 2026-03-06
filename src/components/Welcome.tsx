import { useState, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import { 
  Sprout, 
  Users, 
  Shield, 
  Zap, 
  ArrowRight,
  CheckCircle,
  Star,
  Coins,
  Gem,
  Sparkles,
  Menu,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Welcome = ({ onLogin, onRegister }: { onLogin: () => void, onRegister: () => void }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  // Parallax scroll effects
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.5]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.98]);

  // Close menu when clicking a link
  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  // Features data
  const features = [
    {
      title: "Offers & Faucets",
      description: "Complete offers, view ads, and claim faucets daily to earn top cryptocurrencies directly to your wallet.",
      icon: <Gem className="w-6 h-6" />,
      gradient: "from-amber-500 to-orange-500",
      lightGradient: "from-amber-500/20 to-orange-500/20",
      textColor: "text-amber-400",
      stats: "0.5-5% daily",
      highlight: "Instant payouts"
    },
    {
      title: "Yield Farming",
      description: "Stake your assets in audited farming pools with competitive APY and flexible lockup periods.",
      icon: <Sprout className="w-6 h-6" />,
      gradient: "from-emerald-500 to-teal-500",
      lightGradient: "from-emerald-500/20 to-teal-500/20",
      textColor: "text-emerald-400",
      stats: "Up to 25% APY",
      highlight: "Upto 356% APR"
    },
    {
      title: "Refer & Earn",
      description: "Invite friends and earn 10% lifetime commission on all their earnings. Track everything in real-time.",
      icon: <Users className="w-6 h-6" />,
      gradient: "from-blue-500 to-indigo-500",
      lightGradient: "from-blue-500/20 to-indigo-500/20",
      textColor: "text-blue-400",
      stats: "10% commission",
      highlight: "Lifetime rewards"
    }
  ];

  // Stats data
  const stats = [
    { value: "50K+", label: "Active Users", icon: <Users className="w-4 h-4" /> },
    { value: "$2.5M+", label: "Total Paid", icon: <Coins className="w-4 h-4" /> },
    { value: "24/7", label: "Instant Payouts", icon: <Zap className="w-4 h-4" /> },
    { value: "100%", label: "Secure", icon: <Shield className="w-4 h-4" /> }
  ];

  // Benefits data - expanded
  const benefits = [
    { category: "Payouts", items: ["Instant withdrawals", "No minimum", "Multi-chain support"] },
    { category: "Security", items: ["Bank-grade encryption", "2FA protection", "Cold storage"] },
    { category: "Platform", items: ["24/7 support", "Real-time tracking", "No hidden fees"] }
  ];

  // Testimonials data
  const testimonials = [
    {
      quote: "Best faucet platform I've used. Daily payouts are consistent and support is amazing.",
      author: "Maryann",
      role: "Verified User",
      rating: 5,
      earnings: "+2.5 BTC earned"
    },
    {
      quote: "The yield farming returns are incredible. Already doubled my portfolio in 3 months.",
      author: "Franz Allen Datu",
      role: "Top Earner",
      rating: 5,
      earnings: "+$45k earned"
    },
    {
      quote: "Referral program is a game-changer. Passive income has never been easier.",
      author: "Amanullah Jakhro",
      role: "Ambassador",
      rating: 5,
      earnings: "500+ referrals"
    }
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white scroll-smooth scrollbar-hide">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-blue-500/5 pointer-events-none" />
      
      {/* Subtle grid */}
      <div className="fixed inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Main content */}
      <div className="relative z-10 scroll-smooth scrollbar-hide">
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b border-white/5">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img 
                src="https://res.cloudinary.com/danuehpic/image/upload/v1771869815/logo_tflaaq.png" 
                alt="BullFaucet Logo" 
                className="h-8 object-contain cursor-pointer" 
                referrerPolicy="no-referrer" 
              />
              <img 
                src="https://res.cloudinary.com/danuehpic/image/upload/v1772546097/justword_qjbquu.png"
                alt="BullFaucet Wordmark" 
                className="h-4 object-contain cursor-pointer" 
                referrerPolicy="no-referrer" 
              />
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-zinc-400 hover:text-white transition-colors">Features</a>
              <a href="#stats" className="text-sm text-zinc-400 hover:text-white transition-colors">Stats</a>
              <a href="#testimonials" className="text-sm text-zinc-400 hover:text-white transition-colors">Testimonials</a>
            </div>

            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <button 
                onClick={onLogin}
                className="px-4 py-2 text-sm text-zinc-300 hover:text-white transition-colors"
              >
                Log in
              </button>
              <button 
                onClick={onRegister}
                className="px-4 py-2 text-sm bg-orange-500 hover:bg-orange-600 rounded-lg font-medium transition-all shadow-lg shadow-orange-500/25"
              >
                Sign up
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
                      href="#features" 
                      onClick={handleLinkClick}
                      className="block py-2 text-zinc-300 hover:text-white transition-colors"
                    >
                      Features
                    </a>
                    <a 
                      href="#stats" 
                      onClick={handleLinkClick}
                      className="block py-2 text-zinc-300 hover:text-white transition-colors"
                    >
                      Stats
                    </a>
                    <a 
                      href="#testimonials" 
                      onClick={handleLinkClick}
                      className="block py-2 text-zinc-300 hover:text-white transition-colors"
                    >
                      Testimonials
                    </a>
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-white/10" />

                  {/* Mobile Auth Buttons */}
                  <div className="space-y-3 pt-2">
                    <button 
                      onClick={() => {
                        onLogin();
                        handleLinkClick();
                      }}
                      className="w-full px-4 py-3 text-sm font-medium text-zinc-300 hover:text-white border border-white/10 rounded-lg hover:bg-white/5 transition-all"
                    >
                      Log in
                    </button>
                    <button 
                      onClick={() => {
                        onRegister();
                        handleLinkClick();
                      }}
                      className="w-full px-4 py-3 text-sm font-medium bg-orange-500 hover:bg-orange-600 rounded-lg transition-all shadow-lg shadow-orange-500/25"
                    >
                      Sign up
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>

        {/* Hero Section */}
        <motion.div 
          ref={heroRef}
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="pt-32 pb-20 px-6"
        >
          <div className="max-w-6xl mt-6 mx-auto">
            <div className="text-center max-w-4xl mx-auto">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-400/10 border border-emerald-400/20 mb-8"
              >
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-medium text-emerald-400">The most rewarding crypto faucet</span>
              </motion.div>

              {/* Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-5xl md:flex md:justify-center md:gap-4 md:text-7xl font-bold mb-6"
              >
                Earn Crypto
                <br />
                <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
                  Everyday
                </span>
              </motion.h1>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-lg md:text-xl text-zinc-400 mb-10 max-w-2xl mx-auto"
              >
                Join our smart users earning BTC, BNB, SOL, and more through faucet claims, 
                yield farming, and our lucrative referral program.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-4 mx-auto justify-center items-center mb-12 max-w-[80%]"
              >
                <button
                  onClick={onRegister}
                  className="group px-8 py-4 bg-orange-500 hover:bg-orange-600 rounded-xl font-semibold text-lg transition-all shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30 flex items-center justify-center gap-2"
                >
                  Start earning now
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={onLogin}
                  className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-semibold text-lg transition-all backdrop-blur-sm"
                >
                  Sign in to dashboard
                </button>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="hidden grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto"
              >
                {stats.map((stat, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center justify-center gap-2 text-orange-400 mb-1">
                      {stat.icon}
                      <span className="text-xl font-bold text-white">{stat.value}</span>
                    </div>
                    <div className="text-xs text-zinc-500">{stat.label}</div>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Features Section */}
        <div id="features" className="py-20 px-6">
          <div className="max-w-7xl mx-auto">
            {/* Section header */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-400/10 border border-blue-400/20 mb-6">
                <Star className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium text-blue-400">Why choose us?</span>
              </div>
              <h2 className="text-4xl md:flex md:justify-center md:gap-4 md:text-5xl font-bold mb-4">
                Multiple Ways
                <br />
                <span className="text-orange-400">To Earn</span>
              </h2>
              <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
                We provide all the tools and opportunities to help you build your crypto portfolio effortlessly.
              </p>
            </div>

            {/* Features Grid - Professional Layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
              {features.map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  whileHover={{ y: -4 }}
                  className="group relative"
                >
                  {/* Card with gradient border */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="relative p-8 rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 backdrop-blur-sm">
                    {/* Icon with gradient background */}
                    <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.lightGradient} mb-6`}>
                      <div className={feature.textColor}>
                        {feature.icon}
                      </div>
                    </div>

                    {/* Title and stats */}
                    <div className="mb-3">
                      <h3 className="text-2xl font-semibold">{feature.title}</h3>
                    </div>

                    {/* Description */}
                    <p className="text-zinc-400 mb-4">
                      {feature.description}
                    </p>

                    {/* Highlight */}
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className={`w-4 h-4 ${feature.textColor}`} />
                      <span className="text-zinc-300">{feature.highlight}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Benefits Grid - Categorized */}
            <div className="hidden grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {benefits.map((category, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="p-6 rounded-xl bg-white/5 border border-white/10"
                >
                  <h4 className="text-lg font-semibold text-orange-400 mb-4">{category.category}</h4>
                  <ul className="space-y-3">
                    {category.items.map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-zinc-300">
                        <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        <span className="text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Testimonials Section */}
        <div id="testimonials" className="py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Trusted by thousands
              </h2>
              <p className="text-zinc-400 max-w-2xl mx-auto">
                Join the community of successful earners who've already discovered the best way to earn crypto
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="p-6 rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-white/10"
                >
                  {/* Rating */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-orange-400 text-orange-400" />
                    ))}
                  </div>

                  {/* Quote */}
                  <p className="text-zinc-300 mb-4 italic">"{testimonial.quote}"</p>

                  {/* Author and earnings */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{testimonial.author}</p>
                      <p className="hidden text-xs text-zinc-500">{testimonial.role}</p>
                    </div>
                    <span className="hidden text-xs px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {testimonial.earnings}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-20 px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto text-center relative"
          >
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-amber-500/20 blur-3xl rounded-full" />
            
            <div className="relative">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Ready to start earning?
              </h2>
              <p className="text-xl text-zinc-400 mb-8">
                Join thousands of users already building their crypto portfolio one task at a time with BullFaucet
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-[80%] mx-auto">
                <button
                  onClick={onRegister}
                  className="px-8 py-4 bg-orange-500 hover:bg-orange-600 rounded-xl font-semibold text-lg transition-all shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30"
                >
                  Create free account
                </button>
                <button
                  onClick={onLogin}
                  className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-semibold text-lg transition-all"
                >
                  Sign in
                </button>
              </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap items-center justify-center gap-6 mt-12 text-sm text-zinc-500">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>No credit card</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Free to join</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Instant withdrawals</span>
                </div>
              </div>
            </div>
          </motion.div>
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
              <div onClick={() => navigate("/terms")} className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">Terms</div>
              <div onClick={() => navigate("/privacy")} className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">Privacy</div>
              <a href="#" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">Support</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};