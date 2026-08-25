export type TentCategory = 
  | 'Desi Shamyana Pandal'
  | 'Waterproof German Hanger Pandal'
  | 'Wedding Mandap & Stage Tent'
  | 'Haldi & Mehendi Yellow Canopy'
  | 'Bhojan & Pangat Shamyana'
  | 'VIP Lawn Marquee'
  | 'Mini Chhatri / Pagoda';

export type AddonCategory = 
  | 'Baithne Ka Saman'
  | 'Sajane Ka Saman'
  | 'Khana Bnane Ka Saman'
  | 'Lighting & Sound'
  | 'Bijli & Generator'
  | 'Garmiyon Ka Saman'
  | 'Sardiyon Ka Saman'
  | 'Barsat Ka Saman'
  | 'Saf-Safai Ka Saman';

export interface TentAddon {
  id: string;
  name: string;
  hindiName?: string;
  category: AddonCategory;
  pricePerDay: number;
  description: string;
  unit: string; // e.g. "प्रति दिन", "25 कुर्सी सेट", "सेट", "100ft"
  iconName: string;
  stockQuantity?: number; // Total available quantity in inventory (e.g. 50, 100, 20)
}

export interface Review {
  id: string;
  userName: string;
  rating: number;
  date: string;
  comment: string;
  eventType: string;
}

export interface Tent {
  id: string;
  name: string;
  hindiName?: string;
  category: TentCategory;
  description: string;
  detailedSpecs: {
    dimensions: string; // e.g. "30ft x 60ft (1,800 sq ft)"
    dimensionsFoot?: string;
    capacitySeated: number;
    capacityStanding: number;
    peakHeight: string; // e.g. "18 ft Apex"
    setupTime: string; // e.g. "2-3 घंटे (टेंट कारीगर दल द्वारा)"
    waterproofRating: string; // e.g. "100% वाटरप्रूफ तिरपाल व कनात"
    windResistance: string; // e.g. "मजबूत बांस-बल्ली व लोहे के पाइप द्वारा सुरक्षित"
    frameMaterial: string; // e.g. "मजबूत जीआई पाइप / लोहे के पोल व बांस-बल्ली"
  };
  pricePerDay: number;
  weeklyDiscountPercentage: number;
  depositAmount: number;
  images: string[];
  features: string[];
  includedItems: string[];
  stockQuantity: number;
  isFeatured?: boolean;
  isPopular?: boolean;
  status: 'Available' | 'Low Stock' | 'Maintenance';
  supportedSurfaces: ('Khet / Khula Ground' | 'Lawn / Ghaas' | 'Aangan / Pakka Farsh' | 'Chhat / Terrace' | 'Sadak / Gali' | string)[];
  rating: number;
  reviewCount: number;
  reviews: Review[];
}

export type BookingStatus = 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';

export interface SelectedAddon {
  addonId: string;
  name: string;
  hindiName?: string;
  category: AddonCategory;
  pricePerDay: number;
  unit: string;
  quantity: number;
}

export type PaymentPlanType = 
  | '3_INSTALLMENTS' // 1. साई/बयाना + 2. टेंट लगने पर + 3. सामान उतरने/विदाई पर (Recommended for villages)
  | '2_INSTALLMENTS' // 1. बयाना + 2. टेंट लगने के दिन
  | 'FULL_PAYMENT';  // 1 बार में पूरा भुगतान

export interface PaymentInstallment {
  id: string;
  stage: 'advance' | 'setup' | 'post_event' | 'custom';
  titleHindi: string; // जैसे: '1. साई / बयाना (Advance)', '2. टेंट लगने पर (On Setup)', '3. सामान उतरने / विदाई बाद (Final)'
  scheduledAmount: number;
  paidAmount: number;
  dueDateDescription?: string;
  paidDate?: string;
  status: 'Pending' | 'Paid' | 'Partially Paid';
  paymentMode?: 'Cash (नकद)' | 'UPI / PhonePe / GPay' | 'Bank Transfer';
  receiptNote?: string;
}

export interface Booking {
  id: string;
  bookingNumber: string; // e.g. "TH-94821"
  createdAt: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  tentId: string;
  tentName: string;
  tentHindiName?: string;
  tentImage: string;
  tentCategory: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  guestCount: number;
  eventType: string;
  
  // Direct Village / Town Address
  villageOrCity: string;
  cityName?: string;
  gramPanchayatOrArea?: string;
  district: string;
  landmark: string;
  deliveryAddress: string;
  surfaceType: string;
  
  // Custom village event item addons (Baithne, Sajane, Khana bnane ka saman)
  addons: SelectedAddon[];
  specialInstructions?: string;
  
  // Financials in Rupees (₹)
  baseRentTotal: number;
  addonsTotal: number;
  transportSetupFee: number;
  taxAmount?: number;
  securityDeposit: number;
  grandTotal: number;
  
  // Village Multi-Stage Installment Payment Tracking
  paymentPlan?: PaymentPlanType;
  paidAmount?: number;     // कुल जमा राशि
  balanceAmount?: number;  // कुल बाकी / शेष राशि
  installments?: PaymentInstallment[];

  // Status
  status: BookingStatus;
  paymentStatus: 'Unpaid' | 'Deposit Paid' | 'Paid in Full' | 'Payment on Setup' | 'Advance Paid' | 'Partially Paid' | 'Full Paid';
  paymentMethod: string;
  assignedCrew?: string;
}

export interface CustomerAccount {
  id: string;
  name: string;
  phone: string;
  email?: string;
  pin?: string; // 4-digit security PIN or password for easy access
  createdAt: string;
  defaultVillageOrCity?: string;
  defaultAddress?: string;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'Super Admin' | 'Inventory Manager' | 'Operations Lead';
  lastLogin: string;
}

export interface FilterState {
  searchQuery: string;
  category: string;
  minCapacity: number;
  maxPrice: number;
  surfaceType: string;
  sortBy: 'recommended' | 'price-low' | 'price-high' | 'capacity-high' | 'rating';
}
