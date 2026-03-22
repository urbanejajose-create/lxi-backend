import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import { SiteContentProvider } from "./context/SiteContentContext";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import CartDrawer from "./components/cart/CartDrawer";
import ErrorBoundary from "./components/ErrorBoundary";
import { ProtectedRoute, PublicRoute } from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Philosophy from "./pages/Philosophy";
import ProductDetail from "./pages/ProductDetail";
import Checkout from "./pages/Checkout";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import CheckoutCancel from "./pages/CheckoutCancel";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Wishlist from "./pages/Wishlist";
import Orders from "./pages/Orders";
import Account from "./pages/Account";
import Admin from "./pages/Admin";

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <SiteContentProvider>
          <CartProvider>
            <BrowserRouter>
              <div className="App min-h-screen bg-[#0a0e17]">
                <Navbar />
                <CartDrawer />
                <main>
                  <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/shop" element={<Shop />} />
                  <Route path="/philosophy" element={<Philosophy />} />
                  <Route path="/product/:slug" element={<ProductDetail />} />
                  <Route 
                    path="/checkout" 
                    element={
                      <ProtectedRoute>
                        <Checkout />
                      </ProtectedRoute>
                    } 
                  />
                  <Route path="/checkout/success" element={<CheckoutSuccess />} />
                  <Route path="/checkout/cancel" element={<CheckoutCancel />} />
                  
                  {/* Auth Routes */}
                  <Route 
                    path="/login" 
                    element={
                      <PublicRoute>
                        <Login />
                      </PublicRoute>
                    } 
                  />
                  <Route 
                    path="/register" 
                    element={
                      <PublicRoute>
                        <Register />
                      </PublicRoute>
                    } 
                  />
                  
                  {/* Protected Routes */}
                  <Route 
                    path="/profile" 
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/account" 
                    element={
                      <ProtectedRoute>
                        <Account />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/wishlist" 
                    element={
                      <ProtectedRoute>
                        <Wishlist />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/orders" 
                    element={
                      <ProtectedRoute>
                        <Orders />
                      </ProtectedRoute>
                    } 
                  />
                  
                  {/* Admin Routes */}
                  <Route 
                    path="/admin" 
                    element={
                      <ProtectedRoute>
                        <Admin />
                      </ProtectedRoute>
                    } 
                  />
                  </Routes>
                </main>
                <Footer />
                <Toaster 
                  position="top-center"
                  toastOptions={{
                    style: {
                      background: '#1a2332',
                      color: '#f5f5f0',
                      border: '1px solid #2a3444',
                      borderRadius: '0',
                    },
                  }}
                />
              </div>
            </BrowserRouter>
          </CartProvider>
        </SiteContentProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
