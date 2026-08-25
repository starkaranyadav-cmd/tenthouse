import React from 'react';
import { Sparkles, CalendarCheck, ShieldCheck, ArrowRight, Truck, Armchair, Utensils, Zap } from 'lucide-react';

interface HowItWorksProps {
  onStartBooking: () => void;
}

export const HowItWorks: React.FC<HowItWorksProps> = ({ onStartBooking }) => {
  const steps = [
    {
      number: '01',
      title: 'टेंट व पंडाल चुनें',
      desc: 'अपने कार्यक्रम के अनुसार देसी शामियाना, वाटरप्रूफ जर्मन पंडाल, या भोजन शामियाना का साइज व प्रकार चुनें।',
      icon: Sparkles
    },
    {
      number: '02',
      title: 'बैठने, सजाने व हलवाई सामान जोड़ें',
      desc: 'गद्दे, रजाई, तकिया, प्लास्टिक कुर्सी, दूल्हा-दुल्हन सोफा, हलवाई भट्टी, बड़ी देग, कड़ाही, थाली-गिलास व जनरेटर चुनें।',
      icon: Armchair
    },
    {
      number: '03',
      title: 'तारीख व गाँव का पता दर्ज करें',
      desc: 'कार्यक्रम की तारीख, गाँव का नाम/पता और संपर्क मोबाइल नंबर भरकर तुरंत बुकिंग सुनिश्चित करें।',
      icon: CalendarCheck
    },
    {
      number: '04',
      title: 'डिलीवरी, फिटिंग व व्यवस्था',
      desc: 'हमारी टेंट टीम समय से पहले गाँव या लॉन में आकर पूरा टेंट, लाइट व सामान व्यवस्थित फिट करके देगी।',
      icon: Truck
    }
  ];

  return (
    <section id="how-it-works" className="bg-slate-100/70 border-y border-slate-200 py-14 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 uppercase tracking-wider bg-emerald-100/70 px-3 py-1 rounded-full border border-emerald-300/60 mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            सरल व भरोसेमंद बुकिंग प्रक्रिया
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            टेंट व सामान बुकिंग कैसे करें?
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2">
            गाँव के किसी भी मांगलिक कार्यक्रम के लिए टेंट, रोशनी, कुर्सी, बर्तन व जनरेटर की संपूर्ण सुविधा।
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div key={idx} className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-black text-emerald-600/25 font-mono">{step.number}</span>
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-700">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{step.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{step.desc}</p>
                </div>

                <div className="pt-2 border-t border-slate-100 text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                  <span>✓ 100% भरोसेमंद सेवा</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <button
            onClick={onStartBooking}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all inline-flex items-center gap-2 cursor-pointer"
          >
            अभी बुकिंग शुरू करें
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </section>
  );
};
