import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { AuthProvider } from './context/AuthContext';
import { AlertProvider } from './context/AlertContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ScrollToTop from './components/ScrollToTop';
import { warmupBackendApi } from './services/api';

// Code Splitting (Lazy Loading) cho các trang phụ để giảm dung lượng JS tải lần đầu (đặc biệt tách riêng Admin & Recharts)
const HotelsPage = lazy(() => import('./pages/HotelsPage'));
const HotelDetailPage = lazy(() => import('./pages/HotelDetailPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const BookingSuccessPage = lazy(() => import('./pages/BookingSuccessPage'));
const MyBookingsPage = lazy(() => import('./pages/MyBookingsPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const PaymentCallbackPage = lazy(() => import('./pages/PaymentCallbackPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));

// Các route không hiển thị Navbar & Footer (trang Admin có layout riêng)
const ADMIN_ROUTES = ['/admin'];

function RouteLoadingFallback() {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center py-5" style={{ minHeight: '60vh' }}>
      <div className="spinner-border text-primary mb-2" role="status" />
      <span className="text-secondary small fw-medium">Đang tải trang...</span>
    </div>
  );
}

function AppLayout() {
  const location = useLocation();
  const isAdminPage = ADMIN_ROUTES.some(r => location.pathname.startsWith(r));

  return (
    <div className="d-flex flex-column min-vh-100">
      {/* Tự động cuộn lên đầu trang mỗi khi chuyển trang */}
      <ScrollToTop />

      {/* Ẩn Navbar trên trang Admin – Admin có sidebar riêng */}
      {!isAdminPage && <Navbar />}

      {/* Nội dung các trang */}
      <main className="flex-grow-1">
        <Suspense fallback={<RouteLoadingFallback />}>
          <Routes>
            {/* 1. Trang chủ */}
            <Route path="/" element={<HomePage />} />

            {/* 2. Danh sách khách sạn & Bộ lọc tiện ích */}
            <Route path="/hotels" element={<HotelsPage />} />

            {/* 3. Chi tiết khách sạn, tiện nghi & Danh sách các loại phòng */}
            <Route path="/hotels/:id" element={<HotelDetailPage />} />

            {/* 4. Trang Thanh toán & Điền thông tin đặt phòng */}
            <Route path="/checkout" element={<CheckoutPage />} />

            {/* 5. Trang Xác nhận thành công & Vé điện tử E-voucher */}
            <Route path="/booking-success" element={<BookingSuccessPage />} />

            {/* 6. Chuyến đi của tôi (Quản lý đơn đặt phòng) */}
            <Route path="/my-bookings" element={<MyBookingsPage />} />

            {/* 7. Trang Đăng nhập hoàn chỉnh */}
            <Route path="/login" element={<LoginPage />} />

            {/* 8. Trang Đăng ký hoàn chỉnh */}
            <Route path="/register" element={<RegisterPage />} />

            {/* 9. Trang Quản trị viên Admin Dashboard – layout riêng không cần Navbar/Footer */}
            <Route path="/admin" element={<AdminDashboardPage />} />

            {/* 10. Trang Quản lý tài khoản, Bảo mật & Hồ sơ cá nhân */}
            <Route path="/profile" element={<ProfilePage />} />

            {/* 11. Trang Tiếp nhận phản hồi từ Cổng thanh toán VNPay Sandbox */}
            <Route path="/payment-callback" element={<PaymentCallbackPage />} />
          
            {/*12.  Quên mật khẩu */}
            <Route path="/forgot-password" element={<ForgotPasswordPage />}
            />

            {/*13. Đặt lại mật khẩu */}
            <Route path="/reset-password/:token" element={<ResetPasswordPage />}
            />
          </Routes>
        </Suspense>
      </main>

      {/* Ẩn Footer trên trang Admin */}
      {!isAdminPage && <Footer />}
    </div>
  );
}

export default function App() {
  useEffect(() => {
    warmupBackendApi();
  }, []);

  return (
    <AuthProvider>
      <AlertProvider>
        <BrowserRouter>
          <AppLayout />
        </BrowserRouter>
      </AlertProvider>
    </AuthProvider>
  );
}

