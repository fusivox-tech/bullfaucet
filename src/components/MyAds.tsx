import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react'; // Add AnimatePresence import
import { 
  PlusCircle, 
  BarChart3, 
  Eye, 
  PauseCircle, 
  PlayCircle,
  DollarSign,
  Target,
  Globe,
  Smartphone,
  Users,
  TrendingUp,
  Clock,
  Filter,
  ChevronDown,
  Loader2
} from 'lucide-react'; // Remove unused icons (X, AlertCircle, CheckCircle2)
import { useData } from '../contexts/DataContext';
import API_BASE_URL from '../config';
import fallbackCountries from '../fallbackCountries.json';

// Add type for country data
interface CountryData {
  name: string;
  flag: string;
}

// Add type for fallback country
interface FallbackCountry {
  country: string;
  flag_base64: string;
}

interface MyAdsProps {
  onCreateAd: () => void;
}

interface Country {
  name: string;
  count: number;
}

interface Device {
  name: string;
  count: number;
}

interface Gender {
  name: string;
  count: number;
}

interface AdTask {
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
  countries?: Country[];
  devices?: Device[];
  genders?: Gender[];
  targetedDevices?: string[];
  targetedRegions?: string[];
}

const MyAds: React.FC<MyAdsProps> = ({ onCreateAd }) => {

  const { user, tokenPrice, setAlert } = useData();
  
  const [userTasks, setUserTasks] = useState<AdTask[]>([]);
  const [userTasksLoading, setUserTasksLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<AdTask | null>(null);
  const [isStatisticsModalOpen, setIsStatisticsModalOpen] = useState(false);
  const [filter, setFilter] = useState('All status');
  const [sort, setSort] = useState('Latest');
  const [clicksToAdd, setClicksToAdd] = useState(1000);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [loadingTaskId, setLoadingTaskId] = useState<string | null>(null);
  const [countries, setCountries] = useState<CountryData[]>([]);
  const [openBuyBox, setOpenBuyBox] = useState(false);

  // Fetch countries for flags
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch("https://restcountries.com/v3.1/all");
        if (!response.ok) throw new Error('Failed to fetch countries');
        
        const data = await response.json();
        const countryData: CountryData[] = data.map((country: any) => ({
          name: country.name.common,
          flag: country.flags?.svg || country.flags?.png || "",
        })).sort((a: CountryData, b: CountryData) => a.name.localeCompare(b.name));

        setCountries(countryData);
      } catch (error) {
        console.error("Error fetching countries, using fallback:", error);
        const formattedFallback: CountryData[] = (fallbackCountries as FallbackCountry[]).map((country: FallbackCountry) => ({
          name: country.country,
          flag: country.flag_base64
        })).sort((a: CountryData, b: CountryData) => a.name.localeCompare(b.name));
        setCountries(formattedFallback);
      }
    };

    fetchCountries();
  }, []);

  // Fetch user tasks
  const fetchUserTasks = async () => {

    setUserTasksLoading(true);
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      
      const response = await fetch(`${API_BASE_URL}/tasks/fetch-tasks/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        setAlert({ message: 'Session expired. Please log in again.', type: 'error' });
        return;
      }

      const data = await response.json();
      if (response.ok) {
        setUserTasks(data.tasks || []);
      } else {
        setAlert({ message: data.message || 'Failed to fetch tasks', type: 'error' });
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setAlert({ message: 'Failed to fetch tasks', type: 'error' });
    } finally {
      setUserTasksLoading(false);
    }
  };

  useEffect(() => {
    fetchUserTasks();
  }, []);

  // Calculate total clicks across all tasks
  const totalClicks = useMemo(() => {
    return userTasks.reduce((sum, task) => {
      const remaining = task.clicks || 0;
      const delivered = task.clicked || 0;
      return sum + remaining + delivered;
    }, 0);
  }, [userTasks]);

  // Calculate cost per click based on duration
  const calculateCostPerClick = (task: AdTask) => {
    const duration = task.taskDuration;
    
    const multiplierMap: Record<string, number> = {
      '10': 0.0004,
      '30': 0.0008,
      '60': 0.0012
    };
    
    const multiplier = multiplierMap[duration] || 0.0008;
    return multiplier / tokenPrice;
  };

  // Calculate total cost for additional clicks
  const calculateTotalCost = (task: AdTask, clicks: number) => {
    const costPerClick = calculateCostPerClick(task);
    return costPerClick * clicks;
  };

  // Calculate task value (spent)
  const calculateTaskValue = (task: AdTask) => {
    const clicked = task.clicked || 0;
    const duration = task.taskDuration;
    
    const multiplierMap: Record<string, number> = {
      '10': 0.0004,
      '30': 0.0008,
      '60': 0.0012
    };
    
    const multiplier = multiplierMap[duration] || 0.0008;
    return clicked * multiplier;
  };

  // Handle task status toggle (pause/continue)
  const handleTaskStatusToggle = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Paused' ? 'In Progress' : 'Paused';
    setLoadingTaskId(taskId);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        setAlert({ message: 'Session expired. Please log in again.', type: 'error' });
        return;
      }

      const data = await response.json();
      if (response.ok) {
        setUserTasks(prevTasks =>
          prevTasks.map(task =>
            task._id === taskId ? { ...task, status: newStatus as any } : task
          )
        );

        if (selectedTask && selectedTask._id === taskId) {
          setSelectedTask(prev => prev ? { ...prev, status: newStatus as any } : null);
        }

        setAlert({
          message: `Task has been ${newStatus === 'Paused' ? 'paused' : 'continued'} successfully.`,
          type: 'success'
        });
      } else {
        setAlert({ message: data.message || 'Failed to update task status', type: 'error' });
      }
    } catch (error) {
      console.error('Error updating task status:', error);
      setAlert({ message: 'Failed to update task status', type: 'error' });
    } finally {
      setLoadingTaskId(null);
    }
  };

  // Handle purchase of additional clicks
  const handlePurchaseClicks = async () => {
    if (!selectedTask) return;
    
    if (clicksToAdd < 1000) {
      setAlert({ message: 'Minimum purchase is 1000 clicks', type: 'error' });
      return;
    }

    setIsPurchasing(true);
    try {
      const totalCost = calculateTotalCost(selectedTask, clicksToAdd);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/tasks/${selectedTask._id}/purchase-clicks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user?._id,
          clicksToAdd,
          totalCost
        })
      });

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        setAlert({ message: 'Session expired. Please log in again.', type: 'error' });
        return;
      }

      const data = await response.json();
      if (response.ok) {
        // Update local state
        setUserTasks(prevTasks =>
          prevTasks.map(task =>
            task._id === selectedTask._id
              ? {
                  ...task,
                  clicks: (task.clicks || 0) + clicksToAdd,
                  status: task.status === 'Completed' ? 'In Progress' : task.status
                }
              : task
          )
        );

        // Update selected task
        setSelectedTask(prev => prev ? {
          ...prev,
          clicks: (prev.clicks || 0) + clicksToAdd,
          status: prev.status === 'Completed' ? 'In Progress' : prev.status
        } : null);

        setAlert({
          message: `Successfully purchased ${clicksToAdd.toLocaleString()} clicks for ${totalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })} BULLFI!`,
          type: 'success'
        });
        
        setClicksToAdd(1000);
        setOpenBuyBox(false);
      } else {
        setAlert({ message: data.message || 'Failed to purchase clicks', type: 'error' });
      }
    } catch (error) {
      console.error('Error purchasing clicks:', error);
      setAlert({ message: 'Failed to purchase clicks', type: 'error' });
    } finally {
      setIsPurchasing(false);
    }
  };

  // Get flag URL for a country
  const getFlagUrl = (countryName: string) => {
    const country = countries.find(c => c.name === countryName);
    return country ? country.flag : '';
  };

  // Filter and sort tasks
  const filteredAndSortedTasks = useMemo(() => {
    return userTasks
      .filter(task => {
        if (filter === 'All status') return true;
        if (filter === 'Active') return task.status === 'In Progress' && (task.clicks || 0) > 0;
        if (filter === 'Completed') return (task.clicks || 0) === 0;
        if (filter === 'Paused') return task.status === 'Paused';
        return true;
      })
      .sort((a, b) => {
        switch(sort) {
          case 'Latest':
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          case 'Oldest':
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          case 'Title (A - Z)':
            return a.taskTitle.localeCompare(b.taskTitle);
          case 'Highest Click':
            return (b.clicked || 0) - (a.clicked || 0);
          default:
            return 0;
        }
      });
  }, [userTasks, filter, sort]);

  // Get statistics for selected task
  const countryStats = useMemo(() => {
    if (!selectedTask || !selectedTask.countries) return [];
    const totalClicks = selectedTask.clicked || 0;
    if (totalClicks === 0) return [];

    return selectedTask.countries
      .map(country => ({
        name: country.name,
        percentage: ((country.count / totalClicks) * 100).toFixed(2),
        count: country.count,
      }))
      .sort((a, b) => parseFloat(b.percentage) - parseFloat(a.percentage));
  }, [selectedTask]);

  const deviceStats = useMemo(() => {
    if (!selectedTask || !selectedTask.devices) return [];
    const totalClicks = selectedTask.clicked || 0;
    if (totalClicks === 0) return [];

    return selectedTask.devices
      .map(device => ({
        name: device.name,
        percentage: ((device.count / totalClicks) * 100).toFixed(2),
        count: device.count,
      }))
      .sort((a, b) => parseFloat(b.percentage) - parseFloat(a.percentage));
  }, [selectedTask]);

  const genderStats = useMemo(() => {
    if (!selectedTask || !selectedTask.genders) return [];
    const totalClicks = selectedTask.clicked || 0;
    if (totalClicks === 0) return [];

    // Normalize gender data
    const genderMap: Record<string, number> = {
      Male: 0,
      Female: 0,
      Other: 0
    };
    
    const genderNormalization: Record<string, string> = {
      'male': 'Male',
      'female': 'Female',
      'm': 'Male',
      'f': 'Female',
      'other': 'Other',
      'unknown': 'Other'
    };
    
    selectedTask.genders.forEach(gender => {
      const normalizedName = gender.name.trim().toLowerCase();
      const standardGender = genderNormalization[normalizedName] || 'Other';
      genderMap[standardGender] += gender.count;
    });

    return Object.entries(genderMap)
      .filter(([_, count]) => count > 0)
      .map(([name, count]) => ({
        name,
        percentage: ((count / totalClicks) * 100).toFixed(2),
        count,
      }))
      .sort((a, b) => parseFloat(b.percentage) - parseFloat(a.percentage));
  }, [selectedTask]);

  // Get status color
  const getStatusColor = (status: string, clicksRemaining: number) => {
    if (clicksRemaining === 0) return 'text-zinc-500';
    switch(status) {
      case 'In Progress': return 'text-emerald-400';
      case 'Paused': return 'text-amber-400';
      case 'Rejected': return 'text-red-400';
      case 'Pending': return 'text-blue-400';
      case 'Query': return 'text-orange-400';
      default: return 'text-zinc-400';
    }
  };

  const totalCost = selectedTask ? calculateTotalCost(selectedTask, clicksToAdd) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-8 rounded-[2rem] glass bg-gradient-to-br from-bull-orange/10 to-transparent border border-bull-orange/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-3xl font-display font-bold mb-2">My PTC Ads</h3>
            <p className="text-zinc-400">Manage and track your advertising campaigns</p>
          </div>
          <button
            onClick={onCreateAd}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-bull-orange font-bold hover:bg-orange-600 transition-all shadow-lg shadow-bull-orange/20"
          >
            <PlusCircle className="w-5 h-5" />
            Create New Ad
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 rounded-2xl glass border border-white/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-bull-orange/20 flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-bull-orange" />
            </div>
            <div>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Campaigns Created</p>
              <p className="text-3xl font-display font-bold">{userTasks.length.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl glass border border-white/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <Eye className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Clicks Purchased</p>
              <p className="text-3xl font-display font-bold">{totalClicks.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Sort Controls */}
      <div className="flex flex-wrap gap-3 justify-between items-center">
        <div className="flex gap-2">
          <div className="relative">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="appearance-none bg-white/5 border border-white/10 rounded-xl px-4 py-2 pr-10 text-sm focus:outline-none focus:border-bull-orange"
            >
              <option>All status</option>
              <option>Active</option>
              <option>Completed</option>
              <option>Paused</option>
            </select>
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="appearance-none bg-white/5 border border-white/10 rounded-xl px-4 py-2 pr-10 text-sm focus:outline-none focus:border-bull-orange"
            >
              <option>Latest</option>
              <option>Title (A - Z)</option>
              <option>Oldest</option>
              <option>Highest Click</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Tasks Grid */}
      {userTasksLoading ? (
        <div className="flex flex-col items-center justify-center p-12 glass rounded-3xl">
          <Loader2 className="w-8 h-8 animate-spin text-bull-orange mb-4" />
          <p className="text-zinc-400">Loading campaigns...</p>
        </div>
      ) : userTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 glass rounded-3xl">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
            <BarChart3 className="w-8 h-8 text-zinc-500" />
          </div>
          <p className="text-zinc-400 text-center mb-4">
            You haven't created any campaigns yet.
          </p>
          <button
            onClick={onCreateAd}
            className="px-6 py-3 rounded-xl bg-bull-orange font-bold hover:bg-orange-600 transition-all"
          >
            Create Your First Ad
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredAndSortedTasks.map((task) => {
            const clicksRemaining = task.clicks || 0;
            const statusColor = getStatusColor(task.status, clicksRemaining);
            const canEdit = task.status === 'Pending' || task.status === 'Query';

            return (
              <motion.div
                key={task._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-2xl glass border border-white/5 hover:border-bull-orange/20 transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-bull-orange/20 flex items-center justify-center flex-shrink-0">
                        {task.campaignType === 'Links' ? (
                          <Target className="w-5 h-5 text-bull-orange" />
                        ) : (
                          <Globe className="w-5 h-5 text-bull-orange" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-display font-bold text-lg">{task.taskTitle}</h4>
                        <p className="text-xs text-zinc-500 mt-1 line-clamp-1">{task.taskDescription}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 mt-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-zinc-500" />
                        <span className="text-xs text-zinc-400">{task.taskDuration}s</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-zinc-500" />
                        <span className="text-xs text-zinc-400">
                          {task.clicked?.toLocaleString() || 0} / {((task.clicks || 0) + (task.clicked || 0)).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-zinc-500" />
                        <span className="text-xs text-zinc-400">
                          ${calculateTaskValue(task).toFixed(2)} spent
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-3">
                      <div className={`px-2 py-1 rounded-full text-[10px] font-bold border ${statusColor} border-current/20 bg-current/10`}>
                        {clicksRemaining === 0 ? 'Completed' : task.status}
                      </div>
                      {task.targetedDevices && (
                        <div className="flex items-center gap-1 text-[10px] text-zinc-500">
                          <Smartphone className="w-3 h-3" />
                          {task.targetedDevices.length} devices
                        </div>
                      )}
                      {task.targetedRegions && (
                        <div className="flex items-center gap-1 text-[10px] text-zinc-500">
                          <Globe className="w-3 h-3" />
                          {task.targetedRegions.length} countries
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedTask(task);
                        setIsStatisticsModalOpen(true);
                      }}
                      className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-bold transition-all"
                    >
                      View Stats
                    </button>
                    
                    {canEdit && (
                      <button
                        onClick={() => {
                          // Handle edit - you'll need to implement this
                          setAlert({ message: 'Edit functionality coming soon', type: 'info' });
                        }}
                        className="px-4 py-2 rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 text-sm font-bold transition-all"
                      >
                        Edit
                      </button>
                    )}
                    
                    {(task.status !== 'Rejected' || task.status !== 'Pending') && clicksRemaining > 0 && (
                      <button
                        onClick={() => handleTaskStatusToggle(task._id, task.status)}
                        disabled={loadingTaskId === task._id}
                        className="px-4 py-2 rounded-xl bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 text-sm font-bold transition-all disabled:opacity-50"
                      >
                        {loadingTaskId === task._id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : task.status === 'Paused' ? (
                          <PlayCircle className="w-4 h-4" />
                        ) : (
                          <PauseCircle className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress bar for clicks */}
                {clicksRemaining > 0 && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-zinc-500">Progress</span>
                      <span className="font-mono">
                        {Math.round(((task.clicked || 0) / ((task.clicks || 0) + (task.clicked || 0))) * 100)}%
                      </span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-bull-orange to-orange-500 rounded-full transition-all duration-300"
                        style={{
                          width: `${((task.clicked || 0) / ((task.clicks || 0) + (task.clicked || 0))) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Statistics Modal */}
      <AnimatePresence>
        {isStatisticsModalOpen && selectedTask && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200]"
              onClick={() => setIsStatisticsModalOpen(false)}
            />
            
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30 }}
              className="fixed right-0 top-0 h-full w-full max-w-2xl bg-bull-card border-l border-white/10 shadow-2xl z-[201] overflow-y-auto"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6 sticky top-0 bg-bull-card pt-2 pb-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsStatisticsModalOpen(false)}
                      className="w-8 h-8 rounded-full hover:bg-white/5 flex items-center justify-center"
                    >
                      <ChevronDown className="w-4 h-4 rotate-90" />
                    </button>
                    <div>
                      <h3 className="text-xl font-display font-bold">{selectedTask.taskTitle}</h3>
                      <p className="text-xs text-zinc-500 mt-1">
                        Created {new Date(selectedTask.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(selectedTask.status, selectedTask.clicks || 0)} border-current/20 bg-current/10`}>
                    {selectedTask.clicks === 0 ? 'Completed' : selectedTask.status}
                  </div>
                </div>

                {/* Click Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="p-4 rounded-xl bg-white/5">
                    <div className="flex items-center gap-2 mb-2">
                      <Eye className="w-4 h-4 text-bull-orange" />
                      <p className="text-[10px] text-zinc-500">Remaining</p>
                    </div>
                    <p className="text-2xl font-display font-bold">{(selectedTask.clicks || 0).toLocaleString()}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                      <p className="text-[10px] text-zinc-500">Delivered</p>
                    </div>
                    <p className="text-2xl font-display font-bold">{(selectedTask.clicked || 0).toLocaleString()}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-4 h-4 text-blue-400" />
                      <p className="text-[10px] text-zinc-500">Spent</p>
                    </div>
                    <p className="text-2xl font-display font-bold">
                      ${calculateTaskValue(selectedTask).toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                {!(selectedTask.status === 'Pending' || selectedTask.status === 'Rejected' || selectedTask.clicks === 0) && (
                  <div className="flex gap-3 mb-6">
                    <button
                      onClick={() => handleTaskStatusToggle(selectedTask._id, selectedTask.status)}
                      disabled={loadingTaskId === selectedTask._id}
                      className="flex-1 py-3 rounded-xl bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 font-bold transition-all disabled:opacity-50"
                    >
                      {loadingTaskId === selectedTask._id ? (
                        <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                      ) : selectedTask.status === 'Paused' ? (
                        'Continue Task'
                      ) : (
                        'Pause Task'
                      )}
                    </button>
                    <button
                      onClick={() => setOpenBuyBox(!openBuyBox)}
                      className="flex-1 py-3 rounded-xl bg-bull-orange font-bold hover:bg-orange-600 transition-all"
                    >
                      Add Clicks
                    </button>
                  </div>
                )}

                {/* Buy Clicks Section */}
                {openBuyBox && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-6 p-4 rounded-xl bg-white/5 border border-bull-orange/20"
                  >
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="p-3 rounded-lg bg-white/5">
                        <p className="text-[10px] text-zinc-500 mb-1">Cost Per Click</p>
                        <p className="text-lg font-bold text-bull-orange">
                          {calculateCostPerClick(selectedTask).toFixed(0)} BULLFI
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-white/5">
                        <p className="text-[10px] text-zinc-500 mb-1">Total Cost</p>
                        <p className="text-lg font-bold text-emerald-400">
                          {totalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })} BULLFI
                        </p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-xs text-zinc-500 mb-2">Number of clicks to add (min: 1,000)</p>
                      <input
                        type="number"
                        value={clicksToAdd}
                        onChange={(e) => setClicksToAdd(Math.max(1000, parseInt(e.target.value) || 1000))}
                        min="1000"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-bull-orange"
                      />
                    </div>

                    <button
                      onClick={handlePurchaseClicks}
                      disabled={isPurchasing || clicksToAdd < 1000}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-bull-orange to-orange-600 font-bold hover:scale-[1.02] transition-all disabled:opacity-50"
                    >
                      {isPurchasing ? (
                        <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                      ) : (
                        'Purchase Clicks'
                      )}
                    </button>
                  </motion.div>
                )}

                {/* Traffic Analysis */}
                <h4 className="font-display font-bold text-lg mb-4">Traffic Analysis</h4>

                {/* Countries */}
                <div className="mb-6">
                  <h5 className="font-bold mb-3 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-bull-orange" />
                    Countries
                  </h5>
                  {countryStats.length > 0 ? (
                    <div className="space-y-2">
                      {countryStats.map((country, index) => (
                        <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                          <div className="flex items-center gap-2">
                            {getFlagUrl(country.name) && (
                              <img
                                src={getFlagUrl(country.name)}
                                alt={country.name}
                                className="w-5 h-4 object-cover rounded"
                              />
                            )}
                            <span className="text-sm">{country.name}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-zinc-500">{country.count}</span>
                            <span className="text-xs font-mono text-emerald-400">{country.percentage}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-zinc-500">No country data available</p>
                  )}
                </div>

                {/* Devices */}
                <div className="mb-6">
                  <h5 className="font-bold mb-3 flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-bull-orange" />
                    Devices
                  </h5>
                  {deviceStats.length > 0 ? (
                    <div className="space-y-2">
                      {deviceStats.map((device, index) => (
                        <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                          <span className="text-sm">{device.name}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-zinc-500">{device.count}</span>
                            <span className="text-xs font-mono text-emerald-400">{device.percentage}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-zinc-500">No device data available</p>
                  )}
                </div>

                {/* Genders */}
                <div className="mb-6">
                  <h5 className="font-bold mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4 text-bull-orange" />
                    Genders
                  </h5>
                  {genderStats.length > 0 ? (
                    <div className="space-y-2">
                      {genderStats.map((gender, index) => (
                        <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                          <span className="text-sm">{gender.name}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-zinc-500">{gender.count}</span>
                            <span className="text-xs font-mono text-emerald-400">{gender.percentage}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-zinc-500">No gender data available</p>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MyAds;