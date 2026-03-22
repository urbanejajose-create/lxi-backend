import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { siteContentService } from '../services/api';

const SiteContentContext = createContext(null);

const defaultGlobalContent = {
  logo_text: 'LXI',
  navbar_links: [
    { label: 'SHOP', path: '/shop' },
    { label: 'PHILOSOPHY', path: '/philosophy' },
    { label: 'DROP 01', path: '/shop' },
  ],
  mobile_menu_badge: 'FOUNDERS EDITION',
  footer_description: 'Vestir la transformacion de quienes eligieron enfrentar su arena.',
  footer_email: 'wearelxi@gmail.com',
  instagram_url: 'https://instagram.com',
  tiktok_url: 'https://tiktok.com',
  footer_shop_links: [
    { label: 'DROP 01', path: '/shop', external: false },
    { label: 'TOPS', path: '/shop?category=TOPS', external: false },
    { label: 'HEADWEAR', path: '/shop?category=HEADWEAR', external: false },
    { label: 'OUTERWEAR', path: '/shop?category=OUTERWEAR', external: false },
  ],
  footer_brand_links: [
    { label: 'PHILOSOPHY', path: '/philosophy', external: false },
    { label: 'THE BOOK', path: 'https://joseurbaneja.com', external: true },
  ],
  newsletter_title: 'ENTER THE ARENA',
  newsletter_text: 'Be the first to know about new drops and LXI philosophy.',
  footer_bottom_text: 'All rights reserved.',
  footer_badge_text: 'FOUNDERS EDITION MMXXVI',
  shop_title: 'DROP 01',
  shop_count_label_template: 'FOUNDERS EDITION - {count} PIECES',
  shop_empty_text: 'No products found',
  shop_banner_label: 'FOUNDERS EDITION - AVAILABLE FOR LIMITED TIME',
  shop_banner_text: 'PRODUCED ON DEMAND - SHIPS VIA PRINTFUL',
  product_badge_text: 'FOUNDERS EDITION',
  product_breadcrumb_shop: 'SHOP',
  product_breadcrumb_collection: 'DROP 01',
  add_to_cart_text: 'ADD TO ARMOR',
  add_to_cart_loading_text: 'ADDING...',
  theme: {
    primary_bg: '#0a0e17',
    secondary_bg: '#1a2332',
    primary_text: '#f5f5f0',
    secondary_text: '#8a8a8a',
    accent_gold: '#d4af37',
    border_color: '#2a3444',
    body_font: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
    heading_font: "'Cormorant Garamond', serif",
    body_font_size: '16px',
    hero_title_size: 'clamp(3rem, 8vw, 5.5rem)',
    section_title_size: 'clamp(2rem, 5vw, 3.5rem)',
  },
};

const applyTheme = (theme = {}) => {
  const root = document.documentElement;
  root.style.setProperty('--lxi-primary-bg', theme.primary_bg || defaultGlobalContent.theme.primary_bg);
  root.style.setProperty('--lxi-secondary-bg', theme.secondary_bg || defaultGlobalContent.theme.secondary_bg);
  root.style.setProperty('--lxi-primary-text', theme.primary_text || defaultGlobalContent.theme.primary_text);
  root.style.setProperty('--lxi-secondary-text', theme.secondary_text || defaultGlobalContent.theme.secondary_text);
  root.style.setProperty('--lxi-accent-gold', theme.accent_gold || defaultGlobalContent.theme.accent_gold);
  root.style.setProperty('--lxi-border', theme.border_color || defaultGlobalContent.theme.border_color);
  root.style.setProperty('--lxi-body-font', theme.body_font || defaultGlobalContent.theme.body_font);
  root.style.setProperty('--lxi-heading-font', theme.heading_font || defaultGlobalContent.theme.heading_font);
  root.style.setProperty('--lxi-body-font-size', theme.body_font_size || defaultGlobalContent.theme.body_font_size);
  root.style.setProperty('--lxi-hero-title-size', theme.hero_title_size || defaultGlobalContent.theme.hero_title_size);
  root.style.setProperty('--lxi-section-title-size', theme.section_title_size || defaultGlobalContent.theme.section_title_size);
};

export const SiteContentProvider = ({ children }) => {
  const [globalContent, setGlobalContent] = useState(defaultGlobalContent);

  useEffect(() => {
    let mounted = true;

    const fetchGlobalContent = async () => {
      try {
        const response = await siteContentService.getGlobalContent();
        if (!mounted) {
          return;
        }
        const content = { ...defaultGlobalContent, ...(response.data.content || {}) };
        setGlobalContent(content);
        applyTheme(content.theme);
      } catch (error) {
        applyTheme(defaultGlobalContent.theme);
      }
    };

    fetchGlobalContent();

    return () => {
      mounted = false;
    };
  }, []);

  const value = useMemo(() => ({ globalContent, setGlobalContent }), [globalContent]);

  return <SiteContentContext.Provider value={value}>{children}</SiteContentContext.Provider>;
};

export const useSiteContent = () => {
  const context = useContext(SiteContentContext);
  if (!context) {
    throw new Error('useSiteContent must be used within SiteContentProvider');
  }
  return context;
};
