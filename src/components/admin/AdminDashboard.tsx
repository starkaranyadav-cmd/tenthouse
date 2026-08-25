import React from 'react';
import { Tent, Booking, BookingStatus, AdminUser, TentAddon } from '../../types';
import { 
  CalendarCheck, Clock, CheckCircle2, AlertTriangle, 
  Plus, Tent as TentIcon, Users, ArrowUpRight, ShieldCheck, 
  Settings, KeyRound, Download, Sparkles, ChevronRight, Armchair, Utensils, Zap, Database
} from 'lucide-react';
import { updateBookingStatus } from '../../services/storageService';

interface AdminDashboardProps {
  adminUser: AdminUser;
  tents: Tent[];
  addons: TentAddon[];
  bookings: Booking[];
  onNavigateTab: (tab: 'dashboard' | 'tents' | 'bookings' | 'addons' | 'settings' | 'django') => void;
  onOpenAddTentModal: () => void;
  onOpenAddAddonModal: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  adminUser,
  tents,
  addons,
  bookings,
  onNavigateTab,
  onOpenAddTentModal,
  onOpenAddAddonModal
}) => {
  // Compute key KPI metrics
  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter(b => b.status === 'Pending').length;
  const confirmedBookings = bookings.filter(b => b.status === 'Confirmed').length;
  const completedBookings = bookings.filter(b => b.status === 'Completed').length;
  
  const totalRevenue = bookings
    .filter(b => b.status !== 'Cancelled')
    .reduce((sum, b) => sum + b.grandTotal, 0);

  const totalFleetUnits = tents.reduce((sum, t) => sum + t.stockQuantity, 0);

  const handleExportJSON = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      tents,
      addons,
      bookings
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tenthouse_database_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleStatusChange = (bookingId: string, newStatus: BookingStatus) => {
    updateBookingStatus(bookingId, newStatus);
  };

  return (
    <div className="space-y-8">
      
      {/* Welcome & Quick Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            प्रबंधक: {adminUser.name} ({adminUser.role})
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            टेंट हाउस ऑपरेशंस व बुकिंग डैशबोर्ड
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onOpenAddTentModal}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            नया टेंट जोड़ें
          </button>
          <button
            onClick={() => onNavigateTab('inventory')}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Armchair className="w-4 h-4 text-amber-600" />
            सामान सूची (बैठने/सजावट/बर्तन)
          </button>
          <button
            onClick={handleExportJSON}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer"
            title="डेटाबेस JSON बैकअप डाउनलोड करें"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total Revenue */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">कुल बुकिंग वैल्यू</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold text-lg">
              ₹
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
              ₹{totalRevenue.toLocaleString('en-IN')}
            </span>
          </div>
          <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            कुल {totalBookings} ग्राहक बुकिंग्स
          </p>
        </div>

        {/* Pending Requests */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">पेंडिंग बुकिंग्स</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-mono">{pendingBookings}</span>
            <span className="text-xs text-slate-500">पुष्टि हेतु शेष</span>
          </div>
          <button
            onClick={() => onNavigateTab('bookings')}
            className="text-[11px] text-emerald-700 hover:underline font-bold flex items-center gap-1 cursor-pointer"
          >
            बुकिंग्स देखें →
          </button>
        </div>

        {/* Active Confirmed */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">स्वीकृत बुकिंग्स</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-mono">{confirmedBookings}</span>
            <span className="text-xs text-slate-500">शेड्यूल कार्यक्रम</span>
          </div>
          <p className="text-[11px] text-slate-500">
            {completedBookings} पिछले सफल आयोजन
          </p>
        </div>

        {/* Active Fleet Capacity */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">टेंट व सामान इन्वेंटरी</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center">
              <TentIcon className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-mono">{totalFleetUnits}</span>
            <span className="text-xs text-slate-500">टेंट + {addons.length} सामान आइटम्स</span>
          </div>
          <p className="text-[11px] text-slate-500">
            बैठने, सजावट व हलवाई बर्तन उपलब्ध
          </p>
        </div>

      </div>

      {/* Recent Bookings Live Stream */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-extrabold text-lg text-slate-900">हाल की बुकिंग्स (Recent Orders Feed)</h3>
            <p className="text-xs text-slate-500">ग्राहकों द्वारा सीधे वेबसाइट से बुक किए गए टेंट व कार्यक्रम</p>
          </div>

          <button
            onClick={() => onNavigateTab('bookings')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
          >
            सभी {bookings.length} बुकिंग्स देखें
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">बुकिंग नंबर / टेंट</th>
                <th className="px-6 py-3.5">ग्राहक व स्थान</th>
                <th className="px-6 py-3.5">तारीख व दिन</th>
                <th className="px-6 py-3.5">कुल बिल</th>
                <th className="px-6 py-3.5">स्थिति (Status)</th>
                <th className="px-6 py-3.5 text-right">त्वरित एक्शन</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {bookings.slice(0, 5).map(b => (
                <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                  
                  {/* Tent info */}
                  <td className="px-6 py-4">
                    <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                      {b.bookingNumber}
                    </span>
                    <strong className="block text-slate-900 text-xs mt-1">{b.tentName}</strong>
                    <span className="text-[10px] text-slate-500">{b.tentCategory}</span>
                  </td>

                  {/* Customer */}
                  <td className="px-6 py-4">
                    <span className="font-bold text-slate-900 block">{b.customerName}</span>
                    <span className="text-slate-600 text-[11px]">{b.customerPhone}</span>
                    <span className="text-slate-400 text-[10px] block truncate max-w-[180px]">{b.villageOrCity}</span>
                  </td>

                  {/* Dates */}
                  <td className="px-6 py-4">
                    <span className="font-mono text-slate-800 block">{b.startDate} से {b.endDate}</span>
                    <span className="text-slate-500 text-[10px]">{b.totalDays} दिन ({b.guestCount} मेहमान)</span>
                  </td>

                  {/* Amount */}
                  <td className="px-6 py-4">
                    <span className="font-mono font-bold text-slate-900 text-sm block">
                      ₹{b.grandTotal.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-semibold">{b.paymentStatus}</span>
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
                      <option value="Pending">पेंडिंग</option>
                      <option value="Confirmed">स्वीकृत</option>
                      <option value="Completed">पूर्ण</option>
                      <option value="Cancelled">रद्द</option>
                    </select>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => onNavigateTab('bookings')}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                    >
                      विवरण
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Settings & Super Admin Gateway Card */}
      <div className="p-6 bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl border border-slate-700/80 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-base text-white">सुपर एडमिन सुरक्षा व डेटा सेटिंग्स</h4>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                सुरक्षित ज़ोन
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              सुपर एडमिन पासवर्ड रीसेट/बदलें, डेटा बैकअप डाउनलोड, और डेटा डिलीट (Delete) सेटिंग्स के अंदर से सुरक्षित रूप से प्रबंधित करें।
            </p>
          </div>
        </div>
        <button
          onClick={() => onNavigateTab('settings')}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer shrink-0"
        >
          <KeyRound className="w-4 h-4" />
          सेटिंग्स व डेटा नियंत्रण खोलें
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
};
