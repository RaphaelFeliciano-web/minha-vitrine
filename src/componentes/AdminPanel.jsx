import React, { useMemo, useState, useEffect } from 'react';
import { X, Flame, UploadCloud, Search, Power, Trash2, ExternalLink, Filter, Download, Copy, ClipboardCheck, CircleHelp, Sparkles, Eraser, Database, History, LayoutGrid, CheckCircle2 } from 'lucide-react';

export const AdminPanel = ({ 
  isOpen, 
  onClose, 
  adminTab, 
  setAdminTab, 
  products, 
  hotProducts, 
  adminSearch, 
  setAdminSearch, 
  productConfigs, 
  updateConfig, 
  bulkUpdateConfigs,
  onPurge,
  onClearAll,
  onOpenImport 
}) => {
  const [batchLinks, setBatchLinks] = useState('');
  const [showNoLinkOnly, setShowNoLinkOnly] = useState(false);
  const [showLinkedOnly, setShowLinkedOnly] = useState(false);
  const [filterCategory, setFilterCategory] = useState(null);
  const [showHiddenOnly, setShowHiddenOnly] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [shopeeBatch, setShopeeBatch] = useState([]);
  const [recentIds, setRecentIds] = useState([]);

  useEffect(() => {
    if (!isOpen) setShopeeBatch([]);
  }, [isOpen]);

  useEffect(() => {
    setFilterCategory(null);
    setShowHiddenOnly(false);
  }, [adminTab]);

  // Função auxiliar para rastrear alterações recentes
  const addToRecent = (ids) => {
    const idArray = Array.isArray(ids) ? ids : [ids];
    setRecentIds(prev => {
      const filtered = prev.filter(id => !idArray.includes(id));
      return [...idArray, ...filtered].slice(0, 30); // Mantém os últimos 30
    });
  };

  const recentList = useMemo(() => {
    const all = [...products, ...hotProducts];
    return recentIds.map(id => all.find(p => p.uid === id)).filter(Boolean);
  }, [recentIds, products, hotProducts]);

  const currentList = adminTab === 'recent' ? recentList : (adminTab === 'geral' ? products : hotProducts);

  const categoryStats = useMemo(() => {
    if (!isOpen) return {}; // Evita processar se o painel estiver fechado
    const stats = {};
    currentList.forEach(p => {
      if (!stats[p.category]) stats[p.category] = { active: 0, hidden: 0 };
      if (productConfigs[p.uid]?.isActive !== false) {
        stats[p.category].active++;
      } else {
        stats[p.category].hidden++;
      }
    });
    return stats;
  }, [isOpen, currentList, productConfigs]);

  const globalStats = useMemo(() => {
    if (!isOpen) return { total: 0, active: 0, pending: 0, hot: 0 }; // Evita processar se o painel estiver fechado
    const all = [...products, ...hotProducts];
    
    // Calcula em uma única passada para melhor performance
    let activeCount = 0;
    let pendingCount = 0;
    let linkedCount = 0;
    all.forEach(p => {
      const config = productConfigs[p.uid];
      if (config?.isActive !== false) activeCount++;
      if (config?.affiliateLink) linkedCount++;
      else pendingCount++;
    });

    return {
      total: all.length,
      active: activeCount,
      pending: pendingCount,
      linked: linkedCount,
      hot: hotProducts.length
    };
  }, [isOpen, products, hotProducts, productConfigs]);

  // Filtra a lista administrativa.
  const filteredList = useMemo(() => {
    return currentList.filter(p => {
      const config = productConfigs[p.uid];
      const matchesSearch = (config?.customTitle || p.title).toLowerCase().includes(adminSearch.toLowerCase());
      if (!matchesSearch) return false;

      const isActive = config?.isActive !== false;
      const hasLink = !!config?.affiliateLink;

      if (filterCategory && p.category !== filterCategory) return false;
      if (showHiddenOnly) return !isActive;
      
      // Filtros de Status (Pendentes ou Padronizados)
      if (showNoLinkOnly) return !hasLink && isActive;
      if (showLinkedOnly) return hasLink && isActive;

      return true;
    });
  }, [currentList, adminSearch, productConfigs, showNoLinkOnly, showLinkedOnly, filterCategory, showHiddenOnly]);

  // O retorno condicional DEVE ficar aqui, após a definição de filteredList
  if (!isOpen) return null;

  const categoriesInList = Object.keys(categoryStats).sort();

  const handleDeactivateCategory = (cat) => {
    const updates = currentList
      .filter(p => p.category === cat)
      .map(p => ({
        uid: p.uid,
        field: 'isActive',
        value: false
      }));
    bulkUpdateConfigs(updates);
    addToRecent(updates.map(u => u.uid));
  };

  const handleActivateCategory = (cat) => {
    const updates = currentList
      .filter(p => p.category === cat)
      .map(p => ({
        uid: p.uid,
        field: 'isActive',
        value: true
      }));
    bulkUpdateConfigs(updates);
    addToRecent(updates.map(u => u.uid));
  };

  const toggleBatchItem = (p) => {
    const isSelected = shopeeBatch.some(item => item.uid === p.uid);
    if (isSelected) {
      setShopeeBatch(prev => prev.filter(item => item.uid !== p.uid));
    } else {
      if (shopeeBatch.length >= 5) {
        alert("Regra: Selecione no máximo 5 itens por lote.");
        return;
      }
      setShopeeBatch(prev => [...prev, { 
        uid: p.uid, 
        title: productConfigs[p.uid]?.customTitle || p.title, 
        originalLink: p.originalLink, 
        // Guarda o link que veio na planilha (Offer Link) se ele existir no objeto do item
        affiliateLink: p.affiliateLink || productConfigs[p.uid]?.affiliateLink || '' 
      }]);
    }
  };

  const handlePrepareShopeeBatch = () => {
    const pending = filteredList.filter(p => !productConfigs[p.uid]?.affiliateLink).slice(0, 5);
    setShopeeBatch(pending.map(p => ({ 
      uid: p.uid, 
      title: productConfigs[p.uid]?.customTitle || p.title, 
      originalLink: p.originalLink, 
      affiliateLink: '' 
    })));
  };

  const handleUpdateBatchItem = (uid, value) => {
    setShopeeBatch(prev => prev.map(item => item.uid === uid ? { ...item, affiliateLink: value } : item));
  };

  const handleBatchPaste = (text) => {
    setBatchLinks(text);
    // Regex robusta: busca qualquer URL que comece com http/https em qualquer lugar do texto
    const links = text.match(/https?:\/\/[^\s,]+/g) || [];
    setShopeeBatch(prev => prev.map((item, idx) => ({
      ...item,
      affiliateLink: links[idx] ? links[idx] : item.affiliateLink
    })));
  };

  const handleApplyShopeeBatch = () => {
    const updates = shopeeBatch
      .filter(item => item.affiliateLink.trim() !== '')
      .map(item => ({
        uid: item.uid,
        field: 'affiliateLink',
        value: item.affiliateLink
      }));
    
    bulkUpdateConfigs(updates);
    setShopeeBatch([]);
    addToRecent(updates.map(u => u.uid));
    setBatchLinks(''); // Limpa a área de colagem após aplicar
    alert(`${updates.length} links vinculados com sucesso!`);
  };

  const handleCopyOriginals = () => {
    const listToCopy = shopeeBatch.length > 0 ? shopeeBatch : filteredList.slice(0, 5);
    const toCopy = listToCopy.map(p => p.originalLink).join('\n');
    navigator.clipboard.writeText(toCopy);
    // Feedback visual simples ao invés de alert
    const btn = document.getElementById('copy-batch-btn');
    const originalText = btn.innerHTML;
    btn.innerHTML = "Copiado!";
    setTimeout(() => btn.innerHTML = originalText, 2000);
  };

  const handleApplyBatchLinks = () => {
    const links = batchLinks.split('\n').map(l => l.trim()).filter(l => l !== '');
    if (links.length === 0) return;

    const itemsToUpdate = filteredList.slice(0, 50);
    const updates = itemsToUpdate.map((item, index) => {
      if (links[index]) {
        return { uid: item.uid, field: 'affiliateLink', value: links[index] };
      }
      return null;
    }).filter(Boolean);

    bulkUpdateConfigs(updates);
    addToRecent(updates.map(u => u.uid));
    setBatchLinks('');
    alert(`${updates.length} links de afiliado aplicados com sucesso!`);
  };

  const handleDownloadMissingCSV = () => {
    const missing = currentList.filter(p => !productConfigs[p.uid]?.affiliateLink);
    if (missing.length === 0) {
      alert("Nenhum produto sem link encontrado nesta aba.");
      return;
    }

    const headers = ["Titulo", "Link Original", "Categoria"];
    const csvRows = [
      headers.join(","),
      ...missing.map(p => [
        `"${(productConfigs[p.uid]?.customTitle || p.title).replace(/"/g, '""')}"`,
        `"${p.originalLink}"`,
        `"${p.category}"`
      ].join(","))
    ];

    const csvContent = "\uFEFF" + csvRows.join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `produtos_sem_link_${adminTab}.csv`);
    link.click();
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/90 backdrop-blur-xl p-4 md:p-6 lg:p-10">
      <div className="bg-white w-full max-w-[1600px] h-full rounded-[2rem] flex overflow-hidden relative shadow-2xl border border-white/20">
        
        {/* Modal de Ajuda / Instruções */}
        {showHelp && (
          <div className="absolute inset-0 z-[130] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-6">
            <div className="bg-white w-full max-w-2xl rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in-95">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-2xl font-black uppercase italic text-slate-800">Guia de Processo</h3>
                <button onClick={() => setShowHelp(false)} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200"><X size={20}/></button>
              </div>
              <div className="space-y-6 text-slate-600">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold shrink-0">1</div>
                  <p className="text-sm"><b>Filtre os Pendentes:</b> Use o botão "Sem Link" para isolar produtos que ainda não possuem link de afiliado.</p>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold shrink-0">2</div>
                  <p className="text-sm"><b>Conversão em Lote:</b> Copie os links e leve-os ao portal da Shopee. <b>Dica:</b> Use o <i>Sub_id 1</i> como "Vitrine" para rastrear sua origem!</p>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold shrink-0">3</div>
                  <p className="text-sm"><b>Aplicação:</b> Cole a lista de links gerados na caixa de texto e aplique. O sistema casa os links na ordem correta.</p>
                </div>
              </div>
              <button onClick={() => setShowHelp(false)} className="w-full mt-8 bg-slate-900 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest">Entendi!</button>
            </div>
          </div>
        )}

        {/* --- CONTEÚDO PRINCIPAL (HEADER + WORKSPACE) --- */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
          
          {/* Header Superior Interno */}
          <header className="px-6 py-4 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
             <div className="flex items-center gap-8">
                <div className="flex flex-col border-r border-slate-100 pr-8">
                  <h2 className="text-slate-900 text-lg font-black italic tracking-tighter uppercase leading-none">Painel<span className="text-orange-600">Pro</span></h2>
                  <p className="text-[7px] text-slate-400 font-bold uppercase tracking-widest mt-1">Orquestrador</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setAdminTab('geral')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${adminTab === 'geral' ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:bg-slate-100'}`}>Vitrine Geral</button>
                  <button onClick={() => setAdminTab('hot')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${adminTab === 'hot' ? 'bg-orange-600 text-white shadow-xl' : 'text-slate-400 hover:bg-slate-100'}`}>Seleção Hot</button>
                  <button onClick={() => setAdminTab('recent')} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${adminTab === 'recent' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-400 hover:bg-slate-100'}`}><History size={12}/> Recém Alterados</button>
                </div>
                
                <div className="flex items-center gap-4 px-4 py-1.5 bg-slate-50 rounded-xl border border-slate-100">
                   <div className="text-center"><p className="text-[7px] font-black text-slate-400 uppercase tracking-tighter">Base</p><p className="text-[11px] font-black text-slate-800">{globalStats.total}</p></div>
                   <div className="w-px h-4 bg-slate-200"></div>
                   <div className="text-center"><p className="text-[7px] font-black text-slate-400 uppercase tracking-tighter">Pendentes</p><p className="text-[11px] font-black text-orange-500">{globalStats.pending}</p></div>
                   <div className="w-px h-4 bg-slate-200"></div>
                   <div className="text-center"><p className="text-[7px] font-black text-slate-400 uppercase tracking-tighter">Prontos</p><p className="text-[11px] font-black text-green-600">{globalStats.linked}</p></div>
                </div>
             </div>

             <div className="flex items-center gap-3">
                <button onClick={() => setShowHelp(true)} className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all shadow-sm"><CircleHelp size={20}/></button>
                <button onClick={onPurge} className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm border border-red-100" title="Limpar Desativados"><Trash2 size={20}/></button>
                <button onClick={onClearAll} className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm border border-slate-100" title="Reset Total"><Eraser size={20}/></button>
                <button onClick={onOpenImport} className="bg-slate-900 text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase flex items-center gap-2 shadow-xl hover:bg-black transition-all"><UploadCloud size={16}/> Importar CSV</button>
                <button onClick={onClose} className="p-3 bg-slate-100 text-slate-500 rounded-xl hover:bg-red-50 hover:text-red-500 transition-all"><X size={22}/></button>
             </div>
          </header>

          {/* --- WORKSPACE DIVIDIDO --- */}
          <div className="flex-1 flex flex-col min-h-0">
            {/* BARRA DE CATEGORIAS SUPERIOR (SCROLL HORIZONTAL) */}
            <div className="bg-white border-b border-slate-200 flex flex-col shrink-0">
               <div className="px-6 py-1.5 flex items-center gap-2 border-b border-slate-50">
                  <Sparkles size={14} className="text-orange-500" />
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Filtro por Categoria</span>
               </div>
               <div className="flex-1 flex items-center gap-3 px-6 overflow-x-auto no-scrollbar py-3">
                  {categoriesInList.map(cat => (
                    <div key={`cat-top-${cat}`} className={`flex items-center gap-3 border px-3 py-1.5 rounded-xl shrink-0 relative transition-all ${filterCategory === cat ? 'bg-orange-50 border-orange-200 shadow-sm' : 'bg-slate-50 border-slate-100'}`}>
                       <span className="text-[8px] font-black text-slate-800 uppercase whitespace-nowrap">{cat}</span>
                       {categoryStats[cat]?.hidden > 0 && (
                         <button 
                           onClick={(e) => {
                             e.stopPropagation();
                             setFilterCategory(cat);
                             setShowHiddenOnly(true);
                             setShowNoLinkOnly(false);
                             setShowLinkedOnly(false);
                           }}
                           className="absolute -top-1.5 -right-1 bg-red-500 text-white text-[7px] font-black px-1.5 py-0 rounded-full shadow-lg border border-white animate-in zoom-in duration-300 hover:scale-110 active:scale-95 transition-transform"
                           title="Ver apenas ocultos desta categoria"
                         >
                           {categoryStats[cat].hidden}
                         </button>
                       )}
                       <div className="flex gap-1.5 border-l border-slate-200 pl-3">
                          <button onClick={() => handleActivateCategory(cat)} className="text-[8px] font-black uppercase text-green-600 hover:text-green-700">Ativar</button>
                          <button onClick={() => handleDeactivateCategory(cat)} className="text-[8px] font-black uppercase text-red-500 hover:text-red-700">Ocultar</button>
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            {/* Toolbar de Busca Superior */}
            <div className="px-6 py-3 bg-white/50 border-b border-slate-200 flex items-center gap-4 shrink-0">
              <div className="flex-1 relative">
                <Search size={18} className="absolute left-5 top-3.5 text-slate-300" />
                <input type="text" placeholder="Filtrar base de dados..." className="w-full bg-white border border-slate-200 rounded-xl py-3 px-14 text-xs font-bold uppercase outline-none focus:ring-2 focus:ring-orange-100 transition-all shadow-sm" value={adminSearch} onChange={(e) => setAdminSearch(e.target.value)} />
              </div>
              
              {(filterCategory || showHiddenOnly) && (
                <button 
                  onClick={() => { setFilterCategory(null); setShowHiddenOnly(false); }}
                  className="px-4 py-3 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 hover:bg-slate-200 transition-all border border-slate-200"
                >
                  <X size={14} /> Limpar Filtros
                </button>
              )}

              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
                <button 
                  onClick={() => { setShowNoLinkOnly(false); setShowLinkedOnly(false); }}
                  className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${!showNoLinkOnly && !showLinkedOnly ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Todos
                </button>
                <button 
                  onClick={() => { setShowNoLinkOnly(true); setShowLinkedOnly(false); }}
                  className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${showNoLinkOnly ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Pendentes
                </button>
                <button 
                  onClick={() => { setShowNoLinkOnly(false); setShowLinkedOnly(true); }}
                  className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${showLinkedOnly ? 'bg-green-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Padronizados
                </button>
              </div>

              <button onClick={handleDownloadMissingCSV} className="p-3 bg-white text-slate-400 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm"><Download size={18} /></button>
            </div>

            {/* Área de Trabalho Real */}
            <div className="flex-1 flex gap-6 p-6 overflow-hidden">
              
              {/* Coluna da Esquerda: Listagem de Itens */}
              <div className="flex-[3] flex flex-col gap-2 overflow-y-auto custom-scrollbar pr-4">
                {filteredList.map(p => (
                  <div key={p.uid} className={`bg-white p-3 rounded-2xl border transition-all flex flex-col gap-3 ${productConfigs[p.uid]?.isActive === false ? 'opacity-40 grayscale border-slate-100' : 'border-slate-100 shadow-sm hover:border-slate-300'} ${shopeeBatch.some(i => i.uid === p.uid) ? 'ring-2 ring-orange-500 bg-orange-50/20' : ''} ${productConfigs[p.uid]?.affiliateLink ? 'border-l-4 border-l-green-500' : ''}`}>
                    <div className="flex items-center gap-3">
                      <input type="checkbox" className="w-5 h-5 rounded-md border-slate-300 text-orange-600 focus:ring-orange-500" checked={shopeeBatch.some(i => i.uid === p.uid)} onChange={() => toggleBatchItem(p)} />
                      <img src={productConfigs[p.uid]?.customImage || p.image} className="w-12 h-12 object-contain rounded-lg bg-slate-50 p-1 border border-slate-100" alt="" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest">{p.category}</span>
                          <div className="flex gap-1">
                            <button 
                              onClick={() => updateConfig(p.uid, 'isApproved', productConfigs[p.uid]?.isApproved !== true)} 
                              className={`p-1.5 rounded-lg transition-all ${productConfigs[p.uid]?.isApproved ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-300 hover:text-green-600'}`}
                              title="Aprovar para Vitrine"
                            ><CheckCircle2 size={12}/></button>
                            <button onClick={() => updateConfig(p.uid, 'isActive', productConfigs[p.uid]?.isActive === false)} className={`p-1.5 rounded-lg transition-all ${productConfigs[p.uid]?.isActive !== false ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-400'}`}><Power size={12}/></button>
                          </div>
                        </div>
                        <input type="text" className="w-full bg-transparent border-none p-0 text-[11px] font-black uppercase outline-none" value={productConfigs[p.uid]?.customTitle || p.title} onChange={(e) => { updateConfig(p.uid, 'customTitle', e.target.value); addToRecent(p.uid); }} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-50">
                      <div className="flex gap-2">
                        <input type="text" className="flex-1 bg-slate-50 border border-slate-100 rounded-lg px-3 py-1.5 text-[10px] font-medium outline-none focus:ring-1 focus:ring-orange-200" value={productConfigs[p.uid]?.affiliateLink || ''} onChange={(e) => { updateConfig(p.uid, 'affiliateLink', e.target.value); addToRecent(p.uid); }} placeholder="Link de Afiliado..." />
                        <a href={p.originalLink} target="_blank" rel="noreferrer" className="p-1.5 bg-slate-100 text-slate-400 rounded-lg hover:bg-slate-200 transition-all"><ExternalLink size={12}/></a>
                      </div>
                      <input type="text" className="bg-slate-50 border border-slate-100 rounded-lg px-3 py-1.5 text-[10px] font-medium outline-none focus:ring-1 focus:ring-orange-200" value={productConfigs[p.uid]?.customPixPrice || ''} onChange={(e) => { updateConfig(p.uid, 'customPixPrice', e.target.value); addToRecent(p.uid); }} placeholder="Preço PIX..." />
                    </div>
                  </div>
                ))}
              </div>

              {/* Coluna da Direita: Ferramentas (Fixas no topo) */}
              <div className="flex-1 flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-2 min-w-[320px]">
                
                {/* 1. GRANDE QUANTIDADE (50 LINKS) */}
                <div className="bg-slate-900 rounded-[1.5rem] p-6 text-white shadow-2xl border border-slate-800 shrink-0">
                  <div className="flex items-center gap-3 mb-3">
                    <Database size={18} className="text-indigo-400" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] italic">Injetor de Links (50)</span>
                  </div>
                  <textarea 
                    placeholder="Cole aqui até 50 links (um por linha)..."
                    className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-4 text-[10px] outline-none placeholder:text-white/20 resize-none focus:border-indigo-500 transition-all text-white mb-6 font-medium"
                    value={batchLinks}
                    onChange={(e) => setBatchLinks(e.target.value)}
                  />
                  <button onClick={handleApplyBatchLinks} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-black uppercase text-[9px] tracking-widest hover:bg-indigo-500 transition-all shadow-xl">
                    Aplicar 50 Links agora
                  </button>
                </div>

                {/* 2. CONVERSOR DE LOTE (5 LINKS) */}
                <div className="bg-[#EE4D2D] rounded-[1.5rem] p-6 text-white shadow-2xl relative overflow-hidden shrink-0">
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <ClipboardCheck size={18} />
                        <span className="text-[10px] font-black uppercase tracking-widest italic">Batch Lote (5)</span>
                      </div>
                      <a href="https://affiliate.shopee.com.br/offer/custom_link" target="_blank" rel="noreferrer" className="text-[10px] font-black bg-white/10 px-3 py-1.5 rounded-lg hover:bg-white/20 transition-all">Geral Shopee <ExternalLink size={10} className="inline ml-1"/></a>
                    </div>

                    {shopeeBatch.length === 0 ? (
                      <button onClick={handlePrepareShopeeBatch} className="w-full py-8 bg-white/10 border-2 border-dashed border-white/20 rounded-2xl text-[9px] font-black uppercase text-white hover:bg-white/20 transition-all">
                        Preparar Próximos 5 Pendentes
                      </button>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex flex-col gap-2">
                          <button id="copy-batch-btn" onClick={handleCopyOriginals} className="w-full py-2.5 bg-white text-[#EE4D2D] rounded-xl font-black uppercase text-[9px] shadow-xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-all">
                            <Copy size={14} /> 1. Copiar Originais
                          </button>
                          <textarea 
                            placeholder="2. Cole aqui o bloco gerado..."
                            className="w-full h-14 bg-black/20 border border-white/10 rounded-xl p-3 text-[9px] outline-none placeholder:text-white/40 resize-none focus:border-white/30 transition-all text-white font-medium"
                            onChange={(e) => handleBatchPaste(e.target.value)}
                          />
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => setShopeeBatch([])} className="flex-1 py-2.5 bg-white/10 text-white rounded-xl font-black uppercase text-[9px] hover:bg-white/20 transition-all">Cancelar</button>
                          <button onClick={handleApplyShopeeBatch} className="flex-[2] py-2.5 bg-slate-900 text-white rounded-xl font-black uppercase text-[9px] shadow-2xl hover:bg-black transition-all">
                            Vincular Agora
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  <Flame className="absolute -right-8 -bottom-8 text-white/5" size={160} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};