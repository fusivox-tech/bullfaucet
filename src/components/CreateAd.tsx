// components/CreateAd.tsx
import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  PlusSquare, Eye, Clock, Link, DollarSign, Globe, Smartphone, ChevronDown } from 'lucide-react';
import { useAdCreation } from '../hooks/useAdCreation';
import { useData } from '../contexts/DataContext.tsx';

export const CreateAd = ({ user }: { user: any }) => {
  const { tokenPrice, setAlert } = useData();
  const [expandedSection, setExpandedSection] = useState<string | null>('basics');
  
  const {
    formData,
    loading,
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
  } = useAdCreation(user, tokenPrice, setAlert);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const totalCostBullfiFormatted = (Math.round(totalCostBullfi)).toLocaleString();
  const costPerClickFormatted = (Math.round(getCostPerClick())).toLocaleString();

  return (
    <div className="max-w-6xl mx-auto px-2 pb-12">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-bull-orange/20 mb-4">
          <PlusSquare className="w-10 h-10 text-bull-orange" />
        </div>
        <h2 className="text-4xl md:text-5xl font-display font-bold mb-3">Create PTC Campaign</h2>
        <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
          Advertise your website, referral link, or project to thousands of active crypto users.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {/* Campaign Type Selection */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="glass p-6 rounded-2xl"
          >
            <div 
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection('type')}
            >
              <h3 className="text-xl font-display font-bold flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-bull-orange/20 flex items-center justify-center text-bull-orange">1</span>
                Campaign Type
              </h3>
              <ChevronDown className={`w-5 h-5 transition-transform ${expandedSection === 'type' ? 'rotate-180' : ''}`} />
            </div>
            
            {expandedSection === 'type' && (
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <button
                  onClick={() => handleCampaignTypeChange('Links')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    formData.campaignType === 'Links'
                      ? 'border-bull-orange bg-bull-orange/10'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="text-left">
                    <div className="font-bold mb-1">Frameless Ad</div>
                    <div className="text-xs text-zinc-400">Opens in new tab</div>
                    <div className="text-xs text-emerald-400 mt-2">CPC: {costPerClickFormatted} BULLFI</div>
                  </div>
                </button>
                
                <button
                  onClick={() => handleCampaignTypeChange('Website')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    formData.campaignType === 'Website'
                      ? 'border-bull-orange bg-bull-orange/10'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="text-left">
                    <div className="font-bold mb-1">Framed Ad</div>
                    <div className="text-xs text-zinc-400">Opens in iframe</div>
                    <div className="text-xs text-zinc-400 mt-2">Select duration below</div>
                  </div>
                </button>
              </div>
            )}
          </motion.div>

          {/* Ad Details */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="glass p-6 rounded-2xl"
          >
            <div 
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection('details')}
            >
              <h3 className="text-xl font-display font-bold flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-bull-orange/20 flex items-center justify-center text-bull-orange">2</span>
                Ad Details
              </h3>
              <ChevronDown className={`w-5 h-5 transition-transform ${expandedSection === 'details' ? 'rotate-180' : ''}`} />
            </div>
            
            {expandedSection === 'details' && (
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-zinc-400 mb-2">Campaign Title</label>
                  <input 
                    type="text" 
                    value={formData.taskTitle}
                    onChange={(e) => handleInputChange('taskTitle', e.target.value)}
                    placeholder="e.g., Join the best crypto exchange"
                    maxLength={30}
                    className="w-full bg-bull-dark border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-bull-orange transition-colors"
                  />
                  <p className="text-xs text-zinc-500 mt-1 text-right">{formData.taskTitle.length}/30</p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-zinc-400 mb-2">Description</label>
                  <textarea 
                    value={formData.taskDescription}
                    onChange={(e) => handleInputChange('taskDescription', e.target.value)}
                    placeholder="Briefly describe what users will see..."
                    maxLength={100}
                    rows={2}
                    className="w-full bg-bull-dark border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-bull-orange transition-colors resize-none"
                  />
                  <p className="text-xs text-zinc-500 mt-1 text-right">{formData.taskDescription.length}/100</p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-zinc-400 mb-2 flex items-center gap-2">
                    <Link className="w-4 h-4" /> Target URL
                  </label>
                  <input 
                    type="text" 
                    value={formData.taskUrl}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    placeholder="https://your-website.com"
                    className="w-full bg-bull-dark border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-bull-orange transition-colors"
                  />
                </div>

                {formData.campaignType === 'Website' && (
                  <div>
                    <label className="block text-sm font-bold text-zinc-400 mb-2 flex items-center gap-2">
                      <Clock className="w-4 h-4" /> View Duration
                    </label>
                    <select 
                      value={formData.taskDuration}
                      onChange={(e) => handleInputChange('taskDuration', e.target.value)}
                      className="w-full bg-bull-dark border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-bull-orange transition-colors appearance-none"
                    >
                      <option value="">Select duration</option>
                      {durationOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-bold text-zinc-400 mb-2 flex items-center gap-2">
                    <Eye className="w-4 h-4" /> Total Views
                  </label>
                  <input 
                    type="number" 
                    value={formData.clicks}
                    onChange={(e) => handleInputChange('clicks', Math.max(1000, Number(e.target.value)))}
                    min={1000}
                    step={100}
                    className="w-full bg-bull-dark border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-bull-orange transition-colors"
                  />
                  <p className="text-xs text-zinc-500 mt-1">Minimum: 1,000 views</p>
                </div>
              </div>
            )}
          </motion.div>

          {/* Audience Targeting */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="glass p-6 rounded-2xl"
          >
            <div 
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection('targeting')}
            >
              <h3 className="text-xl font-display font-bold flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-bull-orange/20 flex items-center justify-center text-bull-orange">3</span>
                Audience Targeting
              </h3>
              <ChevronDown className={`w-5 h-5 transition-transform ${expandedSection === 'targeting' ? 'rotate-180' : ''}`} />
            </div>
            
            {expandedSection === 'targeting' && (
              <div className="mt-4 space-y-6">
                <div>
                  <label className="block text-sm font-bold text-zinc-400 mb-3 flex items-center gap-2">
                    <Smartphone className="w-4 h-4" /> Device Types
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {deviceOptions.map((option) => (
                      <label key={option} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedDevices.includes(option)}
                          onChange={() => handleDeviceChange(option)}
                          className="w-4 h-4 rounded border-white/10 bg-bull-dark text-bull-orange focus:ring-bull-orange"
                        />
                        <span className="text-sm">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-zinc-400 mb-3 flex items-center gap-2">
                    <Globe className="w-4 h-4" /> Regions
                  </label>
                  <div className="space-y-4">
                    {Object.entries(regionOptions).map(([continent, countries]) => (
                      <div key={continent} className="border border-white/10 rounded-xl p-4">
                        <label className="flex items-center gap-2 cursor-pointer mb-3 pb-2 border-b border-white/10">
                          <input
                            type="checkbox"
                            checked={selectedRegions[continent]?.length === countries.length}
                            onChange={() => handleRegionChange(continent)}
                            className="w-4 h-4 rounded border-white/10 bg-bull-dark text-bull-orange focus:ring-bull-orange"
                          />
                          <span className="font-bold">{continent}</span>
                          <span className="text-xs text-zinc-500">
                            ({selectedRegions[continent]?.length || 0}/{countries.length})
                          </span>
                        </label>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-60 overflow-y-auto">
                          {countries.map((country) => (
                            <label key={country} className="flex items-center gap-2 cursor-pointer text-sm">
                              <input
                                type="checkbox"
                                checked={selectedRegions[continent]?.includes(country) || false}
                                onChange={() => handleRegionChange(continent, country)}
                                className="w-3 h-3 rounded border-white/10 bg-bull-dark text-bull-orange focus:ring-bull-orange"
                              />
                              <span className="truncate">{country}</span>
                              {getFlagUrl(country) && (
                                <img 
                                  src={getFlagUrl(country)} 
                                  alt={country}
                                  className="w-4 h-3 object-cover rounded"
                                />
                              )}
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="space-y-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="glass p-6 rounded-2xl border border-bull-orange/30 bg-bull-orange/5 sticky top-24"
          >
            <h3 className="text-xl font-display font-bold mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-bull-orange" />
              Order Summary
            </h3>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Ad Type</span>
                <span className="font-bold">{formData.campaignType === 'Links' ? 'Frameless' : 'Framed'}</span>
              </div>
              
              {formData.campaignType === 'Website' && formData.taskDuration && (
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Duration</span>
                  <span className="font-bold">{formData.taskDuration}s</span>
                </div>
              )}
              
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Views</span>
                <span className="font-bold">{formData.clicks.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Cost per view</span>
                <span className="font-bold">{costPerClickFormatted} BULLFI</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Targeted Countries</span>
                <span className="font-bold">{formData.targetedRegions.length}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Targeted Devices</span>
                <span className="font-bold">
                  {formData.targetedDevices.length === 2 
                    ? formData.targetedDevices.join(' & ')
                    : formData.targetedDevices.join(', ')}
                </span>
              </div>
              
              <div className="h-px bg-white/10 my-2" />
              
              <div className="flex justify-between items-center">
                <span className="text-zinc-400 font-bold">Total Cost</span>
                <div className="text-right">
                  <div className="text-2xl font-display font-bold text-bull-orange">
                    {totalCostBullfiFormatted} BULLFI
                  </div>
                  <div className="text-xs text-zinc-500">
                    ~${totalCostUsd.toFixed(2)} USD
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-bull-dark border border-white/5 mb-4">
              <p className="text-xs text-zinc-400 mb-1">Your Balance</p>
              <p className={`font-mono font-bold ${user?.bullfiBalance >= totalCostBullfi ? 'text-emerald-400' : 'text-red-400'}`}>
                {(Math.round(user?.bullfiBalance)).toLocaleString() || '0'} BULLFI
              </p>
            </div>

            <button 
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-4 bg-bull-orange text-white font-bold text-lg rounded-xl hover:bg-orange-600 transition-colors shadow-lg shadow-bull-orange/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <PlusSquare className="w-5 h-5" />
                  Create Campaign
                </>
              )}
            </button>

            <p className="text-xs text-zinc-500 text-center mt-3">
              Campaigns are reviewed before going live
            </p>
          </motion.div>

        </div>
      </div>
    </div>
  );
};