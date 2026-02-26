import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { User as UserIcon, Shield, Key, AlertCircle, Camera, Coins, Mail, Globe, Users, DollarSign, Edit2 } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import API_BASE_URL from '../config';
import fallbackCountries from '../fallbackCountries.json';
import TwoFAModal from './TwoFAModal2';
import TwoFAAuthModal from './TwoFAAuthModal';
import ProfileEditModal from './ProfileEditModal';
import ProfileOTPVerificationModal from './ProfileOtpVerificationModal';
import ResetPasswordModal from './ResetPasswordModal';

interface Country {
  name: string;
  flag: string;
}

export const Profile = () => {
  const { user, setAlert } = useData();
  
  // UI States
  const [activeTab, setActiveTab] = useState('general');
  const [openModal, setOpenModal] = useState(false);
  const [openAuthModal, setOpenAuthModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openOTPModal, setOpenOTPModal] = useState(false);
  const [pendingProfileData, setPendingProfileData] = useState<any>(null);
  const [logoutModalActive, setLogoutModalActive] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  
  // Profile states
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedFlag, setSelectedFlag] = useState("");
  
  // Bio states
  const [showEditBio, setShowEditBio] = useState(false);
  const [bioLoading, setBioLoading] = useState(false);
  const [bio, setBio] = useState(user?.bio || "");
  const [originalBio, setOriginalBio] = useState(user?.bio || "");
  
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  
  // Profile image states
  const [profileImageLoading, setProfileImageLoading] = useState(false);
  const [profileImagePreview, setProfileImagePreview] = useState(user?.profileImage || "/avatar/other/other1.jpg");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load countries from fallback
  useEffect(() => {
    try {
      const formattedCountries: Country[] = fallbackCountries.map(country => ({
        name: country.country,
        flag: country.flag_base64 || ''
      })).sort((a, b) => a.name.localeCompare(b.name));
      
      setCountries(formattedCountries);
    } catch (error) {
      console.error("Error loading countries:", error);
    }
  }, []);

  // Initialize selected flag when user or countries change
  useEffect(() => {
    if (user?.country && countries.length > 0) {
      const foundCountry = countries.find((c) => c.name === user.country);
      if (foundCountry) {
        setSelectedFlag(foundCountry.flag);
      }
    }
  }, [user?.country, countries]);

  // Sync bio with user context
  useEffect(() => {
    if (user?.bio !== undefined) {
      setBio(user.bio || "");
      setOriginalBio(user.bio || "");
    }
    if (user?.profileImage) {
      setProfileImagePreview(user.profileImage);
    }
  }, [user?.bio, user?.profileImage]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }
    return {
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

  // Handle profile image upload
  const handleProfileImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validImageTypes.includes(file.type)) {
      setAlert({ message: "Please select a valid image file (JPEG, PNG, GIF, WebP)", type: "error" });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setAlert({ message: "Image size must be less than 5MB", type: "error" });
      return;
    }

    setProfileImageLoading(true);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setProfileImagePreview(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);

      // Upload to server
      const formData = new FormData();
      formData.append('images', file);
      formData.append('userId', user?._id);
      
      const headers = getAuthHeaders();

      const response = await fetch(`${API_BASE_URL}/users/update-profile-image`, {
        method: "POST",
        headers: headers,
        body: formData,
      });

      if (response.status === 401 || response.status === 403) {
        handleAuthError(new Error('Authentication failed'));
        return;
      }

      const data = await response.json();
      
      if (response.ok) {
        setAlert({ message: data.message, type: "success" });
        // Update user in context if needed
      } else {
        setAlert({ message: data.message, type: "error" });
        // Revert preview on error
        setProfileImagePreview(user?.profileImage || "/avatar/other/other1.jpg");
      }
    } catch (error) {
      console.error("Profile image upload error:", error);
      if (!handleAuthError(error as Error)) {
        setAlert({ message: "Failed to upload profile image.", type: "error" });
      }
      // Revert preview on error
      setProfileImagePreview(user?.profileImage || "/avatar/other/other1.jpg");
    }
    setProfileImageLoading(false);
  };

  // Trigger file input click
  const handleEditProfileImage = () => {
    fileInputRef.current?.click();
  };

  // Handle bio change
  const handleBioChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setBio(e.target.value);
  };

  // Enable bio editing
  const handleEditBio = () => {
    setShowEditBio(true);
    setOriginalBio(bio);
  };

  // Cancel bio editing
  const handleCancelBio = () => {
    setShowEditBio(false);
    setBio(originalBio);
  };

  // Submit bio update
  const handleSubmitBio = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate bio length
    if (bio.length > 500) {
      setAlert({ message: "Bio must be less than 500 characters", type: "error" });
      return;
    }
    
    setBioLoading(true);

    try {
      const headers = getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/users/update-bio`, {
        method: "POST",
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          userId: user?._id,
          bio: bio 
        }),
      });

      if (response.status === 401 || response.status === 403) {
        handleAuthError(new Error('Authentication failed'));
        return;
      }

      const data = await response.json();
      if (response.ok) {
        setAlert({ message: data.message, type: "success" });
        setShowEditBio(false);
        setOriginalBio(bio);
      } else {
        setAlert({ message: data.message, type: "error" });
      }
    } catch (error) {
      console.error("Bio update error:", error);
      if (!handleAuthError(error as Error)) {
        setAlert({ message: "Failed to update bio.", type: "error" });
      }
    }
    setBioLoading(false);
  };

  // Open edit modal (first step)
  const handleEditClick = () => {
    setOpenEditModal(true);
  };

  // Handle profile data from edit modal
  const handleProfileDataSubmitted = (formData: any) => {
    setOpenEditModal(false);
    setPendingProfileData(formData);
    setOpenOTPModal(true);
  };

  // Handle OTP verification success
  const handleOTPVerified = async () => {
    if (!pendingProfileData) return;
    
    setOpenOTPModal(false);
    
    try {
      const headers = getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/users/update-profile`, {
        method: "POST",
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ...pendingProfileData, userId: user?._id }),
      });

      if (response.status === 401 || response.status === 403) {
        handleAuthError(new Error('Authentication failed'));
        return;
      }

      const data = await response.json();
      if (response.ok) {
        setAlert({ message: data.message, type: "success" });
        
        // Update selected flag if country changed
        if (pendingProfileData.country !== user?.country) {
          const foundCountry = countries.find((c) => c.name === pendingProfileData.country);
          if (foundCountry) {
            setSelectedFlag(foundCountry.flag);
          }
        }
        
        window.location.reload(); // Refresh to get updated user data
      } else {
        setAlert({ message: data.message, type: "error" });
      }
    } catch (error) {
      console.error("Profile update error:", error);
      if (!handleAuthError(error as Error)) {
        setAlert({ message: "Failed to update profile.", type: "error" });
      }
    }
  };

  // Handle profile update from modal (now just passes data to OTP step)
  const handleSaveProfile = async (formData: any) => {
    handleProfileDataSubmitted(formData);
  };

  const handleLogout = () => {
    setLogoutModalActive(true);
  };

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    window.location.href = "/";
  };

  const closeModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setLogoutModalActive(false);
      setIsClosing(false);
    }, 500);
  };

  const getRegistrationDate = (objectId: string) => {
    const timestamp = objectId?.toString().substring(0, 8);
    const date = new Date(parseInt(timestamp, 16) * 1000);
    return date;
  };
  
  const handleResetPassword = () => {
    setIsResetPasswordModalOpen(true);
  };

  const formatRegistrationDate = (objectId: string) => {
    const date = getRegistrationDate(objectId);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-8 h-8 border-4 border-bull-orange border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-bull-orange/20 overflow-hidden border-2 border-bull-orange/30">
            <img 
              src={profileImagePreview} 
              alt="Profile" 
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/avatar/other/other1.jpg";
              }}
            />
          </div>
          <button 
            onClick={handleEditProfileImage}
            disabled={profileImageLoading}
            className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-bull-orange flex items-center justify-center hover:bg-orange-600 transition-colors disabled:opacity-50"
          >
            {profileImageLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Camera size={16} className="text-white" />
            )}
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleProfileImageChange}
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
            className="hidden"
          />
        </div>
        <div>
          <h2 className="text-xl font-display font-bold">{user?.fullName}</h2>
          <p className="text-zinc-400 text-xs flex items-center gap-2">
            Member since {formatRegistrationDate(user?._id)}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-white/10 pb-4 overflow-x-auto scrollbar-hide">
        <button 
          onClick={() => setActiveTab('general')}
          className={`px-4 py-2 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === 'general' ? 'bg-bull-orange text-white' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
        >
          General Info
        </button>
        <button 
          onClick={() => setActiveTab('stats')}
          className={`px-4 py-2 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === 'stats' ? 'bg-bull-orange text-white' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
        >
          Statistics
        </button>
        <button 
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === 'security' ? 'bg-bull-orange text-white' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
        >
          Security & 2FA
        </button>
      </div>

      {/* Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* General Info Tab */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            {/* Bio Section */}
            <div className="glass p-8 rounded-3xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <UserIcon size={20} className="text-bull-orange" />
                  Bio
                </h3>
                {!showEditBio && (
                  <button
                    onClick={handleEditBio}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all"
                  >
                    <Edit2 size={16} />
                    {bio ? 'Edit Bio' : 'Add Bio'}
                  </button>
                )}
              </div>

              {showEditBio ? (
                <form onSubmit={handleSubmitBio} className="space-y-4">
                  <textarea 
                    value={bio} 
                    onChange={handleBioChange}
                    placeholder="Tell us about yourself..."
                    maxLength={500}
                    className="w-full bg-bull-dark border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-bull-orange transition-colors min-h-[120px]"
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-zinc-500">{bio.length}/500 characters</span>
                    <div className="flex gap-2">
                      <button 
                        type="button" 
                        onClick={handleCancelBio}
                        className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all"
                        disabled={bioLoading}
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-bull-orange hover:bg-orange-600 transition-all disabled:opacity-50"
                        disabled={bioLoading}
                      >
                        {bioLoading ? 'Updating...' : 'Update Bio'}
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="text-zinc-300 leading-relaxed">
                  {bio || "No bio yet. Tell us about yourself!"}
                </div>
              )}
            </div>

            {/* Personal Information */}
            <div className="glass p-8 rounded-3xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <UserIcon size={20} className="text-bull-orange" />
                  Personal Info
                </h3>
                <button
                  onClick={handleEditClick}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all"
                >
                  <Edit2 size={16} />
                  <span className="hidden md:block">Edit Profile</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-zinc-500 mb-1">Full Name</p>
                  <p className="font-bold">{user?.fullName}</p>
                </div>
                <div>
                  <p className="text-sm text-zinc-500 mb-1 flex items-center gap-1">
                    <Mail size={14} /> Email
                  </p>
                  <p className="font-bold">{user?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-zinc-500 mb-1">User ID</p>
                  <p className="font-mono text-sm">{user?._id}</p>
                </div>
                <div>
                  <p className="text-sm text-zinc-500 mb-1">Gender</p>
                  <p className="font-bold">{user?.gender || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm text-zinc-500 mb-1 flex items-center gap-1">
                    <Globe size={14} /> Country
                  </p>
                  <div className="flex items-center gap-2">
                    {selectedFlag && (
                      <img className="w-5 h-5 object-cover rounded" src={selectedFlag} alt="" />
                    )}
                    <p className="font-bold">{user?.country || 'Not specified'}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-zinc-500 mb-1">Twitter/X Username</p>
                  <p className="font-bold">{user?.twitterUsername || 'Not specified'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Statistics Tab */}
        {activeTab === 'stats' && (
          <div className="glass p-8 rounded-3xl">
            <h3 className="text-xl font-bold flex items-center gap-2 mb-6">
              <Coins size={20} className="text-bull-orange" />
              Profile Statistics
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-sm text-zinc-500 mb-1">AD Viewed</p>
                <p className="text-2xl font-bold">{(user?.ptcRecords?.length) || 0}</p>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-sm text-zinc-500 mb-1">Offers Completed</p>
                <p className="text-2xl font-bold">{(user?.offerWallRecords?.length) || 0}</p>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-sm text-zinc-500 mb-1">Faucet Claimed</p>
                <p className="text-2xl font-bold">{(user?.faucetClaimRecords?.length) || 0}</p>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-sm text-zinc-500 mb-1 flex items-center gap-1">
                  <Users size={14} /> Referrals
                </p>
                <p className="text-2xl font-bold">{user?.referrals?.length || 0}</p>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-sm text-zinc-500 mb-1 flex items-center gap-1">
                  <DollarSign size={14} /> Total Earnings
                </p>
                <p className="text-2xl font-bold text-emerald-400">
                  ${(user?.totalEarningUsd || 0).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-sm text-zinc-500 mb-1 flex items-center gap-1">
                  <DollarSign size={14} /> Total Referral Bonus
                </p>
                <p className="text-2xl font-bold text-emerald-400">
                  ${(user?.totalReferralEarningUsd || 0).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <div className="glass p-8 rounded-3xl">
              <div className="flex items-center gap-3 mb-6">
                <Key className="w-6 h-6 text-bull-orange" />
                <h3 className="text-xl font-bold">Change Password</h3>
              </div>
              <p className="text-zinc-400 mb-6">
                Click the button below to reset your password. You'll receive an email with instructions.
              </p>
              <button 
                onClick={handleResetPassword}
                className="px-8 py-3 bg-bull-orange text-white font-bold rounded-xl hover:bg-orange-600 transition-colors"
              >
                Reset Password
              </button>
            </div>

            <div className="glass p-8 rounded-3xl">
              <div className="flex items-center gap-3 mb-6">
                <Shield className="w-6 h-6 text-emerald-400" />
                <h3 className="text-xl font-bold">Two-Factor Authentication (2FA)</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-white/10 rounded-xl bg-bull-dark">
                  <div>
                    <h4 className="font-bold mb-1">Email 2FA</h4>
                    <p className="text-sm text-zinc-500">Receive OTP codes via email</p>
                  </div>
                  <button 
                    onClick={() => setOpenModal(true)}
                    className={`px-6 py-2 rounded-xl font-bold transition-colors ${user?.twoFAEnabled ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'}`}
                  >
                    {user?.twoFAEnabled ? 'Disable' : 'Enable'}
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 border border-white/10 rounded-xl bg-bull-dark">
                  <div>
                    <h4 className="font-bold mb-1">Authenticator App 2FA</h4>
                    <p className="text-sm text-zinc-500">Use Google Authenticator or Authy</p>
                  </div>
                  <button 
                    onClick={() => setOpenAuthModal(true)}
                    className={`px-6 py-2 rounded-xl font-bold transition-colors ${user?.authTwoFAEnabled ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'}`}
                  >
                    {user?.authTwoFAEnabled ? 'Disable' : 'Enable'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Sign Out Button */}
      <div className="mt-8 flex justify-center">
        <button 
          onClick={handleLogout}
          className="px-8 py-3 bg-red-500/10 text-red-400 font-bold rounded-xl hover:bg-red-500/20 transition-colors border border-red-500/20"
        >
          Sign Out
        </button>
      </div>

      {/* Modals */}
      {openModal && (
        <TwoFAModal 
          user={user} 
          onClose={() => setOpenModal(false)}
          setAlert={setAlert}
        />
      )}

      {openAuthModal && (
        <TwoFAAuthModal 
          user={user} 
          onClose={() => setOpenAuthModal(false)}
          setAlert={setAlert}
        />
      )}
      
      {openEditModal && (
        <ProfileEditModal
          user={user}
          onClose={() => setOpenEditModal(false)}
          onSave={handleSaveProfile}
          countries={countries}
          selectedFlag={selectedFlag}
        />
      )}

      {openOTPModal && user && (
        <ProfileOTPVerificationModal
          email={user.email}
          onClose={() => {
            setOpenOTPModal(false);
            setPendingProfileData(null);
          }}
          onVerified={handleOTPVerified}
          setAlert={setAlert}
        />
      )}
      
      <ResetPasswordModal
        isOpen={isResetPasswordModalOpen}
        onClose={() => setIsResetPasswordModalOpen(false)}
        email={user?.email || ""}
        setAlert={setAlert}
      />
      
      {/* Logout Confirmation Modal */}
      {logoutModalActive && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`max-w-md w-full rounded-3xl glass border border-white/10 p-6 transform transition-all duration-500 ${isClosing ? 'scale-90 opacity-0' : 'scale-100 opacity-100'}`}>
            <div className="flex items-center justify-center mb-6">
              <AlertCircle className="w-12 h-12 text-red-400" />
            </div>
            <h3 className="text-xl font-bold text-center mb-4">Are you sure you want to sign out?</h3>
            <div className="flex gap-3">
              <button 
                className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all font-bold"
                onClick={closeModal}
              >
                No
              </button>
              <button 
                className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 transition-all font-bold"
                onClick={handleSignOut}
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};