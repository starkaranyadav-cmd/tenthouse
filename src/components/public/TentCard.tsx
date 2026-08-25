import React, { useState } from 'react';
import { Tent } from '../../types';
import { Users, Maximize2, ShieldCheck, Star, ChevronLeft, ChevronRight, Wind, Calendar, Layers } from 'lucide-react';

interface TentCardProps {
  tent: Tent;
  onSelectTent: (tent: Tent) => void;
  onBookTent: (tent: Tent) => void;
}

export const TentCard: React.FC<TentCardProps> = ({
  tent,
  onSelectTent,
  onBookTent
}) => {
  const [currentImageIdx, setCurrentImageIdx] = useState(0);

  const images = tent.images && tent.images.length > 0 
    ? tent.images 
    : ['https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80'];

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIdx((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIdx((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-slate-200/90 hover:border-emerald-500/60 hover:shadow-md transition-all duration-300 flex flex-col justify-between">
      
      {/* Top Image Box */}
      <div className="relative h-60 w-full overflow-hidden bg-slate-100">
        <img
          src={images[currentImageIdx]}
          alt={tent.name}
          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
          loading="lazy"
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start pointer-events-none">
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-slate-900/85 backdrop-blur-md text-emerald-300 border border-emerald-500/20 shadow-xs pointer-events-auto">
            {tent.category}
          </span>
          {tent.isPopular && (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500 text-slate-950 shadow-xs pointer-events-auto">
              ★ Popular
            </span>
          )}
        </div>

        {/* Carousel Arrows (if multiple images) */}
        {images.length > 1 && (
          <div className="absolute inset-y-0 inset-x-2 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={prevImage}
              aria-label="Previous Photo"
              className="w-7 h-7 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white flex items-center justify-center backdrop-blur-xs transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextImage}
              aria-label="Next Photo"
              className="w-7 h-7 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white flex items-center justify-center backdrop-blur-xs transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Image Dots */}
        {images.length > 1 && (
          <div className="absolute bottom-2.5 inset-x-0 flex justify-center gap-1.5 pointer-events-none">
            {images.map((_, idx) => (
              <span
                key={idx}
                className={`h-1.5 rounded-full transition-all ${
                  idx === currentImageIdx ? 'w-4 bg-emerald-400' : 'w-1.5 bg-white/60'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        
        <div className="space-y-2">
          {/* Rating & Stock Status */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 text-slate-700 font-semibold">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{tent.rating.toFixed(2)}</span>
              <span className="text-slate-400 font-normal text-[11px]">({tent.reviewCount} reviews)</span>
            </div>
            <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
              tent.stockQuantity > 2 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}>
              {tent.stockQuantity} in Fleet
            </span>
          </div>

          {/* Title */}
          <h3 
            onClick={() => onSelectTent(tent)}
            className="text-base font-bold text-slate-900 leading-snug group-hover:text-emerald-700 transition-colors cursor-pointer"
          >
            {tent.name}
          </h3>

          {/* Description snippet */}
          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {tent.description}
          </p>
        </div>

        {/* Key Technical Metric Badges */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs text-slate-700">
          <div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-xl border border-slate-100">
            <Users className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-500 block">Capacity</span>
              <span className="font-semibold text-xs">{tent.detailedSpecs.capacitySeated} Seated / {tent.detailedSpecs.capacityStanding} Std</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-xl border border-slate-100">
            <Maximize2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-500 block">Footprint</span>
              <span className="font-semibold text-xs truncate">{tent.detailedSpecs.dimensions.split('(')[0]}</span>
            </div>
          </div>
        </div>

        {/* Wind Rating & Waterproof Tag */}
        <div className="flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1">
            <Wind className="w-3.5 h-3.5 text-slate-400" />
            <span>{tent.detailedSpecs.windResistance}</span>
          </div>
          <div className="flex items-center gap-1 text-emerald-700 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>100% Weather Shield</span>
          </div>
        </div>

        {/* Pricing & CTA Buttons */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Daily Rate</span>
            <div className="flex items-baseline gap-0.5">
              <span className="text-lg font-extrabold text-slate-900 font-mono">₹{tent.pricePerDay.toLocaleString('en-IN')}</span>
              <span className="text-xs text-slate-500">/day</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onSelectTent(tent)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Specs
            </button>
            <button
              onClick={() => onBookTent(tent)}
              className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs hover:shadow transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5" />
              Book
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
