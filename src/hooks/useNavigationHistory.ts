// hooks/useNavigationHistory.ts
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export const useNavigationHistory = () => {
  const location = useLocation();
  const historyRef = useRef<string[]>([]);
  
  useEffect(() => {
    historyRef.current.push(location.pathname);
    // Keep only last 50 entries
    if (historyRef.current.length > 50) {
      historyRef.current.shift();
    }
  }, [location]);
  
  const getPreviousPath = () => {
    return historyRef.current[historyRef.current.length - 2] || '/dashboard';
  };
  
  return { getPreviousPath };
};