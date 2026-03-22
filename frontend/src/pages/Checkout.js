import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button.jsx';
import { Input } from '../components/ui/input.jsx';
import { Alert, AlertDescription } from '../components/ui/alert.jsx';
import { toast } from 'sonner';
import { orderService } from '../services/api';

export default function Checkout() {
  const navigate = useNavigate();
  const { items, cartTotal } = useCart();
  const { user, isAuthenticated } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [formData, setFormData] = useState({
    email: user?.email || '',
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
    address: user?.address || '',
    city: user?.city || '',
    country: user?.country || '',
    zipCode: '',
    phone: user?.phone || '',
  });

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#0a0e17] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#b0b0b0] mb-4">Your cart is empty</p>
          <Button
            onClick={() => navigate('/shop')}
            className="bg-[#d4af37] text-[#0a0e17]"
          >
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0a0e17] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#b0b0b0] mb-4">Please login to proceed with checkout</p>
          <Button
            onClick={() => navigate('/login')}
            className="bg-[#d4af37] text-[#0a0e17]"
          >
            Login
          </Button>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const checkoutPayload = {
    items: items.map(item => ({
      product_id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      size: item.size,
    })),
    shipping_address: {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      city: formData.city,
      zipCode: formData.zipCode,
      country: formData.country,
    },
    origin_url: window.location.origin,
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setError('');

    try {
      const response = paymentMethod === 'paypal'
        ? await orderService.createPayPalCheckout(checkoutPayload)
        : await orderService.createCheckout(checkoutPayload);

      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Error processing checkout');
      toast.error('Checkout error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0e17] pt-32 pb-24">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-3xl font-bold text-[#f5f5f0] mb-8">Checkout</h1>

        {error && (
          <Alert className="mb-6 border-red-500 bg-red-500/10">
            <AlertDescription className="text-red-500">{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleCheckout} className="bg-[#1a2332] p-6 rounded-lg border border-[#2a3444]">
              <h2 className="text-lg font-semibold text-[#f5f5f0] mb-4">Shipping Information</h2>

              <div className="space-y-4 mb-6">
                <Input
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="bg-[#0a0e17] border-[#2a3444] text-[#f5f5f0]"
                />
                <Input
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="bg-[#0a0e17] border-[#2a3444] text-[#f5f5f0]"
                />
                <Input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="bg-[#0a0e17] border-[#2a3444] text-[#f5f5f0]"
                />
                <Input
                  type="text"
                  name="phone"
                  placeholder="Phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="bg-[#0a0e17] border-[#2a3444] text-[#f5f5f0]"
                />
                <Input
                  type="text"
                  name="address"
                  placeholder="Address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  className="bg-[#0a0e17] border-[#2a3444] text-[#f5f5f0]"
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    type="text"
                    name="city"
                    placeholder="City"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    className="bg-[#0a0e17] border-[#2a3444] text-[#f5f5f0]"
                  />
                  <Input
                    type="text"
                    name="zipCode"
                    placeholder="Zip Code"
                    value={formData.zipCode}
                    onChange={handleChange}
                    required
                    className="bg-[#0a0e17] border-[#2a3444] text-[#f5f5f0]"
                  />
                </div>
                <Input
                  type="text"
                  name="country"
                  placeholder="Country"
                  value={formData.country}
                  onChange={handleChange}
                  required
                  className="bg-[#0a0e17] border-[#2a3444] text-[#f5f5f0]"
                />
              </div>

              <div className="mb-6">
                <p className="text-[#f5f5f0] font-semibold mb-3">Payment Method</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('stripe')}
                    className={`border p-3 text-sm font-semibold ${paymentMethod === 'stripe' ? 'border-[#d4af37] text-[#d4af37]' : 'border-[#2a3444] text-[#b0b0b0]'}`}
                  >
                    Stripe
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('paypal')}
                    className={`border p-3 text-sm font-semibold ${paymentMethod === 'paypal' ? 'border-[#d4af37] text-[#d4af37]' : 'border-[#2a3444] text-[#b0b0b0]'}`}
                  >
                    PayPal
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-[#d4af37] text-[#0a0e17] hover:bg-[#e0c158] font-semibold py-4"
              >
                {isProcessing ? 'Processing...' : `Pay with ${paymentMethod === 'paypal' ? 'PayPal' : 'Stripe'}`}
              </Button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="bg-[#1a2332] p-6 rounded-lg border border-[#2a3444] h-fit">
            <h2 className="text-lg font-semibold text-[#f5f5f0] mb-4">Order Summary</h2>

            <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
              {items.map((item) => (
                <div key={`${item.id}-${item.size}`} className="flex justify-between text-[#b0b0b0]">
                  <div>
                    <p className="text-[#f5f5f0]">{item.name}</p>
                    <p className="text-xs">Size: {item.size} x{item.quantity}</p>
                  </div>
                  <p className="text-[#d4af37] font-semibold">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t border-[#2a3444] pt-4">
              <div className="flex justify-between text-[#b0b0b0] mb-2">
                <span>Subtotal</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[#b0b0b0] mb-4">
                <span>Shipping</span>
                <span>{cartTotal >= 150 ? 'FREE' : 'TBD'}</span>
              </div>
              <div className="flex justify-between text-[#f5f5f0] font-bold text-lg">
                <span>Total</span>
                <span className="text-[#d4af37]">${cartTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
