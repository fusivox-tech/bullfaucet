import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowDownCircle,
  ArrowUpCircle,
  Droplets, 
  MousePointer2, 
  Briefcase, 
  Sprout, 
  Menu,
  Gift,
  ChevronDown,
  Users
} from 'lucide-react';
import { Bell } from 'lucide-react';
import { useData } from '../contexts/DataContext';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (t: string) => void;
  onMenuOpen: () => void;
  onDeposit: () => void;
  onWithdraw: () => void;
  isScrolled: boolean;
  setIsNoteOpen: (show: boolean) => void;
}

const Navbar: React.FC<NavbarProps> = ({ 
  activeTab, 
  setActiveTab, 
  onMenuOpen, 
  onDeposit, 
  onWithdraw, 
  isScrolled,
  setIsNoteOpen,
}) => {
  const [isEarnDropdownOpen, setIsEarnDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { unreadCount } = useData();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsEarnDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const earnMenuItems = [
    { id: 'faucet', label: 'Faucet Spin', icon: Droplets },
    { id: 'ptc', label: 'PTC Ads', icon: MousePointer2 },
    { id: 'offers', label: 'Offers', icon: Briefcase },
    { id: 'farm', label: 'Yield Farm', icon: Sprout },
    { id: 'offerwalls', label: 'Offerwalls', icon: Gift },
    { id: 'referrals', label: 'Referrals', icon: Users },
  ];

  const otherMenuItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'contest', label: 'Daily Contest' },
    { id: 'create-ad', label: 'Create Ad' },
    { id: 'profile', label: 'Profile' },
  ];

  const handleEarnItemClick = (id: string) => {
    setActiveTab(id);
    setIsEarnDropdownOpen(false);
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 h-16 z-50 flex items-center justify-between px-7 md:px-10 ${isScrolled ? 'glass py-6' : 'py-12'}`} style={{transition: 'padding 0.3s ease-in-out'}}>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <img 
              onClick={() => setActiveTab('dashboard')} 
              src="https://res.cloudinary.com/danuehpic/image/upload/v1771869182/wordmark_pynw6f.png" 
              alt="Bull Faucet" 
              className="h-8 object-contain cursor-pointer" 
              referrerPolicy="no-referrer" 
            />
          </div>
          
          <div className="hidden md:flex items-center gap-1">
            {otherMenuItems.slice(0, 1).map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3 py-1.5 transition-all duration-200 font-bold md:text-[12px] ${
                  activeTab === item.id 
                    ? 'text-bull-orange' 
                    : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
            {/* Earn Crypto Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsEarnDropdownOpen(!isEarnDropdownOpen)}
                className={`flex items-center gap-1 px-3 py-1.5 transition-all duration-200 font-bold md:text-[12px] ${
                  earnMenuItems.some(item => item.id === activeTab)
                    ? 'text-bull-orange' 
                    : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span>Earn Crypto</span>
                <ChevronDown 
                  className={`w-3 h-3 transition-transform duration-200 ${
                    isEarnDropdownOpen ? 'rotate-180' : ''
                  }`} 
                />
              </button>

              {/* Dropdown Menu */}
              {isEarnDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-[#15191f] rounded-xl overflow-hidden border border-white/10 shadow-xl">
                  {earnMenuItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleEarnItemClick(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-200 text-sm font-bold ${
                        activeTab === item.id
                          ? 'bg-bull-orange text-white' 
                          : 'text-zinc-400 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Other Menu Items */}
            {otherMenuItems.slice(1).map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3 py-1.5 transition-all duration-200 font-bold md:text-[12px] ${
                  activeTab === item.id 
                    ? 'text-bull-orange' 
                    : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-4 md:gap-2">
            <button 
              onClick={onDeposit}
              className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all text-xs font-bold"
            >
              <ArrowDownCircle className="w-4 h-4" />
              Deposit
            </button>
            <button 
              onClick={onWithdraw}
              className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-bull-orange/10 text-bull-orange border border-bull-orange/20 hover:bg-bull-orange/20 transition-all text-xs font-bold"
            >
              <ArrowUpCircle className="w-4 h-4" />
              Withdraw
            </button>
          </div>
          <button
            onClick={() => setIsNoteOpen(true)}
            className="relative p-2 hover:bg-white/5 rounded-xl transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-bull-orange rounded-full text-[10px] flex items-center justify-center font-bold">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          <button 
            onClick={onMenuOpen}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors md:hidden"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </nav>
    </>
  );
};

export default Navbar;