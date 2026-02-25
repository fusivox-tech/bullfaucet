import React, { useState } from 'react';
import { motion } from 'motion/react';
import { AlertCircle, Clock } from 'lucide-react';
import OtpInput from './OTP';

interface MultiFactorModalProps {
  onClose: () => void;
  onSubmit: (data: { emailOtp: string; authenticatorToken: string }) => Promise<void>;
  sendOtp: () => Promise<void>;
  isLoading?: boolean;
  resendDisabled?: boolean;
  resendCountdown?: number;
}

export const MultiFactorModal: React.FC<MultiFactorModalProps> = ({ 
  onClose, 
  onSubmit, 
  sendOtp,
  isLoading = false,
  resendDisabled = false,
  resendCountdown = 0
}) => {
  const [emailOtp, setEmailOtp] = useState('');
  const [authenticatorCode, setAuthenticatorCode] = useState('');
  const [error, setError] = useState('');
  const [step, setStep] = useState<'email' | 'authenticator'>('email');
  const [emailOtpSent, setEmailOtpSent] = useState(false);

  const handleSendOtp = async () => {
    await sendOtp();
    setEmailOtpSent(true);
  };

  const handleEmailOtpComplete = (code: string) => {
    setEmailOtp(code);
    setError('');
    // Auto-move to next step
    if (code.length === 6) {
      setStep('authenticator');
    }
  };

  const handleAuthenticatorComplete = (code: string) => {
    setAuthenticatorCode(code);
    setError('');
  };

  const handleSubmit = async () => {
    if (step === 'email') {
      if (emailOtp.length !== 6) {
        setError('Please enter a valid 6-digit OTP');
        return;
      }
      setStep('authenticator');
    } else {
      if (authenticatorCode.length !== 6) {
        setError('Please enter a valid 6-digit authenticator code');
        return;
      }
      
      setError('');
      await onSubmit({ emailOtp, authenticatorToken: authenticatorCode });
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        className="absolute inset-0 bg-bull-dark/80 backdrop-blur-sm" 
        onClick={onClose} 
      />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        className="relative w-full max-w-md bg-bull-card p-8 rounded-[2.5rem] border border-white/10"
      >
        
        <div className="text-center mb-6">
          <h3 className="text-2xl font-display font-bold">
            {step === 'email' ? 'Email Verification' : 'Authenticator Verification'}
          </h3>
          <p className="text-zinc-400 text-sm mt-2">
            {step === 'email' 
              ? 'Enter the 6-digit code sent to your email' 
              : 'Enter the 6-digit code from your authenticator app'}
          </p>
        </div>

        <div className="space-y-6">
          {step === 'email' ? (
            <>
              {!emailOtpSent ? (
                <button
                  onClick={handleSendOtp}
                  disabled={isLoading || resendDisabled}
                  className="w-full py-4 rounded-2xl bg-bull-orange text-white font-bold hover:bg-orange-600 transition-all disabled:opacity-50"
                >
                  {isLoading ? "Sending..." : "Send OTP to Email"}
                </button>
              ) : (
                <>
                  <div className="flex justify-center">
                    <OtpInput 
                      length={6} 
                      onComplete={handleEmailOtpComplete}
                      autoFocus={true}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <button
                      onClick={handleSendOtp}
                      disabled={resendDisabled || isLoading}
                      className="text-bull-orange hover:underline disabled:opacity-50 disabled:no-underline"
                    >
                      {resendDisabled ? (
                        <span className="flex items-center gap-1 text-zinc-400">
                          <Clock className="w-3 h-3" />
                          Resend in {resendCountdown}s
                        </span>
                      ) : (
                        'Resend OTP'
                      )}
                    </button>
                  </div>
                </>
              )}
            </>
          ) : (
            <>
              <div className="flex justify-center">
                <OtpInput 
                  length={6} 
                  onComplete={handleAuthenticatorComplete}
                  autoFocus={true}
                />
              </div>
              
              <button
                onClick={() => setStep('email')}
                className="text-sm text-bull-orange hover:underline"
              >
                ← Back to email verification
              </button>
            </>
          )}
          
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span className="text-sm text-red-400">{error}</span>
            </div>
          )}
          
          {step === 'authenticator' && (
            <button 
              className="w-full py-4 rounded-2xl bg-bull-orange text-white font-bold hover:bg-orange-600 transition-all disabled:opacity-50"
              onClick={handleSubmit}
              disabled={authenticatorCode.length !== 6 || isLoading}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
              ) : (
                'Verify & Login'
              )}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};