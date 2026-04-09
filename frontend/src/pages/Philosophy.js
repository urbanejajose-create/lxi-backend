import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { siteContentService } from '../services/api';

const fallbackContent = {
  hero_label: 'LA FILOSOFIA LXI',
  hero_image: 'https://images.unsplash.com/photo-1648314789571-4003c96b5b09?w=1920&q=80',
  opening_quote: 'El gladiador no entra a la arena porque no tiene miedo. Entra porque decidio que la batalla vale mas que el miedo.',
  sections: [
    {
      label: 'ACT I',
      title: 'EL ORIGEN',
      paragraphs: [
        'LXI nacio de un libro. De una batalla personal escrita para millones que pelean la misma guerra silenciosa: el sindrome del impostor.',
        'Luchando con el Impostor no es una metafora. Es un metodo. Y LXI es su armadura.',
      ],
    },
    {
      label: 'ACT II',
      title: 'LA TRANSFORMACION',
      paragraphs: [
        'Existen dos tipos de personas en cualquier arena: los que esperan sentirse listos para entrar, y los que entran sabiendo que el miedo nunca desaparece.',
        'LXI viste a los segundos.',
      ],
    },
    {
      label: 'ACT III',
      title: 'EL ESTANDAR',
      paragraphs: [
        'Cada pieza LXI es disenada bajo un solo criterio: Tiene la presencia silenciosa de quien ya gano su primera batalla?',
        'Si la respuesta es no, no existe.',
      ],
    },
  ],
  values_label: 'LOS VALORES',
  values_title: 'Cinco Pilares',
  values: [
    { numeral: 'I', name: 'ARENA', description: 'El espacio donde decides aparecer. No el escenario que te espera, sino el que construyes con cada decision.' },
    { numeral: 'II', name: 'DISCIPLINA', description: 'La consistencia silenciosa que construye identidad. No lo que haces cuando te observan, sino lo que repites cuando nadie mira.' },
    { numeral: 'III', name: 'PRESENCIA', description: 'La autoridad que no necesita anunciarse. El poder de ocupar un espacio sin pedirlo ni disculparte.' },
    { numeral: 'IV', name: 'TRANSFORMACION', description: 'El proceso, no el destino. El arte de convertirte en quien decidiste ser, una batalla a la vez.' },
    { numeral: 'V', name: 'LEGADO', description: 'Lo que permanece cuando el miedo desaparece. La huella que dejas en los que te observan pelear.' },
  ],
  mission_label: 'MISION',
  mission_text: 'Vestir la transformacion de quienes eligieron enfrentar su arena.',
  vision_label: 'VISION',
  vision_text: 'Ser la marca que los gladiadores modernos reconocen como suya.',
  cta_text: 'EXPLORE THE COLLECTION',
  cta_link: '/shop',
};

const Philosophy = () => {
  const [content, setContent] = React.useState(fallbackContent);

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
    const fetchContent = async () => {
      try {
        const response = await siteContentService.getPhilosophyContent();
        setContent({ ...fallbackContent, ...(response.data.content || {}) });
      } catch (error) {
        setContent(fallbackContent);
      }
    };

    fetchContent();
  }, []);

  return (
    <div data-testid="philosophy-page" className="bg-[#0a0e17] min-h-screen">
      {/* Hero */}
      <section className="relative h-[60vh] min-h-[400px] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('${content.hero_image}')`,
          }}
        />
        <div className="absolute inset-0 bg-[#0a0e17]/70" />
        <div className="relative z-10 text-center px-6">
          <span className="micro-label">{content.hero_label}</span>
        </div>
      </section>

      {/* Manifesto */}
      <section className="py-24 lg:py-32">
        <div className="max-w-[680px] mx-auto px-6">
          {/* Opening Quote */}
          <blockquote className="reveal-section opacity-0 mb-20">
            <p className="quote-text text-[#f5f5f0] text-2xl sm:text-3xl lg:text-4xl leading-relaxed text-center">
              "{content.opening_quote}"
            </p>
          </blockquote>

          {content.sections.map((section) => (
            <div key={`${section.label}-${section.title}`} className="reveal-section opacity-0 mb-20">
              <span className="micro-label">{section.label}</span>
              <h2 className="text-[#f5f5f0] font-serif text-3xl sm:text-4xl mt-4 mb-8">
                {section.title}
              </h2>
              <div className="text-[#8a8a8a] text-base leading-[1.9] space-y-6">
                {section.paragraphs.map((paragraph, index) => (
                  <p key={`${section.title}-${index}`}>{paragraph}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Brand Values */}
      <section className="py-24 lg:py-32 bg-[#1a2332]">
        <div className="max-w-[900px] mx-auto px-6">
          <div className="reveal-section opacity-0 text-center mb-16">
            <span className="micro-label">{content.values_label}</span>
            <h2 className="text-[#f5f5f0] font-serif text-3xl sm:text-4xl mt-4">
              {content.values_title}
            </h2>
          </div>

          <div className="space-y-12">
            {content.values.map((value, index) => (
              <div
                key={value.numeral}
                className={`reveal-section opacity-0 flex gap-8 items-start border-l border-[#2a3444] pl-8 delay-${index * 100}`}
              >
                <span className="text-[#d4af37] font-serif text-4xl flex-shrink-0 w-12">
                  {value.numeral}
                </span>
                <div>
                  <h3 className="text-[#f5f5f0] text-lg tracking-[0.2em] font-sans font-medium mb-3">
                    {value.name}
                  </h3>
                  <p className="text-[#8a8a8a] text-sm leading-relaxed">
                    {value.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-24 lg:py-32">
        <div className="max-w-[900px] mx-auto px-6">
          <div className="reveal-section opacity-0 border border-[#d4af37] p-8 lg:p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <span className="micro-label">{content.mission_label}</span>
                <p className="text-[#f5f5f0] font-serif text-xl sm:text-2xl mt-4 leading-relaxed">
                  {content.mission_text}
                </p>
              </div>
              <div>
                <span className="micro-label">{content.vision_label}</span>
                <p className="text-[#f5f5f0] font-serif text-xl sm:text-2xl mt-4 leading-relaxed">
                  {content.vision_text}
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="reveal-section opacity-0 text-center mt-16">
            <Link
              to={content.cta_link}
              data-testid="shop-cta"
              className="inline-flex items-center gap-2 text-[#d4af37] text-sm tracking-wider hover:gap-4 transition-all duration-300"
            >
              {content.cta_text}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Philosophy;
