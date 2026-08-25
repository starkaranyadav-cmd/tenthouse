import React, { useState, useEffect, useMemo } from 'react';
import { Booking, CustomerAccount, TentAddon, SelectedAddon, Tent, PaymentPlanType } from '../../types';
import { 
  findBookingsByQuery, getCurrentCustomer, setCurrentCustomer, 
  loginCustomerWithPhoneAndPin, registerOrUpdateCustomer, logoutCustomer, 
  getCustomerBookings, updateBooking, getAddons, getTents,
  generateDefaultInstallments
} from '../../services/storageService';
import { generateBookingInvoicePDF } from '../../utils/pdfGenerator';
import { 
  Search, CalendarCheck, X, CheckCircle2, Clock, AlertTriangle, 
  Phone, Mail, MapPin, Printer, User, LogIn, UserPlus, LogOut, 
  Edit3, Trash2, Plus, Minus, FileText, Sparkles, Check, ChevronRight,
  ShieldCheck, HelpCircle, Package, ArrowRight, Layers, Banknote,
  CheckCheck, CalendarClock, CreditCard
} from 'lucide-react';

interface CustomerPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialBookingIdToOpen?: string;
}

export const CustomerPortalModal: React.FC<CustomerPortalModalProps> = ({
  isOpen,
  onClose,
  initialBookingIdToOpen
}) => {
  // Global data
  const [customer, setCustomer] = useState<CustomerAccount | null>(getCurrentCustomer());
  const [allAddons] = useState<TentAddon[]>(getAddons());
  const [allTents] = useState<Tent[]>(getTents());

  // Active Main Tab: 'my-bookings' | 'login' | 'register' | 'guest-track'
  const [activeTab, setActiveTab] = useState<'my-bookings' | 'login' | 'register' | 'guest-track'>(
    customer ? 'my-bookings' : 'login'
  );

  // Login form state
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPin, setLoginPin] = useState('1234');
  const [loginError, setLoginError] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPin, setRegPin] = useState('1234');
  const [regVillage, setRegVillage] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regError, setRegError] = useState('');

  // Guest search state
  const [guestQuery, setGuestQuery] = useState('');
  const [guestResults, setGuestResults] = useState<Booking[]>([]);
  const [hasSearchedGuest, setHasSearchedGuest] = useState(false);

  // Bookings list for current customer
  const [customerBookings, setCustomerBookings] = useState<Booking[]>([]);
  const [notification, setNotification] = useState('');

  // Booking currently being edited by customer
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);

  // Edit Booking Form State
  const [editStartDate, setEditStartDate] = useState('');
  const [editEndDate, setEditEndDate] = useState('');
  const [editGuestCount, setEditGuestCount] = useState(100);
  const [editEventType, setEditEventType] = useState('');
  const [editVillage, setEditVillage] = useState('');
  const [editLandmark, setEditLandmark] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editSurface, setEditSurface] = useState('');
  const [editInstructions, setEditInstructions] = useState('');
  const [editAddons, setEditAddons] = useState<SelectedAddon[]>([]);
  const [selectedAddonToAdd, setSelectedAddonToAdd] = useState<string>('');

  // Load customer bookings
  const refreshCustomerBookings = () => {
    const cur = getCurrentCustomer();
    setCustomer(cur);
    if (cur && cur.phone) {
      const bks = getCustomerBookings(cur.phone);
      setCustomerBookings(bks);
    } else {
      setCustomerBookings([]);
    }
  };

  useEffect(() => {
    if (isOpen) {
      refreshCustomerBookings();
      if (getCurrentCustomer()) {
        setActiveTab('my-bookings');
      } else {
        setActiveTab('login');
      }
    }
  }, [isOpen]);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 4000);
  };

  // --- AUTH HANDLERS ---
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const res = loginCustomerWithPhoneAndPin(loginPhone, loginPin);
    if (res.success && res.customer) {
      setCustomer(res.customer);
      setActiveTab('my-bookings');
      const bks = getCustomerBookings(res.customer.phone);
      setCustomerBookings(bks);
      showToast(`नमस्ते ${res.customer.name}! आपका स्वागत है।`);
    } else {
      setLoginError(res.error || 'लॉगिन विफल रहा। कृपया सही विवरण दें।');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    if (!regName.trim()) {
      setRegError('कृपया अपना नाम दर्ज करें');
      return;
    }
    if (!regPhone.trim() || regPhone.length < 10) {
      setRegError('कृपया सही 10 अंकों का मोबाइल नंबर दर्ज करें');
      return;
    }
    const acc = registerOrUpdateCustomer({
      name: regName,
      phone: regPhone,
      email: regEmail,
      pin: regPin || '1234',
      villageOrCity: regVillage,
      address: regAddress
    });
    setCustomer(acc);
    setActiveTab('my-bookings');
    const bks = getCustomerBookings(acc.phone);
    setCustomerBookings(bks);
    showToast('खाता सफलतापूर्वक बन गया!');
  };

  const handleLogout = () => {
    logoutCustomer();
    setCustomer(null);
    setCustomerBookings([]);
    setActiveTab('login');
    showToast('सफलतापूर्वक लॉगआउट हो गया');
  };

  const handleGuestSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestQuery.trim()) return;
    const res = findBookingsByQuery(guestQuery);
    setGuestResults(res);
    setHasSearchedGuest(true);
  };

  // --- EDIT BOOKING HANDLERS ---
  const handleStartEdit = (b: Booking) => {
    setEditingBooking(b);
    setEditStartDate(b.startDate);
    setEditEndDate(b.endDate);
    setEditGuestCount(b.guestCount || 100);
    setEditEventType(b.eventType || 'विवाह समारोह');
    setEditVillage(b.villageOrCity || '');
    setEditLandmark(b.landmark || '');
    setEditAddress(b.deliveryAddress || '');
    setEditSurface(b.surfaceType || 'कच्ची जमीन / खेत');
    setEditInstructions(b.specialInstructions || '');
    setEditAddons([...(b.addons || [])]);
  };

  // Calculate rental duration in days for editing
  const editRentalDays = useMemo(() => {
    if (!editStartDate || !editEndDate) return 1;
    const start = new Date(editStartDate).getTime();
    const end = new Date(editEndDate).getTime();
    const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  }, [editStartDate, editEndDate]);

  // Financial Calculations for editing
  const editCalculations = useMemo(() => {
    if (!editingBooking) return { baseRentTotal: 0, addonsTotal: 0, grandTotal: 0 };
    
    // Tent price per day
    const tent = allTents.find(t => t.id === editingBooking.tentId);
    const pricePerDay = tent ? tent.pricePerDay : (editingBooking.baseRentTotal / (editingBooking.totalDays || 1));
    const baseRentTotal = pricePerDay * editRentalDays;

    // Addons total
    let addonsTotal = 0;
    editAddons.forEach(item => {
      addonsTotal += item.pricePerDay * item.quantity * editRentalDays;
    });

    const transportSetupFee = editingBooking.transportSetupFee || 1500;
    const securityDeposit = editingBooking.securityDeposit || 2000;
    const grandTotal = baseRentTotal + addonsTotal + transportSetupFee + securityDeposit;

    return {
      baseRentTotal,
      addonsTotal,
      transportSetupFee,
      securityDeposit,
      grandTotal
    };
  }, [editingBooking, editRentalDays, editAddons, allTents]);

  const handleUpdateAddonQty = (addonId: string, delta: number) => {
    setEditAddons(prev => {
      return prev.map(item => {
        if (item.addonId === addonId) {
          const newQty = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      });
    });
  };

  const handleRemoveAddon = (addonId: string) => {
    setEditAddons(prev => prev.filter(item => item.addonId !== addonId));
  };

  const handleAddNewAddonToEdit = () => {
    if (!selectedAddonToAdd) return;
    const found = allAddons.find(a => a.id === selectedAddonToAdd);
    if (!found) return;

    if (editAddons.some(a => a.addonId === found.id)) {
      handleUpdateAddonQty(found.id, 1);
    } else {
      setEditAddons(prev => [
        ...prev,
        {
          addonId: found.id,
          name: found.name,
          hindiName: found.hindiName,
          category: found.category,
          pricePerDay: found.pricePerDay,
          unit: found.unit,
          quantity: 1
        }
      ]);
    }
    setSelectedAddonToAdd('');
  };

  const handleSaveEditedBooking = () => {
    if (!editingBooking) return;
    if (!editStartDate || !editEndDate) {
      alert('कृपया सही तारीख चुनें');
      return;
    }
    if (!editVillage.trim() || !editAddress.trim()) {
      alert('कृपया गांव व डिलीवरी का पता अवश्य दर्ज करें');
      return;
    }

    const currentPaid = editingBooking.paidAmount || 0;
    const plan = editingBooking.paymentPlan || '3_INSTALLMENTS';
    const newGrandTotal = editCalculations.grandTotal;

    // Recalculate installments preserving existing paid amount
    const installCalc = generateDefaultInstallments(
      newGrandTotal,
      plan,
      currentPaid,
      editingBooking.paymentMethod
    );

    const updated: Booking = {
      ...editingBooking,
      startDate: editStartDate,
      endDate: editEndDate,
      totalDays: editRentalDays,
      guestCount: editGuestCount,
      eventType: editEventType,
      villageOrCity: editVillage,
      landmark: editLandmark,
      deliveryAddress: editAddress,
      surfaceType: editSurface,
      specialInstructions: editInstructions,
      addons: editAddons,
      baseRentTotal: editCalculations.baseRentTotal,
      addonsTotal: editCalculations.addonsTotal,
      grandTotal: newGrandTotal,
      paymentPlan: plan,
      paidAmount: installCalc.paidAmount,
      balanceAmount: installCalc.balanceAmount,
      installments: installCalc.installments,
      paymentStatus: installCalc.paymentStatus
    };

    updateBooking(updated);
    setEditingBooking(null);
    refreshCustomerBookings();
    showToast(`बुकिंग #${updated.bookingNumber} सफलतापूर्वक अपडेट हो गई!`);
  };

  const handleCancelBooking = (bookingId: string) => {
    if (confirm('क्या आप सचमुच यह बुकिंग रद्द (Cancel) करना चाहते हैं?')) {
      const bks = getCustomerBookings(customer?.phone || '');
      const target = bks.find(b => b.id === bookingId);
      if (target) {
        target.status = 'Cancelled';
        updateBooking(target);
        refreshCustomerBookings();
        showToast('बुकिंग रद्द कर दी गई है');
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>स्वीकृत (Confirmed)</span>
          </span>
        );
      case 'Pending':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>पेंडिंग (व्यवस्थापक समीक्षा प्रतीक्षित)</span>
          </span>
        );
      case 'Completed':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-900 border border-blue-300">
            सम्पन्न (Completed)
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-900 border border-red-200">
            रद्द (Cancelled)
          </span>
        );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      
      {/* Main Card Container */}
      <div 
        className="relative bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-white flex items-center gap-2">
                <span>ग्राहक सेवा पोर्टल (Customer Portal & Bookings)</span>
              </h3>
              <p className="text-xs text-slate-400">
                {customer 
                  ? `लॉगिन: ${customer.name} (${customer.phone}) • बुकिंग देखें व बदलें` 
                  : 'खाता लॉगिन करें अथवा बुकिंग ट्रैक व एडिट करें'}
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

        {/* Toast Alert */}
        {notification && (
          <div className="bg-emerald-600 text-white text-xs font-bold py-2 px-6 flex items-center justify-between animate-in slide-in-from-top-2">
            <span>{notification}</span>
            <button onClick={() => setNotification('')} className="text-white/80 hover:text-white">✕</button>
          </div>
        )}

        {/* Tab Sub-Header if not editing */}
        {!editingBooking && (
          <div className="bg-slate-100/90 px-6 py-2 border-b border-slate-200 flex items-center justify-between gap-2 overflow-x-auto">
            <div className="flex items-center gap-1.5">
              {customer ? (
                <>
                  <button
                    onClick={() => setActiveTab('my-bookings')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'my-bookings'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    📋 मेरी बुकिंग्स ({customerBookings.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('guest-track')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'guest-track'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    🔍 अन्य बुकिंग खोजें
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setActiveTab('login')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'login'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    🔐 खाता लॉगिन (Login)
                  </button>
                  <button
                    onClick={() => setActiveTab('register')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'register'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    ✨ नया खाता बनाएं (Create Account)
                  </button>
                  <button
                    onClick={() => setActiveTab('guest-track')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'guest-track'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    🔍 बुकिंग नंबर से ट्रैक
                  </button>
                </>
              )}
            </div>

            {customer && (
              <button
                onClick={handleLogout}
                className="px-3 py-1 bg-white hover:bg-red-50 text-red-600 hover:text-red-700 border border-slate-200 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                title="लॉगआउट"
              >
                <LogOut className="w-3 h-3" />
                <span>साइन आउट</span>
              </button>
            )}
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">

          {/* VIEW 1: INTERACTIVE BOOKING EDITOR */}
          {editingBooking ? (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    <Edit3 className="w-4 h-4" />
                  </span>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm">
                      बुकिंग #{editingBooking.bookingNumber} में बदलाव (Edit Booking)
                    </h4>
                    <p className="text-xs text-slate-500">तारीख, स्थान, मेहमान व सामान सूची में मनचाहा बदलाव करें</p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingBooking(null)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  रद्द करें
                </button>
              </div>

              {/* Date & Event Schedule */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">शुरुआत तिथि *</label>
                  <input
                    type="date"
                    value={editStartDate}
                    onChange={(e) => setEditStartDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">समाप्ति तिथि *</label>
                  <input
                    type="date"
                    value={editEndDate}
                    onChange={(e) => setEditEndDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">कुल अवधि</label>
                  <div className="px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800">
                    {editRentalDays} दिन
                  </div>
                </div>
              </div>

              {/* Guest & Event Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">मेहमानों की संख्या (Guests)</label>
                  <input
                    type="number"
                    value={editGuestCount}
                    onChange={(e) => setEditGuestCount(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">आयोजन का प्रकार</label>
                  <input
                    type="text"
                    value={editEventType}
                    onChange={(e) => setEditEventType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-900"
                  />
                </div>
              </div>

              {/* Address / Venue */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <span className="text-xs font-extrabold text-slate-800 block">डिलीवरी व आयोजन स्थल</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">गांव, कस्बा या शहर *</label>
                    <input
                      type="text"
                      value={editVillage}
                      onChange={(e) => setEditVillage(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">प्रमुख लैंडमार्क</label>
                    <input
                      type="text"
                      value={editLandmark}
                      onChange={(e) => setEditLandmark(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">पूरा डिलीवरी पता *</label>
                  <input
                    type="text"
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">विशेष निर्देश (यदि कोई हो)</label>
                  <textarea
                    rows={2}
                    value={editInstructions}
                    onChange={(e) => setEditInstructions(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-900"
                  />
                </div>
              </div>

              {/* Addons / Equipment Modification */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-amber-600" />
                    <span>शामिल सामान व उपकरण (Addons & Equipment)</span>
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-800">
                    सामान किराया: ₹{editCalculations.addonsTotal.toLocaleString('en-IN')}
                  </span>
                </div>

                {/* Existing Items in this booking */}
                <div className="space-y-2">
                  {editAddons.length > 0 ? (
                    editAddons.map(item => (
                      <div key={item.addonId} className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200 text-xs">
                        <div className="flex-1 pr-2">
                          <strong className="text-slate-900 block text-xs">{item.hindiName || item.name}</strong>
                          <span className="text-[11px] text-slate-500 font-mono">
                            ₹{item.pricePerDay} / {item.unit} × {editRentalDays} दिन = ₹{(item.pricePerDay * item.quantity * editRentalDays).toLocaleString('en-IN')}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleUpdateAddonQty(item.addonId, -1)}
                            className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold cursor-pointer"
                          >
                            -
                          </button>
                          <span className="w-8 text-center font-bold font-mono text-xs">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => handleUpdateAddonQty(item.addonId, 1)}
                            className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold cursor-pointer"
                          >
                            +
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveAddon(item.addonId)}
                            className="p-1 text-slate-400 hover:text-red-600 ml-1 cursor-pointer"
                            title="सामान हटाएं"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 italic p-2">कोई अतिरिक्त सामान शामिल नहीं है।</p>
                  )}
                </div>

                {/* Add More Items Dropdown */}
                <div className="pt-2 border-t border-slate-200 flex gap-2">
                  <select
                    value={selectedAddonToAdd}
                    onChange={(e) => setSelectedAddonToAdd(e.target.value)}
                    className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none"
                  >
                    <option value="">➕ नया सामान चुनें (कूलर, पंखा, बर्तन, हीटर, सोफा...)</option>
                    {allAddons.map(a => (
                      <option key={a.id} value={a.id}>
                        {a.hindiName || a.name} - ₹{a.pricePerDay}/{a.unit}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleAddNewAddonToEdit}
                    disabled={!selectedAddonToAdd}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl cursor-pointer"
                  >
                    जोड़ें
                  </button>
                </div>
              </div>

              {/* Updated Financial Summary */}
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] text-emerald-800 block uppercase font-bold">संशोधित कुल राशि (New Grand Total)</span>
                  <span className="text-xl font-extrabold text-emerald-950 font-mono">
                    ₹{editCalculations.grandTotal.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[11px] text-emerald-700 block">
                    (टेंट: ₹{editCalculations.baseRentTotal} + सामान: ₹{editCalculations.addonsTotal} + सेटअप: ₹{editCalculations.transportSetupFee} + अग्रिम: ₹{editCalculations.securityDeposit})
                  </span>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setEditingBooking(null)}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                  >
                    रद्द करें
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveEditedBooking}
                    className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>बदलाव सेव करें (Save Changes)</span>
                  </button>
                </div>
              </div>

            </div>
          ) : null}

          {/* VIEW 2: LOGGED-IN CUSTOMER'S BOOKINGS LIST */}
          {!editingBooking && customer && activeTab === 'my-bookings' && (
            <div className="space-y-5">
              
              {/* Profile Card */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                    {customer.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm">{customer.name}</h4>
                    <p className="text-xs text-slate-500 font-mono">
                      📞 {customer.phone} {customer.email && `• ✉️ ${customer.email}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="bg-white px-3 py-1 rounded-lg border border-slate-200 text-slate-700 font-medium">
                    कुल बुकिंग्स: <strong className="font-mono text-emerald-800">{customerBookings.length}</strong>
                  </span>
                </div>
              </div>

              {/* Bookings List */}
              <div className="space-y-4">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
                  आपकी दर्ज बुकिंग्स ({customerBookings.length})
                </span>

                {customerBookings.length > 0 ? (
                  customerBookings.map(b => (
                    <div key={b.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3.5 hover:border-emerald-300 transition-all">
                      
                      {/* Booking Top Info & Status */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-extrabold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                            #{b.bookingNumber}
                          </span>
                          <span className="text-xs text-slate-400">•</span>
                          <h4 className="font-bold text-slate-900 text-sm">{b.tentHindiName || b.tentName}</h4>
                        </div>
                        <div>
                          {getStatusBadge(b.status)}
                        </div>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase">तारीख व अवधि</span>
                          <strong className="text-slate-800 font-mono">{b.startDate} से {b.endDate}</strong>
                          <span className="text-slate-500 block text-[11px]">({b.totalDays} दिन)</span>
                        </div>

                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase">आयोजन व मेहमान</span>
                          <span className="font-medium text-slate-800 block truncate">{b.eventType}</span>
                          <span className="text-slate-500 block text-[11px]">{b.guestCount} मेहमान</span>
                        </div>

                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase">गांव / स्थान</span>
                          <strong className="text-slate-800 block truncate">{b.villageOrCity}</strong>
                          <span className="text-slate-500 block text-[11px] truncate">{b.deliveryAddress}</span>
                        </div>

                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase">कुल बिल (Total Bill)</span>
                          <strong className="text-emerald-800 font-mono text-sm block">₹{b.grandTotal.toLocaleString('en-IN')}</strong>
                          <span className="text-slate-500 block text-[11px]">{b.paymentStatus}</span>
                        </div>
                      </div>

                      {/* Village Multi-Stage Installment Ledger */}
                      {b.installments && b.installments.length > 0 ? (
                        <div className="p-3.5 bg-emerald-950/5 rounded-2xl border border-emerald-200/80 space-y-2.5">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-2 border-b border-emerald-200/60">
                            <div className="flex items-center gap-1.5">
                              <Banknote className="w-4 h-4 text-emerald-700 shrink-0" />
                              <strong className="text-xs font-extrabold text-slate-900">
                                गांव की भुगतान किश्त प्रणाली ({b.paymentPlan === '3_INSTALLMENTS' ? '3 किस्तों में' : (b.paymentPlan === '2_INSTALLMENTS' ? '2 किस्तों में' : '1 बार में')})
                              </strong>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-emerald-800 font-bold">
                                जमा: ₹{(b.paidAmount || 0).toLocaleString('en-IN')}
                              </span>
                              <span className="text-slate-300">•</span>
                              <span className="text-amber-700 font-bold">
                                बाकी: ₹{(b.balanceAmount !== undefined ? b.balanceAmount : Math.max(0, b.grandTotal - (b.paidAmount || 0))).toLocaleString('en-IN')}
                              </span>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                            <div 
                              className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(100, Math.round(((b.paidAmount || 0) / (b.grandTotal || 1)) * 100))}%` }}
                            />
                          </div>

                          {/* Stage by stage cards */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                            {b.installments.map((inst, idx) => (
                              <div 
                                key={inst.id || idx} 
                                className={`p-2 rounded-xl border text-xs ${
                                  inst.status === 'Paid' 
                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-950' 
                                    : (inst.status === 'Partially Paid' 
                                      ? 'bg-amber-50 border-amber-200 text-amber-950' 
                                      : 'bg-white border-slate-200 text-slate-800')
                                }`}
                              >
                                <div className="flex items-center justify-between text-[11px] font-bold">
                                  <span>{inst.titleHindi}</span>
                                  <span className={`px-1.5 py-0.2 rounded text-[9px] ${
                                    inst.status === 'Paid' ? 'bg-emerald-200 text-emerald-900' :
                                    inst.status === 'Partially Paid' ? 'bg-amber-200 text-amber-900' :
                                    'bg-slate-100 text-slate-600'
                                  }`}>
                                    {inst.status === 'Paid' ? 'जमा (Paid)' : (inst.status === 'Partially Paid' ? 'आंशिक जमा' : 'बाकी (Due)')}
                                  </span>
                                </div>
                                <div className="mt-1 flex items-baseline justify-between">
                                  <span className="text-[10px] text-slate-500">तय रकम: ₹{inst.scheduledAmount.toLocaleString('en-IN')}</span>
                                  <span className="text-xs font-bold font-mono text-emerald-800">
                                    जमा: ₹{(inst.paidAmount || 0).toLocaleString('en-IN')}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}

                      {/* Included Addons Chips */}
                      {b.addons && b.addons.length > 0 && (
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                          <strong className="text-slate-700 block text-[11px] mb-1.5">शामिल अतिरिक्त सामान ({b.addons.length}):</strong>
                          <div className="flex flex-wrap gap-1.5">
                            {b.addons.map((add, i) => (
                              <span key={i} className="bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded text-[11px] font-medium">
                                {add.hindiName || add.name} ({add.quantity} {add.unit})
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Crew info if confirmed */}
                      {b.assignedCrew && (
                        <div className="bg-emerald-50 text-emerald-800 p-2.5 rounded-xl text-xs border border-emerald-200 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span><strong>असाइन की गई टेंट कारीगर टीम:</strong> {b.assignedCrew}</span>
                        </div>
                      )}

                      {/* Actions Toolbar */}
                      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => generateBookingInvoicePDF(b)}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5 text-slate-600" />
                            <span>PDF रसीद डाउनलोड</span>
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          {b.status !== 'Cancelled' && b.status !== 'Completed' && (
                            <>
                              <button
                                onClick={() => handleStartEdit(b)}
                                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>बुकिंग एडिट / बदलें</span>
                              </button>

                              <button
                                onClick={() => handleCancelBooking(b.id)}
                                className="px-2.5 py-1.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 text-xs font-bold cursor-pointer"
                                title="बुकिंग रद्द करें"
                              >
                                रद्द करें
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                    </div>
                  ))
                ) : (
                  <div className="p-8 bg-slate-50 rounded-2xl text-center border border-dashed border-slate-300 space-y-2">
                    <Package className="w-8 h-8 text-slate-400 mx-auto" />
                    <p className="text-xs font-bold text-slate-800">आपके खाते में अभी कोई बुकिंग दर्ज नहीं है।</p>
                    <p className="text-[11px] text-slate-500">
                      कैटलॉग से टेंट व सामान चुनें और बुक करें।
                    </p>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* VIEW 3: LOGIN FORM */}
          {!editingBooking && activeTab === 'login' && !customer && (
            <div className="max-w-md mx-auto space-y-5 py-4">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                  <LogIn className="w-6 h-6" />
                </div>
                <h4 className="font-extrabold text-slate-900 text-base">ग्राहक खाता लॉगिन (Customer Login)</h4>
                <p className="text-xs text-slate-500">अपने मोबाइल नंबर और पिन से अपनी सभी बुकिंग्स देखें व बदलें</p>
              </div>

              {loginError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    मोबाइल नंबर (10 अंक) *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      placeholder="उदा: 9876543210 या 8418067579"
                      value={loginPhone}
                      onChange={(e) => setLoginPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    सुरक्षा पिन / पासवर्ड (4-अंकीय PIN) *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="डिफ़ॉल्ट पिन: 1234"
                    value={loginPin}
                    onChange={(e) => setLoginPin(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold font-mono text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    💡 यदि पहली बार लॉगिन कर रहे हैं और पिन नहीं बदला है, तो डिफ़ॉल्ट पिन <code className="bg-slate-100 px-1 py-0.5 rounded font-bold text-slate-700">1234</code> का उपयोग करें।
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  लॉगिन करें (Login)
                </button>
              </form>

              <div className="text-center pt-2 border-t border-slate-200">
                <p className="text-xs text-slate-600">
                  क्या आपका खाता नहीं है?{' '}
                  <button
                    onClick={() => setActiveTab('register')}
                    className="text-emerald-600 font-bold hover:underline cursor-pointer"
                  >
                    यहाँ नया खाता बनाएं
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* VIEW 4: REGISTER FORM */}
          {!editingBooking && activeTab === 'register' && !customer && (
            <div className="max-w-md mx-auto space-y-5 py-2">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                  <UserPlus className="w-6 h-6" />
                </div>
                <h4 className="font-extrabold text-slate-900 text-base">नया ग्राहक खाता बनाएं (Create Account)</h4>
                <p className="text-xs text-slate-500">बुकिंग सुरक्षित करने व कभी भी एडिट करने हेतु त्वरित खाता बनाएं</p>
              </div>

              {regError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                  <span>{regError}</span>
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">पूरा नाम *</label>
                  <input
                    type="text"
                    required
                    placeholder="जैसे: रमेश यादव / अमित सिंह"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">मोबाइल नंबर *</label>
                    <input
                      type="tel"
                      required
                      placeholder="10 अंकों का नंबर"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">4-अंकीय पिन (PIN) *</label>
                    <input
                      type="password"
                      required
                      placeholder="उदा: 1234"
                      value={regPin}
                      onChange={(e) => setRegPin(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold font-mono text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">ईमेल (वैकल्पिक)</label>
                  <input
                    type="email"
                    placeholder="email@example.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">गांव या शहर</label>
                    <input
                      type="text"
                      placeholder="उदा: रसूलपुर"
                      value={regVillage}
                      onChange={(e) => setRegVillage(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">डिलीवरी पता</label>
                    <input
                      type="text"
                      placeholder="मकान/प्लॉट/स्थान"
                      value={regAddress}
                      onChange={(e) => setRegAddress(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer mt-2"
                >
                  खाता बनाएं व जारी रखें (Register)
                </button>
              </form>

              <div className="text-center pt-2 border-t border-slate-200">
                <p className="text-xs text-slate-600">
                  पहले से खाता है?{' '}
                  <button
                    onClick={() => setActiveTab('login')}
                    className="text-emerald-600 font-bold hover:underline cursor-pointer"
                  >
                    लॉगिन करें
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* VIEW 5: GUEST TRACKING */}
          {!editingBooking && activeTab === 'guest-track' && (
            <div className="space-y-5">
              <form onSubmit={handleGuestSearch} className="space-y-3">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  बुकिंग नंबर, मोबाइल नंबर या नाम दर्ज करें
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="जैसे: TH-94821 या 8418067579 या करन..."
                      value={guestQuery}
                      onChange={(e) => setGuestQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    खोजें
                  </button>
                </div>
              </form>

              {hasSearchedGuest && (
                <div className="space-y-4 pt-2 border-t border-slate-200">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    खोज परिणाम ({guestResults.length})
                  </span>

                  {guestResults.length > 0 ? (
                    guestResults.map(b => (
                      <div key={b.id} className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                          <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                            {b.bookingNumber}
                          </span>
                          {getStatusBadge(b.status)}
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <span className="text-slate-400 block text-[10px]">टेंट</span>
                            <strong className="text-slate-900">{b.tentHindiName || b.tentName}</strong>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">तारीख</span>
                            <strong className="text-slate-900 font-mono">{b.startDate} से {b.endDate}</strong>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
                          <span className="font-bold text-emerald-800 font-mono text-sm">
                            ₹{b.grandTotal.toLocaleString('en-IN')}
                          </span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => generateBookingInvoicePDF(b)}
                              className="px-3 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-bold cursor-pointer"
                            >
                              PDF रसीद
                            </button>
                            <button
                              onClick={() => handleStartEdit(b)}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                            >
                              एडिट करें
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 italic p-4 text-center">कोई बुकिंग नहीं मिली।</p>
                  )}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center shrink-0 text-xs">
          <span className="text-slate-500">
            सहायता हेतु कॉल करें: <strong className="text-slate-900">+91 8418067579</strong>
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl cursor-pointer"
          >
            बंद करें (Close)
          </button>
        </div>

      </div>
    </div>
  );
};
