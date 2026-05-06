import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppProvider } from "./store/AppContext";
import { Layout } from "./components/layout/Layout";
import { HomePage } from "./pages/HomePage";
import { CatalogPage } from "./pages/CatalogPage";
import { ProductDetailPage } from "./pages/ProductDetailPage";
import { CartPage } from "./pages/CartPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { LoginPage } from "./pages/LoginPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { AccountLayout } from "./pages/account/AccountLayout";
import { ProfilePage } from "./pages/account/ProfilePage";
import { OrdersPage } from "./pages/account/OrdersPage";
import { OrderDetailPage } from "./pages/account/OrderDetailPage";
import { WishlistPage } from "./pages/account/WishlistPage";
import { MyReviewsPage } from "./pages/account/MyReviewsPage";
import { AdminLayout } from "./pages/admin/AdminLayout";
import { AdminStatsPage } from "./pages/admin/AdminStatsPage";
import { AdminProductsPage } from "./pages/admin/AdminProductsPage";
import { AdminUsersPage } from "./pages/admin/AdminUsersPage";
import { AdminReviewsPage } from "./pages/admin/AdminReviewsPage";
import { useEffect } from "react";
import { ensureDemoOrders } from "./api/seedDemo";

function ScrollOnRouteChange() {
  return null;
}

function DemoSeed() {
  useEffect(() => {
    ensureDemoOrders();
  }, []);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <DemoSeed />
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/catalog" element={<CatalogPage />} />
            <Route path="/product/:productId" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/account" element={<AccountLayout />}>
              <Route index element={<ProfilePage />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="orders/:orderId" element={<OrderDetailPage />} />
              <Route path="wishlist" element={<WishlistPage />} />
              <Route path="reviews" element={<MyReviewsPage />} />
            </Route>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminStatsPage />} />
              <Route path="products" element={<AdminProductsPage />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="reviews" element={<AdminReviewsPage />} />
            </Route>
            <Route path="/404" element={<NotFoundPage />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
          <ScrollOnRouteChange />
        </Layout>
      </AppProvider>
    </BrowserRouter>
  );
}
