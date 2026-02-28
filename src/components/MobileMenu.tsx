// components/MobileMenu.tsx
import { motion } from 'motion/react';
import { 
  LayoutDashboard, 
  Droplets, 
  MousePointer2, 
  Briefcase, 
  Sprout, 
  Users, 
  User as UserIcon,
  PlusSquare,
  Gift,
  X,
  Megaphone
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  setActiveTab: (t: string) => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ 
  isOpen, 
  onClose, 
  activeTab, 
  setActiveTab, 
}) => {
  const navigate = useNavigate();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'faucet', label: 'Faucet Spin', icon: Droplets },
    { id: 'ptc', label: 'PTC Ads', icon: MousePointer2 },
    { id: 'offers', label: 'Offers', icon: Briefcase },
    { id: 'offerwalls', label: 'Offerwalls', icon: Gift },
    { id: 'farm', label: 'Yield Farm', icon: Sprout },
    { id: 'referrals', label: 'Referrals', icon: Users },
    { id: 'create-ad', label: 'Create Ad', icon: PlusSquare },
    { id: 'my-ads', label: 'My Ads', icon: Megaphone },
    { id: 'contest', label: 'Daily Contest', icon: Gift },
  ];

  const handleItemClick = (id: string) => {
    navigate(`/${id}`);
    setActiveTab(id);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] lg:hidden"
      >
        <div className="absolute inset-0 bg-bull-dark/80 backdrop-blur-sm" onClick={onClose} />
        <motion.div 
          initial={{ x: '-100%' }}
          animate={{ x: 0 }}
          exit={{ x: '-100%' }}
          className="absolute left-0 top-0 bottom-0 w-72 bg-bull-dark border-r border-white/10 p-6 flex flex-col gap-4 overflow-y-auto scrollbar-hide"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <img 
                onClick={() => handleItemClick('dashboard')} 
                src="https://res.cloudinary.com/danuehpic/image/upload/v1771869182/wordmark_pynw6f.png" 
                alt="Bull Faucet" 
                className="h-8 object-contain cursor-pointer" 
                referrerPolicy="no-referrer" 
              />
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Main Menu Items */}
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className={`flex items-center gap-3 px-4 py-4 rounded-xl transition-all duration-200 ${
                activeTab === item.id 
                  ? 'bg-bull-orange text-white' 
                  : 'text-zinc-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
          
        </motion.div>
      </motion.div>
    </>
  );
};

export default MobileMenu;