import React, { useState } from 'react';
import { Booking, BookingStatus, PaymentPlanType, PaymentInstallment } from '../../types';
import { 
  Search, CalendarCheck, Clock, CheckCircle2, XCircle, Printer, 
  MapPin, Phone, Mail, User, FileText, ChevronRight, X, AlertTriangle,
  Armchair, Utensils, Sparkles, Edit, Trash2, Save, Check, Download, Plus, Minus,
  Banknote, CreditCard, Wallet, CalendarClock, CheckCheck, Receipt
} from 'lucide-react';
import { 
  updateBookingStatus, updateBooking, deleteBooking, 
  deleteItemFromBooking, updateBookingItemQuantity,
  recordBookingInstallmentPayment, changeBookingPaymentPlan,
  generateDefaultInstallments
} from '../../services/storageService';
import { generateBookingInvoicePDF } from '../../utils/pdfGenerator';

interface BookingManagerProps {
  bookings: Booking[];
}

export const BookingManager: React.FC<BookingManagerProps> = ({ bookings }) => {
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeBookingModal, setActiveBookingModal] = useState<Booking | null>(null);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [crewInput, setCrewInput] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Village Installment Payment recording modal / inline state
  const [recordPayModalOpen, setRecordPayModalOpen] = useState(false);
  const [payTargetInstallmentId, setPayTargetInstallmentId] = useState<string>('');
  const [payAmountInput, setPayAmountInput] = useState<number>(0);
  const [payModeInput, setPayModeInput] = useState<'Cash' | 'UPI' | 'Bank Transfer' | 'Cheque'>('Cash');
  const [payDateInput, setPayDateInput] = useState<string>(new Date().toISOString().split('T')[0]);
  const [payNoteInput, setPayNoteInput] = useState<string>('');

  const showNotification = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const filteredBookings = bookings.filter(b => {
    if (selectedStatusFilter !== 'All' && b.status !== selectedStatusFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        b.bookingNumber.toLowerCase().includes(q) ||
        b.customerName.toLowerCase().includes(q) ||
        b.customerEmail.toLowerCase().includes(q) ||
        b.customerPhone.includes(q) ||
        b.tentName.toLowerCase().includes(q) ||
        b.villageOrCity.toLowerCase().includes(q) ||
        (b.district && b.district.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleStatusChange = (bookingId: string, status: BookingStatus) => {
    updateBookingStatus(bookingId, status);
    if (activeBookingModal && activeBookingModal.id === bookingId) {
      setActiveBookingModal(prev => prev ? { ...prev, status } : null);
    }
    showNotification(`बुकिंग स्थिति "${status}" अपडेट हो गई`);
  };

  const handleSaveCrew = (bookingId: string) => {
    if (!activeBookingModal) return;
    updateBookingStatus(bookingId, activeBookingModal.status, crewInput);
    setActiveBookingModal({ ...activeBookingModal, assignedCrew: crewInput });
    showNotification('कारीगर टीम असाइन हो गई');
  };

  const handleDownloadPDF = (booking: Booking) => {
    try {
      generateBookingInvoicePDF(booking);
      showNotification(`बुकिंग ${booking.bookingNumber} की PDF रसीद सफलतापूर्वक डाउनलोड हो गई!`);
    } catch (err) {
      console.error(err);
      showNotification('PDF डाउनलोड में समस्या, कृपया पुनः प्रयास करें');
    }
  };

  const handleDeleteItemFromBooking = (bookingId: string, addonId: string, itemName: string) => {
    if (confirm(`क्या आप इस बुकिंग से "${itemName}" को हटाना चाहते हैं?`)) {
      const updated = deleteItemFromBooking(bookingId, addonId);
      if (updated) {
        if (activeBookingModal && activeBookingModal.id === bookingId) {
          setActiveBookingModal({ ...updated });
        }
        if (editingBooking && editingBooking.id === bookingId) {
          setEditingBooking({ ...updated });
        }
        showNotification(`"${itemName}" बुकिंग से हटा दिया गया व कुल बिल स्वतः अपडेट हो गया`);
      }
    }
  };

  const handleModifyBookingItemQty = (bookingId: string, addonId: string, currentQty: number, delta: number) => {
    const newQty = currentQty + delta;
    if (newQty <= 0) {
      if (confirm(`क्या आप इस सामान को बुकिंग से हटाना चाहते हैं?`)) {
        const updated = deleteItemFromBooking(bookingId, addonId);
        if (updated) {
          if (activeBookingModal && activeBookingModal.id === bookingId) {
            setActiveBookingModal({ ...updated });
          }
          if (editingBooking && editingBooking.id === bookingId) {
            setEditingBooking({ ...updated });
          }
          showNotification('सामान बुकिंग से हटा दिया गया');
        }
      }
      return;
    }

    const updated = updateBookingItemQuantity(bookingId, addonId, newQty);
    if (updated) {
      if (activeBookingModal && activeBookingModal.id === bookingId) {
        setActiveBookingModal({ ...updated });
      }
      if (editingBooking && editingBooking.id === bookingId) {
        setEditingBooking({ ...updated });
      }
      showNotification(`मात्रा बदलकर ${newQty} कर दी गई`);
    }
  };

  const handleOpenPaymentModal = (booking: Booking, installment?: PaymentInstallment) => {
    setActiveBookingModal(booking);
    if (installment) {
      setPayTargetInstallmentId(installment.id);
      const remainingForInst = Math.max(0, installment.scheduledAmount - (installment.paidAmount || 0));
      setPayAmountInput(remainingForInst > 0 ? remainingForInst : installment.scheduledAmount);
      setPayNoteInput(`${installment.titleHindi} का भुगतान`);
    } else {
      setPayTargetInstallmentId('');
      const bal = booking.balanceAmount !== undefined ? booking.balanceAmount : Math.max(0, booking.grandTotal - (booking.paidAmount || 0));
      setPayAmountInput(bal > 0 ? bal : 1000);
      setPayNoteInput(`बुकिंग #${booking.bookingNumber} का भुगतान`);
    }
    setPayModeInput('Cash');
    setPayDateInput(new Date().toISOString().split('T')[0]);
    setRecordPayModalOpen(true);
  };

  const handleSubmitRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBookingModal) return;
    if (payAmountInput <= 0) {
      alert('कृपया 0 से अधिक भुगतान राशि दर्ज करें');
      return;
    }

    const updated = recordBookingInstallmentPayment({
      bookingId: activeBookingModal.id,
      installmentId: payTargetInstallmentId || undefined,
      amount: payAmountInput,
      paymentMode: payModeInput,
      paidDate: payDateInput,
      receiptNote: payNoteInput
    });

    if (updated) {
      setActiveBookingModal({ ...updated });
      setRecordPayModalOpen(false);
      showNotification(`₹${payAmountInput.toLocaleString('en-IN')} का भुगतान (${payModeInput}) सफलतापूर्वक दर्ज हो गया!`);
    }
  };

  const handleChangePlanInModal = (newPlan: PaymentPlanType) => {
    if (!activeBookingModal) return;
    const updated = changeBookingPaymentPlan(activeBookingModal.id, newPlan);
    if (updated) {
      setActiveBookingModal({ ...updated });
      showNotification(`भुगतान योजना बदलकर "${newPlan === '3_INSTALLMENTS' ? '3 किस्तों में' : (newPlan === '2_INSTALLMENTS' ? '2 किस्तों में' : '1 बार में')}" कर दी गई`);
    }
  };

  const handleDeleteBooking = (booking: Booking) => {
    if (confirm(`क्या आप ${booking.customerName} की बुकिंग (${booking.bookingNumber}) को डिलीट करना चाहते हैं?`)) {
      deleteBooking(booking.id);
      if (activeBookingModal && activeBookingModal.id === booking.id) {
        setActiveBookingModal(null);
      }
      showNotification(`बुकिंग ${booking.bookingNumber} सफलतापूर्वक हटा दी गई`);
    }
  };

  const handleSaveEditedBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBooking) return;

    const plan = editingBooking.paymentPlan || '3_INSTALLMENTS';
    const currentPaid = editingBooking.paidAmount || 0;
    const recalculated = generateDefaultInstallments(
      editingBooking.grandTotal,
      plan,
      currentPaid,
      editingBooking.paymentMethod
    );

    const updatedWithInstallments: Booking = {
      ...editingBooking,
      paymentPlan: plan,
      paidAmount: recalculated.paidAmount,
      balanceAmount: recalculated.balanceAmount,
      installments: recalculated.installments,
      paymentStatus: recalculated.paymentStatus
    };

    updateBooking(updatedWithInstallments);
    if (activeBookingModal && activeBookingModal.id === editingBooking.id) {
      setActiveBookingModal(updatedWithInstallments);
    }
    setEditingBooking(null);
    showNotification(`बुकिंग ${editingBooking.bookingNumber} का डेटा व किश्तें अपडेट हो गईं!`);
  };

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case 'Confirmed':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">स्वीकृत (Confirmed)</span>;
      case 'Pending':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">पेंडिंग (Pending)</span>;
      case 'Completed':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">पूर्ण (Completed)</span>;
      case 'Cancelled':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-200 text-slate-700">रद्द (Cancelled)</span>;
    }
  };

  return (
    <div className="space-y-6">

      {/* Toast notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white border border-emerald-500/50 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-slate-950 font-bold">
            <Check className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-semibold text-emerald-300">{toastMsg}</span>
        </div>
      )}
      
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>ग्राहक बुकिंग व टेंट डिलीवरी प्रबंधन</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
              {bookings.length} बुकिंग्स
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            गांव-देहात, विवाह, तिलक, कथा व लॉन पार्टी की सभी बुकिंग्स देखें, संशोधन (Edit) करें, स्थिति बदलें और रसीद प्रिंट करें।
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
            कुल बुकिंग्स: {bookings.length}
          </span>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        
        {/* Status Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'All', label: 'सभी बुकिंग' },
            { id: 'Pending', label: 'पेंडिंग (Pending)' },
            { id: 'Confirmed', label: 'स्वीकृत (Confirmed)' },
            { id: 'Completed', label: 'सम्पन्न (Completed)' },
            { id: 'Cancelled', label: 'रद्द (Cancelled)' }
          ].map(tab => {
            const count = tab.id === 'All' 
              ? bookings.length 
              : bookings.filter(b => b.status === tab.id).length;
            const isSelected = selectedStatusFilter === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setSelectedStatusFilter(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  isSelected ? 'bg-emerald-700 text-emerald-100' : 'bg-slate-200 text-slate-600'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ग्राहक का नाम, बुकिंग नंबर (उदा: TH-94821), मोबाइल, या गांव/शहर से खोजें..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
          />
        </div>

      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">बुकिंग नंबर</th>
                <th className="px-6 py-3.5">टेंट व शामियाना</th>
                <th className="px-6 py-3.5">ग्राहक व गांव/स्थान</th>
                <th className="px-6 py-3.5">कार्यक्रम तारीख</th>
                <th className="px-6 py-3.5">कुल बिल</th>
                <th className="px-6 py-3.5">स्थिति (Status)</th>
                <th className="px-6 py-3.5 text-right">रसीद / विवरण</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredBookings.map(b => (
                <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                  
                  {/* Ref */}
                  <td className="px-6 py-4">
                    <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px] block w-fit">
                      {b.bookingNumber}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      {new Date(b.createdAt).toLocaleDateString('hi-IN')}
                    </span>
                  </td>

                  {/* Tent */}
                  <td className="px-6 py-4">
                    <strong className="text-slate-900 block text-xs">{b.tentName}</strong>
                    <span className="text-slate-500 text-[11px]">{b.surfaceType} • {b.guestCount} मेहमान</span>
                    {b.addons && b.addons.length > 0 && (
                      <span className="text-[10px] text-emerald-700 block font-semibold mt-0.5">
                        +{b.addons.length} अन्य सामान (बैठने/सजावट/हलवाई बर्तन)
                      </span>
                    )}
                  </td>

                  {/* Customer */}
                  <td className="px-6 py-4">
                    <span className="font-bold text-slate-900 block">{b.customerName}</span>
                    <span className="text-slate-600 text-[11px] block">{b.customerPhone}</span>
                    <span className="text-slate-500 text-[10px] block truncate max-w-[180px]">
                      {b.villageOrCity} {b.landmark ? `(${b.landmark})` : ''}
                    </span>
                  </td>

                  {/* Dates */}
                  <td className="px-6 py-4">
                    <span className="font-mono text-slate-800 block font-semibold">{b.startDate} से {b.endDate}</span>
                    <span className="text-slate-500 text-[10px]">{b.totalDays} दिन का किराया</span>
                  </td>

                  {/* Amount & Village Installments */}
                  <td className="px-6 py-4">
                    <span className="font-mono font-bold text-slate-900 text-sm block">
                      ₹{b.grandTotal.toLocaleString('en-IN')}
                    </span>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                        b.paymentStatus === 'Full Paid' || b.paymentStatus === 'Paid in Full' 
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : (b.paymentStatus === 'Advance Paid' || b.paymentStatus === 'Partially Paid' 
                            ? 'bg-amber-50 text-amber-800 border-amber-300' 
                            : 'bg-slate-100 text-slate-600 border-slate-200')
                      }`}>
                        {b.paymentStatus}
                      </span>
                      {b.paidAmount !== undefined && b.paidAmount > 0 && (
                        <span className="text-[10px] font-mono text-emerald-700 font-semibold">
                          (₹{b.paidAmount.toLocaleString('en-IN')} जमा)
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      {b.paymentPlan === '2_INSTALLMENTS' ? '2 किस्तों में' : (b.paymentPlan === 'FULL_PAYMENT' ? '1 बार में' : '3 किस्तों में')}
                    </span>
                  </td>

                  {/* Status Dropdown */}
                  <td className="px-6 py-4">
                    <select
                      value={b.status}
                      onChange={(e) => handleStatusChange(b.id, e.target.value as BookingStatus)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                        b.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
                        b.status === 'Pending' ? 'bg-amber-50 text-amber-800 border-amber-300' :
                        b.status === 'Completed' ? 'bg-blue-50 text-blue-800 border-blue-300' :
                        'bg-slate-100 text-slate-700 border-slate-300'
                      }`}
                    >
                      <option value="Pending">पेंडिंग (Pending)</option>
                      <option value="Confirmed">स्वीकृत (Confirmed)</option>
                      <option value="Completed">सम्पन्न (Completed)</option>
                      <option value="Cancelled">रद्द (Cancelled)</option>
                    </select>
                  </td>

                  {/* Action */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleDownloadPDF(b)}
                        className="p-1.5 bg-slate-100 hover:bg-emerald-50 text-emerald-800 hover:text-emerald-900 rounded-lg border border-slate-200 transition-colors cursor-pointer flex items-center gap-1 font-bold text-xs"
                        title="PDF रसीद डाउनलोड करें"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline text-[11px]">PDF</span>
                      </button>
                      <button
                        onClick={() => setEditingBooking({ ...b })}
                        className="p-1.5 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                        title="डेटा संशोधित करें (Edit)"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteBooking(b)}
                        className="p-1.5 bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                        title="बुकिंग डिलीट करें (Delete)"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setActiveBookingModal(b);
                          setCrewInput(b.assignedCrew || '');
                        }}
                        className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-lg font-bold text-xs transition-colors cursor-pointer"
                      >
                        रसीद
                      </button>
                    </div>
                  </td>

                </tr>
              ))}

              {filteredBookings.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    <AlertTriangle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="font-bold text-slate-800 text-sm">कोई बुकिंग नहीं मिली</p>
                    <p className="text-xs text-slate-500 mt-0.5">कृपया दूसरा नाम, मोबाइल या गांव खोजें।</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FULL BOOKING DETAILS MODAL & INVOICE */}
      {activeBookingModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div 
            className="relative bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold text-emerald-400 bg-slate-800 px-2.5 py-1 rounded">
                  {activeBookingModal.bookingNumber}
                </span>
                <h3 className="font-extrabold text-base text-white">
                  बुकिंग व डिलीवरी रसीद पर्ची (Invoice)
                </h3>
              </div>
              <button
                onClick={() => setActiveBookingModal(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs text-slate-800">
              
              {/* Top Status & Date Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">वर्तमान स्थिति</span>
                  <div className="mt-1">{getStatusBadge(activeBookingModal.status)}</div>
                </div>
                <div className="sm:text-right">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">किराया अवधि (Schedule)</span>
                  <strong className="text-slate-900 font-mono text-sm">
                    {activeBookingModal.startDate} से {activeBookingModal.endDate}
                  </strong>
                  <span className="text-slate-500 block text-[11px]">({activeBookingModal.totalDays} दिन)</span>
                </div>
              </div>

              {/* Reserved Tent & Equipment */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">बुक किया गया टेंट व सामान सूची</span>
                <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200/80 space-y-2">
                  <div className="flex justify-between items-center font-bold text-slate-900 text-sm">
                    <span className="flex items-center gap-2">
                      <Armchair className="w-4 h-4 text-emerald-700" />
                      {activeBookingModal.tentHindiName || activeBookingModal.tentName}
                    </span>
                    <span className="font-mono text-emerald-800">
                      ₹{activeBookingModal.baseRentTotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <p className="text-slate-600 text-xs">
                    जमीन: {activeBookingModal.surfaceType} • {activeBookingModal.guestCount} मेहमान क्षमता
                  </p>

                  {/* Addon Items */}
                  {activeBookingModal.addons && activeBookingModal.addons.length > 0 ? (
                    <div className="pt-2 border-t border-emerald-200/60 space-y-2">
                      <span className="text-[11px] font-bold text-slate-700 block">
                        शामिल अतिरिक्त सामान व बर्तन ({activeBookingModal.addons.length}):
                      </span>
                      {activeBookingModal.addons.map((add, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-white/80 rounded-xl border border-emerald-100 text-xs">
                          <div>
                            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                              <span>• {add.name}</span>
                              {add.hindiName && <span className="text-slate-500 font-normal">({add.hindiName})</span>}
                            </div>
                            <span className="text-[11px] text-slate-500 block mt-0.5">
                              मात्रा: <strong className="text-slate-800">{add.quantity} {add.unit}</strong> × {activeBookingModal.totalDays} दिन = <strong className="text-slate-900 font-mono">₹{(add.pricePerDay * add.quantity * activeBookingModal.totalDays).toLocaleString('en-IN')}</strong>
                            </span>
                          </div>

                          {/* Admin Quantity & Delete Controls */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg p-0.5">
                              <button
                                onClick={() => handleModifyBookingItemQty(activeBookingModal.id, add.id, add.quantity, -1)}
                                className="w-6 h-6 flex items-center justify-center text-slate-600 hover:text-red-700 hover:bg-white rounded transition-colors cursor-pointer"
                                title="मात्रा 1 कम करें"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-7 text-center font-mono font-bold text-xs text-slate-800">
                                {add.quantity}
                              </span>
                              <button
                                onClick={() => handleModifyBookingItemQty(activeBookingModal.id, add.id, add.quantity, 1)}
                                className="w-6 h-6 flex items-center justify-center text-slate-600 hover:text-emerald-700 hover:bg-white rounded transition-colors cursor-pointer"
                                title="मात्रा 1 बढ़ाएं"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            <button
                              onClick={() => handleDeleteItemFromBooking(activeBookingModal.id, add.id, add.name)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-200 transition-colors cursor-pointer"
                              title="यह सामान बुकिंग से पूरी तरह हटाएं"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="pt-2 border-t border-emerald-200/60 text-xs text-slate-500 italic">
                      कोई अतिरिक्त सामान (Addons) शामिल नहीं है।
                    </div>
                  )}
                </div>
              </div>

              {/* Village Multi-Stage Installment Ledger & Khata (गांव की 2/3 किश्तों की खतौनी) */}
              <div className="p-4 bg-emerald-950/5 rounded-2xl border border-emerald-200/90 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-emerald-200/60">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold">
                      <Banknote className="w-4 h-4" />
                    </span>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm">
                        गांव की किश्त खतौनी (Village Installment Ledger)
                      </h4>
                      <p className="text-[11px] text-slate-500">2 से 3 बार में भुगतान व्यवस्था व रसीद ट्रैकिंग</p>
                    </div>
                  </div>

                  {/* Plan Switcher */}
                  <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 uppercase px-1.5">प्लान:</span>
                    <button
                      type="button"
                      onClick={() => handleChangePlanInModal('3_INSTALLMENTS')}
                      className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        (activeBookingModal.paymentPlan || '3_INSTALLMENTS') === '3_INSTALLMENTS'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      3 किस्तों में
                    </button>
                    <button
                      type="button"
                      onClick={() => handleChangePlanInModal('2_INSTALLMENTS')}
                      className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        activeBookingModal.paymentPlan === '2_INSTALLMENTS'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      2 किस्तों में
                    </button>
                    <button
                      type="button"
                      onClick={() => handleChangePlanInModal('FULL_PAYMENT')}
                      className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        activeBookingModal.paymentPlan === 'FULL_PAYMENT'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      1 बार में
                    </button>
                  </div>
                </div>

                {/* Progress Bar & Summary */}
                <div className="grid grid-cols-3 gap-2 text-center pt-1">
                  <div className="p-2 bg-white rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 block uppercase">कुल बिल (Grand Total)</span>
                    <strong className="text-slate-900 font-mono text-sm">₹{activeBookingModal.grandTotal.toLocaleString('en-IN')}</strong>
                  </div>
                  <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-200">
                    <span className="text-[10px] text-emerald-700 block uppercase font-bold">जमा राशि (Paid)</span>
                    <strong className="text-emerald-800 font-mono text-sm">₹{(activeBookingModal.paidAmount || 0).toLocaleString('en-IN')}</strong>
                  </div>
                  <div className="p-2 bg-amber-50 rounded-xl border border-amber-200">
                    <span className="text-[10px] text-amber-700 block uppercase font-bold">बाकी राशि (Due)</span>
                    <strong className="text-amber-800 font-mono text-sm">
                      ₹{(activeBookingModal.balanceAmount !== undefined ? activeBookingModal.balanceAmount : Math.max(0, activeBookingModal.grandTotal - (activeBookingModal.paidAmount || 0))).toLocaleString('en-IN')}
                    </strong>
                  </div>
                </div>

                {/* Visual Progress */}
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.round(((activeBookingModal.paidAmount || 0) / (activeBookingModal.grandTotal || 1)) * 100))}%` }}
                  />
                </div>

                {/* Installment Items list */}
                <div className="space-y-2 pt-1">
                  {(activeBookingModal.installments || []).map((inst, idx) => {
                    const remaining = Math.max(0, inst.scheduledAmount - (inst.paidAmount || 0));
                    return (
                      <div 
                        key={inst.id || idx}
                        className={`p-3 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-all ${
                          inst.status === 'Paid' 
                            ? 'bg-emerald-50/60 border-emerald-200' 
                            : (inst.status === 'Partially Paid' 
                              ? 'bg-amber-50/60 border-amber-200' 
                              : 'bg-white border-slate-200')
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-xs">{inst.titleHindi}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              inst.status === 'Paid' ? 'bg-emerald-200 text-emerald-900' :
                              inst.status === 'Partially Paid' ? 'bg-amber-200 text-amber-900' :
                              'bg-slate-100 text-slate-700'
                            }`}>
                              {inst.status === 'Paid' ? 'पूर्ण जमा (Paid)' : (inst.status === 'Partially Paid' ? 'आंशिक जमा' : 'बाकी (Due)')}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500">{inst.description}</p>
                          <div className="flex items-center gap-3 text-[11px] pt-1">
                            <span className="text-slate-600">तय रकम: <strong className="font-mono text-slate-900">₹{inst.scheduledAmount.toLocaleString('en-IN')}</strong></span>
                            <span className="text-slate-300">•</span>
                            <span className="text-emerald-700 font-bold">जमा: <span className="font-mono">₹{(inst.paidAmount || 0).toLocaleString('en-IN')}</span></span>
                            {remaining > 0 && (
                              <>
                                <span className="text-slate-300">•</span>
                                <span className="text-amber-700 font-bold">बाकी: <span className="font-mono">₹{remaining.toLocaleString('en-IN')}</span></span>
                              </>
                            )}
                            {inst.paidDate && (
                              <>
                                <span className="text-slate-300">•</span>
                                <span className="text-slate-500 font-mono text-[10px]">📅 {inst.paidDate} ({inst.paymentMode || 'Cash'})</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Record Payment Button */}
                        <div className="shrink-0">
                          {inst.status !== 'Paid' ? (
                            <button
                              type="button"
                              onClick={() => handleOpenPaymentModal(activeBookingModal, inst)}
                              className="w-full sm:w-auto px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              <span>किस्त जमा करें (₹{remaining.toLocaleString('en-IN')})</span>
                            </button>
                          ) : (
                            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-3 py-1.5 rounded-xl flex items-center gap-1">
                              <CheckCheck className="w-3.5 h-3.5 text-emerald-700" />
                              <span>पूर्ण चुकता</span>
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Quick Add Custom Payment Button */}
                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleOpenPaymentModal(activeBookingModal)}
                    className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-emerald-600" />
                    <span>अन्य / कस्टम राशि जमा करें</span>
                  </button>
                </div>
              </div>

              {/* Venue & Customer Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-emerald-600" />
                    ग्राहक विवरण (Customer Details)
                  </span>
                  <p className="font-bold text-slate-900 text-sm">{activeBookingModal.customerName}</p>
                  <p className="text-slate-600 flex items-center gap-1.5"><Phone className="w-3 h-3 text-slate-400" /> {activeBookingModal.customerPhone}</p>
                  <p className="text-slate-600 flex items-center gap-1.5"><Mail className="w-3 h-3 text-slate-400" /> {activeBookingModal.customerEmail || 'ईमेल उपलब्ध नहीं'}</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    डिलीवरी स्थल / गांव का पता
                  </span>
                  <p className="font-bold text-slate-900">{activeBookingModal.villageOrCity}</p>
                  {activeBookingModal.landmark && (
                    <p className="text-xs text-slate-600">लैंडमार्क: {activeBookingModal.landmark}</p>
                  )}
                  <p className="text-slate-600">{activeBookingModal.deliveryAddress}</p>
                  {activeBookingModal.specialInstructions && (
                    <p className="text-[11px] text-slate-800 italic bg-amber-50 p-2 rounded border border-amber-200">
                      नोट: "{activeBookingModal.specialInstructions}"
                    </p>
                  )}
                </div>
              </div>

              {/* Rigging Crew Assignment */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                  टेंट कारीगर व टीम लीडर असाइन करें (Assign Setup Crew)
                </span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="जैसे: टेंट टीम 1 (लीडर: करन यादव - 8418067579)"
                    value={crewInput}
                    onChange={(e) => setCrewInput(e.target.value)}
                    className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-900"
                  />
                  <button
                    onClick={() => handleSaveCrew(activeBookingModal.id)}
                    className="px-4 py-2 bg-slate-900 hover:bg-black text-white rounded-xl font-bold text-xs cursor-pointer"
                  >
                    सुरक्षित करें
                  </button>
                </div>
              </div>

              {/* Itemized Invoicing Breakdown */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>टेंट किराया ({activeBookingModal.totalDays} दिन):</span>
                  <span className="font-mono">₹{activeBookingModal.baseRentTotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>सामान किराया (बैठने/सजावट/हलवाई बर्तन):</span>
                  <span className="font-mono">₹{activeBookingModal.addonsTotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>ट्रांसपोर्ट व कारीगर लगाने-खोलने का खर्च:</span>
                  <span className="font-mono">₹{activeBookingModal.transportSetupFee.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>सुरक्षा अग्रिम राशि (Refundable Deposit):</span>
                  <span className="font-mono">₹{activeBookingModal.securityDeposit.toLocaleString('en-IN')}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between font-extrabold text-sm text-slate-900">
                  <span>कुल देय राशि ({activeBookingModal.paymentMethod}):</span>
                  <span className="text-emerald-800 font-mono text-base">₹{activeBookingModal.grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

            </div>

            {/* Modal Actions */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap justify-between items-center gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setEditingBooking({ ...activeBookingModal });
                  }}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>डेटा एडिट करें (Edit Data)</span>
                </button>

                <button
                  onClick={() => handleDeleteBooking(activeBookingModal)}
                  className="px-3 py-2 bg-white border border-red-300 hover:bg-red-50 text-red-700 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>डिलीट</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownloadPDF(activeBookingModal)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer shadow-xs"
                  title="PDF इनवॉइस फाइल डाउनलोड करें"
                >
                  <Download className="w-4 h-4" />
                  PDF डाउनलोड करें (Download PDF)
                </button>

                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-slate-600" />
                  प्रिंट रसीद (Print)
                </button>

                <button
                  onClick={() => setActiveBookingModal(null)}
                  className="px-5 py-2 bg-slate-900 hover:bg-black text-white rounded-xl font-bold text-xs cursor-pointer"
                >
                  बंद करें
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* POPUP: RECORD INSTALLMENT PAYMENT MODAL */}
      {recordPayModalOpen && activeBookingModal && (
        <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div 
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">
                    किश्त भुगतान दर्ज करें (Record Payment)
                  </h4>
                  <p className="text-xs text-slate-500">बुकिंग #{activeBookingModal.bookingNumber} • {activeBookingModal.customerName}</p>
                </div>
              </div>
              <button
                onClick={() => setRecordPayModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitRecordPayment} className="space-y-3.5 text-xs text-slate-800">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  भुगतान राशि (Amount in ₹) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={payAmountInput}
                  onChange={(e) => setPayAmountInput(Number(e.target.value))}
                  className="w-full bg-emerald-50 border border-emerald-300 rounded-xl px-3 py-2.5 text-base font-extrabold font-mono text-emerald-950 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    भुगतान माध्यम (Mode) *
                  </label>
                  <select
                    value={payModeInput}
                    onChange={(e) => setPayModeInput(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="Cash">💵 नकद (Cash)</option>
                    <option value="UPI">📱 UPI / PhonePe / GPay</option>
                    <option value="Bank Transfer">🏦 बैंक ट्रांसफर (NEFT/IMPS)</option>
                    <option value="Cheque">📜 चेक (Cheque)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    प्राप्ति तिथि (Date) *
                  </label>
                  <input
                    type="date"
                    required
                    value={payDateInput}
                    onChange={(e) => setPayDateInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  रसीद नोट / टिप्पणी (Note)
                </label>
                <input
                  type="text"
                  placeholder="उदा: साई/बयाना प्राप्त या टेंट लगाने पर नकद"
                  value={payNoteInput}
                  onChange={(e) => setPayNoteInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRecordPayModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 cursor-pointer"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>भुगतान दर्ज करें व रसीद अपडेट करें</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FULL BOOKING EDITING FORM MODAL */}
      {editingBooking && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div 
            className="relative bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 bg-emerald-950 text-white flex items-center justify-between border-b border-emerald-900">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Edit className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">
                    बुकिंग डेटा संशोधन (Edit Booking: {editingBooking.bookingNumber})
                  </h3>
                  <p className="text-[11px] text-emerald-400">ग्राहक, गांव, कार्यक्रम तारीखें व मूल्य विवरण संशोधित करें</p>
                </div>
              </div>
              <button
                onClick={() => setEditingBooking(null)}
                className="w-7 h-7 rounded-full bg-emerald-900 hover:bg-emerald-800 text-emerald-200 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveEditedBooking} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs text-slate-800">
              
              {/* Customer Info Section */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <span className="font-bold uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-emerald-600" />
                  ग्राहक विवरण (Customer Info)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">ग्राहक का नाम *</label>
                    <input
                      type="text"
                      required
                      value={editingBooking.customerName}
                      onChange={(e) => setEditingBooking({ ...editingBooking, customerName: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">मोबाइल नंबर *</label>
                    <input
                      type="text"
                      required
                      value={editingBooking.customerPhone}
                      onChange={(e) => setEditingBooking({ ...editingBooking, customerPhone: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">ईमेल पता</label>
                    <input
                      type="email"
                      value={editingBooking.customerEmail}
                      onChange={(e) => setEditingBooking({ ...editingBooking, customerEmail: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Event & Location Section */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <span className="font-bold uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  कार्यक्रम व गांव / स्थल विवरण (Event & Venue)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">आयोजन प्रकार (Event Type)</label>
                    <input
                      type="text"
                      value={editingBooking.eventType}
                      onChange={(e) => setEditingBooking({ ...editingBooking, eventType: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">अनुमानित मेहमान संख्या</label>
                    <input
                      type="number"
                      value={editingBooking.guestCount}
                      onChange={(e) => setEditingBooking({ ...editingBooking, guestCount: Number(e.target.value) })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">जमीन प्रकार (Surface Type)</label>
                    <input
                      type="text"
                      value={editingBooking.surfaceType}
                      onChange={(e) => setEditingBooking({ ...editingBooking, surfaceType: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">गांव / शहर / कस्बा</label>
                    <input
                      type="text"
                      value={editingBooking.villageOrCity}
                      onChange={(e) => setEditingBooking({ ...editingBooking, villageOrCity: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">लैंडमार्क (पहचान स्थल)</label>
                    <input
                      type="text"
                      value={editingBooking.landmark}
                      onChange={(e) => setEditingBooking({ ...editingBooking, landmark: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 mb-1">पूरा डिलीवरी पता</label>
                  <input
                    type="text"
                    value={editingBooking.deliveryAddress}
                    onChange={(e) => setEditingBooking({ ...editingBooking, deliveryAddress: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Schedule Dates & Status */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <span className="font-bold uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
                  <CalendarCheck className="w-3.5 h-3.5 text-emerald-600" />
                  तारीखें व स्थिति (Dates & Status)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">शुरू तारीख (Start Date)</label>
                    <input
                      type="date"
                      value={editingBooking.startDate}
                      onChange={(e) => setEditingBooking({ ...editingBooking, startDate: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">समाप्ति तारीख (End Date)</label>
                    <input
                      type="date"
                      value={editingBooking.endDate}
                      onChange={(e) => setEditingBooking({ ...editingBooking, endDate: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">कुल दिन (Days)</label>
                    <input
                      type="number"
                      min="1"
                      value={editingBooking.totalDays}
                      onChange={(e) => setEditingBooking({ ...editingBooking, totalDays: Number(e.target.value) })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">बुकिंग स्थिति (Order Status)</label>
                    <select
                      value={editingBooking.status}
                      onChange={(e) => setEditingBooking({ ...editingBooking, status: e.target.value as BookingStatus })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      <option value="Pending">पेंडिंग (Pending)</option>
                      <option value="Confirmed">स्वीकृत (Confirmed)</option>
                      <option value="Completed">सम्पन्न (Completed)</option>
                      <option value="Cancelled">रद्द (Cancelled)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">भुगतान योजना (Village Plan)</label>
                    <select
                      value={editingBooking.paymentPlan || '3_INSTALLMENTS'}
                      onChange={(e) => setEditingBooking({ ...editingBooking, paymentPlan: e.target.value as PaymentPlanType })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      <option value="3_INSTALLMENTS">3 किस्तों में (Advance + Setup + Final)</option>
                      <option value="2_INSTALLMENTS">2 किस्तों में (Advance + Setup Day)</option>
                      <option value="FULL_PAYMENT">1 बार में (Full Payment)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">भुगतान स्थिति (Status)</label>
                    <select
                      value={editingBooking.paymentStatus}
                      onChange={(e) => setEditingBooking({ ...editingBooking, paymentStatus: e.target.value as any })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      <option value="Unpaid">Unpaid (भुगतान बाकी)</option>
                      <option value="Partially Paid">Partially Paid (आंशिक जमा)</option>
                      <option value="Advance Paid">Advance Paid (अग्रिम प्राप्त)</option>
                      <option value="Full Paid">Full Paid (पूरा भुगतान प्राप्त)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Rigging & Assigned Crew */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">असाइन कारीगर टीम (Setup Crew)</label>
                  <input
                    type="text"
                    value={editingBooking.assignedCrew || ''}
                    onChange={(e) => setEditingBooking({ ...editingBooking, assignedCrew: e.target.value })}
                    placeholder="जैसे: टेंट टीम 1 (लीडर: करन यादव)"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Booked Addons Management (Delete / Adjust Quantities) */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold uppercase text-slate-700 tracking-wider flex items-center gap-1.5 text-xs">
                    <Utensils className="w-3.5 h-3.5 text-emerald-600" />
                    शामिल सामान व बर्तन (Addons Item List)
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    (सामान हटाएं या मात्रा बदलें)
                  </span>
                </div>

                {editingBooking.addons && editingBooking.addons.length > 0 ? (
                  <div className="space-y-2">
                    {editingBooking.addons.map((add, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200 gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-xs text-slate-900 truncate">• {add.name}</p>
                          <p className="text-[11px] text-slate-500 font-mono">
                            ₹{add.pricePerDay}/{add.unit} × {add.quantity} {add.unit} × {editingBooking.totalDays} दिन = ₹{(add.pricePerDay * add.quantity * editingBooking.totalDays).toLocaleString('en-IN')}
                          </p>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <div className="flex items-center bg-slate-100 border border-slate-200 rounded-lg p-0.5">
                            <button
                              type="button"
                              onClick={() => {
                                const newQty = add.quantity - 1;
                                if (newQty <= 0) {
                                  const updatedAddons = editingBooking.addons.filter(a => a.id !== add.id);
                                  const addonsTotal = updatedAddons.reduce((sum, a) => sum + (a.pricePerDay * a.quantity * editingBooking.totalDays), 0);
                                  const grandTotal = editingBooking.baseRentTotal + addonsTotal + editingBooking.transportSetupFee + editingBooking.securityDeposit;
                                  setEditingBooking({ ...editingBooking, addons: updatedAddons, addonsTotal, grandTotal });
                                } else {
                                  const updatedAddons = editingBooking.addons.map(a => a.id === add.id ? { ...a, quantity: newQty } : a);
                                  const addonsTotal = updatedAddons.reduce((sum, a) => sum + (a.pricePerDay * a.quantity * editingBooking.totalDays), 0);
                                  const grandTotal = editingBooking.baseRentTotal + addonsTotal + editingBooking.transportSetupFee + editingBooking.securityDeposit;
                                  setEditingBooking({ ...editingBooking, addons: updatedAddons, addonsTotal, grandTotal });
                                }
                              }}
                              className="w-6 h-6 flex items-center justify-center text-slate-600 hover:text-red-700 hover:bg-white rounded transition-colors cursor-pointer"
                              title="मात्रा घटाएं"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-7 text-center font-mono font-bold text-xs text-slate-800">
                              {add.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                const newQty = add.quantity + 1;
                                const updatedAddons = editingBooking.addons.map(a => a.id === add.id ? { ...a, quantity: newQty } : a);
                                const addonsTotal = updatedAddons.reduce((sum, a) => sum + (a.pricePerDay * a.quantity * editingBooking.totalDays), 0);
                                const grandTotal = editingBooking.baseRentTotal + addonsTotal + editingBooking.transportSetupFee + editingBooking.securityDeposit;
                                setEditingBooking({ ...editingBooking, addons: updatedAddons, addonsTotal, grandTotal });
                              }}
                              className="w-6 h-6 flex items-center justify-center text-slate-600 hover:text-emerald-700 hover:bg-white rounded transition-colors cursor-pointer"
                              title="मात्रा बढ़ाएं"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              const updatedAddons = editingBooking.addons.filter(a => a.id !== add.id);
                              const addonsTotal = updatedAddons.reduce((sum, a) => sum + (a.pricePerDay * a.quantity * editingBooking.totalDays), 0);
                              const grandTotal = editingBooking.baseRentTotal + addonsTotal + editingBooking.transportSetupFee + editingBooking.securityDeposit;
                              setEditingBooking({ ...editingBooking, addons: updatedAddons, addonsTotal, grandTotal });
                            }}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-200 transition-colors cursor-pointer"
                            title="बुकिंग से हटाएं"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">इस बुकिंग में कोई अतिरिक्त सामान नहीं है।</p>
                )}
              </div>

              {/* Financials Breakdown (Pricing Override) */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <span className="font-bold uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
                  <span className="font-mono">₹</span>
                  किराया व बिल गणना (Financials Override)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">टेंट किराया (₹)</label>
                    <input
                      type="number"
                      value={editingBooking.baseRentTotal}
                      onChange={(e) => {
                        const base = Number(e.target.value);
                        const grand = base + editingBooking.addonsTotal + editingBooking.transportSetupFee + editingBooking.securityDeposit;
                        setEditingBooking({ ...editingBooking, baseRentTotal: base, grandTotal: grand });
                      }}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">सामान किराया (₹)</label>
                    <input
                      type="number"
                      value={editingBooking.addonsTotal}
                      onChange={(e) => {
                        const addons = Number(e.target.value);
                        const grand = editingBooking.baseRentTotal + addons + editingBooking.transportSetupFee + editingBooking.securityDeposit;
                        setEditingBooking({ ...editingBooking, addonsTotal: addons, grandTotal: grand });
                      }}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">ट्रांसपोर्ट खर्च (₹)</label>
                    <input
                      type="number"
                      value={editingBooking.transportSetupFee}
                      onChange={(e) => {
                        const transport = Number(e.target.value);
                        const grand = editingBooking.baseRentTotal + editingBooking.addonsTotal + transport + editingBooking.securityDeposit;
                        setEditingBooking({ ...editingBooking, transportSetupFee: transport, grandTotal: grand });
                      }}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">कुल बिल Grand (₹)</label>
                    <input
                      type="number"
                      value={editingBooking.grandTotal}
                      onChange={(e) => setEditingBooking({ ...editingBooking, grandTotal: Number(e.target.value) })}
                      className="w-full bg-emerald-50 border border-emerald-400 rounded-xl px-3 py-2 text-emerald-950 font-mono font-extrabold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Special instructions */}
              <div>
                <label className="block font-semibold text-slate-600 mb-1">विशेष निर्देश / नोट</label>
                <textarea
                  rows={2}
                  value={editingBooking.specialInstructions || ''}
                  onChange={(e) => setEditingBooking({ ...editingBooking, specialInstructions: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingBooking(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 cursor-pointer"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>संशोधित बुकिंग सुरक्षित करें</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
                