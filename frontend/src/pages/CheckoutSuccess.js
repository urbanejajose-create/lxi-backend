import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, Package, ArrowRight, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { orderService } from '../services/api';

const CheckoutSuccess = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('checking');
  const [attempts, setAttempts] = useState(0);
  const { clearCart } = useCart();
  const sessionId = searchParams.get('session_id');
  const provider = searchParams.get('provider');
  const paypalOrderId = searchParams.get('token');

  useEffect(() => {
    if (provider === 'paypal' && paypalOrderId) {
      const capturePayPalOrder = async () => {
        try {
          const response = await orderService.capturePayPalOrder(paypalOrderId);
          if (response.data.payment_status === 'paid') {
            setStatus('success');
            clearCart();
            return;
          }
          setStatus('error');
        } catch (error) {
          console.error('Error capturing PayPal order:', error);
          setStatus('error');
        }
      };

      capturePayPalOrder();
      return;
    }

    if (!sessionId) {
      setStatus('error');
      return;
    }

    const pollPaymentStatus = async () => {
      const maxAttempts = 5;
      const pollInterval = 2000;

      if (attempts >= maxAttempts) {
        setStatus('timeout');
        return;
      }

      try {
        const response = await orderService.getStatus(sessionId);
        const data = response.data;

        if (data.payment_status === 'paid') {
          setStatus('success');
          clearCart();
          return;
        } else if (data.status === 'expired') {
          setStatus('expired');
          return;
        }

        setAttempts((prev) => prev + 1);
        setTimeout(pollPaymentStatus, pollInterval);
      } catch (error) {
        console.error('Error checking payment status:', error);
        setStatus('error');
      }
    };

    pollPaymentStatus();
  }, [sessionId, attempts, clearCart, provider, paypalOrderId]);

  const renderContent = () => {
    switch (status) {
      case 'checking':
        return (
          <div className="text-center">
            <div className="w-16 h-16 border-2 border-[#d4af37] border-t-transparent rounded-full animate-spin mx-auto mb-8" />
            <h1 className="text-[#f5f5f0] font-serif text-3xl sm:text-4xl mb-4">
              Verificando tu pedido...
            </h1>
            <p className="text-[#8a8a8a] text-sm">
              Por favor espera mientras confirmamos tu pago.
            </p>
          </div>
        );

      case 'success':
        return (
          <div className="text-center">
            <CheckCircle className="w-20 h-20 text-[#d4af37] mx-auto mb-8" />
            <span className="micro-label">ORDEN CONFIRMADA</span>
            <h1 className="text-[#f5f5f0] font-serif text-3xl sm:text-4xl lg:text-5xl mt-4 mb-6">
              Bienvenido a la Arena
            </h1>
            <p className="text-[#8a8a8a] text-sm max-w-md mx-auto mb-8">
              Tu armadura está en camino. Recibirás un email de confirmación con los detalles de envío.
            </p>

            <div className="border border-[#2a3444] p-6 mb-8 max-w-sm mx-auto">
              <div className="flex items-center gap-3 justify-center">
                <Package className="w-5 h-5 text-[#d4af37]" />
                <span className="text-[#f5f5f0] text-sm tracking-wider">
                  SHIPS IN 3-7 BUSINESS DAYS
                </span>
              </div>
            </div>

            <Link
              to="/shop"
              data-testid="continue-shopping-link"
              className="inline-flex items-center gap-2 text-[#d4af37] text-sm tracking-wider hover:gap-4 transition-all duration-300"
            >
              CONTINUE SHOPPING
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        );

      case 'timeout':
        return (
          <div className="text-center">
            <AlertCircle className="w-20 h-20 text-[#d4af37] mx-auto mb-8" />
            <h1 className="text-[#f5f5f0] font-serif text-3xl sm:text-4xl mb-4">
              Verificación en proceso
            </h1>
            <p className="text-[#8a8a8a] text-sm max-w-md mx-auto mb-8">
              Tu pago está siendo procesado. Recibirás un email de confirmación en breve.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-[#d4af37] text-sm tracking-wider hover:gap-4 transition-all duration-300"
            >
              RETURN HOME
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        );

      case 'expired':
      case 'error':
      default:
        return (
          <div className="text-center">
            <AlertCircle className="w-20 h-20 text-red-500 mx-auto mb-8" />
            <h1 className="text-[#f5f5f0] font-serif text-3xl sm:text-4xl mb-4">
              Algo salió mal
            </h1>
            <p className="text-[#8a8a8a] text-sm max-w-md mx-auto mb-8">
              No pudimos verificar tu pago. Si crees que esto es un error, escribe a wearelxi@gmail.com.
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 text-[#d4af37] text-sm tracking-wider hover:gap-4 transition-all duration-300"
            >
              TRY AGAIN
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        );
    }
  };

  return (
    <div
      data-testid="checkout-success-page"
      className="bg-[#0a0e17] min-h-screen flex items-center justify-center px-6"
    >
      <div className="max-w-lg w-full py-24">
        {renderContent()}
      </div>
    </div>
  );
};

export default CheckoutSuccess;
