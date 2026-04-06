import React from 'react';
import { ProductCard } from './ProductCard'; // Importa o ProductCard do mesmo diretório

export const HotProductCard = ({ item, config, onToggleExpand, isExpanded, isAdminMode }) => {
  return (
    <div className="flex-shrink-0 w-80 snap-start bg-gradient-to-br from-white to-orange-50/30 p-6 rounded-[2.5rem] border border-orange-100 shadow-sm hover:shadow-xl transition-all group">
      <ProductCard 
        item={item} 
        config={config} 
        onToggleExpand={onToggleExpand}
        isExpanded={isExpanded}
        isAdminMode={isAdminMode}
      />
    </div>
  );
};