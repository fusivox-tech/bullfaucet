// App.jsx
import { motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
    bitcoTasks,
    bitcoTasksLoading,
    dailyActivity,
    
    // Token Prices
    tokenPrice,
    solanaPrice,
    bitcoinPrice,
    binancePrice,
    ripplePrice,
    prices,
    
    // UI State
    activeTab,
    setActiveTab,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
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
    handleWithdraw,
    handleSwap,
    handleOfferComplete,
  } = useData();
  
  const appRef = useRef<HTMLDivElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isNotificationPromptVisible, setIsNotificationPromptVisible] = useState(false);
  const [isNoteOpen, setIsNoteOpen] = useState(false);
  
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
    console.log('Window scroll position:', scrollPosition); // Add this to debug
    setIsScrolled(scrollPosition > 50);
  };

  // Check initial state
  handleScroll();

  window.addEventListener('scroll', handleScroll, { passive: true });

  return () => {
    window.removeEventListener('scroll', handleScroll);
  };
}, []);
  
  const numericBalance = ((user?.bullfiBalance || 0) * tokenPrice) + ((user?.bitcoinBalance || 0) * bitcoinPrice) + ((user?.bnbBalance || 0) * binancePrice) + ((user?.xrpBalance || 0) * ripplePrice) + ((user?.solanaBalance || 0) * solanaPrice);

  // Create formatted string version
  const balance = numericBalance < 0.02 ? 
    numericBalance.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 4 }) : 
    numericBalance.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 });

  if (isCheckingAuth) {
    return <div className="min-h-screen bg-bull-dark flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-bull-orange border-t-transparent rounded-full animate-spin"></div>
    </div>;
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

  return (
    <div 
      ref={appRef} 
      className="min-h-screen bg-bull-dark selection:bg-bull-orange/30 md:pt-13"
    >
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
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'dashboard' && (
            <Dashboard 
              user={user} 
              onDeposit={() => setIsDepositModalOpen(true)} 
              onWithdraw={() => setIsWithdrawModalOpen(true)} 
              onSwap={() => setIsSwapModalOpen(true)}
              prices={prices}
              balance={balance}
            />
          )}
          {activeTab === 'faucet' && (
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
          )}
          {activeTab === 'ptc' && (
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
          )}
          {activeTab === 'farm' && (
            <YieldFarmSection 
              user={user} 
              farms={farms} 
              onLock={handleLock} 
            />
          )}
          {activeTab === 'referrals' && (
            <ReferralSection user={user} />
          )}
          {activeTab === 'offers' && (
            <OffersSection 
              onComplete={handleOfferComplete} 
              onViewDetail={(offer) => {
                setSelectedOffer(offer);
                setIsOfferModalOpen(true);
              }} 
            />
          )}
          {activeTab === 'profile' && <Profile />}
          {activeTab === 'contest' && <DailyContest />}
          {activeTab === 'create-ad' && <CreateAd user={user} />}
          {activeTab === 'offerwalls' && <Offerwalls />}
        </motion.div>
      </main>

      {/* Background Decorative Elements */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-bull-orange/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-600/5 blur-[100px] rounded-full" />
      </div>
    </div>
  );
}

// Wrap with Router at the top level
export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/iframe-task" element={<FullscreenIframe />} />
        <Route path="*" element={<AppContent />} />
      </Routes>
    </Router>
  );
}