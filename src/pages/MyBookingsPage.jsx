import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../services/api';
import { 
  Luggage, Calendar, MapPin, BedDouble, ArrowRight, Eye, 
  XCircle, CheckCircle, Clock, AlertTriangle, RotateCcw, Building, Info, Sparkles, RefreshCw
} from 'lucide-react';
import { MOCK_HOTELS } from '../data/mockData';

export default function MyBookingsPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  // Helper chuẩn hóa dữ liệu đặt phòng từ Backend DTO hoặc LocalStorage
  const normalizeBooking = (b) => {
    const rawId = b.id;
    const bookingCode = b.bookingCode || (typeof rawId === 'number' ? `BK-${String(rawId).padStart(4, '0')}` : (b.bookingCode || rawId));
    let rawStatus = (b.status || 'PENDING').toUpperCase();
    const nights = b.nights || 1;
    const totalAmount = b.totalPrice != null ? Number(b.totalPrice) : (b.totalAmount || 0);
    const checkInDate = b.checkIn || b.checkInDate || '—';
    const checkOutDate = b.checkOut || b.checkOutDate || '—';
    const paymentMethod = (b.paymentMethod === 'VNPAY' || b.paymentMethod === 'vnpay') ? 'vnpay' : 'pay_at_hotel';
    let paymentStatus = (b.paymentStatus === 'PAID' || b.paymentStatus === 'paid' || b.paymentStatus === 'SUCCESS') ? 'paid' : 'pending';

    // 1. Khi đơn đã COMPLETED (trả phòng hoàn tất lưu trú) và là tiền mặt -> Bắt buộc thanh toán là 'paid'
    if (rawStatus === 'COMPLETED' && paymentMethod === 'pay_at_hotel') {
      paymentStatus = 'paid';
    }

    // 2. Chuyển khoản VNPay khi đã thanh toán thành công -> TỰ ĐỘNG DUYỆT ĐƠN (CONFIRMED), không cần admin duyệt
    if (paymentMethod === 'vnpay' && paymentStatus === 'paid' && rawStatus === 'PENDING') {
      rawStatus = 'CONFIRMED';
    }

    // 3. Xác định xem đơn có bị quá hạn nhận phòng hoặc trả phòng hay không
    const todayStr = new Date().toISOString().split('T')[0];
    let isPastCheckIn = false;
    let isPastCheckOut = false;
    if (checkInDate && checkInDate !== '—') {
      if (/^\d{4}-\d{2}-\d{2}$/.test(checkInDate)) {
        isPastCheckIn = checkInDate < todayStr;
      } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(checkInDate)) {
        const [dd, mm, yyyy] = checkInDate.split('/');
        isPastCheckIn = `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}` < todayStr;
      }
    }
    if (checkOutDate && checkOutDate !== '—') {
      if (/^\d{4}-\d{2}-\d{2}$/.test(checkOutDate)) {
        isPastCheckOut = checkOutDate < todayStr;
      } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(checkOutDate)) {
        const [dd, mm, yyyy] = checkOutDate.split('/');
        isPastCheckOut = `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}` < todayStr;
      }
    }

    // Các trường hợp Quá hạn (EXPIRED):
    // - PENDING mà checkIn < today
    // - CONFIRMED mà checkIn < today (No show)
    // - VNPay chưa thanh toán mà checkIn < today
    // - rawStatus === 'EXPIRED'
    const isExpired = (
      (rawStatus === 'PENDING' && isPastCheckIn) ||
      (rawStatus === 'CONFIRMED' && isPastCheckIn) ||
      (paymentMethod === 'vnpay' && paymentStatus !== 'paid' && isPastCheckIn) ||
      rawStatus === 'EXPIRED'
    );

    const isOverdueCheckout = (rawStatus === 'CHECKED_IN' && isPastCheckOut);

    // 4. Giới hạn thời gian 30 phút cho đơn chuyển khoản VNPay chưa thanh toán -> Tự động HỦY (CANCELLED)
    let isPaymentTimeout = false;
    if (paymentMethod === 'vnpay' && paymentStatus !== 'paid' && (rawStatus === 'PENDING' || rawStatus === 'pending')) {
      const createdStr = b.rawCreatedAt || b.createdAt;
      if (createdStr) {
        let createdDate = null;
        if (typeof createdStr === 'string' && createdStr.includes('/')) {
          const parts = createdStr.split(' ');
          const datePart = parts[0];
          const timePart = parts[1] || '00:00';
          const [dd, mm, yyyy] = datePart.split('/');
          createdDate = new Date(`${yyyy}-${mm}-${dd}T${timePart}`);
        } else {
          createdDate = new Date(createdStr);
        }
        if (createdDate && !isNaN(createdDate.getTime())) {
          const diffMinutes = (Date.now() - createdDate.getTime()) / (1000 * 60);
          if (diffMinutes > 30) {
            isPaymentTimeout = true;
          }
        }
      }
    }

    let finalRawStatus = rawStatus;
    if (isExpired) {
      finalRawStatus = 'EXPIRED';
    } else if (isPaymentTimeout) {
      finalRawStatus = 'CANCELLED';
    }
    const finalStatus = finalRawStatus.toLowerCase();

    return {
      id: bookingCode,
      backendId: typeof rawId === 'number' ? rawId : (b.backendBookingId || null),
      bookingCode,
      createdAt: b.createdAt || new Date().toLocaleDateString('vi-VN') + ' 09:30',
      hotelId: b.hotelId,
      hotelName: b.hotelName || 'Khách sạn',
      hotelCity: b.hotelCity || 'Việt Nam',
      hotelAddress: b.hotelAddress || b.hotelCity || '',
      hotelThumbnail: b.hotelImage || b.hotelThumbnail || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=60',
      roomId: b.roomId,
      roomName: b.roomName || 'Phòng nghỉ cao cấp',
      roomImage: b.roomImage || b.hotelImage || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&auto=format&fit=crop&q=60',
      roomBed: b.roomBedType || b.roomBed || '1 Giường King lớn',
      checkInDate,
      checkOutDate,
      nights,
      guestCount: b.guestCount || 2,
      contactName: b.userFullName || b.contactName || b.guestName || 'Khách hàng',
      guestName: b.userFullName || b.guestName || b.contactName || 'Khách hàng',
      contactEmail: b.userEmail || b.contactEmail || '',
      contactPhone: b.userPhone || b.contactPhone || '',
      specialRequests: Array.isArray(b.specialRequests) ? b.specialRequests : (b.specialRequests ? [b.specialRequests] : []),
      paymentMethod,
      paymentStatus,
      totalAmount,
      status: finalStatus,
      rawStatus: finalRawStatus,
      isExpired,
      isOverdueCheckout,
      isPaymentTimeout,
      isGuest: b.isGuest || false,
      raw: b
    };
  };

  // State danh sách đơn đặt phòng
  const [bookings, setBookings] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('traveloka_bookings') || '[]');
      return Array.isArray(saved) ? saved.map(normalizeBooking) : [];
    } catch {
      return [];
    }
  });
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'pending', 'confirmed', 'checked_in', 'completed', 'cancelled'
  const [cancellingBookingId, setCancellingBookingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  // Tải danh sách đơn đặt phòng từ Backend và LocalStorage
  const loadBookings = async () => {
    try {
      const saved = JSON.parse(localStorage.getItem('traveloka_bookings') || '[]');
      if (Array.isArray(saved) && saved.length > 0) {
        setBookings(saved.map(normalizeBooking));
      }
    } catch (e) {
      console.error('Lỗi khi đọc danh sách đặt phòng localStorage:', e);
    }

    if (isAuthenticated) {
      try {
        setLoading(true);
        const res = await apiFetch('/customer/bookings/my-bookings');
        if (res.ok) {
          const data = await res.json();
          if (data && data.result && Array.isArray(data.result)) {
            const mapped = data.result.map(normalizeBooking);
            setBookings(mapped);
            localStorage.setItem('traveloka_bookings', JSON.stringify(mapped));
          }
        }
      } catch (e) {
        console.warn('API my-bookings fallback to local storage:', e);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadBookings();
  }, [isAuthenticated]);

  // Tạo đơn mẫu để trải nghiệm nhanh nếu chưa có đơn
  const handleSeedDemoBooking = () => {
    const demoBooking = normalizeBooking({
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
      status: 'CONFIRMED'
    });

    const updated = [demoBooking, ...bookings];
    localStorage.setItem('traveloka_bookings', JSON.stringify(updated));
    setBookings(updated);
  };

  // Xử lý xác nhận hủy đặt phòng
  const handleConfirmCancel = async (bookingItem) => {
    try {
      setIsCancelling(true);
      if (bookingItem.backendId) {
        const res = await apiFetch(`/customer/bookings/${bookingItem.backendId}/cancel`, {
          method: 'PUT',
          body: JSON.stringify({ reason: 'Khách hàng tự hủy trên website' })
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          alert(errData.message || 'Không thể hủy đơn đặt phòng vào thời điểm này.');
          setIsCancelling(false);
          return;
        }
      }

      const updated = bookings.map(b => {
        if (b.id === bookingItem.id || (bookingItem.backendId && b.backendId === bookingItem.backendId)) {
          return { ...b, status: 'cancelled', rawStatus: 'CANCELLED' };
        }
        return b;
      });

      localStorage.setItem('traveloka_bookings', JSON.stringify(updated));
      setBookings(updated);
      setCancellingBookingId(null);
    } catch (err) {
      console.error('Lỗi khi hủy đơn:', err);
      alert('Có lỗi xảy ra khi hủy đơn đặt phòng. Vui lòng thử lại sau.');
    } finally {
      setIsCancelling(false);
    }
  };

  // Xóa toàn bộ lịch sử (Reset demo)
  const handleClearAll = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử đặt phòng đã lưu không?')) {
      localStorage.removeItem('traveloka_bookings');
      setBookings([]);
    }
  };

  // Lọc theo Tab: Đơn đã hoàn thành tự động biến mất khỏi danh mục "Tất cả" và chuyển qua mục "Hoàn thành"
  const filteredBookings = bookings.filter(b => {
    const rawS = (b.rawStatus || b.status || '').toUpperCase();
    if (activeTab === 'all') {
      return rawS !== 'COMPLETED';
    }
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
            <button 
              onClick={loadBookings} 
              disabled={loading}
              className="btn btn-outline-secondary btn-sm rounded-pill fw-semibold px-3 d-inline-flex align-items-center gap-1"
              title="Làm mới dữ liệu từ máy chủ"
            >
              <RefreshCw size={14} className={loading ? 'spin' : ''} />
              {loading ? 'Đang tải...' : 'Làm mới'}
            </button>

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

        {/* Banner trạng thái đồng bộ: Khách vãng lai vs Thành viên */}
        {!isAuthenticated ? (
          <div className="alert alert-info border-0 shadow-sm rounded-4 p-3 mb-4 d-flex align-items-center justify-content-between flex-wrap gap-3 bg-info-subtle text-dark">
            <div className="d-flex align-items-center gap-2 small">
              <Info size={20} className="text-info flex-shrink-0" />
              <span>
                Bạn chưa đăng nhập. Vui lòng đăng nhập để hệ thống tự động lưu trữ và đồng bộ hóa các đơn đặt phòng của bạn.
              </span>
            </div>
            <Link 
              to="/login" 
              className="btn btn-primary btn-sm rounded-pill px-3 py-1 fw-bold shadow-sm" 
              style={{ fontSize: '12.5px' }}
            >
              Đăng nhập để đồng bộ tài khoản
            </Link>
          </div>
        ) : (
          <div className="alert alert-success border-0 shadow-sm rounded-4 p-3 mb-4 d-flex align-items-center justify-content-between flex-wrap gap-3 bg-success-subtle text-dark">
            <div className="d-flex align-items-center gap-2 small">
              <CheckCircle size={20} className="text-success flex-shrink-0" />
              <span>
                Đang hiển thị các chuyến đi của tài khoản <strong>{user?.name || user?.fullName}</strong> ({user?.email}).
              </span>
            </div>
            <span className="badge bg-success text-white px-3 py-1 rounded-pill small">✓ Đã đồng bộ tài khoản</span>
          </div>
        )}

        {/* Tabs chuyển đổi trạng thái */}
        {bookings.length > 0 && (
          <div className="card border-0 shadow-sm rounded-4 p-2 bg-white mb-4">
            <div className="d-flex gap-2 flex-wrap">
              {[
                { key: 'all', label: 'Tất cả chuyến đi', count: bookings.filter(b => (b.rawStatus || b.status || '').toUpperCase() !== 'COMPLETED').length },
                { key: 'pending', label: '⏳ Chờ duyệt', count: bookings.filter(b => b.status === 'pending').length },
                { key: 'expired', label: '⚠️ Đã quá hạn', count: bookings.filter(b => b.status === 'expired').length },
                { key: 'confirmed', label: '✓ Đã xác nhận', count: bookings.filter(b => b.status === 'confirmed').length },
                { key: 'checked_in', label: '🏨 Đã nhận phòng', count: bookings.filter(b => b.status === 'checked_in').length },
                { key: 'completed', label: '✓ Hoàn thành', count: bookings.filter(b => b.status === 'completed' || (b.rawStatus || '').toUpperCase() === 'COMPLETED').length },
                { key: 'cancelled', label: '✕ Đã hủy', count: bookings.filter(b => b.status === 'cancelled').length },
              ].map(tab => (
                <button 
                  key={tab.key}
                  className={`btn btn-sm rounded-pill px-3 fw-semibold ${activeTab === tab.key ? 'btn-primary' : 'btn-light text-secondary'}`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
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
                    <strong className="text-primary font-monospace fs-6">{b.bookingCode || b.id}</strong>
                    <span className="text-secondary">•</span>
                    <span className="small text-secondary">Đặt ngày: {b.createdAt}</span>
                  </div>

                  <div className="d-flex align-items-center gap-2">
                    <span className={`badge px-2 py-1 rounded-pill small ${b.paymentStatus === 'paid' ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-secondary-subtle text-secondary border'}`}>
                      {b.paymentMethod === 'vnpay' ? '💳 VNPay' : '💵 Tiền mặt tại KS'} • {b.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                    </span>

                    {b.status === 'pending' && (
                      <span className="badge bg-warning-subtle text-warning-emphasis px-3 py-2 rounded-pill fw-semibold d-inline-flex align-items-center gap-1 border border-warning-subtle">
                        <Clock size={14} /> {b.paymentMethod === 'vnpay' ? 'Chờ Chuyển Khoản (30p)' : 'Chờ Duyệt'}
                      </span>
                    )}
                    {b.status === 'expired' && (
                      <span className="badge bg-warning-subtle text-warning-emphasis px-3 py-2 rounded-pill fw-semibold d-inline-flex align-items-center gap-1 border border-warning-subtle">
                        <AlertTriangle size={14} /> Đã Quá Hạn
                      </span>
                    )}
                    {b.status === 'confirmed' && (
                      <span className="badge bg-success-subtle text-success px-3 py-2 rounded-pill fw-semibold d-inline-flex align-items-center gap-1 border border-success-subtle">
                        <CheckCircle size={14} /> Đã Xác Nhận
                      </span>
                    )}
                    {b.status === 'checked_in' && (
                      <span className="badge bg-info-subtle text-info px-3 py-2 rounded-pill fw-semibold d-inline-flex align-items-center gap-1 border border-info-subtle">
                        <Building size={14} /> Đã Nhận Phòng
                      </span>
                    )}
                    {b.status === 'completed' && (
                      <span className="badge bg-secondary-subtle text-secondary px-3 py-2 rounded-pill fw-semibold d-inline-flex align-items-center gap-1 border">
                        <CheckCircle size={14} /> Hoàn Thành
                      </span>
                    )}
                    {b.status === 'cancelled' && (
                      <span className="badge bg-danger-subtle text-danger px-3 py-2 rounded-pill fw-semibold d-inline-flex align-items-center gap-1 border border-danger-subtle">
                        <XCircle size={14} /> {b.isPaymentTimeout ? 'Đã Hủy (Hết hạn TT 30p)' : 'Đã Hủy'}
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

                        {/* Nút hủy phòng (chỉ cho phép khi đang chờ duyệt hoặc đã xác nhận và chưa quá hạn) */}
                        {!b.isExpired && (b.status === 'confirmed' || b.status === 'pending') && (
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
                      <span>Bạn có chắc chắn muốn hủy đơn đặt phòng {b.bookingCode || b.id}? Thao tác này sẽ gửi yêu cầu hủy đơn đến hệ thống.</span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <button 
                        onClick={() => handleConfirmCancel(b)} 
                        disabled={isCancelling}
                        className="btn btn-danger btn-sm fw-bold px-3 rounded-pill"
                      >
                        {isCancelling ? 'Đang hủy...' : 'Xác nhận hủy'}
                      </button>
                      <button 
                        onClick={() => setCancellingBookingId(null)} 
                        disabled={isCancelling}
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
