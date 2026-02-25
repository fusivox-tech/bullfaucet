import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

const FullscreenIframe: React.FC = () => {
  const [searchParams] = useSearchParams();
  const url = searchParams.get('url');
  const duration = parseInt(searchParams.get('duration') || '15', 10);
  const taskId = searchParams.get('taskId');
  
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isComplete, setIsComplete] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const timeLeftRef = useRef(timeLeft);

  // Keep ref updated for the interval
  useEffect(() => {
    timeLeftRef.current = timeLeft;
  }, [timeLeft]);

  // Communicate with the main window
  const notifyDashboard = useCallback((time: number, paused: boolean) => {
    if (window.opener) {
      window.opener.postMessage({
        type: 'TASK_PROGRESS',
        taskId: taskId,
        timeLeft: time,
        isPaused: paused
      }, '*');
    }
  }, [taskId]);

  const startTimer = useCallback((compensationTime = 0) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsPaused(false);
    
    let startingTime = timeLeftRef.current;
    if (compensationTime > 0) {
      startingTime = Math.max(0, startingTime - compensationTime);
      setTimeLeft(startingTime);
      timeLeftRef.current = startingTime;
    }
    
    if (startingTime <= 0) {
      setIsComplete(true);
      return;
    }
    
    timerRef.current = setInterval(() => {
      const newTime = timeLeftRef.current - 1;
      
      // Update parent dashboard
      notifyDashboard(Math.max(0, newTime), false);

      if (newTime <= 0) {
        clearInterval(timerRef.current!);
        setTimeLeft(0);
        setIsComplete(true);
      } else {
        setTimeLeft(newTime);
        timeLeftRef.current = newTime;
        setProgress(((duration - newTime) / duration) * 100);
      }
    }, 1000);
  }, [duration, notifyDashboard]);

  const pauseTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
      setIsPaused(true);
      // Let dashboard know it paused
      notifyDashboard(timeLeftRef.current, true);
    }
  }, [notifyDashboard]);

  // Pause if user switches away from the Ad
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        pauseTimer();
      } else if (!isComplete) {
        startTimer();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isComplete, pauseTimer, startTimer]);

  // Initial mount logic
  useEffect(() => {
    if (!document.hidden) {
      startTimer();
    } else {
      setIsPaused(true);
      notifyDashboard(duration, true);
    }
    return () => { 
      if (timerRef.current) clearInterval(timerRef.current); 
    };
  }, [duration, startTimer, notifyDashboard]);

  // Completion Signal
  useEffect(() => {
    if (isComplete) {
      if (window.opener) {
        window.opener.postMessage({ type: 'TASK_COMPLETED', taskId }, '*');
      }
      // Redirect to the target site after completion
      setTimeout(() => { 
        if (url) window.location.href = url; 
      }, 1000);
    }
  }, [isComplete, url, taskId]);

  const styles = {
    container: { 
      position: 'fixed' as const, 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0, 
      backgroundColor: '#000', 
      zIndex: 9999 
    },
    header: { 
      position: 'fixed' as const, 
      top: 0, 
      left: 0, 
      right: 0, 
      height: '40px', 
      backgroundColor: '#1a1a1a', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center' as const 
    },
    progressFill: { 
      position: 'absolute' as const, 
      top: 0, 
      left: 0, 
      height: '4px', 
      transition: 'width 1s linear', 
      zIndex: 1,
      backgroundColor: isPaused ? '#ff4d4d' : '#4CAF50'
    },
    statusText: { 
      color: '#fff', 
      fontSize: '14px', 
      fontWeight: 'bold' as const, 
      zIndex: 2 
    },
    iframe: { 
      position: 'absolute' as const, 
      top: '40px', 
      left: 0, 
      width: '100%', 
      height: 'calc(100% - 40px)', 
      border: 'none' 
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={{ ...styles.progressFill, width: `${progress}%` }} />
        <div style={styles.statusText}>
          {isPaused ? 'TIMER PAUSED - Return to this page' : `Ad Progress: ${timeLeft}s`}
        </div>
      </div>
      
      {url && (
        <iframe 
          src={url} 
          style={styles.iframe} 
          title="Task Site" 
          allow="autoplay; fullscreen" 
        />
      )}
    </div>
  );
};

export default FullscreenIframe;