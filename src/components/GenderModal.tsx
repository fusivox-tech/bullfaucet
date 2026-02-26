// components/GenderModal.tsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import fallbackCountries from '../fallbackCountries.json';
import CustomDropdown from './CustomDropdown';

interface GenderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (gender: string, country: string) => void;
  isLoading?: boolean;
  userCountry?: string;
}

interface Country {
  name: string;
  flag: string;
}

const genderOptions = [
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
  { value: 'Other', label: 'Other' },
];

const GenderModal: React.FC<GenderModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  isLoading = false,
  userCountry = ""
}) => {
  const [selectedGender, setSelectedGender] = useState('');
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [isCountryDetected, setIsCountryDetected] = useState(true);
  
  const genderDropdownRef = useRef<HTMLDivElement>(null);
  const countryDropdownRef = useRef<HTMLDivElement>(null);

  // Initialize countries
  useEffect(() => {
    try {
      const formattedCountries = fallbackCountries.map((country: any) => ({
        name: country.country,
        flag: country.flag_base64
      })).sort((a, b) => a.name.localeCompare(b.name));
      
      setCountries(formattedCountries);
    } catch (error) {
      console.error("Error loading countries:", error);
    }
  }, []);

  // Set initial country
  useEffect(() => {
    if (countries.length > 0 && userCountry) {
      const foundCountry = countries.find((c) => 
        c.name.toLowerCase() === userCountry.toLowerCase()
      );
      
      if (foundCountry) {
        setSelectedCountry(foundCountry.name);
        setIsCountryDetected(true);
      } else {
        setSelectedCountry("");
        setIsCountryDetected(false);
      }
    } else if (countries.length > 0 && !userCountry) {
      setSelectedCountry("");
      setIsCountryDetected(false);
    }
  }, [countries, userCountry]);

  const handleGenderChange = (genderValue: string) => {
    setSelectedGender(genderValue);
  };

  const handleCountryChange = (countryName: string) => {
    setSelectedCountry(countryName);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGender || (!isCountryDetected && !selectedCountry)) return;
    onSubmit(selectedGender, isCountryDetected ? userCountry : selectedCountry);
  };

  const handleClose = () => {
    setSelectedGender('');
    setSelectedCountry('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-bull-dark/80 backdrop-blur-sm" 
            onClick={handleClose} 
          />
          
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-md glass p-8 rounded-[2.5rem] border border-white/10"
          >
            <button 
              onClick={handleClose} 
              disabled={isLoading}
              className="absolute top-6 right-6 p-2 hover:bg-white/5 rounded-full transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="text-center mb-8">
              <img 
                src="https://res.cloudinary.com/danuehpic/image/upload/v1771869182/wordmark_pynw6f.png" 
                alt="Bull Faucet" 
                className="h-8 object-contain mx-auto mb-4" 
                referrerPolicy="no-referrer" 
                style={{transform: 'translateX(-3px)'}} 
              />
              <h3 className="text-2xl font-display font-bold">Complete Your Profile</h3>
              <p className="text-zinc-400 text-sm mt-2">
                {isCountryDetected 
                  ? "Please select your gender to complete your registration."
                  : "Please select your gender and country to complete your registration."
                }
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Gender Selection with CustomDropdown */}
              <div ref={genderDropdownRef}>
                <label className="block text-sm font-bold text-zinc-400 mb-2">
                  Select Gender *
                </label>
                <CustomDropdown
                  type="gender"
                  value={selectedGender}
                  onChange={handleGenderChange}
                  genderOptions={genderOptions}
                  placeholder="Select your gender..."
                  disabled={isLoading}
                />
              </div>

              {/* Country Selection (if not detected) */}
              {!isCountryDetected && (
                <div ref={countryDropdownRef}>
                  <label className="block text-sm font-bold text-zinc-400 mb-2">
                    Select Your Country *
                  </label>
                  <CustomDropdown
                    type="country"
                    value={selectedCountry}
                    onChange={handleCountryChange}
                    countries={countries}
                    placeholder="Select your country..."
                    disabled={isLoading}
                  />
                  <p className="text-xs text-zinc-500 mt-2">
                    Country could not be automatically detected. Please select your country manually.
                  </p>
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isLoading}
                  className="py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedGender || (!isCountryDetected && !selectedCountry) || isLoading}
                  className="py-3 rounded-xl bg-bull-orange hover:bg-orange-600 text-white font-bold transition-colors shadow-lg shadow-bull-orange/20 disabled:opacity-50"
                >
                  {isLoading ? 'Submitting...' : 'Continue'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default GenderModal;