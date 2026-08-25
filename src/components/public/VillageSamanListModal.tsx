import React, { useState } from 'react';
import { TentAddon } from '../../types';
import { X, Armchair, Utensils, Sparkles, Volume2, Zap, Box, Check, Phone, Sun, Snowflake, CloudRain } from 'lucide-react';

interface VillageSamanListModalProps {
  addons: TentAddon[];
  isOpen: boolean;
  onClose: () => void;
  onSelectTentForBooking?: () => void;
}

export const VillageSamanListModal: React.FC<VillageSamanListModalProps> = ({
  addons,
  isOpen,
  onClose,
  onSelectTentForBooking
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');

  if (!isOpen) return null;

  const categories = [
    { id: 'All', label: 'सभी सामान (All Items)' },
    { id: 'Garmiyon Ka Saman', label: '☀️ गर्मी (कूलर/पंखा/कैंपर)' },
    { id: 'Sardiyon Ka Saman', label: '❄️ सर्दी (हीटर/रजाई/सिगड़ी)' },
    { id: 'Barsat Ka Saman', label: '🌧️ बरसात (तिरपाल/तख्त)' },
    { id: 'Saf-Safai Ka Saman', label: '🧹 सफाई (वॉशबेसिन/डस्टबिन)' },
    { id: 'Baithne Ka Saman', label: '🪑 बैठने का सामान (Seating)' },
    { id: 'Sajane Ka Saman', label: '🌸 सजावट व स्टेज (Decor)' },
    { id: 'Khana Bnane Ka Saman', label: '🍳 हलवाई / खाना बनाने का सामान' },
    { id: 'Lighting & Sound', label: '💡 लाइटिंग व साउंड' },
    { id: 'Bijli & Generator', label: '⚡ जनरेटर व बिजली' }
  ];

  const filtered = addons.filter(item => {
    if (activeCategory === 'All') return true;
    return item.category === activeCategory;
  });

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'Garmiyon Ka Saman': return <Sun className="w-4 h-4 text-amber-500" />;
      case 'Sardiyon Ka Saman': return <Snowflake className="w-4 h-4 text-sky-500" />;
      case 'Barsat Ka Saman': return <CloudRain className="w-4 h-4 text-blue-500" />;
      case 'Saf-Safai Ka Saman': return <Sparkles className="w-4 h-4 text-teal-600" />;
      case 'Baithne Ka Saman': return <Armchair className="w-4 h-4 text-amber-600" />;
      case 'Sajane Ka Saman': return <Sparkles className="w-4 h-4 text-pink-600" />;
      case 'Khana Bnane Ka Saman': return <Utensils className="w-4 h-4 text-emerald-600" />;
      case 'Lighting & Sound': return <Volume2 className="w-4 h-4 text-blue-600" />;
      case 'Bijli & Generator': return <Zap className="w-4 h-4 text-yellow-600" />;
      default: return <Box className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      
      {/* Modal Card */}
      <div 
        className="relative bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Armchair className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-white">
                बैठने, सजाने व हलवाई सामान की संपूर्ण सूची
              </h3>
              <p className="text-xs text-slate-400">
                गांव-देहात व लॉन पार्टी के लिए सभी जरूरी सामान की वाजिब किराया दर (प्रति दिन)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Categories Bar */}
        <div className="p-4 bg-slate-100/80 border-b border-slate-200 flex items-center gap-2 overflow-x-auto scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Items Grid */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filtered.map(item => (
              <div 
                key={item.id} 
                className="p-4 bg-slate-50 rounded-2xl border border-slate-200 hover:border-emerald-400/80 hover:bg-white hover:shadow-xs transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-white border border-slate-200 shrink-0">
                        {getCategoryIcon(item.category)}
                      </div>
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900 leading-snug">
                        {item.hindiName || item.name}
                      </h4>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed mb-3">
                    {item.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-500">{item.category}</span>
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-emerald-800 font-mono">₹{item.pricePerDay}</span>
                    <span className="text-[10px] text-slate-500 block">/ {item.unit}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="p-8 text-center text-slate-500 text-xs">
              इस श्रेणी में कोई सामान नहीं मिला।
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-600 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>टेंट बुक करते समय आप अपनी जरूरत के अनुसार सामान की मात्रा चुन सकते हैं।</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl cursor-pointer"
            >
              बंद करें
            </button>
            {onSelectTentForBooking && (
              <button
                onClick={() => {
                  onClose();
                  onSelectTentForBooking();
                }}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
              >
                टेंट व सामान बुक करें
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
