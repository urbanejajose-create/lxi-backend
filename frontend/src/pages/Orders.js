import React, { useState, useEffect } from 'react';
import { orderService } from '../services/api';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Badge } from '../components/ui/badge';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderService.getMyOrders();
      setOrders(response.data.orders || []);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
      case 'complete':
      case 'completed':
        return 'bg-green-500/20 text-green-500';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-500';
      case 'cancelled':
        return 'bg-red-500/20 text-red-500';
      case 'shipped':
        return 'bg-blue-500/20 text-blue-500';
      default:
        return 'bg-[#2a3444] text-[#b0b0b0]';
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0e17] px-4 py-20">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-[#f5f5f0] mb-8">My Orders</h1>

        {error && (
          <Alert className="mb-6 border-red-500 bg-red-500/10">
            <AlertDescription className="text-red-500">{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="text-center text-[#b0b0b0]">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#b0b0b0] text-lg">No orders yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-[#1a2332] rounded-lg border border-[#2a3444] p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-[#b0b0b0] text-sm">Order ID</p>
                    <p className="text-[#f5f5f0] font-mono text-sm break-all">{order.session_id || order._id}</p>
                  </div>
                  <Badge className={`${getStatusColor(order.payment_status || order.status)} capitalize`}>
                    {order.payment_status || order.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-[#b0b0b0] text-sm">Date</p>
                    <p className="text-[#f5f5f0]">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#b0b0b0] text-sm">Total</p>
                    <p className="text-[#d4af37] font-bold text-lg">${Number(order.amount || 0).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-[#b0b0b0] text-sm">Items</p>
                    <p className="text-[#f5f5f0]">{order.items?.length || 0}</p>
                  </div>
                  <div>
                    <p className="text-[#b0b0b0] text-sm">Shipping</p>
                    <p className="text-[#f5f5f0]">{order.shipping_address?.city || 'N/A'}</p>
                  </div>
                </div>

                {order.items && order.items.length > 0 && (
                  <div className="border-t border-[#2a3444] pt-4">
                    <p className="text-[#b0b0b0] text-sm mb-2">Items:</p>
                    <div className="space-y-2">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="text-[#f5f5f0] text-sm">
                          {item.name} x{item.quantity} - ${item.price}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* PRINTFUL TRACKING SECTION */}
                {order.printful_status && (
                  <div className="border-t border-[#2a3444] mt-4 pt-4">
                    <p className="text-[#d4af37] text-sm font-semibold mb-3">📦 SHIPPING & TRACKING</p>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-[#b0b0b0]">Status:</span>
                        <Badge className={`capitalize ${
                          order.printful_status === 'shipped' 
                            ? 'bg-blue-500/20 text-blue-500'
                            : order.printful_status === 'processing'
                            ? 'bg-yellow-500/20 text-yellow-500'
                            : order.printful_status === 'failed'
                            ? 'bg-red-500/20 text-red-500'
                            : 'bg-[#2a3444] text-[#b0b0b0]'
                        }`}>
                          {order.printful_status}
                        </Badge>
                      </div>

                      {order.carrier && (
                        <div className="flex justify-between">
                          <span className="text-[#b0b0b0]">Carrier:</span>
                          <span className="text-[#f5f5f0]">{order.carrier}</span>
                        </div>
                      )}

                      {order.tracking_number && (
                        <div className="flex justify-between items-center">
                          <span className="text-[#b0b0b0]">Tracking #:</span>
                          <span className="text-[#f5f5f0] font-mono">{order.tracking_number}</span>
                        </div>
                      )}

                      {order.tracking_url && (
                        <div className="mt-3 pt-3 border-t border-[#2a3444]">
                          <a
                            href={order.tracking_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-[#d4af37] hover:text-[#f5f5f0] transition-colors text-sm font-semibold"
                          >
                            Track Your Package →
                          </a>
                        </div>
                      )}

                      {order.shipped_at && (
                        <div className="text-[#8a8a8a] text-xs mt-2">
                          Shipped: {new Date(order.shipped_at).toLocaleDateString()}
                        </div>
                      )}

                      {order.failure_reason && (
                        <Alert className="mt-3 border-red-500 bg-red-500/10">
                          <AlertDescription className="text-red-500 text-sm">
                            ❌ {order.failure_reason}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
