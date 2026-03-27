import React, { useState } from 'react';
import { Link } from 'react-router-dom';


import { Heart } from 'lucide-react';
import { getImageUrl, wishlistService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

const ProductCard = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  const productImages = (product.images && product.images.length > 0)
    ? product.images
    : (product.image_url ? [product.image_url] : []);
  const productImageUrls = productImages.map(getImageUrl);
  const hasSecondImage = productImages.length > 1;
  const productSlug = encodeURIComponent(product.slug || product._id);

  const handleWishlistClick = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error('Please login to add to wishlist');
      return;
    }

    setIsLoading(true);
    try {
      if (isInWishlist) {
        await wishlistService.removeItem(product._id);
        setIsInWishlist(false);
        toast.success('Removed from wishlist');
      } else {
        await wishlistService.addItem(product._id);
        setIsInWishlist(true);
        toast.success('Added to wishlist');
      }
    } catch (error) {
      toast.error('Failed to update wishlist');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Link
      to={`/product/${productSlug}`}
      className="product-card block bg-[#1a2332] border border-[#2a3444] group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-square overflow-hidden">
        {/* Primary Image */}
        <img
          src={productImageUrls[0] || getImageUrl('/placeholder.jpg')}
          alt={product.name}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
            isHovered && hasSecondImage ? 'opacity-0' : 'opacity-100'
          }`}
        />

        {/* Secondary Image (on hover) */}
        {hasSecondImage && (
          <img
            src={productImageUrls[1]}
            alt={`${product.name} alternate`}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}

        {/* Hover Overlay */}
        <div
          className={`product-overlay absolute inset-0 bg-[#0a0e17]/60 flex items-center justify-center transition-opacity duration-400 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <span className="text-[#d4af37] text-[11px] tracking-[0.3em] font-sans">
            VIEW PIECE
          </span>
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistClick}
          disabled={isLoading}
          className={`absolute top-4 right-4 transition-all ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <Heart
            size={24}
            className={`transition-colors ${
              isInWishlist
                ? 'fill-[#d4af37] text-[#d4af37]'
                : 'text-[#d4af37]'
            }`}
          />
        </button>

        {/* Category Tag */}
        {product.category && (
          <div className="absolute top-4 left-4">
            <span className="micro-label">{product.category}</span>
          </div>
        )}
      </div>

      <div className="p-6">
        <h3 className="text-[#f5f5f0] text-xs tracking-[0.2em] font-sans font-medium">
          {product.name}
        </h3>
        <p className="text-[#d4af37] text-sm mt-2">
          ${product.price}
        </p>
      </div>
    </Link>
  );
};

export default ProductCard;
