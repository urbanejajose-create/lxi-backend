import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ArrowRight } from 'lucide-react';
import ProductCard from '../components/products/ProductCard';
import { getImageUrl, productService, siteContentService } from '../services/api';
import { products as fallbackProducts } from '../data/products';

const fallbackContent = {
  hero_label: 'FOUNDERS EDITION -  INITIUM',
  hero_title: 'LA ARMADURA DEL GLADIADOR MODERNO',
  hero_subtitle: 'Para quienes eligieron enfrentar su arena.',
  hero_cta_text: 'ENTER INITIUM',
  hero_cta_link: '/shop',
  hero_image: 'https://images.unsplash.com/photo-1648314789571-4003c96b5b09?w=1920&q=80',
  brand_quote: 'No vendemos ropa. Vendemos la armadura que te recuerda quien decidiste ser.',
  pillars: [
    { numeral: 'I', title: 'DISCIPLINA', description: 'La consistencia silenciosa que construye identidad.' },
    { numeral: 'II', title: 'PRESENCIA', description: 'La autoridad que no necesita anunciarse.' },
    { numeral: 'III', title: 'LEGADO', description: 'Lo que permanece cuando el miedo desaparece.' },
  ],
  collection_label: 'INITIUM - FOUNDERS EDITION',
  collection_title: 'La Coleccion',
  story_label: 'NACIO DE UNA BATALLA',
  story_title: 'Cada pieza LXI es un recordatorio de que la batalla mas dificil ya comenzo.',
  story_body: 'LXI nacio de un libro. De una batalla personal escrita para millones que pelean la misma guerra silenciosa: el sindrome del impostor. Luchando con el Impostor no es una metafora. Es un metodo. Y LXI es su armadura.',
  story_image: 'https://images.unsplash.com/photo-1705513010372-b3ba14ef4530?w=1200&q=80',
  story_cta_text: 'READ THE PHILOSOPHY',
  story_cta_link: '/philosophy',
  banner_label: 'FOUNDERS EDITION - AVAILABLE FOR LIMITED TIME',
  banner_text: 'MMXXVI - EACH PIECE MADE TO ORDER',
};

const Home = () => {
  const heroRef = useRef(null);
  const [featuredProducts, setFeaturedProducts] = useState(fallbackProducts.slice(0, 3));
  const [content, setContent] = useState(fallbackContent);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px',
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in-up');
        }
      });
    }, observerOptions);

    const sections = document.querySelectorAll('.reveal-section');
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await productService.getAll();
        const products = response.data.products || [];
        const featured = products.filter((product) => product.featured);
        setFeaturedProducts((featured.length > 0 ? featured : products).slice(0, 3));
      } catch (error) {
        // Use fallback products if API fails
        console.warn('Failed to load featured products from API');
      }
    };

    fetchFeaturedProducts();
  }, []);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await siteContentService.getHomeContent();
        setContent({ ...fallbackContent, ...(response.data.content || {}) });
      } catch (error) {
        console.warn('Failed to load home content from API');
      }
    };

    fetchContent();
  }, []);

  const scrollToContent = () => {
    const brandSection = document.getElementById('brand-statement');
    if (brandSection) {
      brandSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-[#0a0e17]">
      {/* Hero Section */}
      <section
        ref={heroRef}
        data-testid="hero-section"
        className="hero-section relative min-h-screen flex items-center justify-center"
      >
        {/* Background Image */}
        <div
          className="hero-bg animate-slow-zoom"
          style={{
            backgroundImage: `url('${content.hero_image}')`,
          }}
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0e17]/40 to-[#0a0e17]" />

        {/* Content */}
        <div className="relative z-10 w-full px-6">
          <div className="mx-auto max-w-[900px] text-center px-4 sm:px-8 lg:px-10">
            <span className="micro-label animate-fade-in opacity-0 animation-delay-100">
              {content.hero_label}
            </span>

            <h1
              data-testid="hero-headline"
              className="hero-headline text-[#f5f5f0] font-serif text-4xl sm:text-5xl lg:text-7xl mt-8 mb-6 leading-[1.1] tracking-[0.08em] animate-fade-in-up opacity-0 animation-delay-200"
            >
              {content.hero_title}
            </h1>

            <p className="text-[#b8b8b3] text-sm tracking-[0.12em] max-w-xl mx-auto animate-fade-in opacity-0 animation-delay-300">
              {content.hero_subtitle}
            </p>

            <Link
              to={content.hero_cta_link}
              data-testid="hero-cta"
              className="inline-block mt-10 btn-gold-outline px-10 py-4 text-[11px] tracking-[0.2em] font-sans animate-fade-in opacity-0 animation-delay-400"
            >
              {content.hero_cta_text}
            </Link>
          </div>
        </div>

        {/* Scroll Indicator */}
        <button
          onClick={scrollToContent}
          data-testid="scroll-indicator"
          className="absolute bottom-12 left-1/2 transform -translate-x-1/2 text-[#d4af37] animate-scroll-indicator"
          aria-label="Scroll down"
        >
          <ChevronDown className="w-6 h-6" />
        </button>
      </section>

      {/* Brand Statement Section */}
      <section
        id="brand-statement"
        data-testid="brand-statement-section"
        className="bg-[#1a2332] py-24 lg:py-32"
      >
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <blockquote className="reveal-section opacity-0 text-center max-w-3xl mx-auto">
            <p className="quote-text text-[#f5f5f0] text-2xl sm:text-3xl lg:text-4xl leading-relaxed">
              "{content.brand_quote}"
            </p>
          </blockquote>

          {/* Brand Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 mt-20">
            {content.pillars.map((pillar, index) => (
              <div
                key={pillar.numeral}
                className={`reveal-section opacity-0 brand-pillar animation-delay-${(index + 1) * 100}`}
              >
                <span className="text-[#d4af37] font-serif text-3xl">{pillar.numeral}</span>
                <h3 className="text-[#f5f5f0] text-lg tracking-[0.2em] mt-4 mb-3 font-sans font-medium">
                  {pillar.title}
                </h3>
                <p className="text-[#8a8a8a] text-sm leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Collection Preview */}
      <section
        data-testid="collection-section"
        className="py-24 lg:py-32"
      >
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="reveal-section opacity-0 mb-12">
            <span className="micro-label">{content.collection_label}</span>
            <h2 className="section-headline text-[#f5f5f0] font-serif text-3xl sm:text-4xl lg:text-5xl mt-4">
              {content.collection_title}
            </h2>
          </div>

          <div className="product-grid">
            {featuredProducts.map((product) => (
              <ProductCard key={product._id || product.id} product={product} />
            ))}
          </div>

          <div className="reveal-section opacity-0 mt-12 text-center">
            <Link
              to="/shop"
              data-testid="view-collection-link"
              className="inline-flex items-center gap-2 text-[#d4af37] text-sm tracking-wider hover:gap-4 transition-all duration-300"
            >
              VIEW FULL COLLECTION
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Brand Story Teaser */}
      <section
        data-testid="brand-story-section"
        className="py-24 lg:py-32 bg-[#1a2332]"
      >
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16 items-center">
            {/* Image */}
            <div className="lg:col-span-3 reveal-section opacity-0">
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={getImageUrl(content.story_image)}
                  alt="LXI Philosophy"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Text */}
            <div className="lg:col-span-2 reveal-section opacity-0">
              <span className="micro-label">{content.story_label}</span>
              <h2 className="text-[#f5f5f0] font-serif text-2xl sm:text-3xl lg:text-4xl mt-4 mb-6 leading-tight">
                {content.story_title}
              </h2>
              <p className="text-[#8a8a8a] text-sm leading-relaxed mb-8">
                {content.story_body}
              </p>
              <Link
                to={content.story_cta_link}
                data-testid="read-philosophy-link"
                className="inline-flex items-center gap-2 text-[#d4af37] text-sm tracking-wider hover:gap-4 transition-all duration-300"
              >
                {content.story_cta_text}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Drop Banner */}
      <section
        data-testid="drop-banner-section"
        className="py-16 border-t border-b border-[#d4af37]"
      >
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 text-center">
          <span className="micro-label">{content.banner_label}</span>
          <p className="text-[#8a8a8a] text-sm mt-4 tracking-wider">
            {content.banner_text}
          </p>
        </div>
      </section>
    </div>
  );
};

export default Home;
