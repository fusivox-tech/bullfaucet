import React, { useState, useEffect, useRef } from 'react';
import { X, AlertCircle, Mail, CheckCircle2 } from 'lucide-react';
import API_BASE_URL from '../config';

interface ProfileOTPVerificationModalProps {
  email: string;
  onClose: () => void;
  onVerified: () => void;
  setAlert: (alert: { message: string; type: string }) => void;
}

const ProfileOTPVerificationModal: React.FC<ProfileOTPVerificationModalProps> = ({
  email,
  onClose,
  onVerified,
  setAlert
}) => {
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(''));
  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

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

  // Send OTP to email
  const sendOtp = async () => {
    setSendingOtp(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/send-otp`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      if (response.ok) {
        setOtpSent(true);
        setTimeLeft(300);
        setCanResend(false);
        setAlert({ message: "OTP sent to your email!", type: "success" });
      } else {
        setAlert({ message: data.message || "Failed to send OTP", type: "error" });
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      setAlert({ message: "Failed to send OTP", type: "error" });
    } finally {
      setSendingOtp(false);
    }
  };

  // Handle OTP input change
  const handleChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle keydown for backspace
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);

    // Focus the next empty input or last input
    const nextIndex = Math.min(pastedData.length, 5);
    if (inputRefs.current[nextIndex]) {
      inputRefs.current[nextIndex]?.focus();
    }
  };

  // Verify OTP
  const verifyOtp = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setAlert({ message: "Please enter a valid 6-digit code", type: "error" });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ email, otp: otpString }),
      });

      const data = await response.json();
      if (response.ok) {
        setAlert({ message: "OTP verified successfully!", type: "success" });
        onVerified();
      } else {
        setAlert({ message: data.message || "Invalid or expired OTP", type: "error" });
        // Clear OTP inputs on error
        setOtp(new Array(6).fill(''));
        if (inputRefs.current[0]) {
          inputRefs.current[0].focus();
        }
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      setAlert({ message: "Failed to verify OTP", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Timer for OTP expiry
  useEffect(() => {
    if (!otpSent) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [otpSent]);

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Auto-send OTP when modal opens
  useEffect(() => {
    sendOtp();
  }, []);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="max-w-md w-full rounded-3xl glass border border-white/10 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h3 className="text-xl font-bold">Verify Your Identity</h3>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full glass flex items-center justify-center hover:bg-white/10 transition-all"
            disabled={loading}
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-start gap-3">
            <Mail className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-zinc-300 mb-1">
                We've sent a verification code to:
              </p>
              <p className="font-bold text-bull-orange">{email}</p>
            </div>
          </div>

          {!otpSent ? (
            <div className="flex flex-col items-center py-8">
              <div className="w-12 h-12 border-4 border-bull-orange border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-zinc-400">Sending verification code...</p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <label className="block text-sm font-bold text-zinc-400 mb-3 text-center">
                  Enter 6-digit verification code
                </label>
                <div className="flex gap-2 justify-center">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => {
                        inputRefs.current[index] = el;
                      }}
                      type="number"
                      value={digit}
                      onChange={(e) => handleChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={handlePaste}
                      className="w-12 h-12 text-center text-xl font-bold bg-bull-dark border border-white/10 rounded-xl focus:outline-none focus:border-bull-orange transition-colors"
                      maxLength={1}
                      disabled={loading}
                      inputMode="numeric"
                      pattern="[0-9]*"
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between mb-6 text-sm">
                <div className="flex items-center gap-1 text-zinc-500">
                  <AlertCircle size={14} />
                  <span>Code expires in {formatTime(timeLeft)}</span>
                </div>
                {canResend && (
                  <button
                    onClick={sendOtp}
                    disabled={sendingOtp}
                    className="text-bull-orange hover:text-orange-400 transition-colors font-bold"
                  >
                    {sendingOtp ? 'Sending...' : 'Resend Code'}
                  </button>
                )}
              </div>

              <button
                onClick={verifyOtp}
                disabled={loading || otp.join('').length !== 6}
                className="w-full py-3 rounded-xl bg-bull-orange hover:bg-orange-600 transition-all font-bold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Verifying...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={18} />
                    Verify & Continue
                  </>
                )}
              </button>

              <p className="text-xs text-zinc-500 text-center mt-4">
                For your security, we need to verify this change. The code is valid for 5 minutes.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileOTPVerificationModal;