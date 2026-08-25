import React, { useState } from 'react';
import { TentAddon, AddonCategory } from '../../types';
import { 
  Plus, Trash2, Check, AlertCircle, Armchair, Sparkles, Utensils, 
  Zap, Layers, Box, Crown, Lamp, Volume2, Snowflake, Droplet, Table,
  Search, Filter, Edit, ArrowUpRight, TrendingUp, TrendingDown, RefreshCw, CheckCircle2, Sliders, ArrowUpDown,
  Sun, Wind, CloudRain, Shield, AlertTriangle, Calendar, Clock, DollarSign, CheckSquare, Square, Minus, Package
} from 'lucide-react';
import { 
  addAddonItem, updateAddonItem, updateAddonPrice, adjustAddonPrice, 
  bulkAdjustAddonPrices, deleteAddonItem, deleteAddonsBulk,
  reduceAddonStockQuantity, updateAddonStockQuantity
} from '../../services/storageService';

interface InventoryAddonsManagerProps {
  addons: TentAddon[];
  isOpenAddModal?: boolean;
  onCloseAddModal?: () => void;
}

export const InventoryAddonsManager: React.FC<InventoryAddonsManagerProps> = ({
  addons,
  isOpenAddModal = false,
  onCloseAddModal
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'default' | 'price-low' | 'price-high' | 'name'>('default');
  
  // Modals state
  const [showAddModal, setShowAddModal] = useState(isOpenAddModal);
  const [editingItem, setEditingItem] = useState<TentAddon | null>(null);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [priceUpdatedToast, setPriceUpdatedToast] = useState<{ id: string; message: string } | null>(null);

  // Multi-Selection State for Bulk Delete & Stock Operations
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());

  // Granular Item Quantity Deletion Modal State
  const [granularDeleteModal, setGranularDeleteModal] = useState<{
    item: TentAddon;
    deleteMode: 'reduce' | 'full';
    reduceQty: number;
  } | null>(null);

  // Form State for Add / Edit
  const [formName, setFormName] = useState('');
  const [formHindiName, setFormHindiName] = useState('');
  const [formCategory, setFormCategory] = useState<AddonCategory>('Garmiyon Ka Saman');
  const [formPricePerDay, setFormPricePerDay] = useState<number | string>(150);
  const [formStockQuantity, setFormStockQuantity] = useState<number | string>(50);
  const [formUnit, setFormUnit] = useState('1 यूनिट / दिन');
  const [formDescription, setFormDescription] = useState('');
  const [formIconName, setFormIconName] = useState('Wind');
  const [formErrors, setFormErrors] = useState<{ name?: string; price?: string; unit?: string; stock?: string }>({});

  // Bulk Price Adjust Form State
  const [bulkAction, setBulkAction] = useState<'increase' | 'decrease'>('increase');
  const [bulkMode, setBulkMode] = useState<'percentage' | 'fixed'>('percentage');
  const [bulkAmount, setBulkAmount] = useState<number>(15);
  const [bulkCategory, setBulkCategory] = useState<string>('All');

  // Inline Validation tracking
  const [inlinePriceErrors, setInlinePriceErrors] = useState<{ [id: string]: string }>({});

  // Categories definition
  const CATEGORY_TABS = [
    { id: 'All', label: 'सभी सामान (All)', count: addons.length, icon: Box },
    { id: 'Garmiyon Ka Saman', label: '☀️ गर्मी: पंखा, कूलर, ड्रम', count: addons.filter(a => a.category === 'Garmiyon Ka Saman').length, icon: Sun },
    { id: 'Sardiyon Ka Saman', label: '❄️ सर्दी: हीटर, रजाई, सिगड़ी', count: addons.filter(a => a.category === 'Sardiyon Ka Saman').length, icon: Snowflake },
    { id: 'Barsat Ka Saman', label: '🌧️ बरसात: तिरपाल, तख्त', count: addons.filter(a => a.category === 'Barsat Ka Saman').length, icon: CloudRain },
    { id: 'Saf-Safai Ka Saman', label: '🧹 सफाई: वॉशबेसिन, डस्टबिन', count: addons.filter(a => a.category === 'Saf-Safai Ka Saman').length, icon: Sparkles },
    { id: 'Baithne Ka Saman', label: '🪑 बैठने का सामान', count: addons.filter(a => a.category === 'Baithne Ka Saman').length, icon: Armchair },
    { id: 'Sajane Ka Saman', label: '🌸 सजावट व स्टेज', count: addons.filter(a => a.category === 'Sajane Ka Saman').length, icon: Sparkles },
    { id: 'Khana Bnane Ka Saman', label: '🍳 हलवाई बर्तन / भट्टी', count: addons.filter(a => a.category === 'Khana Bnane Ka Saman').length, icon: Utensils },
    { id: 'Lighting & Sound', label: '💡 लाइटिंग व साउंड', count: addons.filter(a => a.category === 'Lighting & Sound').length, icon: Volume2 },
    { id: 'Bijli & Generator', label: '⚡ जनरेटर व बिजली', count: addons.filter(a => a.category === 'Bijli & Generator').length, icon: Zap }
  ];

  // Filter and Sort items
  let filteredAddons = addons.filter(addon => {
    const matchesCategory = activeCategory === 'All' || addon.category === activeCategory;
    const matchesSearch = 
      addon.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (addon.hindiName && addon.hindiName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      addon.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      addon.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (sortBy === 'price-low') {
    filteredAddons = [...filteredAddons].sort((a, b) => a.pricePerDay - b.pricePerDay);
  } else if (sortBy === 'price-high') {
    filteredAddons = [...filteredAddons].sort((a, b) => b.pricePerDay - a.pricePerDay);
  } else if (sortBy === 'name') {
    filteredAddons = [...filteredAddons].sort((a, b) => a.name.localeCompare(b.name));
  }

  const showToast = (id: string, message: string) => {
    setPriceUpdatedToast({ id, message });
    setTimeout(() => {
      setPriceUpdatedToast(null);
    }, 2500);
  };

  // Quick Price Adjust Handler with validation (min ₹10, max ₹50,000)
  const handleQuickAdjust = (id: string, delta: number, currentPrice: number, itemName: string) => {
    const newPrice = currentPrice + delta;
    if (newPrice < 10) {
      showToast(id, 'न्यूनतम किराया दर ₹10 होनी चाहिए!');
      return;
    }
    if (newPrice > 50000) {
      showToast(id, 'अधिकतम किराया दर ₹50,000 तक मान्य है!');
      return;
    }
    adjustAddonPrice(id, delta);
    showToast(id, `${delta > 0 ? `+₹${delta}` : `-₹${Math.abs(delta)}`} दाम अपडेट हुआ (अब: ₹${newPrice})`);
  };

  // Inline Price Direct Input Change with proper validation
  const handleInlinePriceSave = (id: string, value: string) => {
    const num = Number(value);
    if (value.trim() === '' || isNaN(num)) {
      setInlinePriceErrors(prev => ({ ...prev, [id]: 'कृपया सही अंक दर्ज करें' }));
      return;
    }
    if (num < 10) {
      setInlinePriceErrors(prev => ({ ...prev, [id]: 'न्यूनतम दर ₹10 आवश्यक है' }));
      return;
    }
    if (num > 50000) {
      setInlinePriceErrors(prev => ({ ...prev, [id]: 'अधिकतम दर ₹50,000' }));
      return;
    }
    
    // Clear error & save
    setInlinePriceErrors(prev => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
    updateAddonPrice(id, num);
    showToast(id, `नया किराया ₹${num} सुरक्षित हो गया`);
  };

  // Time & Season Multiplier Presets
  const applySeasonPreset = (presetName: string, category: string, percentage: number, isIncrease: boolean) => {
    bulkAdjustAddonPrices({
      type: 'percentage',
      amount: percentage,
      direction: isIncrease ? 'increase' : 'decrease',
      category: category === 'All' ? undefined : category
    });
    showToast('preset', `${presetName} लागू! (${isIncrease ? '+' : '-'}${percentage}%)`);
  };

  // Quick Stock Adjust Handler with validation (min 0, max 10,000)
  const handleQuickStockAdjust = (id: string, delta: number, currentStock: number = 50, itemName: string) => {
    const newStock = Math.max(0, currentStock + delta);
    updateAddonStockQuantity(id, newStock);
    showToast(id, `${itemName}: स्टॉक बदलकर ${newStock} हुआ (${delta > 0 ? `+${delta}` : delta})`);
  };

  // Selection handlers for multi-item operations
  const handleToggleSelect = (id: string) => {
    setSelectedItemIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAllFiltered = () => {
    if (selectedItemIds.size === filteredAddons.length) {
      setSelectedItemIds(new Set());
    } else {
      setSelectedItemIds(new Set(filteredAddons.map(a => a.id)));
    }
  };

  const handleBulkDeleteSelected = () => {
    if (selectedItemIds.size === 0) return;
    if (confirm(`क्या आप चयनित ${selectedItemIds.size} सामानों को डेटाबेस से स्थायी रूप से हटाना चाहते हैं?`)) {
      deleteAddonsBulk(Array.from(selectedItemIds));
      showToast('bulk-del', `${selectedItemIds.size} सामान हटा दिए गए`);
      setSelectedItemIds(new Set());
    }
  };

  // Open Granular Quantity Delete Modal
  const openGranularDeleteModal = (item: TentAddon) => {
    setGranularDeleteModal({
      item,
      deleteMode: 'reduce',
      reduceQty: 1
    });
  };

  // Confirm Granular Delete (either reduce quantity or delete whole item)
  const handleConfirmGranularDelete = () => {
    if (!granularDeleteModal) return;
    const { item, deleteMode, reduceQty } = granularDeleteModal;

    if (deleteMode === 'full') {
      deleteAddonItem(item.id);
      showToast(item.id, `"${item.name}" पूरा सामान इन्वेंटरी से हटा दिया गया`);
      setGranularDeleteModal(null);
      return;
    }

    // Reduce specific quantity
    const currentStock = item.stockQuantity !== undefined ? item.stockQuantity : 50;
    const qty = Math.max(1, Math.min(currentStock, Number(reduceQty) || 1));
    const newRemaining = reduceAddonStockQuantity(item.id, qty);
    
    if (newRemaining <= 0) {
      showToast(item.id, `"${item.name}" का पूरा स्टॉक (0) समाप्त होने के कारण हटा दिया गया`);
    } else {
      showToast(item.id, `"${item.name}" से ${qty} मात्रा हटाई गई (बचा स्टॉक: ${newRemaining})`);
    }
    setGranularDeleteModal(null);
  };

  // Open Edit Modal
  const openEditModal = (item: TentAddon) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormHindiName(item.hindiName || '');
    setFormCategory(item.category);
    setFormPricePerDay(item.pricePerDay);
    setFormStockQuantity(item.stockQuantity !== undefined ? item.stockQuantity : 50);
    setFormUnit(item.unit);
    setFormDescription(item.description);
    setFormIconName(item.iconName);
    setFormErrors({});
    setShowAddModal(true);
  };

  // Open Create Modal
  const openCreateModal = () => {
    setEditingItem(null);
    setFormName('');
    setFormHindiName('');
    setFormCategory('Garmiyon Ka Saman');
    setFormPricePerDay(150);
    setFormStockQuantity(50);
    setFormUnit('1 यूनिट / दिन');
    setFormDescription('');
    setFormIconName('Wind');
    setFormErrors({});
    setShowAddModal(true);
  };

  // Save Item (Add or Edit) with strict validation
  const handleSaveAddon = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { name?: string; price?: string; unit?: string; stock?: string } = {};

    if (!formName.trim() || formName.trim().length < 3) {
      errors.name = 'कृपया कम से कम 3 अक्षरों का नाम दर्ज करें।';
    }

    const priceNum = Number(formPricePerDay);
    if (isNaN(priceNum) || priceNum < 10) {
      errors.price = 'किराया मूल्य कम से कम ₹10 होना चाहिए।';
    } else if (priceNum > 50000) {
      errors.price = 'किराया मूल्य अधिकतम ₹50,000 तक हो सकता है।';
    }

    const stockNum = Number(formStockQuantity);
    if (isNaN(stockNum) || stockNum < 1) {
      errors.stock = 'स्टॉक मात्रा कम से कम 1 होनी चाहिए।';
    }

    if (!formUnit.trim()) {
      errors.unit = 'कृपया इकाई (उदा: 1 पीस / दिन, सेट) दर्ज करें।';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (editingItem) {
      updateAddonItem({
        ...editingItem,
        name: formName.trim(),
        hindiName: formHindiName.trim() || formName.trim(),
        category: formCategory,
        pricePerDay: Math.round(priceNum),
        stockQuantity: Math.round(stockNum),
        unit: formUnit.trim(),
        description: formDescription.trim(),
        iconName: formIconName
      });
      showToast(editingItem.id, 'सामान व किराया दर सफलतापूर्वक अपडेट हुआ');
    } else {
      const created = addAddonItem({
        name: formName.trim(),
        hindiName: formHindiName.trim() || formName.trim(),
        category: formCategory,
        pricePerDay: Math.round(priceNum),
        stockQuantity: Math.round(stockNum),
        unit: formUnit.trim(),
        description: formDescription.trim(),
        iconName: formIconName
      });
      showToast(created.id, 'नया सामान सफलतापूर्वक जुड़ गया');
    }

    setShowAddModal(false);
    if (onCloseAddModal) onCloseAddModal();
  };

  // Apply Bulk Price Adjustment with validation
  const handleApplyBulkAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    if (bulkAmount <= 0) {
      showToast('bulk-err', 'कृपया 0 से अधिक बदलाव राशि या प्रतिशत दर्ज करें');
      return;
    }

    bulkAdjustAddonPrices({
      type: bulkMode,
      amount: bulkAmount,
      direction: bulkAction,
      category: bulkCategory === 'All' ? undefined : bulkCategory
    });

    setShowBulkModal(false);
    showToast('bulk', `सभी सामान का दाम ${bulkAction === 'increase' ? 'बढ़ा' : 'घटा'} दिया गया!`);
  };

  const handleDelete = (id: string, itemName: string) => {
    if (confirm(`क्या आप सचमुच "${itemName}" को इन्वेंटरी से हटाना चाहते हैं?`)) {
      deleteAddonItem(id);
      showToast(id, `सामान हटा दिया गया`);
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'Garmiyon Ka Saman': return <Sun className="w-4 h-4 text-amber-500" />;
      case 'Sardiyon Ka Saman': return <Snowflake className="w-4 h-4 text-sky-500" />;
      case 'Barsat Ka Saman': return <CloudRain className="w-4 h-4 text-blue-500" />;
      case 'Saf-Safai Ka Saman': return <Sparkles className="w-4 h-4 text-teal-600" />;
      case 'Baithne Ka Saman': return <Armchair className="w-4 h-4 text-amber-600" />;
      case 'Sajane Ka Saman': return <Sparkles className="w-4 h-4 text-pink-600" />;
      case 'Khana Bnane Ka Saman': return <Utensils className="w-4 h-4 text-emerald-600" />;
      case 'Lighting & Sound': return <Volume2 className="w-4 h-4 text-blue-600" />;
      case 'Bijli & Generator': return <Zap className="w-4 h-4 text-yellow-600" />;
      default: return <Box className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Toast notification */}
      {priceUpdatedToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white border border-emerald-500/50 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-slate-950 font-bold">
            <Check className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-semibold text-emerald-300">{priceUpdatedToast.message}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              सामान मूल्य व मौसमी इन्वेंटरी (Pricing & Seasonal Manager)
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
              {addons.length} कुल सामान
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            गर्मियों (कूलर, पंखे), सर्दियों (हीटर, रजाई), बरसात (तिरपाल, तख्त) व साफ-सफाई (वॉशबेसिन, डस्टबिन) का किराया समय व मांग के अनुसार तुरंत संशोधित करें।
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowBulkModal(true)}
            className="px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <Sliders className="w-4 h-4 text-amber-600" />
            <span>थोक में दाम बदलें (Bulk Adjust)</span>
          </button>

          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>नया सामान जोड़ें</span>
          </button>
        </div>
      </div>

      {/* Seasonal / Time-Based Dynamic Pricing Presets Toolbar */}
      <div className="bg-linear-to-r from-amber-900/90 via-slate-900 to-slate-900 text-white p-4 rounded-3xl border border-amber-700/40 shadow-sm space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-extrabold text-amber-300 uppercase tracking-wider">
              समय व सीजन के अनुसार त्वरित मूल्य बदलाव (Season & Time-based Presets):
            </span>
          </div>
          <span className="text-[11px] text-slate-300">
            मांग के अनुसार 1-क्लिक में किराया अपडेट करें
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          <button
            onClick={() => applySeasonPreset('गर्मियों का सीजन (+15% कूलर, पंखे, कैंपर)', 'Garmiyon Ka Saman', 15, true)}
            className="px-3 py-2 bg-slate-800/80 hover:bg-amber-600/30 text-amber-200 border border-amber-500/30 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center"
            title="गर्मियों के सामान पर +15% रेट बढ़ाएं"
          >
            <Sun className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate">☀️ गर्मी सीजन (+15%)</span>
          </button>

          <button
            onClick={() => applySeasonPreset('सर्दियों का सीजन (+15% हीटर, रजाई, सिगड़ी)', 'Sardiyon Ka Saman', 15, true)}
            className="px-3 py-2 bg-slate-800/80 hover:bg-sky-600/30 text-sky-200 border border-sky-500/30 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center"
            title="सर्दियों के सामान पर +15% रेट बढ़ाएं"
          >
            <Snowflake className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span className="truncate">❄️ सर्दी सीजन (+15%)</span>
          </button>

          <button
            onClick={() => applySeasonPreset('बरसात सुरक्षा सीजन (+20% तिरपाल व तख्त)', 'Barsat Ka Saman', 20, true)}
            className="px-3 py-2 bg-slate-800/80 hover:bg-blue-600/30 text-blue-200 border border-blue-500/30 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center"
            title="बरसात के सामान पर +20% रेट बढ़ाएं"
          >
            <CloudRain className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span className="truncate">🌧️ बरसात सीजन (+20%)</span>
          </button>

          <button
            onClick={() => applySeasonPreset('ऑफ-सीजन छूट (-10% सभी सामान)', 'All', 10, false)}
            className="px-3 py-2 bg-slate-800/80 hover:bg-emerald-600/30 text-emerald-200 border border-emerald-500/30 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center"
            title="कम मांग के समय सभी सामान पर -10% छूट दें"
          >
            <TrendingDown className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">🏷️ ऑफ-सीजन छूट (-10%)</span>
          </button>
        </div>
      </div>

      {/* Categories, Search, Multi-select & Quick Sort Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Categories Tab list */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
            {CATEGORY_TABS.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <span>{cat.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeCategory === cat.id ? 'bg-slate-700 text-slate-200' : 'bg-slate-200 text-slate-600'
                }`}>
                  {cat.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search & Sort */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="सामान खोजें (उदा: कूलर, पंखा, हीटर, तिरपाल)..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2 py-1 text-xs text-slate-700 shrink-0">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent border-none text-xs font-medium text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="default">डिफ़ॉल्ट क्रम</option>
                <option value="price-low">दाम: कम से ज्यादा (₹ Low-High)</option>
                <option value="price-high">दाम: ज्यादा से कम (₹ High-Low)</option>
                <option value="name">नाम (A-Z)</option>
              </select>
            </div>
          </div>

        </div>

        {/* Multi-Select & Selection Actions Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <button
              onClick={handleSelectAllFiltered}
              className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {selectedItemIds.size === filteredAddons.length && filteredAddons.length > 0 ? (
                <>
                  <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                  <span>सभी अचयनित करें ({filteredAddons.length})</span>
                </>
              ) : (
                <>
                  <Square className="w-3.5 h-3.5 text-slate-400" />
                  <span>सभी चुनें ({filteredAddons.length})</span>
                </>
              )}
            </button>

            {selectedItemIds.size > 0 && (
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                {selectedItemIds.size} सामान चयनित
              </span>
            )}
          </div>

          {selectedItemIds.size > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleBulkDeleteSelected}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>चयनित ({selectedItemIds.size}) सामान हटाएं</span>
              </button>
              <button
                onClick={() => setSelectedItemIds(new Set())}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-semibold cursor-pointer"
              >
                रद्द
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Grid of Items with Direct Price Controls & Granular Deletion */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAddons.map(item => {
          const hasError = !!inlinePriceErrors[item.id];
          const isSelected = selectedItemIds.has(item.id);
          const currentStock = item.stockQuantity !== undefined ? item.stockQuantity : 50;

          return (
            <div 
              key={item.id}
              className={`bg-white rounded-2xl p-5 border shadow-xs flex flex-col justify-between transition-all group relative ${
                isSelected ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/10' : 'border-slate-200 hover:border-emerald-300'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    {/* Checkbox for multi-select */}
                    <button
                      onClick={() => handleToggleSelect(item.id)}
                      className="p-1 text-slate-400 hover:text-emerald-700 cursor-pointer"
                      title="चयन करें"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-300 hover:text-slate-400" />
                      )}
                    </button>

                    <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                      {getCategoryIcon(item.category)}
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        {item.category === 'Garmiyon Ka Saman' && '☀️ गर्मियों का सामान'}
                        {item.category === 'Sardiyon Ka Saman' && '❄️ सर्दियों का सामान'}
                        {item.category === 'Barsat Ka Saman' && '🌧️ बरसात का सामान'}
                        {item.category === 'Saf-Safai Ka Saman' && '🧹 साफ-सफाई सामान'}
                        {item.category === 'Baithne Ka Saman' && '🪑 बैठने का सामान'}
                        {item.category === 'Sajane Ka Saman' && '🌸 सजावट व स्टेज'}
                        {item.category === 'Khana Bnane Ka Saman' && '🍳 हलवाई बर्तन / भट्टी'}
                        {item.category === 'Lighting & Sound' && '💡 लाइटिंग व साउंड'}
                        {item.category === 'Bijli & Generator' && '⚡ जनरेटर व बिजली'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(item)}
                      className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                      title="पूरा विवरण व नाम बदलें"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => openGranularDeleteModal(item)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="मात्रा घटाएं या पूरा सामान हटाएं (Granular Delete / Adjust)"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h4 className="font-bold text-slate-900 text-sm leading-snug">{item.name}</h4>
                {item.hindiName && item.hindiName !== item.name && (
                  <p className="text-xs text-emerald-700 font-semibold mt-0.5">{item.hindiName}</p>
                )}
                <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">{item.description}</p>
              </div>

              {/* Stock Quantity Controller Section */}
              <div className="pt-2.5 mt-2.5 border-t border-slate-100 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[11px] font-bold text-slate-700">
                    <Package className="w-3.5 h-3.5 text-amber-600" />
                    <span>स्टॉक मात्रा:</span>
                    <span className="font-mono text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      {currentStock} {item.unit}
                    </span>
                  </div>
                  
                  {/* Stock fast buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleQuickStockAdjust(item.id, -10, currentStock, item.name)}
                      className="px-1.5 py-0.5 bg-slate-100 hover:bg-red-100 text-red-700 rounded text-[10px] font-bold font-mono cursor-pointer"
                      title="स्टॉक 10 घटाएं"
                    >
                      -10
                    </button>
                    <button
                      onClick={() => handleQuickStockAdjust(item.id, -1, currentStock, item.name)}
                      className="px-1.5 py-0.5 bg-slate-100 hover:bg-red-100 text-red-700 rounded text-[10px] font-bold font-mono cursor-pointer"
                      title="स्टॉक 1 घटाएं"
                    >
                      -1
                    </button>
                    <button
                      onClick={() => handleQuickStockAdjust(item.id, 1, currentStock, item.name)}
                      className="px-1.5 py-0.5 bg-slate-100 hover:bg-emerald-100 text-emerald-700 rounded text-[10px] font-bold font-mono cursor-pointer"
                      title="स्टॉक 1 बढ़ाएं"
                    >
                      +1
                    </button>
                    <button
                      onClick={() => handleQuickStockAdjust(item.id, 10, currentStock, item.name)}
                      className="px-1.5 py-0.5 bg-slate-100 hover:bg-emerald-100 text-emerald-700 rounded text-[10px] font-bold font-mono cursor-pointer"
                      title="स्टॉक 10 बढ़ाएं"
                    >
                      +10
                    </button>
                  </div>
                </div>
              </div>

              {/* Direct Price Editing Controller Section */}
              <div className="pt-2.5 mt-2 border-t border-slate-100 space-y-2">
                
                {/* Main Price input & unit */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 block font-semibold">किराया दर (प्रति दिन)</span>
                      {hasError && (
                        <span className="text-[10px] text-red-600 font-bold animate-pulse">
                          {inlinePriceErrors[item.id]}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-sm font-bold text-emerald-700 font-mono">₹</span>
                      <input
                        type="number"
                        min="10"
                        max="50000"
                        step="10"
                        value={item.pricePerDay}
                        onChange={(e) => handleInlinePriceSave(item.id, e.target.value)}
                        className={`w-24 px-2 py-1 bg-slate-50 border rounded-lg text-sm font-extrabold text-slate-900 font-mono focus:outline-none focus:ring-1 ${
                          hasError 
                            ? 'border-red-500 ring-1 ring-red-500 bg-red-50' 
                            : 'border-slate-200 hover:border-slate-300 focus:border-emerald-500 focus:bg-white focus:ring-emerald-500'
                        }`}
                      />
                      <span className="text-[11px] text-slate-500 truncate max-w-[90px]">/ {item.unit}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => openEditModal(item)}
                    className="text-[11px] text-slate-600 hover:text-emerald-700 font-semibold bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0"
                  >
                    संशोधन
                  </button>
                </div>

                {/* Quick Increment/Decrement Buttons */}
                <div className="flex items-center justify-between gap-1 pt-1 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-500 pl-1">त्वरित दर बदलें:</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleQuickAdjust(item.id, -50, item.pricePerDay, item.name)}
                      className="px-2 py-1 bg-white hover:bg-red-50 text-red-700 hover:text-red-800 border border-slate-200 hover:border-red-300 text-[10px] font-bold rounded-md transition-colors cursor-pointer font-mono"
                      title="दाम ₹50 कम करें"
                    >
                      -₹50
                    </button>
                    <button
                      onClick={() => handleQuickAdjust(item.id, -10, item.pricePerDay, item.name)}
                      className="px-1.5 py-1 bg-white hover:bg-red-50 text-red-700 hover:text-red-800 border border-slate-200 hover:border-red-300 text-[10px] font-bold rounded-md transition-colors cursor-pointer font-mono"
                      title="दाम ₹10 कम करें"
                    >
                      -₹10
                    </button>
                    <button
                      onClick={() => handleQuickAdjust(item.id, 10, item.pricePerDay, item.name)}
                      className="px-1.5 py-1 bg-white hover:bg-emerald-50 text-emerald-700 hover:text-emerald-800 border border-slate-200 hover:border-emerald-300 text-[10px] font-bold rounded-md transition-colors cursor-pointer font-mono"
                      title="दाम ₹10 बढ़ाएं"
                    >
                      +₹10
                    </button>
                    <button
                      onClick={() => handleQuickAdjust(item.id, 50, item.pricePerDay, item.name)}
                      className="px-2 py-1 bg-white hover:bg-emerald-50 text-emerald-700 hover:text-emerald-800 border border-slate-200 hover:border-emerald-300 text-[10px] font-bold rounded-md transition-colors cursor-pointer font-mono"
                      title="दाम ₹50 बढ़ाएं"
                    >
                      +₹50
                    </button>
                    <button
                      onClick={() => handleQuickAdjust(item.id, 100, item.pricePerDay, item.name)}
                      className="px-2 py-1 bg-white hover:bg-emerald-50 text-emerald-700 hover:text-emerald-800 border border-slate-200 hover:border-emerald-300 text-[10px] font-bold rounded-md transition-colors cursor-pointer font-mono"
                      title="दाम ₹100 बढ़ाएं"
                    >
                      +₹100
                    </button>
                  </div>
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {filteredAddons.length === 0 && (
        <div className="bg-white p-12 rounded-3xl border border-dashed border-slate-300 text-center space-y-2">
          <p className="text-sm font-bold text-slate-800">कोई सामान नहीं मिला</p>
          <p className="text-xs text-slate-500">कृपया खोज फ़िल्टर बदलें या नया सामान जोड़ें।</p>
        </div>
      )}

      {/* 1. ADD / EDIT ITEM MODAL WITH FULL VALIDATION */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div 
            className="relative bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  {editingItem ? <Edit className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">
                    {editingItem ? 'सामान व किराया दर संशोधित करें (Edit Item)' : 'नया सामान जोड़ें (Add Event Inventory Item)'}
                  </h3>
                  <p className="text-[11px] text-slate-400">सामान का नाम, मौसमी श्रेणी और किराया मूल्य तय करें</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  if (onCloseAddModal) onCloseAddModal();
                }}
                className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAddon} className="p-6 space-y-4 text-slate-800">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  सामान का नाम (English / Hinglish) *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="जैसे: High Speed Farrata Fan / Jumbo Cooler"
                  className={`w-full bg-slate-50 border rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none ${
                    formErrors.name ? 'border-red-500 bg-red-50' : 'border-slate-300'
                  }`}
                />
                {formErrors.name && (
                  <p className="text-[11px] text-red-600 font-semibold mt-1">{formErrors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  हिंदी नाम (Hindi Name) *
                </label>
                <input
                  type="text"
                  value={formHindiName}
                  onChange={(e) => setFormHindiName(e.target.value)}
                  placeholder="जैसे: हाई-स्पीड फर्राटा पंखा (कॉपर स्टैंड फैन)"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    कैटेगरी (Category) *
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as AddonCategory)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="Garmiyon Ka Saman">☀️ गर्मियों का सामान (पंखे, कूलर, ड्रम)</option>
                    <option value="Sardiyon Ka Saman">❄️ सर्दियों का सामान (हीटर, रजाई, सिगड़ी)</option>
                    <option value="Barsat Ka Saman">🌧️ बरसात का सामान (तिरपाल, तख्त)</option>
                    <option value="Saf-Safai Ka Saman">🧹 साफ-सफाई (वॉशबेसिन, डस्टबिन)</option>
                    <option value="Baithne Ka Saman">🪑 बैठने का सामान (Seating)</option>
                    <option value="Sajane Ka Saman">🌸 सजावट व गेट (Decor / Gate)</option>
                    <option value="Khana Bnane Ka Saman">🍳 हलवाई / खाना बनाने का सामान</option>
                    <option value="Lighting & Sound">💡 लाइटिंग व साउंड (Light & Sound)</option>
                    <option value="Bijli & Generator">⚡ जनरेटर व बिजली (Power / Gen)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    किराया दर / दिन (₹ Price) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">₹</span>
                    <input
                      type="number"
                      required
                      min="10"
                      max="50000"
                      step="5"
                      value={formPricePerDay}
                      onChange={(e) => setFormPricePerDay(e.target.value)}
                      className={`w-full bg-slate-50 border rounded-xl pl-7 pr-3 py-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono ${
                        formErrors.price ? 'border-red-500 bg-red-50' : 'border-slate-300'
                      }`}
                    />
                  </div>
                  {formErrors.price && (
                    <p className="text-[11px] text-red-600 font-semibold mt-1">{formErrors.price}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    इकाई (Unit) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    placeholder="जैसे: 1 पंखा / दिन, 1 कूलर / दिन, सेट"
                    className={`w-full bg-slate-50 border rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none ${
                      formErrors.unit ? 'border-red-500 bg-red-50' : 'border-slate-300'
                    }`}
                  />
                  {formErrors.unit && (
                    <p className="text-[11px] text-red-600 font-semibold mt-1">{formErrors.unit}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    उपलब्ध कुल स्टॉक (Stock Qty) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="10000"
                    value={formStockQuantity}
                    onChange={(e) => setFormStockQuantity(e.target.value)}
                    placeholder="उदा: 50"
                    className={`w-full bg-slate-50 border rounded-xl px-3 py-2 text-xs font-bold font-mono text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none ${
                      formErrors.stock ? 'border-red-500 bg-red-50' : 'border-slate-300'
                    }`}
                  />
                  {formErrors.stock && (
                    <p className="text-[11px] text-red-600 font-semibold mt-1">{formErrors.stock}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">विवरण (Description)</label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="सामान की संख्या, क्षमता, सुरक्षा और उपयोग बताएं..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    if (onCloseAddModal) onCloseAddModal();
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  {editingItem ? 'बदलाव सुरक्षित करें (Save Changes)' : 'सामान जोड़ें (Save Item)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. GRANULAR ITEM QUANTITY DELETION & ADJUSTMENT MODAL */}
      {granularDeleteModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div 
            className="relative bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400">
                  <Trash2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">
                    सामान / मात्रा हटाएं (Delete Options)
                  </h3>
                  <p className="text-[11px] text-slate-400">मात्रा घटाएं या पूरा सामान हमेशा के लिए हटाएं</p>
                </div>
              </div>
              <button
                onClick={() => setGranularDeleteModal(null)}
                className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-slate-800">
              
              {/* Item Info Card */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <h4 className="font-extrabold text-slate-900 text-sm">{granularDeleteModal.item.name}</h4>
                {granularDeleteModal.item.hindiName && (
                  <p className="text-xs text-emerald-700 font-semibold mt-0.5">{granularDeleteModal.item.hindiName}</p>
                )}
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200 text-xs">
                  <span className="text-slate-500">कुल वर्तमान स्टॉक:</span>
                  <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {granularDeleteModal.item.stockQuantity !== undefined ? granularDeleteModal.item.stockQuantity : 50} {granularDeleteModal.item.unit}
                  </span>
                </div>
              </div>

              {/* Mode Selection Tabs */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                  आप क्या करना चाहते हैं?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setGranularDeleteModal({ ...granularDeleteModal, deleteMode: 'reduce' })}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                      granularDeleteModal.deleteMode === 'reduce'
                        ? 'bg-amber-50 border-amber-500 text-amber-900 ring-2 ring-amber-500/20'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Package className="w-4 h-4 text-amber-600" />
                    <span>कुछ मात्रा घटाएं/हटाएं</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setGranularDeleteModal({ ...granularDeleteModal, deleteMode: 'full' })}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                      granularDeleteModal.deleteMode === 'full'
                        ? 'bg-red-50 border-red-500 text-red-900 ring-2 ring-red-500/20'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                    <span>पूरा सामान हटाएं</span>
                  </button>
                </div>
              </div>

              {/* Mode 1: Reduce quantity */}
              {granularDeleteModal.deleteMode === 'reduce' && (
                <div className="space-y-3 p-3.5 bg-amber-50/50 rounded-2xl border border-amber-200">
                  <div>
                    <label className="block text-xs font-bold text-amber-900 uppercase mb-1">
                      हटाने / घटाने की मात्रा दर्ज करें ({granularDeleteModal.item.unit}):
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max={granularDeleteModal.item.stockQuantity !== undefined ? granularDeleteModal.item.stockQuantity : 50}
                        value={granularDeleteModal.reduceQty}
                        onChange={(e) => setGranularDeleteModal({ 
                          ...granularDeleteModal, 
                          reduceQty: Math.max(1, Number(e.target.value)) 
                        })}
                        className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2 text-sm font-bold font-mono text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setGranularDeleteModal({ 
                          ...granularDeleteModal, 
                          reduceQty: granularDeleteModal.item.stockQuantity !== undefined ? granularDeleteModal.item.stockQuantity : 50 
                        })}
                        className="px-2.5 py-2 bg-amber-200 hover:bg-amber-300 text-amber-900 text-[11px] font-bold rounded-xl whitespace-nowrap cursor-pointer"
                      >
                        पूरा स्टॉक ({granularDeleteModal.item.stockQuantity !== undefined ? granularDeleteModal.item.stockQuantity : 50})
                      </button>
                    </div>
                  </div>

                  <div className="text-xs text-amber-950 font-medium pt-1">
                    घटाने के बाद शेष स्टॉक रहेगा:{' '}
                    <strong className="font-mono font-bold text-emerald-800">
                      {Math.max(0, (granularDeleteModal.item.stockQuantity !== undefined ? granularDeleteModal.item.stockQuantity : 50) - granularDeleteModal.reduceQty)}{' '}
                      {granularDeleteModal.item.unit}
                    </strong>
                  </div>
                </div>
              )}

              {/* Mode 2: Full delete warning */}
              {granularDeleteModal.deleteMode === 'full' && (
                <div className="p-3.5 bg-red-50 rounded-2xl border border-red-200 space-y-1">
                  <div className="flex items-center gap-1.5 text-red-700 font-bold text-xs">
                    <AlertTriangle className="w-4 h-4" />
                    <span>स्थायी रूप से हटाने की पुष्टि</span>
                  </div>
                  <p className="text-xs text-red-600 leading-relaxed">
                    यह सामान कैटलॉग और इन्वेंटरी से पूरी तरह हटा दिया जाएगा।
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setGranularDeleteModal(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  रद्द करें
                </button>
                <button
                  type="button"
                  onClick={handleConfirmGranularDelete}
                  className={`px-5 py-2 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                    granularDeleteModal.deleteMode === 'full'
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-amber-600 hover:bg-amber-700'
                  }`}
                >
                  {granularDeleteModal.deleteMode === 'full' ? (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>पूरा सामान हटाएं (Delete Item)</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>{granularDeleteModal.reduceQty} मात्रा हटाएं (Reduce Stock)</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* 2. BULK PRICE ADJUSTMENT MODAL WITH VALIDATION */}
      {showBulkModal && (
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
                    थोक दाम संशोधन (Bulk Price Adjustment)
                  </h3>
                  <p className="text-[11px] text-slate-400">एक साथ सभी मौसमी सामान का दाम % या निश्चित ₹ बढ़ाएं या घटाएं</p>
                </div>
              </div>
              <button
                onClick={() => setShowBulkModal(false)}
                className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleApplyBulkAdjust} className="p-6 space-y-4 text-slate-800">
              
              {/* Increase / Decrease Toggle */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">दाम बढ़ाना या घटाना है?</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setBulkAction('increase')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                      bulkAction === 'increase'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-500/20'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    <span>दाम बढ़ाएं (+ Increase)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBulkAction('decrease')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                      bulkAction === 'decrease'
                        ? 'bg-red-50 border-red-500 text-red-800 ring-2 ring-red-500/20'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <TrendingDown className="w-4 h-4 text-red-600" />
                    <span>दाम घटाएं (- Decrease)</span>
                  </button>
                </div>
              </div>

              {/* Mode: Percentage vs Fixed Amount */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">बदलाव का प्रकार (Mode)</label>
                  <select
                    value={bulkMode}
                    onChange={(e) => setBulkMode(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="percentage">प्रतिशत दर (% Percentage)</option>
                    <option value="fixed">निश्चित रुपया (₹ Fixed Amount)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    {bulkMode === 'percentage' ? 'प्रतिशत (%)' : 'राशि (₹)'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={bulkAmount}
                    onChange={(e) => setBulkAmount(Number(e.target.value))}
                    placeholder={bulkMode === 'percentage' ? 'उदा: 15' : 'उदा: 50'}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Category Target */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">लागू करने की श्रेणी (Category Target)</label>
                <select
                  value={bulkCategory}
                  onChange={(e) => setBulkCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="All">सभी सामान (All Items - {addons.length} items)</option>
                  <option value="Garmiyon Ka Saman">☀️ केवल गर्मियों का सामान (Summer)</option>
                  <option value="Sardiyon Ka Saman">❄️ केवल सर्दियों का सामान (Winter)</option>
                  <option value="Barsat Ka Saman">🌧️ केवल बरसात का सामान (Monsoon)</option>
                  <option value="Saf-Safai Ka Saman">🧹 केवल साफ-सफाई सामान (Sanitation)</option>
                  <option value="Baithne Ka Saman">🪑 केवल बैठने का सामान (Seating)</option>
                  <option value="Sajane Ka Saman">🌸 केवल सजावट व गेट (Decor)</option>
                  <option value="Khana Bnane Ka Saman">🍳 केवल हलवाई बर्तन / भट्टी (Cooking)</option>
                  <option value="Lighting & Sound">💡 केवल लाइटिंग व साउंड</option>
                  <option value="Bijli & Generator">⚡ केवल जनरेटर व बिजली</option>
                </select>
              </div>

              {/* Preview Box */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs space-y-1">
                <span className="font-bold text-slate-800 block">उदाहरण पूर्वावलोकन (Preview):</span>
                <p className="text-slate-600">
                  ₹500 वाले सामान का नया किराया: {' '}
                  <strong className="text-emerald-800 font-mono">
                    ₹{bulkAction === 'increase' 
                      ? (bulkMode === 'percentage' ? Math.round(500 + (500 * (bulkAmount / 100))) : 500 + bulkAmount)
                      : (bulkMode === 'percentage' ? Math.max(10, Math.round(500 - (500 * (bulkAmount / 100)))) : Math.max(10, 500 - bulkAmount))
                    }
                  </strong>
                </p>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowBulkModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>लागू करें (Apply to All)</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

