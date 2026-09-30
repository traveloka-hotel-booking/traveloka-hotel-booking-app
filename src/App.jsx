import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { AuthProvider } from './context/AuthContext';
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

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="d-flex flex-column min-vh-100">
          {/* Thanh Menu điều hướng */}
          <Navbar />

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

              {/* 9. Trang Quản trị viên Admin Dashboard (CRUD Khách sạn & Quản lý đơn phòng) */}
              <Route path="/admin" element={<AdminDashboardPage />} />

              {/* 10. Trang Quản lý tài khoản, Bảo mật & Hồ sơ cá nhân */}
              <Route path="/profile" element={<ProfilePage />} />

              {/* 11. Trang Tiếp nhận phản hồi từ Cổng thanh toán VNPay Sandbox */}
              <Route path="/payment-callback" element={<PaymentCallbackPage />} />
            </Routes>
          </main>

          {/* Chân trang Footer */}
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
