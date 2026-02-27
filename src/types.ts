// types.ts
export interface User {
  id: string;
  _id: string;
  username: string;
  fullName: string;
  email: string;
  referral_code: string;
  referred_by: string | null;
  bullfiBalance: number;
  pendingBalance: number;
  bitcoinBalance: number;
  bnbBalance: number;
  solanaBalance: number;
  xrpBalance: number;
  totalEarning: number;
  lifetimeOfferEarning?: number; 
  ads_completed_today: number;
  last_ad_reset: string;
  created_at: string;
  totalReferralEarningUsd: number; // Keep this one as required
  
  // Profile fields
  bio?: string;
  profileImage?: string;
  country?: string;
  gender?: string;
  twitterUsername?: string;
  twoFAEnabled?: boolean;
  authTwoFAEnabled?: boolean;
  
  // Stats fields
  ptcRecords?: any[];
  offerWallRecords?: any[];
  faucetClaimRecords?: any[];
  
  referrals?: string[]; 
  totalReferralEarning?: number; 
  totalSpending?: number; 
  
  lastBULLFIClaim?: string;
  lastSOLClaim?: string;
  lastXRPClaim?: string;
  lastBNBClaim?: string;
  lastBTCClaim?: string;
  
  membership?: {
    level: string;
    expiresAt?: string;
  };
  
  dailyBonus?: Array<{
    day: string;
    date: string;
    claimed: boolean;
  }>;
  
  wallets?: Record<string, {
    address: string;
    privateKey?: string;
    createdAt: string;
    updatedAt?: string;
    lastChecked: number;
    status: 'active' | 'inactive' | 'expired';
    inactivatedAt?: string | null;
    expiresAt?: string;
  }>;
  
  // Pending earnings
  pendingEarnings?: Array<{
    amount: number;
    source: string;
    date: string;
    expiresAt?: string;
  }>;
  
  yieldsRecord?: Array<{
    farmId: string;
    amount: number;
    amountUsd: number;
    timestamp: string;
    token: string;
    tierName: string;
    bullfiPrice: number;
  }>;
  lifetimeYieldReceived?: number;
  lifetimeYieldReceivedUsd?: number;
}

export interface ReferralUser {
  name: string;
  profileImage?: string;
  earnings: number;
  spendings: number;
  commissions: number;
  _id: string;
  email: string;
}

export interface FaucetClaim {
  user_id: number;
  coin: string;
  last_claim_at: string;
}

export interface FaucetToken {
  id: string;
  name: string;
  ticker: string;
  image: string;
  color: string;
  dailyPtcRequirement: number;
  permanentUnlockRequirement: number;
  multiplier: number;
  price: number;
  network: string;
  timestampField: keyof Pick<User, 'lastBULLFIClaim' | 'lastSOLClaim' | 'lastXRPClaim' | 'lastBNBClaim' | 'lastBTCClaim'>;
}

export interface PTCAd {
  id: number;
  title: string;
  url: string;
  duration: number;
  reward_bullfi: number;
}

export interface YieldFarm {
  id: string | number;
  user_id: number;
  token: string;
  amount: number;
  amountUsd?: number;
  farm_type: string;
  tierId?: string;
  tierName?: string;
  startDate: string;
  endDate: string;
  dailyYield: number;
  claimed: number;
  totalYieldReceived?: number;
  totalYieldReceivedUsd?: number;
  lastYieldProcessed?: string | null; // Allow null
  yieldsHistory?: Array<{
    amount: number;
    amountUsd: number;
    timestamp: string;
    bullfiPrice?: number;
  }>;
  status?: 'active' | 'harvested';
  harvestedAt?: string;
  duration?: number;
  apr?: number;
  progress?: number;
  daysPassed?: number;
  daysRemaining?: number;
  isPastEndDate?: boolean;
  canHarvest?: boolean;
}

export interface Offer {
  id: string | number;
  title: string;
  name?: string;
  description: string;
  reward_usd: number;
  originalReward?: number;
  multiplier?: number;
  type: 'Game' | 'Survey' | 'App' | 'Offer';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  icon: string;
  image?: string;
  image_url?: string;
  icon_url?: string;
  click_url?: string; 
  tasks?: OfferTask[];
  events?: OfferEvent[]; 
  provider: string;
  source?: string;
  requirements?: string;
  confirmation_time?: string;
  categories?: string[];
  is_game?: boolean;
  total_points?: number;
  total_points_promotional?: number;
  support_url?: string;
  epc?: number;
  devices?: Array<{ name: string } | string>; 
  countryCodes?: string[];
  startedOffer?: boolean;
  category?: 'offer' | 'survey';
  providerLogo?: string;
}

export interface OfferEvent {
  uuid?: string;
  event_id?: string | number;
  name?: string;
  event_description?: string;
  description?: string;
  points?: number;
  payout?: number;
  virtual_currency_value?: number;
  currency_count?: number;
  status?: string;
  isCompleted?: number;
  goal?: any;
}

export interface OfferTask {
  description: string;
  reward_usd: number;
  status?: string; 
  isCompleted?: number;
}

export interface TransformedOffer extends Offer {
  originalId: string | number;
  provider: string;
  source: string;
  category: 'offer' | 'survey';
  providerLogo: string;
  multiplier: number;
  originalReward: number;
  displayPayout?: string;
}

export const COINS = [
  { 
    id: 'BULLFI', 
    name: 'BullFaucet Coin', 
    symbol: 'BULLFI', 
    icon: 'https://res.cloudinary.com/danuehpic/image/upload/v1771869815/logo_tflaaq.png', 
    color: 'text-orange-500' 
  },
  { 
    id: 'SOL', 
    name: 'Solana', 
    symbol: 'SOL', 
    icon: 'https://res.cloudinary.com/danuehpic/image/upload/v1771869814/sol_bdocle.png', 
    color: 'text-purple-500' 
  },
  { 
    id: 'XRP', 
    name: 'Ripple', 
    symbol: 'XRP', 
    icon: 'https://res.cloudinary.com/danuehpic/image/upload/v1771869815/xrp_uhhwwx.png', 
    color: 'text-blue-400' 
  },
  { 
    id: 'BNB', 
    name: 'Binance Coin', 
    symbol: 'BNB', 
    icon: 'https://res.cloudinary.com/danuehpic/image/upload/v1771869814/bnb_jrwljy.png', 
    color: 'text-yellow-500' 
  },
  { 
    id: 'BTC', 
    name: 'Bitcoin', 
    symbol: 'BTC', 
    icon: 'https://res.cloudinary.com/danuehpic/image/upload/v1771869814/bitcoin_lhzjiu.png', 
    color: 'text-orange-400' 
  },
];

export const UNLOCK_CONDITIONS: Record<string, { ads: number; usd: number }> = {
  BULLFI: { ads: 10, usd: 2 },
  SOL: { ads: 20, usd: 5 },
  XRP: { ads: 30, usd: 10 },
  BNB: { ads: 50, usd: 25 },
  BTC: { ads: 100, usd: 100 },
};

export const createFaucetTokens = (
  tokenPrice: number,
  solanaPrice: number,
  bitcoinPrice: number,
  binancePrice: number,
  ripplePrice: number
): FaucetToken[] => {
  return [
    {
      id: 'BULLFI',
      name: 'BullFaucet Coin',
      ticker: 'BULLFI',
      image: 'https://res.cloudinary.com/danuehpic/image/upload/v1771869815/logo_tflaaq.png',
      color: 'text-orange-500',
      dailyPtcRequirement: UNLOCK_CONDITIONS.BULLFI.ads,
      permanentUnlockRequirement: UNLOCK_CONDITIONS.BULLFI.usd,
      multiplier: tokenPrice,
      price: tokenPrice,
      network: 'Solana',
      timestampField: 'lastBULLFIClaim'
    },
    {
      id: 'SOL',
      name: 'Solana',
      ticker: 'SOL',
      image: 'https://res.cloudinary.com/danuehpic/image/upload/v1771869814/sol_bdocle.png',
      color: 'text-purple-500',
      dailyPtcRequirement: UNLOCK_CONDITIONS.SOL.ads,
      permanentUnlockRequirement: UNLOCK_CONDITIONS.SOL.usd,
      multiplier: solanaPrice,
      price: solanaPrice,
      network: 'Solana',
      timestampField: 'lastSOLClaim'
    },
    {
      id: 'XRP',
      name: 'Ripple',
      ticker: 'XRP',
      image: 'https://res.cloudinary.com/danuehpic/image/upload/v1771869815/xrp_uhhwwx.png',
      color: 'text-blue-400',
      dailyPtcRequirement: UNLOCK_CONDITIONS.XRP.ads,
      permanentUnlockRequirement: UNLOCK_CONDITIONS.XRP.usd,
      multiplier: ripplePrice,
      price: ripplePrice,
      network: 'Ripple',
      timestampField: 'lastXRPClaim'
    },
    {
      id: 'BNB',
      name: 'Binance Coin',
      ticker: 'BNB',
      image: 'https://res.cloudinary.com/danuehpic/image/upload/v1771869814/bnb_jrwljy.png',
      color: 'text-yellow-500',
      dailyPtcRequirement: UNLOCK_CONDITIONS.BNB.ads,
      permanentUnlockRequirement: UNLOCK_CONDITIONS.BNB.usd,
      multiplier: binancePrice,
      price: binancePrice,
      network: 'BEP20',
      timestampField: 'lastBNBClaim'
    },
    {
      id: 'BTC',
      name: 'Bitcoin',
      ticker: 'BTC',
      image: 'https://res.cloudinary.com/danuehpic/image/upload/v1771869814/bitcoin_lhzjiu.png',
      color: 'text-orange-400',
      dailyPtcRequirement: UNLOCK_CONDITIONS.BTC.ads,
      permanentUnlockRequirement: UNLOCK_CONDITIONS.BTC.usd,
      multiplier: bitcoinPrice,
      price: bitcoinPrice,
      network: 'Bitcoin',
      timestampField: 'lastBTCClaim'
    }
  ];
};

export const FARM_TYPES = [
  { name: 'Allotment Farm', days: 10, rate: 0.005 },
  { name: 'Homestead Farm', days: 30, rate: 0.006 },
  { name: 'Plantation', days: 90, rate: 0.007 },
  { name: 'Estate', days: 180, rate: 0.008 },
  { name: 'Industrial Complex', days: 270, rate: 0.009 },
  { name: 'Conglomerate', days: 365, rate: 0.01 },
];

export interface ContestParticipant {
  userId: string;
  fullName: string;
  profileImage?: string;
  country?: string;
  earningsToday: number;
  rank?: number;
}

export interface TodayContest {
  _id: string;
  roundNumber: number;
  prizePool: number;
  participants: ContestParticipant[];
  startDate: string;
  endDate: string;
  status: 'active' | 'completed';
}

export interface ContestWinner {
  userId: string;
  fullName: string;
  profileImage?: string;
  rank: number;
  prizeAmount: number;
  prizePercentage: number;
  earningsToday?: number;
}

export interface ContestResult {
  _id: string;
  contestRound: number;
  contestDate: string;
  prizePool: number;
  winners: ContestWinner[];
  totalParticipants: number;
}

export interface UserRank {
  rank: number;
  earningsToday: number;
  prizeProjection: number;
  totalParticipants: number;
  isInTop10: boolean;
}

export interface Transaction {
  _id?: string;
  userId: string;
  type: string;
  amount: number;
  amountUsd?: number;
  timestamp: string;
  status?: string;
  description?: string;
  txHash?: string;
}

export interface PendingEarning {
  amount: number;
  source: string;
  date: string;
}

export interface WalletAddress {
  token: string;
  address: string;
  isActive: boolean;
  createdAt: string;
  expiresAt?: string;
}

export interface TokenData {
  name: string;
  balance: string | number;
  balanceUsd: string;
  image: string;
  ticker: string;
  multiplier: number;
  marketCap?: number;
  tradingVolume24h?: number;
  priceChangePercentage24h?: number;
  totalSupply?: number;
  price: number | string;
  network: string;
  about?: string;
  websiteUrl?: string;
  contractAddress?: string;
}

export interface AdTask {
  _id: string;
  taskTitle: string;
  taskDescription: string;
  taskUrl: string;
  taskDuration: string;
  campaignType: 'Links' | 'Website';
  clicks: number;
  clicked?: number;
  status: 'Pending' | 'In Progress' | 'Paused' | 'Completed' | 'Rejected' | 'Query';
  createdAt: string;
  countries?: Array<{ name: string; count: number }>;
  devices?: Array<{ name: string; count: number }>;
  genders?: Array<{ name: string; count: number }>;
  targetedDevices?: string[];
  targetedRegions?: string[];
}