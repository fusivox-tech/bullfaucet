// hooks/useAdCreation.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import API_BASE_URL from '../config';

interface AdFormData {
  campaignType: 'Links' | 'Website';
  taskTitle: string;
  taskDescription: string;
  taskUrl: string;
  taskDuration: string;
  clicks: number;
  targetedDevices: string[];
  targetedRegions: string[];
}

interface Country {
  name: string;
  flag: string;
}

export const useAdCreation = (user: any, tokenPrice: number, setAlert: (alert: { message: string; type: string }) => void) => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<AdFormData>({
    campaignType: 'Links',
    taskTitle: '',
    taskDescription: '',
    taskUrl: '',
    taskDuration: '',
    clicks: 1000,
    targetedDevices: ['All', 'Desktop', 'Mobile'],
    targetedRegions: [],
  });

  // Region options organized by continent
  const regionOptions = useMemo(() => ({
    Africa: [
      "Algeria", "Angola", "Benin", "Botswana", "Burkina Faso", "Burundi", "Cabo Verde", "Cameroon",
      "Central African Republic", "Chad", "Comoros", "Congo", "Côte d'Ivoire", "Djibouti", "Egypt",
      "Equatorial Guinea", "Eritrea", "Eswatini", "Ethiopia", "Gabon", "Gambia", "Ghana", "Guinea",
      "Guinea-Bissau", "Kenya", "Lesotho", "Liberia", "Libya", "Madagascar", "Malawi", "Mali",
      "Mauritania", "Mauritius", "Morocco", "Mozambique", "Namibia", "Niger", "Nigeria", "Rwanda",
      "Sao Tome and Principe", "Senegal", "Seychelles", "Sierra Leone", "Somalia", "South Africa",
      "South Sudan", "Sudan", "Tanzania", "Togo", "Tunisia", "Uganda", "Zambia", "Zimbabwe"
    ],
    Asia: [
      "Afghanistan", "Armenia", "Azerbaijan", "Bahrain", "Bangladesh", "Bhutan", "Brunei", "Cambodia",
      "China", "Cyprus", "Georgia", "India", "Indonesia", "Iran", "Iraq", "Israel", "Japan", "Jordan",
      "Kazakhstan", "Kuwait", "Kyrgyzstan", "Laos", "Lebanon", "Malaysia", "Maldives", "Mongolia",
      "Myanmar", "Nepal", "North Korea", "Oman", "Pakistan", "Palestine", "Philippines", "Qatar",
      "Russia", "Saudi Arabia", "Singapore", "South Korea", "Sri Lanka", "Syria", "Taiwan", "Tajikistan",
      "Thailand", "Timor-Leste", "Turkey", "Turkmenistan", "United Arab Emirates", "Uzbekistan",
      "Vietnam", "Yemen"
    ],
    Europe: [
      "Albania", "Andorra", "Austria", "Belarus", "Belgium", "Bosnia and Herzegovina", "Bulgaria",
      "Croatia", "Czech Republic", "Denmark", "Estonia", "Finland", "France", "Germany", "Greece",
      "Hungary", "Iceland", "Ireland", "Italy", "Kosovo", "Latvia", "Liechtenstein", "Lithuania",
      "Luxembourg", "Malta", "Moldova", "Monaco", "Montenegro", "Netherlands", "North Macedonia",
      "Norway", "Poland", "Portugal", "Romania", "San Marino", "Serbia", "Slovakia", "Slovenia",
      "Spain", "Sweden", "Switzerland", "Ukraine", "United Kingdom", "Vatican City"
    ],
    "North America": [
      "Antigua and Barbuda", "Bahamas", "Barbados", "Belize", "Canada", "Costa Rica", "Cuba",
      "Dominica", "Dominican Republic", "El Salvador", "Grenada", "Guatemala", "Haiti", "Honduras",
      "Jamaica", "Mexico", "Nicaragua", "Panama", "Saint Kitts and Nevis", "Saint Lucia",
      "Saint Vincent and the Grenadines", "Trinidad and Tobago", "United States"
    ],
    "South America": [
      "Argentina", "Bolivia", "Brazil", "Chile", "Colombia", "Ecuador", "Guyana", "Paraguay", "Peru",
      "Suriname", "Uruguay", "Venezuela"
    ],
    Oceania: [
      "Australia", "Fiji", "Kiribati", "Marshall Islands", "Micronesia", "Nauru", "New Zealand",
      "Palau", "Papua New Guinea", "Samoa", "Solomon Islands", "Tonga", "Tuvalu", "Vanuatu"
    ],
  }), []);

  const [selectedRegions, setSelectedRegions] = useState(() => {
    const initial: Record<string, string[]> = {};
    Object.keys(regionOptions).forEach((continent) => {
      initial[continent] = [...regionOptions[continent as keyof typeof regionOptions]];
    });
    return initial;
  });

  const [selectedDevices, setSelectedDevices] = useState(["All", "Desktop", "Mobile"]);
  const deviceOptions = useMemo(() => ["All", "Desktop", "Mobile"], []);

  // Calculate reward based on duration
  const calculateReward = useCallback((duration: string) => {
    const usdRewardMapping: Record<string, number> = {
      "10": 0.0004,
      "30": 0.0008,
      "60": 0.0012,
    };
    return usdRewardMapping[duration] || 0;
  }, []);

  // Get cost per click in BULLFI
  const getCostPerClick = useCallback(() => {
    if (formData.campaignType === 'Links') {
      return 0.0008 / tokenPrice;
    }
    return calculateReward(formData.taskDuration) / tokenPrice;
  }, [formData.campaignType, formData.taskDuration, tokenPrice, calculateReward]);

  // Get total cost in BULLFI
  const totalCostBullfi = useMemo(() => {
    const costPerClick = getCostPerClick();
    return costPerClick * formData.clicks;
  }, [getCostPerClick, formData.clicks]);

  // Get total cost in USD
  const totalCostUsd = useMemo(() => {
    if (formData.campaignType === 'Links') {
      return 0.0008 * formData.clicks;
    }
    return calculateReward(formData.taskDuration) * formData.clicks;
  }, [formData.campaignType, formData.taskDuration, formData.clicks, calculateReward]);

  // Duration options for dropdown
  const durationOptions = useMemo(() => [
    { value: "10", label: `10 Seconds (CPC: ${(0.0004 / tokenPrice).toFixed(2)} BULLFI)` },
    { value: "30", label: `30 Seconds (CPC: ${(0.0008 / tokenPrice).toFixed(2)} BULLFI)` },
    { value: "60", label: `60 Seconds (CPC: ${(0.0012 / tokenPrice).toFixed(2)} BULLFI)` }
  ], [tokenPrice]);

  // Fetch countries
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch("https://restcountries.com/v3.1/all");
        if (!response.ok) throw new Error('Failed to fetch countries');
        
        const data = await response.json();
        const countryData = data.map((country: any) => ({
          name: country.name.common,
          flag: country.flags?.svg || country.flags?.png || "",
        })).sort((a: Country, b: Country) => a.name.localeCompare(b.name));

        setCountries(countryData);
      } catch (error) {
        console.error("Error fetching countries:", error);
        // Use fallback data if needed
        setCountries([]);
      }
    };

    fetchCountries();
  }, []);

  // Update regions when form mounts
  useEffect(() => {
    const allCountries = Object.values(regionOptions).flat();
    setFormData(prev => ({
      ...prev,
      targetedRegions: allCountries
    }));
  }, [regionOptions]);

  // Update form data when selectedRegions changes
  useEffect(() => {
    const selectedCountries = Object.values(selectedRegions).flat();
    setFormData(prev => ({
      ...prev,
      targetedRegions: selectedCountries
    }));
  }, [selectedRegions]);

  // Update form data when selectedDevices changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      targetedDevices: selectedDevices.includes("All") 
        ? deviceOptions.slice(1) 
        : selectedDevices
    }));
  }, [selectedDevices, deviceOptions]);

  // Handle device selection
  const handleDeviceChange = (option: string) => {
    let updatedSelection: string[];
    if (option === "All") {
      updatedSelection = selectedDevices.includes("All") ? [] : [...deviceOptions];
    } else {
      updatedSelection = selectedDevices.includes(option)
        ? selectedDevices.filter((item) => item !== option)
        : [...selectedDevices, option];

      if (selectedDevices.includes("All") && !updatedSelection.includes(option)) {
        updatedSelection = updatedSelection.filter((item) => item !== "All");
      }

      if (deviceOptions.slice(1).every((opt) => updatedSelection.includes(opt))) {
        updatedSelection.push("All");
      }
    }
    setSelectedDevices(updatedSelection);
  };

  // Handle region selection
  const handleRegionChange = (continent: string, country: string | null = null) => {
    setSelectedRegions(prev => {
      const updated = { ...prev };
      const continentKey = continent as keyof typeof regionOptions;
      const continentCountries = regionOptions[continentKey];

      if (country) {
        if (updated[continent].includes(country)) {
          updated[continent] = updated[continent].filter(c => c !== country);
        } else {
          updated[continent] = [...updated[continent], country];
        }
      } else {
        if (updated[continent].length === continentCountries.length) {
          updated[continent] = [];
        } else {
          updated[continent] = [...continentCountries];
        }
      }

      return updated;
    });
  };

  // Get flag URL for a country
  const getFlagUrl = (countryName: string) => {
    const country = countries.find(c => c.name === countryName);
    return country ? country.flag : "";
  };

// Validate URL - FIXED VERSION
const validateUrl = (url: string): { valid: boolean; message: string } => {
  if (!url) {
    return { valid: false, message: "Please enter a URL" };
  }
  
  try {
    const urlObj = new URL(url);
    if (urlObj.protocol !== "https:") {
      return { valid: false, message: "URL must start with https://" };
    }
    return { valid: true, message: "URL is valid" }; // Always return message
  } catch (e) {
    return { valid: false, message: "Please enter a valid URL" };
  }
};

  // Get auth headers
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

  // Handle form submission
  const handleSubmit = async () => {
    setLoading(true);
    
    if (!user) {
      setAlert({ message: "User not found. Please log in again.", type: "error" });
      setLoading(false);
      return;
    }
    
    if (!formData.taskTitle) {
      setAlert({ message: "Add a title", type: "error" });
      setLoading(false);
      return;
    }
    
    if (!formData.taskDescription) {
      setAlert({ message: "Add a description", type: "error" });
      setLoading(false);
      return;
    }
    
    const urlValidation = validateUrl(formData.taskUrl);
    if (!urlValidation.valid) {
      setAlert({ message: urlValidation.message, type: "error" });
      setLoading(false);
      return;
    }
    
    if (formData.campaignType === 'Website' && !formData.taskDuration) {
      setAlert({ message: "Please select a duration.", type: "error" });
      setLoading(false);
      return;
    }
    
    if (formData.clicks < 1000) {
      setAlert({ message: "Minimum clicks is 1000.", type: "error" });
      setLoading(false);
      return;
    }

    // Check balance
    if (user.bullfiBalance < totalCostBullfi) {
      setAlert({ message: "Insufficient BULLFI balance.", type: "error" });
      setLoading(false);
      return;
    }
    
    if (formData.targetedDevices.length < 1) {
      setAlert({ message: "You must select a device type.", type: "error" });
      setLoading(false);
      return;
    }
    
    if (formData.targetedRegions.length < 1) {
      setAlert({ message: "You must select at least one country.", type: "error" });
      setLoading(false);
      return;
    }
    
    const userId = user._id || user.id;

    try {
      const headers = getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/tasks/create-task`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({ 
          ...formData, 
          userId,
          taskReward: formData.campaignType === 'Links' ? 0.0008 : calculateReward(formData.taskDuration)
        }),
      });

      if (response.status === 401 || response.status === 403) {
        setAlert({ message: "Session expired. Please log in again.", type: "error" });
        return;
      }

      const data = await response.json();
      if (response.ok) {
        setAlert({ message: "Campaign created successfully!", type: "success" });
        
        // Reset form
        setFormData({
          campaignType: 'Links',
          taskTitle: '',
          taskDescription: '',
          taskUrl: '',
          taskDuration: '',
          clicks: 1000,
          targetedDevices: ['All', 'Desktop', 'Mobile'],
          targetedRegions: Object.values(regionOptions).flat(),
        });
        setSelectedDevices(["All", "Desktop", "Mobile"]);
        
        // Reset regions
        const initialRegions: Record<string, string[]> = {};
        Object.keys(regionOptions).forEach((continent) => {
          initialRegions[continent] = [...regionOptions[continent as keyof typeof regionOptions]];
        });
        setSelectedRegions(initialRegions);
        
      } else {
        setAlert({ message: data.message || "Failed to create campaign", type: "error" });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setAlert({ message: "Something went wrong.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (field: keyof AdFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle URL change (remove spaces and lowercase)
  const handleUrlChange = (value: string) => {
    const cleaned = value.replace(/\s/g, '').toLowerCase();
    setFormData(prev => ({ ...prev, taskUrl: cleaned }));
  };

  // Handle campaign type change
  const handleCampaignTypeChange = (type: 'Links' | 'Website') => {
    setFormData(prev => ({
      ...prev,
      campaignType: type,
      taskDuration: type === 'Links' ? '' : prev.taskDuration
    }));
  };

  return {
    formData,
    loading,
    countries,
    regionOptions,
    selectedRegions,
    selectedDevices,
    deviceOptions,
    durationOptions,
    totalCostBullfi,
    totalCostUsd,
    getCostPerClick,
    handleInputChange,
    handleUrlChange,
    handleCampaignTypeChange,
    handleDeviceChange,
    handleRegionChange,
    getFlagUrl,
    handleSubmit,
    validateUrl,
  };
};