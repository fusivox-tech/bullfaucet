// hooks/useGlobalActivities.ts
import { useState, useCallback, useEffect, useMemo } from 'react';
import { useWebSocket } from '../contexts/WebSocketContext';
import API_BASE_URL from '../config';

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

export const useGlobalActivities = (initialLimit = 20) => {
  const { 
    globalActivities: socketActivities, 
    isConnected,
    socketEnabled
  } = useWebSocket();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [localActivities, setLocalActivities] = useState<GlobalActivity[]>([]);

  // Combine socket activities with locally fetched ones
  const activities = useMemo(() => {
    return [...socketActivities, ...localActivities];
  }, [socketActivities, localActivities]);

  // Fetch global activities from API (for infinite scroll)
  const fetchGlobalActivities = useCallback(async (limit = 50, before: Date | null = null) => {
    if (!socketEnabled) return [];

    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        limit: limit.toString(),
        ...(before && { before: before.toISOString() })
      });

      const response = await fetch(`${API_BASE_URL}/activities/global?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();

      if (data.success) {
        if (before) {
          // Append to local activities for infinite scroll
          setLocalActivities(prev => [...prev, ...data.activities]);
        } else {
          // Replace local activities for initial load
          setLocalActivities(data.activities);
        }
        
        // Check if there are more activities to load
        setHasMore(data.activities.length === limit);
        return data.activities;
      } else {
        setError(data.error || 'Failed to fetch global activities');
        return [];
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch global activities');
      console.error('Error fetching global activities:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [socketEnabled]);

  // Load more activities for infinite scroll
  const loadMore = useCallback(() => {
    if (!socketEnabled || loading || !hasMore) return;
    
    const allActivities = [...socketActivities, ...localActivities];
    
    if (allActivities.length > 0) {
      const last = allActivities[allActivities.length - 1];
      fetchGlobalActivities(50, new Date(last.timestamp));
    } else {
      fetchGlobalActivities(50);
    }
  }, [localActivities, socketActivities, hasMore, loading, fetchGlobalActivities, socketEnabled]);

  // Initial load
  useEffect(() => {
    if (socketEnabled) {
      fetchGlobalActivities(initialLimit);
    }
  }, [fetchGlobalActivities, socketEnabled, initialLimit]);

  return {
    activities,
    loading,
    error,
    hasMore,
    fetchGlobalActivities,
    loadMore,
    isConnected,
    socketEnabled
  };
};