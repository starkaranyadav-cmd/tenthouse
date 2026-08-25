import React, { useState } from 'react';
import { Booking } from '../../types';
import { findBookingsByQuery } from '../../services/storageService';
import { Search, CalendarCheck, X, CheckCircle2, Clock, AlertTriangle, Phone, Mail, MapPin, Printer } from 'lucide-react';

interface BookingLookupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BookingLookupModal: React.FC<BookingLookupModalProps> = ({
  isOpen,
  onClose
}) => {
  const [query, setQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [results, setResults] = useState<Booking[]>([]);

  if (!isOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    const found = findBookingsByQuery(query);
    setResults(found);
    setHasSearched(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">स्वीकृत (Confirmed)</span>;
      case 'Pending':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">पेंडिंग (Pending)</span>;
      case 'Completed':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">सम्पन्न (Completed)</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-200 text-slate-700">रद्द (Cancelled)</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      
      {/* Modal Container */}
      <div 
        className="relative bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-white">टेंट बुकिंग स्थिति खोजें (Track Booking)</h3>
              <p className="text-xs text-slate-400">बुकिंग नंबर, ग्राहक का नाम, मोबाइल या गांव से स्टेटस चेक करें</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          <form onSubmit={handleSearch} className="space-y-3">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              बुकिंग नंबर, मोबाइल नंबर या नाम दर्ज करें
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="जैसे: TH-94821 या 8418067579 या करन..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                खोजें (Search)
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              डेमो जांचने के लिए ट्राय करें: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700 font-mono">TH-94821</code> या <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700 font-mono">TH-94822</code>
            </p>
          </form>

          {/* Search Results */}
          {hasSearched && (
            <div className="space-y-4 pt-2 border-t border-slate-200">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                खोज परिणाम ({results.length})
              </span>

              {results.length > 0 ? (
                results.map(b => (
                  <div key={b.id} className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
                      <div>
                        <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                          {b.bookingNumber}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm mt-1">{b.tentName}</h4>
                      </div>
                      <div>{getStatusBadge(b.status)}</div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase">तारीख व अवधि</span>
                        <strong className="text-slate-800 font-mono">{b.startDate} से {b.endDate}</strong>
                        <span className="text-slate-500 block text-[11px]">({b.totalDays} दिन)</span>
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase">डिलीवरी स्थल / गांव</span>
                        <strong className="text-slate-800">{b.villageOrCity}</strong>
                        <span className="text-slate-500 block text-[11px] truncate">{b.deliveryAddress}</span>
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase">ग्राहक व संपर्क</span>
                        <span className="font-medium text-slate-800">{b.customerName}</span>
                        <span className="text-slate-500 block text-[11px]">{b.customerPhone}</span>
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase">कुल बिल (Total Bill)</span>
                        <strong className="text-emerald-800 font-mono text-sm">₹{b.grandTotal.toLocaleString('en-IN')}</strong>
                        <span className="text-slate-500 block text-[11px]">{b.paymentStatus}</span>
                      </div>
                    </div>

                    {b.addons && b.addons.length > 0 && (
                      <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-xs">
                        <strong className="text-slate-800 block text-[11px] mb-1">शामिल सामान:</strong>
                        <div className="flex flex-wrap gap-1.5">
                          {b.addons.map((add, i) => (
                            <span key={i} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px]">
                              {add.name} ({add.quantity} {add.unit})
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {b.assignedCrew && (
                      <div className="bg-emerald-50 text-emerald-800 p-2.5 rounded-xl text-xs border border-emerald-200 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span><strong>असाइन की गई टेंट कारीगर टीम:</strong> {b.assignedCrew}</span>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-8 bg-slate-50 rounded-2xl text-center border border-dashed border-slate-300">
                  <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-800">"{query}" के लिए कोई बुकिंग नहीं मिली</p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    कृपया सही बुकिंग नंबर, मोबाइल नंबर अथवा नाम दर्ज करें।
                  </p>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
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
