import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { adminService, productService } from '../services/api';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Badge } from '../components/ui/badge';

const defaultHomeForm = {
  hero_label: '',
  hero_title: '',
  hero_subtitle: '',
  hero_cta_text: '',
  hero_cta_link: '/shop',
  hero_image: '',
  brand_quote: '',
  collection_label: '',
  collection_title: '',
  story_label: '',
  story_title: '',
  story_body: '',
  story_image: '',
  story_cta_text: '',
  story_cta_link: '/philosophy',
  banner_label: '',
  banner_text: '',
  pillars: [
    { numeral: 'I', title: '', description: '' },
    { numeral: 'II', title: '', description: '' },
    { numeral: 'III', title: '', description: '' },
  ],
};

const defaultGlobalForm = {
  logo_text: 'LXI',
  navbarLinksText: 'SHOP|/shop\nPHILOSOPHY|/philosophy\nINITIUM|/shop',
  mobile_menu_badge: 'FOUNDERS EDITION',
  footer_description: '',
  footer_email: '',
  instagram_url: 'https://instagram.com',
  tiktok_url: 'https://tiktok.com',
  footerShopLinksText: 'INITIUM|/shop|false\nTOPS|/shop?category=TOPS|false\nHEADWEAR|/shop?category=HEADWEAR|false\nOUTERWEAR|/shop?category=OUTERWEAR|false',
  footerBrandLinksText: 'PHILOSOPHY|/philosophy|false\nTHE BOOK|https://joseurbaneja.com|true',
  newsletter_title: '',
  newsletter_text: '',
  footer_bottom_text: '',
  footer_badge_text: '',
  shop_title: 'INITIUM',
  shop_count_label_template: 'FOUNDERS EDITION - {count} PIECES',
  shop_empty_text: 'No products found',
  shop_banner_label: '',
  shop_banner_text: '',
  product_badge_text: '',
  product_breadcrumb_shop: 'SHOP',
  product_breadcrumb_collection: 'INITIUM',
  add_to_cart_text: 'ADD TO ARMOR',
  add_to_cart_loading_text: 'ADDING...',
  theme_primary_bg: '#0a0e17',
  theme_secondary_bg: '#1a2332',
  theme_primary_text: '#f5f5f0',
  theme_secondary_text: '#8a8a8a',
  theme_accent_gold: '#d4af37',
  theme_border_color: '#2a3444',
  theme_body_font: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
  theme_heading_font: "'Cormorant Garamond', serif",
  theme_body_font_size: '16px',
  theme_hero_title_size: 'clamp(3rem, 8vw, 5.5rem)',
  theme_section_title_size: 'clamp(2rem, 5vw, 3.5rem)',
};

const defaultPhilosophyForm = {
  hero_label: '',
  hero_image: '',
  opening_quote: '',
  sectionsText: '',
  values_label: '',
  values_title: '',
  valuesText: '',
  mission_label: '',
  mission_text: '',
  vision_label: '',
  vision_text: '',
  cta_text: '',
  cta_link: '/shop',
};

const emptyProductForm = {
  name: '',
  slug: '',
  category: '',
  description: '',
  price: '',
  sizesText: '',
  inventory: '0',
  sku: '',
  image_url: '',
  imagesText: '',
  details_material: '',
  details_embroidery: '',
  details_sizing: '',
  details_shipping: '',
  visible: true,
  featured: false,
};

function normalizeProductImages(imageUrl, imagesText) {
  const primaryImage = imageUrl.trim();
  const galleryImages = imagesText
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);

  const images = primaryImage ? [primaryImage] : [];
  galleryImages.forEach((image) => {
    if (!images.includes(image)) {
      images.push(image);
    }
  });

  return {
    primaryImage,
    images,
  };
}

function slugifyProduct(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function mapProductToForm(product) {
  const { primaryImage, images } = normalizeProductImages(
    product.image_url || product.images?.[0] || '',
    (product.images || []).join('\n'),
  );

  return {
    name: product.name || '',
    slug: product.slug || '',
    category: product.category || '',
    description: product.description || '',
    price: product.price ?? '',
    sizesText: (product.sizes || []).join(', '),
    inventory: String(product.inventory ?? 0),
    sku: product.sku || '',
    image_url: primaryImage,
    imagesText: images.join('\n'),
    details_material: product.details?.material || '',
    details_embroidery: product.details?.embroidery || '',
    details_sizing: product.details?.sizing || '',
    details_shipping: product.details?.shipping || '',
    visible: product.visible !== false,
    featured: Boolean(product.featured),
  };
}

function buildProductPayload(form) {
  const { primaryImage, images } = normalizeProductImages(form.image_url, form.imagesText);
  const normalizedSlug = slugifyProduct(form.slug || form.name || '');
  return {
    name: form.name.trim(),
    slug: normalizedSlug || undefined,
    category: form.category.trim().toUpperCase(),
    description: form.description.trim(),
    price: Number(form.price || 0),
    sizes: form.sizesText.split(',').map((item) => item.trim()).filter(Boolean),
    inventory: Number(form.inventory || 0),
    sku: form.sku.trim(),
    image_url: primaryImage,
    images,
    details: {
      material: form.details_material.trim(),
      embroidery: form.details_embroidery.trim(),
      sizing: form.details_sizing.trim(),
      shipping: form.details_shipping.trim(),
    },
    visible: form.visible,
    featured: form.featured,
  };
}

function serializeLinks(links = [], includeExternal = false) {
  return links
    .map((link) => (
      includeExternal
        ? `${link.label || ''}|${link.path || ''}|${Boolean(link.external)}`
        : `${link.label || ''}|${link.path || ''}`
    ))
    .join('\n');
}

function parseLinks(text, includeExternal = false) {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label = '', path = '', external = 'false'] = line.split('|').map((item) => item.trim());
      return includeExternal
        ? { label, path, external: external.toLowerCase() === 'true' }
        : { label, path };
    })
    .filter((link) => link.label && link.path);
}

function serializeSections(sections = []) {
  return sections
    .map((section) => `${section.label || ''}|${section.title || ''}|${(section.paragraphs || []).join('|')}`)
    .join('\n');
}

function parseSections(text) {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label = '', title = '', ...paragraphs] = line.split('|').map((item) => item.trim());
      return {
        label,
        title,
        paragraphs: paragraphs.filter(Boolean),
      };
    })
    .filter((section) => section.label && section.title);
}

function serializeValues(values = []) {
  return values
    .map((value) => `${value.numeral || ''}|${value.name || ''}|${value.description || ''}`)
    .join('\n');
}

function parseValues(text) {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [numeral = '', name = '', description = ''] = line.split('|').map((item) => item.trim());
      return { numeral, name, description };
    })
    .filter((value) => value.numeral && value.name);
}

function mapGlobalToForm(content) {
  const theme = content.theme || {};
  return {
    ...defaultGlobalForm,
    ...(content || {}),
    navbarLinksText: serializeLinks(content.navbar_links || []),
    footerShopLinksText: serializeLinks(content.footer_shop_links || [], true),
    footerBrandLinksText: serializeLinks(content.footer_brand_links || [], true),
    theme_primary_bg: theme.primary_bg || defaultGlobalForm.theme_primary_bg,
    theme_secondary_bg: theme.secondary_bg || defaultGlobalForm.theme_secondary_bg,
    theme_primary_text: theme.primary_text || defaultGlobalForm.theme_primary_text,
    theme_secondary_text: theme.secondary_text || defaultGlobalForm.theme_secondary_text,
    theme_accent_gold: theme.accent_gold || defaultGlobalForm.theme_accent_gold,
    theme_border_color: theme.border_color || defaultGlobalForm.theme_border_color,
    theme_body_font: theme.body_font || defaultGlobalForm.theme_body_font,
    theme_heading_font: theme.heading_font || defaultGlobalForm.theme_heading_font,
    theme_body_font_size: theme.body_font_size || defaultGlobalForm.theme_body_font_size,
    theme_hero_title_size: theme.hero_title_size || defaultGlobalForm.theme_hero_title_size,
    theme_section_title_size: theme.section_title_size || defaultGlobalForm.theme_section_title_size,
  };
}

function buildGlobalPayload(form) {
  return {
    logo_text: form.logo_text.trim(),
    navbar_links: parseLinks(form.navbarLinksText),
    mobile_menu_badge: form.mobile_menu_badge.trim(),
    footer_description: form.footer_description.trim(),
    footer_email: form.footer_email.trim(),
    instagram_url: form.instagram_url.trim(),
    tiktok_url: form.tiktok_url.trim(),
    footer_shop_links: parseLinks(form.footerShopLinksText, true),
    footer_brand_links: parseLinks(form.footerBrandLinksText, true),
    newsletter_title: form.newsletter_title.trim(),
    newsletter_text: form.newsletter_text.trim(),
    footer_bottom_text: form.footer_bottom_text.trim(),
    footer_badge_text: form.footer_badge_text.trim(),
    shop_title: form.shop_title.trim(),
    shop_count_label_template: form.shop_count_label_template.trim(),
    shop_empty_text: form.shop_empty_text.trim(),
    shop_banner_label: form.shop_banner_label.trim(),
    shop_banner_text: form.shop_banner_text.trim(),
    product_badge_text: form.product_badge_text.trim(),
    product_breadcrumb_shop: form.product_breadcrumb_shop.trim(),
    product_breadcrumb_collection: form.product_breadcrumb_collection.trim(),
    add_to_cart_text: form.add_to_cart_text.trim(),
    add_to_cart_loading_text: form.add_to_cart_loading_text.trim(),
    theme: {
      primary_bg: form.theme_primary_bg.trim(),
      secondary_bg: form.theme_secondary_bg.trim(),
      primary_text: form.theme_primary_text.trim(),
      secondary_text: form.theme_secondary_text.trim(),
      accent_gold: form.theme_accent_gold.trim(),
      border_color: form.theme_border_color.trim(),
      body_font: form.theme_body_font.trim(),
      heading_font: form.theme_heading_font.trim(),
      body_font_size: form.theme_body_font_size.trim(),
      hero_title_size: form.theme_hero_title_size.trim(),
      section_title_size: form.theme_section_title_size.trim(),
    },
  };
}

function mapPhilosophyToForm(content) {
  return {
    ...defaultPhilosophyForm,
    ...(content || {}),
    sectionsText: serializeSections(content.sections || []),
    valuesText: serializeValues(content.values || []),
  };
}

function buildPhilosophyPayload(form) {
  return {
    hero_label: form.hero_label.trim(),
    hero_image: form.hero_image.trim(),
    opening_quote: form.opening_quote.trim(),
    sections: parseSections(form.sectionsText),
    values_label: form.values_label.trim(),
    values_title: form.values_title.trim(),
    values: parseValues(form.valuesText),
    mission_label: form.mission_label.trim(),
    mission_text: form.mission_text.trim(),
    vision_label: form.vision_label.trim(),
    vision_text: form.vision_text.trim(),
    cta_text: form.cta_text.trim(),
    cta_link: form.cta_link.trim(),
  };
}

function getRequestErrorMessage(error) {
  return error?.response?.data?.detail || error?.message || 'Unknown error';
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('products');
  const [stats, setStats] = useState(null);
  const [integrationStatus, setIntegrationStatus] = useState(null);
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [productForm, setProductForm] = useState(emptyProductForm);
  const [homeForm, setHomeForm] = useState(defaultHomeForm);
  const [globalForm, setGlobalForm] = useState(defaultGlobalForm);
  const [philosophyForm, setPhilosophyForm] = useState(defaultPhilosophyForm);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [loadWarning, setLoadWarning] = useState('');
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');
  const [importLoading, setImportLoading] = useState(false);
  const [importMessage, setImportMessage] = useState('');
  const [savingProduct, setSavingProduct] = useState(false);
  const [productMessage, setProductMessage] = useState('');
  const [savingHome, setSavingHome] = useState(false);
  const [homeMessage, setHomeMessage] = useState('');
  const [savingGlobal, setSavingGlobal] = useState(false);
  const [globalMessage, setGlobalMessage] = useState('');
  const [savingPhilosophy, setSavingPhilosophy] = useState(false);
  const [philosophyMessage, setPhilosophyMessage] = useState('');
  const [uploadingField, setUploadingField] = useState('');

  useEffect(() => {
    if (user?.is_admin) {
      loadAdminData();
    }
  }, [user]);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      setError('');
      setLoadWarning('');
      const [
        statsResult,
        homeResult,
        globalResult,
        philosophyResult,
        productsResult,
        integrationResult,
      ] = await Promise.allSettled([
        adminService.getStats(),
        adminService.getHomeContent(),
        adminService.getGlobalContent(),
        adminService.getPhilosophyContent(),
        productService.getAllAdmin(),
        adminService.getIntegrationStatus(),
      ]);

      const failures = [];

      if (statsResult.status === 'fulfilled') {
        setStats(statsResult.value.data);
      } else {
        setStats(null);
        failures.push(`estadisticas (${getRequestErrorMessage(statsResult.reason)})`);
      }

      if (homeResult.status === 'fulfilled') {
        setHomeForm({
          ...defaultHomeForm,
          ...(homeResult.value.data.content || {}),
          pillars: (homeResult.value.data.content?.pillars || defaultHomeForm.pillars).slice(0, 3),
        });
      } else {
        setHomeForm(defaultHomeForm);
        failures.push(`home (${getRequestErrorMessage(homeResult.reason)})`);
      }

      if (globalResult.status === 'fulfilled') {
        setGlobalForm(mapGlobalToForm(globalResult.value.data.content || {}));
      } else {
        setGlobalForm(defaultGlobalForm);
        failures.push(`global (${getRequestErrorMessage(globalResult.reason)})`);
      }

      if (philosophyResult.status === 'fulfilled') {
        setPhilosophyForm(mapPhilosophyToForm(philosophyResult.value.data.content || {}));
      } else {
        setPhilosophyForm(defaultPhilosophyForm);
        failures.push(`philosophy (${getRequestErrorMessage(philosophyResult.reason)})`);
      }

      if (productsResult.status === 'fulfilled') {
        const loadedProducts = productsResult.value.data.products || [];
        setProducts(loadedProducts);
        if (loadedProducts[0]) {
          setSelectedProductId(loadedProducts[0]._id);
          setProductForm(mapProductToForm(loadedProducts[0]));
        } else {
          setSelectedProductId(null);
          setProductForm(emptyProductForm);
        }
      } else {
        setProducts([]);
        setSelectedProductId(null);
        setProductForm(emptyProductForm);
        failures.push(`productos (${getRequestErrorMessage(productsResult.reason)})`);
      }

      if (integrationResult.status === 'fulfilled') {
        setIntegrationStatus(integrationResult.value.data);
      } else {
        setIntegrationStatus(null);
        failures.push(`integraciones (${getRequestErrorMessage(integrationResult.reason)})`);
      }

      if (failures.length === 6) {
        setError(`No se pudo cargar el panel admin. ${failures.join(' | ')}`);
      } else if (failures.length > 0) {
        setLoadWarning(`Algunas secciones no cargaron: ${failures.join(' | ')}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const refreshProducts = async (keepSelectedId = selectedProductId) => {
    const response = await productService.getAllAdmin();
    const loadedProducts = response.data.products || [];
    setProducts(loadedProducts);
    const selected = loadedProducts.find((item) => item._id === keepSelectedId);
    if (selected) {
      setSelectedProductId(selected._id);
      setProductForm(mapProductToForm(selected));
    } else if (loadedProducts[0]) {
      setSelectedProductId(loadedProducts[0]._id);
      setProductForm(mapProductToForm(loadedProducts[0]));
    } else {
      setSelectedProductId(null);
      setProductForm(emptyProductForm);
    }
  };

  const handleProductChange = (event) => {
    const { name, value, type, checked } = event.target;
    setProductForm((prev) => {
      const next = { ...prev, [name]: type === 'checkbox' ? checked : value };

      if (name === 'image_url' && type !== 'checkbox') {
        const { images } = normalizeProductImages(value, prev.imagesText);
        next.imagesText = images.join('\n');
      }

      return next;
    });
  };

  const handleHomeChange = (event) => {
    const { name, value } = event.target;
    setHomeForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleGlobalChange = (event) => {
    const { name, value } = event.target;
    setGlobalForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhilosophyChange = (event) => {
    const { name, value } = event.target;
    setPhilosophyForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePillarChange = (index, field, value) => {
    setHomeForm((prev) => ({
      ...prev,
      pillars: prev.pillars.map((pillar, pillarIndex) =>
        pillarIndex === index ? { ...pillar, [field]: value } : pillar
      ),
    }));
  };

  const handleUploadImage = async (file, target, mode = 'product') => {
    if (!file) {
      return;
    }
    try {
      setUploadingField(target);
      const response = await adminService.uploadImage(file);
      const uploadedUrl = response.data.url;

      if (mode === 'home') {
        setHomeForm((prev) => ({ ...prev, [target]: uploadedUrl }));
        setHomeMessage('Imagen cargada. Guarda el Home para publicar el cambio.');
      } else if (mode === 'philosophy') {
        setPhilosophyForm((prev) => ({ ...prev, [target]: uploadedUrl }));
        setPhilosophyMessage('Imagen cargada. Guarda Filosofia para publicar el cambio.');
      } else {
        setProductForm((prev) => {
          const next = { ...prev, [target]: uploadedUrl };
          if (target === 'image_url') {
            const { images } = normalizeProductImages(uploadedUrl, prev.imagesText);
            next.imagesText = images.join('\n');
          }
          return next;
        });
        setProductMessage('Imagen cargada. Guarda el producto para publicar el cambio.');
      }
    } catch (err) {
      const message = err.response?.data?.detail || 'No se pudo subir la imagen.';
      if (mode === 'home') {
        setHomeMessage(message);
      } else if (mode === 'philosophy') {
        setPhilosophyMessage(message);
      } else {
        setProductMessage(message);
      }
    } finally {
      setUploadingField('');
    }
  };

  const selectProduct = (product) => {
    setSelectedProductId(product._id);
    setProductForm(mapProductToForm(product));
    setProductMessage('');
  };

  const resetProductForm = () => {
    setSelectedProductId(null);
    setProductForm(emptyProductForm);
    setProductMessage('');
  };

  const handleSaveProduct = async () => {
    try {
      setSavingProduct(true);
      setProductMessage('');
      const payload = buildProductPayload(productForm);
      if (selectedProductId) {
        await productService.update(selectedProductId, payload);
        setProductMessage('Producto actualizado correctamente.');
        await refreshProducts(selectedProductId);
      } else {
        const response = await productService.create(payload);
        setProductMessage('Producto creado correctamente.');
        await refreshProducts(response.data._id);
      }
      const statsResponse = await adminService.getStats();
      setStats(statsResponse.data);
    } catch (err) {
      setProductMessage(err.response?.data?.detail || 'No se pudo guardar el producto.');
    } finally {
      setSavingProduct(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!selectedProductId) {
      return;
    }
    if (!window.confirm('Se eliminara este producto. Deseas continuar?')) {
      return;
    }
    try {
      setSavingProduct(true);
      await productService.delete(selectedProductId);
      setProductMessage('Producto eliminado correctamente.');
      await refreshProducts(null);
      const statsResponse = await adminService.getStats();
      setStats(statsResponse.data);
    } catch (err) {
      setProductMessage(err.response?.data?.detail || 'No se pudo eliminar el producto.');
    } finally {
      setSavingProduct(false);
    }
  };

  const handleSaveHome = async () => {
    try {
      setSavingHome(true);
      setHomeMessage('');
      await adminService.updateHomeContent({
        ...homeForm,
        pillars: homeForm.pillars.map((pillar) => ({
          numeral: pillar.numeral,
          title: pillar.title,
          description: pillar.description,
        })),
      });
      setHomeMessage('Contenido del Home actualizado.');
    } catch (err) {
      setHomeMessage(err.response?.data?.detail || 'No se pudo actualizar el Home.');
    } finally {
      setSavingHome(false);
    }
  };

  const handleSaveGlobal = async () => {
    try {
      setSavingGlobal(true);
      setGlobalMessage('');
      await adminService.updateGlobalContent(buildGlobalPayload(globalForm));
      setGlobalMessage('Contenido global actualizado.');
    } catch (err) {
      setGlobalMessage(err.response?.data?.detail || 'No se pudo actualizar el contenido global.');
    } finally {
      setSavingGlobal(false);
    }
  };

  const handleSavePhilosophy = async () => {
    try {
      setSavingPhilosophy(true);
      setPhilosophyMessage('');
      await adminService.updatePhilosophyContent(buildPhilosophyPayload(philosophyForm));
      setPhilosophyMessage('Contenido de Filosofia actualizado.');
    } catch (err) {
      setPhilosophyMessage(err.response?.data?.detail || 'No se pudo actualizar Filosofia.');
    } finally {
      setSavingPhilosophy(false);
    }
  };

  const handleSyncPrintful = async () => {
    try {
      setSyncLoading(true);
      setSyncMessage('');
      const response = await adminService.syncPrintful();
      setSyncMessage(`Sincronizacion completada: ${response.data.synced} productos procesados, ${response.data.failed} errores`);
      await refreshProducts();
    } catch (err) {
      setSyncMessage(`Error en sincronizacion: ${err.response?.data?.detail || err.message}`);
    } finally {
      setSyncLoading(false);
    }
  };

  const handleImportPrintful = async () => {
    try {
      setImportLoading(true);
      setImportMessage('');
      const response = await adminService.importPrintfulCatalog();
      setImportMessage(`Importacion completada: ${response.data.imported} nuevos, ${response.data.updated} actualizados, ${response.data.failed} con error`);
      await refreshProducts();
      const statsResponse = await adminService.getStats();
      setStats(statsResponse.data);
    } catch (err) {
      setImportMessage(`Error importando catalogo: ${err.response?.data?.detail || err.message}`);
    } finally {
      setImportLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0e17] flex items-center justify-center">
        <div className="text-[#b0b0b0]">Loading admin dashboard...</div>
      </div>
    );
  }

  if (user && !user.is_admin) {
    return (
      <div className="min-h-screen bg-[#0a0e17] flex items-center justify-center px-6">
        <div className="max-w-lg w-full border border-red-500/40 bg-red-500/10 p-8 text-center">
          <h1 className="text-[#f5f5f0] text-2xl font-semibold">Acceso denegado</h1>
          <p className="text-[#b0b0b0] mt-4 leading-relaxed">
            Tu cuenta no tiene permisos de administrador en la base de datos actual.
            Si antes podias entrar, revisa que hayas iniciado sesion con el usuario correcto
            o vuelve a marcar ese usuario con <span className="text-[#d4af37] font-mono">is_admin = true</span>.
          </p>
          <button
            onClick={() => navigate('/')}
            className="mt-6 bg-[#d4af37] text-[#0a0e17] px-6 py-3 font-semibold hover:bg-[#e0c158]"
          >
            Volver al sitio
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0e17] flex items-center justify-center">
        <Alert className="border-red-500 bg-red-500/10 max-w-md">
          <AlertDescription className="text-red-500">{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0e17] pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6">
        {loadWarning && (
          <Alert className="mb-6 border-amber-500/40 bg-amber-500/10">
            <AlertDescription className="text-amber-200">{loadWarning}</AlertDescription>
          </Alert>
        )}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#f5f5f0]">Admin CMS</h1>
            <p className="text-[#8a8a8a] text-sm mt-2">
              Edita productos, textos, imagenes y sincronizacion con Printful desde un solo lugar.
            </p>
          </div>
          <div className="flex gap-3">
            {['products', 'home', 'global', 'philosophy', 'printful'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 border text-sm uppercase tracking-[0.2em] ${
                  activeTab === tab
                    ? 'border-[#d4af37] text-[#d4af37]'
                    : 'border-[#2a3444] text-[#b0b0b0]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-10">
            {[
              ['Usuarios', stats.total_users || 0],
              ['Productos', stats.total_products || 0],
              ['Ordenes pagadas', stats.total_orders || 0],
              ['Ingresos', `$${Number(stats.total_revenue || 0).toFixed(2)}`],
            ].map(([label, value]) => (
              <div key={label} className="bg-[#1a2332] p-5 border border-[#2a3444]">
                <div className="text-[#8a8a8a] text-sm">{label}</div>
                <div className="text-[#d4af37] text-3xl font-bold mt-2">{value}</div>
              </div>
            ))}
          </div>
        )}

        {integrationStatus && (
          <div className="bg-[#1a2332] border border-[#2a3444] p-5 mb-8">
            <h2 className="text-[#f5f5f0] font-semibold mb-4">Estado de Integraciones</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {[
                ['MongoDB', integrationStatus.mongodb_configured],
                ['Stripe', integrationStatus.stripe_configured],
                ['Stripe Webhook', integrationStatus.stripe_webhook_configured],
                ['PayPal', integrationStatus.paypal_configured],
                ['Printful', integrationStatus.printful_configured],
                ['Printful Webhook', integrationStatus.printful_webhook_configured],
              ].map(([label, ok]) => (
                <div key={label} className="border border-[#2a3444] bg-[#111927] p-3 flex items-center justify-between">
                  <span className="text-[#f5f5f0] text-sm">{label}</span>
                  <Badge className={ok ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-300'}>
                    {ok ? 'OK' : 'Pendiente'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="grid grid-cols-1 xl:grid-cols-[340px_1fr] gap-6">
            <div className="bg-[#1a2332] border border-[#2a3444] p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[#f5f5f0] font-semibold">Productos</h2>
                <button onClick={resetProductForm} className="text-[#d4af37] text-sm">Nuevo</button>
              </div>
              <div className="space-y-3 max-h-[780px] overflow-y-auto">
                {products.map((product) => (
                  <button
                    key={product._id}
                    onClick={() => selectProduct(product)}
                    className={`w-full text-left border p-3 ${
                      selectedProductId === product._id ? 'border-[#d4af37] bg-[#0f1622]' : 'border-[#2a3444] bg-[#111927]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-[#f5f5f0] text-sm font-semibold">{product.name}</div>
                        <div className="text-[#8a8a8a] text-xs mt-1">{product.category}</div>
                        <div className="text-[#d4af37] text-sm mt-2">${Number(product.price || 0).toFixed(2)}</div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Badge className={product.visible === false ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}>
                          {product.visible === false ? 'Hidden' : 'Visible'}
                        </Badge>
                        {product.featured && <Badge className="bg-[#d4af37]/20 text-[#d4af37]">Featured</Badge>}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-[#1a2332] border border-[#2a3444] p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-[#f5f5f0] text-xl font-semibold">{selectedProductId ? 'Editar producto' : 'Crear producto'}</h2>
                  <p className="text-[#8a8a8a] text-sm mt-1">Cambia precio, imagenes, textos, visibilidad y producto destacado.</p>
                </div>
                <div className="flex gap-3">
                  {selectedProductId && (
                    <button onClick={handleDeleteProduct} disabled={savingProduct} className="px-4 py-2 border border-red-500 text-red-400 disabled:opacity-50">
                      Eliminar
                    </button>
                  )}
                  <button onClick={handleSaveProduct} disabled={savingProduct} className="px-5 py-2 bg-[#d4af37] text-[#0a0e17] font-semibold disabled:opacity-50">
                    {savingProduct ? 'Guardando...' : 'Guardar producto'}
                  </button>
                </div>
              </div>

              {productMessage && (
                <Alert className={`mb-6 ${productMessage.includes('correctamente') ? 'border-green-500 bg-green-500/10' : 'border-red-500 bg-red-500/10'}`}>
                  <AlertDescription className={productMessage.includes('correctamente') ? 'text-green-400' : 'text-red-400'}>
                    {productMessage}
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  ['name', 'Nombre'],
                  ['slug', 'Slug'],
                  ['category', 'Categoria'],
                  ['sku', 'SKU'],
                  ['price', 'Precio'],
                  ['inventory', 'Inventario'],
                ].map(([name, label]) => (
                  <label key={name} className="text-sm text-[#b0b0b0]">
                    {label}
                    <input
                      name={name}
                      type={name === 'price' || name === 'inventory' ? 'number' : 'text'}
                      step={name === 'price' ? '0.01' : undefined}
                      value={productForm[name]}
                      onChange={handleProductChange}
                      className="mt-2 w-full bg-[#0a0e17] border border-[#2a3444] p-3 text-[#f5f5f0]"
                    />
                  </label>
                ))}
              </div>

              <label className="text-sm text-[#b0b0b0] block mt-4">
                Descripcion
                <textarea name="description" value={productForm.description} onChange={handleProductChange} rows={4} className="mt-2 w-full bg-[#0a0e17] border border-[#2a3444] p-3 text-[#f5f5f0]" />
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <label className="text-sm text-[#b0b0b0]">
                  Tallas separadas por coma
                  <input name="sizesText" value={productForm.sizesText} onChange={handleProductChange} className="mt-2 w-full bg-[#0a0e17] border border-[#2a3444] p-3 text-[#f5f5f0]" />
                </label>
                <label className="text-sm text-[#b0b0b0]">
                  Imagen principal
                  <input name="image_url" value={productForm.image_url} onChange={handleProductChange} className="mt-2 w-full bg-[#0a0e17] border border-[#2a3444] p-3 text-[#f5f5f0]" />
                  <div className="mt-2">
                    <label className="inline-block px-3 py-2 border border-[#d4af37] text-[#d4af37] text-xs cursor-pointer">
                      {uploadingField === 'image_url' ? 'Subiendo...' : 'Subir archivo'}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(event) => handleUploadImage(event.target.files?.[0], 'image_url', 'product')}
                      />
                    </label>
                  </div>
                </label>
              </div>

              <label className="text-sm text-[#b0b0b0] block mt-4">
                Lista de imagenes, una URL por linea
                <textarea name="imagesText" value={productForm.imagesText} onChange={handleProductChange} rows={5} className="mt-2 w-full bg-[#0a0e17] border border-[#2a3444] p-3 text-[#f5f5f0]" />
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {[
                  ['details_material', 'Material'],
                  ['details_embroidery', 'Bordado'],
                  ['details_sizing', 'Sizing'],
                  ['details_shipping', 'Shipping'],
                ].map(([name, label]) => (
                  <label key={name} className="text-sm text-[#b0b0b0]">
                    {label}
                    <textarea name={name} value={productForm[name]} onChange={handleProductChange} rows={3} className="mt-2 w-full bg-[#0a0e17] border border-[#2a3444] p-3 text-[#f5f5f0]" />
                  </label>
                ))}
              </div>

              <div className="flex flex-wrap gap-6 mt-6 text-[#f5f5f0]">
                <label className="flex items-center gap-3"><input type="checkbox" name="visible" checked={productForm.visible} onChange={handleProductChange} />Visible en tienda</label>
                <label className="flex items-center gap-3"><input type="checkbox" name="featured" checked={productForm.featured} onChange={handleProductChange} />Mostrar en Home</label>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'home' && (
          <div className="bg-[#1a2332] border border-[#2a3444] p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-[#f5f5f0] text-xl font-semibold">Contenido del Home</h2>
                <p className="text-[#8a8a8a] text-sm mt-1">Edita los textos, enlaces e imagenes principales de la portada.</p>
              </div>
              <button onClick={handleSaveHome} disabled={savingHome} className="px-5 py-2 bg-[#d4af37] text-[#0a0e17] font-semibold disabled:opacity-50">
                {savingHome ? 'Guardando...' : 'Guardar Home'}
              </button>
            </div>

            {homeMessage && (
              <Alert className={`mb-6 ${homeMessage.includes('actualizado') ? 'border-green-500 bg-green-500/10' : 'border-red-500 bg-red-500/10'}`}>
                <AlertDescription className={homeMessage.includes('actualizado') ? 'text-green-400' : 'text-red-400'}>
                  {homeMessage}
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                ['hero_label', 'Hero label'],
                ['hero_image', 'Hero imagen'],
                ['hero_cta_text', 'Hero CTA texto'],
                ['hero_cta_link', 'Hero CTA link'],
                ['collection_label', 'Collection label'],
                ['collection_title', 'Collection titulo'],
                ['story_label', 'Story label'],
                ['story_image', 'Story imagen'],
                ['story_cta_text', 'Story CTA texto'],
                ['story_cta_link', 'Story CTA link'],
                ['banner_label', 'Banner label'],
                ['banner_text', 'Banner texto'],
              ].map(([name, label]) => (
                <label key={name} className="text-sm text-[#b0b0b0]">
                  {label}
                  <input name={name} value={homeForm[name]} onChange={handleHomeChange} className="mt-2 w-full bg-[#0a0e17] border border-[#2a3444] p-3 text-[#f5f5f0]" />
                  {(name === 'hero_image' || name === 'story_image') && (
                    <div className="mt-2">
                      <label className="inline-block px-3 py-2 border border-[#d4af37] text-[#d4af37] text-xs cursor-pointer">
                        {uploadingField === name ? 'Subiendo...' : 'Subir archivo'}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(event) => handleUploadImage(event.target.files?.[0], name, 'home')}
                        />
                      </label>
                    </div>
                  )}
                </label>
              ))}
            </div>

            <label className="text-sm text-[#b0b0b0] block mt-4">
              Hero titulo
              <input name="hero_title" value={homeForm.hero_title} onChange={handleHomeChange} className="mt-2 w-full bg-[#0a0e17] border border-[#2a3444] p-3 text-[#f5f5f0]" />
            </label>
            <label className="text-sm text-[#b0b0b0] block mt-4">
              Hero subtitulo
              <textarea name="hero_subtitle" value={homeForm.hero_subtitle} onChange={handleHomeChange} rows={2} className="mt-2 w-full bg-[#0a0e17] border border-[#2a3444] p-3 text-[#f5f5f0]" />
            </label>
            <label className="text-sm text-[#b0b0b0] block mt-4">
              Cita principal
              <textarea name="brand_quote" value={homeForm.brand_quote} onChange={handleHomeChange} rows={3} className="mt-2 w-full bg-[#0a0e17] border border-[#2a3444] p-3 text-[#f5f5f0]" />
            </label>
            <label className="text-sm text-[#b0b0b0] block mt-4">
              Story titulo
              <input name="story_title" value={homeForm.story_title} onChange={handleHomeChange} className="mt-2 w-full bg-[#0a0e17] border border-[#2a3444] p-3 text-[#f5f5f0]" />
            </label>
            <label className="text-sm text-[#b0b0b0] block mt-4">
              Story texto
              <textarea name="story_body" value={homeForm.story_body} onChange={handleHomeChange} rows={4} className="mt-2 w-full bg-[#0a0e17] border border-[#2a3444] p-3 text-[#f5f5f0]" />
            </label>

            <div className="mt-8">
              <h3 className="text-[#f5f5f0] text-lg font-semibold mb-4">Pilares</h3>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {homeForm.pillars.map((pillar, index) => (
                  <div key={pillar.numeral} className="border border-[#2a3444] p-4 bg-[#111927]">
                    <div className="text-[#d4af37] mb-3">{pillar.numeral}</div>
                    <input value={pillar.title} onChange={(event) => handlePillarChange(index, 'title', event.target.value)} placeholder="Titulo" className="w-full bg-[#0a0e17] border border-[#2a3444] p-3 text-[#f5f5f0] mb-3" />
                    <textarea value={pillar.description} onChange={(event) => handlePillarChange(index, 'description', event.target.value)} placeholder="Descripcion" rows={4} className="w-full bg-[#0a0e17] border border-[#2a3444] p-3 text-[#f5f5f0]" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'global' && (
          <div className="bg-[#1a2332] border border-[#2a3444] p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-[#f5f5f0] text-xl font-semibold">Contenido global y estilos</h2>
                <p className="text-[#8a8a8a] text-sm mt-1">Controla navbar, footer, textos comerciales, colores, tipografias y tamanos base.</p>
              </div>
              <button onClick={handleSaveGlobal} disabled={savingGlobal} className="px-5 py-2 bg-[#d4af37] text-[#0a0e17] font-semibold disabled:opacity-50">
                {savingGlobal ? 'Guardando...' : 'Guardar global'}
              </button>
            </div>

            {globalMessage && (
              <Alert className={`mb-6 ${globalMessage.includes('actualizado') ? 'border-green-500 bg-green-500/10' : 'border-red-500 bg-red-500/10'}`}>
                <AlertDescription className={globalMessage.includes('actualizado') ? 'text-green-400' : 'text-red-400'}>
                  {globalMessage}
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                ['logo_text', 'Logo texto'],
                ['mobile_menu_badge', 'Badge menu movil'],
                ['footer_email', 'Email footer'],
                ['instagram_url', 'Instagram URL'],
                ['tiktok_url', 'TikTok URL'],
                ['newsletter_title', 'Titulo newsletter'],
                ['footer_badge_text', 'Texto badge footer'],
                ['shop_title', 'Titulo Shop'],
                ['shop_count_label_template', 'Template contador Shop'],
                ['shop_empty_text', 'Texto sin productos'],
                ['shop_banner_label', 'Banner Shop label'],
                ['shop_banner_text', 'Banner Shop texto'],
                ['product_badge_text', 'Badge producto'],
                ['product_breadcrumb_shop', 'Breadcrumb Shop'],
                ['product_breadcrumb_collection', 'Breadcrumb coleccion'],
                ['add_to_cart_text', 'Texto boton compra'],
                ['add_to_cart_loading_text', 'Texto boton loading'],
              ].map(([name, label]) => (
                <label key={name} className="text-sm text-[#b0b0b0]">
                  {label}
                  <input name={name} value={globalForm[name]} onChange={handleGlobalChange} className="mt-2 w-full bg-[#0a0e17] border border-[#2a3444] p-3 text-[#f5f5f0]" />
                </label>
              ))}
            </div>

            <label className="text-sm text-[#b0b0b0] block mt-4">
              Descripcion footer
              <textarea name="footer_description" value={globalForm.footer_description} onChange={handleGlobalChange} rows={3} className="mt-2 w-full bg-[#0a0e17] border border-[#2a3444] p-3 text-[#f5f5f0]" />
            </label>
            <label className="text-sm text-[#b0b0b0] block mt-4">
              Texto newsletter
              <textarea name="newsletter_text" value={globalForm.newsletter_text} onChange={handleGlobalChange} rows={3} className="mt-2 w-full bg-[#0a0e17] border border-[#2a3444] p-3 text-[#f5f5f0]" />
            </label>
            <label className="text-sm text-[#b0b0b0] block mt-4">
              Texto legal footer
              <input name="footer_bottom_text" value={globalForm.footer_bottom_text} onChange={handleGlobalChange} className="mt-2 w-full bg-[#0a0e17] border border-[#2a3444] p-3 text-[#f5f5f0]" />
            </label>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
              <label className="text-sm text-[#b0b0b0]">
                Links navbar
                <textarea name="navbarLinksText" value={globalForm.navbarLinksText} onChange={handleGlobalChange} rows={5} className="mt-2 w-full bg-[#0a0e17] border border-[#2a3444] p-3 text-[#f5f5f0]" />
                <span className="text-xs text-[#8a8a8a] block mt-2">Formato: `Texto|/ruta` una linea por enlace.</span>
              </label>
              <label className="text-sm text-[#b0b0b0]">
                Links footer tienda
                <textarea name="footerShopLinksText" value={globalForm.footerShopLinksText} onChange={handleGlobalChange} rows={5} className="mt-2 w-full bg-[#0a0e17] border border-[#2a3444] p-3 text-[#f5f5f0]" />
                <span className="text-xs text-[#8a8a8a] block mt-2">Formato: `Texto|ruta|true/false`.</span>
              </label>
              <label className="text-sm text-[#b0b0b0]">
                Links footer marca
                <textarea name="footerBrandLinksText" value={globalForm.footerBrandLinksText} onChange={handleGlobalChange} rows={5} className="mt-2 w-full bg-[#0a0e17] border border-[#2a3444] p-3 text-[#f5f5f0]" />
                <span className="text-xs text-[#8a8a8a] block mt-2">Usa `true` para enlaces externos.</span>
              </label>
            </div>

            <div className="mt-8">
              <h3 className="text-[#f5f5f0] text-lg font-semibold mb-4">Tema visual</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {[
                  ['theme_primary_bg', 'Color fondo principal'],
                  ['theme_secondary_bg', 'Color fondo secundario'],
                  ['theme_primary_text', 'Color texto principal'],
                  ['theme_secondary_text', 'Color texto secundario'],
                  ['theme_accent_gold', 'Color acento'],
                  ['theme_border_color', 'Color bordes'],
                  ['theme_body_font', 'Fuente cuerpo'],
                  ['theme_heading_font', 'Fuente titulos'],
                  ['theme_body_font_size', 'Tamano cuerpo'],
                  ['theme_hero_title_size', 'Tamano hero'],
                  ['theme_section_title_size', 'Tamano titulos seccion'],
                ].map(([name, label]) => (
                  <label key={name} className="text-sm text-[#b0b0b0]">
                    {label}
                    <input name={name} value={globalForm[name]} onChange={handleGlobalChange} className="mt-2 w-full bg-[#0a0e17] border border-[#2a3444] p-3 text-[#f5f5f0]" />
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'philosophy' && (
          <div className="bg-[#1a2332] border border-[#2a3444] p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-[#f5f5f0] text-xl font-semibold">Pagina Filosofia</h2>
                <p className="text-[#8a8a8a] text-sm mt-1">Edita desde el hero hasta la CTA final e imagenes de la pagina de filosofia.</p>
              </div>
              <button onClick={handleSavePhilosophy} disabled={savingPhilosophy} className="px-5 py-2 bg-[#d4af37] text-[#0a0e17] font-semibold disabled:opacity-50">
                {savingPhilosophy ? 'Guardando...' : 'Guardar Filosofia'}
              </button>
            </div>

            {philosophyMessage && (
              <Alert className={`mb-6 ${philosophyMessage.includes('actualizado') ? 'border-green-500 bg-green-500/10' : 'border-red-500 bg-red-500/10'}`}>
                <AlertDescription className={philosophyMessage.includes('actualizado') ? 'text-green-400' : 'text-red-400'}>
                  {philosophyMessage}
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                ['hero_label', 'Hero label'],
                ['hero_image', 'Hero imagen'],
                ['values_label', 'Label valores'],
                ['values_title', 'Titulo valores'],
                ['mission_label', 'Label mision'],
                ['vision_label', 'Label vision'],
                ['cta_text', 'CTA texto'],
                ['cta_link', 'CTA link'],
              ].map(([name, label]) => (
                <label key={name} className="text-sm text-[#b0b0b0]">
                  {label}
                  <input name={name} value={philosophyForm[name]} onChange={handlePhilosophyChange} className="mt-2 w-full bg-[#0a0e17] border border-[#2a3444] p-3 text-[#f5f5f0]" />
                  {name === 'hero_image' && (
                    <div className="mt-2">
                      <label className="inline-block px-3 py-2 border border-[#d4af37] text-[#d4af37] text-xs cursor-pointer">
                        {uploadingField === name ? 'Subiendo...' : 'Subir archivo'}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(event) => handleUploadImage(event.target.files?.[0], name, 'philosophy')}
                        />
                      </label>
                    </div>
                  )}
                </label>
              ))}
            </div>

            <label className="text-sm text-[#b0b0b0] block mt-4">
              Cita inicial
              <textarea name="opening_quote" value={philosophyForm.opening_quote} onChange={handlePhilosophyChange} rows={3} className="mt-2 w-full bg-[#0a0e17] border border-[#2a3444] p-3 text-[#f5f5f0]" />
            </label>
            <label className="text-sm text-[#b0b0b0] block mt-4">
              Texto de mision
              <textarea name="mission_text" value={philosophyForm.mission_text} onChange={handlePhilosophyChange} rows={3} className="mt-2 w-full bg-[#0a0e17] border border-[#2a3444] p-3 text-[#f5f5f0]" />
            </label>
            <label className="text-sm text-[#b0b0b0] block mt-4">
              Texto de vision
              <textarea name="vision_text" value={philosophyForm.vision_text} onChange={handlePhilosophyChange} rows={3} className="mt-2 w-full bg-[#0a0e17] border border-[#2a3444] p-3 text-[#f5f5f0]" />
            </label>
            <label className="text-sm text-[#b0b0b0] block mt-4">
              Secciones
              <textarea name="sectionsText" value={philosophyForm.sectionsText} onChange={handlePhilosophyChange} rows={8} className="mt-2 w-full bg-[#0a0e17] border border-[#2a3444] p-3 text-[#f5f5f0]" />
              <span className="text-xs text-[#8a8a8a] block mt-2">Formato por linea: `ACT I|EL ORIGEN|Parrafo 1|Parrafo 2`.</span>
            </label>
            <label className="text-sm text-[#b0b0b0] block mt-4">
              Valores
              <textarea name="valuesText" value={philosophyForm.valuesText} onChange={handlePhilosophyChange} rows={8} className="mt-2 w-full bg-[#0a0e17] border border-[#2a3444] p-3 text-[#f5f5f0]" />
              <span className="text-xs text-[#8a8a8a] block mt-2">Formato por linea: `I|ARENA|Descripcion`.</span>
            </label>
          </div>
        )}

        {activeTab === 'printful' && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6">
            <div className="bg-[#1a2332] border border-[#2a3444] p-6">
              <h2 className="text-[#f5f5f0] text-xl font-semibold mb-3">Printful</h2>
              <p className="text-[#8a8a8a] text-sm leading-relaxed">
                Importa productos ya creados en tu cuenta de Printful y luego sincroniza productos locales para enlazar sus variantes.
              </p>
              <div className="flex flex-wrap gap-3 mt-6">
                <button onClick={handleImportPrintful} disabled={importLoading} className="px-5 py-2 bg-[#f5f5f0] text-[#0a0e17] font-semibold disabled:opacity-50">
                  {importLoading ? 'Importando...' : 'Importar catalogo Printful'}
                </button>
                <button onClick={handleSyncPrintful} disabled={syncLoading} className="px-5 py-2 bg-[#d4af37] text-[#0a0e17] font-semibold disabled:opacity-50">
                  {syncLoading ? 'Sincronizando...' : 'Sincronizar productos locales'}
                </button>
              </div>
              {importMessage && (
                <Alert className={`mt-5 ${importMessage.includes('Error') ? 'border-red-500 bg-red-500/10' : 'border-green-500 bg-green-500/10'}`}>
                  <AlertDescription className={importMessage.includes('Error') ? 'text-red-400' : 'text-green-400'}>{importMessage}</AlertDescription>
                </Alert>
              )}
              {syncMessage && (
                <Alert className={`mt-5 ${syncMessage.includes('Error') ? 'border-red-500 bg-red-500/10' : 'border-green-500 bg-green-500/10'}`}>
                  <AlertDescription className={syncMessage.includes('Error') ? 'text-red-400' : 'text-green-400'}>{syncMessage}</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="bg-[#1a2332] border border-[#2a3444] p-6">
              <h3 className="text-[#f5f5f0] font-semibold mb-4">Ultimas ordenes</h3>
              <div className="space-y-3">
                {(stats?.recent_orders || []).map((order) => (
                  <div key={order._id} className="border border-[#2a3444] p-3 bg-[#111927]">
                    <div className="text-[#f5f5f0] text-sm font-mono">{order.session_id || order._id}</div>
                    <div className="text-[#8a8a8a] text-xs mt-1">{new Date(order.created_at).toLocaleDateString()}</div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-[#d4af37] font-semibold">${Number(order.amount || 0).toFixed(2)}</span>
                      <Badge className={order.payment_status === 'paid' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}>
                        {order.payment_status || 'pending'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
