import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ProductProvider } from "@/contexts/ProductContext";
import { ProductDetailProvider } from "@/contexts/ProductDetailContext";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { Navbar } from "@/components/Navbar";
import Index from "./pages/Index";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import NotFound from "./pages/NotFound";
import { AdminLogin } from "./pages/admin/Login";
import AdminProducts from "./pages/admin/Products";
import { AddProduct } from "./pages/admin/AddProduct";
import { ReviewsAnalytics } from "./pages/admin/ReviewsAnalytics";
import { AdminLayout } from "@/components/AdminLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";

const queryClient = new QueryClient();

const PublicLayout = () => {
  const location = useLocation();
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Index />} />
        <Route path="/products" element={<Products />} />
        <Route 
          path="/products/:id" 
          element={
            <ProductDetailProvider initialProduct={location.state?.product || null}>
              <ProductDetail />
            </ProductDetailProvider>
          } 
        />
        <Route path="/cart" element={<Cart />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<PublicLayout />}>
        <Route path="products/:id" element={<ProductDetail />} />
        <Route path="*" element={<PublicLayout />} />
      </Route>
      
      {/* Admin Routes */}
      <Route path="/admin" element={
        <ProtectedRoute>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="products" replace />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="products/add" element={<AddProduct />} />
        <Route path="products/:id" element={<AddProduct />} />
        <Route path="reviews" element={<ReviewsAnalytics />} />
      </Route>
      
      <Route path="/admin/login" element={<AdminLogin />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ProductProvider>
        <ProductDetailProvider>
          <CartProvider>
            <WishlistProvider>
              <TooltipProvider>
                <BrowserRouter>
                  <AppRoutes />
                </BrowserRouter>
                <Toaster />
                <Sonner />
              </TooltipProvider>
            </WishlistProvider>
          </CartProvider>
        </ProductDetailProvider>
      </ProductProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
