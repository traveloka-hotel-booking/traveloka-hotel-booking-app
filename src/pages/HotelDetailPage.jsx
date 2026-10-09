import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../services/api';
import { 
  MapPin, Star, Wifi, Waves, Coffee, Car, Dumbbell, 
  Sparkles, CheckCircle2, ShieldAlert, Clock, ArrowLeft,
  Users, BedDouble, Maximize2, Ban, Heart, Share2, Check
} from 'lucide-react';

export default function HotelDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  
  // Đọc dữ liệu tìm kiếm dự phòng từ localStorage nếu F5 hoặc mở tab mới
  const savedSearch = (() => {
    try {
      return JSON.parse(localStorage.getItem('traveloka_search_params')) || {};
    } catch {
      return {};
    }
  })();
  const searchState = { ...savedSearch, ...(location.state || {}) };

  // Khách sạn lấy từ Backend
  const [hotel, setHotel] = useState(null);

  // State ảnh chính đang được hiển thị trong Gallery
  const [activeImage, setActiveImage] = useState(null);
  const [bookingSuccessNotice, setBookingSuccessNotice] = useState(null);

  // 1 ảnh đại diện chính của khách sạn
  const mainCoverImage = useMemo(() => {
    if (!hotel) return 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1000&auto=format&fit=crop&q=80';
    let cover = hotel.thumbnailUrl;
    if (!cover) {
      if (Array.isArray(hotel.images) && hotel.images.length > 0) cover = hotel.images[0];
      else if (typeof hotel.images === 'string' && hotel.images.trim()) cover = hotel.images.split(',')[0].trim();
    }
    return cover || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1000&auto=format&fit=crop&q=80';
  }, [hotel]);

  // Đúng 3 ảnh phòng (lấy từ các phòng của khách sạn và ảnh 2, 3, 4 đã lưu, không trùng lặp ảnh đại diện)
  const roomImages = useMemo(() => {
    if (!hotel) return [];
    const roomImgList = (hotel.rooms || []).map(r => r.imageUrl).filter(Boolean);
    let extraImgs = [];
    if (Array.isArray(hotel.images)) {
      extraImgs = hotel.images.slice(1).filter(Boolean);
    } else if (typeof hotel.images === 'string' && hotel.images.trim()) {
      extraImgs = hotel.images.split(',').slice(1).map(s => s.trim()).filter(Boolean);
    }
    const combined = [...new Set([...roomImgList, ...extraImgs])].filter(url => url && url !== mainCoverImage);
    const roomFallbacks = [
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=600&auto=format&fit=crop&q=80'
    ];
    return [
      combined[0] || roomFallbacks[0],
      combined[1] || roomFallbacks[1],
      combined[2] || roomFallbacks[2]
    ];
  }, [hotel, mainCoverImage]);

  // Tải chi tiết khách sạn và danh sách phòng từ Backend API
  const loadHotelDetails = async () => {
    try {
      const [hRes, rRes] = await Promise.all([
        apiFetch(`/hotels/${id}`),
        apiFetch(`/hotels/${id}/rooms`)
      ]);

      let backendHotel = null;
      let backendRooms = null;

      if (hRes.ok) {
        const hData = await hRes.json();
        if (hData.result) backendHotel = hData.result;
      }
      if (rRes.ok) {
        const rData = await rRes.json();
        if (rData.result && Array.isArray(rData.result)) backendRooms = rData.result;
      }

      if (backendHotel || (backendRooms && backendRooms.length > 0)) {
        setHotel(prev => {
          const currentBase = backendHotel ? { ...prev, ...backendHotel } : prev;
          let mergedRooms = currentBase.rooms || [];

          if (backendRooms && backendRooms.length > 0) {
            mergedRooms = backendRooms.map(br => {
              const existingRoom = (prev?.rooms || []).find(r => r.id === br.id || r.name === br.name);
              return {
                ...existingRoom,
                ...br,
                imageUrl: br.imageUrl || existingRoom?.imageUrl || currentBase.thumbnailUrl || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&auto=format&fit=crop&q=60'
              };
            });
          }

          const updated = {
            ...currentBase,
            rooms: mergedRooms
          };

          // Đồng bộ lại vào localStorage traveloka_custom_rooms
          try {
            const savedRooms = JSON.parse(localStorage.getItem('traveloka_custom_rooms') || '[]');
            const otherRooms = savedRooms.filter(r => String(r.hotelId) !== String(id));
            const newSavedRooms = [...otherRooms, ...(mergedRooms || [])];
            localStorage.setItem('traveloka_custom_rooms', JSON.stringify(newSavedRooms));
          } catch {}

          return updated;
        });
        const firstImg = (Array.isArray(backendHotel?.images) && backendHotel.images[0])
          ? backendHotel.images[0]
          : (typeof backendHotel?.images === 'string' && backendHotel.images.split(',')[0])
          ? backendHotel.images.split(',')[0].trim()
          : backendHotel?.thumbnailUrl;
        if (firstImg) {
          setActiveImage(firstImg);
        }
      }
    } catch (err) {
      console.warn('API hotel details fallback:', err);
    }
  };

  useEffect(() => {
    loadHotelDetails();

    // Lắng nghe sự kiện khi Admin cập nhật ảnh phòng hoặc thông tin phòng ở tab/cửa sổ khác
    const handleSync = () => {
      loadHotelDetails();
    };

    window.addEventListener('storage', handleSync);
    window.addEventListener('traveloka_rooms_updated', handleSync);
    window.addEventListener('traveloka_hotels_updated', handleSync);

    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('traveloka_rooms_updated', handleSync);
      window.removeEventListener('traveloka_hotels_updated', handleSync);
    };
  }, [id]);

  // Icon tiện ích tương ứng theo tên
  const getAmenityIcon = (name) => {
    const lower = name.toLowerCase();
    if (lower.includes('wifi')) return <Wifi size={18} className="text-primary" />;
    if (lower.includes('hồ bơi') || lower.includes('bãi biển')) return <Waves size={18} className="text-info" />;
    if (lower.includes('bữa sáng') || lower.includes('nhà hàng') || lower.includes('bar')) return <Coffee size={18} className="text-warning" />;
    if (lower.includes('xe')) return <Car size={18} className="text-success" />;
    if (lower.includes('gym') || lower.includes('fitness') || lower.includes('spa')) return <Dumbbell size={18} className="text-danger" />;
    return <Sparkles size={18} className="text-primary" />;
  };

  const handleBookRoom = (room) => {
    const bookingState = { 
      hotel, 
      room, 
      checkInDate: searchState.checkIn,
      checkOutDate: searchState.checkOut,
      guestCount: searchState.adultsCount || 2,
      roomsCount: searchState.roomsCount || 1,
      destination: searchState.destination,
      ...searchState 
    };

    // Bắt buộc đăng nhập tài khoản Khách hàng khi tiến hành đặt phòng
    if (!isAuthenticated) {
      try {
        localStorage.setItem('traveloka_pending_booking', JSON.stringify(bookingState));
      } catch {}

      navigate('/login', { 
        state: { 
          from: { pathname: '/checkout', state: bookingState },
          notice: 'Vui lòng đăng nhập tài khoản Khách hàng để tiếp tục đặt phòng.'
        } 
      });
      return;
    }

    // Đã đăng nhập -> Điều hướng sang trang thanh toán & đặt phòng CheckoutPage
    navigate('/checkout', { state: bookingState });
  };

  if (!hotel) {
    return (
      <div className="bg-light min-vh-100 py-5 page-top-spacing d-flex flex-column align-items-center justify-content-center">
        <div className="spinner-border text-primary mb-3" role="status"></div>
        <h5 className="fw-bold text-dark mb-1">Đang tải thông tin khách sạn...</h5>
        <p className="text-secondary small mb-3">Vui lòng chờ trong giây lát</p>
        <button onClick={() => navigate('/hotels')} className="btn btn-outline-primary btn-sm rounded-pill">
          Quay lại danh sách khách sạn
        </button>
      </div>
    );
  }

  return (
    <div className="bg-light pb-4 min-vh-100 page-top-spacing">
      <div className="container">
        {/* Thanh điều hướng Breadcrumb */}
        <div className="d-flex align-items-center gap-2 mb-3 small text-secondary">
          <Link to="/" className="text-decoration-none text-secondary">Trang chủ</Link>
          <span>›</span>
          <Link to="/hotels" className="text-decoration-none text-secondary">Khách sạn</Link>
          <span>›</span>
          <span className="text-dark fw-bold">{hotel.name}</span>
        </div>

        {/* Nút quay lại */}
        <div className="mb-3">
          <button 
            onClick={() => navigate(-1)} 
            className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-1 bg-white"
          >
            <ArrowLeft size={16} /> Quay lại danh sách
          </button>
        </div>

        {/* Thông báo đặt phòng nhanh */}
        {bookingSuccessNotice && (
          <div className="alert alert-success alert-dismissible fade show shadow-sm border-0 rounded-3 mb-4 d-flex align-items-center gap-2" role="alert">
            <CheckCircle2 size={22} className="text-success flex-shrink-0" />
            <div>
              <strong>Lựa chọn thành công:</strong> {bookingSuccessNotice}
            </div>
            <button type="button" className="btn-close" onClick={() => setBookingSuccessNotice(null)}></button>
          </div>
        )}

        {/* 1. Header Khách Sạn */}
        <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
          <div className="d-flex flex-wrap justify-content-between align-items-start gap-3">
            <div>
              {/* Sao & Thành phố */}
              <div className="d-flex align-items-center gap-2 mb-2">
                <span className="badge bg-primary px-3 py-1 rounded-pill">{hotel.city}</span>
                <div className="d-flex align-items-center gap-1 text-warning">
                  {Array.from({ length: hotel.starRating }).map((_, i) => (
                    <Star key={i} size={16} fill="#ffc107" />
                  ))}
                  <span className="text-dark small fw-bold ms-1">{hotel.starRating} sao</span>
                </div>
              </div>

              {/* Tên khách sạn */}
              <h2 className="fw-bold text-dark mb-2">{hotel.name}</h2>

              {/* Địa chỉ */}
              <p className="text-secondary mb-0 d-flex align-items-center gap-2">
                <MapPin size={18} className="text-danger flex-shrink-0" />
                <span>{hotel.address}</span>
              </p>
            </div>

            {/* Điểm số & Đánh giá */}
            <div className="text-md-end text-start">
              <div className="d-inline-flex align-items-center gap-2 p-2 px-3 bg-success-subtle rounded-3 text-success">
                <span className="fs-3 fw-bold">★ {hotel.ratingScore}</span>
                <div className="text-start">
                  <div className="fw-bold">{hotel.ratingText}</div>
                  <small className="text-secondary">{hotel.reviewCount} đánh giá</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Thư viện ảnh (Gallery) - 1 Ảnh to đại diện + 3 Ảnh phòng */}
        <div className="card border-0 shadow-sm rounded-4 p-3 mb-4 bg-white overflow-hidden">
          <div className="row g-2">
            {/* 1 Ảnh lớn chính (Mặc định là Ảnh đại diện, có thể bấm đổi khi click vào ảnh phòng) */}
            <div className="col-lg-8">
              <div className="position-relative w-100 rounded-3 overflow-hidden shadow-sm" style={{ height: '420px' }}>
                <img 
                  src={activeImage || mainCoverImage} 
                  alt={hotel.name} 
                  className="w-100 h-100 object-fit-cover"
                  style={{ display: 'block' }}
                />
                <div className="position-absolute bottom-0 start-0 m-3 d-flex align-items-center gap-2">

                  {activeImage && activeImage !== mainCoverImage && (
                    <button 
                      type="button" 
                      onClick={() => setActiveImage(mainCoverImage)}
                      className="btn btn-sm btn-light bg-white bg-opacity-95 fw-semibold px-2 py-1 shadow-sm border-0"
                      style={{ fontSize: '12px' }}
                    >
                      ↩ Về ảnh đại diện
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Cột phải: Đúng 3 ảnh phòng (không trùng lặp ảnh đại diện) */}
            <div className="col-lg-4">
              <div className="d-flex flex-column justify-content-between gap-2" style={{ height: '420px' }}>
                {roomImages.map((imgUrl, index) => {
                  const isSelected = (activeImage || mainCoverImage) === imgUrl;
                  return (
                    <div 
                      key={index} 
                      className="position-relative flex-grow-1 rounded-3 overflow-hidden" 
                      style={{ height: '134px', minHeight: 0 }}
                    >
                      <img 
                        src={imgUrl} 
                        onClick={() => setActiveImage(imgUrl)}
                        className={`w-100 h-100 cursor-pointer object-fit-cover border rounded-3 transition-all ${isSelected ? 'border-primary border-3 shadow' : 'opacity-85'}`}
                        style={{ transition: 'all 0.2s', display: 'block' }}
                      />
                   
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="row g-4 mb-4">
          {/* 3. Cột trái: Tiện ích nổi bật & Giới thiệu */}
          <div className="col-lg-8">
            {/* Tiện ích khách sạn */}
            <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
              <h4 className="fw-bold mb-3 d-flex align-items-center gap-2 text-dark">
                <Sparkles size={22} className="text-primary" /> Tiện Nghi & Dịch Vụ Nổi Bật
              </h4>
              <p className="text-secondary small mb-4">
                Khách sạn cung cấp đầy đủ các tiện ích tiêu chuẩn 5 sao quốc tế phục vụ kỳ nghỉ của bạn:
              </p>

              <div className="row g-3">
                {(Array.isArray(hotel.amenities)
                  ? hotel.amenities
                  : (typeof hotel.amenities === 'string' ? hotel.amenities.split(',').map(s => s.trim()).filter(Boolean) : [])
                ).map((item, idx) => (
                  <div key={idx} className="col-md-6 col-12">
                    <div className="d-flex align-items-center gap-3 p-3 bg-light rounded-3">
                      {getAmenityIcon(item)}
                      <span className="fw-semibold text-dark small">{item}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mô tả chi tiết */}
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
              <h4 className="fw-bold mb-3 text-dark">Giới Thiệu Khách Sạn</h4>
              <p className="text-secondary leading-relaxed mb-4">
                {hotel.description}
              </p>

              {/* Thông tin nhận / trả phòng */}
              <div className="row g-3 p-3 bg-light rounded-3 border">
                <div className="col-md-6 d-flex align-items-center gap-3">
                  <div className="p-2 bg-white rounded-circle shadow-sm text-primary">
                    <Clock size={20} />
                  </div>
                  <div>
                    <span className="small text-secondary d-block">Giờ nhận phòng (Check-in)</span>
                    <strong className="text-dark">Từ {hotel.checkInTime || "14:00"}</strong>
                  </div>
                </div>
                <div className="col-md-6 d-flex align-items-center gap-3">
                  <div className="p-2 bg-white rounded-circle shadow-sm text-primary">
                    <Clock size={20} />
                  </div>
                  <div>
                    <span className="small text-secondary d-block">Giờ trả phòng (Check-out)</span>
                    <strong className="text-dark">Trước {hotel.checkOutTime || "12:00"}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cột phải: Thẻ đặt phòng nhanh & Hỗ trợ */}
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm rounded-4 p-4 sticky-top bg-white" style={{ top: '90px' }}>
              <span className="text-secondary small d-block">Giá khởi điểm từ</span>
              <div className="fs-3 fw-bold text-danger mb-2">
                {hotel.rooms[0]?.pricePerNight.toLocaleString('vi-VN')} đ
                <span className="text-secondary fs-6 fw-normal"> / đêm</span>
              </div>
              <p className="text-secondary small mb-3">Đã bao gồm thuế và các loại phí dịch vụ.</p>

              <a href="#room-list-section" className="btn btn-primary w-100 py-3 fw-bold mb-3 shadow-sm">
                Xem Danh Sách Phòng Trống
              </a>

              <div className="p-3 bg-primary-subtle rounded-3 text-primary small">
                <div className="d-flex align-items-center gap-2 mb-1 fw-bold">
                  <CheckCircle2 size={18} /> Cam kết Traveloka
                </div>
                <div>Đảm bảo có phòng khi nhận. Xác nhận đặt phòng tức thì qua email và tin nhắn.</div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= 4. BẢNG DANH SÁCH CÁC LOẠI PHÒNG (ROOM LIST) ================= */}
        <section id="room-list-section" className="mb-5 pt-3">
          <div className="d-flex justify-content-between align-items-end mb-4">
            <div>
              <span className="badge bg-primary px-3 py-1 rounded-pill mb-2">Lựa chọn phòng ngủ</span>
              <h3 className="fw-bold text-dark mb-0">Các Loại Phòng Còn Trống</h3>
            </div>
            <span className="text-secondary small">Hiện có {hotel?.rooms?.length || 0} loại phòng sẵn sàng đón tiếp</span>
          </div>

          <div className="d-flex flex-column gap-4">
            {(hotel?.rooms || []).map((room) => (
              <div key={room.id} className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white hover-shadow">
                <div className="row g-0">
                  {/* Ảnh phòng */}
                  <div className="col-lg-4 col-md-5">
                    <img 
                      src={room.imageUrl || hotel?.thumbnailUrl || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&auto=format&fit=crop&q=60'} 
                      alt={room.name} 
                      className="w-100 h-100 object-fit-cover"
                      style={{ minHeight: '260px' }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&auto=format&fit=crop&q=60';
                      }}
                    />
                  </div>

                  {/* Thông tin phòng & Tiện ích phòng */}
                  <div className="col-lg-5 col-md-7 p-4 border-end">
                    <h4 className="fw-bold text-dark mb-2">{room.name}</h4>
                    <p className="text-secondary small mb-3">{room.description}</p>

                    <div className="row g-2 mb-3">
                      <div className="col-6 d-flex align-items-center gap-2 small text-secondary">
                        <Maximize2 size={16} className="text-primary" />
                        <span>Diện tích: {room.roomSize}</span>
                      </div>
                      <div className="col-6 d-flex align-items-center gap-2 small text-secondary">
                        <Users size={16} className="text-primary" />
                        <span>Tối đa: {room.maxGuests} khách</span>
                      </div>
                      <div className="col-12 d-flex align-items-center gap-2 small text-secondary">
                        <BedDouble size={16} className="text-primary" />
                        <span>{room.bedType}</span>
                      </div>
                    </div>

                    {/* Danh sách tiện ích riêng của phòng */}
                    <div className="pt-2 border-top">
                      <span className="fw-bold small text-dark d-block mb-2">Tiện nghi trong phòng:</span>
                      <div className="d-flex flex-wrap gap-1">
                        {(() => {
                          let list = [];
                          if (Array.isArray(room.amenities)) {
                            list = room.amenities.filter(Boolean);
                          } else if (typeof room.amenities === 'string' && room.amenities.trim()) {
                            list = room.amenities.split(',').map(s => s.trim()).filter(Boolean);
                          }
                          if (list.length === 0) {
                            list = ['WiFi miễn phí', 'Điều hòa nhiệt độ', 'Smart TV', 'Phòng tắm riêng', 'Nước suối miễn phí'];
                          }
                          return list.map((item, i) => (
                            <span key={i} className="badge bg-light text-dark border small py-1 px-2 fw-normal">
                              ✓ {item}
                            </span>
                          ));
                        })()}
                      </div>
                    </div>
                  </div>

                  {/* Giá tiền & Nút đặt phòng */}
                  <div className="col-lg-3 col-md-12 p-4 d-flex flex-column justify-content-between bg-light bg-opacity-50">
                    <div>
                      {room.freeCancellation ? (
                        <div className="badge bg-success-subtle text-success small mb-2 d-inline-flex align-items-center gap-1">
                          <Check size={14} /> Miễn phí hủy phòng
                        </div>
                      ) : (
                        <div className="badge bg-warning-subtle text-warning small mb-2">
                          Không hoàn tiền khi hủy
                        </div>
                      )}

                      <div className="text-secondary small">Giá niêm yết:</div>
                      {room.originalPrice && (
                        <del className="text-secondary small d-block">
                          {room.originalPrice.toLocaleString('vi-VN')} đ
                        </del>
                      )}

                      <div className="fs-3 fw-bold text-danger my-1">
                        {room.pricePerNight.toLocaleString('vi-VN')} đ
                      </div>
                      <span className="text-secondary small">/ đêm (chưa gồm thuế)</span>
                    </div>

                    <div className="mt-4">
                      <button 
                        onClick={() => handleBookRoom(room)} 
                        className="btn btn-primary w-100 py-2 fw-bold shadow-sm"
                      >
                        Đặt Phòng Ngay
                      </button>
                      <small className="text-center d-block text-secondary mt-2" style={{ fontSize: '12px' }}>
                        ⚡ Xác nhận tức thì chỉ trong 1 phút
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 5. Đánh giá từ khách hàng */}
        {hotel.reviews && hotel.reviews.length > 0 && (
          <section className="card border-0 shadow-sm rounded-4 p-4 bg-white">
            <h4 className="fw-bold mb-4 text-dark">Đánh Giá Thực Tế Từ Khách Lưu Trú</h4>
            <div className="row g-3">
              {hotel.reviews.map((rev) => (
                <div key={rev.id} className="col-md-6">
                  <div className="p-3 bg-light rounded-3 h-100 border">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <strong className="text-dark">{rev.author}</strong>
                      <span className="badge bg-success">★ {rev.rating}/10</span>
                    </div>
                    <span className="small text-secondary d-block mb-2">{rev.date}</span>
                    <p className="small text-secondary mb-0 fst-italic">"{rev.comment}"</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
