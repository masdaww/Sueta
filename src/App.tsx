import { Route, Routes } from 'react-router-dom'
import { Header } from './layouts/Header'
import { Footer } from './layouts/Footer'
import { Toaster } from './components/Toaster'
import { ConfirmHost } from './components/ConfirmDialog'
import HomePage from './pages/HomePage'
import CatalogPage from './pages/CatalogPage'
import ProductPage from './pages/ProductPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import OrderSuccessPage from './pages/OrderSuccessPage'
import AccountPage from './pages/AccountPage'
import WishlistPage from './pages/WishlistPage'
import OrderTrackPage from './pages/OrderTrackPage'
import AdminPage from './pages/AdminPage'
import NotFoundPage from './pages/NotFoundPage'

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/c" element={<CatalogPage />} />
          <Route path="/c/:categoryId" element={<CatalogPage />} />
          <Route path="/p/:productId" element={<ProductPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order/:orderId" element={<OrderSuccessPage />} />
          <Route path="/order/:orderId/track" element={<OrderTrackPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/account/*" element={<AccountPage />} />
          <Route path="/admin/*" element={<AdminPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
      <Toaster />
      <ConfirmHost />
    </div>
  )
}
