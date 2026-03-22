import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram } from 'lucide-react';
import NewsletterSignup from '../NewsletterSignup';
import { useSiteContent } from '../../context/SiteContentContext';

const Footer = () => {
  const { globalContent } = useSiteContent();
  const footerLinks = {
    shop: globalContent.footer_shop_links || [],
    brand: globalContent.footer_brand_links || [],
  };

  return (
    <footer className="bg-[#0a0e17] border-t border-[#d4af37]">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-16 lg:py-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
          {/* Brand Column */}
          <div className="space-y-6">
            <Link to="/" className="text-[#d4af37] font-serif text-3xl tracking-[0.3em] font-light">
              {globalContent.logo_text}
            </Link>
            <p className="text-[#8a8a8a] text-sm leading-relaxed max-w-xs">
              {globalContent.footer_description}
            </p>
            <a
              href={`mailto:${globalContent.footer_email}`}
              className="inline-block text-[#d4af37] text-sm hover:text-[#f5f5f0] transition-colors duration-300"
            >
              {globalContent.footer_email}
            </a>
            <div className="flex items-center gap-4 pt-4">
              <a
                href={globalContent.instagram_url}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="social-instagram"
                className="text-[#f5f5f0] hover:text-[#d4af37] transition-colors duration-300"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href={globalContent.tiktok_url}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="social-tiktok"
                className="text-[#f5f5f0] hover:text-[#d4af37] transition-colors duration-300"
                aria-label="TikTok"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Navigation Column */}
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="section-label">SHOP</h4>
              <ul className="space-y-3">
                {footerLinks.shop.map((link) => (
                  <li key={`${link.label}-${link.path}`}>
                    {link.external ? (
                      <a
                        href={link.path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="footer-link hover:text-[#d4af37] transition-colors duration-300"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        to={link.path}
                        className="footer-link hover:text-[#d4af37] transition-colors duration-300"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="section-label">BRAND</h4>
              <ul className="space-y-3">
                {footerLinks.brand.map((link) => (
                  <li key={`${link.label}-${link.path}`}>
                    {link.external ? (
                      <a
                        href={link.path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="footer-link hover:text-[#d4af37] transition-colors duration-300"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        to={link.path}
                        className="footer-link hover:text-[#d4af37] transition-colors duration-300"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Newsletter Column */}
          <div className="space-y-4">
            <h4 className="section-label">{globalContent.newsletter_title}</h4>
            <p className="text-[#8a8a8a] text-sm">
              {globalContent.newsletter_text}
            </p>
            <NewsletterSignup />
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-[#2a3444] flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[#8a8a8a] text-xs tracking-wider">
            © {new Date().getFullYear()} {globalContent.logo_text}. {globalContent.footer_bottom_text}
          </p>
          <p className="text-[#8a8a8a] text-xs tracking-[0.2em]">
            {globalContent.footer_badge_text}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
