// components/Notifications.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, 
  X, 
  CheckCheck, 
  Clock, 
  Loader2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useData } from '../contexts/DataContext';
import API_BASE_URL from '../config';

interface NotificationsProps {
  isOpen: boolean;
  onClose: () => void;
}

const Notifications: React.FC<NotificationsProps> = ({ isOpen, onClose }) => {
  const { 
    notifications, 
    setNotifications, 
    unreadCount, 
    setUnreadCount,
    isNotificationLoading 
  } = useData();
  
  const [isMarkingRead, setIsMarkingRead] = useState(false);
  const [expandedNotificationId, setExpandedNotificationId] = useState<string | null>(null);

  // Helper function to get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  // Handle authentication errors
  const handleAuthError = (error: Error) => {
    console.error('Authentication error:', error);
    if (error.message.includes('token') || error.message.includes('auth') || 
        error.message.includes('401') || error.message.includes('403')) {
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      setNotifications([]);
      setUnreadCount(0);
      return true;
    }
    return false;
  };

  const markAsRead = async (notificationId: string) => {
    try {
      setIsMarkingRead(true);
      
      // Optimistic UI update
      setNotifications(prev => prev.map(n => 
        n._id === notificationId ? {...n, read: true} : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));

      // API call to mark as read with authentication
      const headers = getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/user-read`, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify({
          userId: notifications.find(n => n._id === notificationId)?.recipient
        })
      });

      if (response.status === 401 || response.status === 403) {
        handleAuthError(new Error('Authentication failed'));
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }

    } catch (error) {
      console.error('Error marking notification as read:', error);
      if (!handleAuthError(error as Error)) {
        // Revert changes only if it's not an auth error
        // This would need the original notifications state
      }
    } finally {
      setIsMarkingRead(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      setIsMarkingRead(true);
      
      // Optimistic UI update
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);

      // API call to mark all as read with authentication
      const headers = getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/notifications/user-mark-all-read`, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify({
          userId: notifications[0]?.recipient
        })
      });

      if (response.status === 401 || response.status === 403) {
        handleAuthError(new Error('Authentication failed'));
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to mark all notifications as read');
      }

    } catch (error) {
      console.error('Error marking all as read:', error);
      if (!handleAuthError(error as Error)) {
        // Revert changes only if it's not an auth error
      }
    } finally {
      setIsMarkingRead(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const handleNotificationClick = (notificationId: string, isRead: boolean) => {
    // Toggle expansion
    setExpandedNotificationId(prev => prev === notificationId ? null : notificationId);
    
    // Mark as read if it's unread
    if (!isRead) {
      markAsRead(notificationId);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-bull-dark/80 backdrop-blur-sm z-[300]"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-bull-card border-l border-white/10 shadow-2xl z-[301] overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div>
                  <h2 className="text-xl font-display font-bold">Notifications</h2>
                  {unreadCount > 0 && (
                    <p className="text-xs text-bull-orange">{unreadCount} unread</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    disabled={isMarkingRead}
                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-bold transition-colors disabled:opacity-50 flex items-center gap-1"
                  >
                    <CheckCheck className="w-3 h-3" />
                    Mark all read
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full hover:bg-white/5 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="h-[calc(100%-80px)] overflow-y-auto p-4">
              {isNotificationLoading ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <Loader2 className="w-8 h-8 animate-spin text-bull-orange mb-3" />
                  <p className="text-sm text-zinc-400">Loading notifications...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-3">
                    <Bell className="w-8 h-8 text-zinc-600" />
                  </div>
                  <p className="text-zinc-400 font-medium">No notifications yet</p>
                  <p className="text-xs text-zinc-600 mt-1">
                    We'll notify you when something happens
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((notification: any) => {
                    const isExpanded = expandedNotificationId === notification._id;
                    
                    return (
                      <motion.div
                        key={notification._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 rounded-xl border transition-all cursor-pointer ${
                          notification.read 
                            ? 'bg-white/5 border-white/5 hover:border-white/10' 
                            : 'bg-bull-orange/10 border-bull-orange/20 hover:border-bull-orange/30'
                        }`}
                        onClick={() => handleNotificationClick(notification._id, notification.read)}
                      >
                        {/* Header section - always visible */}
                        <div className="flex gap-3">
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className={`font-bold text-sm ${
                                notification.read ? 'text-zinc-300' : 'text-white'
                              }`}>
                                {notification.title || 'System Alert'}
                              </h4>
                              
                              {/* Expand/Collapse Indicator */}
                              <div className="text-zinc-400">
                                {isExpanded ? (
                                  <ChevronUp className="w-4 h-4" />
                                ) : (
                                  <ChevronDown className="w-4 h-4" />
                                )}
                              </div>
                            </div>
                            
                            {/* Time - always visible */}
                            <div className="flex items-center gap-1 text-[10px] text-zinc-500 mt-1">
                              <Clock className="w-3 h-3" />
                              {formatDate(notification.createdAt)}
                            </div>
                            
                            {/* Expanded Content - shows when clicked */}
                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="overflow-hidden"
                                >
                                  <div className="pt-3 mt-2 border-t border-white/10">
                                    <p className="text-xs text-zinc-400">
                                      {notification.message}
                                    </p>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                          
                          {/* Unread indicator */}
                          {!notification.read && (
                            <div className="w-2 h-2 rounded-full bg-bull-orange flex-shrink-0 mt-1" />
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Notifications;