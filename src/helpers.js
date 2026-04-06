import Papa from 'papaparse';

export const formatBRL = (num) => num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const parsePrice = (val) => {
  if (!val) return 0;
  let clean = String(val).replace(/[R$\s]/g, '').trim();
  if (clean.includes(',') && clean.includes('.')) clean = clean.replace(/\./g, '').replace(',', '.');
  else if (clean.includes(',')) clean = clean.replace(',', '.');
  const num = parseFloat(clean);
  return isNaN(num) ? 0 : num;
};

// Otimização: Cache de palavras-chave já em minúsculas para evitar processamento repetitivo
const CATEGORY_KEYWORDS = {
  "Roupas Plus Size": ["plus size", "plus-size", "g1", "g2", "g3", "g4", "extra grande"],
  "Moda Infantil": ["infantil", "kids", "menino", "menina", "criança", "conjunto infantil", "corpo bebê"],
  "Sapatos Femininos": ["sapato feminino", "bota feminina", "sandalia", "sandália", "sapatilha", "salto alto", "rasteirinha", "tamanco"],
  "Sapatos Masculinos": ["sapato masculino", "tenis masculino", "tênis masculino", "bota masculina", "chinelo masculino", "sapatenis"],
  "Roupas Femininas": ["vestido", "saia", "blusa", "feminina", "mulher", "biquini", "biquíni", "lingerie", "top feminino", "regata feminina", "legging", "moda feminina"],
  "Roupas Masculinas": ["masculina", "homem", "cueca", "bermuda", "camisa", "polo", "camiseta masculina", "regata masculina", "moda masculina"],
  "Bolsas Femininas": ["bolsa", "mochila feminina", "necessaire", "nécessaire", "bolsa transversal", "clutch", "shoulder bag"],
  "Relógios": ["relogio", "relógio", "smartwatch", "pulseira relógio"],
  "Acessórios de Moda": ["cinto", "oculos", "óculos", "boné", "chapeu", "chapéu", "lenço", "carteira", "bijuteria", "joia", "semijoia", "colar", "brinco", "anel"],
  "Beleza": ["maquiagem", "batom", "esmalte", "skincare", "facial", "rimel", "rímel", "base", "corretivo", "shampoo", "condicionador", "perfume", "hidratante"],
  "Saúde": ["medidor pressão", "termometro", "termômetro", "nebulizador", "massageador", "joelheira", "munhequeira", "suplemento", "vitamina", "mascara", "máscara", "dental", "escova"],
  "Mãe e Bebê": ["fralda", "carrinho bebe", "carrinho bebê", "mamadeira", "chupeta", "bomba tira leite", "cercadinho", "andador", "bebê", "bebe"],
  "Eletrodomésticos": ["liquidificador", "batedeira", "geladeira", "fogao", "fogão", "microondas", "cafeteira", "aspirador", "ferro de passar", "maquina de lavar", "máquina de lavar", "ventilador", "ar condicionado"],
  "Casa e Construção": ["tinta", "furadeira", "ferramenta", "piso", "reforma", "cimento", "lampada", "lâmpada", "chuveiro", "torneira", "parafuso", "martelo", "cama", "colchão", "cabeceira", "estofada", "box", "sofá", "cortina", "tapete", "gabarito", "copiador", "medidor", "nível", "trena", "panela", "pote", "organizador"],
  "Celulares e Dispositivos": ["celular", "smartphone", "tablet", "iphone", "samsung", "carregador", "power bank", "cabo usb", "capa celular"],
  "Áudio": ["fone", "headset", "caixa de som", "bluetooth", "som", "alexa", "echo dot", "microfone", "gravador"],
  "Brinquedos e Hobbies": ["brinquedo", "boneca", "carrinho", "lego", "quebra-cabeça", "jogo", "controle remoto", "drone", "pelucia", "pelúcia"],
  "Esportes e Lazer": ["academia", "treino", "crossfit", "yoga", "futebol", "bola", "garrafa termica", "garrafa térmica", "barraca", "camping", "ciclismo"],
  "Automóveis": ["carro", "pneu carro", "som automotivo", "retrovisor", "parachoque", "farol", "led carro", "oleo motor", "óleo motor"],
  "Motocicletas": ["moto", "motociclista", "capacete", "luva moto", "bota moto", "capa chuva moto", "bauleto", "pneu moto"],
  "Acessórios para Veículos": ["suporte celular carro", "suporte gps", "organizador carro", "aromatizante", "capa volante", "calota"]
};

export const identifyCategory = (title, desc, originalCat) => {
  // Inclui a categoria original na busca para aumentar a precisão da identificação
  const categoryToTest = originalCat ? String(originalCat).toLowerCase() : "";
  const fullText = (title + " " + (desc || "") + " " + categoryToTest).toLowerCase();

  for (const [category, words] of Object.entries(CATEGORY_KEYWORDS)) {
    if (words.some(word => fullText.includes(word))) {
      return category;
    }
  }

  // Se não encontrou palavra-chave mas existe uma categoria no CSV, mantém a original
  // em vez de classificar como "Geral" automaticamente
  if (originalCat && String(originalCat).trim().length > 1) {
    return originalCat;
  }
  
  return "Geral";
};

export const parseCSVData = (text, importType) => {
  const parsed = Papa.parse(text, {
    skipEmptyLines: true,
    trimHeaders: true
  });

  const rows = parsed.data;
  if (rows.length < 2) return { finalRows: [], map: {} };

  const headers = rows[0].map(h => h.toLowerCase().trim());
  const dataRows = rows.slice(1).filter(r => r.length > 1);
  const finalRows = importType === 'main' ? dataRows.slice(0, 150) : dataRows;
  const findIdx = (names) => names.reduce((acc, name) => acc !== -1 ? acc : headers.indexOf(name), -1);

  const map = {
    id: findIdx(['item id', 'product id', 'id', 'uid']),
    title: findIdx(['product name', 'product_name', 'item name', 'title', 'name', 'item id', 'produto', 'titulo']),
    price: findIdx(['sale_price', 'price', 'preço', 'valor', 'preço de venda', 'venda']),
    oldPrice: findIdx(['original price', 'original_price', 'old_price', 'preço original', 'de']),
    link: findIdx(['product link', 'product_link', 'url', 'link', 'original_link', 'link original']),
    affiliateLink: findIdx(['offer link', 'offer_link', 'affiliate link', 'affiliate_link', 'link de afiliado']),
    image: findIdx(['image url', 'image_url', 'thumb', 'imagem', 'image', 'image_link']),
    category: findIdx(['category', 'categoria', 'departamento']),
    desc: findIdx(['description', 'descrição', 'info', 'resumo', 'resumo']),
    pixPrice: findIdx(['pix', 'preco_pix', 'preço pix', 'pagamento pix', 'pix_price'])
  };

  return { finalRows, map };
};