import React from 'react';
import { 
  Hammer, Car, Flame, Tag, Shirt, Sparkles, Baby, Watch, 
  Smartphone, Dumbbell, Refrigerator, Gamepad2, Wrench, 
  HeartPulse, Bike, Headphones, ShoppingBag, Maximize, 
  Footprints, Glasses 
} from 'lucide-react';

export const CategoryIcon = ({ cat }) => {
  switch (cat) {
    case 'Roupas Femininas': return <Shirt size={12} />;
    case 'Casa e Construção': return <Hammer size={12} />;
    case 'Roupas Plus Size': return <Maximize size={12} />;
    case 'Beleza': return <Sparkles size={12} />;
    case 'Roupas Masculinas': return <Shirt size={12} />;
    case 'Sapatos Femininos': return <Footprints size={12} />;
    case 'Sapatos Masculinos': return <Footprints size={12} />;
    case 'Moda Infantil': return <Baby size={12} />;
    case 'Acessórios de Moda': return <Glasses size={12} />;
    case 'Relógios': return <Watch size={12} />;
    case 'Celulares e Dispositivos': return <Smartphone size={12} />;
    case 'Esportes e Lazer': return <Dumbbell size={12} />;
    case 'Eletrodomésticos': return <Refrigerator size={12} />;
    case 'Brinquedos e Hobbies': return <Gamepad2 size={12} />;
    case 'Automóveis': return <Car size={12} />;
    case 'Acessórios para Veículos': return <Wrench size={12} />;
    case 'Saúde': return <HeartPulse size={12} />;
    case 'Motocicletas': return <Bike size={12} />;
    case 'Áudio': return <Headphones size={12} />;
    case 'Mãe e Bebê': return <Baby size={12} />;
    case 'Bolsas Femininas': return <ShoppingBag size={12} />;
    case 'Oferta Hot': return <Flame size={12} />;
    default: return <Tag size={12} />;
  }
};