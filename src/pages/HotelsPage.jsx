import React, { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MOCK_HOTELS, getHotelsData } from '../data/mockData';
import { 
  Search, MapPin, Star, Filter, RotateCcw, 
  Wifi, Waves, Coffee, Car, Dumbbell, Sparkles, CheckSquare, Square
} from 'lucide-react';

export default function HotelsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const cityParam = searchParams.get('city') || '';

  // State các bộ lọc
  const [selectedCity, setSelectedCity] = useState(cityParam);
  const [selectedStars, setSelectedStars] = useState([]);
  const [maxPrice, setMaxPrice] = useState(5000000);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [sortBy, setSortBy] = useState('popular'); // popular, priceAsc, priceDesc, ratingDesc

  // Cập nhật city khi URL thay đổi
  useEffect(() => {
    setSelectedCity(cityParam);
  }, [cityParam]);

  // Danh sách các thành phố có trong dữ liệu
  const cities = ["Tất cả", "Hà Nội", "Đà Nẵng", "Hồ Chí Minh", "Nha Trang", "Đà Lạt", "Phú Quốc"];

  // Danh sách các tiện ích để lọc
  const amenityOptions = [
    "Wifi miễn phí",
    "Hồ bơi trong nhà",
    "Hồ bơi vô cực",
    "Bãi biển riêng",
    "Bữa sáng miễn phí",
    "Phòng gym & Fitness",
    "Bãi đỗ xe",
    "Spa & Massage",
    "Quầy bar & Lounge"
  ];

  // Xử lý bật/tắt chọn sao
  const toggleStar = (star) => {
    setSelectedStars(prev => 
      prev.includes(star) ? prev.filter(s => s !== star) : [...prev, star]
    );
  };

  // Xử lý bật/tắt tiện ích
  const toggleAmenity = (amenity) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  // Xóa toàn bộ bộ lọc
  const handleResetFilters = () => {
    setSelectedCity('');
    setSelectedStars([]);
    setMaxPrice(5000000);
    setSelectedAmenities([]);
    setSortBy('popular');
    setSearchParams({});
  };

  // Lọc và sắp xếp dữ liệu (đồng bộ với dữ liệu CRUD của Admin)
  const filteredHotels = useMemo(() => {
    return getHotelsData().filter(hotel => {
      // 1. Lọc theo thành phố
      if (selectedCity && selectedCity !== "Tất cả") {
        if (!hotel.city.toLowerCase().includes(selectedCity.toLowerCase())) {
          return false;
        }
      }

      // 2. Lọc theo số sao
      if (selectedStars.length > 0 && !selectedStars.includes(hotel.starRating)) {
        return false;
      }

      // 3. Lọc theo giá tối đa (lấy giá phòng thấp nhất của khách sạn)
      const minHotelPrice = hotel.rooms[0]?.pricePerNight || 0;
      if (minHotelPrice > maxPrice) {
        return false;
      }

      // 4. Lọc theo tiện ích (phải chứa ít nhất 1 tiện ích được chọn nếu có)
      if (selectedAmenities.length > 0) {
        const hasAmenity = selectedAmenities.some(a => 
          hotel.amenities.some(item => item.toLowerCase().includes(a.toLowerCase()))
        );
        if (!hasAmenity) return false;
      }

      return true;
    }).sort((a, b) => {
      const priceA = a.rooms[0]?.pricePerNight || 0;
      const priceB = b.rooms[0]?.pricePerNight || 0;

      if (sortBy === 'priceAsc') return priceA - priceB;
      if (sortBy === 'priceDesc') return priceB - priceA;
      if (sortBy === 'ratingDesc') return b.ratingScore - a.ratingScore;
      return 0; // popular
    });
  }, [selectedCity, selectedStars, maxPrice, selectedAmenities, sortBy]);

  return (
    <div className="bg-light pb-4 min-vh-100 page-top-spacing">
      <div className="container">
        {/* Tiêu đề trang */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
          <div>
            <h2 className="fw-bold mb-1">
              Khách Sạn {selectedCity && selectedCity !== "Tất cả" ? `Tại ${selectedCity}` : "Tại Việt Nam"}
            </h2>
            <p className="text-secondary mb-0">
              Tìm thấy <strong className="text-primary">{filteredHotels.length}</strong> khách sạn phù hợp với tiêu chí của bạn
            </p>
          </div>

          {/* Sắp xếp kết quả */}
          <div className="d-flex align-items-center gap-2">
            <label className="fw-semibold small text-secondary text-nowrap">Sắp xếp theo:</label>
            <select 
              className="form-select border-secondary-subtle" 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              style={{ width: '220px' }}
            >
              <option value="popular">Phổ biến & Yêu thích nhất</option>
              <option value="priceAsc">Giá: Thấp đến Cao</option>
              <option value="priceDesc">Giá: Cao đến Thấp</option>
              <option value="ratingDesc">Đánh giá cao nhất</option>
            </select>
          </div>
        </div>

        <div className="row g-4">
          {/* ================= CỘT TRÁI: BỘ LỌC TÌM KIẾM ================= */}
          <div className="col-lg-3 col-md-4">
            <div className="card border-0 shadow-sm rounded-4 p-4 sticky-top" style={{ top: '90px' }}>
              <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                <span className="fw-bold fs-5 d-flex align-items-center gap-2 text-dark">
                  <Filter size={20} className="text-primary" /> Bộ Lọc
                </span>
                <button 
                  onClick={handleResetFilters} 
                  className="btn btn-sm btn-link text-danger text-decoration-none p-0 d-flex align-items-center gap-1"
                >
                  <RotateCcw size={14} /> Xóa tất cả
                </button>
              </div>

              {/* 1. Lọc theo Thành phố */}
              <div className="mb-4">
                <label className="form-label fw-bold text-dark small text-uppercase">Điểm đến</label>
                <select 
                  className="form-select border-secondary-subtle"
                  value={selectedCity}
                  onChange={(e) => {
                    const c = e.target.value;
                    setSelectedCity(c);
                    if (c && c !== "Tất cả") setSearchParams({ city: c });
                    else setSearchParams({});
                  }}
                >
                  {cities.map((c, i) => (
                    <option key={i} value={c === "Tất cả" ? "" : c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* 2. Lọc theo Khoảng giá */}
              <div className="mb-4 pb-3 border-bottom">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <label className="form-label fw-bold text-dark small text-uppercase mb-0">Mức giá tối đa</label>
                  <span className="fw-bold text-danger small">
                    {maxPrice.toLocaleString('vi-VN')} đ
                  </span>
                </div>
                <input 
                  type="range" 
                  className="form-range" 
                  min="500000" 
                  max="5000000" 
                  step="200000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                />
                <div className="d-flex justify-content-between text-secondary small">
                  <span>500.000 đ</span>
                  <span>5.000.000 đ</span>
                </div>
              </div>

              {/* 3. Lọc theo Hạng sao */}
              <div className="mb-4 pb-3 border-bottom">
                <label className="form-label fw-bold text-dark small text-uppercase mb-2">Hạng sao khách sạn</label>
                <div className="d-flex flex-column gap-2">
                  {[5, 4, 3].map(star => (
                    <div 
                      key={star} 
                      className="d-flex align-items-center gap-2 cursor-pointer"
                      onClick={() => toggleStar(star)}
                    >
                      {selectedStars.includes(star) ? (
                        <CheckSquare size={18} className="text-primary" />
                      ) : (
                        <Square size={18} className="text-secondary" />
                      )}
                      <div className="d-flex align-items-center gap-1 text-warning">
                        {Array.from({ length: star }).map((_, i) => (
                          <Star key={i} size={15} fill="#ffc107" />
                        ))}
                        <span className="text-dark small ms-1">({star} sao)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Lọc theo Tiện ích */}
              <div>
                <label className="form-label fw-bold text-dark small text-uppercase mb-2">Tiện ích phổ biến</label>
                <div className="d-flex flex-column gap-2">
                  {amenityOptions.map((amenity, idx) => (
                    <div 
                      key={idx} 
                      className="d-flex align-items-center gap-2 cursor-pointer small text-secondary"
                      onClick={() => toggleAmenity(amenity)}
                    >
                      {selectedAmenities.includes(amenity) ? (
                        <CheckSquare size={18} className="text-primary flex-shrink-0" />
                      ) : (
                        <Square size={18} className="text-secondary flex-shrink-0" />
                      )}
                      <span className={selectedAmenities.includes(amenity) ? "text-primary fw-semibold" : ""}>
                        {amenity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ================= CỘT PHẢI: DANH SÁCH KHÁCH SẠN ================= */}
          <div className="col-lg-9 col-md-8">
            {filteredHotels.length === 0 ? (
              <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white">
                <div className="p-4">
                  <h4 className="fw-bold mb-2">Không tìm thấy khách sạn phù hợp!</h4>
                  <p className="text-secondary mb-4">
                    Vui lòng thử điều chỉnh lại mức giá hoặc các tiêu chí bộ lọc bên trái.
                  </p>
                  <button onClick={handleResetFilters} className="btn btn-primary px-4 py-2">
                    Xóa tất cả bộ lọc
                  </button>
                </div>
              </div>
            ) : (
              <div className="d-flex flex-column gap-4">
                {filteredHotels.map((hotel) => (
                  <div key={hotel.id} className="card border-0 shadow-sm rounded-4 overflow-hidden hover-shadow bg-white">
                    <div className="row g-0">
                      {/* Ảnh khách sạn */}
                      <div className="col-lg-4 col-md-5 position-relative">
                        <img 
                          src={hotel.thumbnailUrl} 
                          className="w-100 h-100 object-fit-cover" 
                          alt={hotel.name}
                          style={{ minHeight: '240px', maxHeight: '280px' }}
                        />
                        <span className="position-absolute top-0 start-0 m-3 badge bg-primary px-3 py-1 rounded-pill">
                          📍 {hotel.city}
                        </span>
                      </div>

                      {/* Thông tin chi tiết */}
                      <div className="col-lg-8 col-md-7 p-4 d-flex flex-column justify-content-between">
                        <div>
                          <div className="d-flex justify-content-between align-items-start gap-2 mb-1">
                            <div>
                              <div className="d-flex align-items-center gap-1 text-warning mb-1">
                                {Array.from({ length: hotel.starRating }).map((_, idx) => (
                                  <Star key={idx} size={14} fill="#ffc107" />
                                ))}
                                <span className="text-secondary small ms-1">Khách sạn {hotel.starRating} sao</span>
                              </div>
                              <h4 className="fw-bold text-dark mb-1">{hotel.name}</h4>
                            </div>

                            {/* Điểm đánh giá */}
                            <div className="text-end flex-shrink-0">
                              <span className="badge bg-success text-white fs-6 px-2 py-1 rounded-3">
                                ★ {hotel.ratingScore}
                              </span>
                              <span className="d-block small text-secondary mt-1">{hotel.ratingText}</span>
                            </div>
                          </div>

                          <p className="text-secondary small mb-2 d-flex align-items-center gap-1">
                            <MapPin size={15} className="text-danger flex-shrink-0" />
                            <span>{hotel.address}</span>
                          </p>

                          <p className="text-secondary small line-clamp-2 mb-3">
                            {hotel.description}
                          </p>

                          {/* Tiện ích nổi bật */}
                          <div className="d-flex flex-wrap gap-1 mb-3">
                            {hotel.amenities.slice(0, 4).map((a, i) => (
                              <span key={i} className="badge bg-light text-dark border small">
                                {a}
                              </span>
                            ))}
                            {hotel.amenities.length > 4 && (
                              <span className="badge bg-light text-secondary border small">
                                +{hotel.amenities.length - 4}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Giá và nút xem phòng */}
                        <div className="d-flex justify-content-between align-items-end pt-3 border-top mt-2">
                          <div>
                            <span className="badge bg-danger-subtle text-danger mb-1">Tiết kiệm 20% hôm nay</span>
                            <div className="text-secondary small">
                              Giá gốc: <del>{hotel.rooms[0]?.originalPrice?.toLocaleString('vi-VN')} đ</del>
                            </div>
                            <div className="fs-4 fw-bold text-danger">
                              {hotel.rooms[0]?.pricePerNight.toLocaleString('vi-VN')} đ
                              <span className="text-secondary fs-6 fw-normal"> / đêm</span>
                            </div>
                          </div>

                          <Link 
                            to={`/hotels/${hotel.id}`} 
                            state={(() => {
                              try {
                                return JSON.parse(localStorage.getItem('traveloka_search_params')) || {};
                              } catch {
                                return {};
                              }
                            })()}
                            className="btn btn-primary px-4 py-2 fw-bold"
                          >
                            Xem phòng & Giá
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
