import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { MOCK_HOTELS, getHotelsData } from '../data/mockData';
import { 
  Search, MapPin, Calendar, Users, Star, ArrowRight, ChevronDown, ChevronUp,
  Minus, Plus, ShieldCheck, Tag, Clock, Sparkles, Check, Info, ArrowUp, ThumbsUp,
  Award, Shield, HelpCircle
} from 'lucide-react';

// Danh sách gợi ý điểm đến phổ biến tại Việt Nam theo yêu cầu
const VIETNAM_DESTINATIONS = [
  "TP. Hồ Chí Minh",
  "Đà Nẵng",
  "Hà Nội",
  "Nha Trang",
  "Đà Lạt",
  "Phan Thiết",
  "Đảo Phú Quốc",
  "Vũng Tàu",
  "Quy Nhơn",
  "Sa Pa"
];

export default function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // State tìm kiếm trên Hero
  const [destination, setDestination] = useState('Hồ Chí Minh');
  const [checkIn, setCheckIn] = useState('2026-09-25');
  const [checkOut, setCheckOut] = useState('2026-09-26');
  
  // State chọn phòng và khách (3 thành phần: Phòng, Người Lớn, Trẻ Em)
  const [roomsCount, setRoomsCount] = useState(1);
  const [adultsCount, setAdultsCount] = useState(2);
  const [childrenCount, setChildrenCount] = useState(0);

  // State bật/tắt các dropdown gợi ý
  const [isDestinationPickerOpen, setIsDestinationPickerOpen] = useState(false);
  const [isGuestPickerOpen, setIsGuestPickerOpen] = useState(false);

  const destinationRef = useRef(null);
  const guestRef = useRef(null);

  // Tự động cuộn đến phần tìm kiếm đặt chỗ nếu url có hash #hotel-list-section
  useEffect(() => {
    if (location.hash === '#hotel-list-section') {
      const timer = setTimeout(() => {
        const section = document.getElementById('hotel-list-section');
        if (section) {
          section.scrollIntoView({ behavior: 'smooth' });
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [location]);

  // Tự động đóng dropdown khi bấm ra ngoài vùng chọn
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (destinationRef.current && !destinationRef.current.contains(event.target)) {
        setIsDestinationPickerOpen(false);
      }
      if (guestRef.current && !guestRef.current.contains(event.target)) {
        setIsGuestPickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Chuỗi tóm tắt phòng và khách
  const guestConfigText = `${roomsCount} phòng, ${adultsCount} Người Lớn, ${childrenCount} Trẻ em`;

  // State bộ lọc ở phần danh sách bên dưới (như ảnh 2)
  const [selectedStar, setSelectedStar] = useState(null);
  const [selectedRating, setSelectedRating] = useState(null);
  const [sortOption, setSortOption] = useState('popular'); // popular, priceAsc, distance

  // Cuộn mượt mà xuống phần danh sách khách sạn
  const scrollToHotelList = () => {
    const section = document.getElementById('hotel-list-section');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Cuộn lên đầu trang
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Xử lý tìm kiếm
  const handleSearch = (e) => {
    e.preventDefault();
    scrollToHotelList();
  };

  // Lọc danh sách khách sạn
  const displayedHotels = useMemo(() => {
    return getHotelsData().filter(hotel => {
      // Lọc theo sao
      if (selectedStar && hotel.starRating !== selectedStar) {
        return false;
      }
      // Lọc theo đánh giá
      if (selectedRating && hotel.ratingScore < selectedRating) {
        return false;
      }
      return true;
    }).sort((a, b) => {
      const priceA = a.rooms[0]?.pricePerNight || 0;
      const priceB = b.rooms[0]?.pricePerNight || 0;
      if (sortOption === 'priceAsc') return priceA - priceB;
      if (sortOption === 'ratingDesc') return b.ratingScore - a.ratingScore;
      return 0;
    });
  }, [selectedStar, selectedRating, sortOption]);

  return (
    <div>
      {/* =========================================================
          PHẦN 1: HERO SECTION TOÀN MÀN HÌNH (THEO ĐÚNG ẢNH 1)
      ========================================================= */}
      <section 
        className="position-relative d-flex flex-column justify-content-between text-white"
        style={{
          minHeight: '100vh',
          backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.45), rgba(15, 23, 42, 0.75)), url('https://pystravel.vn/_next/image?url=https%3A%2F%2Fbooking.pystravel.vn%2Fuploads%2Fposts%2Falbums%2F6224%2F27866de7412bab2c732246925db7e1bf.jpg&w=1920&q=75')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 40%',
          paddingTop: '110px',
          paddingBottom: '30px'
        }}
      >
        <div className="container my-auto">
          <div className="row justify-content-center">
            <div className="col-xl-11 col-lg-12">
              {/* Tiêu đề chính như ảnh 1 */}
              <div className="mb-4">
                <h1 className="fw-bold fs-2 d-flex align-items-center gap-2 mb-2 text-white">
                  <span>Đặt phòng khách sạn được đề xuất gần điểm đến của bạn.</span>
                  <Info size={18} className="opacity-75 cursor-pointer" title="Đề xuất dựa trên chất lượng và vị trí" />
                </h1>
                <p className="text-white-50 fs-6 mb-0">
                  Chọn ngày để kiểm tra tình trạng phòng trống và kế hoạch lưu trú mới nhất.
                </p>
              </div>

              {/* KHỐI THANH TÌM KIẾM TRẮNG NẰM NGANG (FLOATING SEARCH BOX NHƯ ẢNH 1) */}
              <div className="card shadow-lg border-0 rounded-3 p-2 bg-white text-dark">
                <form onSubmit={handleSearch} className="row g-0 align-items-center">
                  
                  {/* Ô 1: Vui lòng nhập điểm đến của bạn với gợi ý điểm đến Việt Nam */}
                  <div className="col-lg-3 col-md-6 p-2 px-3 border-end position-relative" ref={destinationRef}>
                    <label className="text-secondary small d-block mb-1" style={{ fontSize: '11px', fontWeight: 600 }}>
                      Vui lòng nhập điểm đến
                    </label>
                    <input 
                      type="text" 
                      className="form-control border-0 p-0 fw-bold fs-6 text-dark shadow-none bg-transparent"
                      placeholder="Thành phố, sân bay, khu vực, đ..."
                      value={destination}
                      onFocus={() => setIsDestinationPickerOpen(true)}
                      onClick={() => setIsDestinationPickerOpen(true)}
                      onChange={(e) => setDestination(e.target.value)}
                    />

                    {/* Popup gợi ý điểm đến phổ biến tại Việt Nam theo yêu cầu Chỗ 2 */}
                    {isDestinationPickerOpen && (
                      <div 
                        className="position-absolute start-0 bg-white shadow-lg rounded-3 border overflow-hidden" 
                        style={{ top: '100%', width: '480px', maxWidth: '90vw', zIndex: 1060, marginTop: '8px' }}
                      >
                        <div className="bg-light p-2 px-3 border-bottom">
                          <span className="fw-bold text-dark small">Điểm đến phổ biến</span>
                        </div>
                        <div className="p-3">
                          <div className="row g-2">
                            {VIETNAM_DESTINATIONS.map((dest, idx) => (
                              <div key={idx} className="col-sm-6 col-6">
                                <button
                                  type="button"
                                  className="btn btn-sm btn-light w-100 text-start text-truncate py-2 px-2 small text-dark border-0 hover-bg-primary-subtle d-flex align-items-center gap-1"
                                  onClick={() => {
                                    setDestination(dest);
                                    setIsDestinationPickerOpen(false);
                                  }}
                                >
                                  <MapPin size={14} className="text-danger flex-shrink-0" />
                                  <span className="text-truncate">{dest}</span>
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Ô 2: Đăng ký vào / Thanh toán (Ngày nhận - trả + 1 đêm) */}
                  <div className="col-lg-4 col-md-6 p-2 px-3 border-end">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="text-secondary small" style={{ fontSize: '11px', fontWeight: 600 }}>Nhận phòng</span>
                      <span className="badge bg-light text-secondary border px-2 py-0" style={{ fontSize: '11px' }}>Trả phòng</span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <input 
                        type="date" 
                        className="form-control border-0 p-0 fw-bold fs-6 text-dark shadow-none bg-transparent"
                        value={checkIn}
                        onChange={(e) => setCheckIn(e.target.value)}
                      />
                      <span className="text-secondary">-</span>
                      <input 
                        type="date" 
                        className="form-control border-0 p-0 fw-bold fs-6 text-dark shadow-none bg-transparent"
                        value={checkOut}
                        onChange={(e) => setCheckOut(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Ô 3: Số lượng phòng và số lượng khách (3 thành phần: Phòng, Người Lớn, Trẻ Em theo Chỗ 1) */}
                  <div className="col-lg-3 col-md-8 p-2 px-3 border-end position-relative" ref={guestRef}>
                    <label className="text-secondary small d-block mb-1" style={{ fontSize: '11px', fontWeight: 600 }}>
                      Phòng và khách
                    </label>
                    <div 
                      className="d-flex justify-content-between align-items-center cursor-pointer py-1"
                      onClick={() => setIsGuestPickerOpen(!isGuestPickerOpen)}
                    >
                      <span className="fw-bold fs-6 text-dark text-truncate pe-1">
                        {guestConfigText}
                      </span>
                      {isGuestPickerOpen ? (
                        <ChevronUp size={18} className="text-secondary flex-shrink-0" />
                      ) : (
                        <ChevronDown size={18} className="text-secondary flex-shrink-0" />
                      )}
                    </div>

                    {/* Popup chọn 3 thành phần: Phòng, Người Lớn, Trẻ Em */}
                    {isGuestPickerOpen && (
                      <div 
                        className="position-absolute start-0 bg-white shadow-lg rounded-3 border p-3" 
                        style={{ top: '100%', minWidth: '270px', width: '100%', zIndex: 1060, marginTop: '8px' }}
                      >
                        {/* Thành phần 1: Phòng */}
                        <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
                          <div>
                            <span className="fw-semibold text-dark small d-block">Phòng</span>
                          </div>
                          <div className="d-flex align-items-center gap-2">
                            <button
                              type="button"
                              disabled={roomsCount <= 1}
                              onClick={(e) => {
                                e.stopPropagation();
                                setRoomsCount(prev => Math.max(1, prev - 1));
                              }}
                              className="btn btn-sm btn-outline-secondary rounded-circle d-flex align-items-center justify-content-center p-0"
                              style={{ width: '28px', height: '28px' }}
                            >
                              <Minus size={14} />
                            </button>
                            <span className="fw-bold px-1" style={{ minWidth: '20px', textAlign: 'center' }}>
                              {roomsCount}
                            </span>
                            <button
                              type="button"
                              disabled={roomsCount >= 10}
                              onClick={(e) => {
                                e.stopPropagation();
                                setRoomsCount(prev => Math.min(10, prev + 1));
                              }}
                              className="btn btn-sm btn-outline-secondary rounded-circle d-flex align-items-center justify-content-center p-0"
                              style={{ width: '28px', height: '28px' }}
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>

                        {/* Thành phần 2: Người lớn */}
                        <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
                          <div>
                            <span className="fw-semibold text-dark small">Người lớn</span>
                            <span className="text-secondary ms-1" style={{ fontSize: '11px' }}>18+ tuổi</span>
                          </div>
                          <div className="d-flex align-items-center gap-2">
                            <button
                              type="button"
                              disabled={adultsCount <= 1}
                              onClick={(e) => {
                                e.stopPropagation();
                                setAdultsCount(prev => Math.max(1, prev - 1));
                              }}
                              className="btn btn-sm btn-outline-secondary rounded-circle d-flex align-items-center justify-content-center p-0"
                              style={{ width: '28px', height: '28px' }}
                            >
                              <Minus size={14} />
                            </button>
                            <span className="fw-bold px-1" style={{ minWidth: '20px', textAlign: 'center' }}>
                              {adultsCount}
                            </span>
                            <button
                              type="button"
                              disabled={adultsCount >= 20}
                              onClick={(e) => {
                                e.stopPropagation();
                                setAdultsCount(prev => Math.min(20, prev + 1));
                              }}
                              className="btn btn-sm btn-outline-secondary rounded-circle d-flex align-items-center justify-content-center p-0"
                              style={{ width: '28px', height: '28px' }}
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>

                        {/* Thành phần 3: Trẻ em */}
                        <div className="d-flex justify-content-between align-items-center py-2">
                          <div>
                            <span className="fw-semibold text-dark small">Trẻ em</span>
                            <span className="text-secondary ms-1" style={{ fontSize: '11px' }}>0-17 tuổi</span>
                          </div>
                          <div className="d-flex align-items-center gap-2">
                            <button
                              type="button"
                              disabled={childrenCount <= 0}
                              onClick={(e) => {
                                e.stopPropagation();
                                setChildrenCount(prev => Math.max(0, prev - 1));
                              }}
                              className="btn btn-sm btn-outline-secondary rounded-circle d-flex align-items-center justify-content-center p-0"
                              style={{ width: '28px', height: '28px' }}
                            >
                              <Minus size={14} />
                            </button>
                            <span className="fw-bold px-1" style={{ minWidth: '20px', textAlign: 'center' }}>
                              {childrenCount}
                            </span>
                            <button
                              type="button"
                              disabled={childrenCount >= 10}
                              onClick={(e) => {
                                e.stopPropagation();
                                setChildrenCount(prev => Math.min(10, prev + 1));
                              }}
                              className="btn btn-sm btn-outline-secondary rounded-circle d-flex align-items-center justify-content-center p-0"
                              style={{ width: '28px', height: '28px' }}
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>

                        {/* Nút Xong */}
                        <div className="pt-2 mt-1 border-top text-end">
                          <button
                            type="button"
                            onClick={() => setIsGuestPickerOpen(false)}
                            className="btn btn-primary btn-sm px-3 rounded-pill fw-semibold"
                            style={{ fontSize: '12px' }}
                          >
                            Xong
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Ô 4: Nút tìm kiếm phòng trống màu xanh dương */}
                  <div className="col-lg-2 col-md-4 p-2">
                    <button 
                      type="submit" 
                      className="btn btn-primary w-100 py-3 fw-bold rounded-3 d-flex align-items-center justify-content-center gap-2 shadow-sm text-nowrap"
                      style={{ backgroundColor: '#2563eb' }}
                    >
                      <Search size={20} />
                      <span>Kiểm Tra Phòng Trống</span>
                    </button>
                  </div>

                </form>
              </div>

            </div>
          </div>
        </div>

        {/* Nút chỉ dẫn cuộn xuống (Vuốt xuống để xem thêm như ảnh 1) */}
        <div 
          onClick={scrollToHotelList}
          className="text-center cursor-pointer opacity-90 hover-opacity py-2 d-flex flex-column align-items-center"
        >
          <ChevronDown size={28} className="animate-bounce mb-1" />
          <span className="small tracking-wide" style={{ fontSize: '13px', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
            Vuốt xuống để xem thêm
          </span>
        </div>
      </section>

      {/* =========================================================
          PHẦN 2: DANH SÁCH KHÁCH SẠN VÀ BỘ LỌC (THEO ĐÚNG ẢNH 2)
      ========================================================= */}
      <section id="hotel-list-section" className="bg-light py-4">
        <div className="container">
          
          {/* Breadcrumb theo ảnh 2 */}
          <div className="d-flex align-items-center gap-2 small text-secondary mb-3" style={{ fontSize: '13px' }}>
            <Link to="/" className="text-primary text-decoration-none">Traveloka</Link>
            <span>&gt;</span>
            <Link to="/hotels" className="text-primary text-decoration-none">Khách sạn</Link>
            <span>&gt;</span>
            <span className="text-primary">Khách sạn tại Việt Nam</span>
            <span>&gt;</span>
            <span className="text-dark fw-semibold">{destination || "Điểm đến của bạn"}</span>
          </div>

          <div className="row g-4">
            
            {/* ----------------- CỘT TRÁI: TIÊU CHÍ TINH CHỈNH ----------------- */}
            <div className="col-lg-3 col-md-4">
              
              {/* Box 1: Tiêu chí tinh chỉnh */}
              <div className="card border-0 shadow-sm rounded-3 p-3 bg-white mb-3">
                <h6 className="fw-bold mb-3 text-dark">Tiêu chí tinh chỉnh</h6>
                
                {/* 1. Xếp hạng khách sạn (Hạng sao) */}
                <div className="mb-3 pb-3 border-bottom">
                  <label className="small fw-semibold text-secondary d-block mb-2">Xếp hạng khách sạn</label>
                  <div className="d-flex gap-2">
                    {[
                      { label: "≤2★", star: 2 },
                      { label: "3★", star: 3 },
                      { label: "4★", star: 4 },
                      { label: "5★", star: 5 }
                    ].map((item) => (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => setSelectedStar(selectedStar === item.star ? null : item.star)}
                        className={`btn btn-sm flex-fill py-1 rounded-2 ${selectedStar === item.star ? 'btn-primary text-white fw-bold' : 'btn-light border text-dark'}`}
                        style={{ fontSize: '13px' }}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Đánh giá của khách hàng */}
                <div>
                  <label className="small fw-semibold text-secondary d-block mb-2">Đánh giá của khách hàng</label>
                  <div className="d-flex flex-column gap-2">
                    {[
                      { label: "Xuất sắc (9 điểm trở lên)", score: 9 },
                      { label: "Rất tốt (8 điểm trở lên)", score: 8 },
                      { label: "Tốt (7 điểm trở lên)", score: 7 }
                    ].map((r) => (
                      <label key={r.score} className="d-flex align-items-center gap-2 small cursor-pointer text-dark">
                        <input 
                          type="radio" 
                          name="ratingFilter" 
                          checked={selectedRating === r.score}
                          onChange={() => setSelectedRating(selectedRating === r.score ? null : r.score)}
                          className="form-check-input mt-0"
                        />
                        <span>{r.label}</span>
                      </label>
                    ))}
                    {selectedRating && (
                      <button 
                        onClick={() => setSelectedRating(null)} 
                        className="btn btn-link btn-sm text-danger text-start p-0 small text-decoration-none mt-1"
                      >
                        Bỏ chọn đánh giá
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Box 2: Tại sao nên chọn Traveloka? (Như ảnh 2) */}
              <div className="card border-0 shadow-sm rounded-3 p-3 bg-white">
                <h6 className="fw-bold mb-3 text-dark">Tại sao nên chọn Traveloka?</h6>

                <div className="d-flex gap-3 mb-3">
                  <div className="text-primary mt-1">
                    <ShieldCheck size={22} />
                  </div>
                  <div>
                    <strong className="small d-block text-dark">Đảm bảo giá thấp nhất</strong>
                    <p className="text-secondary small mb-0" style={{ fontSize: '12px' }}>
                      Chúng tôi luôn nỗ lực mang đến mức giá tốt nhất. Nếu bạn tìm thấy giá thấp hơn ở nơi khác, chúng tôi sẽ hoàn lại phần chênh lệch.
                    </p>
                  </div>
                </div>

                <div className="d-flex gap-3 mb-3">
                  <div className="text-warning mt-1">
                    <Award size={22} />
                  </div>
                  <div>
                    <strong className="small d-block text-dark">Đặt phòng và tiết kiệm với ưu đãi</strong>
                    <p className="text-secondary small mb-0" style={{ fontSize: '12px' }}>
                      Trở thành thành viên để được tích lũy Xu Du Lịch và hưởng đặc quyền giảm giá độc quyền.
                    </p>
                  </div>
                </div>

                <div className="d-flex gap-3">
                  <div className="text-success mt-1">
                    <Star size={22} fill="#198754" />
                  </div>
                  <div>
                    <strong className="small d-block text-dark">4.8 / 5 Điểm uy tín</strong>
                    <p className="text-secondary small mb-0" style={{ fontSize: '12px' }}>
                      Hơn 200.000 đánh giá thật từ khách hàng đã trải nghiệm đặt phòng thành công.
                    </p>
                  </div>
                </div>
              </div>

            </div>

            {/* ----------------- CỘT PHẢI: DANH SÁCH KHÁCH SẠN ----------------- */}
            <div className="col-lg-9 col-md-8">
              
              {/* Tiêu đề danh sách */}
              <div className="mb-3">
                <h3 className="fw-bold text-dark mb-1">
                  Khách sạn gần {destination || "điểm đến đề xuất"}
                </h3>
                <p className="text-secondary small mb-3">
                  Kiểm tra giá thấp nhất bằng cách chỉ định ngày lưu trú mong muốn của bạn.
                </p>

                {/* Tabs phân loại theo ảnh 2 */}
                <div className="d-flex bg-white rounded-3 p-1 shadow-sm border mb-4">
                  <button 
                    onClick={() => setSortOption('popular')}
                    className={`btn btn-sm flex-fill py-2 fw-semibold rounded-2 ${sortOption === 'popular' ? 'btn-dark text-white' : 'btn-white text-secondary'}`}
                  >
                    Xếp hạng mức độ phổ biến
                  </button>
                  <button 
                    onClick={() => setSortOption('priceAsc')}
                    className={`btn btn-sm flex-fill py-2 fw-semibold rounded-2 ${sortOption === 'priceAsc' ? 'btn-dark text-white' : 'btn-white text-secondary'}`}
                  >
                    Ưu tiên giá thấp nhất
                  </button>
                  <button 
                    onClick={() => setSortOption('ratingDesc')}
                    className={`btn btn-sm flex-fill py-2 fw-semibold rounded-2 ${sortOption === 'ratingDesc' ? 'btn-dark text-white' : 'btn-white text-secondary'}`}
                  >
                    Đánh giá cao nhất
                  </button>
                </div>
              </div>

              {/* Danh sách thẻ Khách Sạn (Bố cục ngang theo đúng ảnh 2) */}
              <div className="d-flex flex-column gap-3">
                {displayedHotels.map((hotel) => (
                  <div key={hotel.id} className="card border-0 shadow-sm rounded-3 overflow-hidden bg-white hover-shadow">
                    <div className="row g-0">
                      
                      {/* Cột ảnh (Gồm 1 ảnh to + 2 ảnh nhỏ kèm badge +99 ảnh như ảnh 2) */}
                      <div className="col-lg-4 col-md-5 p-2">
                        <div className="position-relative mb-1">
                          <img 
                            src={hotel.thumbnailUrl} 
                            alt={hotel.name}
                            className="w-100 rounded-2 object-fit-cover"
                            style={{ height: '180px' }}
                          />
                          <span 
                            className="position-absolute top-0 start-0 m-2 badge bg-dark bg-opacity-75 small px-2 py-1"
                            style={{ fontSize: '11px' }}
                          >
                            ≤ 1km
                          </span>
                        </div>
                        <div className="row g-1">
                          <div className="col-4">
                            <img 
                              src={hotel.images?.[1] || hotel.thumbnailUrl} 
                              alt="thumb 1"
                              className="w-100 rounded-1 object-fit-cover"
                              style={{ height: '55px' }}
                            />
                          </div>
                          <div className="col-4">
                            <img 
                              src={hotel.images?.[2] || hotel.thumbnailUrl} 
                              alt="thumb 2"
                              className="w-100 rounded-1 object-fit-cover"
                              style={{ height: '55px' }}
                            />
                          </div>
                          <div className="col-4">
                            <img 
                              src={hotel.images?.[3] || hotel.thumbnailUrl} 
                              alt="thumb 3"
                              className="w-100 rounded-1 object-fit-cover"
                              style={{ height: '55px' }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Cột thông tin giữa */}
                      <div className="col-lg-5 col-md-7 p-3 d-flex flex-column justify-content-between border-end">
                        <div>
                          {/* Tên khách sạn & Hạng sao */}
                          <h5 className="fw-bold text-dark text-uppercase mb-1" style={{ fontSize: '16px' }}>
                            {hotel.name}
                          </h5>
                          <div className="d-flex align-items-center gap-1 text-warning mb-2">
                            {Array.from({ length: hotel.starRating }).map((_, i) => (
                              <Star key={i} size={14} fill="#ffc107" />
                            ))}
                          </div>

                          {/* Khoảng cách & Vị trí */}
                          <div className="d-flex align-items-center gap-1 text-secondary small mb-2" style={{ fontSize: '12px' }}>
                            <MapPin size={13} className="text-danger flex-shrink-0" />
                            <span>Cách trung tâm thành phố 130m ({hotel.city})</span>
                          </div>

                          {/* Tiện ích ngắn gọn dạng pill badge */}
                          <div className="d-flex flex-wrap gap-1 mb-3">
                            {hotel.amenities.slice(0, 3).map((a, idx) => (
                              <span key={idx} className="badge bg-light text-secondary border fw-normal" style={{ fontSize: '11px' }}>
                                {a}
                              </span>
                            ))}
                          </div>

                          {/* Đoạn trích dẫn nhận xét thực tế (như ảnh 2) */}
                          <p className="text-secondary small fst-italic mb-0 line-clamp-2" style={{ fontSize: '12px' }}>
                            "{hotel.reviews?.[0]?.comment || 'Dịch vụ chu đáo, phòng ốc tiện nghi và hồ bơi thoáng mát.'}"
                          </p>
                        </div>
                      </div>

                      {/* Cột giá & nút tìm kiếm phòng trống bên phải */}
                      <div className="col-lg-3 col-12 p-3 d-flex flex-column justify-content-between text-lg-end text-start bg-light bg-opacity-25">
                        {/* Điểm đánh giá (tuyệt vời 9.6 / 10) */}
                        <div>
                          <div className="d-flex justify-content-lg-end justify-content-start align-items-center gap-2 mb-1">
                            <div>
                              <strong className="d-block text-dark small">{hotel.ratingText || "Tuyệt vời"}</strong>
                              <span className="text-secondary" style={{ fontSize: '11px' }}>{hotel.reviewCount} đánh giá</span>
                            </div>
                            <span className="badge bg-primary fs-6 px-2 py-1 rounded-2" style={{ backgroundColor: '#2563eb' }}>
                              {hotel.ratingScore} / 10
                            </span>
                          </div>
                        </div>

                        {/* Giá tiền và Nút bấm */}
                        <div className="mt-3">
                          <span className="text-secondary small d-block" style={{ fontSize: '11px' }}>1 đêm</span>
                          <div className="fs-4 fw-bold text-dark mb-2">
                            {hotel.rooms[0]?.pricePerNight.toLocaleString('vi-VN')} đ
                          </div>

                          <Link 
                            to={`/hotels/${hotel.id}`}
                            className="btn btn-primary w-100 py-2 fw-bold text-white d-flex align-items-center justify-content-center gap-1 shadow-sm"
                            style={{ backgroundColor: '#2563eb', fontSize: '14px' }}
                          >
                            <span>Tìm kiếm phòng trống</span>
                            <ArrowRight size={16} />
                          </Link>
                        </div>

                      </div>

                    </div>
                  </div>
                ))}
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* Nút cuộn lên đầu trang (Floating Scroll-To-Top Button) */}
      <button
        type="button"
        onClick={scrollToTop}
        className="btn btn-primary position-fixed bottom-0 end-0 m-4 rounded-circle shadow-lg d-flex align-items-center justify-content-center"
        style={{ width: '48px', height: '48px', zIndex: 1040, backgroundColor: '#2563eb' }}
        title="Lên đầu trang"
      >
        <ArrowUp size={20} />
      </button>

    </div>
  );
}
