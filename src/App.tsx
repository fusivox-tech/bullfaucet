// App.tsx
import { motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useData } from './contexts/DataContext';
import PTCSection from './components/PTCSection';
import Navbar from './components/Navbar';
import MobileMenu from './components/MobileMenu';
import Dashboard from './components/Dashboard';
import FaucetSection from './components/FaucetSection';
import YieldFarmSection from './components/YieldFarmSection';
import OffersSection from './components/OffersSection';
import ReferralSection from './components/ReferralSection';
import { Welcome } from './components/Welcome';
import { LoginModal, RegisterModal } from './components/AuthModals';
import { Profile } from './components/Profile';
import { DailyContest } from './components/DailyContest';
import { Offerwalls } from './components/Offerwalls';
import { CreateAd } from './components/CreateAd';
import OfferDetailModal from './components/OfferDetailModal';
import DepositModal from './components/DepositModal';
import WithdrawModal from './components/WithdrawModal';
import SwapModal from './components/SwapModal';
import FullscreenIframe from './components/FullscreenIframe';
import CustomAlert from "./components/CustomAlert";
import NotificationPrompt from './components/NotificationPrompt'
import Notifications from './components/Notifications';
import MyAds from './components/MyAds';
import LoadingScreen from './components/LoadingScreen';
import { SingleSurvey } from './components/SurveyDisplay';

function AppContent() {
  const {
    // Auth
    isAuthenticated,
    isCheckingAuth,
    handleLoginSuccess,
    checkAuth,
    
    // User Data
    user,
    claims,
    ads,
    farms,
    bitcoTasksLoading,
    
    // Token Prices
    tokenPrice,
    solanaPrice,
    bitcoinPrice,
    binancePrice,
    ripplePrice,
    prices,
    
    // UI State
    showLogin,
    setShowLogin,
    showRegister,
    setShowRegister,
    selectedOffer,
    setSelectedOffer,
    
    // Modal States
    isDepositModalOpen,
    setIsDepositModalOpen,
    isWithdrawModalOpen,
    setIsWithdrawModalOpen,
    isSwapModalOpen,
    setIsSwapModalOpen,
    isOfferModalOpen,
    setIsOfferModalOpen,
    
    // Actions
    handleSpin,
    handleAdComplete,
    handleBitcoTaskComplete,
    handleLock,
    handleHarvest,
    handleWithdraw,
    handleSwap,
    handleOfferComplete,
    
    bitcoTasks,
    dailyActivity,
    transactions,
  } = useData();
  
  const navigate = useNavigate();
  const location = useLocation();
  const appRef = useRef<HTMLDivElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isNotificationPromptVisible, setIsNotificationPromptVisible] = useState(false);
  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const CPX_APP_ID = "27568";
  const userId = localStorage.getItem('userId');
  
  // Get current active tab from path
  const activeTab = location.pathname.slice(1) || 'dashboard';
  
  // Update active tab when navigating
  const setActiveTab = (tab: string) => {
    navigate(`/${tab}`);
  };
  
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const bullFaucetReferrerId = urlParams.get("ref");

    if (bullFaucetReferrerId) {
       localStorage.setItem('bullFaucetReferrerId', bullFaucetReferrerId);
    }
  }, []);
  
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 50);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  const numericBalance = ((user?.bullfiBalance || 0) * tokenPrice) + ((user?.bitcoinBalance || 0) * bitcoinPrice) + ((user?.bnbBalance || 0) * binancePrice) + ((user?.xrpBalance || 0) * ripplePrice) + ((user?.solanaBalance || 0) * solanaPrice);

  const balance = numericBalance < 0.02 ? 
    numericBalance.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 4 }) : 
    numericBalance.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 });

  // Determine if all essential data is loaded
  useEffect(() => {

    const essentialDataLoaded = 
      user !== null &&
      ads !== undefined &&
      farms !== undefined &&
      dailyActivity !== undefined;

    if (essentialDataLoaded) {
      // Add a small delay for smooth transition
      const timer = setTimeout(() => {
        setIsDataLoading(false);
      }, 500);
      
      return () => clearTimeout(timer);
    }

    // Update progress based on what's loaded
    let loadedCount = 0;
    const totalItems = 5; // user, ads, farms, dailyActivity, transactions
    
    if (user) loadedCount++;
    if (ads) loadedCount++;
    if (farms) loadedCount++;
    if (dailyActivity) loadedCount++;
    if (transactions) loadedCount++;
    
    setLoadingProgress((loadedCount / totalItems) * 100);
  }, [isAuthenticated, user, ads, farms, dailyActivity, transactions]);

  // Enhanced auth checking with progress
  if (isCheckingAuth) {
    return (
      <LoadingScreen 
        message=""
      />
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <CustomAlert />
        <Welcome 
          onLogin={() => setShowLogin(true)} 
          onRegister={() => setShowRegister(true)} 
        />
        <LoginModal 
          isOpen={showLogin} 
          onClose={() => setShowLogin(false)} 
          onSwitchToRegister={() => { setShowLogin(false); setShowRegister(true); }}
          onLoginSuccess={handleLoginSuccess}
        />
        <RegisterModal 
          isOpen={showRegister} 
          onClose={() => setShowRegister(false)} 
          onSwitchToLogin={() => { setShowRegister(false); setShowLogin(true); }}
          onRegisterSuccess={handleLoginSuccess}
        />
      </>
    );
  }

  // Show loading screen while data is being fetched
  if (isDataLoading) {
    return (
      <LoadingScreen 
        message={`${Math.round(loadingProgress)}%`}
      />
    );
  }

  return (
    <div 
      ref={appRef} 
      className="min-h-screen bg-bull-dark selection:bg-bull-orange/30 md:pt-13"
    >
      <div style={{ display: "none", flexWrap: 'wrap' }}>
        <div style={{ width: '100%' }}>
          <SingleSurvey appId={CPX_APP_ID} userId={userId} />
        </div>
      </div>
      <CustomAlert />
      <NotificationPrompt 
        isVisible={isNotificationPromptVisible}
        setIsVisible={setIsNotificationPromptVisible}
      />
      <Notifications 
        isOpen={isNoteOpen}
        onClose={() => setIsNoteOpen(false)}
      />
      <Navbar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onMenuOpen={() => setIsMobileMenuOpen(true)} 
        onDeposit={() => setIsDepositModalOpen(true)}
        onWithdraw={() => setIsWithdrawModalOpen(true)}
        isScrolled={isScrolled}
        setIsNoteOpen={setIsNoteOpen}
      />
      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />
      
      <DepositModal 
        isOpen={isDepositModalOpen} 
        onClose={() => setIsDepositModalOpen(false)} 
      />
      <WithdrawModal 
        isOpen={isWithdrawModalOpen} 
        onClose={() => setIsWithdrawModalOpen(false)} 
        user={user}
        onWithdraw={handleWithdraw}
      />
      <OfferDetailModal 
        isOpen={isOfferModalOpen} 
        onClose={() => setIsOfferModalOpen(false)} 
        offer={selectedOffer}
        onStart={handleOfferComplete}
      />
      <SwapModal 
        isOpen={isSwapModalOpen} 
        onClose={() => setIsSwapModalOpen(false)} 
        user={user}
        prices={prices}
        onSwap={handleSwap}
      />

      <main className="pt-24 p-6 md:p-10 max-w-7xl mx-auto">
        <AnimatedRoutes activeTab={activeTab}>
          <Route 
            path="/dashboard" 
            element={
              <Dashboard 
                user={user} 
                onDeposit={() => setIsDepositModalOpen(true)} 
                onWithdraw={() => setIsWithdrawModalOpen(true)} 
                onSwap={() => setIsSwapModalOpen(true)}
                prices={prices}
                balance={balance}
              />
            } 
          />
          <Route 
            path="/faucet" 
            element={
              <FaucetSection 
                user={user} 
                claims={claims} 
                dailyActivity={dailyActivity}
                onSpin={handleSpin}
                setAlert={(message) => {
                  console.log('Alert:', message);
                  alert(message.message);
                }}
                checkAuth={checkAuth}
                tokenPrice={tokenPrice}
                solanaPrice={solanaPrice}
                bitcoinPrice={bitcoinPrice}
                binancePrice={binancePrice}
                ripplePrice={ripplePrice}
              />
            } 
          />
          <Route 
            path="/ptc" 
            element={
              <PTCSection 
                ads={ads}
                bitcoTasks={bitcoTasks}
                user={user}
                onComplete={handleAdComplete}
                onBitcoTaskComplete={handleBitcoTaskComplete}
                checkAuth={checkAuth}
                openRegister={() => setShowRegister(true)}
                tokenPrice={tokenPrice}
                getRewardMultiplier={() => {
                  if (!user?.membership?.level) return 1;
                  switch(user.membership.level) {
                    case 'juniorPartner': return 2;
                    case 'mediumPartner': return 3;
                    case 'seniorPartner': return 4;
                    default: return 1;
                  }
                }}
                bitcoTasksLoading={bitcoTasksLoading}
              />
            } 
          />
          <Route 
            path="/farm" 
            element={
              <YieldFarmSection 
                user={user} 
                farms={farms} 
                onLock={handleLock} 
                onHarvest={handleHarvest}
                onDeposit={() => setIsDepositModalOpen(true)}
              />
            } 
          />
          <Route 
            path="/referrals" 
            element={<ReferralSection user={user} />} 
          />
          <Route 
            path="/offers" 
            element={
              <OffersSection 
                onComplete={handleOfferComplete} 
                onViewDetail={(offer) => {
                  setSelectedOffer(offer);
                  setIsOfferModalOpen(true);
                }} 
              />
            } 
          />
          <Route 
            path="/my-ads" 
            element={<MyAds onCreateAd={() => setActiveTab('create-ad')} />} 
          />
          <Route path="/profile" element={<Profile />} />
          <Route path="/contest" element={<DailyContest />} />
          <Route path="/create-ad" element={<CreateAd user={user} />} />
          <Route path="/offerwalls" element={<Offerwalls />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </AnimatedRoutes>
      </main>

      {/* Background Decorative Elements */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-bull-orange/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-600/5 blur-[100px] rounded-full" />
      </div>
    </div>
  );
}

// Custom wrapper to preserve your animations
const AnimatedRoutes = ({ children, activeTab }: { children: React.ReactNode; activeTab: string }) => {
  return (
    <motion.div
      key={activeTab}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Routes>
        {children}
      </Routes>
    </motion.div>
  );
};

// Wrap with Router at the top level
export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/iframe-task" element={<FullscreenIframe />} />
        <Route path="/*" element={<AppContent />} />
      </Routes>
    </Router>
  );
}