import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MOCK_HOTELS } from '../data/mockData';
import { 
  Search, MapPin, Calendar, Users, Star, ArrowRight, 
  ShieldCheck, Tag, Clock, Wifi, Utensils, Waves, Car, Sparkles 
} from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();
  const [city, setCity] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('2');

  const handleSearch = (e) => {
    e.preventDefault();
    if (city.trim()) {
      navigate(`/hotels?city=${encodeURIComponent(city.trim())}`);
    } else {
      navigate('/hotels');
    }
  };

  const handleCityClick = (selectedCity) => {
    navigate(`/hotels?city=${encodeURIComponent(selectedCity)}`);
  };

  return (
    <div>
      {/* 1. Hero Section - Banner tìm kiếm thông minh */}
      <section className="hero-gradient text-white py-5 shadow-sm">
        <div className="container py-4">
          <div className="row align-items-center">
            <div className="col-lg-9 mx-auto text-center mb-4">
              <span className="badge bg-warning text-dark px-3 py-2 rounded-pill fw-bold mb-3 d-inline-flex align-items-center gap-1">
                <Sparkles size={16} /> Ưu đãi đặt phòng mùa du lịch 2026
              </span>
              <h1 className="display-4 fw-bold mb-3">
                Khám Phá Điểm Đến Mơ Ước Cùng Traveloka
              </h1>
              <p className="lead text-light opacity-90 mb-4">
                Tìm kiếm hơn 1.000+ khách sạn, resort cao cấp với giá tốt nhất và cam kết chất lượng chuẩn 5 sao.
              </p>

              {/* Các điểm đến hot bấm nhanh */}
              <div className="d-flex flex-wrap justify-content-center gap-2 mb-2">
                <span className="small text-light me-1 align-self-center">Gợi ý nhanh:</span>
                {["Hà Nội", "Đà Nẵng", "Hồ Chí Minh", "Nha Trang", "Đà Lạt"].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => handleCityClick(c)}
                    className="btn btn-sm btn-outline-light rounded-pill px-3 py-1 bg-white bg-opacity-10 border-light"
                  >
                    📍 {c}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Thanh tìm kiếm tiện lợi */}
          <div className="row justify-content-center mt-2">
            <div className="col-lg-11">
              <div className="card shadow-lg border-0 rounded-4 p-4 text-dark bg-white">
                <form className="row g-3 align-items-end" onSubmit={handleSearch}>
                  {/* Địa điểm */}
                  <div className="col-lg-4 col-md-6">
                    <label className="form-label fw-bold small text-secondary d-flex align-items-center gap-1">
                      <MapPin size={16} className="text-primary" /> Bạn muốn đến đâu?
                    </label>
                    <input 
                      type="text" 
                      className="form-control form-control-lg border-secondary-subtle" 
                      placeholder="Hà Nội, Đà Nẵng, TP.HCM, Nha Trang..." 
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
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
                    <button 
                      type="submit" 
                      className="btn btn-primary btn-lg w-100 fw-bold d-flex align-items-center justify-content-center gap-2"
                    >
                      <Search size={20} /> Tìm Kiếm
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Tiện ích nổi bật & Cam kết */}
      <section className="py-5 bg-white border-bottom">
        <div className="container">
          <div className="row g-4 text-center">
            <div className="col-md-4">
              <div className="p-3">
                <div className="d-inline-flex p-3 rounded-circle bg-primary-subtle text-primary mb-3">
                  <ShieldCheck size={32} />
                </div>
                <h5 className="fw-bold">Đảm Bảo Giá Tốt Nhất</h5>
                <p className="text-secondary small">Cam kết hoàn tiền chênh lệch nếu bạn tìm thấy giá rẻ hơn ở bất kỳ đâu trên thị trường.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="d-inline-flex p-3 rounded-circle bg-success-subtle text-success mb-3">
                <Tag size={32} />
              </div>
              <h5 className="fw-bold">Ưu Đãi Độc Quyền</h5>
              <p className="text-secondary small">Hàng trăm mã giảm giá hấp dẫn mỗi tuần và tích lũy điểm thưởng không giới hạn.</p>
            </div>
            <div className="col-md-4">
              <div className="d-inline-flex p-3 rounded-circle bg-warning-subtle text-warning mb-3">
                <Clock size={32} />
              </div>
              <h5 className="fw-bold">Hỗ Trợ 24/7</h5>
              <p className="text-secondary small">Đội ngũ chăm sóc khách hàng luôn túc trực hỗ trợ giải đáp và xử lý đơn đặt phòng 24/7.</p>
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
              Xem tất cả khách sạn <ArrowRight size={18} />
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
                    <span className="position-absolute bottom-0 start-0 m-3 badge bg-primary px-3 py-1 rounded-pill">
                      📍 {hotel.city}
                    </span>
                  </div>

                  <div className="card-body d-flex flex-column p-4">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="badge bg-success-subtle text-success fw-semibold">
                        ★ {hotel.ratingScore} - {hotel.ratingText}
                      </span>
                      <span className="text-secondary small">({hotel.reviewCount} đánh giá)</span>
                    </div>

                    <h5 className="card-title fw-bold text-dark mb-2">{hotel.name}</h5>
                    <p className="text-secondary small mb-2 d-flex align-items-center gap-1">
                      <MapPin size={14} className="text-danger flex-shrink-0" />
                      <span className="text-truncate">{hotel.address}</span>
                    </p>

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
                      {hotel.amenities.length > 3 && (
                        <span className="badge bg-light text-secondary border small">
                          +{hotel.amenities.length - 3} tiện ích
                        </span>
                      )}
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
                        Xem phòng & Chi tiết
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
