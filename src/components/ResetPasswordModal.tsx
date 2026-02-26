// components/ResetPasswordModal.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Eye, EyeOff, AlertCircle, Mail, KeyRound, Lock } from 'lucide-react';
import API_BASE_URL from '../config';
import OtpInput from './OTP';

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  setAlert: (alert: { message: string; type: string }) => void;
}

const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
  isOpen,
  onClose,
  email,
  setAlert,
}) => {
  const [step, setStep] = useState(1); // 1: Enter Email (pre-filled), 2: Enter OTP, 3: Reset Password
  const [resetLoading, setResetLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [repeatPasswordVisible, setRepeatPasswordVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      // Reset all states when modal closes
      setTimeout(() => {
        setStep(1);
        setOtp("");
        setPassword("");
        setRepeatPassword("");
        setPasswordStrength(0);
        setPasswordVisible(false);
        setRepeatPasswordVisible(false);
        setResetLoading(false);
      }, 300);
    }
  }, [isOpen]);

  // Email validation function
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Password strength checker
  const checkPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[\W_]/.test(password)) strength++;
    return strength;
  };

  // Handle password change and update strength
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setPasswordStrength(checkPasswordStrength(newPassword));
  };

  const handleComplete = (enteredOtp: string) => {
    setOtp(enteredOtp);
  };

  const sendOtp = async () => {
    
    setResetLoading(true);

    if (!isValidEmail(email)) {
      setAlert({ message: "Please enter a valid email.", type: "error" });
      setResetLoading(false);
      return;
    }

    try {
      // Step 1: Check if email exists
      const checkResponse = await fetch(`${API_BASE_URL}/auth/check-email-exist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const checkData = await checkResponse.json();
      
      if (checkResponse.status === 404) {
        setAlert({ message: checkData.message, type: "error" });
        setResetLoading(false);
        return;
      }

      if (!checkResponse.ok) {
        setAlert({ message: "Something went wrong.", type: "error" });
        setResetLoading(false);
        return;
      }

      // Step 2: Send OTP if email exists
      const response = await fetch(`${API_BASE_URL}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (response.ok) {
        setStep(2);
        setAlert({ message: "OTP sent! Check your email.", type: "success" });
      } else {
        setAlert({ message: data.message, type: "error" });
      }
    } catch (error) {
      console.error("OTP error:", error);
      setAlert({ message: "Failed to send OTP", type: "error" });
    } finally {
      setResetLoading(false);
    }
  };

  const handleVerify = async () => {
    setResetLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (response.ok) {
        setStep(3);
        setAlert({ message: "OTP verified! Set a new password.", type: "success" });
      } else {
        setAlert({ message: data.message || "Invalid OTP", type: "error" });
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      setAlert({ message: "Something went wrong.", type: "error" });
    } finally {
      setResetLoading(false);
    }
  };

  // Handle password reset
  const handleResetPassword = async () => {
    setResetLoading(true);

    if (passwordStrength < 4) {
      setAlert({ message: "Password is too weak. Use a stronger password.", type: "error" });
      setResetLoading(false);
      return;
    }

    if (password !== repeatPassword) {
      setAlert({ message: "Passwords do not match!", type: "error" });
      setResetLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        setAlert({ message: "Password reset successfully!", type: "success" });
        // Close modal after successful reset
        setTimeout(() => {
          handleClose();
        }, 1500);
      } else {
        setAlert({ message: data.message, type: "error" });
      }
    } catch (error) {
      setAlert({ message: "Password reset failed.", type: "error" });
    }
    setResetLoading(false);
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300);
  };

  // Get password strength text and color
  const getStrengthInfo = () => {
    if (passwordStrength === 0) return { text: 'Enter password', color: 'text-zinc-500' };
    if (passwordStrength === 1) return { text: 'Very weak', color: 'text-red-400' };
    if (passwordStrength === 2) return { text: 'Weak', color: 'text-orange-400' };
    if (passwordStrength === 3) return { text: 'Fair', color: 'text-yellow-400' };
    if (passwordStrength === 4) return { text: 'Good', color: 'text-emerald-400' };
    if (passwordStrength === 5) return { text: 'Strong', color: 'text-green-500' };
    return { text: '', color: '' };
  };

  const strengthInfo = getStrengthInfo();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={handleClose}
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25 }}
            className={`relative w-full max-w-md rounded-3xl glass border border-white/10 overflow-hidden max-h-[90vh] overflow-y-auto scrollbar-hide transform transition-all duration-300 ${
              isClosing ? 'scale-90 opacity-0' : 'scale-100 opacity-100'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-bull-orange/20 flex items-center justify-center">
                  <KeyRound className="w-5 h-5 text-bull-orange" />
                </div>
                <h3 className="text-xl font-display font-bold">Reset Password</h3>
              </div>
              <button
                onClick={handleClose}
                className="w-8 h-8 rounded-full hover:bg-white/5 flex items-center justify-center transition-colors"
                disabled={resetLoading}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              {/* Step 1: Email (pre-filled) */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="text-center mb-4">
                    <Mail className="w-12 h-12 mx-auto mb-3 text-bull-orange" />
                    <p className="text-zinc-400">
                      We'll send a verification code to your email address.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-zinc-400">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      readOnly
                      className="w-full bg-bull-dark border border-white/10 rounded-xl px-4 py-3 text-zinc-400 cursor-not-allowed"
                    />
                  </div>

                  <button
                    onClick={sendOtp}
                    disabled={resetLoading}
                    className="w-full py-3 rounded-xl bg-bull-orange text-white font-bold hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {resetLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      'Send OTP'
                    )}
                  </button>
                </div>
              )}

              {/* Step 2: OTP Verification */}
              {step === 2 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <p className="text-sm text-zinc-400 mb-4">
                      Enter the 6-digit code sent to <span className="text-bull-orange font-bold">{email}</span>
                    </p>
                    
                    <OtpInput length={6} onComplete={handleComplete} />
                  </div>

                  <button
                    onClick={handleVerify}
                    disabled={resetLoading || otp.length !== 6}
                    className="w-full py-3 rounded-xl bg-bull-orange text-white font-bold hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {resetLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      'Verify OTP'
                    )}
                  </button>

                  <button
                    onClick={sendOtp}
                    disabled={resetLoading}
                    className="w-full text-sm text-zinc-500 hover:text-bull-orange transition-colors"
                  >
                    Resend OTP
                  </button>
                </div>
              )}

              {/* Step 3: New Password */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="text-center mb-2">
                    <Lock className="w-12 h-12 mx-auto mb-3 text-emerald-400" />
                    <p className="text-sm text-zinc-400">
                      Create a strong new password for your account.
                    </p>
                  </div>

                  {/* New Password */}
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-zinc-400">New Password</label>
                    <div className="relative">
                      <input
                        type={passwordVisible ? "text" : "password"}
                        placeholder="Enter new password"
                        value={password}
                        onChange={handlePasswordChange}
                        className="w-full bg-bull-dark border border-white/10 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:border-bull-orange transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setPasswordVisible(!passwordVisible)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                      >
                        {passwordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Password Strength Indicator */}
                  <div className="space-y-2">
                    <div className="flex gap-1 h-1.5">
                      <div className={`flex-1 rounded-full transition-all duration-300 ${
                        passwordStrength >= 1 
                          ? passwordStrength >= 4 ? 'bg-emerald-500' : 'bg-yellow-500'
                          : 'bg-white/10'
                      }`} />
                      <div className={`flex-1 rounded-full transition-all duration-300 ${
                        passwordStrength >= 3 
                          ? passwordStrength >= 4 ? 'bg-emerald-500' : 'bg-yellow-500'
                          : 'bg-white/10'
                      }`} />
                      <div className={`flex-1 rounded-full transition-all duration-300 ${
                        passwordStrength >= 5 ? 'bg-emerald-500' : 'bg-white/10'
                      }`} />
                    </div>
                    <p className={`text-xs text-right ${strengthInfo.color}`}>
                      {strengthInfo.text}
                    </p>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-zinc-400">Confirm Password</label>
                    <div className="relative">
                      <input
                        type={repeatPasswordVisible ? "text" : "password"}
                        placeholder="Re-enter new password"
                        value={repeatPassword}
                        onChange={(e) => setRepeatPassword(e.target.value)}
                        className="w-full bg-bull-dark border border-white/10 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:border-bull-orange transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setRepeatPasswordVisible(!repeatPasswordVisible)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                      >
                        {repeatPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Password mismatch warning */}
                  {password !== repeatPassword && repeatPassword.length > 0 && (
                    <div className="flex items-center gap-2 text-xs text-red-400">
                      <AlertCircle size={14} />
                      <span>Passwords do not match</span>
                    </div>
                  )}

                  <button
                    onClick={handleResetPassword}
                    disabled={resetLoading || password !== repeatPassword || passwordStrength < 4}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-bull-orange to-orange-600 text-white font-bold hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
                  >
                    {resetLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Resetting...
                      </>
                    ) : (
                      'Reset Password'
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Footer with step indicator */}
            <div className="p-4 border-t border-white/10 bg-white/5">
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3].map((s) => (
                  <div
                    key={s}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      s === step 
                        ? 'w-6 bg-bull-orange' 
                        : s < step 
                          ? 'bg-emerald-400' 
                          : 'bg-white/20'
                    }`}
                  />
                ))}
              </div>
              <p className="text-center text-xs text-zinc-500 mt-2">
                Step {step} of 3: {step === 1 ? 'Email Verification' : step === 2 ? 'OTP Code' : 'New Password'}
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ResetPasswordModal;