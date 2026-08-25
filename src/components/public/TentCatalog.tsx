import React, { useState, useMemo } from 'react';
import { Tent, FilterState } from '../../types';
import { TentCard } from './TentCard';
import { Search, SlidersHorizontal, RotateCcw, Sparkles, Users, Layers, Check } from 'lucide-react';

interface TentCatalogProps {
  tents: Tent[];
  filters?: FilterState;
  onFilterChange?: React.Dispatch<React.SetStateAction<FilterState>>;
  filterState?: FilterState;
  setFilterState?: React.Dispatch<React.SetStateAction<FilterState>>;
  onSelectTent?: (tent: Tent) => void;
  onSelectTentForDetail?: (tent: Tent) => void;
  onBookTent?: (tent: Tent) => void;
  onSelectTentForBooking?: (tent: Tent) => void;
  onOpenSamanList?: () => void;
}

const CATEGORIES = [
  'All Styles',
  'Desi Shamyana Pandal',
  'Bhojan & Pangat Shamyana',
  'Waterproof German Pandal',
  'Vivah & Mandap Pandal',
  'Stage & Gate Setup'
];

export const TentCatalog: React.FC<TentCatalogProps> = ({
  tents,
  filters,
  onFilterChange,
  filterState: propFilterState,
  setFilterState: propSetFilterState,
  onSelectTent,
  onSelectTentForDetail,
  onBookTent,
  onSelectTentForBooking,
  onOpenSamanList
}) => {
  const [internalFilters, setInternalFilters] = useState<FilterState>({
    searchQuery: '',
    category: 'All Styles',
    minCapacity: 0,
    maxPrice: 50000,
    surfaceType: '',
    sortBy: 'recommended'
  });

  const activeFilters = filters || propFilterState || internalFilters;
  const setActiveFilters = onFilterChange || propSetFilterState || setInternalFilters;

  const handleSelectTent = onSelectTentForDetail || onSelectTent || (() => {});
  const handleBookTent = onSelectTentForBooking || onBookTent || (() => {});

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Compute filtered & sorted list
  const filteredTents = useMemo(() => {
    return tents.filter(tent => {
      // Search query
      if (activeFilters.searchQuery) {
        const q = activeFilters.searchQuery.toLowerCase();
        const matchesName = tent.name.toLowerCase().includes(q);
        const matchesHindi = (tent.hindiName || '').toLowerCase().includes(q);
        const matchesDesc = tent.description.toLowerCase().includes(q);
        const matchesCat = tent.category.toLowerCase().includes(q);
        if (!matchesName && !matchesHindi && !matchesDesc && !matchesCat) return false;
      }

      // Category
      if (activeFilters.category && activeFilters.category !== 'All Styles' && activeFilters.category !== 'All') {
        if (tent.category !== activeFilters.category) return false;
      }

      // Min Capacity (Check standing or seated capacity)
      if (activeFilters.minCapacity > 0) {
        if (tent.detailedSpecs.capacityStanding < activeFilters.minCapacity) return false;
      }

      // Max Price
      if (activeFilters.maxPrice > 0) {
        if (tent.pricePerDay > activeFilters.maxPrice) return false;
      }

      // Surface Type
      if (activeFilters.surfaceType) {
        if (!tent.supportedSurfaces.includes(activeFilters.surfaceType as any)) return false;
      }

      return true;
    }).sort((a, b) => {
      switch (activeFilters.sortBy) {
        case 'price-low':
          return a.pricePerDay - b.pricePerDay;
        case 'price-high':
          return b.pricePerDay - a.pricePerDay;
        case 'capacity-high':
          return b.detailedSpecs.capacityStanding - a.detailedSpecs.capacityStanding;
        case 'rating':
          return b.rating - a.rating;
        default:
          return (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0);
      }
    });
  }, [tents, activeFilters]);

  const handleResetFilters = () => {
    setActiveFilters({
      searchQuery: '',
      category: 'All Styles',
      minCapacity: 0,
      maxPrice: 50000,
      surfaceType: '',
      sortBy: 'recommended'
    });
  };

  const hasActiveFilters = 
    activeFilters.searchQuery || 
    (activeFilters.category && activeFilters.category !== 'All Styles' && activeFilters.category !== 'All') ||
    activeFilters.minCapacity > 0 ||
    (activeFilters.maxPrice && activeFilters.maxPrice < 50000) ||
    activeFilters.surfaceType;

  return (
    <section id="tent-catalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 tracking-wider uppercase bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200/80 mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            उपलब्ध टेंट व शामियाना कैटलॉग (Tents Fleet)
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            देसी शामियाना, वाटरप्रूफ पंडाल व विवाह मंडप
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
            गांव के खेत, खलिहान, दरवाजे व लॉन पार्टी के लिए तैयार टेंट व शामियाना।
          </p>
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-2.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider shrink-0">
            क्रम (Sort):
          </label>
          <select
            value={activeFilters.sortBy}
            onChange={(e) => setActiveFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
            className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none shadow-2xs cursor-pointer"
          >
            <option value="recommended">अनुशंसित (Recommended)</option>
            <option value="price-low">किराया: कम से अधिक (Low to High)</option>
            <option value="price-high">किराया: अधिक से कम (High to Low)</option>
            <option value="capacity-high">क्षमता: बड़ा पंडाल पहले</option>
            <option value="rating">ग्राहक रेटिंग के आधार पर</option>
          </select>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
        {CATEGORIES.map(cat => {
          const isSelected = (activeFilters.category === cat) || (!activeFilters.category && cat === 'All Styles') || (activeFilters.category === 'All' && cat === 'All Styles');
          const count = cat === 'All Styles' 
            ? tents.length 
            : tents.filter(t => t.category === cat).length;

          return (
            <button
              key={cat}
              onClick={() => setActiveFilters(prev => ({ ...prev, category: cat }))}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                isSelected
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/90'
              }`}
            >
              <span>{cat}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                isSelected ? 'bg-emerald-700 text-emerald-100' : 'bg-slate-100 text-slate-500'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search & Filter Controls Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          
          {/* Search text input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="टेंट नाम, साइज (उदा: 30x60, 40x80), या खासियत से खोजें..."
              value={activeFilters.searchQuery}
              onChange={(e) => setActiveFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none transition-all"
            />
            {activeFilters.searchQuery && (
              <button
                onClick={() => setActiveFilters(prev => ({ ...prev, searchQuery: '' }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                हटाएं
              </button>
            )}
          </div>

          {/* Toggle Advanced Filters */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                showAdvancedFilters || hasActiveFilters
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              {showAdvancedFilters ? 'फ़िल्टर छिपाएं' : 'और फ़िल्टर'}
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              )}
            </button>

            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                title="सभी फ़िल्टर रीसेट करें"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                रीसेट
              </button>
            )}
          </div>

        </div>

        {/* Expanded Filters Drawer */}
        {showAdvancedFilters && (
          <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-6">
            
            {/* Min Capacity */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-2">
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-emerald-600" />
                  न्यूनतम मेहमान (Capacity)
                </span>
                <span className="text-emerald-700 font-bold font-mono">{activeFilters.minCapacity || 'सभी'} लोग</span>
              </div>
              <input
                type="range"
                min="0"
                max="500"
                step="50"
                value={activeFilters.minCapacity}
                onChange={(e) => setActiveFilters(prev => ({ ...prev, minCapacity: parseInt(e.target.value) }))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                <span>0</span>
                <span>150</span>
                <span>300</span>
                <span>500+</span>
              </div>
            </div>

            {/* Max Price Per Day */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-2">
                <span className="flex items-center gap-1">
                  <span className="text-emerald-600 font-bold">₹</span>
                  अधिकतम किराया दर / दिन
                </span>
                <span className="text-emerald-700 font-bold font-mono">₹{activeFilters.maxPrice.toLocaleString('en-IN')}/दिन</span>
              </div>
              <input
                type="range"
                min="3000"
                max="50000"
                step="1000"
                value={activeFilters.maxPrice}
                onChange={(e) => setActiveFilters(prev => ({ ...prev, maxPrice: parseInt(e.target.value) }))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                <span>₹3,000</span>
                <span>₹25,000</span>
                <span>₹50,000</span>
              </div>
            </div>

            {/* Surface Compatibility */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                जमीन का प्रकार (Surface)
              </label>
              <select
                value={activeFilters.surfaceType}
                onChange={(e) => setActiveFilters(prev => ({ ...prev, surfaceType: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
              >
                <option value="">सभी जमीन (खेत, कच्ची, पक्की, लॉन)</option>
                <option value="कच्ची जमीन / खेत">कच्ची जमीन / खेत / खलिहान</option>
                <option value="पक्का आंगन / फर्श">पक्का आंगन / फर्श</option>
                <option value="घास का लॉन">घास का लॉन</option>
                <option value="छत / टेरेस">छत / टेरेस</option>
              </select>
            </div>

          </div>
        )}
      </div>

      {/* Results Count Notification */}
      <div className="flex items-center justify-between text-xs text-slate-500 mb-6">
        <span>कुल <strong className="text-slate-900 font-bold">{filteredTents.length}</strong> टेंट व शामियाना मॉडल उपलब्ध हैं</span>
      </div>

      {/* Tent Grid */}
      {filteredTents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTents.map(tent => (
            <TentCard
              key={tent.id}
              tent={tent}
              onSelectTent={handleSelectTent}
              onBookTent={handleBookTent}
            />
          ))}
        </div>
      ) : (
        <div className="bg-slate-100/60 rounded-3xl p-12 text-center max-w-lg mx-auto border border-dashed border-slate-300">
          <div className="w-12 h-12 bg-slate-200 rounded-2xl flex items-center justify-center mx-auto text-slate-500 mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">कोई टेंट नहीं मिला</h3>
          <p className="text-xs text-slate-600 mt-1 max-w-xs mx-auto">
            कृपया फ़िल्टर रीसेट करें या कोई अन्य शब्द खोजें।
          </p>
          <button
            onClick={handleResetFilters}
            className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            सभी फ़िल्टर हटाएं
          </button>
        </div>
      )}

    </section>
  );
};
