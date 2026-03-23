import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronRight, Heart } from 'lucide-react';
import { toast } from 'sonner';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useSiteContent } from '../context/SiteContentContext';
import { productService, wishlistService } from '../services/api';
import ReviewForm from '../components/ReviewForm';
import ReviewsList from '../components/ReviewsList';

const REQUEST_TIMEOUT_MS = 8000;

function withTimeout(promise, timeoutMs = REQUEST_TIMEOUT_MS) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      window.setTimeout(() => {
        reject(new Error('Request timed out'));
      }, timeoutMs);
    }),
  ]);
}

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addItem, openCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { globalContent } = useSiteContent();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const [reviewRefresh, setReviewRefresh] = useState(0);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isLoadingWishlist, setIsLoadingWishlist] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError('');
        setSelectedImage(0);
        const productKey = decodeURIComponent(slug || '').trim();
        let prod = null;

        try {
          const response = await withTimeout(productService.getBySlug(productKey));
          prod = response.data.product;
        } catch (slugError) {
          try {
            const response = await withTimeout(productService.getById(productKey));
            prod = response.data.product;
          } catch (idError) {
            const listResponse = await withTimeout(productService.getAll());
            const products = listResponse.data.products || [];
            prod = products.find((item) => item.slug === productKey || item._id === productKey) || null;
          }
        }

        if (!prod) {
          throw new Error('Product not found');
        }

        setProduct(prod);
        
        if (prod.sizes && prod.sizes.length === 1) {
          setSelectedSize(prod.sizes[0]);
        } else {
          setSelectedSize('');
        }
      } catch (err) {
        setError('Product not found');
        setTimeout(() => navigate('/shop'), 2000);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug, navigate]);

  const productId = product?._id || product?.id;
  const productImages = (product?.images && product.images.length > 0)
    ? product.images
    : (product?.image_url ? [product.image_url] : []);

  const handleAddToCart = () => {
    try {
      if (!selectedSize) {
        toast.error('Please select a size');
        return;
      }

      if (!productId) {
        toast.error('Product unavailable');
        return;
      }

      setIsAdding(true);
      
      addItem({
        id: productId,
        name: product.name,
        price: product.price,
        size: selectedSize,
        image: productImages[0],
        quantity: 1,
      });

      setTimeout(() => {
        setIsAdding(false);
        toast.success('Added to armor');
        openCart();
      }, 300);
    } catch (error) {
      toast.error('Please select a size');
    }
  };

  const handleWishlistClick = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add to wishlist');
      return;
    }

    if (!productId) {
      toast.error('Product unavailable');
      return;
    }

    setIsLoadingWishlist(true);
    try {
      if (isInWishlist) {
        await wishlistService.removeItem(productId);
        setIsInWishlist(false);
        toast.success('Removed from wishlist');
      } else {
        await wishlistService.addItem(productId);
        setIsInWishlist(true);
        toast.success('Added to wishlist');
      }
    } catch (error) {
      toast.error('Failed to update wishlist');
    } finally {
      setIsLoadingWishlist(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0e17] flex items-center justify-center">
        <div className="text-[#b0b0b0]">Loading product...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#0a0e17] flex items-center justify-center">
        <Alert className="border-red-500 bg-red-500/10 max-w-md">
          <AlertDescription className="text-red-500">
            {error || 'Product not found'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="bg-[#0a0e17] min-h-screen pt-24 pb-24">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-[#8a8a8a] mb-8">
          <Link to="/shop" className="hover:text-[#d4af37] transition-colors duration-300">
            {globalContent.product_breadcrumb_shop}
          </Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/shop" className="hover:text-[#d4af37] transition-colors duration-300">
            {globalContent.product_breadcrumb_collection}
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-[#f5f5f0]">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-16">
          {/* Image Gallery - Left Side */}
          <div className="lg:col-span-3">
            {/* Main Image */}
            <div className="aspect-square bg-[#1a2332] overflow-hidden mb-4">
              <img
                src={productImages[selectedImage] || '/placeholder.jpg'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Thumbnail Strip */}
            {productImages.length > 1 && (
              <div className="flex gap-3">
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    data-testid={`thumbnail-${index}`}
                    className={`w-20 h-20 overflow-hidden border transition-colors duration-300 ${
                      selectedImage === index
                        ? 'border-[#d4af37]'
                        : 'border-[#2a3444] hover:border-[#8a8a8a]'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} view ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info - Right Side */}
          <div className="lg:col-span-2 lg:sticky lg:top-32 lg:self-start">
            <span className="micro-label">{globalContent.product_badge_text}</span>

            <h1
              data-testid="product-title"
              className="text-[#f5f5f0] font-serif text-3xl sm:text-4xl lg:text-5xl font-light mt-4 mb-4"
            >
              {product.name}
            </h1>

            <p
              data-testid="product-price"
              className="text-[#d4af37] text-2xl mb-6"
            >
              ${product.price}
            </p>

            <p className="text-[#8a8a8a] text-sm leading-relaxed mb-8">
              {product.description}
            </p>

            {/* Size Selector */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[#b0b0b0] text-sm font-medium">SIZE</span>
                  <button className="text-[#d4af37] text-xs tracking-wider hover:underline">
                    SIZE GUIDE
                  </button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 border transition-all ${
                        selectedSize === size
                          ? 'border-[#d4af37] text-[#d4af37]'
                          : 'border-[#2a3444] text-[#8a8a8a] hover:text-[#f5f5f0]'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Add to Cart & Wishlist */}
            <div className="flex gap-3 mb-4">
              <button
                onClick={handleAddToCart}
                disabled={isAdding}
                className="flex-1 bg-[#d4af37] text-[#0a0e17] hover:bg-[#e0c158] font-semibold py-4 text-sm tracking-wider disabled:opacity-50"
              >
                {isAdding ? globalContent.add_to_cart_loading_text : globalContent.add_to_cart_text}
              </button>
              <button
                onClick={handleWishlistClick}
                disabled={isLoadingWishlist}
                className="px-6 bg-[#1a2332] border border-[#d4af37] text-[#d4af37] hover:bg-[#2a3444]"
              >
                <Heart
                  size={20}
                  className={isInWishlist ? 'fill-[#d4af37]' : ''}
                />
              </button>
            </div>

            <p className="text-[#8a8a8a] text-xs text-center mb-8">
              Free shipping on orders over $150 · Ships via Printful
            </p>

            {/* Gold Divider */}
            <div className="border-b border-[#2a3444] mb-8" />

            {/* Product Details Accordion */}
            {product.details && (
              <Accordion type="single" collapsible className="space-y-0">
                {product.details.material && (
                  <AccordionItem value="material" className="border-b border-[#2a3444]">
                    <AccordionTrigger className="accordion-trigger text-[#f5f5f0] py-4 hover:no-underline hover:text-[#d4af37]">
                      MATERIAL & CRAFT
                    </AccordionTrigger>
                    <AccordionContent className="text-[#8a8a8a] text-sm leading-relaxed pb-4">
                      {product.details.material}
                    </AccordionContent>
                  </AccordionItem>
                )}

                {product.details.embroidery && (
                  <AccordionItem value="embroidery" className="border-b border-[#2a3444]">
                    <AccordionTrigger className="accordion-trigger text-[#f5f5f0] py-4 hover:no-underline hover:text-[#d4af37]">
                      EMBROIDERY DETAIL
                    </AccordionTrigger>
                    <AccordionContent className="text-[#8a8a8a] text-sm leading-relaxed pb-4">
                      {product.details.embroidery}
                    </AccordionContent>
                  </AccordionItem>
                )}

                {product.details.sizing && (
                  <AccordionItem value="sizing" className="border-b border-[#2a3444]">
                    <AccordionTrigger
                      data-testid="accordion-sizing"
                      className="accordion-trigger text-[#f5f5f0] py-4 hover:no-underline hover:text-[#d4af37]"
                    >
                      SIZING
                    </AccordionTrigger>
                    <AccordionContent className="text-[#8a8a8a] text-sm leading-relaxed pb-4">
                      {product.details.sizing}
                    </AccordionContent>
                  </AccordionItem>
                )}

                {product.details.shipping && (
                  <AccordionItem value="shipping" className="border-b border-[#2a3444]">
                    <AccordionTrigger
                      data-testid="accordion-shipping"
                      className="accordion-trigger text-[#f5f5f0] py-4 hover:no-underline hover:text-[#d4af37]"
                    >
                      SHIPPING & RETURNS
                    </AccordionTrigger>
                    <AccordionContent className="text-[#8a8a8a] text-sm leading-relaxed pb-4">
                      {product.details.shipping}
                    </AccordionContent>
                  </AccordionItem>
                )}
              </Accordion>
            )}

            {/* Brand Micro Block */}
            <div className="mt-8 flex items-center gap-3 text-[#8a8a8a] text-xs">
              <span className="text-[#d4af37] font-serif text-lg">I</span>
              <span>Part of Drop 01 — Founders Edition MMXXVI</span>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-24 max-w-4xl">
          <h2 className="text-2xl font-light text-[#f5f5f0] mb-8">CUSTOMER REVIEWS</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Review Form - Left */}
            <div className="lg:col-span-1">
              {isAuthenticated ? (
                <ReviewForm 
                  productId={productId} 
                  onReviewAdded={() => setReviewRefresh(prev => prev + 1)}
                />
              ) : (
                <div className="bg-[#1a2332] p-6 rounded-lg border border-[#2a3444] text-center">
                  <p className="text-[#b0b0b0] mb-4">Login to leave a review</p>
                  <button
                    onClick={() => navigate('/login')}
                    className="w-full bg-[#d4af37] text-[#0a0e17] hover:bg-[#e0c158] font-semibold py-2 px-4 rounded"
                  >
                    Login
                  </button>
                </div>
              )}
            </div>

            {/* Reviews List - Right */}
            <div className="lg:col-span-2">
              <ReviewsList 
                productId={productId}
                refreshTrigger={reviewRefresh}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
