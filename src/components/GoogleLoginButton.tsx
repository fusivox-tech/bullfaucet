// components/GoogleLoginButton.tsx
import React, { useState, useEffect } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import GenderModal from './GenderModal';
import { TwoFAModal } from './TwoFAModal';
import API_BASE_URL from '../config';

interface GoogleLoginButtonProps {
  setAlert: (alert: { message: string; type: string }) => void;
  onLoginSuccess?: () => void;
  onRegisterSuccess?: () => void;
}

const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({ 
  setAlert, 
  onLoginSuccess,
  onRegisterSuccess 
}) => {
  const [userCountry, setUserCountry] = useState("");
  const [showGenderModal, setShowGenderModal] = useState(false);
  const [credentialResponse, setCredentialResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenderSubmitting, setIsGenderSubmitting] = useState(false);
  const [twoFactorData, setTwoFactorData] = useState<any>(null);
  const [isTwoFAModalOpen, setIsTwoFAModalOpen] = useState(false);

  // Detect user country
  useEffect(() => {
    const fetchCountry = async () => {
      try {
        const response = await axios.get('https://ipapi.co/json/');
        if (response.data?.country_name) {
          setUserCountry(response.data.country_name);
        }
      } catch (error) {
        console.error("Error detecting country:", error);
        setUserCountry("United States");
      }
    };
    
    fetchCountry();
  }, []);

  const handleSuccess = async (credentialResponse: any) => {
    setIsLoading(true);
    try {
      console.log('Google credential received:', credentialResponse.credential ? 'Yes' : 'No');
      
      // Send the credential (ID token) directly to backend
      const verificationResponse = await axios.post(`${API_BASE_URL}/auth/google/verify`, {
        credential: credentialResponse.credential
      });

      if (verificationResponse.data.isNewUser) {
        setCredentialResponse(credentialResponse);
        setShowGenderModal(true);
      } else {
        await completeLogin(credentialResponse);
      }
    } catch (error: any) {
      console.error('Verification failed:', error);
      setAlert({ 
        message: error.response?.data?.message || 'Verification failed', 
        type: 'error' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleError = () => {
    setAlert({ message: 'Google Login Failed', type: 'error' });
    setIsLoading(false);
  };

  const completeLogin = async (
    credentialResponse: any, 
    gender: string | null = null, 
    country: string | null = null
  ) => {
    setIsLoading(true);
    try {
      const referrerId = localStorage.getItem("bullFaucetReferrerId");
      
      const countryToUse = country || userCountry;
      
      const loginResponse = await axios.post(`${API_BASE_URL}/auth/google/callback`, {
        credential: credentialResponse.credential,
        referrerId: referrerId || null,
        country: countryToUse,
        gender: gender
      });

      const data = loginResponse.data;

      // Handle 2FA for Google login
      if (data.twoFactorRequired && data.twoFactorType === 'authenticator') {
        setTwoFactorData({
          userId: data.userId,
          twoFactorType: data.twoFactorType,
          isGoogleLogin: true
        });
        setIsTwoFAModalOpen(true);
        return;
      }

      // Normal Google login flow
      setAlert({ message: data.message, type: "success" });
      localStorage.setItem("token", data.token);
      localStorage.setItem("email", data.user.email);
      localStorage.setItem("userId", data.user.id);

      if (data.message === "Login successful!") {
        setTimeout(() => {
          if (onLoginSuccess) onLoginSuccess();
        }, 2000);
      } else if (data.message === "Registration successful!") {
        localStorage.setItem("welcomeModalShown", "false");
        setTimeout(() => {
          if (onRegisterSuccess) onRegisterSuccess();
        }, 4000);
      }
      
    } catch (error: any) {
      console.error('Authentication failed:', error);
      setAlert({ 
        message: error.response?.data?.message || 'Authentication failed', 
        type: 'error' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMultiFactorVerification = async (verificationData: any) => {
    setIsLoading(true);
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
        
        setIsTwoFAModalOpen(false);
        
        setTimeout(() => {
          if (onLoginSuccess) onLoginSuccess();
        }, 2000);
      } else {
        setAlert({ message: data.message || "Verification failed", type: "error" });
      }
    } catch (error) {
      console.error("Multi-factor verification error:", error);
      setAlert({ message: "Something went wrong.", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenderSubmit = async (selectedGender: string, selectedCountry: string) => {
    setIsGenderSubmitting(true);
    try {
      await completeLogin(credentialResponse, selectedGender, selectedCountry);
      setShowGenderModal(false);
    } finally {
      setIsGenderSubmitting(false);
    }
  };

  const handleCloseGenderModal = () => {
    setShowGenderModal(false);
  };

  return (
    <GoogleOAuthProvider clientId="413266881580-j8mu52sjq4gc7m9gc62fnfbldpm8m9uo.apps.googleusercontent.com">
      <div className="w-full mb-7">
        {isLoading ? (
          <div className="w-full py-3 rounded-xl bg-white text-black font-bold flex items-center justify-center gap-2 opacity-75">
            <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
            <span>Processing...</span>
          </div>
        ) : (
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={handleError}
            useOneTap
            theme="outline"
            size="large"
            width="100%"
            shape="pill"
            text="continue_with"
          />
        )}
        
        <GenderModal
          isOpen={showGenderModal}
          onClose={handleCloseGenderModal}
          onSubmit={handleGenderSubmit}
          isLoading={isGenderSubmitting}
          userCountry={userCountry}
        />

        {isTwoFAModalOpen && (
          <TwoFAModal 
            onClose={() => setIsTwoFAModalOpen(false)}
            onSubmit={(authenticatorToken: string) => 
              handleMultiFactorVerification({ authenticatorToken })
            }
            isLoading={isLoading}
          />
        )}
      </div>
    </GoogleOAuthProvider>
  );
};

export default GoogleLoginButton;