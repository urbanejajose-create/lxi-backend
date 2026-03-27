import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Plus, Minus, ShoppingBag, Lock, Package, Shield } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../ui/sheet.jsx';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import { getImageUrl } from '../../services/api';

const CartDrawer = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    cartTotal,
    amountToFreeShipping,
    freeShippingThreshold,
    clearCart,
  } = useCart();

  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleCheckout = async () => {
    if (items.length === 0) return;

    if (!isAuthenticated) {
      toast.error('Please login to checkout');
      navigate('/login');
      return;
    }

    setIsCheckingOut(true);
    closeCart();
    navigate('/checkout');
    setIsCheckingOut(false);
  };

  const progressPercentage = Math.min(100, (cartTotal / freeShippingThreshold) * 100);

  return (
    <Sheet open={isOpen} onOpenChange={closeCart}>
      <SheetContent
        className="w-full sm:max-w-md bg-[#1a2332] border-l border-[#2a3444] p-0 rounded-none"
      >
        <SheetHeader className="p-6 border-b border-[#2a3444]">
          <SheetTitle className="text-[#f5f5f0] font-serif text-xl tracking-wider font-light flex items-center gap-3">
            <ShoppingBag className="w-5 h-5 text-[#d4af37]" />
            YOUR ARMOR
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-[calc(100vh-80px)]">
          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center px-6">
              <ShoppingBag className="w-16 h-16 text-[#2a3444] mb-6" />
              <p className="text-[#8a8a8a] text-center">
                Tu armadura está vacía.
              </p>
              <button
                onClick={() => {
                  closeCart();
                  navigate('/shop');
                }}
                data-testid="continue-shopping-btn"
                className="mt-6 btn-gold-outline px-8 py-3 text-[11px] tracking-[0.2em]"
              >
                EXPLORE INITIUM
              </button>
            </div>
          ) : (
            <>
              {/* Free Shipping Progress */}
              <div className="px-6 py-4 border-b border-[#2a3444]">
                {amountToFreeShipping > 0 ? (
                  <p className="text-[#8a8a8a] text-xs text-center mb-3">
                    Faltan <span className="text-[#d4af37]">${amountToFreeShipping.toFixed(2)}</span> para envío gratis
                  </p>
                ) : (
                  <p className="text-[#d4af37] text-xs text-center mb-3 tracking-wider">
                    ENVÍO GRATIS DESBLOQUEADO
                  </p>
                )}
                <div className="shipping-progress">
                  <div
                    className="shipping-progress-bar"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                {items.map((item) => (
                  <div
                    key={`${item.id}-${item.size}`}
                    data-testid={`cart-item-${item.id}`}
                    className="flex gap-4 pb-4 border-b border-[#2a3444]"
                  >
                    <div className="w-20 h-20 bg-[#0a0e17] flex-shrink-0 overflow-hidden">
                      <img
                        src={getImageUrl(item.image)}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-[#f5f5f0] text-xs tracking-wider font-medium">
                            {item.name}
                          </h4>
                          <p className="text-[#8a8a8a] text-xs mt-1">
                            Size: {item.size}
                          </p>
                        </div>
                        <button
                          onClick={() => removeItem(item.id, item.size)}
                          data-testid={`remove-item-${item.id}`}
                          className="text-[#8a8a8a] hover:text-[#d4af37] transition-colors duration-300"
                          aria-label="Remove item"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex justify-between items-center mt-3">
                        <div className="flex items-center border border-[#2a3444]">
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.size, item.quantity - 1)
                            }
                            data-testid={`decrease-qty-${item.id}`}
                            className="px-2 py-1 text-[#d4af37] hover:bg-[#2a3444] transition-colors duration-300"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-3 text-[#f5f5f0] text-xs">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.size, item.quantity + 1)
                            }
                            data-testid={`increase-qty-${item.id}`}
                            className="px-2 py-1 text-[#d4af37] hover:bg-[#2a3444] transition-colors duration-300"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <p className="text-[#d4af37] text-sm font-medium">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Checkout Section */}
              <div className="p-6 border-t border-[#2a3444] bg-[#0a0e17]">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[#8a8a8a] text-sm tracking-wider">SUBTOTAL</span>
                  <span className="text-[#d4af37] text-lg font-medium">
                    ${cartTotal.toFixed(2)}
                  </span>
                </div>

                <div className="gold-divider mb-4" />

                <button
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                  data-testid="checkout-button"
                  className="w-full btn-gold-fill py-4 text-[11px] tracking-[0.2em] font-sans font-medium disabled:opacity-50"
                >
                  {isCheckingOut ? 'PROCESANDO...' : 'PROCEED TO ARMOR'}
                </button>

                <div className="flex justify-center gap-6 mt-4">
                  <div className="trust-badge">
                    <Lock className="w-3 h-3" />
                    <span>Secure</span>
                  </div>
                  <div className="trust-badge">
                    <Package className="w-3 h-3" />
                    <span>Printful</span>
                  </div>
                  <div className="trust-badge">
                    <Shield className="w-3 h-3" />
                    <span>Protected</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;
