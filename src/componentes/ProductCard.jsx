import React, { memo } from 'react';
import { Zap, Star, ExternalLink, Info, Flame, AlertCircle } from 'lucide-react';
import { formatBRL, parsePrice } from '../helpers';
import { CategoryIcon } from './CategoryIcon';

export const ProductCard = memo(({ item, config, onToggleExpand, isExpanded, isAdminMode }) => {
  const discount = item.oldPrice > 0 ? Math.round(((item.oldPrice - item.price) / item.oldPrice) * 100) : 0;

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-100 flex flex-col h-full hover:shadow-2xl transition-all group relative">
      <div className="relative aspect-square bg-slate-50 p-6 flex items-center justify-center overflow-hidden">
        <img 
          src={config?.customImage || item.image} 
          className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-700" 
          alt={item.title}
          loading="lazy"
        />
        <div className="absolute top-5 left-5 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm text-[9px] font-black flex items-center gap-1 border border-slate-100 uppercase">
          <CategoryIcon cat={item.category} /> {item.category}
        </div>
        {discount > 0 && (
          <div className="absolute top-5 right-5 bg-green-600 text-white px-2 py-1 rounded-lg text-[10px] font-black shadow-lg z-10">
            -{discount}%
          </div>
        )}
        {isAdminMode && !config?.affiliateLink && (
          <div className="absolute bottom-5 right-5 bg-red-500 text-white px-3 py-1.5 rounded-full shadow-lg text-[9px] font-black flex items-center gap-1 border border-red-400 uppercase z-20 animate-bounce">
            <AlertCircle size={10} /> Link Pendente
          </div>
        )}
        {config?.isPromotional && (
          <div className="absolute top-5 right-5 bg-[#EE4D2D] text-white px-3 py-1.5 rounded-full shadow-lg text-[9px] font-black flex items-center gap-1 border border-orange-400 uppercase animate-pulse">
            <Flame size={10} fill="currentColor" /> Promoção
          </div>
        )}
      </div>

      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1 text-[9px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full uppercase">
            <Zap size={10} /> Verificado
          </div>
           {/* Ícone de Informação e Balão (Tooltip) */}
          <div className="flex items-center relative">
            <button 
              onClick={() => onToggleExpand(item.uid)}
              className={`transition-all p-1.5 rounded-full ${isExpanded ? 'text-slate-900 bg-slate-100' : 'text-slate-300 hover:text-slate-600'}`}
            >
              <Info size={18} />
            </button>

            {isExpanded && (
              <div className="absolute bottom-full left-0 mb-3 w-64 bg-slate-900 text-white p-4 rounded-2xl shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200 origin-bottom-left">
                <p className="text-[10px] leading-relaxed italic font-medium whitespace-pre-line">
                  {config?.customDesc || item.description || "Oferta selecionada pela nossa equipe de curadoria."}
                </p>
                {/* Seta do Balão */}
                <div className="absolute -bottom-1 left-3 w-3 h-3 bg-slate-900 rotate-45"></div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-0.5 text-yellow-400">
            <Star size={10} fill="currentColor" />
            <span className="text-[10px] font-black text-slate-900">{item.rating}</span>
          </div>
        </div>
        

        <h3 className="text-[13px] font-bold text-slate-800 line-clamp-2 mb-4 h-10 uppercase leading-tight">
          {config?.customTitle || item.title}
        </h3>

        <div className="mt-auto">
          <div className="flex items-end justify-between mb-4">
            <div>
              {item.oldPrice > 0 && (
                <div className="text-[10px] text-slate-300 line-through font-bold mb-0.5">
                  {formatBRL(item.oldPrice)}
                </div>
              )}
              <div className="text-2xl font-black text-slate-900 tracking-tighter leading-none">
                {formatBRL(config?.customPixPrice ? parsePrice(config.customPixPrice) : (item.pixPrice || item.price))}
              </div>
              <div className="text-[10px] font-bold text-[#EE4D2D] uppercase tracking-wide">
                no PIX
              </div>
            </div>
            <a 
              href={config?.affiliateLink || item.originalLink} 
              target="_blank" 
              className="bg-slate-900 text-white p-3.5 rounded-2xl hover:bg-[#EE4D2D] transition-all shadow-lg group-hover:scale-105"
            >
              <ExternalLink size={18} />
            </a>
          </div>

          {item.price > 0 && (
             <div className="text-[10px] font-medium text-slate-400">
               Ou {formatBRL(item.price)} no cartão
             </div>
          )}
        </div>
      </div>
    </div>
  );
});
