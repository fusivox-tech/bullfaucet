import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import ReCAPTCHA from "react-google-recaptcha";
import API_BASE_URL from "../config";
import fallbackCountries from '../fallbackCountries.json';
import { TwoFAModal } from './TwoFAModal';
import { MultiFactorModal } from './MultiFactorModal';
import GoogleLoginButton from './GoogleLoginButton';

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

export const LoginModal = ({ isOpen, onClose, onSwitchToRegister, onLoginSuccess }: any) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState("");
  const [alert, setAlert] = useState({ message: "", type: "" });
  
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
            <button type="button" className="text-xs text-zinc-400 hover:text-white transition-colors">Forgot Your Password?</button>
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
  const [selectedFlag, setSelectedFlag] = useState(""); 
  
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

  useEffect(() => {
    if (!isOpen) {
      setEmail("");
      setFullName("");
      setGender("");
      setPassword("");
      setRepeatPassword("");
      setTermsChecked(false);
      setSelectedCountry("");
      setSelectedFlag("");
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

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    setSelectedCountry(selected);
    
    // Fix: Handle potential null/undefined value
    const foundCountry = fallbackCountries.find((c: any) => c.country === selected);
    if (foundCountry?.flag_base64) {
      setSelectedFlag(foundCountry.flag_base64);
    } else {
      setSelectedFlag(""); // Set empty string if no flag found
    }
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
          recaptchaToken 
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
          
          <select 
            value={gender} 
            onChange={(e) => setGender(e.target.value)}
            className="w-full bg-bull-dark border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-bull-orange transition-colors appearance-none"
          >
            <option value="">Select your gender...</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>

          <div className="relative">
            <select 
              value={selectedCountry} 
              onChange={handleCountryChange}
              className="w-full bg-bull-dark border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-bull-orange transition-colors appearance-none"
            >
              <option value="">Select your country...</option>
              {fallbackCountries.map((country: any, index: number) => (
                <option key={index} value={country.country}>{country.country}</option>
              ))}
            </select>
            {selectedFlag && (
              <img src={selectedFlag} alt="flag" className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-4 object-cover rounded-sm" />
            )}
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
            <div className={`flex-1 rounded-full ${passwordStrength >= 1 ? (passwordStrength >= 4 ? 'bg-emerald-500' : 'bg-yellow-500') : 'bg-white/10'}`}></div>
            <div className={`flex-1 rounded-full ${passwordStrength >= 3 ? (passwordStrength >= 4 ? 'bg-emerald-500' : 'bg-yellow-500') : 'bg-white/10'}`}></div>
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
              I agree to the <a href="#" className="text-bull-orange hover:underline">Terms of Service</a> and <a href="#" className="text-bull-orange hover:underline">Privacy Policy</a>.
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
  );
};