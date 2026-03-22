import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, XCircle } from 'lucide-react';

const CheckoutCancel = () => {
  return (
    <div
      data-testid="checkout-cancel-page"
      className="bg-[#0a0e17] min-h-screen flex items-center justify-center px-6"
    >
      <div className="max-w-lg w-full py-24 text-center">
        <XCircle className="w-20 h-20 text-[#8a8a8a] mx-auto mb-8" />
        
        <span className="micro-label">PAGO CANCELADO</span>
        
        <h1 className="text-[#f5f5f0] font-serif text-3xl sm:text-4xl lg:text-5xl mt-4 mb-6">
          Tu orden fue cancelada
        </h1>
        
        <p className="text-[#8a8a8a] text-sm max-w-md mx-auto mb-8">
          No te preocupes, tu armadura te espera. Los artículos siguen en tu carrito.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/shop"
            data-testid="return-to-shop-link"
            className="btn-gold-outline px-8 py-4 text-[11px] tracking-[0.2em] font-sans"
          >
            RETURN TO SHOP
          </Link>
          
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 text-[#8a8a8a] text-sm tracking-wider hover:text-[#d4af37] transition-colors duration-300"
          >
            GO HOME
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CheckoutCancel;
