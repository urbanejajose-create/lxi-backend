// LXI Product Data - Drop 01 Founders Edition

export const products = [
  {
    id: 'heavyweight-tee',
    name: 'HEAVYWEIGHT TEE',
    slug: 'heavyweight-tee',
    category: 'TOPS',
    tag: 'TOPS · FOUNDERS',
    price: 59,
    description: 'No es una camiseta. Es la primera pieza de tu armadura.',
    longDescription: 'La Heavyweight Tee LXI representa el inicio de tu transformación. Diseñada para quienes entienden que la presencia comienza en los detalles.',
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80',
      'https://images.unsplash.com/photo-1562135291-7728cc647783?w=800&q=80',
      'https://images.unsplash.com/photo-1529720317453-c8da503f2051?w=800&q=80'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    details: {
      material: '100% ring-spun cotton, 6.1oz. Garment dyed for depth of color. Embroidered LXI crest, not printed.',
      embroidery: 'Three-point signature: chest crest (3"), sleeve mark (1"), back inscription "LUCHANDO" in roman letterforms.',
      sizing: 'Cut for presence. Slightly oversized by design. Model wears size M at 6\'1".',
      shipping: 'Produced on demand. Ships in 3-7 business days. Final sale — each piece made for you.'
    }
  },
  {
    id: 'snapback-hat',
    name: 'SNAPBACK HAT',
    slug: 'snapback-hat',
    category: 'HEADWEAR',
    tag: 'HEADWEAR · FOUNDERS',
    price: 45,
    description: 'Corona tu transformación.',
    longDescription: 'El Snapback LXI lleva el emblema del gladiador moderno. Un recordatorio silencioso de la batalla que eligiste enfrentar.',
    images: [
      'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&q=80',
      'https://images.unsplash.com/photo-1556306535-0f09a537f0a3?w=800&q=80'
    ],
    sizes: ['ONE SIZE'],
    details: {
      material: 'Premium structured snapback. 6-panel construction. Embroidered gladiator crest in imperial gold.',
      embroidery: 'Front panel: LXI gladiator emblem (2.5"). Side panel: Roman numeral "LXI".',
      sizing: 'Adjustable snapback closure. One size fits most.',
      shipping: 'Produced on demand. Ships in 3-7 business days. Final sale — each piece made for you.'
    }
  },
  {
    id: 'eco-hoodie',
    name: 'ECO HOODIE ESSENTIAL',
    slug: 'eco-hoodie',
    category: 'OUTERWEAR',
    tag: 'OUTERWEAR · FOUNDERS',
    price: 89,
    description: 'La armadura esencial del gladiador moderno.',
    longDescription: 'El Eco Hoodie LXI combina sustentabilidad con presencia. Fabricado para los que entienden que el verdadero poder no necesita anunciarse.',
    images: [
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80',
      'https://images.unsplash.com/photo-1669202786389-9f69f67deff7?w=800&q=80'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    details: {
      material: 'Organic cotton blend. 320gsm premium weight. Brushed fleece interior for comfort.',
      embroidery: 'Chest crest (3.5") in imperial gold. Sleeve detail with "LUCHANDO" inscription.',
      sizing: 'Relaxed fit. Dropped shoulders. Model wears size M at 6\'1".',
      shipping: 'Produced on demand. Ships in 3-7 business days. Final sale — each piece made for you.'
    }
  },
  {
    id: 'cuffed-beanie',
    name: 'CUFFED BEANIE',
    slug: 'cuffed-beanie',
    category: 'HEADWEAR',
    tag: 'HEADWEAR · FOUNDERS',
    price: 45,
    description: 'Silencio y presencia.',
    longDescription: 'El Beanie LXI para los que operan en silencio. El emblema del gladiador bordado como declaración sutil de identidad.',
    images: [
      'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=800&q=80',
      'https://images.unsplash.com/photo-1579748138079-6d2d7d63db63?w=800&q=80'
    ],
    sizes: ['ONE SIZE'],
    details: {
      material: 'Premium acrylic blend. Cuffed design. Embroidered gladiator crest in imperial gold.',
      embroidery: 'Center front: LXI gladiator emblem (2") with laurel wreath detail.',
      sizing: 'One size fits most. Stretchable cuff construction.',
      shipping: 'Produced on demand. Ships in 3-7 business days. Final sale — each piece made for you.'
    }
  },
  {
    id: 'long-sleeve-shirt',
    name: 'LONG SLEEVE SHIRT',
    slug: 'long-sleeve-shirt',
    category: 'TOPS',
    tag: 'TOPS · FOUNDERS',
    price: 65,
    description: 'Para las batallas que requieren paciencia.',
    longDescription: 'La Long Sleeve LXI extiende la armadura. Para los días largos, las batallas prolongadas, y los que entienden que la consistencia es la verdadera victoria.',
    images: [
      'https://images.unsplash.com/photo-1529720317453-c8da503f2051?w=800&q=80',
      'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&q=80'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    details: {
      material: '100% cotton jersey. 180gsm. Ribbed cuffs and collar.',
      embroidery: 'Sleeve crest (1.5") in imperial gold. Subtle "LXI" inscription at hem.',
      sizing: 'Regular fit with slightly elongated body. Model wears size M at 6\'1".',
      shipping: 'Produced on demand. Ships in 3-7 business days. Final sale — each piece made for you.'
    }
  }
];

export const getProductBySlug = (slug) => {
  return products.find((product) => product.slug === slug);
};

export const getProductsByCategory = (category) => {
  if (!category || category === 'ALL') return products;
  return products.filter((product) => product.category === category);
};

export const categories = ['ALL', 'TOPS', 'HEADWEAR', 'OUTERWEAR'];
