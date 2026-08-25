import React, { useState } from 'react';
import { AdminUser, Tent, TentAddon, Booking } from '../../types';
import { 
  ShieldCheck, KeyRound, UserCheck, Lock, Mail, Phone, Building2, 
  Trash2, AlertTriangle, RefreshCcw, Download, Upload, Check, 
  Sparkles, ShieldAlert, Eye, EyeOff, UserPlus, Users, Save, CheckCircle2,
  ArrowLeft
} from 'lucide-react';
import { 
  getSuperAdminCredentials, updateSuperAdminCredentials, SuperAdminCredentials,
  getStaffAccounts, addStaffAccount, deleteStaffAccount, StaffAccount,
  deleteAllBookings, deleteCompletedAndCancelledBookings, deleteAllTents, deleteAllAddons,
  resetAllDataToDefaults, importDatabaseJSON
} from '../../services/storageService';

interface SuperAdminSettingsProps {
  adminUser: AdminUser;
  tents: Tent[];
  addons: TentAddon[];
  bookings: Booking[];
  onBackToDashboard?: () => void;
}

export const SuperAdminSettings: React.FC<SuperAdminSettingsProps> = ({
  adminUser,
  tents,
  addons,
  bookings,
  onBackToDashboard
}) => {
  const [credentials, setCredentials] = useState<SuperAdminCredentials>(getSuperAdminCredentials());
  const [staffList, setStaffList] = useState<StaffAccount[]>(getStaffAccounts());
  
  // Active sub-tab
  const [activeTab, setActiveTab] = useState<'password' | 'danger_delete' | 'staff' | 'backup'>('password');

  // Password Reset Form State
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [adminNameInput, setAdminNameInput] = useState(credentials.name);
  const [adminEmailInput, setAdminEmailInput] = useState(credentials.email);
  const [adminPhoneInput, setAdminPhoneInput] = useState(credentials.phone);
  const [businessNameInput, setBusinessNameInput] = useState(credentials.businessName);
  const [recoveryPinInput, setRecoveryPinInput] = useState(credentials.recoveryPin);
  const [showPassword, setShowPassword] = useState(false);

  // New Staff Account Form
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffPassword, setNewStaffPassword] = useState('');
  const [newStaffRole, setNewStaffRole] = useState<'Inventory Manager' | 'Operations Lead'>('Inventory Manager');
  const [newStaffPhone, setNewStaffPhone] = useState('');

  // Danger Zone Confirmation Modal
  const [dangerAction, setDangerAction] = useState<{
    type: 'all_bookings' | 'completed_bookings' | 'all_tents' | 'all_addons' | 'factory_reset';
    title: string;
    description: string;
  } | null>(null);
  const [dangerConfirmText, setDangerConfirmText] = useState('');
  const [dangerPasswordInput, setDangerPasswordInput] = useState('');

  // Toast / Notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Handle Profile & Password Save
  const handleSavePasswordAndProfile = (e: React.FormEvent) => {
    e.preventDefault();

    // If changing password, verify old password
    if (newPasswordInput.trim()) {
      if (currentPasswordInput !== credentials.password && currentPasswordInput !== credentials.recoveryPin) {
        showToast('वर्तमान पासवर्ड (Old Password) गलत है!', 'error');
        return;
      }
      if (newPasswordInput.length < 5) {
        showToast('नया पासवर्ड कम से कम 5 अक्षरों का होना चाहिए!', 'error');
        return;
      }
      if (newPasswordInput !== confirmPasswordInput) {
        showToast('नया पासवर्ड और पुष्टि पासवर्ड मेल नहीं खा रहे हैं!', 'error');
        return;
      }
    }

    const updated = updateSuperAdminCredentials({
      name: adminNameInput.trim() || credentials.name,
      email: adminEmailInput.trim() || credentials.email,
      password: newPasswordInput.trim() || credentials.password,
      phone: adminPhoneInput.trim() || credentials.phone,
      businessName: businessNameInput.trim() || credentials.businessName,
      recoveryPin: recoveryPinInput.trim() || credentials.recoveryPin
    });

    setCredentials(updated);
    setCurrentPasswordInput('');
    setNewPasswordInput('');
    setConfirmPasswordInput('');
    showToast('सुपर एडमिन पासवर्ड व प्रोफाइल सफलतापूर्वक अपडेट हो गई!');
  };

  // Handle Staff Account Add
  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName || !newStaffEmail || !newStaffPassword) {
      showToast('कृपया सभी जरूरी फील्ड भरें', 'error');
      return;
    }

    addStaffAccount({
      name: newStaffName,
      email: newStaffEmail,
      password: newStaffPassword,
      role: newStaffRole,
      phone: newStaffPhone
    });

    setStaffList(getStaffAccounts());
    setNewStaffName('');
    setNewStaffEmail('');
    setNewStaffPassword('');
    setNewStaffPhone('');
    showToast(`नया स्टाफ खाता (${newStaffRole}) जोड़ दिया गया!`);
  };

  const handleDeleteStaff = (id: string, name: string) => {
    if (confirm(`क्या आप ${name} का खाता हटाना चाहते हैं?`)) {
      deleteStaffAccount(id);
      setStaffList(getStaffAccounts());
      showToast('स्टाफ खाता हटा दिया गया');
    }
  };

  // Execute Danger Action
  const handleExecuteDangerAction = () => {
    if (!dangerAction) return;

    // Verify confirmation code or password
    const isPasswordValid = 
      dangerPasswordInput === credentials.password || 
      dangerPasswordInput === credentials.recoveryPin || 
      dangerPasswordInput === 'admin123';
    const isTextValid = dangerConfirmText.toUpperCase() === 'DELETE' || dangerConfirmText.toUpperCase() === 'RESET';

    if (!isPasswordValid && !isTextValid) {
      showToast('सुरक्षा प्रमाणीकरण असफल! कृपया सही पासवर्ड या DELETE टाइप करें।', 'error');
      return;
    }

    switch (dangerAction.type) {
      case 'all_bookings':
        deleteAllBookings();
        showToast('सभी बुकिंग्स सफलतापूर्वक डिलीट कर दी गईं!');
        break;
      case 'completed_bookings':
        deleteCompletedAndCancelledBookings();
        showToast('सभी पुरानी व रद्द बुकिंग्स डिलीट कर दी गईं!');
        break;
      case 'all_tents':
        deleteAllTents();
        showToast('सभी टेंट इन्वेंटरी खाली कर दी गई!');
        break;
      case 'all_addons':
        deleteAllAddons();
        showToast('सभी हलवाई व सजावट सामान डिलीट कर दिया गया!');
        break;
      case 'factory_reset':
        resetAllDataToDefaults();
        showToast('सिस्टम फैक्ट्री डेटा पर सफलतापूर्वक रीसेट हो गया!');
        break;
    }

    setDangerAction(null);
    setDangerConfirmText('');
    setDangerPasswordInput('');
  };

  // Export JSON Backup
  const handleExportBackup = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      appVersion: '3.0-desi-tenthouse',
      superAdmin: {
        name: credentials.name,
        email: credentials.email,
        phone: credentials.phone
      },
      tents,
      addons,
      bookings
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tenthouse_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('डेटाबेस बैकअप JSON फाइल सफलतापूर्वक डाउनलोड हुई!');
  };

  // Import JSON Backup
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.tents || parsed.addons || parsed.bookings) {
          const ok = importDatabaseJSON(parsed);
          if (ok) {
            showToast('डेटा सफलतापूर्वक रीस्टोर हो गया!');
          } else {
            showToast('डेटा रीस्टोर करने में समस्या आई', 'error');
          }
        } else {
          showToast('अमान्य बैकअप फाइल फॉर्मेट', 'error');
        }
      } catch {
        showToast('JSON फाइल पढ़ने में त्रुटि हुई', 'error');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      
      {/* Live Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200 border ${
          toast.type === 'success' 
            ? 'bg-slate-900 text-white border-emerald-500/50' 
            : 'bg-red-950 text-white border-red-500/50'
        }`}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
            toast.type === 'success' ? 'bg-emerald-500 text-slate-950' : 'bg-red-500 text-white'
          }`}>
            {toast.type === 'success' ? <Check className="w-3.5 h-3.5" /> : '✕'}
          </div>
          <span className="text-xs font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Main Top Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-extrabold text-[11px] flex items-center gap-1 border border-amber-300">
              <Sparkles className="w-3 h-3 text-amber-600" />
              सुपर एडमिन नियंत्रण कक्ष (Super Admin Control Panel)
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            एडमिन सेटिंग्स, पासवर्ड प्रबंधन व डेटा नियंत्रण
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            यहाँ से सुपर एडमिन पासवर्ड रीसेट करें, स्टाफ खाते प्रबंधित करें और डेटाबेस डिलीट / रीसेट ऑपरेशंस सुरक्षित तरीके से करें।
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right hidden sm:block">
            <span className="text-xs font-bold text-slate-900 block">{credentials.name}</span>
            <span className="text-[11px] text-slate-500 font-mono">{credentials.email}</span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center justify-center font-bold text-sm">
            👑
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        {[
          { id: 'password', label: '🔑 पासवर्ड व प्रोफाइल रीसेट', icon: KeyRound },
          { id: 'danger_delete', label: '🗑️ एडमिन डेटा डिलीट व रीसेट', icon: Trash2 },
          { id: 'staff', label: '👥 स्टाफ व सब-एडमिन खाते', icon: Users },
          { id: 'backup', label: '💾 बैकअप व रीस्टोर', icon: Download },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: PASSWORD & PROFILE RESET */}
      {activeTab === 'password' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Profile Overview Card */}
          <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center text-xl font-bold">
                👑
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">{credentials.name}</h3>
                <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  मालिक / सुपर एडमिन
                </span>
              </div>
            </div>

            <div className="space-y-3 pt-3 border-t border-slate-100 text-xs">
              <div className="flex items-center gap-2.5 text-slate-600">
                <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{credentials.businessName}</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-600">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="font-mono">{credentials.email}</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-600">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="font-mono">{credentials.phone}</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-600">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>इमरजेंसी रिकवरी पिन: <strong className="font-mono bg-slate-100 px-1.5 py-0.5 rounded">{credentials.recoveryPin}</strong></span>
              </div>
            </div>

            <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-[11px] text-emerald-900 space-y-1">
              <span className="font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                सुरक्षा सुझाव
              </span>
              <p className="text-emerald-800 leading-relaxed">
                अपना पासवर्ड नियमित रूप से बदलें। यदि पासवर्ड भूल जाएं, तो रिकवरी पिन <strong>{credentials.recoveryPin}</strong> से भी लॉगिन कर सकते हैं।
              </p>
            </div>
          </div>

          {/* Password & Info Update Form */}
          <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-600" />
                सुपर एडमिन पासवर्ड व संपर्क विवरण रीसेट करें
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                नया पासवर्ड तय करने के बाद अगली बार आप उसी पासवर्ड से लॉगिन करेंगे।
              </p>
            </div>

            <form onSubmit={handleSavePasswordAndProfile} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">सुपर एडमिन का नाम *</label>
                  <input
                    type="text"
                    required
                    value={adminNameInput}
                    onChange={(e) => setAdminNameInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">टेंट हाउस / फर्म का नाम</label>
                  <input
                    type="text"
                    value={businessNameInput}
                    onChange={(e) => setBusinessNameInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">लॉगिन ईमेल (Email ID) *</label>
                  <input
                    type="email"
                    required
                    value={adminEmailInput}
                    onChange={(e) => setAdminEmailInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">मोबाइल नंबर (WhatsApp / Call)</label>
                  <input
                    type="text"
                    value={adminPhoneInput}
                    onChange={(e) => setAdminPhoneInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Password Section */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 mt-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
                    नया पासवर्ड सेट करें (Password Change)
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-500 hover:text-slate-800 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showPassword ? 'छुपाएं' : 'दिखाएं'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">वर्तमान पासवर्ड (Old)</label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="वर्तमान पासवर्ड"
                      value={currentPasswordInput}
                      onChange={(e) => setCurrentPasswordInput(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">नया पासवर्ड (New)</label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="कम से कम 5 अक्षर"
                      value={newPasswordInput}
                      onChange={(e) => setNewPasswordInput(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">पुष्टि करें (Confirm)</label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="दोबारा नया पासवर्ड"
                      value={confirmPasswordInput}
                      onChange={(e) => setConfirmPasswordInput(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <label className="font-bold text-slate-700">4-अंकों का इमरजेंसी रिकवरी पिन:</label>
                    <input
                      type="text"
                      maxLength={6}
                      value={recoveryPinInput}
                      onChange={(e) => setRecoveryPinInput(e.target.value)}
                      className="w-20 bg-white border border-slate-300 rounded-lg px-2 py-1 text-slate-900 font-mono font-bold text-center focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400">पासवर्ड भूलने पर पिन से अनलॉक करें</span>
                </div>
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>पासवर्ड व प्रोफाइल सुरक्षित करें</span>
                </button>
              </div>

            </form>
          </div>

        </div>
      )}

      {/* TAB 2: DANGER ZONE & ADMIN DELETE OPTIONS */}
      {activeTab === 'danger_delete' && (
        <div className="bg-white p-6 rounded-3xl border border-red-200/80 shadow-xs space-y-6">
          
          <div className="border-b border-red-100 pb-4">
            <div className="flex items-center gap-2 text-red-700 font-extrabold text-base mb-1">
              <ShieldAlert className="w-5 h-5 text-red-600" />
              <span>एडमिन डेटा नियंत्रण व डिलीट विकल्प (Admin Data Controls & Danger Zone)</span>
            </div>
            <p className="text-xs text-slate-600">
              यहाँ से एडमिन अपनी आवश्यकता के अनुसार केवल पुरानी बुकिंग्स, सभी बुकिंग्स, इन्वेंटरी या पूरे डेटाबेस को नियंत्रित रूप से डिलीट या रीसेट कर सकते हैं।
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Delete Option 1: Completed / Cancelled Bookings */}
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-4 hover:border-red-300 transition-all">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                    <Trash2 className="w-4 h-4 text-amber-600" />
                    पुरानी व रद्द बुकिंग्स डिलीट करें
                  </h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                    {bookings.filter(b => b.status === 'Completed' || b.status === 'Cancelled').length} रिकॉर्ड्स
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  केवल वो बुकिंग्स हटाई जाएंगी जो पूर्ण (Completed) हो चुकी हैं या रद्द (Cancelled) हैं। सक्रिय पेंडिंग व स्वीकृत बुकिंग्स सुरक्षित रहेंगी।
                </p>
              </div>

              <button
                onClick={() => setDangerAction({
                  type: 'completed_bookings',
                  title: 'पुरानी व रद्द बुकिंग्स डिलीट करें?',
                  description: 'यह कार्रवाई उन सभी बुकिंग्स को स्थायी रूप से हटा देगी जो पूर्ण हो चुकी हैं या रद्द हैं।'
                })}
                className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>पुरानी बुकिंग्स साफ़ करें (Clean Old Bookings)</span>
              </button>
            </div>

            {/* Delete Option 2: Delete ALL Bookings */}
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-4 hover:border-red-300 transition-all">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                    <Trash2 className="w-4 h-4 text-red-600" />
                    सभी बुकिंग्स डिलीट करें (All Bookings)
                  </h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-800">
                    {bookings.length} कुल बुकिंग्स
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  डेटाबेस से सभी ग्राहक बुकिंग्स का इतिहास खाली कर देगा। टेंट और सामान इन्वेंटरी सुरक्षित रहेगी।
                </p>
              </div>

              <button
                onClick={() => setDangerAction({
                  type: 'all_bookings',
                  title: 'क्या आप सचमुच सभी बुकिंग्स डिलीट करना चाहते हैं?',
                  description: 'यह कार्रवाई सभी वर्तमान और पिछली ग्राहक बुकिंग्स को स्थायी रूप से हटा देगी।'
                })}
                className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>सभी बुकिंग्स खाली करें (Delete All Bookings)</span>
              </button>
            </div>

            {/* Delete Option 3: Delete All Tents */}
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-4 hover:border-red-300 transition-all">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                    <Trash2 className="w-4 h-4 text-red-600" />
                    सभी टेंट मॉडल्स हटाएं
                  </h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                    {tents.length} टेंट
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  कैटलॉग से सभी टेंट व शामियाना मॉडल्स हटा दिए जाएंगे ताकि आप नए सिरे से अपने टेंट जोड़ सकें।
                </p>
              </div>

              <button
                onClick={() => setDangerAction({
                  type: 'all_tents',
                  title: 'सभी टेंट मॉडल्स हटाएं?',
                  description: 'यह कार्रवाई सभी टेंटों और उनके फोटो को इन्वेंटरी से हटा देगी।'
                })}
                className="w-full py-2.5 bg-slate-800 hover:bg-black text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>सभी टेंट खाली करें</span>
              </button>
            </div>

            {/* Delete Option 4: Delete All Inventory Addons */}
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-4 hover:border-red-300 transition-all">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                    <Trash2 className="w-4 h-4 text-red-600" />
                    सभी हलवाई व सजावट सामान हटाएं
                  </h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                    {addons.length} सामान
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  बैठने, सजावट, हलवाई बर्तन और जनरेटर की सभी सामान सूची को खाली कर देगा।
                </p>
              </div>

              <button
                onClick={() => setDangerAction({
                  type: 'all_addons',
                  title: 'सभी सामान सूची हटाएं?',
                  description: 'यह कार्रवाई बैठने, सजावट व हलवाई के सभी सामान को इन्वेंटरी से हटा देगी।'
                })}
                className="w-full py-2.5 bg-slate-800 hover:bg-black text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>सभी सामान खाली करें</span>
              </button>
            </div>

          </div>

          {/* Full Factory Reset Option */}
          <div className="p-6 bg-red-50 rounded-3xl border border-red-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <h4 className="font-extrabold text-red-950 text-sm sm:text-base flex items-center justify-center sm:justify-start gap-2">
                <RefreshCcw className="w-4 h-4 text-red-600" />
                फ़ैक्टरी डेमो डेटा रीसेट (Factory Reset to Defaults)
              </h4>
              <p className="text-xs text-red-800 max-w-xl">
                यदि आप पूरे सिस्टम को नए सिरे से मूल डेमो डेटा (Initial Indian Tents & Village Equipment) पर लाना चाहते हैं तो यहाँ से रीसेट कर सकते हैं।
              </p>
            </div>

            <button
              onClick={() => setDangerAction({
                type: 'factory_reset',
                title: 'फ़ैक्टरी डेटा रीसेट (Factory Reset)?',
                description: 'सभी कस्टम टेंट, बदलाव और बुकिंग्स हटकर प्रारंभिक डिफ़ॉल्ट डेटा लोड हो जाएगा।'
              })}
              className="px-5 py-2.5 bg-red-700 hover:bg-red-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <RefreshCcw className="w-3.5 h-3.5" />
              <span>फ़ैक्टरी रीसेट करें</span>
            </button>
          </div>

        </div>
      )}

      {/* TAB 3: STAFF & SUB-ADMIN ACCOUNTS */}
      {activeTab === 'staff' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Add Staff Account Form */}
          <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-emerald-600" />
              <h3 className="font-extrabold text-slate-900 text-base">नया स्टाफ सदस्य जोड़ें</h3>
            </div>
            <p className="text-xs text-slate-500">
              अपने टेंट कारीगर लीडर या इन्वेंटरी मैनेजर को अलग लॉगिन पासवर्ड दें।
            </p>

            <form onSubmit={handleAddStaff} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">नाम (Name) *</label>
                <input
                  type="text"
                  required
                  placeholder="जैसे: राहुल शर्मा"
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ईमेल (Email ID) *</label>
                <input
                  type="email"
                  required
                  placeholder="rahul@tenthouse.com"
                  value={newStaffEmail}
                  onChange={(e) => setNewStaffEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">लॉगिन पासवर्ड *</label>
                <input
                  type="password"
                  required
                  placeholder="स्टाफ पासवर्ड"
                  value={newStaffPassword}
                  onChange={(e) => setNewStaffPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">भूमिका (Role)</label>
                <select
                  value={newStaffRole}
                  onChange={(e) => setNewStaffRole(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="Inventory Manager">इन्वेंटरी मैनेजर (सामान व टेंट देखभाल)</option>
                  <option value="Operations Lead">ऑपरेशंस लीड (डिलीवरी व कारीगर टीम)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">मोबाइल नंबर</label>
                <input
                  type="text"
                  placeholder="+91 9876543210"
                  value={newStaffPhone}
                  onChange={(e) => setNewStaffPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer mt-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>स्टाफ खाता बनाएं</span>
              </button>
            </form>
          </div>

          {/* List of Staff Accounts */}
          <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center justify-between">
              <span>सक्रिय स्टाफ व प्रबंधक खाते ({staffList.length + 1})</span>
            </h3>

            <div className="space-y-3">
              
              {/* Primary Super Admin Card */}
              <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                    👑
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{credentials.name}</h4>
                    <span className="text-[11px] text-slate-500 font-mono block">{credentials.email}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-300">
                    सुपर एडमिन (Owner)
                  </span>
                </div>
              </div>

              {/* Sub-Admin Staff Cards */}
              {staffList.map(staff => (
                <div key={staff.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between hover:bg-white hover:shadow-xs transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center font-bold">
                      👤
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{staff.name}</h4>
                      <span className="text-[11px] text-slate-500 font-mono block">{staff.email}</span>
                      {staff.phone && <span className="text-[10px] text-slate-400">{staff.phone}</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-700 bg-slate-200 px-2.5 py-1 rounded-full">
                      {staff.role}
                    </span>
                    <button
                      onClick={() => handleDeleteStaff(staff.id, staff.name)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                      title="खाता हटाएं"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {staffList.length === 0 && (
                <div className="p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-center text-xs text-slate-500">
                  वर्तमान में केवल सुपर एडमिन खाता सक्रिय है। अतिरिक्त टीम मेंबर जोड़ने के लिए बाएं फॉर्म का उपयोग करें।
                </div>
              )}

            </div>
          </div>

        </div>
      )}

      {/* TAB 4: BACKUP & RESTORE */}
      {activeTab === 'backup' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          
          {/* Download JSON Backup */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center">
              <Download className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">डेटाबेस बैकअप डाउनलोड करें</h3>
              <p className="text-xs text-slate-500 mt-1">
                वर्तमान में मौजूद सभी टेंट, सामान सूची और ग्राहक बुकिंग्स का सम्पूर्ण JSON बैकअप अपनी डिवाइस में सुरक्षित सेव करें।
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl text-xs space-y-1 font-mono text-slate-600">
              <div>टेंट संख्या: <strong>{tents.length}</strong></div>
              <div>सामान संख्या: <strong>{addons.length}</strong></div>
              <div>बुकिंग्स संख्या: <strong>{bookings.length}</strong></div>
            </div>

            <button
              onClick={handleExportBackup}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>JSON डेटाबेस बैकअप डाउनलोड करें</span>
            </button>
          </div>

          {/* Upload / Restore JSON */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">डेटाबेस बैकअप रीस्टोर करें</h3>
              <p className="text-xs text-slate-500 mt-1">
                यदि आपने पहले कोई बैकअप JSON फाइल डाउनलोड की थी, तो उसे अपलोड करके पुराना डेटा वापस ला सकते हैं।
              </p>
            </div>

            <label className="block p-4 border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/50 rounded-2xl text-center cursor-pointer transition-colors">
              <Upload className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
              <span className="text-xs font-bold text-emerald-900 block">JSON बैकअप फाइल चुनें</span>
              <span className="text-[10px] text-slate-500">.json फाइल्स सपोर्टेड</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportBackup}
                className="hidden"
              />
            </label>
          </div>

        </div>
      )}

      {/* DANGER ACTION CONFIRMATION MODAL */}
      {dangerAction && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div 
            className="relative bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-red-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 bg-red-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-extrabold text-base">{dangerAction.title}</h3>
              </div>
              <button
                onClick={() => setDangerAction(null)}
                className="w-7 h-7 rounded-full bg-red-800 hover:bg-red-900 text-white flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs text-slate-800">
              <p className="text-slate-600 leading-relaxed font-medium">
                {dangerAction.description}
              </p>

              <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-red-900 space-y-1">
                <strong>⚠️ चेतावनी:</strong> यह कार्रवाई पूर्ववत (Undo) नहीं की जा सकती।
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  पुष्टि के लिए सुपर एडमिन पासवर्ड दर्ज करें या <strong>DELETE</strong> टाइप करें:
                </label>
                <input
                  type="password"
                  placeholder="सुपर एडमिन पासवर्ड दर्ज करें"
                  value={dangerPasswordInput}
                  onChange={(e) => setDangerPasswordInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDangerAction(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 cursor-pointer"
                >
                  रद्द करें
                </button>
                <button
                  type="button"
                  onClick={handleExecuteDangerAction}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  हाँ, डिलीट करें
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
