import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { MOCK_HOTELS } from './data/mockData';
import { Search, MapPin, Calendar, Users, Star, ArrowRight, ShieldCheck, Tag, Clock } from 'lucide-react';

// Component Trang Chủ
function HomePage() {
  const [location, setLocation] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('2');

  return (
    <div>
      {/* 1. Hero Section - Banner tìm kiếm */}
      <section className="hero-gradient text-white py-5 shadow-sm">
        <div className="container py-4">
          <div className="row align-items-center">
            <div className="col-lg-8 mx-auto text-center mb-4">
              <span className="badge bg-warning text-dark px-3 py-2 rounded-pill fw-bold mb-3">
                🔥 Ưu đãi đặt phòng mùa du lịch 2026
              </span>
              <h1 className="display-4 fw-bold mb-3">
                Khám Phá Điểm Đến Mơ Ước Cùng Traveloka
              </h1>
              <p className="lead text-light opacity-90">
                Tìm kiếm hơn 1.000+ khách sạn, resort cao cấp với giá tốt nhất và cam kết chất lượng hàng đầu.
              </p>
            </div>
          </div>

          {/* Thanh tìm kiếm tiện lợi */}
          <div className="row justify-content-center">
            <div className="col-lg-11">
              <div className="card shadow-lg border-0 rounded-4 p-4 text-dark bg-white">
                <form className="row g-3 align-items-end" onSubmit={(e) => e.preventDefault()}>
                  {/* Địa điểm */}
                  <div className="col-lg-4 col-md-6">
                    <label className="form-label fw-bold small text-secondary d-flex align-items-center gap-1">
                      <MapPin size={16} className="text-primary" /> Bạn muốn đến đâu?
                    </label>
                    <input 
                      type="text" 
                      className="form-control form-control-lg border-secondary-subtle" 
                      placeholder="Hà Nội, Đà Nẵng, TP.HCM..." 
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>

                  {/* Ngày nhận phòng */}
                  <div className="col-lg-2 col-md-3 col-6">
                    <label className="form-label fw-bold small text-secondary d-flex align-items-center gap-1">
                      <Calendar size={16} className="text-primary" /> Ngày nhận
                    </label>
                    <input 
                      type="date" 
                      className="form-control form-control-lg border-secondary-subtle"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                    />
                  </div>

                  {/* Ngày trả phòng */}
                  <div className="col-lg-2 col-md-3 col-6">
                    <label className="form-label fw-bold small text-secondary d-flex align-items-center gap-1">
                      <Calendar size={16} className="text-primary" /> Ngày trả
                    </label>
                    <input 
                      type="date" 
                      className="form-control form-control-lg border-secondary-subtle"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                    />
                  </div>

                  {/* Số khách */}
                  <div className="col-lg-2 col-md-6">
                    <label className="form-label fw-bold small text-secondary d-flex align-items-center gap-1">
                      <Users size={16} className="text-primary" /> Số khách
                    </label>
                    <select 
                      className="form-select form-select-lg border-secondary-subtle"
                      value={guests}
                      onChange={(e) => setGuests(e.target.value)}
                    >
                      <option value="1">1 Người lớn</option>
                      <option value="2">2 Người lớn (1 Phòng)</option>
                      <option value="3">3 Người lớn</option>
                      <option value="4">4 Người lớn (Gia đình)</option>
                    </select>
                  </div>

                  {/* Nút Tìm kiếm */}
                  <div className="col-lg-2 col-md-6">
                    <Link 
                      to="/hotels" 
                      className="btn btn-primary btn-lg w-100 fw-bold d-flex align-items-center justify-content-center gap-2"
                    >
                      <Search size={20} /> Tìm Kiếm
                    </Link>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Tiện ích nổi bật */}
      <section className="py-5 bg-white border-bottom">
        <div className="container">
          <div className="row g-4 text-center">
            <div className="col-md-4">
              <div className="p-3">
                <div className="d-inline-flex p-3 rounded-circle bg-primary-subtle text-primary mb-3">
                  <ShieldCheck size={32} />
                </div>
                <h5 className="fw-bold">Đảm Bảo Giá Tốt Nhất</h5>
                <p className="text-secondary small">Cam kết hoàn tiền chênh lệch nếu bạn tìm thấy giá rẻ hơn ở bất kỳ đâu.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="d-inline-flex p-3 rounded-circle bg-success-subtle text-success mb-3">
                <Tag size={32} />
              </div>
              <h5 className="fw-bold">Ưu Đãi Độc Quyền</h5>
              <p className="text-secondary small">Hàng trăm mã giảm giá hấp dẫn mỗi tuần dành riêng cho thành viên.</p>
            </div>
            <div className="col-md-4">
              <div className="d-inline-flex p-3 rounded-circle bg-warning-subtle text-warning mb-3">
                <Clock size={32} />
              </div>
              <h5 className="fw-bold">Hỗ Trợ 24/7</h5>
              <p className="text-secondary small">Đội ngũ hỗ trợ chuyên nghiệp luôn đồng hành suốt chuyến đi của bạn.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Danh sách khách sạn nổi bật */}
      <section className="py-5">
        <div className="container">
          <div className="d-flex justify-content-between align-items-end mb-4">
            <div>
              <span className="text-primary fw-bold small text-uppercase">Khám phá gợi ý</span>
              <h2 className="fw-bold mb-0">Khách Sạn Được Yêu Thích Nhất</h2>
            </div>
            <Link to="/hotels" className="btn btn-outline-primary fw-semibold d-flex align-items-center gap-1">
              Xem tất cả <ArrowRight size={18} />
            </Link>
          </div>

          <div className="row g-4">
            {MOCK_HOTELS.map((hotel) => (
              <div key={hotel.id} className="col-lg-4 col-md-6">
                <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden hover-shadow">
                  <div className="position-relative">
                    <img 
                      src={hotel.thumbnailUrl} 
                      className="card-img-top" 
                      alt={hotel.name}
                      style={{ height: '240px', objectFit: 'cover' }}
                    />
                    <span className="position-absolute top-0 end-0 m-3 badge bg-dark bg-opacity-75 px-2 py-1 rounded-pill d-flex align-items-center gap-1">
                      <Star size={14} className="text-warning fill-warning" />
                      <span>{hotel.starRating} sao</span>
                    </span>
                  </div>
                  <div className="card-body d-flex flex-column p-4">
                    <div className="d-flex align-items-center gap-1 text-secondary small mb-1">
                      <MapPin size={14} className="text-primary" />
                      <span>{hotel.city}</span>
                    </div>
                    <h5 className="card-title fw-bold text-dark mb-2">{hotel.name}</h5>
                    <p className="card-text text-secondary small line-clamp-2 mb-3">
                      {hotel.description}
                    </p>
                    
                    {/* Tiện ích ngắn gọn */}
                    <div className="d-flex flex-wrap gap-1 mb-4">
                      {hotel.amenities.slice(0, 3).map((item, index) => (
                        <span key={index} className="badge bg-light text-secondary border small">
                          {item}
                        </span>
                      ))}
                    </div>

                    <div className="mt-auto pt-3 border-top d-flex justify-content-between align-items-center">
                      <div>
                        <span className="text-secondary small d-block">Giá chỉ từ</span>
                        <span className="fs-5 fw-bold text-danger">
                          {hotel.rooms[0]?.pricePerNight.toLocaleString('vi-VN')} đ
                        </span>
                        <span className="text-secondary small"> / đêm</span>
                      </div>
                      <Link to={`/hotels/${hotel.id}`} className="btn btn-primary px-3 py-2 fw-semibold">
                        Xem phòng
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

// Component Trang Danh Sách Khách Sạn
function HotelsPage() {
  return (
    <div className="container py-5">
      <h2 className="fw-bold mb-2">Tất Cả Khách Sạn & Khu Nghỉ Dưỡng</h2>
      <p className="text-secondary mb-4">Tìm kiếm nơi lưu trú phù hợp với chuyến đi của bạn</p>
      
      <div className="row g-4">
        {MOCK_HOTELS.map((hotel) => (
          <div key={hotel.id} className="col-12">
            <div className="card border-0 shadow-sm rounded-4 p-3 hover-shadow">
              <div className="row g-0 align-items-center">
                <div className="col-md-4">
                  <img 
                    src={hotel.thumbnailUrl} 
                    className="img-fluid rounded-3 w-100" 
                    alt={hotel.name}
                    style={{ height: '220px', objectFit: 'cover' }}
                  />
                </div>
                <div className="col-md-8 ps-md-4 mt-3 mt-md-0">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <span className="badge bg-primary-subtle text-primary mb-2">{hotel.city}</span>
                      <h4 className="fw-bold mb-1">{hotel.name}</h4>
                      <p className="text-secondary small mb-2 d-flex align-items-center gap-1">
                        <MapPin size={14} className="text-danger" /> {hotel.address}
                      </p>
                    </div>
                    <div className="text-end">
                      <span className="badge bg-warning text-dark fw-bold px-2 py-1">
                        ★ {hotel.starRating}.0
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-secondary small mb-3">{hotel.description}</p>
                  
                  <div className="d-flex justify-content-between align-items-center pt-3 border-top">
                    <div className="d-flex gap-2">
                      {hotel.amenities.map((a, i) => (
                        <span key={i} className="badge bg-light text-dark border small">{a}</span>
                      ))}
                    </div>
                    <div className="text-end">
                      <div className="fs-5 fw-bold text-danger">
                        {hotel.rooms[0]?.pricePerNight.toLocaleString('vi-VN')} đ
                        <span className="text-secondary small fw-normal"> / đêm</span>
                      </div>
                      <Link to={`/hotels/${hotel.id}`} className="btn btn-primary btn-sm mt-1 px-3">
                        Chọn phòng ngay
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Component App Tổng Thể với Router
export default function App() {
  return (
    <BrowserRouter>
      <div className="d-flex flex-column min-vh-100">
        <Navbar />
        
        <main className="flex-grow-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/hotels" element={<HotelsPage />} />
            <Route path="/hotels/:id" element={<HotelsPage />} />
            <Route path="/my-bookings" element={
              <div className="container py-5 text-center">
                <div className="p-5 bg-white rounded-4 shadow-sm">
                  <h3 className="fw-bold mb-3">Chuyến Đi Của Tôi</h3>
                  <p className="text-secondary">Bạn chưa có đơn đặt phòng nào. Hãy khám phá và đặt phòng ngay!</p>
                  <Link to="/hotels" className="btn btn-primary">Tìm khách sạn</Link>
                </div>
              </div>
            } />
            <Route path="/login" element={
              <div className="container py-5">
                <div className="row justify-content-center">
                  <div className="col-md-5">
                    <div className="card p-4 rounded-4 shadow-sm border-0">
                      <h3 className="fw-bold text-center mb-4 text-primary">Đăng Nhập</h3>
                      <div className="mb-3">
                        <label className="form-label fw-semibold">Email hoặc Tên đăng nhập</label>
                        <input type="text" className="form-control" placeholder="example@gmail.com" />
                      </div>
                      <div className="mb-3">
                        <label className="form-label fw-semibold">Mật khẩu</label>
                        <input type="password" className="form-control" placeholder="••••••••" />
                      </div>
                      <button className="btn btn-primary w-100 py-2 fw-bold mt-2">Đăng Nhập</button>
                      <div className="text-center mt-3 small text-secondary">
                        Chưa có tài khoản? <Link to="/register" className="text-primary fw-bold text-decoration-none">Đăng ký ngay</Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            } />
            <Route path="/register" element={
              <div className="container py-5">
                <div className="row justify-content-center">
                  <div className="col-md-6">
                    <div className="card p-4 rounded-4 shadow-sm border-0">
                      <h3 className="fw-bold text-center mb-4 text-primary">Đăng Ký Tài Khoản</h3>
                      <div className="row g-3">
                        <div className="col-md-12">
                          <label className="form-label fw-semibold">Họ và tên</label>
                          <input type="text" className="form-control" placeholder="Nguyễn Văn A" />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-semibold">Email</label>
                          <input type="email" className="form-control" placeholder="nguyenvana@gmail.com" />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-semibold">Số điện thoại</label>
                          <input type="text" className="form-control" placeholder="0912 345 678" />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-semibold">Mật khẩu</label>
                          <input type="password" className="form-control" placeholder="••••••••" />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-semibold">Xác nhận mật khẩu</label>
                          <input type="password" className="form-control" placeholder="••••••••" />
                        </div>
                      </div>
                      <button className="btn btn-primary w-100 py-2 fw-bold mt-4">Tạo Tài Khoản</button>
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

        <Footer />
      </div>
    </BrowserRouter>
  );
}
