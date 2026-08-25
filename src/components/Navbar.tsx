import React, { useState, useEffect } from 'react';
import { Tent as TentIcon, Search, UserCheck, Menu, X, CalendarCheck, LogOut, Phone, Armchair, Sparkles, User, KeyRound } from 'lucide-react';
import { AdminUser, TentCategory, CustomerAccount } from '../types';
import { getCurrentCustomer, logoutCustomer } from '../services/storageService';

interface NavbarProps {
  currentView: 'public' | 'admin';
  onSwitchView: (view: 'public' | 'admin') => void;
  adminUser: AdminUser | null;
  onAdminLogout: () => void;
  onOpenBookingLookup: () => void;
  onOpenCustomerPortal?: () => void;
  onOpenSamanList: () => void;
  onSelectCategory?: (category: TentCategory | 'All') => void;
  onNavigateToCatalog?: () => void;
  onNavigateToHowItWorks?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onSwitchView,
  adminUser,
  onAdminLogout,
  onOpenBookingLookup,
  onOpenCustomerPortal,
  onOpenSamanList,
  onSelectCategory,
  onNavigateToCatalog,
  onNavigateToHowItWorks,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [customer, setCustomer] = useState<CustomerAccount | null>(getCurrentCustomer());

  useEffect(() => {
    setCustomer(getCurrentCustomer());
  }, [currentView]);

  const scrollToCatalog = () => {
    if (currentView !== 'public') {
      onSwitchView('public');
    }
    setTimeout(() => {
      const el = document.getElementById('tent-catalog');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  const scrollToHowItWorks = () => {
    if (currentView !== 'public') {
      onSwitchView('public');
    }
    setTimeout(() => {
      const el = document.getElementById('how-it-works');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  const handlePortalClick = () => {
    if (onOpenCustomerPortal) {
      onOpenCustomerPortal();
    } else {
      onOpenBookingLookup();
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs">
      {/* Top Utility & Trust Bar */}
      <div className="bg-slate-950 text-slate-200 text-xs py-1.5 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-emerald-400 font-semibold tracking-wide">
              <Sparkles className="w-3.5 h-3.5" />
              देसी शामियाना, वाटरप्रूफ पंडाल, बैठने, सजाने व हलवाई सामान सेवा
            </span>
            <span className="hidden md:inline text-slate-600">|</span>
            <span className="hidden md:inline text-slate-300 text-[11px]">
              गांव, देहात व लॉन पार्टी के सभी आयोजनों के लिए
            </span>
          </div>
          <div className="flex items-center gap-4 text-slate-300 text-xs font-medium">
            <a 
              href="tel:8418067579"
              className="hover:text-emerald-400 flex items-center gap-1.5 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>+91 8418067579</span>
            </a>
            
            {customer ? (
              <button 
                onClick={handlePortalClick}
                className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 transition-colors cursor-pointer bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-700/50"
              >
                <User className="w-3.5 h-3.5" />
                <span>👤 {customer.name} (मेरी बुकिंग्स)</span>
              </button>
            ) : (
              <button 
                onClick={handlePortalClick}
                className="hover:text-emerald-400 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <CalendarCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>ग्राहक खाता / बुकिंग्स</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                onSwitchView('public');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-2.5 text-left group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400 shadow-xs group-hover:border-emerald-500/50 transition-all">
                <TentIcon className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <span className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900 block leading-tight">
                  देसी टेंट<span className="text-emerald-600"> हाउस</span>
                </span>
                <span className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase block">
                  टेंट, शामियाना व संपूर्ण आयोजन सामान
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={scrollToCatalog}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                currentView === 'public' 
                  ? 'text-emerald-700 bg-emerald-50/80 font-bold' 
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              टेंट व शामियाना कैटलॉग
            </button>
            <button
              onClick={onOpenSamanList}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Armchair className="w-3.5 h-3.5 text-amber-600" />
              सामान सूची (बैठने, सजाने, हलवाई)
            </button>
            <button
              onClick={scrollToHowItWorks}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              बुकिंग प्रक्रिया
            </button>
            <button
              onClick={handlePortalClick}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <CalendarCheck className="w-3.5 h-3.5 text-emerald-600" />
              {customer ? 'मेरी बुकिंग्स व खाता' : 'बुकिंग स्थिति / खाता'}
            </button>
          </nav>

          {/* Action CTAs & Admin Switcher */}
          <div className="hidden md:flex items-center gap-2.5">
            {adminUser && (
              <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>{adminUser.name}</span>
                <button
                  onClick={onAdminLogout}
                  className="text-slate-400 hover:text-red-600 transition-colors ml-1 p-0.5"
                  title="Logout Admin"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <button
              onClick={() => onSwitchView(currentView === 'admin' ? 'public' : 'admin')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
                currentView === 'admin'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
              {currentView === 'admin' ? 'ग्राहक दृश्य (Customer View)' : 'प्रबंधक पोर्टल (Admin Portal)'}
            </button>

            {currentView === 'public' && (
              <button
                onClick={scrollToCatalog}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs hover:shadow transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Search className="w-3.5 h-3.5" />
                टेंट देखें
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => onSwitchView(currentView === 'admin' ? 'public' : 'admin')}
              className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 text-slate-800 border border-slate-200"
            >
              {currentView === 'admin' ? 'कस्टमर' : 'एडमिन'}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-200"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2 shadow-lg">
          <button
            onClick={() => {
              scrollToCatalog();
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2.5 text-xs font-semibold text-slate-800 hover:bg-emerald-50 rounded-lg"
          >
            टेंट व शामियाना कैटलॉग
          </button>
          <button
            onClick={() => {
              onOpenSamanList();
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2.5 text-xs font-semibold text-slate-800 hover:bg-emerald-50 rounded-lg flex items-center gap-2"
          >
            <Armchair className="w-4 h-4 text-amber-600" />
            सामान सूची (बैठने, सजाने, हलवाई)
          </button>
          <button
            onClick={() => {
              handlePortalClick();
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2.5 text-xs font-semibold text-slate-800 hover:bg-emerald-50 rounded-lg flex items-center gap-2"
          >
            <CalendarCheck className="w-4 h-4 text-emerald-600" />
            {customer ? `👤 ${customer.name} (मेरी बुकिंग्स व खाता)` : 'ग्राहक खाता / बुकिंग स्थिति देखें व बदलें'}
          </button>
          <button
            onClick={() => {
              scrollToHowItWorks();
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2.5 text-xs font-semibold text-slate-800 hover:bg-emerald-50 rounded-lg"
          >
            बुकिंग प्रक्रिया
          </button>
          <div className="pt-2 border-t border-slate-200">
            <button
              onClick={() => {
                onSwitchView(currentView === 'admin' ? 'public' : 'admin');
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 text-center text-xs font-bold text-white bg-slate-900 rounded-lg"
            >
              {currentView === 'admin' ? 'ग्राहक दृश्य पर जाएं' : 'एडमिन प्रबंधक पोर्टल खोलें'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
