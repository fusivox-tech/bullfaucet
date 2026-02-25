import React, { useState } from "react";
import { X, AlertCircle, CheckCircle2 } from 'lucide-react';
import API_BASE_URL from "../config";
import OtpInput from './OTP';

interface TwoFAModalProps {
  user: any;
  onClose: () => void;
  setAlert: (alert: { message: string; type: string }) => void;
}

const TwoFAModal: React.FC<TwoFAModalProps> = ({ user, onClose, setAlert }) => {
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  
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

  const handleAuthError = (error: Error) => {
    console.error('Authentication error:', error);
    if (error.message.includes('token') || error.message.includes('auth') || 
        error.message.includes('401') || error.message.includes('403')) {
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      setAlert({ message: 'Session expired. Please log in again.', type: "error" });
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
      return true;
    }
    return false;
  };

  const sendOtp = async () => {
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/send-otp`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ email: user?.email }),
      });
      
      const data = await response.json();
      if (response.ok) {
        setOtpSent(true);
        setAlert({ message: "OTP sent! Check your email.", type: "success" });
      } else {
        setAlert({ message: data.message, type: "error" });
      }
    } catch (error) {
      if (!handleAuthError(error as Error)) {
        setAlert({ message: "Failed to send OTP", type: "error" });
      }
      console.error("OTP error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handle2FAToggle = async (e: React.FormEvent) => {
    e.preventDefault();
    const enable2FA = !user?.twoFAEnabled;
    setLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/users/toggle-2fa`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ 
          userId: user?._id, 
          email: user?.email, 
          enable: enable2FA, 
          otp 
        })
      });

      const data = await response.json();
      if (response.ok) {
        setAlert({ message: data.message, type: "success" });
        setTimeout(() => {
          onClose();
          window.location.reload(); // Refresh to update user state
        }, 2000);
      } else {
        setAlert({ message: data.message, type: "error" });
      }
    } catch (error) {
      if (!handleAuthError(error as Error)) {
        setAlert({ message: "Failed to update 2FA status.", type: "error" });
      }
    }
    setLoading(false);
  };

  const handleComplete = (enteredOtp: string) => {
    setOtp(enteredOtp);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="max-w-md w-full rounded-3xl glass border border-white/10 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h3 className="text-xl font-bold">
            {user?.twoFAEnabled ? "Disable Email 2FA" : "Enable Email 2FA"}
          </h3>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full glass flex items-center justify-center hover:bg-white/10 transition-all"
          >
            <X size={16} />
          </button>
        </div>
        
        <form onSubmit={handle2FAToggle} className="p-6">
          {!otpSent && (
            <>
              <div className="flex items-center gap-3 mb-4 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <p className="text-sm text-zinc-300">
                  {user?.twoFAEnabled
                    ? "Are you sure you want to disable Two-Factor Authentication?"
                    : "When there is a login attempt, you will receive a One-Time Password (OTP) in your email to authenticate the login."}
                </p>
              </div>

              <button 
                className="w-full py-3 rounded-xl bg-bull-orange hover:bg-orange-600 transition-all font-bold disabled:opacity-50"
                type="button" 
                onClick={sendOtp} 
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Sending...
                  </div>
                ) : (
                  user?.twoFAEnabled ? "Disable 2FA" : "Enable 2FA"
                )}
              </button>
            </>
          )}
          
          {otpSent && (
            <>
              <div className="flex items-center gap-3 mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <p className="text-sm text-zinc-300">
                  Enter the 6-digit verification code sent to your email address. 
                  This code is valid for 5 minutes.
                </p>
              </div>
              
              <div className="mb-6">
                <OtpInput length={6} onComplete={handleComplete} />
              </div>

              <button 
                className="w-full py-3 rounded-xl bg-bull-orange hover:bg-orange-600 transition-all font-bold disabled:opacity-50"
                type="submit" 
                disabled={loading || otp.length !== 6}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Verifying...
                  </div>
                ) : (
                  "Confirm"
                )}
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default TwoFAModal;