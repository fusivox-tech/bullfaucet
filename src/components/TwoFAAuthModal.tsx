import React, { useState, useEffect } from 'react';
import { X, AlertCircle, CheckCircle2, Copy, Download } from 'lucide-react';
import QRCode from 'qrcode';
import API_BASE_URL from '../config';
import OtpInput from './OTP';

interface TwoFAAuthModalProps {
  user: any;
  onClose: () => void;
  setAlert: (alert: { message: string; type: string }) => void;
}

const TwoFAAuthModal: React.FC<TwoFAAuthModalProps> = ({ user, onClose, setAlert }) => {
  const [step, setStep] = useState(1);
  const [secret, setSecret] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  
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

  // Generate 2FA secret
  useEffect(() => {
    const generateSecret = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/auth/generate-2fa-secret`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ userId: user?._id }),
        });

        const data = await response.json();

        if (data.success) {
          setSecret(data.secret);
          
          // Generate QR code
          const qrCode = await QRCode.toDataURL(data.qrCodeUrl);
          setQrCodeUrl(qrCode);
        } else {
          setError(data.message || 'Failed to generate 2FA secret');
        }
      } catch (error) {
        if (!handleAuthError(error as Error)) {
          setError('Failed to generate 2FA secret');
        }
        console.error('Error generating secret:', error);
      } finally {
        setLoading(false);
      }
    };

    if (step === 1 && !user?.authTwoFAEnabled) {
      generateSecret();
    }
  }, [step, user?._id, user?.authTwoFAEnabled]);

  const verifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await fetch(`${API_BASE_URL}/auth/verify-2fa`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          userId: user?._id,
          token: verificationCode,
          secret: secret
        }),
      });

      const data = await response.json();

      if (data.success) {
        if (data.backupCodes) {
          setBackupCodes(data.backupCodes);
          setShowBackupCodes(true);
        }
        setStep(3);
      } else {
        setError(data.message || 'Invalid verification code');
      }
    } catch (error) {
      if (!handleAuthError(error as Error)) {
        setError('Verification failed. Please try again.');
      }
      console.error('Error verifying code:', error);
    } finally {
      setLoading(false);
    }
  };

  const disable2FA = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/auth/disable-2fa`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ userId: user?._id }),
      });

      const data = await response.json();

      if (data.success) {
        setAlert({ message: '2FA disabled successfully', type: 'success' });
        setTimeout(() => {
          onClose();
          window.location.reload();
        }, 2000);
      } else {
        setError(data.message || 'Failed to disable 2FA');
      }
    } catch (error) {
      if (!handleAuthError(error as Error)) {
        setError('Failed to disable 2FA');
      }
      console.error('Error disabling 2FA:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyBackupCodes = () => {
    const codesText = backupCodes.join('\n');
    navigator.clipboard.writeText(codesText)
      .then(() => {
        setAlert({ message: 'Backup codes copied to clipboard!', type: 'success' });
      })
      .catch(() => {
        setAlert({ message: 'Failed to copy backup codes', type: 'error' });
      });
  };

  const downloadBackupCodes = () => {
    const codesText = backupCodes.join('\n');
    const blob = new Blob([`BullFaucet Backup Codes:\n\n${codesText}\n\nStore these codes in a safe place!`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bullfaucet-backup-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleComplete = (code: string) => {
    setVerificationCode(code);
  };

  // If user already has 2FA enabled, show disable option
  if (user?.authTwoFAEnabled) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="max-w-md w-full rounded-3xl glass border border-white/10 overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <h3 className="text-xl font-bold">Disable Authenticator 2FA</h3>
            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-full glass flex items-center justify-center hover:bg-white/10 transition-all"
            >
              <X size={16} />
            </button>
          </div>
          
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-sm text-zinc-300">
                Are you sure you want to disable Authenticator 2FA? This will reduce your account security.
              </p>
            </div>
            
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}
            
            <div className="flex gap-3">
              <button 
                className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all font-bold"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 transition-all font-bold disabled:opacity-50"
                onClick={disable2FA}
                disabled={loading}
              >
                {loading ? 'Disabling...' : 'Disable 2FA'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="max-w-md w-full rounded-3xl glass border border-white/10 overflow-hidden max-h-[90vh] overflow-y-auto scrollbar-hide">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h3 className="text-xl font-bold">Set Up Authenticator 2FA</h3>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full glass flex items-center justify-center hover:bg-white/10 transition-all"
          >
            <X size={16} />
          </button>
        </div>
        
        <div className="p-6">
          {step === 1 && (
            <div>
              <h4 className="font-bold mb-2">Step 1: Scan QR Code</h4>
              <p className="text-sm text-zinc-400 mb-4">
                Open your authenticator app (Google Authenticator, Authy, etc.) and scan this QR code:
              </p>
              
              {loading ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="w-12 h-12 border-4 border-bull-orange border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-zinc-400">Generating QR code...</p>
                </div>
              ) : (
                <>
                  {qrCodeUrl && (
                    <div className="flex justify-center mb-6">
                      <img src={qrCodeUrl} alt="2FA QR Code" className="w-48 h-48" />
                    </div>
                  )}
                  
                  <div className="mb-6 p-4 rounded-xl bg-white/5">
                    <p className="text-sm text-zinc-400 mb-2">Or enter this code manually:</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 p-2 rounded-lg bg-bull-dark font-mono text-sm break-all whitespace-normal">{secret}</code>
                      <button 
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
                        onClick={() => {
                          navigator.clipboard.writeText(secret);
                          setAlert({message: 'Copied to clipboard!', type: 'success'});
                        }}
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <button 
                    className="w-full py-3 rounded-xl bg-bull-orange hover:bg-orange-600 transition-all font-bold"
                    onClick={() => setStep(2)}
                    disabled={!secret}
                  >
                    Next: Verify Code
                  </button>
                </>
              )}
            </div>
          )}

          {step === 2 && (
            <div>
              <h4 className="font-bold mb-2">Step 2: Enter Verification Code</h4>
              <p className="text-sm text-zinc-400 mb-4">
                Enter the 6-digit code from your authenticator app:
              </p>
              
              <div className="mb-6">
                <OtpInput length={6} onComplete={handleComplete} />
              </div>
              
              {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              )}
              
              <div className="flex gap-3">
                <button 
                  className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all font-bold"
                  onClick={() => setStep(1)}
                  disabled={loading}
                >
                  Back
                </button>
                <button 
                  className="flex-1 py-3 rounded-xl bg-bull-orange hover:bg-orange-600 transition-all font-bold disabled:opacity-50"
                  onClick={verifyCode}
                  disabled={loading || verificationCode.length !== 6}
                >
                  {loading ? 'Verifying...' : 'Verify & Enable'}
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <div className="flex flex-col items-center mb-6">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                </div>
                <h4 className="text-xl font-bold mb-2">Authenticator 2FA Enabled!</h4>
                <p className="text-sm text-zinc-400 text-center">
                  Your account is now protected with two-factor authentication.
                </p>
              </div>
              
              {showBackupCodes && backupCodes.length > 0 && (
                <div className="mb-6 p-4 rounded-xl bg-white/5">
                  <h5 className="font-bold mb-2">Backup Codes</h5>
                  <p className="text-sm text-zinc-400 mb-3">
                    Save these backup codes in a safe place. You can use them if you lose access to your authenticator app.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {backupCodes.map((code, index) => (
                      <code key={index} className="p-2 rounded-lg bg-bull-dark text-center font-mono text-sm">
                        {code}
                      </code>
                    ))}
                  </div>
                  
                  <div className="flex gap-2 mb-4">
                    <button 
                      className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                      onClick={copyBackupCodes}
                    >
                      <Copy size={14} /> Copy
                    </button>
                    <button 
                      className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                      onClick={downloadBackupCodes}
                    >
                      <Download size={14} /> Download
                    </button>
                  </div>
                  
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                    <p className="text-xs text-red-400 flex items-center gap-1">
                      <AlertCircle size={12} />
                      <strong>Important:</strong> These codes will not be shown again. Store them securely!
                    </p>
                  </div>
                </div>
              )}
              
              <button 
                className="w-full py-3 rounded-xl bg-bull-orange hover:bg-orange-600 transition-all font-bold"
                onClick={() => {
                  onClose();
                  window.location.reload();
                }}
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TwoFAAuthModal;