import { useState, useEffect, useCallback } from 'react';

// Define proper types
interface Survey {
  id: string;
  title: string;
  // Add other survey properties as needed
  [key: string]: any;
}

interface CPXMessage {
  type: string;
  surveys?: Survey[];
  count?: number;
  transactions?: any;
  [key: string]: any;
}

interface UseCpxSurveysReturn {
  surveys: Survey[];
  cpxLoading: boolean;
  error: string | null;
  refreshSurveys: () => void;
  iframeLoaded: boolean;
}

export const useCpxSurveys = (appId: string | null, userId: string | null): UseCpxSurveysReturn => {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [iframeLoaded, setIframeLoaded] = useState<boolean>(false);

  // Handle messages from the CPX iframe
  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      // Parse the data safely
      let data: CPXMessage;
      try {
        data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
      } catch (e) {
        // Not a JSON message, ignore
        return;
      }
      
      // Check if it's a CPX message
      if (data && data.type) {
        console.log('CPX Message received:', data.type, data);
        
        switch (data.type) {
          case 'no_surveys':
            setSurveys([]);
            setError('No surveys available');
            setLoading(false);
            break;
          case 'survey_count':
            // You can track survey count if needed
            console.log('Survey count:', data.count);
            break;
          case 'all_surveys':
            setSurveys(data.surveys || []);
            setError(null);
            setLoading(false);
            break;
          case 'transaction':
            // Handle transaction data if needed
            console.log('Transaction:', data.transactions);
            break;
          case 'iframe_loaded':
            setIframeLoaded(true);
            break;
          default:
            console.log('Unknown CPX message type:', data.type);
        }
      }
    } catch (error) {
      console.error('Error parsing CPX message:', error);
      setError('Failed to load surveys');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Add event listener for messages from iframe
    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [handleMessage]);

  // Optional: Use appId and userId to initialize or fetch surveys
  useEffect(() => {
    if (appId && userId) {
      // You might want to initialize or log something here
      console.log(`Initializing CPX surveys for app ${appId} and user ${userId}`);
      
      // If you need to make an initial API call, do it here
      // fetchInitialSurveys(appId, userId);
    }
  }, [appId, userId]);

  const refreshSurveys = (): void => {
    setLoading(true);
    setError(null);
    setSurveys([]);
    // You might need to reload iframes here
    window.location.reload();
  };

  return {
    surveys,
    cpxLoading: loading,
    error,
    refreshSurveys,
    iframeLoaded
  };
};