BullFaucet - Premium Crypto Rewards Platform
https://img.shields.io/badge/License-MIT-yellow.svg
https://img.shields.io/badge/React-18.3.1-61dafb
https://img.shields.io/badge/TypeScript-5.6.2-3178c6
https://img.shields.io/badge/Vite-6.0.5-646cff
https://img.shields.io/badge/Tailwind-3.4.17-38b2ac

<div align="center"> <img src="https://res.cloudinary.com/danuehpic/image/upload/v1771869182/wordmark_pynw6f.png" alt="BullFaucet Logo" width="300"/> <p><strong>Earn crypto rewards by completing simple tasks - surveys, ads, games, and more!</strong></p> <p> <a href="#features">Features</a> • <a href="#demo">Demo</a> • <a href="#installation">Installation</a> • <a href="#tech-stack">Tech Stack</a> • <a href="#screenshots">Screenshots</a> • <a href="#contributing">Contributing</a> </p> </div>

✨ Features
🎯 Multi-Token Faucet
Claim multiple cryptocurrencies every 30 minutes

Supported tokens: BULLFI, SOL, XRP, BNB, BTC

Progressive unlock system based on daily PTC completions

Permanent unlocks through offer completions

📺 PTC (Paid-To-Click) Advertising
Watch ads and earn BULLFI tokens

BitcoTasks integration for additional earning opportunities

Campaign creation for advertisers

Real-time reward tracking

📊 Offer Walls
Multiple offer providers (BitLabs, Notik, Wannads, Adscend)

Surveys, app installations, and game completions

Duplicate offer detection and filtering

Real-time payout tracking

💰 Yield Farming
Lock tokens in time-locked farms

Multiple farm tiers with different APYs

Daily yield accumulation

Harvest rewards at any time

👥 Referral System
Earn 10% of referral earnings

Real-time referral tracking

Referral leaderboards

Commission history

🏆 Daily Contest
Compete with other users

Track daily earnings

Win prize pool shares

View contest history and winners

🔔 Real-time Notifications
Push notification support

In-app notification center

Read/unread tracking

Mark all as read functionality

🌐 Live Activity Feed
Global user activities in real-time

WebSocket connection for live updates

Activity types: faucet claims, offer completions, referrals, etc.

👤 User Profile & Wallet
Multi-token wallet dashboard

Transaction history

Pending earnings tracking

2FA authentication support

Google login integration

🚀 Demo
Check out the live demo: https://www.bullfaucet.com

📋 Prerequisites
Node.js 18.x or higher

npm 9.x or higher

A modern web browser with JavaScript enabled

🛠️ Installation
Clone the repository

git clone https://github.com/yourusername/bullfaucet.git
cd bullfaucet

Install dependencies

npm install

Environment Variables
Create a .env file in the root directory:

VITE_API_BASE_URL=https://api.bullfaucet.com
VITE_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
VITE_GOOGLE_CLIENT_ID=your_google_client_id

Run development server

npm run dev

Build for production

npm run build
npm run preview

💻 Tech Stack
Frontend
React 18 - UI library

TypeScript - Type safety

Vite - Build tool and dev server

Tailwind CSS - Styling

Framer Motion - Animations

React Router DOM - Routing

Socket.io Client - Real-time WebSocket connections

Axios - HTTP requests

Key Libraries
@react-oauth/google - Google authentication

react-google-recaptcha - reCAPTCHA v2

lucide-react - Icons

date-fns - Date manipulation

PWA Features
Service Workers for push notifications

Web Push API

Offline capability

📁 Project Structure

bullfaucet/
├── public/                 # Static assets
│   ├── service-worker.js   # Push notification service worker
│   └── manifest.json       # PWA manifest
├── src/
│   ├── components/         # React components
│   │   ├── AuthModals.tsx  # Login/Register modals
│   │   ├── Dashboard.tsx   # Main dashboard
│   │   ├── FaucetSection.tsx
│   │   ├── PTCSection.tsx
│   │   ├── OffersSection.tsx
│   │   ├── YieldFarmSection.tsx
│   │   ├── ReferralSection.tsx
│   │   ├── Notifications.tsx
│   │   ├── GlobalActivitiesFeed.tsx
│   │   └── ...
│   ├── contexts/           # React contexts
│   │   ├── DataContext.tsx # Main app state
│   │   └── WebSocketContext.tsx
│   ├── hooks/              # Custom hooks
│   │   └── useGlobalActivities.ts
│   ├── utils/              # Utility functions
│   │   ├── pushNotifications.ts
│   │   └── serviceWorkerRegistration.ts
│   ├── types/              # TypeScript types
│   │   └── index.ts
│   ├── config.ts           # App configuration
│   ├── App.tsx             # Main app component
│   └── main.tsx            # Entry point
├── index.html              # HTML template
├── tailwind.config.js      # Tailwind configuration
├── vite.config.ts          # Vite configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Dependencies

🎨 Design System
Colors
Primary Orange: #e36a0d (BULLFI token color)

Background Dark: #0a0c0f to #15191f

Glass Effect: Semi-transparent backgrounds with backdrop blur

Accent Colors:

Emerald: Success/Earnings

Blue: Information/Offers

Purple: Permanent unlocks

Red: Errors/Alerts

Typography
Font Family: Poppins (primary), JetBrains Mono (monospace)

Display Font: Outfit for headings

Responsive scaling across all devices

🔌 API Integration
Authentication Endpoints
POST /auth/login - Email/password login

POST /auth/register - New user registration

POST /auth/google/verify - Google OAuth verification

POST /auth/google/callback - Google login callback

Data Endpoints
GET /users/:id - User profile data

GET /referral/daily-activity/:userId - Daily activity stats

GET /tasks/approved-tasks - Available PTC tasks

POST /tasks/create-task - Create new ad campaign

GET /offers/offers - Featured offers

GET /activities/global - Global activity feed

WebSocket Events
new_global_activity - Live activity updates

global_activity_batch - Initial activity batch

community_notification - Push notifications

unread_count_update - Notification count updates

📱 Features by User Type
For Regular Users
💸 Claim faucet every 30 minutes

📺 Complete PTC ads

📊 Complete offers and surveys

💰 Farm tokens for passive income

👥 Refer friends and earn commissions

🏆 Participate in daily contests

For Advertisers
📝 Create PTC campaigns

🎯 Target specific countries/devices

📈 Track campaign performance

💵 Budget control with minimum spends

🔒 Security Features

JWT Authentication - Secure token-based auth

reCAPTCHA v2 - Bot protection

2FA Support - Two-factor authentication

Input Validation - All user inputs sanitized

HTTPS - Encrypted data transmission

Rate Limiting - Prevent abuse

🚦 Getting Started
Create an account - Sign up with email or Google

Complete your profile - Add gender and country

Start earning - Choose from faucet, PTC, or offers

Build your portfolio - Farm tokens and refer friends

Withdraw earnings - Transfer to your wallet

🤝 Contributing
Contributions are welcome! Please follow these steps:

Fork the repository

Create a feature branch (git checkout -b feature/AmazingFeature)

Commit changes (git commit -m 'Add AmazingFeature')

Push to branch (git push origin feature/AmazingFeature)

Open a Pull Request

Development Guidelines
Follow TypeScript best practices

Use functional components with hooks

Maintain existing code style

Add comments for complex logic

Update documentation as needed

📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

🙏 Acknowledgments
Solana - Blockchain platform

BitLabs - Offer wall provider

GeckoTerminal - Token price data

CoinGecko - Cryptocurrency market data

📞 Contact & Support
Website: https://www.bullfaucet.com

Email: support@bullfaucet.com

Twitter: @bullfaucet

Facebook: BullFaucet

<div align="center"> <sub>Built with ❤️ by the BullFaucet Team</sub> <br/> <sub>© 2024 BullFaucet. All rights reserved.</sub> </div>