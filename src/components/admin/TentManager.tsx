import React, { useState, useRef } from 'react';
import { Tent, TentCategory } from '../../types';
import { 
  Plus, Edit, Trash2, Star, Users, Maximize2, ShieldCheck, 
  X, Check, AlertCircle, Image as ImageIcon, Sparkles, Layers,
  Upload, Camera, ArrowUp, ArrowDown, Sliders, TrendingUp, TrendingDown
} from 'lucide-react';
import { addTent, updateTent, deleteTent, adjustTentPrice, updateTentPrice, bulkAdjustTentPrices } from '../../services/storageService';

interface TentManagerProps {
  tents: Tent[];
  isOpenAddModal: boolean;
  onCloseAddModal: () => void;
}

export const TentManager: React.FC<TentManagerProps> = ({
  tents,
  isOpenAddModal,
  onCloseAddModal
}) => {
  const [editingTent, setEditingTent] = useState<Tent | null>(null);
  const [showFormModal, setShowFormModal] = useState(isOpenAddModal);
  const [showBulkTentModal, setShowBulkTentModal] = useState(false);
  const [bulkTentAction, setBulkTentAction] = useState<'increase' | 'decrease'>('increase');
  const [bulkTentMode, setBulkTentMode] = useState<'percentage' | 'fixed'>('percentage');
  const [bulkTentAmount, setBulkTentAmount] = useState<number>(10);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const showNotification = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  // Form State
  const [name, setName] = useState('');
  const [hindiName, setHindiName] = useState('');
  const [category, setCategory] = useState<TentCategory>('Desi Shamyana Pandal');
  const [pricePerDay, setPricePerDay] = useState(4500);
  const [depositAmount, setDepositAmount] = useState(1500);
  const [weeklyDiscountPercentage, setWeeklyDiscountPercentage] = useState(15);
  const [description, setDescription] = useState('');
  const [capacitySeated, setCapacitySeated] = useState(150);
  const [capacityStanding, setCapacityStanding] = useState(250);
  const [dimensions, setDimensions] = useState('30ft x 60ft (1,800 sq ft)');
  const [peakHeight, setPeakHeight] = useState('14 ft Apex');
  const [setupTime, setSetupTime] = useState('2-3 घंटे (टेंट कारीगरों द्वारा)');
  const [waterproofRating, setWaterproofRating] = useState('मजबूत वाटरप्रूफ तिरपाल व कनात');
  const [windResistance, setWindResistance] = useState('मजबूत बांस-बल्ली व लोहे के पाइप द्वारा सुरक्षित');
  const [frameMaterial, setFrameMaterial] = useState('मजबूत लोहे के पोल, जीआई पाइप व बांस-बल्ली');
  const [stockQuantity, setStockQuantity] = useState(6);
  const [images, setImages] = useState<string[]>([]);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isPopular, setIsPopular] = useState(false);
  const [supportedSurfaces, setSupportedSurfaces] = useState<string[]>([
    'Khet / Khula Ground',
    'Lawn / Ghaas',
    'Aangan / Pakka Farsh'
  ]);

  const [formError, setFormError] = useState('');

  // Handle device image file selection (base64)
  const handleDeviceImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File) => {
      if (!file.type.startsWith('image/')) {
        setFormError('कृपया केवल इमेज फाइल (JPG, PNG, WebP) अपलोड करें।');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Result = event.target?.result as string;
        if (base64Result) {
          setImages(prev => [...prev, base64Result]);
        }
      };
      reader.readAsDataURL(file);
    });

    // Reset file input so user can pick same file again if needed
    if (e.target) {
      e.target.value = '';
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const moveImage = (index: number, direction: 'up' | 'down') => {
    setImages(prev => {
      const arr = [...prev];
      const targetIdx = direction === 'up' ? index - 1 : index + 1;
      if (targetIdx < 0 || targetIdx >= arr.length) return prev;
      const temp = arr[index];
      arr[index] = arr[targetIdx];
      arr[targetIdx] = temp;
      return arr;
    });
  };

  const openCreateModal = () => {
    setEditingTent(null);
    setName('');
    setHindiName('');
    setCategory('Desi Shamyana Pandal');
    setPricePerDay(4500);
    setDepositAmount(1500);
    setWeeklyDiscountPercentage(15);
    setDescription('गांव-देहात, शादी, तिलक, कथा व पार्टी के लिए मजबूत व साफ-सुथरा शामियाना पंडाल।');
    setCapacitySeated(150);
    setCapacityStanding(250);
    setDimensions('30ft x 60ft (1,800 sq ft)');
    setPeakHeight('14 ft Apex');
    setSetupTime('2-3 घंटे (टेंट कारीगरों द्वारा)');
    setWaterproofRating('मजबूत वाटरप्रूफ तिरपाल व कनात');
    setWindResistance('मजबूत बांस-बल्ली व लोहे के पाइप द्वारा सुरक्षित');
    setFrameMaterial('मजबूत लोहे के पोल, जीआई पाइप व बांस-बल्ली');
    setStockQuantity(6);
    setImages([
      'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80'
    ]);
    setIsFeatured(false);
    setIsPopular(false);
    setSupportedSurfaces(['Khet / Khula Ground', 'Lawn / Ghaas', 'Aangan / Pakka Farsh']);
    setFormError('');
    setShowFormModal(true);
  };

  const openEditModal = (tent: Tent) => {
    setEditingTent(tent);
    setName(tent.name);
    setHindiName(tent.hindiName || '');
    setCategory(tent.category);
    setPricePerDay(tent.pricePerDay);
    setDepositAmount(tent.depositAmount);
    setWeeklyDiscountPercentage(tent.weeklyDiscountPercentage);
    setDescription(tent.description);
    setCapacitySeated(tent.detailedSpecs.capacitySeated);
    setCapacityStanding(tent.detailedSpecs.capacityStanding);
    setDimensions(tent.detailedSpecs.dimensions);
    setPeakHeight(tent.detailedSpecs.peakHeight);
    setSetupTime(tent.detailedSpecs.setupTime);
    setWaterproofRating(tent.detailedSpecs.waterproofRating);
    setWindResistance(tent.detailedSpecs.windResistance);
    setFrameMaterial(tent.detailedSpecs.frameMaterial);
    setStockQuantity(tent.stockQuantity);
    setImages(tent.images && tent.images.length > 0 ? tent.images : [
      'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80'
    ]);
    setIsFeatured(!!tent.isFeatured);
    setIsPopular(!!tent.isPopular);
    setSupportedSurfaces(tent.supportedSurfaces || ['Khet / Khula Ground', 'Lawn / Ghaas']);
    setFormError('');
    setShowFormModal(true);
  };

  const handleSaveTent = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim()) {
      setFormError('कृपया टेंट का नाम भरें।');
      return;
    }
    if (pricePerDay <= 0) {
      setFormError('प्रति दिन किराया ₹0 से अधिक होना चाहिए।');
      return;
    }
    if (images.length === 0) {
      setFormError('कृपया अपने मोबाइल/कंप्यूटर से कम से कम 1 फोटो अपलोड करें।');
      return;
    }

    const tentData = {
      name,
      hindiName: hindiName || name,
      category,
      description,
      pricePerDay: Number(pricePerDay),
      depositAmount: Number(depositAmount),
      weeklyDiscountPercentage: Number(weeklyDiscountPercentage),
      images: images.length > 0 ? images : [
        'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80'
      ],
      features: [
        'साफ-सुथरी धुली हुई कनात व छत का पर्दा',
        'गांव-देहात, शादी, कथा व लॉन पार्टी के लिए मजबूत फिटिंग',
        'अनुभवी टेंट कारीगरों द्वारा मौके पर लगाना व खोलना'
      ],
      includedItems: [
        'शामियाना/कैनोपी छत व साइड कनात',
        'लोहे के पाइप, बांस-बल्ली, रस्सा व खूंटे',
        'सुरक्षित ग्राउंड एंकरिंग'
      ],
      stockQuantity: Number(stockQuantity),
      isFeatured,
      isPopular,
      status: Number(stockQuantity) > 0 ? ('Available' as const) : ('Maintenance' as const),
      supportedSurfaces: supportedSurfaces as any,
      detailedSpecs: {
        dimensions,
        capacitySeated: Number(capacitySeated),
        capacityStanding: Number(capacityStanding),
        peakHeight,
        setupTime,
        waterproofRating,
        windResistance,
        frameMaterial
      }
    };

    if (editingTent) {
      updateTent({
        ...editingTent,
        ...tentData
      });
    } else {
      addTent(tentData);
    }

    setShowFormModal(false);
    onCloseAddModal();
  };

  const handleDelete = (tent: Tent) => {
    if (confirm(`क्या आप सचमुच "${tent.name}" को हटाना चाहते हैं?`)) {
      deleteTent(tent.id);
    }
  };

  const toggleSurface = (surf: string) => {
    if (supportedSurfaces.includes(surf)) {
      setSupportedSurfaces(supportedSurfaces.filter(s => s !== surf));
    } else {
      setSupportedSurfaces([...supportedSurfaces, surf]);
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

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>टेंट व शामियाना इन्वेंटरी प्रबंधन</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
              {tents.length} मॉडल्स
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            गांव-देहात के शामियाने, वाटरप्रूफ जर्मन हैंगर, मंडप, भोजन पंगत टेंट और लॉन कैनोपी जोड़ें, डिवाइस से फोटो अपलोड करें व किराया दर कम-ज्यादा करें।
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowBulkTentModal(true)}
            className="px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <Sliders className="w-4 h-4 text-amber-600" />
            <span>थोक किराया बदलें (Bulk Rate)</span>
          </button>

          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>नया टेंट मॉडल जोड़ें</span>
          </button>
        </div>
      </div>

      {/* Tents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tents.map(tent => (
          <div key={tent.id} className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-xs flex flex-col justify-between hover:border-emerald-300 transition-all">
            
            {/* Image banner */}
            <div className="relative h-48 bg-slate-100">
              <img 
                src={tent.images[0] || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80'} 
                alt={tent.name} 
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap max-w-[80%]">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-900/90 text-emerald-300 backdrop-blur-md">
                  {tent.category}
                </span>
                {tent.isFeatured && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950">
                    पॉपुलर
                  </span>
                )}
              </div>
              <div className="absolute bottom-3 right-3 bg-slate-900/85 backdrop-blur-md text-emerald-300 font-mono font-bold text-xs px-2.5 py-1 rounded-lg">
                ₹{tent.pricePerDay.toLocaleString('en-IN')} / दिन
              </div>
            </div>

            {/* Content */}
            <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span>उपलब्ध स्टॉक: <strong className="text-slate-900">{tent.stockQuantity} सेट</strong></span>
                  <span className="flex items-center gap-1 font-semibold text-slate-700">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    {tent.rating.toFixed(2)} ({tent.reviewCount})
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-base">{tent.name}</h3>
                {tent.hindiName && tent.hindiName !== tent.name && (
                  <p className="text-xs text-emerald-700 font-medium">{tent.hindiName}</p>
                )}
                <p className="text-xs text-slate-500 line-clamp-2 mt-1">{tent.description}</p>
              </div>

              {/* Specs preview */}
              <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs text-slate-600">
                <div className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{tent.detailedSpecs.capacitySeated} बैठे / {tent.detailedSpecs.capacityStanding} खड़े</span>
                </div>
                <div className="flex items-center gap-1 truncate">
                  <Maximize2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">{tent.detailedSpecs.dimensions}</span>
                </div>
              </div>

              {/* Price Modifier Controller */}
              <div className="pt-2.5 border-t border-slate-100 space-y-2 bg-slate-50/70 p-2.5 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-500">किराया दर (प्रति दिन):</span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-emerald-700 font-mono">₹</span>
                    <input
                      type="number"
                      min="100"
                      step="50"
                      value={tent.pricePerDay}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        if (!isNaN(val) && val >= 0) {
                          updateTentPrice(tent.id, val);
                          showNotification(`${tent.name} का नया किराया ₹${val}/दिन सेट हुआ`);
                        }
                      }}
                      className="w-24 px-2 py-0.5 bg-white border border-slate-300 rounded-md text-xs font-extrabold text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-1 pt-1">
                  <span className="text-[10px] text-slate-400 font-semibold">दाम बदलें:</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        adjustTentPrice(tent.id, -500);
                        showNotification(`${tent.name} का किराया -₹500 कम हुआ`);
                      }}
                      className="px-1.5 py-0.5 bg-white hover:bg-red-50 text-red-700 border border-slate-200 text-[10px] font-bold rounded cursor-pointer font-mono"
                      title="-₹500 कम करें"
                    >
                      -500
                    </button>
                    <button
                      onClick={() => {
                        adjustTentPrice(tent.id, -100);
                        showNotification(`${tent.name} का किराया -₹100 कम हुआ`);
                      }}
                      className="px-1.5 py-0.5 bg-white hover:bg-red-50 text-red-700 border border-slate-200 text-[10px] font-bold rounded cursor-pointer font-mono"
                      title="-₹100 कम करें"
                    >
                      -100
                    </button>
                    <button
                      onClick={() => {
                        adjustTentPrice(tent.id, 100);
                        showNotification(`${tent.name} का किराया +₹100 बढ़ा`);
                      }}
                      className="px-1.5 py-0.5 bg-white hover:bg-emerald-50 text-emerald-700 border border-slate-200 text-[10px] font-bold rounded cursor-pointer font-mono"
                      title="+₹100 बढ़ाएं"
                    >
                      +100
                    </button>
                    <button
                      onClick={() => {
                        adjustTentPrice(tent.id, 500);
                        showNotification(`${tent.name} का किराया +₹500 बढ़ा`);
                      }}
                      className="px-1.5 py-0.5 bg-white hover:bg-emerald-50 text-emerald-700 border border-slate-200 text-[10px] font-bold rounded cursor-pointer font-mono"
                      title="+₹500 बढ़ाएं"
                    >
                      +500
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between gap-2">
                <button
                  onClick={() => openEditModal(tent)}
                  className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5 text-slate-600" />
                  विवरण बदलें (Full Edit)
                </button>
                <button
                  onClick={() => handleDelete(tent)}
                  className="p-2 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs rounded-xl border border-red-200 transition-colors cursor-pointer"
                  title="हटाएं (Delete)"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

            </div>

          </div>
        ))}
      </div>

      {/* BULK TENT PRICE ADJUSTMENT MODAL */}
      {showBulkTentModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div 
            className="relative bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">
                    सभी टेंट का किराया बदलें (Bulk Tent Rate)
                  </h3>
                  <p className="text-[11px] text-slate-400">एक क्लिक में सभी टेंट का किराया % या ₹ में बढ़ाएं अथवा घटाएं</p>
                </div>
              </div>
              <button
                onClick={() => setShowBulkTentModal(false)}
                className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                bulkAdjustTentPrices({
                  type: bulkTentMode,
                  amount: bulkTentAmount,
                  direction: bulkTentAction
                });
                setShowBulkTentModal(false);
                showNotification(`सभी टेंट का किराया ${bulkTentAction === 'increase' ? 'बढ़ा' : 'घटा'} दिया गया!`);
              }}
              className="p-6 space-y-4 text-slate-800"
            >
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">कार्रवाई चुनें</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setBulkTentAction('increase')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                      bulkTentAction === 'increase'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-500/20'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    <span>किराया बढ़ाएं (+ Increase)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBulkTentAction('decrease')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                      bulkTentAction === 'decrease'
                        ? 'bg-red-50 border-red-500 text-red-800 ring-2 ring-red-500/20'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <TrendingDown className="w-4 h-4 text-red-600" />
                    <span>किराया घटाएं (- Decrease)</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">बदलाव मोड</label>
                  <select
                    value={bulkTentMode}
                    onChange={(e) => setBulkTentMode(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="percentage">प्रतिशत (% Percentage)</option>
                    <option value="fixed">निश्चित रुपया (₹ Amount)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    {bulkTentMode === 'percentage' ? 'प्रतिशत (%)' : 'राशि (₹)'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={bulkTentAmount}
                    onChange={(e) => setBulkTentAmount(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowBulkTentModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>सभी टेंट पर लागू करें</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* CREATE / EDIT TENT MODAL */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div 
            className="relative bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div>
                <h3 className="font-extrabold text-base text-white">
                  {editingTent ? `बदलाव करें: ${editingTent.name}` : 'नया टेंट / शामियाना जोड़ें'}
                </h3>
                <p className="text-[11px] text-slate-400">
                  डिवाइस से फोटो अपलोड करें व टेंट का विवरण भरें
                </p>
              </div>
              <button
                onClick={() => {
                  setShowFormModal(false);
                  onCloseAddModal();
                }}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Error banner */}
            {formError && (
              <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSaveTent} className="p-6 space-y-4 overflow-y-auto flex-1 text-slate-800">
              
              {/* DEVICE PHOTO UPLOAD SECTION */}
              <div className="p-4 bg-emerald-50/60 rounded-2xl border-2 border-dashed border-emerald-300">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-emerald-700" />
                    डिवाइस से टेंट की फोटो अपलोड करें (Device Photo Upload) *
                  </label>
                  <span className="text-[11px] text-emerald-700 font-semibold">
                    {images.length} फोटो जुड़ी हुई
                  </span>
                </div>

                <p className="text-[11px] text-slate-600 mb-3">
                  अपने मोबाइल गैलरी या कंप्यूटर से टेंट की असली फोटो चुनें। आप कई फोटो एक साथ चुन सकते हैं।
                </p>

                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleDeviceImageUpload}
                  accept="image/*"
                  multiple
                  className="hidden"
                />

                {/* Upload Button Trigger */}
                <div className="flex flex-wrap gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    मोबाइल / कंप्यूटर से फोटो चुनें
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const url = prompt('यदि आपके पास फोटो का वेब लिंक है तो यहाँ पेस्ट करें:');
                      if (url && url.startsWith('http')) {
                        setImages(prev => [...prev, url.trim()]);
                      }
                    }}
                    className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl border border-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
                    वेब URL से भी जोड़ें
                  </button>
                </div>

                {/* Thumbnail Previews */}
                {images.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-300 bg-slate-900 aspect-video flex items-center justify-center">
                        <img 
                          src={img} 
                          alt={`Uploaded preview ${idx + 1}`} 
                          className="w-full h-full object-cover"
                        />
                        {idx === 0 && (
                          <span className="absolute top-1 left-1 bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                            मुख्य फोटो
                          </span>
                        )}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                          {idx > 0 && (
                            <button
                              type="button"
                              onClick={() => moveImage(idx, 'up')}
                              className="p-1 bg-white/80 hover:bg-white text-slate-900 rounded cursor-pointer"
                              title="आगे लाएं"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>
                          )}
                          {idx < images.length - 1 && (
                            <button
                              type="button"
                              onClick={() => moveImage(idx, 'down')}
                              className="p-1 bg-white/80 hover:bg-white text-slate-900 rounded cursor-pointer"
                              title="पीछे करें"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="p-1 bg-red-600 hover:bg-red-700 text-white rounded cursor-pointer"
                            title="हटाएं"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">टेंट का नाम (Model Name) *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="जैसे: पारंपरिक लाल-पीला कनात शामियाना"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">कैटेगरी (Category) *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as TentCategory)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="Desi Shamyana Pandal">देसी शामियाना पंडाल (Desi Shamyana)</option>
                    <option value="Waterproof German Hanger Pandal">वाटरप्रूफ जर्मन हैंगर पंडाल (German Hanger)</option>
                    <option value="Wedding Mandap & Stage Tent">विवाह मंडप व जयमाल टेंट (Mandap / Stage)</option>
                    <option value="Haldi & Mehendi Yellow Canopy">हल्दी व मेहंदी पीला शामियाना (Haldi Canopy)</option>
                    <option value="Bhojan & Pangat Shamyana">भोजन व पंगत शामियाना (Bhojan Pangat)</option>
                    <option value="VIP Lawn Marquee">वीआईपी लॉन मार्की (VIP Lawn)</option>
                    <option value="Mini Chhatri / Pagoda">छतरी / स्वागत पंडाल (Pagoda / Canopy)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">किराया / दिन (₹) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={pricePerDay}
                    onChange={(e) => setPricePerDay(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">सुरक्षा राशि (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">स्टॉक यूनिट्स *</label>
                  <input
                    type="number"
                    min="0"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">विवरण (Description)</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="टेंट की खासियत, कनात और उपयोग के बारे में बताएं..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* Technical Specifications */}
              <div className="space-y-3 pt-2 border-t border-slate-200">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">साइज व मेहमान क्षमता (Specs & Dimensions)</span>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">बैठने की क्षमता (Seated)</label>
                    <input
                      type="number"
                      value={capacitySeated}
                      onChange={(e) => setCapacitySeated(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">कुल क्षमता (Standing)</label>
                    <input
                      type="number"
                      value={capacityStanding}
                      onChange={(e) => setCapacityStanding(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-900"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">लंबाई x चौड़ाई (Dimensions)</label>
                    <input
                      type="text"
                      value={dimensions}
                      onChange={(e) => setDimensions(e.target.value)}
                      placeholder="जैसे: 30ft x 60ft (1,800 sq ft)"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">ऊंचाई (Peak Height)</label>
                    <input
                      type="text"
                      value={peakHeight}
                      onChange={(e) => setPeakHeight(e.target.value)}
                      placeholder="जैसे: 14 ft Apex"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">सेटअप समय (Setup Time)</label>
                    <input
                      type="text"
                      value={setupTime}
                      onChange={(e) => setSetupTime(e.target.value)}
                      placeholder="जैसे: 2-3 घंटे"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Supported Surfaces */}
              <div className="pt-2 border-t border-slate-200">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">जमीन / स्थान प्रकार (Surfaces)</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'Khet / Khula Ground', label: 'खेत / खुला मैदान' },
                    { id: 'Lawn / Ghaas', label: 'लॉन / घास' },
                    { id: 'Aangan / Pakka Farsh', label: 'आंगन / पक्का फर्श' },
                    { id: 'Chhat / Terrace', label: 'छत / टेरेस' },
                    { id: 'Sadak / Gali', label: 'सड़क / गली' }
                  ].map(surf => (
                    <button
                      key={surf.id}
                      type="button"
                      onClick={() => toggleSurface(surf.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        supportedSurfaces.includes(surf.id)
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {surf.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Checkboxes */}
              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  मुख्य पेज पर हाइलाइट करें (Featured)
                </label>
                <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPopular}
                    onChange={(e) => setIsPopular(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  सबसे लोकप्रिय टैग लगाएं (Popular)
                </label>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowFormModal(false);
                    onCloseAddModal();
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  रद्द करें (Cancel)
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
                >
                  {editingTent ? 'बदलाव सुरक्षित करें (Save Changes)' : 'नया टेंट सुरक्षित करें (Add Tent)'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
