import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Gift, Trophy, Medal, Clock, TrendingUp, Users } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { ContestParticipant, ContestWinner } from '../types';
import fallbackCountries from '../fallbackCountries.json'; 

export const DailyContest = () => {
  const { 
    todayContest, 
    yesterdayWinner, 
    contestHistory, 
    userRank,
    loadingContest,
    tokenPrice,
    expandedContest,
    toggleContestExpansion
  } = useData();
  
  const [timeLeft, setTimeLeft] = useState('');
  
  // Process countries data once at the component level
  const countries = fallbackCountries.map((country: any) => ({
    name: country.country,
    flag: country.flag_base64
  })).sort((a, b) => a.name.localeCompare(b.name));

  const prizePercentages = [50, 25, 12, 6, 3, 1.5, 0.9, 0.7, 0.5, 0.4];

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setUTCHours(24, 0, 0, 0);
      const diff = tomorrow.getTime() - now.getTime();
      
      const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeLeft(`${h.toString().padStart(2, '0')}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`);
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, []);

  const getCountryFlag = (countryName?: string) => {
    if (!countryName) return null;
    const country = countries.find(c => 
      c.name.toLowerCase() === countryName?.toLowerCase()
    );
    return country?.flag || null;
  };

  const formatAmount = (amount: number) => {
    if (!amount && amount !== 0) return '0.00';
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(2)}M`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(2)}K`;
    }
    return amount.toFixed(2);
  };

  if (loadingContest) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-12 h-12 border-4 border-bull-orange border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-bull-orange/20 mb-6">
          <Trophy className="w-10 h-10 text-bull-orange" />
        </div>
        <h2 className="text-4xl md:text-5xl font-display font-bold mb-4 relative">
          Daily Contest
          <span className="absolute top-[-30px] right-[40px] ml-3 inline-flex items-center px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-sm font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse mr-2"></span>
            LIVE
          </span>
        </h2>
        <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
          Top 10 earners win a share of the prize pool. Every day is a new round!
        </p>
      </div>

      {/* Prize Pool Banner */}
      <div className="glass p-8 rounded-3xl text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-bull-orange/5 to-transparent" />
        <div className="relative">
          <h3 className="text-5xl md:text-6xl font-display font-bold text-bull-orange mb-2">
            {formatAmount(todayContest?.prizePool || 0)} BULLFI
          </h3>
          <p className="text-xl text-zinc-400">Today's Prize Pool</p>
          <p className="text-sm text-zinc-500 mt-2">Round #{todayContest?.roundNumber || 'N/A'}</p>
          <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full bg-white/5">
            <Users size={16} className="text-bull-orange" />
            <span className="text-sm font-bold">{todayContest?.participants?.length || 0} Participants</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass p-6 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center">
            <Clock className="w-6 h-6 text-yellow-400" />
          </div>
          <div>
            <p className="text-xs text-zinc-500 font-bold uppercase">Time Remaining</p>
            <p className="text-xl font-mono font-bold">{timeLeft}</p>
            <p className="text-xs text-zinc-500">Ends at midnight UTC</p>
          </div>
        </div>

        {userRank && (
          <>
            <div className="glass p-6 rounded-2xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-zinc-500 font-bold uppercase">Your Rank</p>
                <p className="text-2xl font-bold">#{userRank.rank}</p>
                <p className="text-xs text-zinc-500">
                  {userRank.isInTop10 ? '🏆 In Top 10!' : `${userRank.earningsToday} BULLFI earned`}
                </p>
              </div>
            </div>

            <div className="glass p-6 rounded-2xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Gift className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-zinc-500 font-bold uppercase">Potential Prize</p>
                <p className="text-2xl font-bold text-emerald-400">
                  {formatAmount(userRank.prizeProjection)} BULLFI
                </p>
                <p className="text-xs text-zinc-500">≈ ${(userRank.prizeProjection * tokenPrice).toFixed(2)}</p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Combined Top 10 with Prize Distribution - FIXED SPACING ISSUE */}
      <div className="">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h3 className="text-2xl text-center font-display font-bold">Today's Top 10</h3>
          <div className="flex items-center gap-2 text-sm text-zinc-400 justify-center">
            <Clock size={16} />
            <span>Contest ends at midnight UTC</span>
          </div>
        </div>

        {/* Table Header - Fixed column spans */}
        <div className="hidden md:grid grid-cols-12 gap-2 px-4 py-2 text-xs text-zinc-500 font-bold uppercase tracking-wider border-b border-white/10 mb-2">
          <div className="col-span-1">Rank</div>
          <div className="col-span-4">User</div>
          <div className="col-span-3">Earnings Today</div>
          <div className="col-span-4">Prize Amount</div>
        </div>

        {/* Table Body - Fixed column spans and removed extra padding/margin */}
        <div className="space-y-4">
          {todayContest?.participants?.slice(0, 10).map((participant: ContestParticipant, index: number) => {
            const prizePercentage = prizePercentages[index] || 0;
            const prizeAmount = ((todayContest?.prizePool || 0) * prizePercentage) / 100;
            const flag = participant.country ? getCountryFlag(participant.country) : null;
            
            return (
              <motion.div
                key={participant.userId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="grid grid-cols-2 md:grid-cols-12 gap-2 p-4 rounded-xl glass border border-white/5 hover:border-bull-orange/20 transition-all"
              >
                {/* Rank - Mobile: Full width, Desktop: col-span-1 */}
                <div className="col-span-2 md:col-span-1 flex items-center gap-2 md:gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    index === 0 ? 'bg-yellow-500 text-black' : 
                    index === 1 ? 'bg-zinc-300 text-black' : 
                    index === 2 ? 'bg-orange-700 text-white' : 
                    'bg-white/10 text-zinc-400'
                  }`}>
                    {index < 3 ? <Medal className="w-4 h-4" /> : `#${index + 1}`}
                  </div>
                  <span className="md:hidden text-xs text-zinc-500">Rank #{index + 1}</span>
                </div>

                {/* User Info - Desktop: col-span-4, Hidden on mobile (shown below) */}
                <div className="hidden md:flex md:col-span-4 items-center gap-3">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-bull-dark flex-shrink-0">
                    {participant.profileImage ? (
                      <img src={participant.profileImage} alt={participant.fullName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-bull-orange/20 text-bull-orange font-bold text-sm">
                        {participant.fullName?.charAt(0) || 'U'}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-sm truncate">{participant.fullName || 'Anonymous'}</p>
                    {flag && (
                      <img src={flag} alt={participant.country} className="w-4 h-4 object-cover rounded mt-0.5" />
                    )}
                  </div>
                </div>

                {/* Mobile User Info - Full width on mobile */}
                <div className="col-span-2 md:hidden flex items-center gap-2 mt-1">
                  <div className="w-6 h-6 rounded-full overflow-hidden bg-bull-dark flex-shrink-0">
                    {participant.profileImage ? (
                      <img src={participant.profileImage} alt={participant.fullName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-bull-orange/20 text-bull-orange font-bold text-xs">
                        {participant.fullName?.charAt(0) || 'U'}
                      </div>
                    )}
                  </div>
                  <span className="text-sm font-medium truncate">{participant.fullName || 'Anonymous'}</span>
                  {flag && (
                    <img src={flag} alt={participant.country} className="w-4 h-4 object-cover rounded ml-auto" />
                  )}
                </div>

                {/* Earnings Today - Desktop: col-span-3, Mobile: col-span-1 */}
                <div className="col-span-1 md:col-span-3">
                  <p className="md:hidden text-[10px] text-zinc-500 mb-0.5">Earnings</p>
                  <p className="font-mono font-bold text-sm md:text-base">{formatAmount(participant.earningsToday || 0)}</p>
                  <p className="md:hidden text-[8px] text-zinc-500">BULLFI</p>
                </div>

                {/* Prize Amount - Desktop: col-span-4, Mobile: col-span-1 */}
                <div className="col-span-1 md:col-span-4">
                  <p className="md:hidden text-[10px] text-zinc-500 mb-0.5">Prize</p>
                  <div>
                    <p className={`font-mono font-bold text-sm md:text-base ${index === 0 ? 'text-yellow-400' : 'text-emerald-400'}`}>
                      {formatAmount(prizeAmount)}
                    </p>
                    <p className="text-[8px] md:text-xs text-zinc-500">≈ ${(prizeAmount * tokenPrice).toFixed(2)}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}

          {(!todayContest?.participants || todayContest.participants.length === 0) && (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                <Users size={32} className="text-zinc-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">No participants yet</h3>
              <p className="text-zinc-400">Be the first to earn today and claim the top spot!</p>
            </div>
          )}
        </div>
      </div>

      {/* Yesterday's Winner */}
      <div className="">
        <div className="flex items-center justify-between mb-6 flex-col md:flex-row">
          <h3 className="text-2xl font-display font-bold flex items-center gap-3">
            <Trophy className="w-6 h-6 text-yellow-400" />
            Yesterday's Champion
          </h3>
          {yesterdayWinner && (
            <span className="text-sm text-center text-zinc-500">
              {new Date(yesterdayWinner.contestDate).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric'
              })}
            </span>
          )}
        </div>

        {yesterdayWinner && yesterdayWinner.winners.length > 0 ? (
          <div className="space-y-6">
            {/* Champion Spotlight */}
            <div className="flex flex-col md:flex-row items-center gap-6 p-6 rounded-2xl bg-gradient-to-r from-yellow-500/10 to-transparent border border-yellow-500/20">
              <div className="relative">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-yellow-400">
                  {yesterdayWinner.winners[0].profileImage ? (
                    <img src={yesterdayWinner.winners[0].profileImage} alt="Champion" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-yellow-500 text-black text-2xl font-bold">
                      {yesterdayWinner.winners[0].fullName?.charAt(0) || 'C'}
                    </div>
                  )}
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center text-black font-bold text-sm">
                  #1
                </div>
              </div>

              <div className="flex-1 text-center md:text-left">
                <h4 className="text-2xl font-bold mb-2">{yesterdayWinner.winners[0].fullName || 'Anonymous'}</h4>
                <p className="text-yellow-400 font-bold mb-4">Daily Contest Champion</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-3 rounded-xl bg-white/5">
                    <p className="text-xs text-zinc-500 mb-1">Round</p>
                    <p className="text-lg font-bold">#{yesterdayWinner.contestRound}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5">
                    <p className="text-xs text-zinc-500 mb-1">Prize Won</p>
                    <p className="text-lg font-bold text-emerald-400">
                      {formatAmount(yesterdayWinner.winners[0].prizeAmount)} BULLFI
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5">
                    <p className="text-xs text-zinc-500 mb-1">Share</p>
                    <p className="text-lg font-bold">{yesterdayWinner.winners[0].prizePercentage}%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Other Top Winners */}
            {yesterdayWinner.winners.length > 1 && (
              <div>
                <h4 className="font-bold mb-4 text-center">Top 5 Winners</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                  {yesterdayWinner.winners.slice(0, 5).map((winner: ContestWinner) => (
                    <div key={winner.userId} className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                      <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-bull-orange/20 text-bull-orange text-sm font-bold mb-2">
                        #{winner.rank}
                      </div>
                      <div className="w-12 h-12 mx-auto mb-2 rounded-full overflow-hidden bg-bull-dark">
                        {winner.profileImage ? (
                          <img src={winner.profileImage} alt={winner.fullName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-bull-orange/20 text-bull-orange font-bold">
                            {winner.fullName?.charAt(0) || 'U'}
                          </div>
                        )}
                      </div>
                      <p className="font-bold text-sm truncate">{winner.fullName?.split(' ')[0] || 'User'}</p>
                      <p className="text-xs text-emerald-400 font-mono mt-1">
                        {formatAmount(winner.prizeAmount)} BULLFI
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
              <Trophy size={32} className="text-zinc-500" />
            </div>
            <h3 className="text-xl font-bold mb-2">No contest results yet</h3>
            <p className="text-zinc-400">Yesterday's contest results will be available soon.</p>
          </div>
        )}
      </div>

      {/* Contest History - GRID LAYOUT FIXED */}
      <div className="">
        <div className="flex items-center justify-between mb-6 flex-col md:flex-row">
          <h3 className="text-2xl font-display font-bold">Recent Contest History</h3>
          <span className="text-sm text-zinc-500 flex items-center gap-1">
            <Clock size={14} />
            Last 10 Rounds
          </span>
        </div>

        {contestHistory.length > 0 ? (
          // Fixed grid layout with min-width of 300px on larger screens
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contestHistory.map((contest) => (
              <div 
                key={contest._id} 
                className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-bull-orange/30 transition-all min-w-[300px]"
              >
                <div className="flex flex-col justify-between gap-3 mb-4">
                  <div>
                    <h4 className="font-bold text-lg">Round #{contest.contestRound}</h4>
                    <p className="text-xs text-zinc-500">
                      {new Date(contest.contestDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-zinc-500">Prize Pool</p>
                    <p className="text-lg font-bold text-bull-orange">{formatAmount(contest.prizePool)} BULLFI</p>
                  </div>
                </div>

                <div className="space-y-2">
                  {contest.winners.slice(0, expandedContest === contest._id ? 10 : 3).map((winner: ContestWinner) => (
                    <div key={winner.userId} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-6 h-6 rounded-full overflow-hidden bg-bull-dark flex-shrink-0">
                          {winner.profileImage ? (
                            <img src={winner.profileImage} alt={winner.fullName} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-bull-orange/20 text-bull-orange text-xs font-bold">
                              {winner.fullName?.charAt(0) || 'U'}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-sm truncate">{winner.fullName?.split(' ')[0] || 'User'}</p>
                          <p className="text-xs text-zinc-500">Rank #{winner.rank}</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2">
                        <p className="text-sm font-mono text-emerald-400">{formatAmount(winner.prizeAmount)}</p>
                        <p className="text-[10px] text-zinc-500">{winner.prizePercentage}%</p>
                      </div>
                    </div>
                  ))}
                  
                  {contest.winners.length > 3 && (
                    <button 
                      onClick={() => toggleContestExpansion(contest._id)}
                      className="w-full mt-2 text-xs text-bull-orange hover:text-orange-400 transition-colors"
                    >
                      {expandedContest === contest._id ? 'Show less' : `View all ${contest.winners.length} winners`}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
              <TrendingUp size={32} className="text-zinc-500" />
            </div>
            <h3 className="text-xl font-bold mb-2">No contest history available</h3>
            <p className="text-zinc-400">Previous contest results will appear here</p>
          </div>
        )}
      </div>

      {/* How It Works */}
      <div className="glass p-8 rounded-3xl">
        <h3 className="text-2xl font-display font-bold mb-8 text-center">How The Contest Works</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { step: 1, title: 'Earn', desc: 'Complete offers, tasks, and faucets to earn rewards throughout the day' },
            { step: 2, title: 'Climb Rankings', desc: 'Your daily earnings determine your position on the live leaderboard' },
            { step: 3, title: 'Win Prizes', desc: 'Top 10 earners win a share of the daily prize pool based on their rank' },
            { step: 4, title: 'Daily Reset', desc: 'Contest resets daily at midnight UTC. Start fresh and earn your way to the top!' }
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-bull-orange/20 flex items-center justify-center text-bull-orange font-bold text-xl">
                {item.step}
              </div>
              <h4 className="font-bold mb-2">{item.title}</h4>
              <p className="text-sm text-zinc-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Prize Distribution Table */}
      <div className="glass p-8 rounded-3xl">
        <h3 className="text-2xl font-display font-bold mb-6">Prize Distribution</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {prizePercentages.map((percentage, index) => (
            <div key={index} className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
              <p className="text-xs text-zinc-500 mb-1">#{index + 1} Place</p>
              <p className="text-2xl font-bold text-bull-orange">{percentage}%</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};