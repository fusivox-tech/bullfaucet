import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import API_BASE_URL from '../config';
import { useCpxSurveys } from '../components/useCpxSurveys';
import { 
  Offer, 
  YieldFarm, 
  FaucetClaim, 
  ReferralUser,
  TodayContest,
  ContestResult,
  UserRank,
  Transaction,
  PendingEarning,
} from '../types';

// Constants
const NETWORK = 'solana';
const POOL_ADDRESS = '1M4GtWkWoZCqGeuYdRN1FLcQmSRvKNvLhz54jRmHM7G';
const API_KEY = "jzd0ze44qn0un9q1cqs7spi130mjtu";
const BITLABS_API_KEY = "ba2926e9-79e9-4618-a141-c906cac15bef";
const WANNADS_API_KEY = "683d4abc953dc543649825";
const WANNADS_API_SECRET = "a87c9e453b";

// Helper function
const getBalanceKey = (coin: string): string => {
  switch (coin.toUpperCase()) {
    case 'BULLFI': return 'bullfiBalance';
    case 'BTC': return 'bitcoinBalance';
    case 'SOL': return 'solanaBalance';
    case 'BNB': return 'bnbBalance';
    case 'XRP': return 'xrpBalance';
    default: return 'bullfiBalance';
  }
};

interface DataContextType {
  // Auth
  isAuthenticated: boolean;
  isCheckingAuth: boolean;
  checkAuth: () => boolean;
  handleLoginSuccess: () => void;
  handleLogout: () => void;
  
  // User Data
  user: any;
  claims: FaucetClaim[];
  ads: any[];
  farms: YieldFarm[];
  offers: Offer[];
  dailyActivity: any;
  
  // Offerwalls Data
  bitlabsOffers: any[];
  bitlabsLoading: boolean;
  bitlabsError: string | null;
  notikOffers: any[];
  notikLoading: boolean;
  notikError: string | null;
  wannadsOffers: any[];
  wannadsLoading: boolean;
  wannadsError: string | null;
  adscendOffers: any[];
  adscendLoading: boolean;
  adscendError: string | null;
  featuredOffers: any[];
  featuredOffersLoading: boolean;
  featuredOffersError: string | null;
  loadingTimeout: boolean;
  setLoadingTimeout: (show: boolean) => void;
  transactionLoaded: boolean;
  
  // Notifications
  notifications: any[];
  setNotifications: React.Dispatch<React.SetStateAction<any[]>>;
  unreadCount: number;
  setUnreadCount: React.Dispatch<React.SetStateAction<number>>;
  isNotificationLoading: boolean;
  setIsNotificationLoading: React.Dispatch<React.SetStateAction<boolean>>;
  fetchNotifications: () => Promise<void>;
  
  // Surveys Data
  surveys: any[];
  cpxLoading: boolean;
  bitlabsSurveys: any[];
  bitlabsSurveyLoading: boolean;
  bitLabsSurveyError: string | null;
  
  // Token Prices
  tokenPrice: number;
  bitcoinPrice: number;
  solanaPrice: number;
  binancePrice: number;
  ripplePrice: number;
  prices: Record<string, number>;
  volumes: Record<string, number>;
  priceChanges: Record<string, number>;
  marketCaps: Record<string, number>;
  
  // Token Data (Market Data)
  tokenData: any;
  solanaData: any;
  bitcoinData: any;
  binanceData: any;
  rippleData: any;
  
  // UI State
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  showLogin: boolean;
  setShowLogin: (show: boolean) => void;
  showRegister: boolean;
  setShowRegister: (show: boolean) => void;
  selectedOffer: Offer | null;
  setSelectedOffer: (offer: Offer | null) => void;
  
  // Modal States
  isDepositModalOpen: boolean;
  setIsDepositModalOpen: (open: boolean) => void;
  isWithdrawModalOpen: boolean;
  setIsWithdrawModalOpen: (open: boolean) => void;
  isSwapModalOpen: boolean;
  setIsSwapModalOpen: (open: boolean) => void;
  isOfferModalOpen: boolean;
  setIsOfferModalOpen: (open: boolean) => void;
  
  // Wallet Modal States
  isInfoModalOpen: boolean;
  setIsInfoModalOpen: (open: boolean) => void;
  isHistoryOpen: boolean;
  setIsHistoryOpen: (open: boolean) => void;
  isPendingOpen: boolean;
  setIsPendingOpen: (open: boolean) => void;
  isWithdrawBullFiOpen: boolean;
  setIsWithdrawBullFiOpen: (open: boolean) => void;
  isWithdrawOptionsOpen: boolean;
  setIsWithdrawOptionsOpen: (open: boolean) => void;
  isDepositOptionsOpen: boolean;
  setIsDepositOptionsOpen: (open: boolean) => void;
  selectedToken: any;
  setSelectedToken: (token: any) => void;
  selectedMethod: any;
  setSelectedMethod: (method: any) => void;
  
  // Transactions
  transactions: Transaction[];
  transactionsLoading: boolean;
  transactionsReady: boolean;
  fetchUserTransactions: () => Promise<void>;
  
  // Pending Earnings
  pendingEarnings?: PendingEarning[];
  
  // Wallet Actions
  handleGenerateWallet: (token: string) => Promise<any>;
  handleReactivateWallet: (token: string) => Promise<any>;
  
  // Actions
  fetchUserData: () => Promise<void>;
  fetchAds: () => Promise<void>;
  fetchDailyActivity: () => Promise<void>;
  handleSpin: (coin: string, roll: string, prize: number) => Promise<void>;
  handleAdComplete: (adId: string, reward: number) => void;
  handleLock: (data: any) => void;
  handleDeposit: (coin: string, amount: number) => void;
  handleWithdraw: (coin: string, amount: number) => void;
  handleSwap: (from: string, to: string, amount: number, receiveAmount: number) => void;
  handleOfferComplete: (offer: Offer) => void;
  calculateTotalUSD: () => number;
  getBalanceKey: (coin: string) => string;
  getAuthHeaders: () => HeadersInit;
  handleAuthError: (error: Error) => boolean;
  
  // Offerwalls Actions
  fetchBitlabsOffers: (signal?: AbortSignal) => Promise<void>;
  fetchNotikOffers: () => Promise<void>;
  fetchWannadsOffers: () => Promise<void>;
  fetchAdscendOffers: () => Promise<void>;
  fetchFeaturedOffers: () => Promise<void>;
  setBitlabsLoading: (loading: boolean) => void;
  setNotikLoading: (loading: boolean) => void;
  setWannadsLoading: (loading: boolean) => void;
  setAdscendLoading: (loading: boolean) => void;
  
  // Surveys Actions
  fetchBitLabsSurveys: () => Promise<void>;
  
  // BitcoTasks
  bitcoTasks: any[];
  bitcoTasksLoading: boolean;
  fetchBitcoTasks: () => Promise<void>;
  handleBitcoTaskComplete: (taskId: string, reward: number) => void;
  
  // Alert
  isAlertActive: boolean;
  handleCloseAlert: () => void;
  alert: { message: string; type: string; };
  setAlert: React.Dispatch<React.SetStateAction<{ message: string; type: string; }>>;
  
  // Farms
  setFarms: React.Dispatch<React.SetStateAction<YieldFarm[]>>;
  fetchActiveFarms: () => Promise<void>;
  handleHarvest: (farmId: number) => Promise<void>;
  
  // Referrals
  referralLink: string;
  setReferralLink: (link: string) => void;
  referralUsers: ReferralUser[];
  isLoadingReferrals: boolean;
  fetchReferralDetails: (referralIds: string[]) => Promise<void>;
  
  // Contest State
  todayContest: TodayContest | null;
  setTodayContest: React.Dispatch<React.SetStateAction<TodayContest | null>>;
  yesterdayWinner: ContestResult | null;
  setYesterdayWinner: React.Dispatch<React.SetStateAction<ContestResult | null>>;
  contestHistory: ContestResult[];
  setContestHistory: React.Dispatch<React.SetStateAction<ContestResult[]>>;
  userRank: UserRank | null;
  setUserRank: React.Dispatch<React.SetStateAction<UserRank | null>>;
  loadingContest: boolean;
  setLoadingContest: React.Dispatch<React.SetStateAction<boolean>>;
  
  // Contest Actions
  fetchContestData: () => Promise<void>;
  toggleContestExpansion: (contestId: string) => void;
  expandedContest: string | null;
  setExpandedContest: React.Dispatch<React.SetStateAction<string | null>>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [alert, setAlert] = useState({ message: "", type: "" });
  const [isAlertActive, setAlertActive] = useState(false);
  
  // Token Market Data
  const [tokenData, setTokenData] = useState<any>({});
  const [solanaData, setSolanaData] = useState<any>({});
  const [bitcoinData, setBitcoinData] = useState<any>({});
  const [binanceData, setBinanceData] = useState<any>({});
  const [rippleData, setRippleData] = useState<any>({});
  
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotificationLoading, setIsNotificationLoading] = useState(true);
  
  // Referrals
  const [referralLink, setReferralLink] = useState("");
  const [referralUsers, setReferralUsers] = useState<ReferralUser[]>([]);
  const [isLoadingReferrals, setIsLoadingReferrals] = useState(true);
  
  // Contest State
  const [todayContest, setTodayContest] = useState<TodayContest | null>(null);
  const [yesterdayWinner, setYesterdayWinner] = useState<ContestResult | null>(null);
  const [contestHistory, setContestHistory] = useState<ContestResult[]>([]);
  const [userRank, setUserRank] = useState<UserRank | null>(null);
  const [loadingContest, setLoadingContest] = useState(true);
  const [expandedContest, setExpandedContest] = useState<string | null>(null);
  
  // UI State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  
  // Modal States
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  
  // Wallet Modal States
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isPendingOpen, setIsPendingOpen] = useState(false);
  const [isWithdrawBullFiOpen, setIsWithdrawBullFiOpen] = useState(false);
  const [isWithdrawOptionsOpen, setIsWithdrawOptionsOpen] = useState(false);
  const [isDepositOptionsOpen, setIsDepositOptionsOpen] = useState(false);
  const [selectedToken, setSelectedToken] = useState<any>(null);
  const [selectedMethod, setSelectedMethod] = useState<any>(null);
  
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  
  // Data States
  const [user, setUser] = useState<any>(null);
  const [claims, setClaims] = useState<FaucetClaim[]>([]);
  const [ads, setAds] = useState<any[]>([]);
  const [farms, setFarms] = useState<YieldFarm[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [bitcoTasks, setBitcoTasks] = useState<any[]>([]);
  const [bitcoTasksLoading, setBitcoTasksLoading] = useState(false);
  const [dailyActivity, setDailyActivity] = useState<any>(null);
  
  // Transactions
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [transactionLoaded, setTransactionLoaded] = useState(false);
  const [transactionsReady, setTransactionsReady] = useState(false);
  
  // Offerwalls States
  const [bitlabsOffers, setBitlabsOffers] = useState<any[]>([]);
  const [bitlabsLoading, setBitlabsLoading] = useState(true);
  const [bitlabsError, setBitlabsError] = useState<string | null>(null);
  
  const [notikOffers, setNotikOffers] = useState<any[]>([]);
  const [notikLoading, setNotikLoading] = useState(false);
  const [notikError, setNotikError] = useState<string | null>(null);
  
  const [wannadsOffers, setWannadsOffers] = useState<any[]>([]);
  const [wannadsLoading, setWannadsLoading] = useState(true);
  const [wannadsError, setWannadsError] = useState<string | null>(null);
  
  const [adscendOffers, setAdscendOffers] = useState<any[]>([]);
  const [adscendLoading, setAdscendLoading] = useState(true);
  const [adscendError, setAdscendError] = useState<string | null>(null);
  
  const [featuredOffers, setFeaturedOffers] = useState<any[]>([]);
  const [featuredOffersLoading, setFeaturedOffersLoading] = useState(true);
  const [featuredOffersError, setFeaturedOffersError] = useState<string | null>(null);
  
  const appId = '27568';
  const userId = localStorage.getItem('userId');
  
  const { surveys, cpxLoading } = useCpxSurveys(appId, userId);
  
  const [bitlabsSurveys, setBitlabsSurveys] = useState<any[]>([]);
  const [bitlabsSurveyLoading, setBitlabsSurveyLoading] = useState(true);
  const [bitLabsSurveyError, setBitLabsSurveyError] = useState<string | null>(null);
  
  // Token Price States
  const [tokenPrice, setTokenPrice] = useState(0.01);
  const [bitcoinPrice, setBitcoinPrice] = useState(0);
  const [solanaPrice, setSolanaPrice] = useState(0);
  const [binancePrice, setBinancePrice] = useState(0);
  const [ripplePrice, setRipplePrice] = useState(0);

  const prices: Record<string, number> = {
    BULLFI: tokenPrice,
    BTC: bitcoinPrice,
    SOL: solanaPrice,
    BNB: binancePrice,
    XRP: ripplePrice
  };
  
  const volumes: Record<string, number> = {
    BULLFI: tokenData?.volume_usd?.h24,
    BTC: bitcoinData?.total_volume,
    SOL: solanaData.total_volume,
    BNB: binanceData.total_volume,
    XRP: rippleData.total_volume,
  }
  
  const priceChanges: Record<string, number> = {
    BULLFI: tokenData.price_change_percentage?.h24,
    BTC: bitcoinData.price_change_percentage_24h,
    SOL: solanaData.price_change_percentage_24h,
    BNB: binanceData.price_change_percentage_24h,
    XRP: rippleData.price_change_percentage_24h,
  }
  
  const marketCaps: Record<string, number> = {
    BULLFI: tokenData.fdv_usd,
    BTC: bitcoinData.market_cap,
    SOL: solanaData.market_cap,
    BNB: binanceData.market_cap,
    XRP: rippleData.market_cap,
  };
  
  // ADD YIELD TIERS CONSTANT HERE
  const YIELD_TIERS = [
    {
      id: 'allotment',
      name: 'Allotment',
      days: 10,
      dailyRate: 0.5,
      apr: 182.5,
      minAmountUsd: 5,
      badge: null,
      description: 'Short-term commitment with moderate yields'
    },
    {
      id: 'homestead',
      name: 'Homestead',
      days: 30,
      dailyRate: 0.6,
      apr: 219,
      minAmountUsd: 10,
      badge: 'popular',
      description: 'Perfect balance of duration and yield'
    },
    {
      id: 'plantation',
      name: 'Plantation',
      days: 90,
      dailyRate: 0.7,
      apr: 255.5,
      minAmountUsd: 15,
      badge: null,
      description: 'Medium-term farm with enhanced rewards'
    },
    {
      id: 'estate',
      name: 'Estate',
      days: 180,
      dailyRate: 0.8,
      apr: 292,
      minAmountUsd: 20,
      badge: null,
      description: 'Substantial commitment for serious farmers'
    },
    {
      id: 'industrial',
      name: 'Industrial Complex',
      days: 270,
      dailyRate: 0.9,
      apr: 328.5,
      minAmountUsd: 25,
      badge: 'best',
      description: 'Premium tier for maximum returns'
    },
    {
      id: 'conglomerate',
      name: 'Conglomerate',
      days: 360,
      dailyRate: 1.0,
      apr: 365,
      minAmountUsd: 30,
      badge: null,
      description: 'Ultimate long-term farming experience'
    }
  ];

  // Helper Functions
  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem("token");
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }, []);
  
  const handleCloseAlert = useCallback(() => {
    setAlertActive(false);
    setAlert({message: '', type: ''});
  }, [setAlertActive]);
  
  useEffect(() => {
    if (alert.message) {
      setAlertActive(true);
      const timer = setTimeout(() => {
        setAlertActive(false);
        setAlert({message: '', type: ''});
      }, 30000);

      return () => clearTimeout(timer);
    }
  }, [alert.message, setAlertActive]);

  const handleAuthError = useCallback((error: Error) => {
    console.error('Authentication error:', error);
    if (error.message.includes('token') || error.message.includes('auth') || 
        error.message.includes('401') || error.message.includes('403')) {
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      setIsAuthenticated(false);
      return true;
    }
    return false;
  }, []);

  const checkAuth = useCallback(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    
    if (!token || !userId) {
      return false;
    }
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const isExpired = payload.exp * 1000 < Date.now();
      
      if (isExpired) {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Token validation error:', error);
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      return false;
    }
  }, []);

  // Utility Functions
  const getUserOS = useCallback(() => {
    const userAgent = window.navigator.userAgent;
    if (/android/i.test(userAgent)) return 'android';
    if (/iPad|iPhone|iPod/.test(userAgent)) return 'ios';
    if (/Win/.test(userAgent)) return 'windows';
    if (/Mac/.test(userAgent)) return 'mac os x';
    if (/Linux/.test(userAgent)) return 'linux';
    return 'unknown';
  }, []);

  const getUserAgent = useCallback(() => {
    return navigator.userAgent;
  }, []);

  const getDeviceType2 = useCallback(() => {
    if ('userAgentData' in navigator) {
      const uaData = (navigator as any).userAgentData;
      return uaData?.mobile ? "Mobile" : "Desktop";
    }
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes("android") || userAgent.includes("iphone")) return "Mobile";
    return "Desktop";
  }, []);

  // Data Fetching Functions
  const fetchUserData = useCallback(async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data);
      } else if (response.status === 401 || response.status === 403) {
        handleAuthError(new Error('Authentication failed'));
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  }, [getAuthHeaders, handleAuthError]);

  const fetchAds = useCallback(async () => {
    try {
      const userId = localStorage.getItem("userId");
      const userDevice = getDeviceType2();
      const headers = getAuthHeaders();

      const response = await fetch(
        `${API_BASE_URL}/tasks/approved-tasks?userId=${userId}&userDevice=${userDevice}`,
        { headers: headers }
      );
      
      const data = await response.json();

      if (response.ok) {
        setAds(data);
      } else if (response.status === 401 || response.status === 403) {
        handleAuthError(new Error('Authentication failed'));
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  }, [getAuthHeaders, handleAuthError, getDeviceType2]);

  const fetchDailyActivity = useCallback(async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/referral/daily-activity/${userId}`, {
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setDailyActivity(data.counts);
        }
      }
    } catch (error) {
      console.error("Error fetching daily activity:", error);
    }
  }, [getAuthHeaders]);

  // BitLabs Offers
  const fetchBitlabsOffers = useCallback(async (signal?: AbortSignal) => {
    const userId = localStorage.getItem("userId") || "68b49f9f66749e91945e6f58";
    
    if (!userId) {
      setBitlabsError("User ID is required");
      return;
    }
    
    try {
      setBitlabsError(null);

      // Get user IP and user agent
      const ipResponse = await fetch('https://api.ipify.org?format=json');
      const ipData = await ipResponse.json();
      const userIp = ipData.ip;

      const userAgent = getUserAgent();
      const userOS = getUserOS();

      // Determine device type
      let deviceType = '';
      if (userOS === 'ios') {
        deviceType = 'iphone';
      } else if (userOS === 'android') {
        deviceType = 'android';
      }

      // Build the request URL
      const baseUrl = 'https://api.bitlabs.ai/v2/client/offers';
      const params = new URLSearchParams();
      
      if (deviceType) {
        params.append('devices', deviceType);
      }
      
      params.append('client_user_agent', userAgent);
      params.append('client_ip', userIp);
      params.append('in_app', 'true');
      params.append('uid', userId);
      
      const tags = `user_id:${userId},platform:${userOS}`;
      params.append('tags', tags);

      const fetchOptions: RequestInit = {
        method: 'GET',
        headers: {
          'User-Agent': userAgent,
          'X-Api-Token': BITLABS_API_KEY,
          'Accept': 'application/json',
        },
      };

      if (signal) {
        fetchOptions.signal = signal;
      }

      const response = await fetch(`${baseUrl}?${params.toString()}`, fetchOptions);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`BitLabs API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      if (data.data && data.data.offers) {
        const transformedOffers = data.data.offers.map((offer: any) => ({
          id: offer.id,
          name: offer.anchor,
          title: offer.anchor,
          description: offer.description,
          image_url: offer.icon_url,
          payout: parseFloat(offer.total_points_promotional || offer.total_points),
          click_url: offer.click_url,
          requirements: offer.requirements,
          categories: offer.categories,
          is_game: offer.app_metadata?.is_game || false,
          total_points: offer.total_points,
          total_points_promotional: offer.total_points_promotional,
          confirmation_time: offer.confirmation_time,
          support_url: offer.support_url,
          events: offer.events,
          screenshots: offer.app_metadata?.screenshot_urls,
          videos: offer.app_metadata?.video_urls,
          epc: offer.epc,
          source: 'BitLabs'
        }));

        setBitlabsOffers(transformedOffers);
      } else {
        setBitlabsOffers([]);
      }

    } catch (error: any) {
      if (error.name === 'AbortError') {
        setBitlabsError('Request was aborted');
        return;
      }
      setBitlabsError(error.message);
      setBitlabsOffers([]);
    } finally {
      setBitlabsLoading(false);
    }
  }, [getUserAgent, getUserOS]);

  // Notik Offers
  const fetchNotikOffers = useCallback(async () => {
    const userId = localStorage.getItem("userId") || "68b49f9f66749e91945e6f58";
    
    try {
      setNotikError(null);
      
      const headers = getAuthHeaders();
      
      // Get user's country
      let userCountry = null;
      try {
        const geoResponse = await fetch('https://api.country.is/');
        if (geoResponse.ok) {
          const geoData = await geoResponse.json();
          userCountry = geoData.country;
        } else {
          const fallbackResponse = await fetch('https://ipapi.co/country/');
          if (fallbackResponse.ok) {
            userCountry = await fallbackResponse.text();
            userCountry = userCountry.trim();
          }
        }
      } catch (error) {
        console.warn('Could not determine user country:', error);
      }

      const response = await fetch(`${API_BASE_URL}/offers/notik/offers?userId=${userId}&maxPayout=500`, {
        headers: headers
      });
      
      if (!response.ok) throw new Error(`Failed to fetch offers: ${response.status}`);
      
      const offers = await response.json();
      
      if (!Array.isArray(offers)) {
        setNotikOffers([]);
        return;
      }

      if (offers.length > 0) {
        const transformedOffers = offers
          .map((offer: any) => {
            let processedClickUrl = offer?.click_url?.replace(/\[user_id\]/g, userId);

            return {
              id: offer.offer_id,
              name: offer.name || 'Unknown Offer',
              title: offer.name || 'Unknown Offer',
              description: offer.description1 || '',
              description2: offer.description2 || '',
              image_url: offer.image_url || '/default-offer.png',
              payout: parseFloat(offer.payout || 0),
              click_url: processedClickUrl,
              original_click_url: offer.click_url,
              requirements: offer.description3,
              categories: offer.categories || [],
              events: offer.events || [],
              source: 'Notik',
              devices: offer.os || [],
              countryCodes: offer.country_code || []
            };
          })
          .filter((offer: any) => {
            if (offer.payout <= 0) return false;
            if (userCountry && offer.countryCodes?.length > 0) {
              const userCountryUpper = userCountry.toUpperCase();
              const offerCountriesUpper = offer.countryCodes.map((code: string) => code.toUpperCase());
              return offerCountriesUpper.includes(userCountryUpper);
            }
            return true;
          });

        setNotikOffers(transformedOffers);
      } else {
        setNotikOffers([]);
      }

    } catch (error: any) {
      console.error('❌ Error:', error);
      setNotikError(error.message);
      setNotikOffers([]);
    } finally {
      setNotikLoading(false);
    }
  }, [getAuthHeaders, getUserOS]);

  // Wannads Offers
  const fetchWannadsOffers = useCallback(async () => {
    const userId = localStorage.getItem("userId") || "68b49f9f66749e91945e6f58";
    
    if (!userId) {
      setWannadsError("User ID is required");
      return;
    }

    try {
      setWannadsError(null);
      
      const ipResponse = await fetch('https://api.ipify.org?format=json');
      const ipData = await ipResponse.json();
      const userIp = ipData.ip;

      const baseUrl = 'https://platform.wannads.com/api/offerwall/offers';
      const params = new URLSearchParams({
        apiKey: WANNADS_API_KEY,
        apiSecret: WANNADS_API_SECRET,
        userId: userId,
        ip: userIp,
      });

      const response = await fetch(`${baseUrl}?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Wannads API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.length > 0) {
        const transformedOffers = data.map((offer: any) => {
          let payout = parseFloat(offer.virtual_currency_value) || 0;
          
          if (offer.goals && offer.goals.length > 0) {
            payout = offer.goals.reduce((total: number, goal: any) => {
              return total + (parseFloat(goal.virtual_currency_value) || 0);
            }, 0);
          }
          
          return {
            id: offer.offer_id,
            name: offer.name,
            title: offer.name,
            description: offer.description,
            image_url: offer.img_url,
            payout: payout,
            click_url: offer.offer_url,
            requirements: offer.requirements,
            categories: offer.categories || [],
            events: offer.goals,
            epc: offer.epc,
            source: 'Wannads'
          };
        });
        
        setWannadsOffers(transformedOffers);
      } else {
        setWannadsError('No offers found in response');
        setWannadsOffers([]);
      }
      
    } catch (error: any) {
      console.error("Wannads fetch error:", error);
      setWannadsError(error.message);
      setWannadsOffers([]);
    } finally {
      setWannadsLoading(false);
    }
  }, []);

  // Adscend Offers
  const fetchAdscendOffers = useCallback(async () => {
    const userId = localStorage.getItem("userId") || "68b49f9f66749e91945e6f58";
    
    if (!userId) {
      return;
    }
    
    try {
      setAdscendError(null);

      const ipResponse = await fetch('https://api.ipify.org?format=json');
      const ipData = await ipResponse.json();
      const userIp = ipData.ip;

      const baseUrl = `https://adscendmedia.com/adwall/api/publisher/116746/profile/20327/offers.json?subid1=${userId}&ip=${userIp}`;
      
      const response = await fetch(baseUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Adscend API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.offers) {
        const transformedOffers = data.offers.map((offer: any) => ({
          id: offer.offer_id,
          name: offer.name,
          title: offer.name,
          description: offer.description,
          image_url: offer.image_url,
          payout: parseFloat(offer.currency_count || offer.currency_count_old),
          click_url: offer.click_url,
          requirements: offer.requirements,
          categories: offer.categories,
          events: offer.events,
          epc: offer.epc,
          source: 'Adscend'
        }));

        setAdscendOffers(transformedOffers);
      } else {
        setAdscendOffers([]);
      }
      
    } catch (error: any) {
      console.error("Adscend fetch error:", error);
      setAdscendError(error.message);
      setAdscendOffers([]);
    } finally {
      setAdscendLoading(false);
    }
  }, []);

  // Featured Offers (BitLabs API)
  const fetchFeaturedOffers = useCallback(async () => {
    try {
      setFeaturedOffersError(null);

      const response = await fetch(`${API_BASE_URL}/offers/offers`, {
        headers: getAuthHeaders()
      });
      
      if (!response.ok) throw new Error(`Failed to fetch offers: ${response.status}`);
      
      const offers = await response.json();
      
      if (!Array.isArray(offers)) {
        setFeaturedOffers([]);
        return;
      }

      if (offers.length > 0) {
        const transformedOffers = offers
          .map((offer: any) => ({
            id: offer.id || `bitlabs-${Math.random()}`,
            name: offer.anchor || 'Unknown Offer',
            title: offer.anchor || 'Unknown Offer',
            description: offer.description || '',
            image_url: offer.icon || '/default-offer.png',
            payout: parseFloat(offer.total_points_promotional || offer.total_points || 0),
            click_url: offer.click_url,
            requirements: offer.requirements || 'Complete the offer requirements',
            categories: offer.categories || [],
            is_game: offer.app_metadata?.is_game || false,
            total_points: offer.total_points,
            total_points_promotional: offer.total_points_promotional,
            confirmation_time: offer.confirmation_time,
            support_url: offer.support_url,
            events: offer.events || [],
            screenshots: offer.app_metadata?.screenshot_urls || [],
            videos: offer.app_metadata?.video_urls || [],
            epc: offer.epc,
            source: 'BitLabs',
            devices: offer.device_targeting?.operating_systems || [],
            platforms: offer.device_targeting?.platforms || []
          }));

        setFeaturedOffers(transformedOffers);
      } else {
        setFeaturedOffers([]);
      }

    } catch (error: any) {
      console.error('❌ Error:', error);
      setFeaturedOffersError(error.message);
      setFeaturedOffers([]);
    } finally {
      setFeaturedOffersLoading(false);
    }
  }, [getAuthHeaders, getUserOS]);

  // BitLabs Surveys
  const fetchBitLabsSurveys = useCallback(async () => {
    const userId = localStorage.getItem("userId") || "68b49f9f66749e91945e6f58";
    
    try {
      setBitLabsSurveyError(null);

      const userAgent = getUserAgent();
      const userOS = getUserOS();

      const baseUrl = 'https://api.bitlabs.ai/v2/client/surveys';
      const params = new URLSearchParams();
      
      params.append('sdk', 'WEB');
      
      if (userId) {
        params.append('uid', userId);
      }
      
      const tags = `user_id:${userId},platform:${userOS}`;
      params.append('tags', tags);

      const response = await fetch(`${baseUrl}?${params.toString()}`, {
        method: 'GET',
        headers: {
          'X-Api-Token': BITLABS_API_KEY,
          'X-User-Id': userId || '',
          'Accept': 'application/json',
          'User-Agent': userAgent,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`BitLabs API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      if (data.data && data.data.surveys) {
        setBitlabsSurveys(data.data.surveys);
      } else if (data.data && data.data.restriction_reason) {
        console.log('User restricted from surveys:', data.data.restriction_reason);
        setBitlabsSurveys([]);
        setBitLabsSurveyError(`Restricted: ${JSON.stringify(data.data.restriction_reason)}`);
      } else {
        setBitlabsSurveys([]);
      }

    } catch (error: any) {
      console.error("BitLabs survey fetch error:", error);
      setBitLabsSurveyError(error.message);
      setBitlabsSurveys([]);
    } finally {
      setBitlabsSurveyLoading(false);
    }
  }, [getUserAgent, getUserOS]);

  // BitcoTasks
  const fetchBitcoTasks = useCallback(async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;
    
    try {
      let userIp = '';
      try {
        const ipResponse = await fetch('https://www.cloudflare.com/cdn-cgi/trace');
        const ipText = await ipResponse.text();
        const lines = ipText.split('\n');
        const ipLine = lines.find(line => line.startsWith('ip='));
        userIp = ipLine ? ipLine.split('=')[1] : '';
      } catch (error) {
        console.error("Error fetching IP:", error);
      }

      const url = new URL(`${API_BASE_URL}/tasks/api/ptc-tasks`);
      url.searchParams.append('apiKey', API_KEY);
      url.searchParams.append('userId', userId);
      url.searchParams.append('userIp', userIp);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(url.toString(), {
        headers: getAuthHeaders(),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        setBitcoTasks(Array.isArray(data.data) ? data.data : []);
      } else if (response.status === 401 || response.status === 403) {
        handleAuthError(new Error('Authentication failed'));
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.error("Request timeout - PTC tasks fetch aborted");
      } else {
        console.error("Error fetching BitcoTasks:", error);
      }
    } finally {
      setBitcoTasksLoading(false);
    }
  }, [getAuthHeaders, handleAuthError]);

  // Token Price Fetching
  useEffect(() => {
    const getFullData = async () => {
      try {
        const poolResponse = await fetch(
          `https://api.geckoterminal.com/api/v2/networks/${NETWORK}/pools/${POOL_ADDRESS}`
        );
        
        if (poolResponse.ok) {
          const poolData = await poolResponse.json();
          if (poolData.data?.attributes) {
            setTokenPrice(parseFloat(poolData.data.attributes.base_token_price_usd));
            setTokenData(poolData.data.attributes);
          }
        }

        const ids = "bitcoin,solana,binancecoin,ripple";
        const marketsUrl = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&sparkline=false&locale=en`;
        
        const response = await fetch(marketsUrl);
        
        if (response.ok) {
          const allMarkets = await response.json();
          allMarkets.forEach((coin: any) => {
            if (coin.id === 'bitcoin') {
              setBitcoinPrice(coin.current_price);
              setBitcoinData(coin);
            } else if (coin.id === 'solana') {
              setSolanaPrice(coin.current_price);
              setSolanaData(coin);
            } else if (coin.id === 'binancecoin') {
              setBinancePrice(coin.current_price);
              setBinanceData(coin);
            } else if (coin.id === 'ripple') {
              setRipplePrice(coin.current_price);
              setRippleData(coin);
            }
          });
        }
      } catch (error) {
        console.error("Error fetching market data:", error);
      }
    };

    getFullData();
    const interval = setInterval(getFullData, 60000);
    return () => clearInterval(interval);
  }, []);

  // Initial Auth Check
  useEffect(() => {
    setIsAuthenticated(checkAuth());
    setIsCheckingAuth(false);
  }, [checkAuth]);

  // Fetch Data When Authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchUserData();
      fetchDailyActivity();
      fetchAds();
      fetchBitcoTasks();
      fetchActiveFarms();
      fetchUserTransactions();
      
      // Fetch offerwalls data
      fetchBitlabsOffers();
      fetchNotikOffers();
      fetchWannadsOffers();
      fetchAdscendOffers();
      fetchFeaturedOffers();
      fetchBitLabsSurveys();
      
      const interval = setInterval(() => {
        fetchUserData();
        fetchDailyActivity();
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  // Action Handlers
const handleAdComplete = (adId: string, reward: number) => {  // Changed from number to string
  setUser((prev: any) => {
    if (!prev) return null;
    return {
      ...prev,
      bullfiBalance: (prev.bullfiBalance || 0) + reward,
      ads_completed_today: (prev.ads_completed_today || 0) + 1
    };
  });
  
  setAds((prev: any[]) => prev.filter(ad => ad._id !== adId));  // _id is string, so this works
};

  const handleDeposit = (coin: string, amount: number) => {
    setUser((prev: any) => {
      if (!prev) return null;
      const key = getBalanceKey(coin);
      return {
        ...prev,
        [key]: (prev[key] as number) + amount
      };
    });
    setAlert({message: `Successfully deposited ${amount} ${coin}!`, type: 'error' });
  };

  const handleWithdraw = (coin: string, amount: number) => {
    setUser((prev: any) => {
      if (!prev) return null;
      const key = getBalanceKey(coin);
      return {
        ...prev,
        [key]: (prev[key] as number) - amount
      };
    });
    setAlert({message: `Withdrawal request for ${amount} ${coin} submitted!`, type: 'success' });
  };

  const handleSwap = (from: string, to: string, amount: number, receiveAmount: number) => {
    setUser((prev: any) => {
      if (!prev) return null;
      const fromKey = getBalanceKey(from);
      const toKey = getBalanceKey(to);
      return {
        ...prev,
        [fromKey]: (prev[fromKey] as number) - amount,
        [toKey]: (prev[toKey] as number) + receiveAmount
      };
    });
    setAlert({message: `Successfully swapped ${amount} ${from} for ${receiveAmount.toFixed(to === 'BTC' ? 8 : 4)} ${to}!`, type: 'success' });
  };

  const handleOfferComplete = (offer: Offer) => {
    setUser((prev: any) => {
      if (!prev) return null;
      const bullfiReward = offer.reward_usd * 10;
      return {
        ...prev,
        bullfiBalance: prev.bullfiBalance + bullfiReward,
        totalEarning: (prev.totalEarning || 0) + offer.reward_usd,
        lifetimeOfferEarning: (prev.lifetimeOfferEarning || 0) + offer.reward_usd
      };
    });
    
    // Track started offers
    setUser((prev: any) => {
      if (!prev) return null;
      const startedOffers = prev.startedOffers || [];
      return {
        ...prev,
        startedOffers: [...startedOffers, { id: offer.id, startedAt: new Date().toISOString() }]
      };
    });
    
    setAlert({ message: `Offer Started: ${offer.title}. Rewards will be credited upon completion verification.`, type: 'success'});
  };

  const handleBitcoTaskComplete = useCallback((taskId: string, reward: number) => {
    setUser((prev: any) => {
      if (!prev) return null;
      return {
        ...prev,
        bullfiBalance: (prev.bullfiBalance || 0) + reward,
        ads_completed_today: (prev.ads_completed_today || 0) + 1
      };
    });
    
    setBitcoTasks((prev: any[]) => prev.filter(task => task.id !== taskId));
  }, []);

  const handleSpin = async (coin: string, roll: string, prize: number) => {
    setUser((prev: any) => {
      if (!prev) return null;
      const key = getBalanceKey(coin);
      
      const updatedUser = {
        ...prev,
        [key]: (prev[key] || 0) + prize,
      };
      
      const timestampField = `last${coin}Claim`;
      updatedUser[timestampField] = new Date().toISOString();
      
      return updatedUser;
    });

    setClaims(prev => {
      const filtered = prev.filter(c => c.coin !== coin);
      return [...filtered, { user_id: 1, coin, last_claim_at: new Date().toISOString() }];
    });

    await fetchDailyActivity();
    console.log(`Spin result for ${coin}: ${roll} - won ${prize}`);
  };

  // Fetch active farms from backend
  const fetchActiveFarms = useCallback(async () => {
    
    try {
      const headers = getAuthHeaders();
      const response = await fetch(`https://payment.bullfaucet.com/api/yield-farm/active`, {
        headers: headers
      });
      
      if (response.ok) {
        const data = await response.json();
        setFarms(data.farms || []);
      } else if (response.status === 401 || response.status === 403) {
        handleAuthError(new Error('Authentication failed'));
      }
    } catch (error) {
      console.error('Error fetching active farms:', error);
    }
  }, [getAuthHeaders, handleAuthError]);

const handleLock = async (data: any) => {
  const { token, amount, farmType, days, rate, tierId } = data; // Added tierId here
  const balanceKey = getBalanceKey(token);
  
  if (!user || (user[balanceKey] as number) < amount) {
    setAlert({ message: "Insufficient balance", type: 'error' });
    return;
  }

  // Calculate USD value for minimum amount check
  const tokenPrice = prices[token] || 0;
  const amountUsd = amount * tokenPrice;

  // Check minimum USD requirement based on farm type
  const tier = YIELD_TIERS.find((t: typeof YIELD_TIERS[0]) => t.name === farmType);
  if (tier && amountUsd < tier.minAmountUsd) {
    setAlert({ 
      message: `Minimum amount for ${farmType} is $${tier.minAmountUsd}`, 
      type: 'error' 
    });
    return;
  }

  try {
    const headers = getAuthHeaders();
    const response = await fetch(`https://payment.bullfaucet.com/api/yield-farm/create`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        token: token,
        amount: amount,
        tierId: tierId, // Add tierId to the request body
        tierName: farmType,
        duration: days,
        dailyYield: rate * 100,
        apr: tier?.apr || 0
      })
    });

    const responseData = await response.json();

    if (response.ok) {
      // Update local user balance
      setUser((prev: any) => {
        if (!prev) return null;
        return {
          ...prev,
          [balanceKey]: (prev[balanceKey] as number) - amount
        };
      });

// Add new farm to local state with all the new fields
const newFarm: YieldFarm = {
  id: responseData.farmId || Date.now(),
  user_id: parseInt(user.id),
  token,
  amount,
  amountUsd,
  farm_type: farmType,
  tierId: tierId,
  tierName: farmType,
  startDate: new Date().toISOString(),
  endDate: new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString(),
  dailyYield: rate,
  claimed: 0,
  status: 'active',
  totalYieldReceived: 0,
  totalYieldReceivedUsd: 0,
  lastYieldProcessed: undefined, // Change from null to undefined
  yieldsHistory: [],
  duration: days,
  apr: tier?.apr || 0
};

      setFarms(prev => [...prev, newFarm]);
      setAlert({ 
        message: `Successfully locked ${amount} ${token} in ${farmType} farm!`, 
        type: 'success' 
      });
      
      // Refresh farms to get updated data from backend
      await fetchActiveFarms();
    } else {
      setAlert({ 
        message: responseData.message || 'Failed to create farm', 
        type: 'error' 
      });
    }
  } catch (error) {
    console.error('Error creating farm:', error);
    setAlert({ 
      message: 'Network error. Please try again.', 
      type: 'error' 
    });
  }
};

  const fetchReferralDetails = useCallback(async (referralIds: string[]) => {
    if (!referralIds || referralIds.length === 0) {
      setReferralUsers([]);
      setIsLoadingReferrals(false);
      return;
    }
    
    setIsLoadingReferrals(true);
    try {
      const headers = getAuthHeaders();
      const referralData = await Promise.all(
        referralIds.map(async (refId) => {
          try {
            const res = await fetch(`${API_BASE_URL}/users/${refId}`, {
              headers: headers
            });
            
            if (res.status === 401 || res.status === 403) {
              handleAuthError(new Error('Authentication failed'));
              return null;
            }
            
            if (!res.ok) return null;
            const userData = await res.json();
            
            const totalEarnings = Math.ceil(userData.totalEarning || 0);
            const totalSpendings = Math.ceil(userData.totalSpending || 0);
            const commission = Math.ceil((0.05 * totalSpendings) + (0.10 * totalEarnings));

            // Create a properly typed ReferralUser object
            const referralUser: ReferralUser = {
              name: userData.fullName || 'Unknown User',
              profileImage: userData.profileImage,
              earnings: totalEarnings,
              spendings: totalSpendings,
              commissions: commission,
              _id: userData._id,
              email: userData.email || ''
            };
            
            return referralUser;
          } catch (error) {
            console.error(`Error fetching referral ${refId}:`, error);
            return null;
          }
        })
      );
      
      // Filter out null values and set the state
      const validReferralData = referralData.filter((user): user is ReferralUser => user !== null);
      setReferralUsers(validReferralData);
      
    } catch (error) {
      setAlert({ message: "Error fetching referral details", type: "error" });
      console.error("Error fetching referral details:", error);
    } finally {
      setIsLoadingReferrals(false);
    }
  }, [getAuthHeaders, handleAuthError, setAlert]);

  useEffect(() => {
    if (user?.userId || user?._id) {
      setReferralLink(`https://www.bullfaucet.com?ref=${user.userId || user._id}`);
    }
  }, [user]);

  useEffect(() => {
    const hasReferrals = user?.referrals && Array.isArray(user.referrals) && user.referrals.length > 0;
    const needsFetch = referralUsers?.length === 0;

    if (hasReferrals && needsFetch) {
      const sortedReferrals = [...user.referrals].reverse();
      fetchReferralDetails(sortedReferrals);
    } else if (!hasReferrals) {
      setReferralUsers([]);
      setIsLoadingReferrals(false);
    }
  }, [user?.referrals, fetchReferralDetails, referralUsers?.length]);

  // Handle harvest
  const handleHarvest = async (farmId: number) => {
    try {
      const headers = getAuthHeaders();
      const response = await fetch(`https://payment.bullfaucet.com/api/yield-farm/harvest`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ farmId })
      });

      const data = await response.json();

      if (response.ok) {
        // Update user balance with harvested amount
        setUser((prev: any) => {
          if (!prev) return null;
          return {
            ...prev,
            bullfiBalance: (prev.bullfiBalance || 0) + data.yieldAmount
          };
        });

        // Remove harvested farm
        setFarms(prev => prev.filter(farm => farm.id !== farmId));
        
        setAlert({ 
          message: `Successfully harvested ${data.yieldAmount} BULLFI!`, 
          type: 'success' 
        });
      } else {
        setAlert({ 
          message: data.message || 'Failed to harvest', 
          type: 'error' 
        });
      }
    } catch (error) {
      console.error('Error harvesting farm:', error);
      setAlert({ 
        message: 'Network error. Please try again.', 
        type: 'error' 
      });
    }
  };

  // Contest Functions
  const fetchContestData = useCallback(async () => {
    setLoadingContest(true);
    try {
      // Fetch today's contest
      const todayResponse = await fetch('https://payment.bullfaucet.com/api/contest/today-contest');
      const todayData = await todayResponse.json();
      setTodayContest(todayData.data);
      
      // Fetch yesterday's winner
      const yesterdayResponse = await fetch('https://payment.bullfaucet.com/api/contest/recent-results?limit=1');
      const yesterdayData = await yesterdayResponse.json();
      if (yesterdayData.data && yesterdayData.data.length > 0) {
        setYesterdayWinner(yesterdayData.data[0]);
      }
      
      // Fetch contest history
      const historyResponse = await fetch('https://payment.bullfaucet.com/api/contest/recent-results?limit=10');
      const historyData = await historyResponse.json();
      setContestHistory(historyData.data || []);
      
      // Fetch user rank if logged in
      if (user?._id) {
        const rankResponse = await fetch(`https://payment.bullfaucet.com/api/contest/user-rank/${user._id}`);
        const rankData = await rankResponse.json();
        if (rankData.success) {
          setUserRank(rankData.data);
        }
      }
    } catch (error) {
      console.error("Error fetching contest data:", error);
      setAlert({ message: "Failed to load contest data", type: "error" });
    } finally {
      setLoadingContest(false);
    }
  }, [user?._id, setAlert]);

  // Toggle expanded contest view
  const toggleContestExpansion = useCallback((contestId: string) => {
    setExpandedContest(prev => prev === contestId ? null : contestId);
  }, []);

  // Fetch contest data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchContestData();
    }
  }, [isAuthenticated, fetchContestData]);

  // Fetch user transactions
  const fetchUserTransactions = useCallback(async () => {
    if (!checkAuth()) return;
    
    try {
      const headers = getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/users/${userId}/transactions`, {
        headers: headers
      });
      
      if (response.status === 401 || response.status === 403) {
        handleAuthError(new Error('Authentication failed'));
        return;
      }
      
      const data = await response.json();
      setTransactions(data);
      
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setTimeout(() => {
        setTransactionsLoading(false);
        setTransactionLoaded(true);
        setTransactionsReady(true);
      }, 5000);
    }
  }, [userId, getAuthHeaders, handleAuthError, checkAuth]);

  const handleGenerateWallet = async (token: string) => {
    const res = await fetch('https://payment.bullfaucet.com/api/deposits/generate-wallet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user._id, token })
    });
    const data = await res.json();
    if (data.success) {
      fetchUserData();
      setAlert({ 
        message: data.walletReactivated 
          ? `${token} address re-activated successfully!` 
          : `${token} address generated successfully!`, 
        type: "success" 
      });
    } else {
      setAlert({ message: data.error || "Failed to generate wallet", type: "error" });
    }
  };
  
  const handleReactivateWallet = async (token: string) => {
    try {
      const res = await fetch('https://payment.bullfaucet.com/api/deposits/reactivate-wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user._id, token })
      });
      
      const data = await res.json();
      if (data.success) {
        setAlert({ 
          message: `${token} address re-activated successfully!`, 
          type: "success" 
        });
        fetchUserData();
      } else {
        throw new Error(data.error || 'Failed to re-activate');
      }
    } catch (error) {
      setAlert({ 
        message: "Failed to re-activate wallet", 
        type: "error" 
      });
      throw error;
    }
  };
  
const fetchNotifications = useCallback(async () => {
  if (!checkAuth()) return;
  
  try {
    const headers = getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/notifications/user`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({ userId })
    });
    
    if (response.status === 401 || response.status === 403) {
      handleAuthError(new Error('Authentication failed'));
      return;
    }
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    if (data.success) {
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    }
  } catch (error) {
    console.error('Error fetching notifications:', error);
  } finally {
    setIsNotificationLoading(false);
  }
}, [userId]);

useEffect(() => {
  if (isAuthenticated) {
    fetchNotifications();
    
    const notificationInterval = setInterval(() => {
      fetchNotifications();
    }, 10000);
    
    return () => clearInterval(notificationInterval);
  }
}, [isAuthenticated, fetchNotifications]);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setShowLogin(false);
    setShowRegister(false);
    fetchUserData();
    fetchDailyActivity();
    fetchAds();
    fetchBitlabsOffers();
    fetchNotikOffers();
    fetchWannadsOffers();
    fetchAdscendOffers();
    fetchFeaturedOffers();
    fetchBitLabsSurveys();
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    setIsAuthenticated(false);
    setUser(null);
    setAds([]);
    setOffers([]);
    setFarms([]);
    setClaims([]);
    setBitlabsOffers([]);
    setNotikOffers([]);
    setWannadsOffers([]);
    setAdscendOffers([]);
    setFeaturedOffers([]);
    setBitlabsSurveys([]);
  };

  const calculateTotalUSD = () => {
    if (!user) return 0;
    return (
      (user.bullfiBalance || 0) * tokenPrice +
      (user.bitcoinBalance || 0) * bitcoinPrice +
      (user.solanaBalance || 0) * solanaPrice +
      (user.bnbBalance || 0) * binancePrice +
      (user.xrpBalance || 0) * ripplePrice
    );
  };

  const value: DataContextType = {
    // Auth
    isAuthenticated,
    isCheckingAuth,
    checkAuth,
    handleLoginSuccess,
    handleLogout,
    
    // User Data
    user,
    claims,
    ads,
    farms,
    offers,
    dailyActivity,
    
    // Offerwalls Data
    bitlabsOffers,
    bitlabsLoading,
    bitlabsError,
    notikOffers,
    notikLoading,
    notikError,
    wannadsOffers,
    wannadsLoading,
    wannadsError,
    adscendOffers,
    adscendLoading,
    adscendError,
    featuredOffers,
    featuredOffersLoading,
    featuredOffersError,
    
    // Surveys Data
    surveys,
    cpxLoading,
    bitlabsSurveys,
    bitlabsSurveyLoading,
    bitLabsSurveyError,
    
    // Token Prices
    tokenPrice,
    bitcoinPrice,
    solanaPrice,
    binancePrice,
    ripplePrice,
    prices,
    volumes,
    priceChanges,
    marketCaps,
    
    // Token Data (Market Data)
    tokenData,
    solanaData,
    bitcoinData,
    binanceData,
    rippleData,
    
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
    
    // Wallet Modal States
    isInfoModalOpen,
    setIsInfoModalOpen,
    isHistoryOpen,
    setIsHistoryOpen,
    isPendingOpen,
    setIsPendingOpen,
    isWithdrawBullFiOpen,
    setIsWithdrawBullFiOpen,
    isWithdrawOptionsOpen,
    setIsWithdrawOptionsOpen,
    isDepositOptionsOpen,
    setIsDepositOptionsOpen,
    selectedToken,
    setSelectedToken,
    selectedMethod,
    setSelectedMethod,
    
    // Transactions
    transactions,
    transactionsLoading,
    transactionsReady,
    fetchUserTransactions,
    
    // Wallet Actions
    handleGenerateWallet,
    handleReactivateWallet,
    
    // Actions
    fetchUserData,
    fetchAds,
    fetchDailyActivity,
    handleSpin,
    handleAdComplete,
    handleLock,
    handleDeposit,
    handleWithdraw,
    handleSwap,
    handleOfferComplete,
    calculateTotalUSD,
    getBalanceKey,
    getAuthHeaders,
    handleAuthError,
    
    // Offerwalls Actions
    fetchBitlabsOffers,
    fetchNotikOffers,
    fetchWannadsOffers,
    fetchAdscendOffers,
    fetchFeaturedOffers,
    setBitlabsLoading,
    setNotikLoading,
    setWannadsLoading,
    setAdscendLoading,
    
    // Surveys Actions
    fetchBitLabsSurveys,
    loadingTimeout,
    setLoadingTimeout,
    
    // BitcoTasks
    bitcoTasks,
    bitcoTasksLoading,
    fetchBitcoTasks,
    handleBitcoTaskComplete,
    
    // Alert
    isAlertActive,
    handleCloseAlert,
    alert,
    setAlert,
    
    // Farms
    setFarms,
    fetchActiveFarms,
    handleHarvest,
    
    // Referrals
    referralLink,
    setReferralLink,
    referralUsers,
    isLoadingReferrals,
    fetchReferralDetails,
    
    // Contest State
    todayContest,
    setTodayContest,
    yesterdayWinner,
    setYesterdayWinner,
    contestHistory,
    setContestHistory,
    userRank,
    setUserRank,
    loadingContest,
    setLoadingContest,
    transactionLoaded,
    
    // Contest Actions
    fetchContestData,
    toggleContestExpansion,
    expandedContest,
    setExpandedContest,
    
    // Pending Earnings (optional)
    pendingEarnings: user?.pendingEarnings,
    notifications,
    setNotifications,
    unreadCount,
    setUnreadCount,
    isNotificationLoading,
    setIsNotificationLoading,
    fetchNotifications,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};