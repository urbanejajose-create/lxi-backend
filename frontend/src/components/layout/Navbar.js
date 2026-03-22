import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Menu, X, User, Heart, LogOut } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useSiteContent } from '../../context/SiteContentContext';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { itemCount, openCart } = useCart();
  const { isAuthenticated, user, logout } = useAuth();
  const { globalContent } = useSiteContent();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const navLinks = globalContent.navbar_links || [];

  return (
    <>
      <nav
        data-testid="main-navbar"
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? 'bg-[#0a0e17]/95 backdrop-blur-xl border-b border-[#2a3444]'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="relative flex items-center justify-between h-20">
            {/* Logo */}
            <div className="md:w-[220px]">
              <Link
                to="/"
                data-testid="logo-link"
                className="text-[#d4af37] font-serif text-2xl tracking-[0.3em] font-light"
              >
                {globalContent.logo_text}
              </Link>
            </div>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-12 absolute left-1/2 -translate-x-1/2">
                {navLinks.map((link) => (
                  <Link
                  key={`${link.label}-${link.path}`}
                  to={link.path}
                  data-testid={`nav-link-${link.label.toLowerCase().replace(' ', '-')}`}
                  className="nav-link text-[#f5f5f0] text-[11px] font-sans tracking-[0.2em] hover:text-[#d4af37] transition-colors duration-300"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-6 md:w-[220px] justify-end">
              {/* Cart Button */}
              <button
                onClick={openCart}
                data-testid="cart-button"
                className="relative text-[#d4af37] hover:text-[#b5952f] transition-colors duration-300"
                aria-label="Open cart"
              >
                <ShoppingBag className="w-5 h-5" />
                {itemCount > 0 && (
                  <span
                    data-testid="cart-count"
                    className="absolute -top-2 -right-2 w-4 h-4 bg-[#d4af37] text-[#0a0e17] text-[10px] flex items-center justify-center"
                  >
                    {itemCount}
                  </span>
                )}
              </button>

              {/* Auth Links */}
              {isAuthenticated ? (
                <>
                  {user?.is_admin && (
                    <Link
                      to="/admin"
                      className="hidden md:inline text-[#f5f5f0] text-[11px] font-sans tracking-[0.2em] hover:text-[#d4af37] transition-colors duration-300"
                    >
                      ADMIN
                    </Link>
                  )}
                  <Link
                    to="/wishlist"
                    className="text-[#d4af37] hover:text-[#b5952f] transition-colors duration-300"
                    aria-label="Wishlist"
                  >
                    <Heart className="w-5 h-5" />
                  </Link>
                  <Link
                    to="/account"
                    className="text-[#d4af37] hover:text-[#b5952f] transition-colors duration-300"
                    aria-label="Account"
                  >
                    <User className="w-5 h-5" />
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                    }}
                    className="text-[#d4af37] hover:text-[#b5952f] transition-colors duration-300"
                    aria-label="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </>
              ) : (
                <div className="hidden md:flex items-center gap-4">
                  <Link
                    to="/login"
                    className="text-[#f5f5f0] text-[11px] font-sans tracking-[0.2em] hover:text-[#d4af37] transition-colors duration-300"
                  >
                    LOGIN
                  </Link>
                  <span className="text-[#2a3444]">|</span>
                  <Link
                    to="/register"
                    className="text-[#f5f5f0] text-[11px] font-sans tracking-[0.2em] hover:text-[#d4af37] transition-colors duration-300"
                  >
                    REGISTER
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                data-testid="mobile-menu-button"
                className="md:hidden text-[#f5f5f0] hover:text-[#d4af37] transition-colors duration-300"
                aria-label="Open menu"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          data-testid="mobile-menu"
          className="fixed inset-0 z-[100] bg-[#0a0e17]/98 backdrop-blur-xl flex flex-col items-center justify-center"
        >
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            data-testid="close-mobile-menu"
            className="absolute top-6 right-6 text-[#f5f5f0] hover:text-[#d4af37] transition-colors duration-300"
            aria-label="Close menu"
          >
            <X className="w-8 h-8" />
          </button>

          <div className="flex flex-col items-center gap-8">
            {navLinks.map((link, index) => (
              <Link
                key={`${link.label}-${link.path}`}
                to={link.path}
                data-testid={`mobile-nav-link-${link.label.toLowerCase().replace(' ', '-')}`}
                className="mobile-menu-link text-[#f5f5f0] hover:text-[#d4af37] transition-colors duration-300"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {link.label}
              </Link>
            ))}

            {/* Mobile Auth Links */}
            <div className="border-t border-[#2a3444] pt-8 mt-4 w-full flex flex-col items-center gap-4">
              {isAuthenticated ? (
                <>
                  {user?.is_admin && (
                    <Link
                      to="/admin"
                      className="text-[#f5f5f0] hover:text-[#d4af37] transition-colors duration-300"
                    >
                      ADMIN
                    </Link>
                  )}
                  <Link
                    to="/account"
                    className="text-[#f5f5f0] hover:text-[#d4af37] transition-colors duration-300"
                  >
                    ACCOUNT
                  </Link>
                  <Link
                    to="/wishlist"
                    className="text-[#f5f5f0] hover:text-[#d4af37] transition-colors duration-300"
                  >
                    WISHLIST
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-[#f5f5f0] hover:text-[#d4af37] transition-colors duration-300"
                  >
                    LOGOUT
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-[#f5f5f0] hover:text-[#d4af37] transition-colors duration-300"
                  >
                    LOGIN
                  </Link>
                  <Link
                    to="/register"
                    className="text-[#f5f5f0] hover:text-[#d4af37] transition-colors duration-300"
                  >
                    REGISTER
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="absolute bottom-12 text-center">
            <p className="micro-label">{globalContent.mobile_menu_badge}</p>
            <p className="text-[#8a8a8a] text-xs mt-2 tracking-wider">MMXXVI</p>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
