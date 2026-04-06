import React from 'react';
import { Search, ShoppingBag, Settings, Link2Off } from 'lucide-react';

export const Header = ({ searchTerm, setSearchTerm, onOpenAdmin, showPendingOnly, setShowPendingOnly }) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="bg-[#EE4D2D] p-3 rounded-2xl shadow-lg shadow-orange-100">
            <ShoppingBag className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter uppercase italic">
             Vitrine|<span className="text-[#EE4D2D]">Frozen</span>
            </h1>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">
              Cards Estruturados
            </p>
          </div>
        </div>

        <div className="relative flex-1 max-w-xl w-full">
          <input 
            type="text" 
            placeholder="Buscar produtos na vitrine..."
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 px-12 text-sm outline-none focus:ring-4 focus:ring-orange-50 transition-all shadow-inner"
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-4 top-4 text-slate-300" size={18} />
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowPendingOnly(false)}
            className={`px-4 py-3.5 rounded-2xl font-black text-xs uppercase flex items-center gap-2 transition-all border ${!showPendingOnly ? 'bg-green-600 text-white border-green-600 shadow-lg' : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50'}`}
            title="Mostrar apenas produtos com link de afiliado"
          >
            <ShoppingBag size={18} /> Padronizados
          </button>
          <button 
            onClick={() => setShowPendingOnly(true)}
            className={`px-4 py-3.5 rounded-2xl font-black text-xs uppercase flex items-center gap-2 transition-all border ${showPendingOnly ? 'bg-red-500 text-white border-red-500 shadow-lg' : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50'}`}
            title="Mostrar apenas produtos sem link de afiliado"
          >
            <Link2Off size={18} /> Pendentes
          </button>
        </div>

        <button onClick={onOpenAdmin} className="bg-slate-900 text-white px-6 py-3.5 rounded-2xl font-black text-xs uppercase flex items-center gap-2 shadow-xl hover:bg-slate-800 transition-all">
          <Settings size={18} /> Painel de Gestão
        </button>
      </div>
    </header>
  );
};