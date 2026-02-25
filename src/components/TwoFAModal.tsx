import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { AlertCircle } from 'lucide-react';
import OtpInput from './OTP';

interface TwoFAModalProps {
  onClose: () => void;
  onSubmit: (code: string) => Promise<void>;
  isLoading?: boolean;
}

export const TwoFAModal: React.FC<TwoFAModalProps> = ({ 
  onClose, 
  onSubmit, 
  isLoading = false 
}) => {
  const [authenticatorCode, setAuthenticatorCode] = useState('');
  const [error, setError] = useState('');
  const submitRef = useRef<HTMLButtonElement>(null);

  const handleCodeComplete = (code: string) => {
    setAuthenticatorCode(code);
    setError('');
    // Auto-submit when code is complete
    if (code.length === 6 && submitRef.current) {
      submitRef.current.click();
    }
  };

  const handleSubmit = async () => {
    if (authenticatorCode.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setError('');
    await onSubmit(authenticatorCode);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && authenticatorCode.length === 6) {
      handleSubmit();
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
          <h3 className="text-2xl font-display font-bold">Authenticator Verification</h3>
          <p className="text-zinc-400 text-sm mt-2">
            Enter the 6-digit code from your authenticator app
          </p>
        </div>

        <div className="space-y-6">
          <div className="flex justify-center">
            <OtpInput 
              length={6} 
              onComplete={handleCodeComplete}
              onKeyPress={handleKeyPress}
              autoFocus={true}
            />
          </div>
          
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span className="text-sm text-red-400">{error}</span>
            </div>
          )}
          
          <div className="p-4 rounded-xl bg-white/5 border border-white/5">
            <p className="text-xs text-zinc-400 text-center">
              <span className="font-bold text-white">Don't have your device?</span><br />
              You can use one of your backup codes instead.
            </p>
          </div>
          
          <div className="flex gap-3">
            <button 
              className="flex-1 py-3 rounded-xl bg-white/5 text-white font-bold hover:bg-white/10 transition-colors"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button 
              ref={submitRef}
              className="flex-1 py-3 rounded-xl bg-bull-orange text-white font-bold hover:bg-orange-600 transition-all disabled:opacity-50"
              onClick={handleSubmit}
              disabled={authenticatorCode.length !== 6 || isLoading}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
              ) : (
                'Verify'
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};