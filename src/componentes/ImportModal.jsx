import React from 'react';
import { CheckCircle2, Database, UploadCloud, X } from 'lucide-react';

export const ImportModal = ({ isOpen, onClose, importStatus, importType, setImportType, importMode, setImportMode, isProcessing, handleFileUpload }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4">
      <div className="bg-white w-full max-w-lg max-h-[95vh] overflow-y-auto rounded-[2.5rem] md:rounded-[4rem] shadow-2xl p-8 md:p-12 text-center custom-scrollbar relative">
        <button onClick={onClose} className="absolute top-8 right-8 text-slate-300 hover:text-slate-900 transition-colors">
          <X size={24} />
        </button>

        {importStatus ? (
          <div className="py-10">
            <div className="w-20 h-20 rounded-full bg-green-100 text-green-500 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={48} />
            </div>
            <h3 className="text-2xl font-black uppercase mb-2 italic">Pronto!</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              {importStatus.count} novos itens em {importStatus.type}
            </p>
            <button 
              onClick={onClose}
              className="mt-8 bg-slate-900 text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase shadow-xl hover:bg-black transition-all"
            >
              Concluído
            </button>
          </div>
        ) : (
          <>
            <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center mx-auto mb-6 shadow-2xl">
              <Database size={32} />
            </div>
            <h3 className="text-xl font-black uppercase mb-2 italic">Nova Importação</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-6 leading-relaxed px-4">
              Escolha o destino dos produtos para começar.
            </p>

            <div className="flex gap-3 mb-6">
              <button onClick={() => setImportType('main')} className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${importType === 'main' ? 'bg-slate-900 text-white border-slate-900 shadow-xl' : 'bg-white text-slate-400 border-slate-100'}`}>Vitrine Geral</button>
              <button onClick={() => setImportType('hot')} className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${importType === 'hot' ? 'bg-orange-600 text-white border-orange-600 shadow-xl' : 'bg-white text-slate-400 border-slate-100'}`}>Selo Hot</button>
            </div>

            {/* Modo de Importação: Substituir ou Adicionar */}
            <div className="mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] mb-4">Ação na Base de Dados</p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setImportMode('append')} 
                  className={`flex-1 py-3 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all border ${importMode === 'append' ? 'bg-white border-slate-900 text-slate-900 shadow-md' : 'bg-transparent text-slate-300 border-slate-200'}`}
                >
                  Adicionar Novos
                </button>
                <button 
                  onClick={() => setImportMode('replace')} 
                  className={`flex-1 py-3 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all border ${importMode === 'replace' ? 'bg-red-50 border-red-200 text-red-600 shadow-md' : 'bg-transparent text-slate-300 border-slate-200'}`}
                >
                  Substituir Tudo
                </button>
              </div>
            </div>
            
            <label className="group block w-full border-4 border-dashed border-slate-100 rounded-[2rem] p-8 md:p-12 transition-all cursor-pointer hover:border-slate-900 hover:bg-slate-50">
              {isProcessing ? (
                <div className="w-12 h-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto"></div>
              ) : (
                <>
                  <UploadCloud size={48} className="mx-auto mb-4 text-slate-200 group-hover:text-slate-900 transition-colors" />
                  <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Selecionar Planilha CSV</span>
                  <input type="file" className="hidden" accept=".csv" onChange={handleFileUpload} />
                </>
              )}
            </label>
            <button onClick={onClose} className="mt-10 text-[10px] font-black uppercase text-slate-300 hover:text-slate-800 tracking-widest transition-all">Cancelar</button>
          </>
        )}
      </div>
    </div>
  );
};