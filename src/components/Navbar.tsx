// components/Navbar.tsx
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
  Users,
  Megaphone,
  PlusSquare
} from 'lucide-react';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const [isEarnDropdownOpen, setIsEarnDropdownOpen] = useState(false);
  const [isAdvertiseDropdownOpen, setIsAdvertiseDropdownOpen] = useState(false);
  const earnDropdownRef = useRef<HTMLDivElement>(null);
  const advertiseDropdownRef = useRef<HTMLDivElement>(null);
  const { unreadCount, user } = useData();

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (earnDropdownRef.current && !earnDropdownRef.current.contains(event.target as Node)) {
        setIsEarnDropdownOpen(false);
      }
      if (advertiseDropdownRef.current && !advertiseDropdownRef.current.contains(event.target as Node)) {
        setIsAdvertiseDropdownOpen(false);
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

  const advertiseMenuItems = [
    { id: 'create-ad', label: 'Create Ad', icon: PlusSquare },
    { id: 'my-ads', label: 'My Ads', icon: Megaphone },
  ];

  const handleEarnItemClick = (id: string) => {
    navigate(`/${id}`);
    setActiveTab(id);
    setIsEarnDropdownOpen(false);
  };

  const handleAdvertiseItemClick = (id: string) => {
    navigate(`/${id}`);
    setActiveTab(id);
    setIsAdvertiseDropdownOpen(false);
  };

  const handleLogoClick = () => {
    navigate('/dashboard');
    setActiveTab('dashboard');
  };

  const handleDashboardClick = () => {
    navigate('/dashboard');
    setActiveTab('dashboard');
  };

  const handleContestClick = () => {
    navigate('/contest');
    setActiveTab('contest');
  };

  const handleProfileClick = () => {
    navigate('/profile');
    setActiveTab('profile');
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 h-16 z-50 flex items-center justify-between px-7 md:px-10 ${isScrolled ? 'glass py-6' : 'py-12'}`} style={{transition: 'padding 0.3s ease-in-out'}}>
        <div className="flex w-full items-center justify-between gap-0">
          <div className="flex items-center gap-2">
            <img 
              onClick={handleLogoClick}
              src="https://res.cloudinary.com/danuehpic/image/upload/v1771869182/wordmark_pynw6f.png" 
              alt="Bull Faucet" 
              className="h-8 object-contain cursor-pointer" 
              referrerPolicy="no-referrer" 
            />
          </div>
          
          <div className="hidden md:flex items-center gap-1">
            {/* Dashboard */}
            <button
              onClick={handleDashboardClick}
              className={`flex items-center gap-2 px-3 py-1.5 transition-all duration-200 font-bold md:text-[12px] ${
                activeTab === 'dashboard' 
                  ? 'text-bull-orange' 
                  : 'text-zinc-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              Dashboard
            </button>
            
            {/* Earn Crypto Dropdown */}
            <div className="relative" ref={earnDropdownRef}>
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

              {/* Earn Dropdown Menu */}
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

            {/* Advertise Dropdown */}
            <div className="relative" ref={advertiseDropdownRef}>
              <button
                onClick={() => setIsAdvertiseDropdownOpen(!isAdvertiseDropdownOpen)}
                className={`flex items-center gap-1 px-3 py-1.5 transition-all duration-200 font-bold md:text-[12px] ${
                  advertiseMenuItems.some(item => item.id === activeTab)
                    ? 'text-bull-orange' 
                    : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span>Advertise</span>
                <ChevronDown 
                  className={`w-3 h-3 transition-transform duration-200 ${
                    isAdvertiseDropdownOpen ? 'rotate-180' : ''
                  }`} 
                />
              </button>

              {/* Advertise Dropdown Menu */}
              {isAdvertiseDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-[#15191f] rounded-xl overflow-hidden border border-white/10 shadow-xl">
                  {advertiseMenuItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleAdvertiseItemClick(item.id)}
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

            {/* Daily Contest */}
            <button
              onClick={handleContestClick}
              className={`flex items-center gap-2 px-3 py-1.5 transition-all duration-200 font-bold md:text-[12px] ${
                activeTab === 'contest' 
                  ? 'text-bull-orange' 
                  : 'text-zinc-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              Daily Contest
            </button>

          </div>
          <div className="flex items-center gap-2">
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
            className="relative p-2 hover:bg-white/5 rounded-xl transition-colors md:pr-0 md:mr-0"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-bull-orange rounded-full text-[10px] flex items-center justify-center font-bold">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          
          {/* Profile */}
            <button
              onClick={handleProfileClick}
              className={`flex items-center gap-2 px-0 transition-all duration-200 font-bold md:text-[12px] ${
                activeTab === 'profile' 
                  ? 'text-bull-orange' 
                  : 'text-zinc-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-bull-orange/20 overflow-hidden border-1 border-zinc-600">
            <img 
              src={user?.profileImage || "/avatar/other/other1.jpg"} 
              alt="Profile" 
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/avatar/other/other1.jpg";
              }}
            />
          </div>
            </button>
          <button 
            onClick={onMenuOpen}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors md:hidden"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;