import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MOCK_HOTELS, getHotelsData } from '../data/mockData';
import { filterHotelsApi, searchHotelsApi } from '../services/hotelApi';
import { 
  Search, MapPin, Star, Filter, RotateCcw, 
  Wifi, Waves, Coffee, Car, Dumbbell, Sparkles, CheckSquare, Square,
  Loader2, ChevronLeft, ChevronRight
} from 'lucide-react';

export default function HotelsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const cityParam = searchParams.get('city') || '';
  const checkInParam = searchParams.get('checkIn') || '';
  const checkOutParam = searchParams.get('checkOut') || '';
  const guestsParam = searchParams.get('guests') || '';

  // State các bộ lọc
  const [selectedCity, setSelectedCity] = useState(cityParam);
  const [selectedStars, setSelectedStars] = useState([]);
  const [maxPrice, setMaxPrice] = useState(5000000);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [sortBy, setSortBy] = useState('popular'); // popular, priceAsc, priceDesc, ratingDesc

  // State dữ liệu từ Backend API (FR-06 & FR-07)
  const [backendHotels, setBackendHotels] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Cập nhật city khi URL thay đổi
  useEffect(() => {
    setSelectedCity(cityParam);
  }, [cityParam]);

  // Gọi API FR-06 / FR-07 từ backend
  const loadHotels = useCallback(async () => {
    setLoading(true);
    try {
      let data;
      // Nếu có checkIn và checkOut -> gọi FR-06 Search
      if (checkInParam && checkOutParam) {
        data = await searchHotelsApi({
          city: selectedCity && selectedCity !== 'Tất cả' ? selectedCity : '',
          checkIn: checkInParam,
          checkOut: checkOutParam,
          guests: guestsParam ? Number(guestsParam) : 2,
          page,
          size
        });
      } else {
        // Ngược lại gọi FR-07 Filter
        const minStar = selectedStars.length > 0 ? Math.min(...selectedStars) : null;
        const maxStar = selectedStars.length > 0 ? Math.max(...selectedStars) : null;
        data = await filterHotelsApi({
          city: selectedCity && selectedCity !== 'Tất cả' ? selectedCity : '',
          minStar,
          maxStar,
          amenities: selectedAmenities,
          page,
          size
        });
      }

      const list = Array.isArray(data?.content) ? data.content : (Array.isArray(data) ? data : []);
      setBackendHotels(list);
      setTotalElements(Number(data?.totalElements ?? list.length));
      setTotalPages(Number(data?.totalPages ?? 1));
    } catch (err) {
      console.warn('FR-06/FR-07 API call error, falling back to local data:', err);
      setBackendHotels(null);
    } finally {
      setLoading(false);
    }
  }, [selectedCity, selectedStars, selectedAmenities, checkInParam, checkOutParam, guestsParam, page, size]);

  useEffect(() => {
    loadHotels();
  }, [loadHotels]);

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
    setSelectedStars(prev => {
      const next = prev.includes(star) ? prev.filter(s => s !== star) : [...prev, star];
      setPage(0);
      return next;
    });
  };

  // Xử lý bật/tắt tiện ích
  const toggleAmenity = (amenity) => {
    setSelectedAmenities(prev => {
      const next = prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity];
      setPage(0);
      return next;
    });
  };

  // Xóa toàn bộ bộ lọc
  const handleResetFilters = () => {
    setSelectedCity('');
    setSelectedStars([]);
    setMaxPrice(5000000);
    setSelectedAmenities([]);
    setSortBy('popular');
    setPage(0);
    setSearchParams({});
  };

  // Lọc và sắp xếp dữ liệu (Ưu tiên dữ liệu từ Backend API, fallback sang MockData khi API offline)
  const filteredHotels = useMemo(() => {
    const isUsingBackend = backendHotels !== null && Array.isArray(backendHotels);
    const sourceHotels = isUsingBackend ? backendHotels : getHotelsData();

    return sourceHotels.filter(hotel => {
      // 1. Lọc theo thành phố (nếu dùng mock fallback)
      if (!isUsingBackend && selectedCity && selectedCity !== "Tất cả") {
        if (!hotel.city?.toLowerCase().includes(selectedCity.toLowerCase())) {
          return false;
        }
      }

      // 2. Lọc theo số sao (nếu dùng mock fallback)
      if (!isUsingBackend && selectedStars.length > 0 && !selectedStars.includes(hotel.starRating)) {
        return false;
      }

      // 3. Lọc theo giá tối đa (lấy giá phòng thấp nhất của khách sạn)
      const minHotelPrice = hotel.minPricePerNight ?? hotel.rooms?.[0]?.pricePerNight ?? 0;
      if (minHotelPrice > maxPrice) {
        return false;
      }

      // 4. Lọc theo tiện ích (nếu dùng mock fallback)
      if (!isUsingBackend && selectedAmenities.length > 0) {
        const hotelAmenities = Array.isArray(hotel.amenities)
          ? hotel.amenities
          : (typeof hotel.amenities === 'string' ? hotel.amenities.split(',').map(s => s.trim()) : []);
        const hasAmenity = selectedAmenities.some(a => 
          hotelAmenities.some(item => item.toLowerCase().includes(a.toLowerCase()))
        );
        if (!hasAmenity) return false;
      }

      return true;
    }).sort((a, b) => {
      const priceA = a.minPricePerNight ?? a.rooms?.[0]?.pricePerNight ?? 0;
      const priceB = b.minPricePerNight ?? b.rooms?.[0]?.pricePerNight ?? 0;

      if (sortBy === 'priceAsc') return priceA - priceB;
      if (sortBy === 'priceDesc') return priceB - priceA;
      if (sortBy === 'ratingDesc') return (b.ratingScore || 8.5) - (a.ratingScore || 8.5);
      return 0; // popular
    });
  }, [backendHotels, selectedCity, selectedStars, maxPrice, selectedAmenities, sortBy]);

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
            {loading ? (
              <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white">
                <div className="d-flex align-items-center justify-content-center gap-2 text-primary py-4">
                  <div className="spinner-border spinner-border-sm" role="status"></div>
                  <span className="fw-semibold">Đang tải...</span>
                </div>
              </div>
            ) : filteredHotels.length === 0 ? (
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
                          {(() => {
                            const ams = Array.isArray(hotel.amenities)
                              ? hotel.amenities
                              : (typeof hotel.amenities === 'string' ? hotel.amenities.split(',').map(s => s.trim()).filter(Boolean) : []);
                            return (
                              <div className="d-flex flex-wrap gap-1 mb-3">
                                {ams.slice(0, 4).map((a, i) => (
                                  <span key={i} className="badge bg-light text-dark border small">
                                    {a}
                                  </span>
                                ))}
                                {ams.length > 4 && (
                                  <span className="badge bg-light text-secondary border small">
                                    +{ams.length - 4}
                                  </span>
                                )}
                              </div>
                            );
                          })()}
                        </div>

                        {/* Giá và nút xem phòng */}
                        <div className="d-flex justify-content-between align-items-end pt-3 border-top mt-2">
                          <div>
                            <span className="badge bg-danger-subtle text-danger mb-1">Tiết kiệm 20% hôm nay</span>
                            <div className="text-secondary small">
                              Giá gốc: <del>{Math.round((hotel.minPricePerNight ?? hotel.rooms?.[0]?.originalPrice ?? 1500000) * 1.25).toLocaleString('vi-VN')} đ</del>
                            </div>
                            <div className="fs-4 fw-bold text-danger">
                              {(hotel.minPricePerNight ?? hotel.rooms?.[0]?.pricePerNight ?? 1200000).toLocaleString('vi-VN')} đ
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

                {/* Thanh phân trang kết quả từ Backend API */}
                {totalPages > 1 && (
                  <div className="d-flex justify-content-between align-items-center mt-3 p-3 bg-white rounded-3 shadow-sm border flex-wrap gap-2">
                    <span className="small text-secondary">
                      Hiển thị <strong>{page * size + 1}</strong> – <strong>{Math.min((page + 1) * size, totalElements)}</strong> trên <strong>{totalElements}</strong> khách sạn
                    </span>
                    <div className="d-flex align-items-center gap-2">
                      <button 
                        type="button" 
                        onClick={() => setPage(p => Math.max(0, p - 1))} 
                        disabled={page <= 0 || loading} 
                        className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
                      >
                        <ChevronLeft size={16} /> Trước
                      </button>
                      <span className="small px-2 text-dark fw-semibold">
                        Trang {page + 1} / {totalPages}
                      </span>
                      <button 
                        type="button" 
                        onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} 
                        disabled={page + 1 >= totalPages || loading} 
                        className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
                      >
                        Sau <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
