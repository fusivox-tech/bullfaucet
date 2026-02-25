// contexts/WebSocketContext.tsx
import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import io, { Socket } from 'socket.io-client';

interface GlobalActivity {
  _id?: string;
  id?: string;
  type: string;
  description: string;
  timestamp: string;
  amount?: number;
  username?: string;
  userImage?: string;
}

interface CommunityNotification {
  _id: string;
  type: string;
  message: string;
  read: boolean;
  readAt?: string;
  createdAt: string;
  data?: any;
}

interface WebSocketContextType {
  // Connection state
  isConnected: boolean;
  socketEnabled: boolean;
  
  // Global activities
  globalActivities: GlobalActivity[];
  
  // Community notifications
  communityNotifications: CommunityNotification[];
  unreadCommunityCount: number;
  
  // Socket methods
  authenticate: (userId: string, token: string) => void;
  requestInitialActivities: () => void;
  emit: (event: string, data: any) => void;
  on: (event: string, callback: (data: any) => void) => () => void;
  off: (event: string, callback: (data: any) => void) => void;
  
  // Community methods
  joinCommunity: (userId: string) => void;
  requestCommunityNotifications: (userId: string, limit?: number) => void;
  markNotificationRead: (notificationId: string, userId: string) => void;
  markAllNotificationsRead: (userId: string) => void;
  
  // Control methods
  setSocketEnabled: (enabled: boolean) => void;
  
  // Utility methods
  clearCommunityNotifications: () => void;
  removeCommunityNotification: (notificationId: string) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [socketEnabled, setSocketEnabled] = useState(true);
  const [globalActivities, setGlobalActivities] = useState<GlobalActivity[]>([]);
  const [communityNotifications, setCommunityNotifications] = useState<CommunityNotification[]>([]);
  const [unreadCommunityCount, setUnreadCommunityCount] = useState(0);
  const isMountedRef = useRef(true);
  const eventHandlersRef = useRef(new Set<{ event: string; callback: (data: any) => void }>());
  const eventTimers = useRef(new Map<string, NodeJS.Timeout>());

// Initialize socket connection
useEffect(() => {
  isMountedRef.current = true;

  const currentEventTimers = eventTimers.current;

  if (!socketEnabled) {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    }
    return;
  }

  // Initialize new socket connection
  const newSocket = io('https://server2.bullfaucet.com', {
    transports: ['websocket', 'polling'],
    withCredentials: true,
    autoConnect: true,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5
  });

  socketRef.current = newSocket;

  const handleConnect = () => {
    if (isMountedRef.current) {
      console.log('✅ Connected to WebSocket');
      setIsConnected(true);
      
      // Request initial data
      newSocket.emit('request_initial_global_activities');
    }
  };

  const handleDisconnect = () => {
    if (isMountedRef.current) {
      console.log('❌ Disconnected from WebSocket');
      setIsConnected(false);
    }
  };

  const handleConnectError = (error: Error) => {
    if (isMountedRef.current) {
      console.error('WebSocket connection error:', error);
      setIsConnected(false);
    }
  };

  // Global Activity Handlers
  const handleNewGlobalActivity = (activity: GlobalActivity) => {
    if (!isMountedRef.current) return;
    const id = activity._id || activity.id || Math.random().toString();
    if (currentEventTimers.has(id)) return;
    
    const timeoutId = setTimeout(() => {
      if (isMountedRef.current) {
        setGlobalActivities(prev => {
          const MAX_GLOBAL = 20;
          const next = [activity, ...prev];
          if (next.length > MAX_GLOBAL) next.length = MAX_GLOBAL;
          return next;
        });
      }
      currentEventTimers.delete(id);
    }, 50);
    currentEventTimers.set(id, timeoutId);
  };

  const handleGlobalActivityBatch = (data: { action: string; activities: GlobalActivity[] }) => {
    if (data.action === 'initial_global_activities' && isMountedRef.current) {
      setGlobalActivities(data.activities);
    }
  };

  // Community Notification Handlers
  const handleCommunityNotification = (notification: CommunityNotification) => {
    if (!isMountedRef.current) return;
    
    const id = notification._id;
    if (currentEventTimers.has(`notification_${id}`)) return;
    
    const timeoutId = setTimeout(() => {
      if (isMountedRef.current) {
        setCommunityNotifications(prev => {
          const MAX_NOTIFICATIONS = 50;
          const next = [notification, ...prev];
          if (next.length > MAX_NOTIFICATIONS) next.length = MAX_NOTIFICATIONS;
          return next;
        });

        if (!notification.read) {
          setUnreadCommunityCount(prev => prev + 1);
        }
      }
      currentEventTimers.delete(`notification_${id}`);
    }, 50);
    
    currentEventTimers.set(`notification_${id}`, timeoutId);
  };

  const handleCommunityNotificationsBatch = (data: { 
    action: string; 
    notifications: CommunityNotification[]; 
    unreadCount: number 
  }) => {
    if (data.action === 'initial_notifications' && isMountedRef.current) {
      setCommunityNotifications(data.notifications);
      setUnreadCommunityCount(data.unreadCount);
    }
  };

  const handleUnreadCountUpdate = (data: { unreadCount: number }) => {
    if (isMountedRef.current) {
      setUnreadCommunityCount(data.unreadCount);
    }
  };

  const handleNotificationMarkedRead = (data: { success: boolean; notificationId: string }) => {
    if (isMountedRef.current && data.success) {
      setCommunityNotifications(prev => 
        prev.map(notif => 
          notif._id === data.notificationId 
            ? { ...notif, read: true, readAt: new Date().toISOString() }
            : notif
        )
      );
      
      setUnreadCommunityCount(prev => Math.max(0, prev - 1));
    }
  };

  const handleAllNotificationsMarkedRead = (data: { success: boolean }) => {
    if (isMountedRef.current && data.success) {
      setCommunityNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true, readAt: new Date().toISOString() }))
      );
      setUnreadCommunityCount(0);
    }
  };

  // Register event listeners
  newSocket.on('connect', handleConnect);
  newSocket.on('disconnect', handleDisconnect);
  newSocket.on('connect_error', handleConnectError);
  
  // Global activities
  newSocket.on('new_global_activity', handleNewGlobalActivity);
  newSocket.on('global_activity_batch', handleGlobalActivityBatch);
  
  // Community notifications
  newSocket.on('community_notification', handleCommunityNotification);
  newSocket.on('community_notifications_batch', handleCommunityNotificationsBatch);
  newSocket.on('unread_count_update', handleUnreadCountUpdate);
  newSocket.on('notification_marked_read', handleNotificationMarkedRead);
  newSocket.on('all_notifications_marked_read', handleAllNotificationsMarkedRead);

  // Request initial activities if already connected
  if (newSocket.connected) {
    newSocket.emit('request_initial_global_activities');
  }

  // Cleanup
  return () => {
    isMountedRef.current = false;
    
    if (newSocket) {
      // Remove all event listeners
      newSocket.off('connect', handleConnect);
      newSocket.off('disconnect', handleDisconnect);
      newSocket.off('connect_error', handleConnectError);
      newSocket.off('new_global_activity', handleNewGlobalActivity);
      newSocket.off('global_activity_batch', handleGlobalActivityBatch);
      newSocket.off('community_notification', handleCommunityNotification);
      newSocket.off('community_notifications_batch', handleCommunityNotificationsBatch);
      newSocket.off('unread_count_update', handleUnreadCountUpdate);
      newSocket.off('notification_marked_read', handleNotificationMarkedRead);
      newSocket.off('all_notifications_marked_read', handleAllNotificationsMarkedRead);
      newSocket.disconnect();
    }

    // Clear all timers
    currentEventTimers.forEach((timeoutId) => clearTimeout(timeoutId));
    currentEventTimers.clear();
    
    // Clear event handlers set
    eventHandlersRef.current.clear();
  };
}, [socketEnabled]);

  // Socket methods
  const authenticate = useCallback((userId: string, token: string) => {
    if (socketRef.current && isMountedRef.current && socketEnabled) {
      socketRef.current.emit('authenticate', { userId, token });
    }
  }, [socketEnabled]);

  const requestInitialActivities = useCallback(() => {
    if (socketRef.current && isConnected && isMountedRef.current && socketEnabled) {
      socketRef.current.emit('request_initial_global_activities');
    }
  }, [isConnected, socketEnabled]);

  const emit = useCallback((event: string, data: any) => {
    if (socketRef.current && isConnected && isMountedRef.current && socketEnabled) {
      socketRef.current.emit(event, data);
    } else {
      console.warn(`⚠️ Cannot emit ${event}: Socket not connected or disabled`);
    }
  }, [isConnected, socketEnabled]);

  const on = useCallback((event: string, callback: (data: any) => void) => {
    if (socketRef.current && isMountedRef.current && socketEnabled) {
      socketRef.current.on(event, callback);
      
      const handler = { event, callback };
      eventHandlersRef.current.add(handler);
      
      return () => {
        if (socketRef.current) {
          socketRef.current.off(event, callback);
          eventHandlersRef.current.delete(handler);
        }
      };
    }
    return () => {};
  }, [socketEnabled]);

  const off = useCallback((event: string, callback: (data: any) => void) => {
    if (socketRef.current && isMountedRef.current) {
      socketRef.current.off(event, callback);
      
      eventHandlersRef.current.forEach(handler => {
        if (handler.event === event && handler.callback === callback) {
          eventHandlersRef.current.delete(handler);
        }
      });
    }
  }, []);

  // Community notification methods
  const requestCommunityNotifications = useCallback((userId: string, limit = 20) => {
    if (socketRef.current && isConnected && isMountedRef.current && socketEnabled) {
      socketRef.current.emit('request_community_notifications', { userId, limit });
    } else {
      console.warn('⚠️ Cannot request community notifications: Socket not connected');
    }
  }, [isConnected, socketEnabled]);

  const markNotificationRead = useCallback((notificationId: string, userId: string) => {
    if (socketRef.current && isConnected && isMountedRef.current && socketEnabled) {
      socketRef.current.emit('mark_notification_read', { notificationId, userId });
    } else {
      console.warn('⚠️ Cannot mark notification as read: Socket not connected');
    }
  }, [isConnected, socketEnabled]);

  const markAllNotificationsRead = useCallback((userId: string) => {
    if (socketRef.current && isConnected && isMountedRef.current && socketEnabled) {
      socketRef.current.emit('mark_all_notifications_read', { userId });
    } else {
      console.warn('⚠️ Cannot mark all notifications as read: Socket not connected');
    }
  }, [isConnected, socketEnabled]);

  const joinCommunity = useCallback((userId: string) => {
    if (socketRef.current && isConnected && isMountedRef.current && socketEnabled) {
      socketRef.current.emit('join_community', { userId });
    } else {
      console.warn('⚠️ Cannot join community: Socket not connected');
    }
  }, [isConnected, socketEnabled]);

  // Utility methods
  const clearCommunityNotifications = useCallback(() => {
    setCommunityNotifications([]);
    setUnreadCommunityCount(0);
  }, []);

  const removeCommunityNotification = useCallback((notificationId: string) => {
    setCommunityNotifications(prev => 
      prev.filter(notif => notif._id !== notificationId)
    );
  }, []);

  const value: WebSocketContextType = {
    isConnected,
    socketEnabled,
    globalActivities,
    communityNotifications,
    unreadCommunityCount,
    authenticate,
    requestInitialActivities,
    emit,
    on,
    off,
    joinCommunity,
    requestCommunityNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    setSocketEnabled,
    clearCommunityNotifications,
    removeCommunityNotification,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};