import React from 'react';
import { Tent, ShieldCheck, Truck, Clock, Sparkles, Phone, Mail, Lock, Armchair, Utensils } from 'lucide-react';

interface FooterProps {
  onOpenBookingLookup?: () => void;
  onOpenSamanList?: () => void;
  onSelectCategory?: (category: string) => void;
  onSwitchToAdmin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenBookingLookup,
  onOpenSamanList,
  onSelectCategory,
  onSwitchToAdmin,
}) => {
  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800">
      {/* Value Badges Banner */}
      <div className="border-b border-slate-800/80 bg-slate-900/50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-xs">वाटरप्रूफ व मजबूत शामियाना</h4>
              <p className="text-[11px] text-slate-400">तेज आंधी, धूप व बारिश से सुरक्षित तिरपाल व बांस-बल्ली</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-xs">गाँव व दरवाजे तक डिलीवरी</h4>
              <p className="text-[11px] text-slate-400">समय से पूर्व टेंट कारीगरों द्वारा पूरी फिटिंग व व्यवस्था</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <Armchair className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-xs">बैठने व सजाने का संपूर्ण सामान</h4>
              <p className="text-[11px] text-slate-400">साफ गद्दे, रजाई, कुर्सियां, दूल्हा सोफा, गेट व झालर लाइट</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-xs">हलवाई व खाना बनाने का सामान</h4>
              <p className="text-[11px] text-slate-400">बड़ी देग, भट्टी, कड़ाही, थाली-गिलास व जनरेटर व्यवस्था</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400">
                <Tent className="w-4 h-4" />
              </div>
              <span className="text-base font-bold text-white tracking-tight">
                देसी टेंट<span className="text-emerald-400"> हाउस</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              शादी-विवाह, तिलक, कथा, भोज व लॉन पार्टी के लिए वाटरप्रूफ शामियाना, हलवाई बर्तन, बैठने व सजाने के सामान की सम्पूर्ण सेवा।
            </p>
            <div className="pt-1 text-xs text-slate-300 space-y-1.5 font-medium">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <a href="tel:8418067579" className="hover:text-emerald-400 transition-colors">
                  +91 8418067579
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <a href="mailto:starkaranyadav@gmail.com" className="hover:text-emerald-400 transition-colors truncate">
                  starkaranyadav@gmail.com
                </a>
              </div>
            </div>
          </div>

          {/* Popular Categories */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 tracking-wider uppercase mb-3">टेंट व शामियाना प्रकार</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              {[
                'Desi Shamyana Pandal',
                'Bhojan & Pangat Shamyana',
                'Waterproof German Pandal',
                'Vivah & Mandap Pandal',
                'Stage & Gate Setup'
              ].map(cat => (
                <li key={cat}>
                  <button 
                    onClick={() => onSelectCategory && onSelectCategory(cat)}
                    className="hover:text-emerald-400 transition-colors cursor-pointer"
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Saman Categories & Services */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-slate-200 tracking-wider uppercase">आयोजन सामान सूची</h4>
              {onOpenSamanList && (
                <button 
                  onClick={onOpenSamanList}
                  className="text-[11px] text-emerald-400 hover:underline cursor-pointer"
                >
                  सूची देखें
                </button>
              )}
            </div>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li className="flex items-center justify-between">
                <span>बैठने का सामान (गद्दे, रजाई, कुर्सी)</span>
                <span className="text-[10px] font-mono text-emerald-400">उपलब्ध</span>
              </li>
              <li className="flex items-center justify-between">
                <span>सजावट (स्टेज, मंडप, स्वागत गेट)</span>
                <span className="text-[10px] font-mono text-emerald-400">उपलब्ध</span>
              </li>
              <li className="flex items-center justify-between">
                <span>हलवाई बर्तन (देग, भट्टी, कड़ाही)</span>
                <span className="text-[10px] font-mono text-emerald-400">उपलब्ध</span>
              </li>
              <li className="flex items-center justify-between">
                <span>बिजली व जनरेटर (10kVA, 15kVA)</span>
                <span className="text-[10px] font-mono text-emerald-400">उपलब्ध</span>
              </li>
              <li className="flex items-center justify-between">
                <span>साउंड व झालर लाइट</span>
                <span className="text-[10px] font-mono text-emerald-400">उपलब्ध</span>
              </li>
            </ul>
          </div>

          {/* Quick Operations & Admin Access */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-200 tracking-wider uppercase">बुकिंग व प्रबंधन</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              अपनी बुकिंग की स्थिति देखें अथवा टेंट मालिक / प्रबंधक पोर्टल में लॉगिन करें।
            </p>
            <div className="flex flex-col gap-2 pt-1">
              {onOpenBookingLookup && (
                <button
                  onClick={onOpenBookingLookup}
                  className="text-left text-xs font-medium text-slate-300 hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  → पुरानी बुकिंग खोजें (Lookup Booking)
                </button>
              )}
              {onSwitchToAdmin && (
                <button
                  onClick={onSwitchToAdmin}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400 hover:text-emerald-300 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg transition-colors cursor-pointer w-fit"
                >
                  <Lock className="w-3 h-3 text-emerald-400" />
                  टेंट हाउस एडमिन पैनल (Admin Portal)
                </button>
              )}
            </div>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="mt-10 pt-5 border-t border-slate-800/80 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} देसी टेंट हाउस एवं शामियाना सेवा। सर्वाधिकार सुरक्षित।</p>
          <div className="flex gap-4">
            <span className="hover:text-slate-400 cursor-pointer">मोबाइल: +91 8418067579</span>
            <span className="hover:text-slate-400 cursor-pointer">starkaranyadav@gmail.com</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
