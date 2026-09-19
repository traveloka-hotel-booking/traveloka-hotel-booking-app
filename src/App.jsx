import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import HotelsPage from './pages/HotelsPage';
import HotelDetailPage from './pages/HotelDetailPage';
import CheckoutPage from './pages/CheckoutPage';
import BookingSuccessPage from './pages/BookingSuccessPage';
import MyBookingsPage from './pages/MyBookingsPage';

export default function App() {
  return (
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

            {/* 5. Trang Đăng nhập */}
            <Route path="/login" element={
              <div className="container pb-5 page-top-spacing">
                <div className="row justify-content-center">
                  <div className="col-lg-5 col-md-7">
                    <div className="card p-4 rounded-4 shadow-sm border-0 bg-white">
                      <h3 className="fw-bold text-center mb-4 text-primary">Đăng Nhập Tài Khoản</h3>
                      <form onSubmit={(e) => e.preventDefault()}>
                        <div className="mb-3">
                          <label className="form-label fw-semibold text-secondary small">Email hoặc Tên đăng nhập</label>
                          <input type="text" className="form-control form-control-lg border-secondary-subtle" placeholder="example@gmail.com" />
                        </div>
                        <div className="mb-3">
                          <label className="form-label fw-semibold text-secondary small">Mật khẩu</label>
                          <input type="password" className="form-control form-control-lg border-secondary-subtle" placeholder="••••••••" />
                        </div>
                        <button type="submit" className="btn btn-primary btn-lg w-100 fw-bold mt-2">
                          Đăng Nhập
                        </button>
                      </form>
                      <div className="text-center mt-3 small text-secondary">
                        Chưa có tài khoản? <Link to="/register" className="text-primary fw-bold text-decoration-none">Đăng ký ngay</Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            } />

            {/* 6. Trang Đăng ký */}
            <Route path="/register" element={
              <div className="container pb-5 page-top-spacing">
                <div className="row justify-content-center">
                  <div className="col-lg-6 col-md-8">
                    <div className="card p-4 rounded-4 shadow-sm border-0 bg-white">
                      <h3 className="fw-bold text-center mb-4 text-primary">Đăng Ký Tài Khoản Mới</h3>
                      <form onSubmit={(e) => e.preventDefault()} className="row g-3">
                        <div className="col-12">
                          <label className="form-label fw-semibold text-secondary small">Họ và tên</label>
                          <input type="text" className="form-control border-secondary-subtle" placeholder="Nguyễn Văn A" />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-semibold text-secondary small">Email</label>
                          <input type="email" className="form-control border-secondary-subtle" placeholder="nguyenvana@gmail.com" />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-semibold text-secondary small">Số điện thoại</label>
                          <input type="text" className="form-control border-secondary-subtle" placeholder="0912 345 678" />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-semibold text-secondary small">Mật khẩu</label>
                          <input type="password" className="form-control border-secondary-subtle" placeholder="••••••••" />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-semibold text-secondary small">Xác nhận mật khẩu</label>
                          <input type="password" className="form-control border-secondary-subtle" placeholder="••••••••" />
                        </div>
                        <div className="col-12">
                          <button type="submit" className="btn btn-primary btn-lg w-100 fw-bold mt-3">
                            Tạo Tài Khoản
                          </button>
                        </div>
                      </form>
                      <div className="text-center mt-3 small text-secondary">
                        Đã có tài khoản? <Link to="/login" className="text-primary fw-bold text-decoration-none">Đăng nhập</Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            } />
          </Routes>
        </main>

        {/* Chân trang Footer */}
        <Footer />
      </div>
    </BrowserRouter>
  );
}
