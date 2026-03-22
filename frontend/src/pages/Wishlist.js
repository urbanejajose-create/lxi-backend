import React, { useState, useEffect } from 'react';
import { wishlistService, productService } from '../services/api';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Heart } from 'lucide-react';

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const response = await wishlistService.getWishlist();
      const items = response.data.wishlist || [];
      setWishlistItems(items);

      // Fetch product details for each wishlist item
      const productMap = {};
      for (const item of items) {
        try {
          const productResponse = await productService.getById(item.product_id);
          productMap[item.product_id] = productResponse.data.product;
        } catch (err) {
          console.error(`Failed to fetch product ${item.product_id}`);
        }
      }
      setProducts(productMap);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      await wishlistService.removeItem(productId);
      setWishlistItems((prev) => prev.filter((item) => item.product_id !== productId));
    } catch (err) {
      setError('Failed to remove item');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0e17] px-4 py-20">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-[#f5f5f0] mb-8">My Wishlist</h1>

        {error && (
          <Alert className="mb-6 border-red-500 bg-red-500/10">
            <AlertDescription className="text-red-500">{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="text-center text-[#b0b0b0]">Loading...</div>
        ) : wishlistItems.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 mx-auto text-[#2a3444] mb-4" />
            <p className="text-[#b0b0b0] text-lg">Your wishlist is empty</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistItems.map((item) => {
              const product = products[item.product_id];
              return (
                <div
                  key={item._id}
                  className="bg-[#1a2332] rounded-lg overflow-hidden border border-[#2a3444] hover:border-[#d4af37] transition"
                >
                  <div className="aspect-square bg-[#0a0e17] flex items-center justify-center">
                    {product?.image_url && (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-[#f5f5f0] font-semibold text-lg mb-2">
                      {product?.name || 'Product'}
                    </h3>
                    <p className="text-[#d4af37] font-bold text-xl mb-4">
                      ${product?.price || 0}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        className="flex-1 bg-[#0a0e17] text-[#d4af37] hover:bg-[#1a2332] border border-[#d4af37]"
                        variant="outline"
                      >
                        View Details
                      </Button>
                      <Button
                        onClick={() => handleRemoveItem(item.product_id)}
                        className="bg-red-500/20 text-red-500 hover:bg-red-500/30"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
