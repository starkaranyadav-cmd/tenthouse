import React, { useState } from 'react';
import { Tent } from '../../types';
import { 
  X, Users, Maximize2, ShieldCheck, Wind, Clock, CheckCircle2, 
  Star, Calendar, ArrowRight, Sparkles, Layers, ChevronRight, MessageSquare
} from 'lucide-react';

interface TentDetailModalProps {
  tent: Tent | null;
  isOpen?: boolean;
  onClose: () => void;
  onBookTent?: (tent: Tent) => void;
  onBookNow?: (tent: Tent) => void;
}

export const TentDetailModal: React.FC<TentDetailModalProps> = ({
  tent,
  isOpen = true,
  onClose,
  onBookTent,
  onBookNow
}) => {
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  if (!isOpen || !tent) return null;

  const handleBook = onBookNow || onBookTent || (() => {});
  const images = tent.images && tent.images.length > 0 ? tent.images : [];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      
      {/* Modal Container */}
      <div 
        className="relative bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white flex items-center justify-center backdrop-blur-md transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-8">
          
          {/* Top Gallery View */}
          <div className="space-y-3">
            <div className="relative h-64 sm:h-80 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
              <img
                src={images[activeImageIdx] || images[0]}
                alt={tent.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3.5 left-3.5 flex gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-900/85 text-emerald-300 backdrop-blur-md border border-emerald-500/20">
                  {tent.category}
                </span>
                {tent.isPopular && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500 text-slate-950 shadow-xs">
                    ★ Most Requested
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnail Row */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIdx(idx)}
                    className={`relative w-20 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                      activeImageIdx === idx ? 'border-emerald-600 scale-95' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title & Price Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <div className="flex items-center text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-3.5 h-3.5 ${i < Math.floor(tent.rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} 
                    />
                  ))}
                </div>
                <span className="text-xs font-bold text-slate-900">{tent.rating.toFixed(2)}</span>
                <span className="text-xs text-slate-500">({tent.reviewCount} customer reviews)</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">{tent.name}</h2>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                In Stock & Available for Immediate Reservation ({tent.stockQuantity} fleet units)
              </p>
            </div>

            <div className="sm:text-right bg-emerald-50/80 p-3.5 rounded-2xl border border-emerald-200/80 shrink-0">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">Standard Daily Rate</span>
              <div className="flex items-baseline sm:justify-end gap-1">
                <span className="text-2xl font-extrabold text-slate-950 font-mono">₹{tent.pricePerDay.toLocaleString('en-IN')}</span>
                <span className="text-xs text-slate-600 font-medium">/ 24 hrs</span>
              </div>
              {tent.weeklyDiscountPercentage > 0 && (
                <span className="inline-block mt-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  {tent.weeklyDiscountPercentage}% Multi-Day Discount
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Architectural Overview</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {tent.description}
            </p>
          </div>

          {/* Detailed Engineering Specifications Matrix */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Engineering & Dimension Specs</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                  <Maximize2 className="w-3.5 h-3.5 text-emerald-600" />
                  Dimensions
                </div>
                <span className="text-xs font-bold text-slate-900 block leading-tight">{tent.detailedSpecs.dimensions}</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                  <Users className="w-3.5 h-3.5 text-emerald-600" />
                  Guest Capacity
                </div>
                <span className="text-xs font-bold text-slate-900 block leading-tight">
                  {tent.detailedSpecs.capacitySeated} Seated / {tent.detailedSpecs.capacityStanding} Standing
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                  <Wind className="w-3.5 h-3.5 text-emerald-600" />
                  Wind Resistance
                </div>
                <span className="text-xs font-bold text-slate-900 block leading-tight">{tent.detailedSpecs.windResistance}</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  Setup Duration
                </div>
                <span className="text-xs font-bold text-slate-900 block leading-tight">{tent.detailedSpecs.setupTime}</span>
              </div>
            </div>

            {/* Sub-specifications list */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Waterproof & UV Standard:</span>
                <span className="font-semibold text-slate-900">{tent.detailedSpecs.waterproofRating}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Structural Frame Material:</span>
                <span className="font-semibold text-slate-900">{tent.detailedSpecs.frameMaterial}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Apex Ceiling Clearance:</span>
                <span className="font-semibold text-slate-900">{tent.detailedSpecs.peakHeight}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Compatible Ground Surfaces:</span>
                <span className="font-semibold text-emerald-800">
                  {tent.supportedSurfaces.join(', ')}
                </span>
              </div>
            </div>
          </div>

          {/* Key Features & Included Hardware */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">Key Highlights</h3>
              <ul className="space-y-2 text-xs text-slate-700">
                {tent.features.map((feat, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">Included in Standard Rental</h3>
              <ul className="space-y-2 text-xs text-slate-700">
                {tent.includedItems.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Customer Reviews Section */}
          {tent.reviews && tent.reviews.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-200">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Customer Experience & Reviews</h3>
              </div>
              <div className="space-y-3">
                {tent.reviews.map(rev => (
                  <div key={rev.id} className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{rev.userName}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-medium">
                          {rev.eventType}
                        </span>
                      </div>
                      <div className="flex text-amber-400">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-600 italic">"{rev.comment}"</p>
                    <span className="text-[10px] text-slate-400 block">{rev.date}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Sticky Bottom Action Bar */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-xs text-slate-500 font-medium">Reserve for your event dates:</span>
            <p className="text-xs sm:text-sm font-bold text-slate-900">
              ₹{tent.pricePerDay.toLocaleString('en-IN')} / day + Professional Setup & Rigging
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="w-1/2 sm:w-auto px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              Back to Catalog
            </button>
            <button
              onClick={() => {
                onClose();
                handleBook(tent);
              }}
              className="w-1/2 sm:w-auto px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5" />
              Configure & Book Now
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
