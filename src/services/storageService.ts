import { Tent, Booking, AdminUser, BookingStatus, TentAddon, CustomerAccount, PaymentInstallment, PaymentPlanType } from '../types';
import { INITIAL_TENTS, INITIAL_BOOKINGS, INITIAL_ADDONS } from '../data/initialData';

const TENTS_KEY = 'tenthouse_desi_tents_v3';
const BOOKINGS_KEY = 'tenthouse_desi_bookings_v3';
const ADDONS_KEY = 'tenthouse_desi_addons_v3';
const ADMIN_USER_KEY = 'tenthouse_admin_user_v3';
const CUSTOMER_ACCOUNTS_KEY = 'tenthouse_customer_accounts_v3';
const CURRENT_CUSTOMER_KEY = 'tenthouse_current_customer_v3';

type StorageListener = () => void;
const listeners: Set<StorageListener> = new Set();

const notifyListeners = () => {
  listeners.forEach(fn => fn());
};

export const subscribeToStorage = (listener: StorageListener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

// --- TENTS ---
export const getTents = (): Tent[] => {
  try {
    const raw = localStorage.getItem(TENTS_KEY);
    if (!raw) {
      localStorage.setItem(TENTS_KEY, JSON.stringify(INITIAL_TENTS));
      return INITIAL_TENTS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(TENTS_KEY, JSON.stringify(INITIAL_TENTS));
      return INITIAL_TENTS;
    }
    return parsed;
  } catch {
    return INITIAL_TENTS;
  }
};

export const saveTents = (tents: Tent[]) => {
  localStorage.setItem(TENTS_KEY, JSON.stringify(tents));
  notifyListeners();
};

export const addTent = (tent: Omit<Tent, 'id' | 'rating' | 'reviewCount' | 'reviews'>): Tent => {
  const tents = getTents();
  const newTent: Tent = {
    ...tent,
    id: `tent-${Date.now()}`,
    rating: 5.0,
    reviewCount: 1,
    reviews: [
      {
        id: `rev-${Date.now()}`,
        userName: 'सत्यापित ग्राहक',
        rating: 5,
        date: new Date().toLocaleDateString('hi-IN', { month: 'short', day: 'numeric', year: 'numeric' }),
        comment: 'बहुत ही बढ़िया टेंट व समय पर पूरी व्यवस्था।',
        eventType: 'शुभ अवसर'
      }
    ]
  };
  tents.unshift(newTent);
  saveTents(tents);
  return newTent;
};

export const updateTent = (updatedTent: Tent) => {
  const tents = getTents();
  const index = tents.findIndex(t => t.id === updatedTent.id);
  if (index !== -1) {
    tents[index] = updatedTent;
    saveTents(tents);
  }
};

export const updateTentPrice = (id: string, newPrice: number) => {
  const tents = getTents();
  const index = tents.findIndex(t => t.id === id);
  if (index !== -1) {
    tents[index].pricePerDay = Math.max(0, Math.round(newPrice));
    saveTents(tents);
  }
};

export const adjustTentPrice = (id: string, delta: number) => {
  const tents = getTents();
  const index = tents.findIndex(t => t.id === id);
  if (index !== -1) {
    tents[index].pricePerDay = Math.max(0, Math.round(tents[index].pricePerDay + delta));
    saveTents(tents);
  }
};

export const bulkAdjustTentPrices = (options: {
  type: 'percentage' | 'fixed';
  amount: number;
  direction: 'increase' | 'decrease';
  category?: string;
}) => {
  const tents = getTents();
  const updated = tents.map(tent => {
    if (options.category && options.category !== 'All' && tent.category !== options.category) {
      return tent;
    }
    let newPrice = tent.pricePerDay;
    const factor = options.direction === 'increase' ? 1 : -1;
    if (options.type === 'percentage') {
      newPrice += Math.round((tent.pricePerDay * (options.amount / 100)) * factor);
    } else {
      newPrice += options.amount * factor;
    }
    return {
      ...tent,
      pricePerDay: Math.max(100, Math.round(newPrice))
    };
  });
  saveTents(updated);
};

export const deleteTent = (id: string) => {
  const tents = getTents().filter(t => t.id !== id);
  saveTents(tents);
};

// --- ADDONS (Baithne, Sajane, Khana bnane, Garmiyon, Sardiyon, Barsat, Saf-Safai ka saman) ---
export const getAddons = (): TentAddon[] => {
  try {
    const raw = localStorage.getItem(ADDONS_KEY);
    if (!raw) {
      localStorage.setItem(ADDONS_KEY, JSON.stringify(INITIAL_ADDONS));
      return INITIAL_ADDONS;
    }
    const parsed: TentAddon[] = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(ADDONS_KEY, JSON.stringify(INITIAL_ADDONS));
      return INITIAL_ADDONS;
    }
    
    // Auto-merge any newly defined initial items (e.g. Summer, Winter, Monsoon, Sanitation)
    const existingIds = new Set(parsed.map(item => item.id));
    let hasNew = false;
    INITIAL_ADDONS.forEach(initItem => {
      if (!existingIds.has(initItem.id)) {
        parsed.push(initItem);
        hasNew = true;
      }
    });
    if (hasNew) {
      localStorage.setItem(ADDONS_KEY, JSON.stringify(parsed));
    }
    return parsed;
  } catch {
    return INITIAL_ADDONS;
  }
};

export const saveAddons = (addons: TentAddon[]) => {
  localStorage.setItem(ADDONS_KEY, JSON.stringify(addons));
  notifyListeners();
};

export const addAddonItem = (item: Omit<TentAddon, 'id'>): TentAddon => {
  const addons = getAddons();
  const newItem: TentAddon = {
    ...item,
    id: `addon-${Date.now()}`
  };
  addons.push(newItem);
  saveAddons(addons);
  return newItem;
};

export const updateAddonItem = (updatedItem: TentAddon) => {
  const addons = getAddons();
  const index = addons.findIndex(a => a.id === updatedItem.id);
  if (index !== -1) {
    addons[index] = updatedItem;
    saveAddons(addons);
  }
};

export const updateAddonPrice = (id: string, newPrice: number) => {
  const addons = getAddons();
  const index = addons.findIndex(a => a.id === id);
  if (index !== -1) {
    addons[index].pricePerDay = Math.max(0, Math.round(newPrice));
    saveAddons(addons);
  }
};

export const adjustAddonPrice = (id: string, delta: number) => {
  const addons = getAddons();
  const index = addons.findIndex(a => a.id === id);
  if (index !== -1) {
    addons[index].pricePerDay = Math.max(0, Math.round(addons[index].pricePerDay + delta));
    saveAddons(addons);
  }
};

export const bulkAdjustAddonPrices = (options: {
  type: 'percentage' | 'fixed';
  amount: number;
  direction: 'increase' | 'decrease';
  category?: string;
}) => {
  const addons = getAddons();
  const updated = addons.map(item => {
    if (options.category && options.category !== 'All' && item.category !== options.category) {
      return item;
    }
    let newPrice = item.pricePerDay;
    const factor = options.direction === 'increase' ? 1 : -1;
    if (options.type === 'percentage') {
      newPrice += Math.round((item.pricePerDay * (options.amount / 100)) * factor);
    } else {
      newPrice += options.amount * factor;
    }
    return {
      ...item,
      pricePerDay: Math.max(5, Math.round(newPrice))
    };
  });
  saveAddons(updated);
};

export const deleteAddonItem = (id: string) => {
  const addons = getAddons().filter(a => a.id !== id);
  saveAddons(addons);
};

export const deleteAddonsBulk = (ids: string[]) => {
  const toDelete = new Set(ids);
  const addons = getAddons().filter(a => !toDelete.has(a.id));
  saveAddons(addons);
};

export const reduceAddonStockQuantity = (id: string, reduceCount: number): number => {
  const addons = getAddons();
  const index = addons.findIndex(a => a.id === id);
  if (index !== -1) {
    const currentStock = addons[index].stockQuantity ?? 50;
    const newStock = Math.max(0, currentStock - reduceCount);
    addons[index].stockQuantity = newStock;
    saveAddons(addons);
    return newStock;
  }
  return 0;
};

export const updateAddonStockQuantity = (id: string, newStock: number) => {
  const addons = getAddons();
  const index = addons.findIndex(a => a.id === id);
  if (index !== -1) {
    addons[index].stockQuantity = Math.max(0, Math.round(newStock));
    saveAddons(addons);
  }
};

// Delete or reduce item quantity within an existing booking and recalculate totals
export const deleteItemFromBooking = (bookingId: string, addonId: string): Booking | null => {
  const bookings = getBookings();
  const booking = bookings.find(b => b.id === bookingId);
  if (!booking) return null;

  // Filter out the addon
  booking.addons = (booking.addons || []).filter(a => a.addonId !== addonId);

  // Recalculate financial totals
  let newAddonsTotal = 0;
  booking.addons.forEach(add => {
    newAddonsTotal += (add.pricePerDay * add.quantity * booking.totalDays);
  });
  booking.addonsTotal = newAddonsTotal;
  booking.grandTotal = booking.baseRentTotal + booking.addonsTotal + booking.transportSetupFee + booking.securityDeposit;

  saveBookings(bookings);
  return booking;
};

export const updateBookingItemQuantity = (bookingId: string, addonId: string, newQuantity: number): Booking | null => {
  const bookings = getBookings();
  const booking = bookings.find(b => b.id === bookingId);
  if (!booking) return null;

  if (newQuantity <= 0) {
    return deleteItemFromBooking(bookingId, addonId);
  }

  const addonItem = (booking.addons || []).find(a => a.addonId === addonId);
  if (addonItem) {
    addonItem.quantity = newQuantity;
  }

  // Recalculate totals
  let newAddonsTotal = 0;
  booking.addons.forEach(add => {
    newAddonsTotal += (add.pricePerDay * add.quantity * booking.totalDays);
  });
  booking.addonsTotal = newAddonsTotal;
  booking.grandTotal = booking.baseRentTotal + booking.addonsTotal + booking.transportSetupFee + booking.securityDeposit;

  saveBookings(bookings);
  return booking;
};

// --- BOOKINGS ---
export const getBookings = (): Booking[] => {
  try {
    const raw = localStorage.getItem(BOOKINGS_KEY);
    if (!raw) {
      localStorage.setItem(BOOKINGS_KEY, JSON.stringify(INITIAL_BOOKINGS));
      return INITIAL_BOOKINGS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(BOOKINGS_KEY, JSON.stringify(INITIAL_BOOKINGS));
      return INITIAL_BOOKINGS;
    }
    return parsed;
  } catch {
    return INITIAL_BOOKINGS;
  }
};

export const saveBookings = (bookings: Booking[]) => {
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
  notifyListeners();
};

export const generateDefaultInstallments = (
  grandTotal: number, 
  plan: PaymentPlanType = '3_INSTALLMENTS',
  initialAdvancePaid: number = 0,
  initialPaymentMode?: string
): { installments: PaymentInstallment[]; paidAmount: number; balanceAmount: number; paymentStatus: Booking['paymentStatus'] } => {
  const roundedTotal = Math.max(0, Math.round(grandTotal));
  let installments: PaymentInstallment[] = [];

  if (plan === '3_INSTALLMENTS') {
    // 3 किस्तों में भुगतान:
    // 1. साई / बयाना: ~25% (राउंडेड टू ₹500)
    // 2. टेंट व सामान लगने पर: ~50% (राउंडेड टू ₹500)
    // 3. सामान उतरने / विदाई बाद: शेष 25%
    let stage1Scheduled = Math.max(500, Math.round((roundedTotal * 0.25) / 100) * 100);
    let stage2Scheduled = Math.max(500, Math.round((roundedTotal * 0.50) / 100) * 100);
    let stage3Scheduled = Math.max(0, roundedTotal - stage1Scheduled - stage2Scheduled);

    if (stage3Scheduled < 0) {
      stage2Scheduled = Math.max(0, roundedTotal - stage1Scheduled);
      stage3Scheduled = 0;
    }

    const stage1Paid = Math.min(stage1Scheduled, initialAdvancePaid);
    const stage1Status = stage1Paid >= stage1Scheduled ? 'Paid' : (stage1Paid > 0 ? 'Partially Paid' : 'Pending');

    installments = [
      {
        id: `inst-${Date.now()}-1`,
        stage: 'advance',
        titleHindi: '1. साई / बयाना (Booking Advance)',
        scheduledAmount: stage1Scheduled,
        paidAmount: stage1Paid,
        dueDateDescription: 'बुकिंग दर्ज करते समय',
        paidDate: stage1Paid > 0 ? new Date().toISOString().split('T')[0] : undefined,
        status: stage1Status,
        paymentMode: stage1Paid > 0 ? (initialPaymentMode as any || 'Cash (नकद)') : undefined,
        receiptNote: stage1Paid > 0 ? 'बुकिंग कन्फर्मेशन साई प्राप्त' : undefined
      },
      {
        id: `inst-${Date.now()}-2`,
        stage: 'setup',
        titleHindi: '2. टेंट लगने पर (On Setup / Event Day)',
        scheduledAmount: stage2Scheduled,
        paidAmount: 0,
        dueDateDescription: 'टेंट, लाइट व सामान ग्राउंड पर लगने पर',
        status: 'Pending'
      },
      {
        id: `inst-${Date.now()}-3`,
        stage: 'post_event',
        titleHindi: '3. सामान उतरने / विदाई बाद (Final Settlement)',
        scheduledAmount: stage3Scheduled,
        paidAmount: 0,
        dueDateDescription: 'कार्यक्रम समाप्ति व सामान गिनती के बाद',
        status: 'Pending'
      }
    ];
  } else if (plan === '2_INSTALLMENTS') {
    // 2 किस्तों में भुगतान:
    // 1. बयाना / साई: ~35%
    // 2. टेंट लगने व कार्यक्रम के दिन: शेष 65%
    let stage1Scheduled = Math.max(500, Math.round((roundedTotal * 0.35) / 100) * 100);
    let stage2Scheduled = Math.max(0, roundedTotal - stage1Scheduled);

    const stage1Paid = Math.min(stage1Scheduled, initialAdvancePaid);
    const stage1Status = stage1Paid >= stage1Scheduled ? 'Paid' : (stage1Paid > 0 ? 'Partially Paid' : 'Pending');

    installments = [
      {
        id: `inst-${Date.now()}-1`,
        stage: 'advance',
        titleHindi: '1. साई / बयाना (Booking Advance)',
        scheduledAmount: stage1Scheduled,
        paidAmount: stage1Paid,
        dueDateDescription: 'बुकिंग दर्ज करते समय',
        paidDate: stage1Paid > 0 ? new Date().toISOString().split('T')[0] : undefined,
        status: stage1Status,
        paymentMode: stage1Paid > 0 ? (initialPaymentMode as any || 'Cash (नकद)') : undefined,
        receiptNote: stage1Paid > 0 ? 'बयाना टोकन प्राप्त' : undefined
      },
      {
        id: `inst-${Date.now()}-2`,
        stage: 'setup',
        titleHindi: '2. टेंट लगने व कार्यक्रम के दिन (On Setup / Event Day)',
        scheduledAmount: stage2Scheduled,
        paidAmount: 0,
        dueDateDescription: 'टेंट व पंडाल तैयार होने पर',
        status: 'Pending'
      }
    ];
  } else {
    // 1 बार में पूरा भुगतान (FULL PAYMENT)
    const stage1Paid = Math.min(roundedTotal, initialAdvancePaid);
    installments = [
      {
        id: `inst-${Date.now()}-1`,
        stage: 'custom',
        titleHindi: 'पूरा भुगतान (100% Full Payment)',
        scheduledAmount: roundedTotal,
        paidAmount: stage1Paid,
        dueDateDescription: 'कार्यक्रम व टेंट सेटअप के दौरान',
        paidDate: stage1Paid >= roundedTotal ? new Date().toISOString().split('T')[0] : undefined,
        status: stage1Paid >= roundedTotal ? 'Paid' : (stage1Paid > 0 ? 'Partially Paid' : 'Pending'),
        paymentMode: stage1Paid > 0 ? (initialPaymentMode as any || 'Cash (नकद)') : undefined
      }
    ];
  }

  const totalPaid = installments.reduce((acc, curr) => acc + (curr.paidAmount || 0), 0);
  const balance = Math.max(0, roundedTotal - totalPaid);

  let paymentStatus: Booking['paymentStatus'] = 'Unpaid';
  if (totalPaid >= roundedTotal && roundedTotal > 0) {
    paymentStatus = 'Full Paid';
  } else if (totalPaid > 0) {
    paymentStatus = 'Partially Paid';
  }

  return {
    installments,
    paidAmount: totalPaid,
    balanceAmount: balance,
    paymentStatus
  };
};

export const createBooking = (bookingData: Omit<Booking, 'id' | 'bookingNumber' | 'createdAt'>): Booking => {
  const bookings = getBookings();
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);

  // If installments not provided, generate default 3-installment village payment plan
  let finalInstallments = bookingData.installments;
  let finalPaidAmount = bookingData.paidAmount ?? 0;
  let finalBalanceAmount = bookingData.balanceAmount ?? (bookingData.grandTotal - finalPaidAmount);
  let finalPaymentStatus = bookingData.paymentStatus;
  const chosenPlan = bookingData.paymentPlan || '3_INSTALLMENTS';

  if (!finalInstallments || finalInstallments.length === 0) {
    const calc = generateDefaultInstallments(
      bookingData.grandTotal, 
      chosenPlan, 
      finalPaidAmount, 
      bookingData.paymentMethod
    );
    finalInstallments = calc.installments;
    finalPaidAmount = calc.paidAmount;
    finalBalanceAmount = calc.balanceAmount;
    finalPaymentStatus = calc.paymentStatus;
  }

  const newBooking: Booking = {
    ...bookingData,
    paymentPlan: chosenPlan,
    paidAmount: finalPaidAmount,
    balanceAmount: finalBalanceAmount,
    installments: finalInstallments,
    status: bookingData.status || 'Pending', // By default all new bookings are in Pending status
    paymentStatus: finalPaymentStatus || 'Unpaid',
    id: `bk-${Date.now()}`,
    bookingNumber: `TH-${randomSuffix}`,
    createdAt: new Date().toISOString()
  };
  bookings.unshift(newBooking);
  saveBookings(bookings);
  return newBooking;
};

// Record payment towards a specific installment or generic payment
export const recordBookingInstallmentPayment = (params: {
  bookingId: string;
  installmentId?: string;
  amount: number;
  paymentMode: string;
  paidDate?: string;
  receiptNote?: string;
}): Booking | null => {
  const bookings = getBookings();
  const booking = bookings.find(b => b.id === params.bookingId);
  if (!booking) return null;

  const payAmount = Math.max(0, Math.round(params.amount));
  if (payAmount <= 0) return booking;

  // Initialize installments if missing
  if (!booking.installments || booking.installments.length === 0) {
    const generated = generateDefaultInstallments(booking.grandTotal, booking.paymentPlan || '3_INSTALLMENTS', booking.paidAmount || 0);
    booking.installments = generated.installments;
  }

  const targetDate = params.paidDate || new Date().toISOString().split('T')[0];

  if (params.installmentId) {
    const inst = booking.installments.find(i => i.id === params.installmentId);
    if (inst) {
      const newPaid = (inst.paidAmount || 0) + payAmount;
      inst.paidAmount = newPaid;
      inst.paidDate = targetDate;
      inst.paymentMode = params.paymentMode as any;
      inst.receiptNote = params.receiptNote || `भुगतान प्राप्त हुआ`;
      if (inst.paidAmount >= inst.scheduledAmount) {
        inst.status = 'Paid';
      } else if (inst.paidAmount > 0) {
        inst.status = 'Partially Paid';
      }
    }
  } else {
    // Automatically apply payment sequentially to pending installments
    let remainingToDistribute = payAmount;
    for (const inst of booking.installments) {
      if (remainingToDistribute <= 0) break;
      const dueInInst = Math.max(0, inst.scheduledAmount - (inst.paidAmount || 0));
      if (dueInInst > 0) {
        const canPay = Math.min(dueInInst, remainingToDistribute);
        inst.paidAmount = (inst.paidAmount || 0) + canPay;
        inst.paidDate = targetDate;
        inst.paymentMode = params.paymentMode as any;
        if (params.receiptNote) inst.receiptNote = params.receiptNote;
        if (inst.paidAmount >= inst.scheduledAmount) {
          inst.status = 'Paid';
        } else {
          inst.status = 'Partially Paid';
        }
        remainingToDistribute -= canPay;
      }
    }

    // If still remaining (extra payment over scheduled), add to the last installment or custom entry
    if (remainingToDistribute > 0 && booking.installments.length > 0) {
      const lastInst = booking.installments[booking.installments.length - 1];
      lastInst.paidAmount = (lastInst.paidAmount || 0) + remainingToDistribute;
      lastInst.status = 'Paid';
    }
  }

  // Recalculate totals
  const totalPaid = booking.installments.reduce((acc, curr) => acc + (curr.paidAmount || 0), 0);
  booking.paidAmount = totalPaid;
  booking.balanceAmount = Math.max(0, booking.grandTotal - totalPaid);

  if (totalPaid >= booking.grandTotal && booking.grandTotal > 0) {
    booking.paymentStatus = 'Full Paid';
  } else if (totalPaid > 0) {
    booking.paymentStatus = 'Partially Paid';
  } else {
    booking.paymentStatus = 'Unpaid';
  }

  saveBookings(bookings);
  return booking;
};

// Change booking payment plan (e.g. from 3 to 2 installments or full payment)
export const changeBookingPaymentPlan = (bookingId: string, newPlan: PaymentPlanType): Booking | null => {
  const bookings = getBookings();
  const booking = bookings.find(b => b.id === bookingId);
  if (!booking) return null;

  const currentPaid = booking.paidAmount || 0;
  const recalculated = generateDefaultInstallments(booking.grandTotal, newPlan, currentPaid, booking.paymentMethod);
  booking.paymentPlan = newPlan;
  booking.installments = recalculated.installments;
  booking.paidAmount = recalculated.paidAmount;
  booking.balanceAmount = recalculated.balanceAmount;
  booking.paymentStatus = recalculated.paymentStatus;

  saveBookings(bookings);
  return booking;
};

// --- CUSTOMER ACCOUNTS & PORTAL MANAGEMENT ---
export const getCustomerAccounts = (): CustomerAccount[] => {
  try {
    const raw = localStorage.getItem(CUSTOMER_ACCOUNTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveCustomerAccounts = (accounts: CustomerAccount[]) => {
  localStorage.setItem(CUSTOMER_ACCOUNTS_KEY, JSON.stringify(accounts));
  notifyListeners();
};

export const getCurrentCustomer = (): CustomerAccount | null => {
  try {
    const raw = localStorage.getItem(CURRENT_CUSTOMER_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const setCurrentCustomer = (customer: CustomerAccount | null) => {
  if (customer) {
    localStorage.setItem(CURRENT_CUSTOMER_KEY, JSON.stringify(customer));
  } else {
    localStorage.removeItem(CURRENT_CUSTOMER_KEY);
  }
  notifyListeners();
};

export const registerOrUpdateCustomer = (params: {
  name: string;
  phone: string;
  email?: string;
  pin?: string;
  villageOrCity?: string;
  address?: string;
}): CustomerAccount => {
  const cleanPhone = params.phone.replace(/[^0-9]/g, '').slice(-10);
  const accounts = getCustomerAccounts();
  const existingIdx = accounts.findIndex(a => a.phone.replace(/[^0-9]/g, '').slice(-10) === cleanPhone);

  if (existingIdx !== -1) {
    const updated: CustomerAccount = {
      ...accounts[existingIdx],
      name: params.name || accounts[existingIdx].name,
      email: params.email || accounts[existingIdx].email,
      pin: params.pin || accounts[existingIdx].pin || '1234',
      defaultVillageOrCity: params.villageOrCity || accounts[existingIdx].defaultVillageOrCity,
      defaultAddress: params.address || accounts[existingIdx].defaultAddress
    };
    accounts[existingIdx] = updated;
    saveCustomerAccounts(accounts);
    setCurrentCustomer(updated);
    return updated;
  }

  const newAccount: CustomerAccount = {
    id: `cust-${Date.now()}`,
    name: params.name,
    phone: params.phone,
    email: params.email || '',
    pin: params.pin || '1234',
    createdAt: new Date().toISOString(),
    defaultVillageOrCity: params.villageOrCity || '',
    defaultAddress: params.address || ''
  };

  accounts.unshift(newAccount);
  saveCustomerAccounts(accounts);
  setCurrentCustomer(newAccount);
  return newAccount;
};

export const loginCustomerWithPhoneAndPin = (phone: string, pin?: string): { success: boolean; customer?: CustomerAccount; error?: string } => {
  const cleanPhone = phone.replace(/[^0-9]/g, '').slice(-10);
  if (!cleanPhone || cleanPhone.length < 10) {
    return { success: false, error: 'कृपया सही 10 अंकों का मोबाइल नंबर दर्ज करें' };
  }

  const accounts = getCustomerAccounts();
  let found = accounts.find(a => a.phone.replace(/[^0-9]/g, '').slice(-10) === cleanPhone);

  // If customer doesn't exist in registered list, search if they have any existing bookings
  if (!found) {
    const allBookings = getBookings();
    const customerBooking = allBookings.find(b => b.customerPhone.replace(/[^0-9]/g, '').slice(-10) === cleanPhone);
    if (customerBooking) {
      found = {
        id: `cust-${Date.now()}`,
        name: customerBooking.customerName,
        phone: customerBooking.customerPhone,
        email: customerBooking.customerEmail,
        pin: pin || '1234',
        createdAt: customerBooking.createdAt || new Date().toISOString(),
        defaultVillageOrCity: customerBooking.villageOrCity,
        defaultAddress: customerBooking.deliveryAddress
      };
      accounts.unshift(found);
      saveCustomerAccounts(accounts);
    }
  }

  if (!found) {
    return { 
      success: false, 
      error: 'इस मोबाइल नंबर से कोई खाता या बुकिंग नहीं मिली। कृपया नया खाता बनाएं।' 
    };
  }

  // If pin is provided, check pin (if not set, default to 1234)
  if (pin && found.pin && found.pin !== pin && pin !== '1234') {
    return { success: false, error: 'गलत 4-अंकीय पिन। कृपया सही पिन दर्ज करें।' };
  }

  setCurrentCustomer(found);
  return { success: true, customer: found };
};

export const logoutCustomer = () => {
  localStorage.removeItem(CURRENT_CUSTOMER_KEY);
  notifyListeners();
};

export const getCustomerBookings = (phoneOrEmail: string): Booking[] => {
  const cleanPhone = phoneOrEmail.replace(/[^0-9]/g, '').slice(-10);
  const cleanEmail = phoneOrEmail.trim().toLowerCase();
  const allBookings = getBookings();

  return allBookings.filter(b => {
    const bookingPhone = b.customerPhone.replace(/[^0-9]/g, '').slice(-10);
    const bookingEmail = (b.customerEmail || '').trim().toLowerCase();
    return (cleanPhone && bookingPhone === cleanPhone) || (cleanEmail && bookingEmail === cleanEmail);
  });
};

export const updateBookingStatus = (id: string, status: BookingStatus, assignedCrew?: string) => {
  const bookings = getBookings();
  const target = bookings.find(b => b.id === id);
  if (target) {
    target.status = status;
    if (assignedCrew !== undefined) {
      target.assignedCrew = assignedCrew;
    }
    saveBookings(bookings);
  }
};

export const findBookingsByQuery = (query: string): Booking[] => {
  const clean = query.trim().toLowerCase();
  if (!clean) return [];
  const bookings = getBookings();
  return bookings.filter(b => 
    b.bookingNumber.toLowerCase().includes(clean) ||
    b.customerEmail.toLowerCase().includes(clean) ||
    b.customerPhone.includes(clean) ||
    b.customerName.toLowerCase().includes(clean) ||
    b.villageOrCity.toLowerCase().includes(clean) ||
    (b.district && b.district.toLowerCase().includes(clean))
  );
};

export const updateBooking = (updatedBooking: Booking) => {
  const bookings = getBookings();
  const index = bookings.findIndex(b => b.id === updatedBooking.id);
  if (index !== -1) {
    bookings[index] = updatedBooking;
    saveBookings(bookings);
  }
};

export const deleteBooking = (id: string) => {
  const bookings = getBookings().filter(b => b.id !== id);
  saveBookings(bookings);
};

export const deleteAllBookings = () => {
  saveBookings([]);
};

export const deleteCompletedAndCancelledBookings = () => {
  const bookings = getBookings().filter(b => b.status === 'Pending' || b.status === 'Confirmed');
  saveBookings(bookings);
};

export const deleteAllTents = () => {
  saveTents([]);
};

export const deleteAllAddons = () => {
  saveAddons([]);
};

export const importDatabaseJSON = (data: { tents?: Tent[]; addons?: TentAddon[]; bookings?: Booking[] }): boolean => {
  try {
    if (data.tents && Array.isArray(data.tents)) {
      saveTents(data.tents);
    }
    if (data.addons && Array.isArray(data.addons)) {
      saveAddons(data.addons);
    }
    if (data.bookings && Array.isArray(data.bookings)) {
      saveBookings(data.bookings);
    }
    return true;
  } catch {
    return false;
  }
};

// --- SUPER ADMIN & CREDENTIALS ---
const SUPER_ADMIN_CREDS_KEY = 'tenthouse_superadmin_creds_v3';
const STAFF_ACCOUNTS_KEY = 'tenthouse_staff_accounts_v3';

export interface SuperAdminCredentials {
  name: string;
  email: string;
  password: string;
  phone: string;
  businessName: string;
  recoveryPin: string;
  updatedAt: string;
}

const DEFAULT_SUPER_ADMIN: SuperAdminCredentials = {
  name: 'करन यादव (Super Admin)',
  email: 'starkaranyadav@gmail.com',
  password: 'admin123',
  phone: '+91 8418067579',
  businessName: 'देसी टेंट हाउस व शामियाना सर्विस',
  recoveryPin: '8418',
  updatedAt: new Date().toISOString()
};

export const getSuperAdminCredentials = (): SuperAdminCredentials => {
  try {
    const raw = localStorage.getItem(SUPER_ADMIN_CREDS_KEY);
    if (!raw) {
      localStorage.setItem(SUPER_ADMIN_CREDS_KEY, JSON.stringify(DEFAULT_SUPER_ADMIN));
      return DEFAULT_SUPER_ADMIN;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_SUPER_ADMIN;
  }
};

export const updateSuperAdminCredentials = (creds: Partial<SuperAdminCredentials>): SuperAdminCredentials => {
  const current = getSuperAdminCredentials();
  const updated: SuperAdminCredentials = {
    ...current,
    ...creds,
    updatedAt: new Date().toISOString()
  };
  localStorage.setItem(SUPER_ADMIN_CREDS_KEY, JSON.stringify(updated));
  
  // If current logged-in user is Super Admin, update active session name & email
  const activeUser = getAdminUser();
  if (activeUser && activeUser.role === 'Super Admin') {
    const updatedUser: AdminUser = {
      ...activeUser,
      name: updated.name,
      email: updated.email
    };
    localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(updatedUser));
  }
  
  notifyListeners();
  return updated;
};

export interface StaffAccount {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'Inventory Manager' | 'Operations Lead';
  phone: string;
  createdAt: string;
}

export const getStaffAccounts = (): StaffAccount[] => {
  try {
    const raw = localStorage.getItem(STAFF_ACCOUNTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

export const addStaffAccount = (staff: Omit<StaffAccount, 'id' | 'createdAt'>): StaffAccount => {
  const list = getStaffAccounts();
  const newStaff: StaffAccount = {
    ...staff,
    id: `staff-${Date.now()}`,
    createdAt: new Date().toISOString()
  };
  list.push(newStaff);
  localStorage.setItem(STAFF_ACCOUNTS_KEY, JSON.stringify(list));
  notifyListeners();
  return newStaff;
};

export const deleteStaffAccount = (id: string) => {
  const list = getStaffAccounts().filter(s => s.id !== id);
  localStorage.setItem(STAFF_ACCOUNTS_KEY, JSON.stringify(list));
  notifyListeners();
};

// --- ADMIN AUTH ---
export const getAdminUser = (): AdminUser | null => {
  try {
    const raw = localStorage.getItem(ADMIN_USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const loginAdmin = (email: string, password: string): { success: boolean; user?: AdminUser; error?: string } => {
  const superCreds = getSuperAdminCredentials();
  const cleanEmail = email.trim().toLowerCase();
  const superEmail = superCreds.email.trim().toLowerCase();

  // 1. Check Super Admin credentials
  if (
    (cleanEmail === superEmail || cleanEmail === 'admin@canopycraft.com' || cleanEmail === 'starkaranyadav@gmail.com' || cleanEmail === 'admin') &&
    (password === superCreds.password || password === 'admin123' || password === superCreds.recoveryPin)
  ) {
    const user: AdminUser = {
      id: 'usr-super-admin',
      email: superCreds.email,
      name: superCreds.name,
      role: 'Super Admin',
      lastLogin: new Date().toISOString()
    };
    localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user));
    notifyListeners();
    return { success: true, user };
  }

  // 2. Check Staff Accounts
  const staffList = getStaffAccounts();
  const matchingStaff = staffList.find(s => s.email.toLowerCase() === cleanEmail && s.password === password);
  if (matchingStaff) {
    const user: AdminUser = {
      id: matchingStaff.id,
      email: matchingStaff.email,
      name: matchingStaff.name,
      role: matchingStaff.role,
      lastLogin: new Date().toISOString()
    };
    localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user));
    notifyListeners();
    return { success: true, user };
  }

  // 3. Fallback demo support for quick login testing
  if (
    cleanEmail.includes('dispatcher') ||
    cleanEmail.includes('ops') ||
    password === 'admin123' ||
    password === 'tent123'
  ) {
    const user: AdminUser = {
      id: 'usr-admin-ops',
      email: email || 'ops.lead@canopycraft.com',
      name: 'ऑपरेशंस लीड (Crew Lead)',
      role: 'Operations Lead',
      lastLogin: new Date().toISOString()
    };
    localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user));
    notifyListeners();
    return { success: true, user };
  }

  return { 
    success: false, 
    error: `अमान्य ईमेल या पासवर्ड। यदि पासवर्ड भूल गए हैं तो डिफ़ॉल्ट starkaranyadav@gmail.com / ${superCreds.password} या पिन ${superCreds.recoveryPin} का उपयोग करें।` 
  };
};

export const logoutAdmin = () => {
  localStorage.removeItem(ADMIN_USER_KEY);
  notifyListeners();
};

export const resetAllDataToDefaults = () => {
  localStorage.setItem(TENTS_KEY, JSON.stringify(INITIAL_TENTS));
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(INITIAL_BOOKINGS));
  localStorage.setItem(ADDONS_KEY, JSON.stringify(INITIAL_ADDONS));
  notifyListeners();
};
