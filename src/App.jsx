import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { AuthProvider } from './context/AuthContext';
import { AlertProvider } from './context/AlertContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import HotelsPage from './pages/HotelsPage';
import HotelDetailPage from './pages/HotelDetailPage';
import CheckoutPage from './pages/CheckoutPage';
import BookingSuccessPage from './pages/BookingSuccessPage';
import MyBookingsPage from './pages/MyBookingsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import ProfilePage from './pages/ProfilePage';
import PaymentCallbackPage from './pages/PaymentCallbackPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ScrollToTop from './components/ScrollToTop';

// Các route không hiển thị Navbar & Footer (trang Admin có layout riêng)
const ADMIN_ROUTES = ['/admin'];

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
      </main>

      {/* Ẩn Footer trên trang Admin */}
      {!isAdminPage && <Footer />}
    </div>
  );
}

export default function App() {
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

