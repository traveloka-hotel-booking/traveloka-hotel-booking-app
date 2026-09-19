import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Luggage, Calendar, MapPin, BedDouble, ArrowRight, Eye, 
  XCircle, CheckCircle, Clock, AlertTriangle, RotateCcw, Building
} from 'lucide-react';
import { MOCK_HOTELS } from '../data/mockData';

export default function MyBookingsPage() {
  const navigate = useNavigate();

  // State danh sách đơn đặt phòng từ localStorage
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'confirmed', 'completed', 'cancelled'
  const [cancellingBookingId, setCancellingBookingId] = useState(null);

  // Đọc danh sách từ localStorage khi mount
  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = () => {
    try {
      const saved = JSON.parse(localStorage.getItem('traveloka_bookings') || '[]');
      setBookings(saved);
    } catch (e) {
      console.error('Lỗi khi đọc danh sách đặt phòng:', e);
      setBookings([]);
    }
  };

  // Tạo đơn mẫu để trải nghiệm nhanh nếu chưa có đơn
  const handleSeedDemoBooking = () => {
    const demoBooking = {
      id: `TVLK-${Math.floor(100000 + Math.random() * 900000)}`,
      createdAt: new Date().toLocaleDateString('vi-VN') + ' 09:30',
      hotelId: MOCK_HOTELS[1].id,
      hotelName: MOCK_HOTELS[1].name,
      hotelCity: MOCK_HOTELS[1].city,
      hotelAddress: MOCK_HOTELS[1].address,
      hotelThumbnail: MOCK_HOTELS[1].thumbnailUrl,
      roomId: MOCK_HOTELS[1].rooms[0].id,
      roomName: MOCK_HOTELS[1].rooms[0].name,
      roomImage: MOCK_HOTELS[1].rooms[0].imageUrl,
      roomBed: MOCK_HOTELS[1].rooms[0].bedType,
      checkInDate: '2026-10-15',
      checkOutDate: '2026-10-17',
      nights: 2,
      guestCount: 4,
      contactName: 'Nguyễn Văn A',
      guestName: 'Nguyễn Văn A',
      contactEmail: 'nguyenvana@gmail.com',
      contactPhone: '0912 345 678',
      specialRequests: ['Phòng ở tầng cao', 'Phòng không hút thuốc'],
      paymentMethod: 'vnpay',
      totalAmount: 7700000,
      status: 'confirmed',
      freeCancellation: true
    };

    const updated = [demoBooking, ...bookings];
    localStorage.setItem('traveloka_bookings', JSON.stringify(updated));
    setBookings(updated);
  };

  // Xử lý xác nhận hủy đặt phòng
  const handleConfirmCancel = (id) => {
    const updated = bookings.map(b => {
      if (b.id === id) {
        return { ...b, status: 'cancelled' };
      }
      return b;
    });

    localStorage.setItem('traveloka_bookings', JSON.stringify(updated));
    setBookings(updated);
    setCancellingBookingId(null);
  };

  // Xóa toàn bộ lịch sử (Reset demo)
  const handleClearAll = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử đặt phòng đã lưu không?')) {
      localStorage.removeItem('traveloka_bookings');
      setBookings([]);
    }
  };

  // Lọc theo Tab
  const filteredBookings = bookings.filter(b => {
    if (activeTab === 'all') return true;
    return b.status === activeTab;
  });

  return (
    <div className="bg-light pb-5 min-vh-100 page-top-spacing">
      <div className="container">
        
        {/* Header trang */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
          <div>
            <h2 className="fw-bold text-dark mb-1">Chuyến Đi Của Tôi</h2>
            <p className="text-secondary mb-0">
              Quản lý các đơn đặt phòng, theo dõi lịch trình và xem vé điện tử E-voucher của bạn.
            </p>
          </div>

          <div className="d-flex align-items-center gap-2">
            {bookings.length === 0 ? (
              <button 
                onClick={handleSeedDemoBooking} 
                className="btn btn-outline-primary btn-sm rounded-pill fw-semibold px-3"
              >
                + Thêm đơn mẫu trải nghiệm
              </button>
            ) : (
              <button 
                onClick={handleClearAll} 
                className="btn btn-outline-danger btn-sm rounded-pill px-3"
              >
                Xóa lịch sử
              </button>
            )}

            <Link to="/hotels" className="btn btn-primary btn-sm rounded-pill fw-semibold px-3">
              Đặt thêm phòng mới
            </Link>
          </div>
        </div>

        {/* Tabs chuyển đổi trạng thái */}
        {bookings.length > 0 && (
          <div className="card border-0 shadow-sm rounded-4 p-2 bg-white mb-4">
            <div className="d-flex gap-2 flex-wrap">
              <button 
                className={`btn btn-sm rounded-pill px-3 fw-semibold ${activeTab === 'all' ? 'btn-primary' : 'btn-light text-secondary'}`}
                onClick={() => setActiveTab('all')}
              >
                Tất cả ({bookings.length})
              </button>
              <button 
                className={`btn btn-sm rounded-pill px-3 fw-semibold ${activeTab === 'confirmed' ? 'btn-primary' : 'btn-light text-secondary'}`}
                onClick={() => setActiveTab('confirmed')}
              >
                Đã xác nhận ({bookings.filter(b => b.status === 'confirmed').length})
              </button>
              <button 
                className={`btn btn-sm rounded-pill px-3 fw-semibold ${activeTab === 'cancelled' ? 'btn-primary' : 'btn-light text-secondary'}`}
                onClick={() => setActiveTab('cancelled')}
              >
                Đã hủy ({bookings.filter(b => b.status === 'cancelled').length})
              </button>
            </div>
          </div>
        )}

        {/* NỘI DUNG: EMPTY STATE HOẶC DANH SÁCH ĐƠN */}
        {filteredBookings.length === 0 ? (
          <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white my-4">
            <div className="p-4 mx-auto" style={{ maxWidth: '500px' }}>
              <div className="d-inline-flex p-3 bg-light rounded-circle mb-3 text-primary">
                <Luggage size={54} />
              </div>
              <h4 className="fw-bold text-dark mb-2">Chưa có đơn đặt phòng nào</h4>
              <p className="text-secondary mb-4">
                {bookings.length === 0 
                  ? "Bạn chưa có kỳ nghỉ nào sắp tới. Hãy khám phá hàng ngàn khách sạn và resort sang trọng với mức giá ưu đãi nhất trên Traveloka!"
                  : "Không có đơn đặt phòng nào phù hợp với bộ lọc trạng thái đã chọn."}
              </p>

              <div className="d-flex justify-content-center gap-2">
                <Link to="/hotels" className="btn btn-primary px-4 py-2 fw-semibold rounded-pill">
                  Tìm khách sạn ngay
                </Link>
                {bookings.length === 0 && (
                  <button 
                    onClick={handleSeedDemoBooking} 
                    className="btn btn-outline-secondary px-4 py-2 rounded-pill"
                  >
                    Tạo đơn mẫu
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="d-flex flex-column gap-4">
            {filteredBookings.map((b) => (
              <div key={b.id} className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white hover-shadow transition-all">
                
                {/* Header đơn: Mã đặt phòng, ngày tạo, trạng thái */}
                <div className="p-3 px-4 bg-light border-bottom d-flex flex-wrap justify-content-between align-items-center gap-2">
                  <div className="d-flex align-items-center gap-2 flex-wrap">
                    <span className="small text-secondary">Mã đặt phòng:</span>
                    <strong className="text-primary font-monospace fs-6">{b.id}</strong>
                    <span className="text-secondary">•</span>
                    <span className="small text-secondary">Đặt ngày: {b.createdAt}</span>
                  </div>

                  <div>
                    {b.status === 'confirmed' && (
                      <span className="badge bg-success-subtle text-success px-3 py-2 rounded-pill fw-semibold d-inline-flex align-items-center gap-1">
                        <CheckCircle size={14} /> Đã Xác Nhận
                      </span>
                    )}
                    {b.status === 'cancelled' && (
                      <span className="badge bg-danger-subtle text-danger px-3 py-2 rounded-pill fw-semibold d-inline-flex align-items-center gap-1">
                        <XCircle size={14} /> Đã Hủy
                      </span>
                    )}
                  </div>
                </div>

                {/* Nội dung chi tiết đơn */}
                <div className="p-4">
                  <div className="row g-4 align-items-center">
                    
                    {/* Cột ảnh khách sạn */}
                    <div className="col-lg-3 col-md-4">
                      <img 
                        src={b.hotelThumbnail || b.roomImage} 
                        alt={b.hotelName} 
                        className="w-100 rounded-3 object-fit-cover shadow-sm"
                        style={{ height: '160px' }}
                      />
                    </div>

                    {/* Cột thông tin khách sạn & phòng */}
                    <div className="col-lg-6 col-md-5">
                      <h5 className="fw-bold text-dark mb-1">{b.hotelName}</h5>
                      <p className="text-secondary small mb-2 d-flex align-items-center gap-1">
                        <MapPin size={15} className="text-danger flex-shrink-0" />
                        <span>{b.hotelAddress || b.hotelCity}</span>
                      </p>

                      <div className="p-2 bg-light rounded-2 small text-dark mb-2">
                        <div className="fw-semibold text-primary">{b.roomName}</div>
                        <div className="text-secondary" style={{ fontSize: '12px' }}>{b.roomBed}</div>
                      </div>

                      <div className="d-flex flex-wrap gap-3 small text-secondary">
                        <div className="d-flex align-items-center gap-1">
                          <Calendar size={14} className="text-primary" />
                          <span>{b.checkInDate} ➔ {b.checkOutDate}</span>
                        </div>
                        <span className="badge bg-primary-subtle text-primary">{b.nights} đêm</span>
                      </div>
                    </div>

                    {/* Cột giá & nút hành động */}
                    <div className="col-lg-3 col-md-3 text-lg-end text-start border-start-lg pt-3 pt-lg-0">
                      <span className="text-secondary small d-block">Tổng chi phí:</span>
                      <div className="fs-4 fw-bold text-danger mb-3">
                        {b.totalAmount?.toLocaleString('vi-VN')} đ
                      </div>

                      <div className="d-flex flex-column gap-2">
                        {/* Nút xem vé điện tử */}
                        <button 
                          onClick={() => navigate('/booking-success', { state: { booking: b } })}
                          className="btn btn-outline-primary btn-sm fw-semibold d-inline-flex align-items-center justify-content-center gap-1 rounded-pill"
                        >
                          <Eye size={15} /> Xem vé điện tử
                        </button>

                        {/* Nút hủy phòng */}
                        {b.status === 'confirmed' && (
                          <button 
                            onClick={() => setCancellingBookingId(b.id)} 
                            className="btn btn-link text-danger text-decoration-none btn-sm"
                          >
                            Hủy đặt phòng này
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                </div>

                {/* Hộp thoại xác nhận hủy phòng inline */}
                {cancellingBookingId === b.id && (
                  <div className="p-3 bg-danger-subtle border-top text-danger d-flex flex-wrap align-items-center justify-content-between gap-2">
                    <div className="d-flex align-items-center gap-2 small fw-semibold">
                      <AlertTriangle size={18} />
                      <span>Bạn có chắc chắn muốn hủy đơn đặt phòng {b.id}? Thao tác này sẽ cập nhật trạng thái đơn thành Đã Hủy.</span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <button 
                        onClick={() => handleConfirmCancel(b.id)} 
                        className="btn btn-danger btn-sm fw-bold px-3 rounded-pill"
                      >
                        Xác nhận hủy
                      </button>
                      <button 
                        onClick={() => setCancellingBookingId(null)} 
                        className="btn btn-secondary btn-sm px-3 rounded-pill"
                      >
                        Đóng
                      </button>
                    </div>
                  </div>
                )}

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
