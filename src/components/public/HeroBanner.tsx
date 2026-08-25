import React, { useState } from 'react';
import { Search, MapPin, Users, Calendar, Sparkles, CheckCircle2, ArrowRight, ShieldCheck, Armchair, Utensils } from 'lucide-react';

interface HeroBannerProps {
  onSearch: (query: string, minGuests: number) => void;
  onOpenSamanList: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onSearch,
  onOpenSamanList
}) => {
  const [guestCount, setGuestCount] = useState('0');
  const [searchKeywords, setSearchKeywords] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchKeywords, parseInt(guestCount) || 0);
  };

  const scrollToCatalog = () => {
    const el = document.getElementById('tent-catalog');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative overflow-hidden bg-slate-950 text-white pt-10 pb-16 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
      {/* Background Graphic Accents */}
      <div className="absolute inset-0 z-0 opacity-15 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none"></div>
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Text Content */}
          <div className="lg:col-span-7 space-y-5 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              देसी व लॉन टेंट हाउस सर्विस • गांव व देहात हेतु विशेष
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.18]">
              शादी, तिलक, कथा व लॉन पार्टी हेतु <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300">टेंट व संपूर्ण सामान सेवा।</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl font-normal leading-relaxed">
              गांव-देहात व लॉन के सभी आयोजनों के लिए मजबूत वाटरप्रूफ शामियाना, वाटरप्रूफ पंडाल, 
              <strong> बैठने का सामान</strong> (गद्दे, रजाई, कुर्सियां, सोफा), 
              <strong> सजाने का सामान</strong> (स्टेज, गेट, झालर), एवं 
              <strong> हलवाई / खाना बनाने का सामान</strong> (देग, भट्टी, कड़ाही, थाली-गिलास) और जनरेटर की पूरी व्यवस्था।
            </p>

            {/* Quick Guarantees */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>समय पर गाँव डिलीवरी व फिटिंग</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>साफ-सुथरे गद्दे, रजाई व बर्तन</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-300 col-span-2 sm:col-span-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>वाजिब किराया दर (₹)</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={scrollToCatalog}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-2 cursor-pointer"
              >
                टेंट व शामियाना देखें
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={onOpenSamanList}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-xs transition-all flex items-center gap-2 cursor-pointer"
              >
                <Armchair className="w-4 h-4 text-amber-400" />
                बैठने व हलवाई सामान की सूची
              </button>
            </div>
          </div>

          {/* Right Featured Visual Card */}
          <div className="lg:col-span-5">
            <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-slate-900/90 shadow-2xl p-2.5">
              <div className="relative h-64 sm:h-72 rounded-2xl overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1000&q=80" 
                  alt="शाही देसी शामियाना व वाटरप्रूफ पंडाल"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent"></div>
                <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-semibold text-emerald-400 border border-emerald-500/30">
                  ★ लोकप्रिय विवाह व लॉन पंडाल
                </div>
                <div className="absolute bottom-4 left-4 right-4 text-left">
                  <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">देसी वाटरप्रूफ शामियाना</span>
                  <h3 className="text-base font-bold text-white leading-tight">शाही देसी शामियाना व वाटरप्रूफ पंडाल</h3>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800 text-xs text-slate-300">
                    <span>क्षमता: 200 से 400 मेहमान</span>
                    <span className="font-bold text-emerald-400 font-mono text-sm">₹12,000 / दिन</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Floating Quick Search Bar */}
        <div className="mt-8 bg-white rounded-2xl p-4 sm:p-5 text-slate-900 shadow-xl border border-slate-200">
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            
            {/* Search Query */}
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-emerald-600" />
                टेंट या सामान खोजें (Search Tents & Items)
              </label>
              <input
                type="text"
                value={searchKeywords}
                onChange={(e) => setSearchKeywords(e.target.value)}
                placeholder="जैसे: शामियाना, वाटरप्रूफ, गद्दा, देग, स्टेज, जनरेटर, कुर्सी..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            {/* Guest Capacity */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-emerald-600" />
                मेहमानों की संख्या (Guests)
              </label>
              <select
                value={guestCount}
                onChange={(e) => setGuestCount(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="0">सभी साइज के टेंट</option>
                <option value="50">50 - 100 मेहमान (छोटा कार्यक्रम / तिलक)</option>
                <option value="150">100 - 250 मेहमान (कथा / भोज / सगाई)</option>
                <option value="300">250 - 500 मेहमान (विवाह समारोह / बारात)</option>
                <option value="600">500+ मेहमान (बड़ी जनसभा / विशाल शादी)</option>
              </select>
            </div>

            {/* Search Submit Button */}
            <div className="sm:col-span-3">
              <button
                type="submit"
                className="w-full h-[38px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 text-xs cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
                उपलब्ध टेंट व शामियाना देखें (Search Catalog)
              </button>
            </div>

          </form>
        </div>

      </div>
    </section>
  );
};
