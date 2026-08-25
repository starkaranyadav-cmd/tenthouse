import React, { useState, useEffect } from 'react';
import { 
  Tent, TentAddon, Booking, AdminUser, FilterState 
} from './types';
import { 
  getTents, getAddons, getBookings, 
  getAdminUser, logoutAdmin, subscribeToStorage 
} from './services/storageService';

// Navigation & Structure
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Public Components
import { HeroBanner } from './components/public/HeroBanner';
import { TentCatalog } from './components/public/TentCatalog';
import { TentDetailModal } from './components/public/TentDetailModal';
import { BookingWizardModal } from './components/public/BookingWizardModal';
import { BookingLookupModal } from './components/public/BookingLookupModal';
import { CustomerPortalModal } from './components/public/CustomerPortalModal';
import { VillageSamanListModal } from './components/public/VillageSamanListModal';
import { HowItWorks } from './components/public/HowItWorks';

// Admin Components
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { TentManager } from './components/admin/TentManager';
import { BookingManager } from './components/admin/BookingManager';
import { InventoryAddonsManager } from './components/admin/InventoryAddonsManager';
import { SuperAdminSettings } from './components/admin/SuperAdminSettings';
import { DjangoCodeViewer } from './components/admin/DjangoCodeViewer';

export default function App() {
  // Core Data States
  const [tents, setTents] = useState<Tent[]>(getTents());
  const [addons, setAddons] = useState<TentAddon[]>(getAddons());
  const [bookings, setBookings] = useState<Booking[]>(getBookings());
  const [adminUser, setAdminUser] = useState<AdminUser | null>(getAdminUser());

  // View Navigation
  const [currentView, setCurrentView] = useState<'public' | 'admin'>('public');
  const [adminTab, setAdminTab] = useState<'dashboard' | 'tents' | 'bookings' | 'addons' | 'settings' | 'django'>('dashboard');

  // Public Interactive Modals
  const [selectedTentForDetail, setSelectedTentForDetail] = useState<Tent | null>(null);
  const [selectedTentForBooking, setSelectedTentForBooking] = useState<Tent | null>(null);
  const [isSamanListModalOpen, setIsSamanListModalOpen] = useState(false);
  const [isBookingLookupOpen, setIsBookingLookupOpen] = useState(false);
  const [isCustomerPortalOpen, setIsCustomerPortalOpen] = useState(false);
  const [portalBookingIdToOpen, setPortalBookingIdToOpen] = useState<string | undefined>(undefined);

  // Admin Modals
  const [isAdminAddTentOpen, setIsAdminAddTentOpen] = useState(false);
  const [isAdminAddAddonOpen, setIsAdminAddAddonOpen] = useState(false);

  // Filters for Catalog
  const [filters, setFilters] = useState<FilterState>({
    category: 'All Styles',
    minCapacity: 0,
    maxPrice: 50000,
    searchQuery: '',
    sortBy: 'recommended',
    surfaceType: ''
  });

  // Subscribe to storage updates (multi-tab and local state sync)
  useEffect(() => {
    const unsubscribe = subscribeToStorage(() => {
      setTents(getTents());
      setAddons(getAddons());
      setBookings(getBookings());
      setAdminUser(getAdminUser());
    });
    return () => unsubscribe();
  }, []);

  // Handlers for Public Actions
  const handleHeroSearch = (query: string, minGuests: number) => {
    setFilters(prev => ({
      ...prev,
      searchQuery: query,
      minCapacity: minGuests > 0 ? minGuests : prev.minCapacity
    }));
    // Smooth scroll down to catalog
    const catalogElement = document.getElementById('tent-catalog');
    if (catalogElement) {
      catalogElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleBookNow = (tent: Tent) => {
    setSelectedTentForDetail(null);
    setSelectedTentForBooking(tent);
  };

  const handleAdminLogout = () => {
    logoutAdmin();
    setAdminUser(null);
    setCurrentView('public');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-emerald-600 selection:text-white">
      
      {/* Universal Top Navigation */}
      <Navbar
        currentView={currentView}
        onSwitchView={setCurrentView}
        adminUser={adminUser}
        onAdminLogout={handleAdminLogout}
        onOpenSamanList={() => setIsSamanListModalOpen(true)}
        onOpenBookingLookup={() => {
          setPortalBookingIdToOpen(undefined);
          setIsCustomerPortalOpen(true);
        }}
        onOpenCustomerPortal={() => {
          setPortalBookingIdToOpen(undefined);
          setIsCustomerPortalOpen(true);
        }}
        onSelectCategory={(cat) => setFilters(prev => ({ ...prev, category: cat }))}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        
        {/* PUBLIC STOREFRONT VIEW */}
        {currentView === 'public' && (
          <div className="space-y-0">
            
            {/* Hero Banner with Integrated Search & Filter */}
            <HeroBanner
              onSearch={handleHeroSearch}
              onOpenSamanList={() => setIsSamanListModalOpen(true)}
            />

            {/* Main Tent Catalog Grid */}
            <TentCatalog
              tents={tents}
              filters={filters}
              onFilterChange={setFilters}
              onSelectTentForDetail={setSelectedTentForDetail}
              onSelectTentForBooking={handleBookNow}
              onOpenSamanList={() => setIsSamanListModalOpen(true)}
            />

            {/* How Turnkey Setup Works Section */}
            <HowItWorks
              onStartBooking={() => {
                const catalogElement = document.getElementById('tent-catalog');
                if (catalogElement) {
                  catalogElement.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            />

          </div>
        )}

        {/* ADMIN MANAGEMENT VIEW */}
        {currentView === 'admin' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            
            {!adminUser ? (
              // Login form if not authenticated
              <AdminLogin
                onLoginSuccess={(user) => {
                  setAdminUser(user);
                  setAdminTab('dashboard');
                }}
                onBackToStore={() => setCurrentView('public')}
              />
            ) : (
              // Authenticated Admin Dashboard & Panels
              <div className="space-y-6">
                
                {/* Admin Sub-Navigation Tabs */}
                <div className="bg-white p-1.5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                  {[
                    { id: 'dashboard', label: '📊 डैशबोर्ड (Dashboard)' },
                    { id: 'tents', label: `⛺ टेंट व शामियाना (${tents.length})` },
                    { id: 'addons', label: `🪑 सामान सूची व मूल्य (${addons.length})` },
                    { id: 'bookings', label: `📋 बुकिंग्स (${bookings.length})` },
                    { id: 'settings', label: `⚙️ सुपर एडमिन सेटिंग्स ${adminUser.role === 'Super Admin' ? '🛡️' : ''}` },
                    { id: 'django', label: '🐍 Django Backend Source' },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setAdminTab(tab.id as any)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                        adminTab === tab.id
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab Views */}
                {adminTab === 'dashboard' && (
                  <AdminDashboard
                    adminUser={adminUser}
                    tents={tents}
                    addons={addons}
                    bookings={bookings}
                    onNavigateTab={setAdminTab}
                    onOpenAddTentModal={() => {
                      setAdminTab('tents');
                      setIsAdminAddTentOpen(true);
                    }}
                    onOpenAddAddonModal={() => {
                      setAdminTab('addons');
                      setIsAdminAddAddonOpen(true);
                    }}
                  />
                )}

                {adminTab === 'tents' && (
                  <TentManager
                    tents={tents}
                    isOpenAddModal={isAdminAddTentOpen}
                    onCloseAddModal={() => setIsAdminAddTentOpen(false)}
                  />
                )}

                {adminTab === 'addons' && (
                  <InventoryAddonsManager
                    addons={addons}
                    isOpenAddModal={isAdminAddAddonOpen}
                    onCloseAddModal={() => setIsAdminAddAddonOpen(false)}
                  />
                )}

                {adminTab === 'bookings' && (
                  <BookingManager
                    bookings={bookings}
                  />
                )}

                {adminTab === 'settings' && (
                  <SuperAdminSettings
                    adminUser={adminUser}
                    tents={tents}
                    addons={addons}
                    bookings={bookings}
                    onBackToDashboard={() => setAdminTab('dashboard')}
                  />
                )}

                {adminTab === 'django' && (
                  <DjangoCodeViewer />
                )}

              </div>
            )}

          </div>
        )}

      </main>

      {/* Global Modals */}

      {/* 1. Tent Details Modal */}
      {selectedTentForDetail && (
        <TentDetailModal
          tent={selectedTentForDetail}
          onClose={() => setSelectedTentForDetail(null)}
          onBookNow={handleBookNow}
        />
      )}

      {/* 2. Multi-step Booking Wizard Modal */}
      {selectedTentForBooking && (
        <BookingWizardModal
          tent={selectedTentForBooking}
          addons={addons}
          isOpen={!!selectedTentForBooking}
          onClose={() => setSelectedTentForBooking(null)}
          onOpenCustomerPortal={() => {
            setSelectedTentForBooking(null);
            setPortalBookingIdToOpen(undefined);
            setIsCustomerPortalOpen(true);
          }}
          onBookingCreated={(newBooking) => {
            // Storage triggers update
          }}
        />
      )}

      {/* 3. Village Seating, Decor & Cooking Saman List Modal */}
      <VillageSamanListModal
        addons={addons}
        isOpen={isSamanListModalOpen}
        onClose={() => setIsSamanListModalOpen(false)}
        onSelectTentForBooking={() => {
          const firstTent = tents[0];
          if (firstTent) {
            handleBookNow(firstTent);
          }
        }}
      />

      {/* 4. Complete Customer Account & Booking Management Portal Modal */}
      <CustomerPortalModal
        isOpen={isCustomerPortalOpen}
        onClose={() => {
          setIsCustomerPortalOpen(false);
          setPortalBookingIdToOpen(undefined);
        }}
        initialBookingIdToOpen={portalBookingIdToOpen}
      />

      {/* 5. Legacy/Quick Booking Lookup Modal */}
      <BookingLookupModal
        isOpen={isBookingLookupOpen}
        onClose={() => setIsBookingLookupOpen(false)}
      />

      {/* Universal Footer */}
      <Footer
        onOpenSamanList={() => setIsSamanListModalOpen(true)}
        onOpenBookingLookup={() => {
          setPortalBookingIdToOpen(undefined);
          setIsCustomerPortalOpen(true);
        }}
        onSwitchToAdmin={() => setCurrentView('admin')}
      />

    </div>
  );
}
