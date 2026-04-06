import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Flame, ChevronLeft, ChevronRight, AlertCircle
} from 'lucide-react';
import { db, auth } from './firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';

import { ProductCard } from './componentes/ProductCard';
import { Header } from './componentes/Header';
import { AdminPanel } from './componentes/AdminPanel';
import { ImportModal } from './componentes/ImportModal';
import { HotProductCard } from './componentes/HotProductCard'; // Novo componente
import { CategoryIcon } from './componentes/CategoryIcon';
import { formatBRL, parsePrice, identifyCategory, parseCSVData } from './helpers';

// --- COMPONENTE PRINCIPAL ---

export default function App() {
  const [products, setProducts] = useState([]);
  const [hotProducts, setHotProducts] = useState([]);
  const [productConfigs, setProductConfigs] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [adminSearch, setAdminSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminTab, setAdminTab] = useState('geral');
  const [isProcessing, setIsProcessing] = useState(false);
  const [importType, setImportType] = useState('main'); 
  const [importMode, setImportMode] = useState('append'); 
  const [importStatus, setImportStatus] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [expandedId, setExpandedId] = useState(null);
  const [showPendingOnly, setShowPendingOnly] = useState(false);
  const scrollRef = useRef(null);

  // Efeito para sincronizar com o Firestore em Tempo Real
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      setIsAdminAuthenticated(!!user);
    });
    return () => unsubAuth();
  }, []);

  useEffect(() => {
    const unsubProducts = onSnapshot(collection(db, "products"), (snap) => {
      setProducts(snap.docs.map(doc => ({ ...doc.data(), uid: doc.id })));
    });
    const unsubHot = onSnapshot(collection(db, "hotProducts"), (snap) => {
      setHotProducts(snap.docs.map(doc => ({ ...doc.data(), uid: doc.id })));
    });
    const unsubConfigs = onSnapshot(collection(db, "configs"), (snap) => {
      const newConfigs = {};
      snap.forEach(doc => newConfigs[doc.id] = doc.data());
      setProductConfigs(newConfigs);
    });
    return () => { unsubProducts(); unsubHot(); unsubConfigs(); };
  }, []);

  const parseCSV = (text) => {
    const { finalRows, map } = parseCSVData(text, importType);
    
    const result = finalRows.map((row, index) => {
      const currentPrice = parsePrice(row[map.price]);
      const oldPrice = parsePrice(row[map.oldPrice]);
      const pixPrice = parsePrice(row[map.pixPrice]);
      const title = row[map.title] || "Produto sem Nome";
      const desc = row[map.desc] || "";
      const itemId = map.id !== -1 ? String(row[map.id]).trim() : `idx-${index}`;
      return {
        uid: `${importType}-${itemId}`,
        title,
        price: currentPrice,
        pixPrice: pixPrice || (currentPrice * 0.95), // Fallback: 5% de desconto se não houver no CSV
        oldPrice: oldPrice > currentPrice ? oldPrice : 0,
        originalLink: row[map.link] || "#",
        affiliateLink: map.affiliateLink !== -1 ? row[map.affiliateLink] : "",
        image: row[map.image] || "https://placehold.co/400x400?text=Produto",
        category: importType === 'hot' ? "Oferta Hot" : identifyCategory(title, desc, row[map.category]),
        rating: (Math.random() * (5.0 - 4.5) + 4.5).toFixed(1),
        description: desc
      };
    });
    setImportStatus({ count: result.length, type: importType === 'main' ? 'Vitrine' : 'Hot' });
    return result;
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = parseCSV(event.target.result);
        const collectionName = importType === 'hot' ? 'hotProducts' : 'products';
        
        const batch = writeBatch(db);
        data.forEach(item => {
          const docRef = doc(db, collectionName, item.uid);
          batch.set(docRef, item);
          // Se houver link de afiliado no CSV, já salva na config
          if (item.affiliateLink) {
            batch.set(doc(db, "configs", item.uid), { affiliateLink: item.affiliateLink }, { merge: true });
          }
        });
        await batch.commit();
      } finally {
        setIsProcessing(false);
        setTimeout(() => { setIsModalOpen(false); setImportStatus(null); }, 1500);
      }
    };
    reader.readAsText(file);
  };

  const updateConfig = async (uid, field, value) => {
    await setDoc(doc(db, "configs", uid), { [field]: value }, { merge: true });
  };

  const handleOpenAdmin = async () => {
    if (isAdminAuthenticated) {
      setIsAdminOpen(true);
      return;
    }
    
    const email = prompt("E-mail do Administrador:");
    const password = prompt("Senha:");
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setIsAdminOpen(true);
    } catch (error) {
      alert("Senha incorreta!");
    }
  };

  const bulkUpdateConfigs = (updates) => {
    setProductConfigs(prev => {
      const next = { ...prev };
      updates.forEach(({ uid, field, value }) => {
        next[uid] = { ...(next[uid] || {}), [field]: value };
      });
      return next;
    });
  };

  const purgeDeactivated = () => {
    if (!window.confirm("Deseja excluir permanentemente todos os produtos desativados? Esta ação não pode ser desfeita.")) return;

    const isActive = (uid) => productConfigs[uid]?.isActive !== false;
    const newProducts = products.filter(p => isActive(p.uid));
    const newHotProducts = hotProducts.filter(p => isActive(p.uid));

    setProducts(newProducts);
    setHotProducts(newHotProducts);

    // Limpa as configurações órfãs do localStorage
    setProductConfigs(prev => {
      const next = { ...prev };
      const activeUids = new Set([...newProducts.map(p => p.uid), ...newHotProducts.map(p => p.uid)]);
      Object.keys(next).forEach(uid => {
        if (!activeUids.has(uid)) delete next[uid];
      });
      return next;
    });
  };

  const clearAllData = () => {
    if (!window.confirm("⚠️ ATENÇÃO: Isso apagará TODOS os produtos, links de afiliado e customizações salvos localmente. Esta ação não pode ser desfeita. Deseja continuar?")) return;
    localStorage.clear(); // Limpeza total garantida
    
    setProducts([]);
    setHotProducts([]);
    setProductConfigs({});
    setSelectedCategory('Todas');
    setShowPendingOnly(false);
    
  };

  const categoryData = useMemo(() => {
    // Otimização: O contador agora respeita se o produto tem link e se está ativo
    // Isso evita que o usuário veja "Eletrônicos (5)" e ao clicar não encontre nada
    const visibleProducts = products.filter(p => {
      const config = productConfigs[p.uid];
      const isActive = config?.isActive !== false;
      const hasLink = !!config?.affiliateLink;
      
      // Segue a mesma lógica da vitrine (Esconde sem link por padrão)
      return isActive && (showPendingOnly ? !hasLink : hasLink);
    });

    const counts = visibleProducts.reduce((acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + 1;
      return acc;
    }, {});
    
    const uniqueCats = Object.keys(counts).sort();
    return { list: ['Todas', ...uniqueCats], counts: { ...counts, Todas: visibleProducts.length } };
  }, [products, productConfigs, showPendingOnly]);

  const filteredItems = useMemo(() => {
    return products.filter(p => {
      const config = productConfigs[p.uid];
      const isActive = config?.isActive !== false;
      const hasAffiliateLink = !!config?.affiliateLink;
      const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'Todas' || p.category === selectedCategory;
      
      // Se showPendingOnly estiver OFF (vitrine normal), mostra apenas com link.
      // Se showPendingOnly estiver ON, mostra apenas os que NÃO tem link.
      const matchesLinkStatus = showPendingOnly ? !hasAffiliateLink : hasAffiliateLink;

      return isActive && matchesSearch && matchesCategory && matchesLinkStatus;
    });
  }, [products, searchTerm, selectedCategory, productConfigs, showPendingOnly]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-20 font-sans">
      <Header 
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm} 
        onOpenAdmin={handleOpenAdmin} 
        showPendingOnly={showPendingOnly}
        setShowPendingOnly={setShowPendingOnly}
      />

      {/* Seção Hot Padronizada */}
      {hotProducts.length > 0 && (
        <section className="bg-white border-b border-slate-100 mb-8 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="flex items-center gap-3 text-sm font-black uppercase tracking-[0.2em] text-orange-600 italic">
                  <Flame size={20} className="animate-pulse" /> Seleção Ofertas Hot
                </h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-wider">Itens em Destaque</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => scrollRef.current.scrollBy({left: -350, behavior: 'smooth'})} className="p-3 bg-white rounded-full shadow-md border border-slate-100 hover:bg-orange-50 transition-colors"><ChevronLeft size={20}/></button>
                <button onClick={() => scrollRef.current.scrollBy({left: 350, behavior: 'smooth'})} className="p-3 bg-white rounded-full shadow-md border border-slate-100 hover:bg-orange-50 transition-colors"><ChevronRight size={20}/></button>
              </div>
            </div>
            
            <div ref={scrollRef} className="flex gap-6 overflow-x-auto no-scrollbar snap-x pb-4">
              {hotProducts
                .filter(p => {
                  const config = productConfigs[p.uid];
                  const isActive = config?.isActive !== false;
                  const hasAffiliateLink = !!config?.affiliateLink;
                  const matchesLinkStatus = showPendingOnly ? !hasAffiliateLink : hasAffiliateLink;
                  return isActive && matchesLinkStatus;
                })
                .map(item => (
                <HotProductCard
                  key={item.uid}
                  item={item}
                  config={productConfigs[item.uid]}
                  onToggleExpand={(id) => setExpandedId(expandedId === id ? null : id)}
                  isExpanded={expandedId === item.uid}
                  isAdminMode={isAdminOpen || showPendingOnly}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Navegação por Categorias */}
      {products.length > 0 && (
        <nav className="max-w-7xl mx-auto px-6 mt-8 flex gap-3 overflow-x-auto pb-4 custom-scrollbar overflow-y-hidden">
          {categoryData.list.map(cat => (
            <button
              key={cat} onClick={() => setSelectedCategory(cat)}
              className={`whitespace-nowrap px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                selectedCategory === cat ? 'bg-slate-900 text-white shadow-xl scale-105' : 'bg-white text-slate-400 border border-slate-100'
              }`}
            >
              <CategoryIcon cat={cat} />
              {cat}
              <span className={`ml-1 px-2 py-0.5 rounded-full text-[8px] ${selectedCategory === cat ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400'}`}>
                {categoryData.counts[cat] || 0}
              </span>
            </button>
          ))}
        </nav>
      )}

      {/* Grid Principal Alinhado */}
      <main className="max-w-7xl mx-auto px-6 mt-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredItems.map((item) => (
            <ProductCard 
              key={item.uid}
              item={item} 
              config={productConfigs[item.uid]} 
              onToggleExpand={(id) => setExpandedId(expandedId === id ? null : id)}
              isExpanded={expandedId === item.uid}
              isAdminMode={isAdminOpen || showPendingOnly}
            />
          ))}
        </div>
        
        {filteredItems.length === 0 && (
          <div className="py-20 text-center">
            <div className="bg-slate-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="text-slate-300" size={40} />
            </div>
            <h3 className="text-slate-400 font-black uppercase text-xs tracking-widest">Nenhum produto encontrado</h3>
          </div>
        )}
      </main>

      <AdminPanel 
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        adminTab={adminTab}
        setAdminTab={setAdminTab}
        products={products}
        hotProducts={hotProducts}
        adminSearch={adminSearch}
        setAdminSearch={setAdminSearch}
        productConfigs={productConfigs}
        updateConfig={updateConfig}
        bulkUpdateConfigs={bulkUpdateConfigs}
        onPurge={purgeDeactivated}
        onClearAll={clearAllData}
        onOpenImport={() => setIsModalOpen(true)}
      />

      <ImportModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        importStatus={importStatus}
        importType={importType}
        setImportType={setImportType}
        importMode={importMode}
        setImportMode={setImportMode}
        isProcessing={isProcessing}
        handleFileUpload={handleFileUpload}
      />

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .custom-scrollbar::-webkit-scrollbar { height: 6px; width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #F1F5F9; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 10px; border: 1px solid #F1F5F9; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94A3B8; }
      `}</style>
    </div>
  );
}