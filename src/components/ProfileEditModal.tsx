import React, { useState, useEffect, useRef } from 'react';
import { X, Search, ChevronDown } from 'lucide-react';

interface ProfileEditModalProps {
  user: any;
  onClose: () => void;
  onSave: (formData: any) => Promise<void>;
  countries: Array<{ name: string; flag: string }>;
  selectedFlag: string;
}

const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  user,
  onClose,
  onSave,
  countries,
  selectedFlag
}) => {
  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    country: user?.country || "",
    email: user?.email || "",
    twitterUsername: user?.twitterUsername || "",
    gender: user?.gender || "",
  });
  
  const [loading, setLoading] = useState(false);
  const [localSelectedFlag, setLocalSelectedFlag] = useState(selectedFlag);
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Initialize form data
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || "",
        country: user.country || "",
        email: user.email || "",
        twitterUsername: user.twitterUsername || "",
        gender: user.gender || "",
      });
      
      // Set flag for current country
      if (user.country) {
        const foundCountry = countries.find((c) => c.name === user.country);
        if (foundCountry) {
          setLocalSelectedFlag(foundCountry.flag);
        }
      }
    }
  }, [user, countries]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCountryDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle country selection from dropdown
  const handleCountrySelect = (countryName: string, countryFlag: string) => {
    setFormData(prev => ({ ...prev, country: countryName }));
    setLocalSelectedFlag(countryFlag);
    setIsCountryDropdownOpen(false);
    setSearchTerm('');
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onSave(formData);
    setLoading(false);
  };

  // Filter countries based on search term
  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="max-w-md w-full rounded-3xl glass border border-white/10 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h3 className="text-xl font-bold">Edit Profile</h3>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full glass flex items-center justify-center hover:bg-white/10 transition-all"
            disabled={loading}
          >
            <X size={16} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
          <div>
            <label className="block text-sm font-bold text-zinc-400 mb-2">Full Name</label>
            <input 
              type='text' 
              name="fullName"
              value={formData.fullName} 
              onChange={handleChange}
              required
              className="w-full bg-bull-dark border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-bull-orange transition-colors"
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-zinc-400 mb-2">Email</label>
            <input 
              type='email' 
              name="email"
              value={formData.email} 
              onChange={handleChange}
              required
              className="w-full bg-bull-dark border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-bull-orange transition-colors"
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-zinc-400 mb-2">Gender</label>
            <select 
              name="gender"
              value={formData.gender} 
              onChange={handleChange}
              className="w-full bg-bull-dark border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-bull-orange transition-colors"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-zinc-400 mb-2">Twitter/X Username</label>
            <input 
              type='text' 
              name="twitterUsername"
              value={formData.twitterUsername} 
              onChange={handleChange}
              placeholder="@username"
              className="w-full bg-bull-dark border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-bull-orange transition-colors"
            />
          </div>
          
          {/* Country Dropdown with Search */}
          <div ref={dropdownRef}>
            <label className="block text-sm font-bold text-zinc-400 mb-2">Country</label>
            <div className="relative">
              {/* Selected country display */}
              <button
                type="button"
                onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                className="w-full flex items-center justify-between bg-bull-dark border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-bull-orange transition-colors"
              >
                <div className="flex items-center gap-2">
                  {localSelectedFlag && (
                    <img 
                      className="w-5 h-5 object-cover rounded" 
                      src={localSelectedFlag} 
                      alt="" 
                    />
                  )}
                  <span className={formData.country ? 'text-white' : 'text-zinc-500'}>
                    {formData.country || 'Select Country'}
                  </span>
                </div>
                <ChevronDown size={18} className={`transition-transform ${isCountryDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown menu */}
              {isCountryDropdownOpen && (
                <div className="absolute z-10 w-full mt-2 bg-bull-dark border border-white/10 rounded-xl overflow-hidden shadow-2xl">
                  {/* Search input */}
                  <div className="p-2 border-b border-white/10">
                    <div className="relative">
                      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                      <input
                        type="text"
                        placeholder="Search countries..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-bull-orange transition-colors"
                        autoFocus
                      />
                    </div>
                  </div>

                  {/* Country list */}
                  <div className="max-h-60 overflow-y-auto">
                    {filteredCountries.length > 0 ? (
                      filteredCountries.map((country) => (
                        <button
                          key={country.name}
                          type="button"
                          onClick={() => handleCountrySelect(country.name, country.flag)}
                          className={`w-full flex items-center gap-3 px-4 py-2 hover:bg-white/5 transition-colors ${
                            formData.country === country.name ? 'bg-bull-orange/10' : ''
                          }`}
                        >
                          <img 
                            className="w-5 h-5 object-cover rounded flex-shrink-0" 
                            src={country.flag} 
                            alt={country.name}
                          />
                          <span className="text-sm text-left flex-1">{country.name}</span>
                          {formData.country === country.name && (
                            <span className="text-bull-orange text-xs font-bold">Selected</span>
                          )}
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-center text-zinc-500 text-sm">
                        No countries found
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex gap-3 pt-4">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all font-bold"
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="flex-1 py-3 rounded-xl bg-bull-orange hover:bg-orange-600 transition-all font-bold disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileEditModal;