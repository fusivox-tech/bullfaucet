import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { X, Eye, EyeOff, AlertCircle, CheckCircle2, ChevronLeft } from 'lucide-react';
import ReCAPTCHA from "react-google-recaptcha";
import API_BASE_URL from "../config";
import fallbackCountries from '../fallbackCountries.json';
import { TwoFAModal } from './TwoFAModal';
import { MultiFactorModal } from './MultiFactorModal';
import GoogleLoginButton from './GoogleLoginButton';
import CustomDropdown from './CustomDropdown';
import OtpInput from './OTP';

const Alert = ({ alert }: { alert: { message: string, type: string } }) => {
  if (!alert.message) return null;
  return (
    <div className={`p-3 rounded-xl mb-4 flex items-center gap-2 text-sm font-bold ${alert.type === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : alert.type === 'warning' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
      {alert.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
      {alert.message}
    </div>
  );
};

const OtpModal = ({ otp, setOtp, onClose, onSubmit, sendOtp, resendDisabled, resendCountdown, isLoading }: any) => (
  <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-bull-dark/80 backdrop-blur-sm scrollbar-hide">
    <div className="bg-bull-card p-6 rounded-2xl border border-white/10 w-full max-w-sm relative">
      <button onClick={onClose} className="absolute top-4 right-4 text-zinc-400 hover:text-white"><X className="w-5 h-5" /></button>
      <h3 className="text-xl font-display font-bold mb-4">Enter OTP</h3>
      <p className="text-sm text-zinc-400 mb-4">We've sent a verification code to your email.</p>
      <input 
        type="text" 
        value={otp} 
        onChange={e => setOtp(e.target.value)} 
        placeholder="Enter 6-digit OTP" 
        maxLength={6}
        className="w-full bg-bull-dark border border-white/10 rounded-xl px-4 py-3 mb-4 focus:outline-none focus:border-bull-orange text-center text-xl font-mono"
      />
      <button 
        onClick={onSubmit} 
        disabled={otp.length !== 6 || isLoading}
        className="w-full py-3 bg-bull-orange rounded-xl font-bold mb-2 disabled:opacity-50"
      >
        {isLoading ? "Verifying..." : "Verify"}
      </button>
      <button onClick={sendOtp} disabled={resendDisabled} className="w-full py-2 text-sm text-zinc-400 disabled:opacity-50">
        {resendDisabled ? `Resend in ${resendCountdown}s` : 'Resend OTP'}
      </button>
    </div>
  </div>
);

// Reset Password Modal Component
const ResetPasswordModal = ({ isOpen, onClose, setAlert }: any) => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [step, setStep] = useState(1); // 1: Enter Email, 2: Enter OTP, 3: Reset Password
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [repeatPasswordVisible, setRepeatPasswordVisible] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(true);
  const [resendCountdown, setResendCountdown] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal closes
      setEmail("");
      setOtp("");
      setPassword("");
      setRepeatPassword("");
      setStep(1);
      setPasswordStrength(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (resendCountdown > 0) {
      setResendDisabled(true);
      const interval = setInterval(() => {
        setResendCountdown((prev) => {
          if (prev === 1) {
            clearInterval(interval);
            setResendDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [resendCountdown]);

  if (!isOpen) return null;

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const checkPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[\W_]/.test(password)) strength++;
    return strength;
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setPasswordStrength(checkPasswordStrength(newPassword));
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s/g, '').toLowerCase();
    setEmail(value);
  };

  const handleComplete = (enteredOtp: string) => {
    setOtp(enteredOtp);
  };

  const sendOtp = async () => {
    setLoading(true);

    if (!isValidEmail(email)) {
      setAlert({ message: "Please enter a valid email.", type: "error" });
      setLoading(false);
      return;
    }

    try {
      // Step 1: Check if email exists
      const checkResponse = await fetch(`${API_BASE_URL}/auth/check-email-exist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (checkResponse.status === 404) {
        setAlert({ message: "Email not found in our system.", type: "error" });
        setLoading(false);
        return;
      }

      if (!checkResponse.ok) {
        setAlert({ message: "Something went wrong.", type: "error" });
        setLoading(false);
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
        setResendCountdown(120);
        setAlert({ message: "OTP sent to your email!", type: "success" });
      } else {
        setAlert({ message: data.message || "Failed to send OTP", type: "error" });
      }
    } catch (error) {
      console.error("OTP error:", error);
      setAlert({ message: "Failed to send OTP", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (response.ok) {
        setStep(3);
        setAlert({ message: "OTP verified successfully!", type: "success" });
      } else {
        setAlert({ message: data.message || "Invalid OTP", type: "error" });
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      setAlert({ message: "Something went wrong.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setLoading(true);

    if (passwordStrength < 4) {
      setAlert({ message: "Password is too weak. Use a stronger password.", type: "error" });
      setLoading(false);
      return;
    }

    if (password !== repeatPassword) {
      setAlert({ message: "Passwords do not match!", type: "error" });
      setLoading(false);
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
        setAlert({ message: "Password reset successfully! You can now login.", type: "success" });
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setAlert({ message: data.message || "Password reset failed.", type: "error" });
      }
    } catch (error) {
      setAlert({ message: "Password reset failed.", type: "error" });
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-bull-dark/80 backdrop-blur-sm scrollbar-hide">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        className="relative w-full max-w-md bg-bull-card p-8 rounded-[2.5rem] border border-white/10"
      >
        <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-white/5 rounded-full transition-colors">
          <X className="w-5 h-5" />
        </button>
        
        <div className="text-center mb-6">
          <h3 className="text-2xl font-display font-bold">Reset Password</h3>
          <p className="text-sm text-zinc-400 mt-2">
            {step === 1 && "Enter your email to receive a verification code"}
            {step === 2 && "Enter the OTP sent to your email"}
            {step === 3 && "Create a new password"}
          </p>
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={handleEmailChange}
              className="w-full bg-bull-dark border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-bull-orange transition-colors"
            />
            <button
              onClick={sendOtp}
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-bull-orange text-white font-bold hover:bg-orange-600 transition-all shadow-lg shadow-bull-orange/20 disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="flex justify-center py-4">
              <OtpInput length={6} onComplete={handleComplete} />
            </div>
            
            <div className="text-center">
              {resendDisabled ? (
                <span className="text-sm text-zinc-500">Resend OTP in {resendCountdown}s</span>
              ) : (
                <button 
                  onClick={sendOtp} 
                  className="text-sm text-bull-orange hover:underline"
                >
                  Resend OTP
                </button>
              )}
            </div>

            <button
              onClick={handleVerify}
              disabled={otp.length !== 6 || loading}
              className="w-full py-4 rounded-2xl bg-bull-orange text-white font-bold hover:bg-orange-600 transition-all shadow-lg shadow-bull-orange/20 disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>

            <button
              onClick={() => setStep(1)}
              className="w-full flex items-center justify-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to email
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <p className="text-sm text-emerald-400 text-center mb-4">
              OTP verified! Create a new password.
            </p>

            <div className="relative">
              <input
                type={passwordVisible ? "text" : "password"}
                placeholder="New password"
                value={password}
                onChange={handlePasswordChange}
                className="w-full bg-bull-dark border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-bull-orange transition-colors pr-12"
              />
              <button 
                type="button"
                onClick={() => setPasswordVisible(!passwordVisible)} 
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
              >
                {passwordVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Password strength indicator */}
            <div className="space-y-2">
              <div className="flex gap-1 h-1">
                <div className={`flex-1 rounded-full ${passwordStrength >= 1 ? 'bg-yellow-500' : 'bg-white/10'}`}></div>
                <div className={`flex-1 rounded-full ${passwordStrength >= 2 ? 'bg-yellow-500' : 'bg-white/10'}`}></div>
                <div className={`flex-1 rounded-full ${passwordStrength >= 3 ? 'bg-yellow-500' : 'bg-white/10'}`}></div>
                <div className={`flex-1 rounded-full ${passwordStrength >= 4 ? 'bg-emerald-500' : 'bg-white/10'}`}></div>
                <div className={`flex-1 rounded-full ${passwordStrength >= 5 ? 'bg-emerald-500' : 'bg-white/10'}`}></div>
              </div>
              <p className="text-xs text-zinc-500 text-right">
                {passwordStrength === 0 && 'Enter password'}
                {passwordStrength === 1 && 'Very weak'}
                {passwordStrength === 2 && 'Weak'}
                {passwordStrength === 3 && 'Fair'}
                {passwordStrength === 4 && 'Good'}
                {passwordStrength === 5 && 'Strong'}
              </p>
            </div>

            <div className="relative">
              <input
                type={repeatPasswordVisible ? "text" : "password"}
                placeholder="Confirm new password"
                value={repeatPassword}
                onChange={(e) => setRepeatPassword(e.target.value)}
                className="w-full bg-bull-dark border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-bull-orange transition-colors pr-12"
              />
              <button 
                type="button"
                onClick={() => setRepeatPasswordVisible(!repeatPasswordVisible)} 
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
              >
                {repeatPasswordVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {password !== repeatPassword && repeatPassword.length > 0 && (
              <p className="text-xs text-red-400">Passwords do not match</p>
            )}

            <button
              onClick={handleResetPassword}
              disabled={loading || passwordStrength < 4 || password !== repeatPassword}
              className="w-full py-4 rounded-2xl bg-bull-orange text-white font-bold hover:bg-orange-600 transition-all shadow-lg shadow-bull-orange/20 disabled:opacity-50"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export const LoginModal = ({ isOpen, onClose, onSwitchToRegister, onLoginSuccess }: any) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState("");
  const [alert, setAlert] = useState({ message: "", type: "" });
  
  // Reset Password Modal State
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  
  // 2FA States
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [isTwoFAModalOpen, setIsTwoFAModalOpen] = useState(false);
  const [isMultiFactorModalOpen, setIsMultiFactorModalOpen] = useState(false);
  const [otp, setOtp] = useState("");
  const [resendDisabled, setResendDisabled] = useState(true);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [twoFactorData, setTwoFactorData] = useState<any>(null);
  const [isTwoFALoading, setIsTwoFALoading] = useState(false);
  const [isMultiFactorLoading, setIsMultiFactorLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setEmail("");
      setPassword("");
      setRecaptchaToken("");
      setAlert({ message: "", type: "" });
      setIsOtpModalOpen(false);
      setIsTwoFAModalOpen(false);
      setIsMultiFactorModalOpen(false);
      setIsResetPasswordOpen(false);
      setTwoFactorData(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (resendCountdown > 0) {
      setResendDisabled(true);
      const interval = setInterval(() => {
        setResendCountdown((prev) => {
          if (prev === 1) {
            clearInterval(interval);
            setResendDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [resendCountdown]);

  if (!isOpen) return null;

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const sendOtp = async (emailFor2FA: string | null = null) => {
    setIsLoading(true);
    const emailToUse = emailFor2FA || twoFactorData?.email || email;

    if (!emailToUse) {
      setAlert({ message: "Email not found. Please try again.", type: "error" });
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailToUse }),
      });
      
      const data = await response.json();
      if (response.ok) {
        setResendCountdown(120);
        setAlert({ message: "OTP sent to your email!", type: "success" });
      } else {
        setAlert({ message: data.message || "Failed to send OTP", type: "error" });
      }
    } catch (error) {
      console.error("OTP error:", error);
      setAlert({ message: "Failed to send OTP", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMultiFactorVerification = async (verificationData: any) => {
    if (isTwoFAModalOpen) {
      setIsTwoFALoading(true);
    } else if (isMultiFactorModalOpen) {
      setIsMultiFactorLoading(true);
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-multi-factor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...twoFactorData,
          ...verificationData
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setAlert({ message: "Login successful!", type: "success" });
        localStorage.setItem("token", data.token);
        localStorage.setItem("email", data.user.email);
        localStorage.setItem("userId", data.user.id);
        
        // Close all modals
        setIsOtpModalOpen(false);
        setIsTwoFAModalOpen(false);
        setIsMultiFactorModalOpen(false);
        
        setTimeout(() => {
          onLoginSuccess();
        }, 2000);
      } else {
        setAlert({ message: data.message || "Verification failed", type: "error" });
      }
    } catch (error) {
      console.error("Multi-factor verification error:", error);
      setAlert({ message: "Something went wrong.", type: "error" });
    } finally {
      setIsTwoFALoading(false);
      setIsMultiFactorLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    if (!email || !isValidEmail(email) || !password || !recaptchaToken) {
      setAlert({ message: "Please fill all fields correctly", type: "warning"});
      return;
    }

    setIsLoading(true);
    setAlert({ message: "", type: "" });

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, recaptchaToken }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.twoFactorRequired) {
          setTwoFactorData({
            userId: data.userId,
            email: data.email,
            twoFactorType: data.twoFactorType
          });

          // Handle different 2FA types
          if (data.twoFactorType === 'both') {
            setIsMultiFactorModalOpen(true);
            await sendOtp(data.email);
          } else if (data.twoFactorType === 'email') {
            setIsOtpModalOpen(true);
            await sendOtp(data.email || email);
          } else if (data.twoFactorType === 'authenticator') {
            setIsTwoFAModalOpen(true);
          }
        } else {
          // Normal login
          setAlert({ message: "Login successful!", type: "success" });
          localStorage.setItem("token", data.token);
          localStorage.setItem("email", data.user.email);
          localStorage.setItem("userId", data.user.id);
          setTimeout(() => {
            onLoginSuccess();
          }, 1000);
        }
      } else {
        setAlert({ message: data.message || "Invalid credentials", type: "error" });
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Login error:", error);
      setAlert({ message: "Login Failed: " + (error as Error).message, type: "error" });
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 scrollbar-hide">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-bull-dark/80 backdrop-blur-sm" onClick={onClose} />
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }} 
          className="relative w-full max-w-md glass p-8 rounded-[2.5rem] border border-white/10 max-h-[90%] overflow-y-auto scrollbar-hide"
        >
          <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-white/5 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
          
          <div className="text-center mb-8">
            <img src="https://res.cloudinary.com/danuehpic/image/upload/v1771869182/wordmark_pynw6f.png" alt="Bull Faucet" className="h-8 object-contain mx-auto mb-4" referrerPolicy="no-referrer" style={{transform: 'translateX(-3px)'}} />
            <h3 className="text-2xl font-display font-bold">Welcome Back</h3>
            <p className="text-zinc-400 text-sm mt-2">
              Don't have an account? <button onClick={onSwitchToRegister} className="text-bull-orange font-bold hover:underline">Register</button>
            </p>
          </div>

          <Alert alert={alert} />
          <GoogleLoginButton 
            setAlert={setAlert} 
            onLoginSuccess={onLoginSuccess}
          />

          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-white/10"></div>
            <span className="text-xs text-zinc-500 font-bold uppercase tracking-widest">OR</span>
            <div className="flex-1 h-px bg-white/10"></div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value.replace(/\s/g, '').toLowerCase())}
                className="w-full bg-bull-dark border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-bull-orange transition-colors"
              />
            </div>
            
            <div className="relative">
              <input
                type={passwordVisible ? "text" : "password"}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-bull-dark border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-bull-orange transition-colors pr-12"
              />
              <button 
                type="button"
                onClick={() => setPasswordVisible(!passwordVisible)} 
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
              >
                {passwordVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            
            <div className="flex justify-center py-2">
              <ReCAPTCHA
                sitekey="6LcZfPUrAAAAAH0t9HJlB7yx1AJk94E8rQW4LQT_"
                onChange={(token) => setRecaptchaToken(token || "")}
                theme="dark"
              />
            </div>

            <div className="text-right">
              <button 
                type="button" 
                onClick={() => setIsResetPasswordOpen(true)}
                className="text-xs text-zinc-400 hover:text-white transition-colors"
              >
                Forgot Your Password?
              </button>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-4 rounded-2xl bg-bull-orange text-white font-bold hover:bg-orange-600 transition-all shadow-lg shadow-bull-orange/20 disabled:opacity-50"
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>
          </form>
        </motion.div>
        
        {/* 2FA Modals */}
        {isOtpModalOpen && (
          <OtpModal 
            otp={otp} 
            setOtp={setOtp} 
            onClose={() => setIsOtpModalOpen(false)} 
            onSubmit={() => handleMultiFactorVerification({ emailOtp: otp })} 
            sendOtp={() => sendOtp(twoFactorData?.email)} 
            resendDisabled={resendDisabled} 
            resendCountdown={resendCountdown}
            isLoading={isLoading}
          />
        )}

        {isTwoFAModalOpen && (
          <TwoFAModal 
            onClose={() => setIsTwoFAModalOpen(false)}
            onSubmit={(authenticatorToken: string) => handleMultiFactorVerification({ authenticatorToken })}
            isLoading={isTwoFALoading}
          />
        )}

        {isMultiFactorModalOpen && (
          <MultiFactorModal 
            onClose={() => setIsMultiFactorModalOpen(false)}
            onSubmit={handleMultiFactorVerification}
            sendOtp={() => sendOtp(twoFactorData?.email)}
            isLoading={isMultiFactorLoading}
            resendDisabled={resendDisabled}
            resendCountdown={resendCountdown}
          />
        )}
      </div>

      {/* Reset Password Modal */}
      <ResetPasswordModal 
        isOpen={isResetPasswordOpen}
        onClose={() => setIsResetPasswordOpen(false)}
        setAlert={setAlert}
      />
    </>
  );
};

export const RegisterModal = ({ isOpen, onClose, onSwitchToLogin, onRegisterSuccess, onLoginSuccess }: any) => {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [gender, setGender] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [termsChecked, setTermsChecked] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [repeatPasswordVisible, setRepeatPasswordVisible] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState("");
  const [alert, setAlert] = useState({ message: "", type: "" });
  
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [otp, setOtp] = useState("");
  const [resendDisabled, setResendDisabled] = useState(true);
  const [resendCountdown, setResendCountdown] = useState(0);
  
  const genderDropdownRef = useRef<HTMLDivElement>(null);
  const countryDropdownRef = useRef<HTMLDivElement>(null);
  
  const genderOptions = [
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' },
    { value: 'Other', label: 'Other' },
  ];
  
  const formattedCountries = fallbackCountries.map((country: any) => ({
    name: country.country,
    flag: country.flag_base64
  })).sort((a, b) => a.name.localeCompare(b.name));

  // Handler for gender change
  const handleGenderChange = (genderValue: string) => {
    setGender(genderValue);
  };

  // Handler for country change
  const handleCountryChange = (countryName: string) => {
    setSelectedCountry(countryName);
  };

  useEffect(() => {
    if (!isOpen) {
      setEmail("");
      setFullName("");
      setGender("");
      setPassword("");
      setRepeatPassword("");
      setTermsChecked(false);
      setSelectedCountry("");
      setRecaptchaToken("");
      setAlert({ message: "", type: "" });
    }
  }, [isOpen]);

  useEffect(() => {
    if (resendCountdown > 0) {
      setResendDisabled(true);
      const interval = setInterval(() => {
        setResendCountdown((prev) => {
          if (prev === 1) {
            clearInterval(interval);
            setResendDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [resendCountdown]);

  if (!isOpen) return null;

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const checkPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[\W_]/.test(password)) strength++;
    return strength;
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setPasswordStrength(checkPasswordStrength(newPassword));
  };

  const sendOtp = async () => {
    if (isLoading) return;
    setIsLoading(true);

    if (!email || !isValidEmail(email) || !password || password !== repeatPassword || passwordStrength < 4 || !recaptchaToken || !termsChecked || !gender || !fullName || !selectedCountry) {
      setAlert({ message: "Please fill all fields correctly and agree to terms.", type: "warning" });
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (response.ok) {
        setIsOtpModalOpen(true);
        setResendCountdown(120);
        setAlert({ message: "OTP sent to your email!", type: "success" });
      } else {
        setAlert({ message: data.message || "Failed to send OTP", type: "error" });
      }
    } catch (error) {
      console.error("OTP error:", error);
      setAlert({ message: "Failed to send OTP", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async () => {
    setIsOtpModalOpen(false);
    setIsLoading(true);
    
    const referrerId = localStorage.getItem("bullFaucetReferrerId");
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email, 
          fullName, 
          gender, 
          country: selectedCountry, 
          password, 
          otp, 
          referrerId,
          recaptchaToken,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setAlert({ message: "Registration successful!", type: "success" });
        localStorage.setItem("token", data.token);
        localStorage.setItem("email", data.email);
        localStorage.setItem("userId", data.user.id);
        setTimeout(() => {
          onRegisterSuccess();
        }, 1000);
      } else {
        setAlert({ message: data.message || "Registration failed", type: "error" });
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Registration error:", error);
      setAlert({ message: "Registration failed: " + (error as Error).message, type: "error" });
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 scrollbar-hide">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-bull-dark/80 backdrop-blur-sm" onClick={onClose} />
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }} 
          className="relative w-full max-w-md glass p-8 rounded-[2.5rem] border border-white/10 max-h-[90%] overflow-y-auto scrollbar-hide"
        >
          <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-white/5 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
          
          <div className="text-center mb-8">
            <img src="https://res.cloudinary.com/danuehpic/image/upload/v1771869182/wordmark_pynw6f.png" alt="Bull Faucet" className="h-8 object-contain mx-auto mb-4" referrerPolicy="no-referrer" style={{transform: 'translateX(-3px)'}} />
            <h3 className="text-2xl font-display font-bold">Create Account</h3>
            <p className="text-zinc-400 text-sm mt-2">
              Already have an account? <button onClick={onSwitchToLogin} className="text-bull-orange font-bold hover:underline">Login</button>
            </p>
          </div>

          <Alert alert={alert} />
          <GoogleLoginButton 
            setAlert={setAlert} 
            onLoginSuccess={onLoginSuccess}
          />

          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-white/10"></div>
            <span className="text-xs text-zinc-500 font-bold uppercase tracking-widest">OR</span>
            <div className="flex-1 h-px bg-white/10"></div>
          </div>

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-bull-dark border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-bull-orange transition-colors"
            />
            <input
              type="text"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value.replace(/\s/g, '').toLowerCase())}
              className="w-full bg-bull-dark border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-bull-orange transition-colors"
            />
            
            <div ref={genderDropdownRef}>
              <CustomDropdown
                type="gender"
                value={gender}
                onChange={handleGenderChange}
                genderOptions={genderOptions}
                placeholder="Select your gender..."
              />
            </div>

            <div ref={countryDropdownRef}>
              <CustomDropdown
                type="country"
                value={selectedCountry}
                onChange={handleCountryChange}
                countries={formattedCountries}
                placeholder="Select your country..."
              />
            </div>

            <div className="relative">
              <input
                type={passwordVisible ? "text" : "password"}
                placeholder="Enter password"
                value={password}
                onChange={handlePasswordChange}
                className="w-full bg-bull-dark border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-bull-orange transition-colors pr-12"
              />
              <button 
                type="button"
                onClick={() => setPasswordVisible(!passwordVisible)} 
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
              >
                {passwordVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex gap-1 h-1 mt-2">
              <div className={`flex-1 rounded-full ${passwordStrength >= 1 ? 'bg-yellow-500' : 'bg-white/10'}`}></div>
              <div className={`flex-1 rounded-full ${passwordStrength >= 2 ? 'bg-yellow-500' : 'bg-white/10'}`}></div>
              <div className={`flex-1 rounded-full ${passwordStrength >= 3 ? 'bg-yellow-500' : 'bg-white/10'}`}></div>
              <div className={`flex-1 rounded-full ${passwordStrength >= 4 ? 'bg-emerald-500' : 'bg-white/10'}`}></div>
              <div className={`flex-1 rounded-full ${passwordStrength >= 5 ? 'bg-emerald-500' : 'bg-white/10'}`}></div>
            </div>
            <p className="text-[10px] text-zinc-500 text-right">
              {passwordStrength === 0 && 'Enter password'}
              {passwordStrength === 1 && 'Very weak'}
              {passwordStrength === 2 && 'Weak'}
              {passwordStrength === 3 && 'Fair'}
              {passwordStrength === 4 && 'Good'}
              {passwordStrength === 5 && 'Strong'}
            </p>

            <div className="relative">
              <input
                type={repeatPasswordVisible ? "text" : "password"}
                placeholder="Repeat password"
                value={repeatPassword}
                onChange={(e) => setRepeatPassword(e.target.value)}
                className="w-full bg-bull-dark border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-bull-orange transition-colors pr-12"
              />
              <button 
                type="button"
                onClick={() => setRepeatPasswordVisible(!repeatPasswordVisible)} 
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
              >
                {repeatPasswordVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {password !== repeatPassword && repeatPassword.length > 0 && 
              <p className="text-xs text-red-400">Passwords do not match</p>
            }

            <div className="flex justify-center py-2">
              <ReCAPTCHA
                sitekey="6LcZfPUrAAAAAH0t9HJlB7yx1AJk94E8rQW4LQT_"
                onChange={(token) => setRecaptchaToken(token || "")}
                theme="dark"
              />
            </div>

            <div className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/5">
              <input 
                type="checkbox" 
                checked={termsChecked} 
                onChange={(e) => setTermsChecked(e.target.checked)} 
                className="mt-1 w-4 h-4 rounded border-white/20 bg-bull-dark text-bull-orange focus:ring-bull-orange focus:ring-offset-bull-dark"
              />
              <label className="text-xs text-zinc-400 leading-relaxed">
                I agree to the <a href="/terms" className="text-bull-orange hover:underline">Terms of Service</a> and <a href="/privacy" className="text-bull-orange hover:underline">Privacy Policy</a>.
              </label>
            </div>

            <button 
              onClick={sendOtp}
              disabled={isLoading}
              className="w-full py-4 rounded-2xl bg-bull-orange text-white font-bold hover:bg-orange-600 transition-all shadow-lg shadow-bull-orange/20 disabled:opacity-50"
            >
              {isLoading ? "Processing..." : "Register"}
            </button>
          </div>
        </motion.div>
        
        {isOtpModalOpen && (
          <OtpModal 
            otp={otp} 
            setOtp={setOtp} 
            onClose={() => setIsOtpModalOpen(false)} 
            onSubmit={handleOtpSubmit} 
            sendOtp={sendOtp} 
            resendDisabled={resendDisabled} 
            resendCountdown={resendCountdown}
            isLoading={isLoading}
          />
        )}
      </div>
    </>
  );
};