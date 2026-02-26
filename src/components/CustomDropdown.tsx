// components/CustomDropdown.tsx
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';

interface CountryOption {
  name: string;
  flag: string;
}

interface GenderOption {
  value: string;
  label: string;
}

interface CustomDropdownProps {
  type: 'country' | 'gender';
  value: string;
  onChange: (value: string, flag?: string) => void;
  countries?: CountryOption[];
  genderOptions?: GenderOption[];
  placeholder?: string;
  disabled?: boolean;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({
  type,
  value,
  onChange,
  countries = [],
  genderOptions = [],
  placeholder = 'Select...',
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Find selected country flag
  const selectedCountry = countries.find(c => c.name === value);
  
  // Filter countries based on search
  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCountrySelect = (countryName: string, countryFlag: string) => {
    onChange(countryName, countryFlag);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleGenderSelect = (genderValue: string) => {
    onChange(genderValue);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between bg-bull-dark border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-bull-orange transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <div className="flex items-center gap-2">
          {type === 'country' && selectedCountry && (
            <img 
              className="w-5 h-5 object-cover rounded" 
              src={selectedCountry.flag} 
              alt="" 
            />
          )}
          <span className={value ? 'text-white' : 'text-zinc-500'}>
            {value || placeholder}
          </span>
        </div>
        <ChevronDown size={18} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-bull-dark border border-white/10 rounded-xl overflow-hidden shadow-2xl">
          {/* Search input for countries */}
          {type === 'country' && (
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
          )}

          {/* Options list */}
          <div className="max-h-60 overflow-y-auto">
            {type === 'country' ? (
              filteredCountries.length > 0 ? (
                filteredCountries.map((country) => (
                  <button
                    key={country.name}
                    type="button"
                    onClick={() => handleCountrySelect(country.name, country.flag)}
                    className={`w-full flex items-center gap-3 px-4 py-2 hover:bg-white/5 transition-colors ${
                      value === country.name ? 'bg-bull-orange/10' : ''
                    }`}
                  >
                    <img 
                      className="w-5 h-5 object-cover rounded flex-shrink-0" 
                      src={country.flag} 
                      alt={country.name}
                    />
                    <span className="text-sm text-left flex-1">{country.name}</span>
                    {value === country.name && (
                      <span className="text-bull-orange text-xs font-bold">Selected</span>
                    )}
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-center text-zinc-500 text-sm">
                  No countries found
                </div>
              )
            ) : (
              genderOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleGenderSelect(option.value)}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors ${
                    value === option.value ? 'bg-bull-orange/10' : ''
                  }`}
                >
                  <span className="text-sm text-left flex-1">{option.label}</span>
                  {value === option.value && (
                    <span className="text-bull-orange text-xs font-bold">Selected</span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;