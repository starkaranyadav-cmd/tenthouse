import React, { useState, useMemo, useEffect } from 'react';
import { Tent, TentAddon, SelectedAddon, Booking, AddonCategory, PaymentPlanType, PaymentInstallment } from '../../types';
import { 
  X, Calendar, MapPin, Sparkles, Check, ChevronRight, ChevronLeft, 
  Clock, ShieldCheck, Plus, Minus, FileText, CheckCircle2, 
  Printer, ArrowRight, AlertCircle, Phone, Mail, User, Info,
  Armchair, Utensils, Zap, Volume2, Box, Sun, Snowflake, CloudRain,
  KeyRound, Edit3, Banknote, CalendarCheck, CheckCheck
} from 'lucide-react';
import { createBooking, getCurrentCustomer, registerOrUpdateCustomer, generateDefaultInstallments } from '../../services/storageService';
import { generateBookingInvoicePDF } from '../../utils/pdfGenerator';

interface BookingWizardModalProps {
  tent: Tent | null;
  addons: TentAddon[];
  isOpen: boolean;
  onClose: () => void;
  onBookingCreated: (booking: Booking) => void;
  onOpenCustomerPortal?: () => void;
}

export const BookingWizardModal: React.FC<BookingWizardModalProps> = ({
  tent,
  addons,
  isOpen,
  onClose,
  onBookingCreated,
  onOpenCustomerPortal
}) => {
  if (!isOpen || !tent) return null;

  const currentCust = getCurrentCustomer();

  // Wizard Step (1: Schedule & Guests, 2: Village / Lawn Venue Address, 3: Baithne/Sajane/Halwai Addons, 4: Review & Payment, 5: Confirmation)
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Form State
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(tomorrow);
  const [guestCount, setGuestCount] = useState(tent.detailedSpecs.capacitySeated.toString());
  const [eventType, setEventType] = useState('विवाह समारोह (Marriage / Reception)');

  // Village & Venue Ground Address
  const [villageOrCity, setVillageOrCity] = useState(currentCust?.defaultVillageOrCity || '');
  const [landmark, setLandmark] = useState('');
  const [district, setDistrict] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState(currentCust?.defaultAddress || '');
  const [surfaceType, setSurfaceType] = useState(tent.supportedSurfaces[0] || 'कच्ची जमीन / खेत');
  const [specialInstructions, setSpecialInstructions] = useState('');

  // Addons Filter & Selection
  const [selectedAddons, setSelectedAddons] = useState<Record<string, number>>({});
  const [activeAddonTab, setActiveAddonTab] = useState<string>('All');

  // Customer Contact & Account
  const [customerName, setCustomerName] = useState(currentCust?.name || '');
  const [customerPhone, setCustomerPhone] = useState(currentCust?.phone || '');
  const [customerEmail, setCustomerEmail] = useState(currentCust?.email || '');
  const [customerPin, setCustomerPin] = useState(currentCust?.pin || '1234');
  const [paymentMethod, setPaymentMethod] = useState<'Cash on Setup (टेंट लगने पर नकद)' | 'UPI / PhonePe / GPay' | 'Bank Transfer'>('UPI / PhonePe / GPay');

  // Village 2-3 Time Installment Payment Plan
  const [paymentPlan, setPaymentPlan] = useState<PaymentPlanType>('3_INSTALLMENTS');
  const [advancePaidAmount, setAdvancePaidAmount] = useState<number>(2000); // Default advance token (साई / बयाना)

  // Confirmation state
  const [completedBooking, setCompletedBooking] = useState<Booking | null>(null);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    const cust = getCurrentCustomer();
    if (cust) {
      if (!customerName) setCustomerName(cust.name);
      if (!customerPhone) setCustomerPhone(cust.phone);
      if (!customerEmail && cust.email) setCustomerEmail(cust.email);
      if (!villageOrCity && cust.defaultVillageOrCity) setVillageOrCity(cust.defaultVillageOrCity);
      if (!deliveryAddress && cust.defaultAddress) setDeliveryAddress(cust.defaultAddress);
      if (cust.pin) setCustomerPin(cust.pin);
    }
  }, [isOpen]);

  // Calculate rental duration in days
  const rentalDays = useMemo(() => {
    if (!startDate || !endDate) return 1;
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  }, [startDate, endDate]);

  // Financial Calculations
  const calculations = useMemo(() => {
    // Base Rent with possible multi-day discount
    let dailyRate = tent.pricePerDay;
    if (rentalDays >= 3 && tent.weeklyDiscountPercentage > 0) {
      dailyRate = Math.round(dailyRate * (1 - tent.weeklyDiscountPercentage / 100));
    }
    const baseRentTotal = dailyRate * rentalDays;

    // Addons calculation
    let addonsTotal = 0;
    const addonList: SelectedAddon[] = [];

    Object.entries(selectedAddons).forEach(([addonId, rawQty]) => {
      const qty = Number(rawQty) || 0;
      if (qty > 0) {
        const item = addons.find(a => a.id === addonId);
        if (item) {
          const itemCost = item.pricePerDay * qty * rentalDays;
          addonsTotal += itemCost;
          addonList.push({
            addonId: item.id,
            name: item.name,
            hindiName: item.hindiName,
            category: item.category,
            pricePerDay: item.pricePerDay,
            quantity: qty,
            unit: item.unit
          });
        }
      }
    });

    const transportSetupFee = 1500; // Flat village delivery & staging fee
    const securityDeposit = tent.depositAmount || 2000;
    const grandTotal = baseRentTotal + addonsTotal + transportSetupFee + securityDeposit;

    return {
      dailyRate,
      baseRentTotal,
      addonsTotal,
      addonList,
      transportSetupFee,
      securityDeposit,
      grandTotal
    };
  }, [tent, rentalDays, selectedAddons, addons]);

  const toggleAddon = (addonId: string, delta: number) => {
    setSelectedAddons(prev => {
      const current = prev[addonId] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [addonId]: next };
    });
  };

  const handleNextStep = () => {
    setValidationError('');

    if (step === 1) {
      if (!startDate || !endDate) {
        setValidationError('कृपया कार्यक्रम की शुरुआत और समाप्ति तिथि चुनें।');
        return;
      }
      if (new Date(endDate) < new Date(startDate)) {
        setValidationError('समाप्ति तिथि शुरुआत तिथि के बाद होनी चाहिए।');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!villageOrCity.trim()) {
        setValidationError('कृपया गांव, कस्बा या शहर का नाम अवश्य दर्ज करें।');
        return;
      }
      if (!deliveryAddress.trim()) {
        setValidationError('कृपया पूरा पता / स्थान का विवरण दर्ज करें।');
        return;
      }
      setStep(3);
    } else if (step === 3) {
      setStep(4);
    }
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (!customerName.trim()) {
      setValidationError('कृपया अपना पूरा नाम दर्ज करें।');
      return;
    }
    if (!customerPhone.trim() || customerPhone.length < 10) {
      setValidationError('कृपया सही 10 अंकों का मोबाइल नंबर दर्ज करें।');
      return;
    }

    // 1. Automatically register or update customer account so they can track and edit their booking anytime
    registerOrUpdateCustomer({
      name: customerName,
      phone: customerPhone,
      email: customerEmail || '',
      pin: customerPin || '1234',
      villageOrCity: villageOrCity,
      address: deliveryAddress
    });

    // 2. Generate village multi-stage installments calculation
    const installCalc = generateDefaultInstallments(
      calculations.grandTotal,
      paymentPlan,
      advancePaidAmount,
      paymentMethod
    );

    // 3. Create booking record with DEFAULT status 'Pending'
    const newBooking = createBooking({
      customerName,
      customerEmail: customerEmail || '',
      customerPhone,
      tentId: tent.id,
      tentName: tent.name,
      tentHindiName: tent.hindiName,
      tentImage: tent.images[0] || '',
      tentCategory: tent.category,
      startDate,
      endDate,
      totalDays: rentalDays,
      guestCount: parseInt(guestCount) || tent.detailedSpecs.capacitySeated,
      eventType,
      villageOrCity,
      landmark,
      district,
      deliveryAddress,
      surfaceType,
      addons: calculations.addonList,
      specialInstructions,
      baseRentTotal: calculations.baseRentTotal,
      addonsTotal: calculations.addonsTotal,
      transportSetupFee: calculations.transportSetupFee,
      securityDeposit: calculations.securityDeposit,
      grandTotal: calculations.grandTotal,
      paymentPlan: paymentPlan,
      paidAmount: installCalc.paidAmount,
      balanceAmount: installCalc.balanceAmount,
      installments: installCalc.installments,
      status: 'Pending', // All new bookings are in Pending status by default for verification
      paymentStatus: installCalc.paymentStatus,
      paymentMethod
    });

    setCompletedBooking(newBooking);
    onBookingCreated(newBooking);
    setStep(5);
  };

  const filteredAddons = addons.filter(item => {
    if (activeAddonTab === 'All') return true;
    return item.category === activeAddonTab;
  });

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'Garmiyon Ka Saman': return <Sun className="w-3.5 h-3.5 text-amber-500" />;
      case 'Sardiyon Ka Saman': return <Snowflake className="w-3.5 h-3.5 text-sky-500" />;
      case 'Barsat Ka Saman': return <CloudRain className="w-3.5 h-3.5 text-blue-500" />;
      case 'Saf-Safai Ka Saman': return <Sparkles className="w-3.5 h-3.5 text-teal-600" />;
      case 'Baithne Ka Saman': return <Armchair className="w-3.5 h-3.5 text-amber-600" />;
      case 'Sajane Ka Saman': return <Sparkles className="w-3.5 h-3.5 text-pink-600" />;
      case 'Khana Bnane Ka Saman': return <Utensils className="w-3.5 h-3.5 text-emerald-600" />;
      case 'Lighting & Sound': return <Volume2 className="w-3.5 h-3.5 text-blue-600" />;
      case 'Bijli & Generator': return <Zap className="w-3.5 h-3.5 text-yellow-600" />;
      default: return <Box className="w-3.5 h-3.5 text-slate-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      
      {/* Modal Card */}
      <div 
        className="relative bg-white rounded-3xl max-w-3xl w-full max-h-[94vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white text-xs font-bold font-mono">
              {step < 5 ? `0${step}` : '✓'}
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white leading-tight">
                {step === 5 ? 'बुकिंग सफल हुई!' : `टेंट व सामान बुकिंग: ${tent.hindiName || tent.name}`}
              </h3>
              <p className="text-xs text-emerald-400 font-medium">
                {step === 1 && 'चरण 1: तारीख व मेहमानों की संख्या'}
                {step === 2 && 'चरण 2: गांव / स्थल का पता व जमीन प्रकार'}
                {step === 3 && 'चरण 3: बैठने, सजाने व हलवाई बर्तन का सामान'}
                {step === 4 && 'चरण 4: मोबाइल नंबर व कुल बिल समीक्षा'}
                {step === 5 && `बुकिंग संदर्भ: ${completedBooking?.bookingNumber}`}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Wizard Steps Bar (if not on confirmation) */}
        {step < 5 && (
          <div className="bg-slate-100 px-6 py-2.5 border-b border-slate-200 flex justify-between items-center text-[11px] font-semibold text-slate-500 overflow-x-auto gap-2">
            <span className={step >= 1 ? 'text-emerald-800 font-bold whitespace-nowrap' : 'whitespace-nowrap'}>1. तारीख</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className={step >= 2 ? 'text-emerald-800 font-bold whitespace-nowrap' : 'whitespace-nowrap'}>2. गांव का पता</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className={step >= 3 ? 'text-emerald-800 font-bold whitespace-nowrap' : 'whitespace-nowrap'}>3. सामान सूची</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className={step >= 4 ? 'text-emerald-800 font-bold whitespace-nowrap' : 'whitespace-nowrap'}>4. बिल व पुष्टि</span>
          </div>
        )}

        {/* Error Alert */}
        {validationError && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Wizard Content Body */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1 text-slate-800">
          
          {/* STEP 1: SCHEDULE & GUESTS */}
          {step === 1 && (
            <div className="space-y-5">
              
              {/* Selected Tent Summary Pill */}
              <div className="flex items-center gap-3 p-3 bg-emerald-50/60 rounded-2xl border border-emerald-200/80">
                <img 
                  src={tent.images[0]} 
                  alt={tent.name} 
                  className="w-14 h-14 rounded-xl object-cover border border-emerald-200 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                    {tent.hindiName || tent.name}
                  </h4>
                  <p className="text-xs text-slate-600">
                    दर: <span className="font-bold text-slate-900 font-mono">₹{tent.pricePerDay.toLocaleString('en-IN')}/दिन</span> • {tent.detailedSpecs.dimensionsFoot} ({tent.detailedSpecs.capacityStanding} लोगों हेतु)
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                    टेंट लगाने की तारीख (Start Date) *
                  </label>
                  <input
                    type="date"
                    min={today}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">कारीगर टीम सुबह समय पर पहुंचकर टेंट खड़ा करेगी</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                    कार्यक्रम समाप्ति व टेंट खोलने की तारीख *
                  </label>
                  <input
                    type="date"
                    min={startDate || today}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">कार्यक्रम के अगले दिन सुबह टेंट खोला जाएगा</span>
                </div>
              </div>

              {/* Calculated duration banner */}
              <div className="p-3 bg-slate-100 rounded-xl text-xs flex justify-between items-center text-slate-700">
                <span className="font-medium">कुल किराया अवधि (Total Duration):</span>
                <span className="font-bold text-slate-900 font-mono">
                  {rentalDays} दिन ({startDate} से {endDate})
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    अनुमानित मेहमानों की संख्या (Expected Guests)
                  </label>
                  <input
                    type="number"
                    min="20"
                    max={tent.detailedSpecs.capacityStanding + 200}
                    value={guestCount}
                    onChange={(e) => setGuestCount(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    सुझाव: {tent.detailedSpecs.capacitySeated} कुर्सियों पर / {tent.detailedSpecs.capacityStanding} कुल पंगत
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    कार्यक्रम का प्रकार (Event Type)
                  </label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="विवाह समारोह (Marriage / Reception)">विवाह समारोह (Marriage / Reception)</option>
                    <option value="तिलक व सगाई (Tilak / Engagement)">तिलक व सगाई (Tilak / Ring Ceremony)</option>
                    <option value="कथा, भागवत व सत्संग (Katha / Satsang)">कथा, भागवत व सत्संग (Religious Event)</option>
                    <option value="जन्मदिन व मुंडन संस्कार (Birthday / Mundan)">जन्मदिन व मुंडन संस्कार (Family Function)</option>
                    <option value="ग्राम पंचायत व जनसभा (Village Meeting / Sabha)">ग्राम पंचायत व जनसभा (Public Gathering)</option>
                    <option value="भोज व पंगत (Community Feast / Pangat)">भोज व पंगत (Community Feast / Pangat)</option>
                  </select>
                </div>
              </div>

            </div>
          )}

          {/* STEP 2: VILLAGE VENUE & GROUND */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    गांव / कस्बा / शहर का नाम *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="जैसे: रामपुर, गोपालगंज, या कॉलोनी नाम"
                    value={villageOrCity}
                    onChange={(e) => setVillageOrCity(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    लैंडमार्क / पहचान का स्थान (Landmark)
                  </label>
                  <input
                    type="text"
                    placeholder="जैसे: शिव मंदिर के सामने, प्राथमिक विद्यालय के पास"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  पूरा पता (Delivery Address & Location Details) *
                </label>
                <textarea
                  rows={2}
                  placeholder="मकान/दरवाजा नंबर, टोला/मोहल्ला, पोस्ट, जिला..."
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  जमीन का प्रकार (Ground Surface)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['कच्ची जमीन / खेत', 'पक्का आंगन / फर्श', 'घास का लॉन', 'छत / टेरेस'].map(surf => (
                    <button
                      key={surf}
                      type="button"
                      onClick={() => setSurfaceType(surf)}
                      className={`p-2 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer ${
                        surfaceType === surf
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {surf}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-slate-500 mt-1.5">
                  {surfaceType === 'कच्ची जमीन / खेत' && '• मजबूत लोहे की खूंटी व बांस बल्ली से सुरक्षित कसा जाएगा।'}
                  {surfaceType === 'पक्का आंगन / फर्श' && '• बिना फर्श तोड़े वजनदार सीमेंट बेस व रस्सियों से बांधा जाएगा।'}
                  {surfaceType === 'घास का लॉन' && '• लॉन फ्रेंडली एंकर और खूबसूरत कारपेट बिछाया जाएगा।'}
                  {surfaceType === 'छत / टेरेस' && '• छत की रेलिंग व पिलर सपोर्ट के साथ टाइट बांधा जाएगा।'}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  टेंट गाड़ी पहुंचने का रास्ता या विशेष निर्देश (Optional)
                </label>
                <input
                  type="text"
                  placeholder="जैसे: पिकअप गाड़ी दरवाजे तक आ सकती है, बिजली का खंभा 20 मीटर दूर है"
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

            </div>
          )}

          {/* STEP 3: VILLAGE INVENTORY ADDONS */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    बैठने, सजाने व हलवाई बर्तन का सामान जोड़ें
                  </h4>
                  <p className="text-xs text-slate-500">गद्दे, कुर्सियां, स्टेज, लाइट, जनरेटर, देग व भट्टी</p>
                </div>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 font-mono self-start sm:self-auto">
                  +₹{calculations.addonsTotal.toLocaleString('en-IN')} सामान जोड़ा गया
                </span>
              </div>

              {/* Addon Categories Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {[
                  { id: 'All', label: 'सभी सामान' },
                  { id: 'Garmiyon Ka Saman', label: '☀️ गर्मी (कूलर/पंखा/ड्रम)' },
                  { id: 'Sardiyon Ka Saman', label: '❄️ सर्दी (हीटर/रजाई)' },
                  { id: 'Barsat Ka Saman', label: '🌧️ बरसात (तिरपाल/तख्त)' },
                  { id: 'Saf-Safai Ka Saman', label: '🧹 सफाई (वॉशबेसिन/डस्टबिन)' },
                  { id: 'Baithne Ka Saman', label: '🪑 बैठने का सामान' },
                  { id: 'Sajane Ka Saman', label: '🌸 सजावट व स्टेज' },
                  { id: 'Khana Bnane Ka Saman', label: '🍳 हलवाई / बर्तन' },
                  { id: 'Lighting & Sound', label: '💡 लाइटिंग व साउंड' },
                  { id: 'Bijli & Generator', label: '⚡ जनरेटर' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveAddonTab(tab.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      activeAddonTab === tab.id
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Addons List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
                {filteredAddons.map(addon => {
                  const qty = selectedAddons[addon.id] || 0;
                  return (
                    <div 
                      key={addon.id}
                      className={`p-3 rounded-xl border transition-all flex flex-col justify-between ${
                        qty > 0 ? 'bg-emerald-50/60 border-emerald-400 shadow-2xs' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            {getCategoryIcon(addon.category)}
                            <span className="text-xs font-bold text-slate-900 leading-snug">
                              {addon.hindiName || addon.name}
                            </span>
                          </div>
                          <span className="text-xs font-extrabold text-emerald-800 shrink-0 font-mono">
                            ₹{addon.pricePerDay}/{addon.unit}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{addon.description}</p>
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-200/80">
                        <span className="text-[10px] font-semibold text-slate-500 uppercase">{addon.category}</span>
                        
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => toggleAddon(addon.id, -1)}
                            disabled={qty === 0}
                            className="w-6 h-6 rounded-md bg-slate-200 hover:bg-slate-300 disabled:opacity-30 flex items-center justify-center text-slate-800 text-xs font-bold cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold font-mono w-4 text-center">{qty}</span>
                          <button
                            type="button"
                            onClick={() => toggleAddon(addon.id, 1)}
                            className="w-6 h-6 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center text-xs font-bold cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: CONTACT & ITEM REVIEW */}
          {step === 4 && (
            <form onSubmit={handleFinalSubmit} className="space-y-6">
              
              {/* Customer Contact Details & Account Setup */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-emerald-600" />
                    ग्राहक संपर्क व खाता सुरक्षा (Account & Contact)
                  </h4>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                    🔐 खाता स्वतः तैयार होगा
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">पूरा नाम (Full Name) *</label>
                    <input
                      type="text"
                      required
                      placeholder="जैसे: राजेश कुमार / सरपंच साहब"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">मोबाइल नंबर (WhatsApp / Call) *</label>
                    <input
                      type="tel"
                      required
                      placeholder="जैसे: 9876543210"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">ईमेल पता (वैकल्पिक)</label>
                    <input
                      type="email"
                      placeholder="email@example.com"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1 flex items-center justify-between">
                      <span>सुरक्षा पिन (4-अंकीय PIN) *</span>
                      <span className="text-[10px] text-slate-400 font-normal">बुकिंग देखने/बदलने हेतु</span>
                    </label>
                    <div className="relative">
                      <KeyRound className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        placeholder="उदा: 1234"
                        value={customerPin}
                        onChange={(e) => setCustomerPin(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold font-mono text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 bg-white p-2 rounded-xl border border-slate-100 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>इस मोबाइल नंबर और 4-अंकीय पिन से आप बाद में कभी भी अपनी बुकिंग <strong>देख सकते हैं</strong> और आवश्यकतानुसार <strong>सामान व तारीख एडिट कर सकते हैं</strong>।</span>
                </p>
              </div>

              {/* Village 2-3 Time Installment Payment Plan Selector */}
              <div className="bg-emerald-950/5 border border-emerald-300/80 rounded-2xl p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                    <Banknote className="w-4 h-4 text-emerald-700" />
                    <span>भुगतान का तरीका (गांव में 2 या 3 बार में भुगतान की सुविधा)</span>
                  </label>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full">
                    गांव की सुविधा
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentPlan('3_INSTALLMENTS')}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      paymentPlan === '3_INSTALLMENTS'
                        ? 'bg-slate-900 text-white border-slate-900 ring-2 ring-emerald-500 shadow-xs'
                        : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">3 किस्तों में (सबसे लोकप्रिय)</span>
                      {paymentPlan === '3_INSTALLMENTS' && <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />}
                    </div>
                    <p className={`text-[10px] mt-1 ${paymentPlan === '3_INSTALLMENTS' ? 'text-slate-300' : 'text-slate-500'}`}>
                      1. साई (बयाना) + 2. टेंट लगने पर + 3. सामान उतरने/विदाई बाद
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentPlan('2_INSTALLMENTS')}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      paymentPlan === '2_INSTALLMENTS'
                        ? 'bg-slate-900 text-white border-slate-900 ring-2 ring-emerald-500 shadow-xs'
                        : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">2 किस्तों में भुगतान</span>
                      {paymentPlan === '2_INSTALLMENTS' && <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />}
                    </div>
                    <p className={`text-[10px] mt-1 ${paymentPlan === '2_INSTALLMENTS' ? 'text-slate-300' : 'text-slate-500'}`}>
                      1. साई/बयाना + 2. टेंट लगने व कार्यक्रम के दिन
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentPlan('FULL_PAYMENT')}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      paymentPlan === 'FULL_PAYMENT'
                        ? 'bg-slate-900 text-white border-slate-900 ring-2 ring-emerald-500 shadow-xs'
                        : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">1 बार में पूरा भुगतान</span>
                      {paymentPlan === 'FULL_PAYMENT' && <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />}
                    </div>
                    <p className={`text-[10px] mt-1 ${paymentPlan === 'FULL_PAYMENT' ? 'text-slate-300' : 'text-slate-500'}`}>
                      100% पूरा बिल एक साथ
                    </p>
                  </button>
                </div>

                {/* Advance Token Amount Selector */}
                {paymentPlan !== 'FULL_PAYMENT' && (
                  <div className="bg-white rounded-xl p-3 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-slate-700">
                        बुकिंग कन्फर्म करने हेतु अभी साई / बयाना (Advance Token):
                      </label>
                      <span className="text-xs font-mono font-extrabold text-emerald-700">
                        ₹{advancePaidAmount.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      {[1000, 2000, 5000, Math.round((calculations.grandTotal * 0.25) / 100) * 100].map((amt, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setAdvancePaidAmount(amt)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                            advancePaidAmount === amt
                              ? 'bg-emerald-700 text-white border-emerald-700'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {idx === 3 ? `25% (₹${amt.toLocaleString('en-IN')})` : `₹${amt.toLocaleString('en-IN')}`}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setAdvancePaidAmount(0)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                          advancePaidAmount === 0
                            ? 'bg-amber-600 text-white border-amber-600'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        टेंट लगने पर देंगे (₹0 अभी)
                      </button>
                    </div>
                  </div>
                )}

                {/* Live Installment Breakdown Preview Box */}
                {(() => {
                  const preview = generateDefaultInstallments(calculations.grandTotal, paymentPlan, advancePaidAmount, paymentMethod);
                  return (
                    <div className="bg-slate-900 text-white rounded-xl p-3 space-y-2 text-xs">
                      <div className="flex items-center justify-between font-bold text-emerald-400 pb-1.5 border-b border-slate-800">
                        <span className="flex items-center gap-1.5">
                          <CalendarCheck className="w-3.5 h-3.5" />
                          किश्तों का हिसाब (Village Payment Schedule)
                        </span>
                        <span className="text-[11px] text-slate-300">कुल बिल: ₹{calculations.grandTotal.toLocaleString('en-IN')}</span>
                      </div>

                      <div className="space-y-1.5">
                        {preview.installments.map((inst, idx) => (
                          <div key={inst.id || idx} className="flex justify-between items-center text-[11px]">
                            <div className="flex items-center gap-1.5">
                              <span className="w-4 h-4 rounded-full bg-slate-800 text-emerald-400 text-[10px] font-mono flex items-center justify-center font-bold">
                                {idx + 1}
                              </span>
                              <span className="text-slate-200 font-medium">{inst.titleHindi}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-white">₹{inst.scheduledAmount.toLocaleString('en-IN')}</span>
                              {inst.paidAmount > 0 ? (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                  अभी जमा: ₹{inst.paidAmount.toLocaleString('en-IN')}
                                </span>
                              ) : (
                                <span className="text-[9px] text-slate-400 font-normal">
                                  (उस समय देय)
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="pt-1.5 border-t border-slate-800 flex justify-between items-center text-[11px]">
                        <span className="text-slate-400">अभी तत्काल भुगतान (साई/टोकन): <strong className="text-emerald-400 font-mono">₹{preview.paidAmount.toLocaleString('en-IN')}</strong></span>
                        <span className="text-slate-400">शेष बाकी रकम: <strong className="text-amber-400 font-mono">₹{preview.balanceAmount.toLocaleString('en-IN')}</strong></span>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">भुगतान का माध्यम (Payment Method)</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'UPI / PhonePe / GPay', label: 'UPI (PhonePe / GPay / Paytm)' },
                    { id: 'Cash on Setup (टेंट लगने पर नकद)', label: 'नकद (Cash)' },
                    { id: 'Bank Transfer', label: 'बैंक खाता ट्रांसफर' }
                  ].map(pm => (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => setPaymentMethod(pm.id as any)}
                      className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                        paymentMethod === pm.id
                          ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {pm.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Itemized Transparent Invoice Breakdown */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between font-bold text-slate-900 pb-2 border-b border-slate-200">
                  <span className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-emerald-600" />
                    अनुमानित बिल पर्ची (Itemized Estimate)
                  </span>
                  <span>{rentalDays} दिन का किराया</span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>{tent.hindiName || tent.name} ({rentalDays} दिन × ₹{tent.pricePerDay}):</span>
                  <span className="font-mono font-medium">₹{calculations.baseRentTotal.toLocaleString('en-IN')}</span>
                </div>

                {calculations.addonList.map(item => (
                  <div key={item.addonId} className="flex justify-between text-slate-600">
                    <span>• {item.hindiName || item.name} ({item.quantity} {item.unit}):</span>
                    <span className="font-mono font-medium">
                      ₹{(item.pricePerDay * item.quantity * rentalDays).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}

                <div className="flex justify-between text-slate-600">
                  <span>गाँव तक लोडिंग, अनलोडिंग व कारीगर खर्च:</span>
                  <span className="font-mono font-medium">₹{calculations.transportSetupFee.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>सुरक्षा अग्रिम (Refundable Security):</span>
                  <span className="font-mono font-medium">₹{calculations.securityDeposit.toLocaleString('en-IN')}</span>
                </div>

                <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-xs font-extrabold text-slate-900">
                  <span>कुल अनुमानित बिल (Grand Total):</span>
                  <span className="text-base text-emerald-800 font-mono">₹{calculations.grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

            </form>
          )}

          {/* STEP 5: CONFIRMATION RECEIPT SCREEN */}
          {step === 5 && completedBooking && (
            <div className="space-y-6 text-center py-2 animate-in zoom-in-95 duration-200">
              
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-2xs">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-900 text-emerald-400 font-mono">
                    बुकिंग #{completedBooking.bookingNumber}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>स्थिति: पेंडिंग (सत्यापन प्रतीक्षित)</span>
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">टेंट व सामान की बुकिंग दर्ज कर ली गई है!</h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto">
                  हम जल्द ही आपके मोबाइल नंबर <strong>{completedBooking.customerPhone}</strong> पर संपर्क करके समय और सामान की पुष्टि करेंगे।
                </p>
              </div>

              {/* Customer Account Created Banner */}
              <div className="bg-emerald-50 rounded-2xl p-3.5 border border-emerald-200 text-left text-xs flex items-start gap-2.5 max-w-lg mx-auto">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <strong className="text-emerald-950 font-bold block text-xs">आपका ग्राहक खाता सुरक्षित बन चुका है!</strong>
                  <p className="text-[11px] text-emerald-800">
                    लॉगिन मोबाइल: <strong>{completedBooking.customerPhone}</strong> • सुरक्षा पिन: <strong className="font-mono">{customerPin}</strong>
                  </p>
                  <p className="text-[11px] text-emerald-700">
                    आप पोर्टल में लॉगिन करके कभी भी अपनी बुकिंग की स्थिति देख सकते हैं, सामान या तारीख बदल (Edit) सकते हैं।
                  </p>
                </div>
              </div>

              {/* Printable Invoice Summary Card */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-left text-xs space-y-3 shadow-2xs">
                <div className="flex justify-between items-start border-b border-slate-200 pb-3">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">बुक किया गया टेंट</span>
                    <strong className="text-slate-900 text-xs sm:text-sm">{completedBooking.tentHindiName || completedBooking.tentName}</strong>
                    <p className="text-slate-500 text-[11px]">{completedBooking.surfaceType}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">तारीख व समय</span>
                    <strong className="text-slate-900 text-xs font-mono">{completedBooking.startDate} से {completedBooking.endDate}</strong>
                    <p className="text-slate-500 text-[11px]">{completedBooking.totalDays} दिन</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400 block">ग्राहक का नाम:</span>
                    <span className="font-semibold text-slate-800">{completedBooking.customerName} ({completedBooking.customerPhone})</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">डिलीवरी गांव / स्थान:</span>
                    <span className="font-semibold text-slate-800 truncate block">{completedBooking.villageOrCity} ({completedBooking.deliveryAddress})</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex justify-between items-center font-bold">
                  <span className="text-slate-700">कुल बिल ({completedBooking.paymentMethod}):</span>
                  <span className="text-sm font-extrabold text-emerald-800 font-mono">₹{completedBooking.grandTotal.toLocaleString('en-IN')}</span>
                </div>

                {completedBooking.installments && completedBooking.installments.length > 0 && (
                  <div className="pt-2 border-t border-slate-200 space-y-1 text-[11px]">
                    <span className="font-bold text-slate-700 block">किश्तों का विवरण (Installment Khata):</span>
                    {completedBooking.installments.map((inst, idx) => (
                      <div key={idx} className="flex justify-between items-center text-slate-600">
                        <span>{inst.titleHindi}:</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-semibold">₹{inst.scheduledAmount.toLocaleString('en-IN')}</span>
                          <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                            inst.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
                            inst.status === 'Partially Paid' ? 'bg-amber-100 text-amber-800' :
                            'bg-slate-100 text-slate-600'
                          }`}>
                            {inst.status === 'Paid' ? 'जमा (Paid)' : (inst.status === 'Partially Paid' ? 'आंशिक जमा' : 'बाकी (Due)')}
                          </span>
                        </div>
                      </div>
                    ))}
                    <div className="pt-1 flex justify-between text-xs font-bold text-slate-800">
                      <span>कुल जमा (Paid): ₹{(completedBooking.paidAmount || 0).toLocaleString('en-IN')}</span>
                      <span className="text-amber-700">शेष बकाया (Due): ₹{(completedBooking.balanceAmount || 0).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
                <button
                  onClick={() => generateBookingInvoicePDF(completedBooking)}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5 text-emerald-400" />
                  PDF रसीद डाउनलोड करें
                </button>

                {onOpenCustomerPortal && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenCustomerPortal();
                    }}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    मेरी बुकिंग्स देखें व बदलें (My Account)
                  </button>
                )}

                <button
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                >
                  होम पेज पर जाएं
                </button>
              </div>

            </div>
          )}

        </div>

        {/* Wizard Footer Controls (if not on confirmation) */}
        {step < 5 && (
          <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((prev) => (prev - 1) as any)}
                className="px-3.5 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                पीछे जाएं
              </button>
            ) : (
              <div>
                <span className="text-[11px] text-slate-500 font-medium">टेंट किराया:</span>
                <span className="text-xs font-bold text-slate-900 ml-1 font-mono">₹{tent.pricePerDay.toLocaleString('en-IN')}/दिन</span>
              </div>
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                आगे बढ़ें (चरण {step + 1})
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinalSubmit}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                बुकिंग पक्की करें (₹{calculations.grandTotal.toLocaleString('en-IN')})
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
