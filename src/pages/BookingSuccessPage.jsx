import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../services/api';
import { 
  CheckCircle, Copy, Check, Printer, ArrowRight, Home, 
  MapPin, Calendar, Users, BedDouble, Phone, Mail, ShieldCheck, QrCode, Sparkles, UserPlus
} from 'lucide-react';
export default function BookingSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState(null);
  const hasFetchedProfileRef = useRef(false);

  // Tự động tải profile mới nhất để đồng bộ thông tin khách hàng nếu đơn còn thiếu
  useEffect(() => {
    if (!isAuthenticated || hasFetchedProfileRef.current) return;
    hasFetchedProfileRef.current = true;

    const fetchProfile = async () => {
      try {
        const response = await apiFetch('/customer/profile');
        if (response.ok) {
          const resData = await response.json();
          const p = resData?.result || resData;
          if (p) setProfile(p);
        }
      } catch (err) {
        console.warn('Lỗi lấy profile tại BookingSuccessPage:', err);
      }
    };
    fetchProfile();
  }, [isAuthenticated]);

  // Đọc dữ liệu booking từ state chuyển trang, hoặc lấy đơn gần nhất từ localStorage
  const getInitialBooking = () => {
    if (location.state?.booking) return location.state.booking;
    try {
      const saved = JSON.parse(localStorage.getItem('traveloka_bookings') || '[]');
      if (saved.length > 0) return saved[0];
    } catch (e) {
      console.error(e);
    }
    return {
      id: 'TVLK-BOOKED',
      createdAt: new Date().toLocaleDateString('vi-VN'),
      hotelName: 'Khách sạn của bạn',
      hotelCity: 'Việt Nam',
      hotelAddress: 'Địa chỉ khách sạn',
      hotelThumbnail: '',
      roomName: 'Phòng đã đặt',
      roomBed: '1 Giường đôi lớn',
      checkInDate: '—',
      checkOutDate: '—',
      nights: 1,
      guestCount: 2,
      contactName: user?.fullName || user?.name || 'Khách hàng',
      guestName: user?.fullName || user?.name || 'Khách hàng',
      contactEmail: user?.email || '',
      contactPhone: user?.phone || '',
      specialRequests: [],
      paymentMethod: 'vnpay',
      totalAmount: 0,
      status: 'confirmed'
    };
  };

  const booking = getInitialBooking();

  // Đồng bộ thông tin khách hàng từ nhiều nguồn (booking, profile mới nhất, auth context)
  const customerName = 
    (booking.customerName && booking.customerName !== 'Khách hàng' ? booking.customerName : null) ||
    (booking.guestName && booking.guestName !== 'Khách hàng' ? booking.guestName : null) ||
    (booking.contactName && booking.contactName !== 'Khách hàng' ? booking.contactName : null) ||
    (booking.userFullName && booking.userFullName !== 'Khách hàng' ? booking.userFullName : null) ||
    profile?.fullName || profile?.name ||
    user?.fullName || user?.name ||
    'Khách hàng';

  const customerPhone = 
    booking.customerPhone || 
    booking.contactPhone || 
    booking.userPhone || 
    profile?.phone || 
    user?.phone || 
    '';

  const customerEmail = 
    booking.customerEmail || 
    booking.contactEmail || 
    booking.userEmail || 
    profile?.email || 
    user?.email || 
    '';

  // Tự động lưu thông tin khách hàng đã đồng bộ vào localStorage
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('traveloka_bookings') || '[]');
      if (saved.length > 0) {
        let changed = false;
        const updated = saved.map((b, idx) => {
          if (idx === 0 || b.id === booking.id || (b.backendBookingId && b.backendBookingId === booking.backendBookingId)) {
            const needName = !b.contactName || b.contactName === 'Khách hàng';
            const needEmail = !b.contactEmail;
            const needPhone = !b.contactPhone;
            if ((needName && customerName !== 'Khách hàng') || (needEmail && customerEmail) || (needPhone && customerPhone)) {
              changed = true;
              return {
                ...b,
                contactName: (needName && customerName !== 'Khách hàng') ? customerName : b.contactName,
                guestName: (needName && customerName !== 'Khách hàng') ? customerName : b.guestName,
                contactEmail: (needEmail && customerEmail) ? customerEmail : b.contactEmail,
                contactPhone: (needPhone && customerPhone) ? customerPhone : b.contactPhone
              };
            }
          }
          return b;
        });
        if (changed) {
          localStorage.setItem('traveloka_bookings', JSON.stringify(updated));
        }
      }
    } catch (_) {}
  }, [customerName, customerPhone, customerEmail, booking.id, booking.backendBookingId]);

  // State sao chép mã booking
  const [copied, setCopied] = useState(false);
  const handleCopyCode = () => {
    navigator.clipboard?.writeText(booking.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Tên phương thức thanh toán dạng chữ dễ đọc
  const getPaymentMethodLabel = (method) => {
    switch (method) {
      case 'vnpay': return 'Cổng VNPAY QR (Đã thanh toán)';
      case 'card': return 'Thẻ Quốc Tế Visa/Mastercard (Đã thanh toán)';
      case 'momo': return 'Ví MoMo / ZaloPay (Đã thanh toán)';
      case 'pay_at_hotel': return 'Thanh toán tiền mặt/thẻ tại quầy lễ tân khi nhận phòng';
      default: return 'Trực tuyến qua Traveloka Pay';
    }
  };

  return (
    <div className="bg-light pb-5 min-vh-100 page-top-spacing">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-9 col-md-11">

            {/* Banner chúc mừng thành công */}
            <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 text-center bg-white mb-4">
              <div className="mb-3 d-inline-flex p-3 bg-success-subtle text-success rounded-circle">
                <CheckCircle size={56} className="text-success" />
              </div>

              <h2 className="fw-bold text-dark mb-2">Đặt Phòng Thành Công!</h2>
              <p className="text-secondary mb-4 mx-auto" style={{ maxWidth: '600px' }}>
                Cảm ơn bạn đã lựa chọn Traveloka! Đơn đặt phòng của bạn đã được xác nhận. Chúng tôi đã gửi email xác nhận và vé điện tử chi tiết đến hòm thư <strong className="text-dark">{customerEmail || 'email của bạn'}</strong>.
              </p>

              {/* Hộp hiển thị mã đặt phòng & nút copy */}
              <div className="d-inline-flex flex-wrap align-items-center justify-content-center gap-3 p-3 bg-light rounded-4 border mx-auto mb-3">
                <div className="text-start">
                  <small className="text-secondary d-block" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Mã Đặt Chỗ Của Bạn (Booking ID)
                  </small>
                  <span className="fs-3 fw-bold text-primary font-monospace">{booking.id}</span>
                </div>
                <button 
                  onClick={handleCopyCode} 
                  className="btn btn-outline-primary btn-sm px-3 py-2 fw-semibold d-inline-flex align-items-center gap-1 rounded-pill"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  {copied ? 'Đã sao chép!' : 'Sao chép mã'}
                </button>
              </div>

              <div className="d-flex flex-wrap justify-content-center gap-2 mt-2">
                <button 
                  onClick={() => window.print()} 
                  className="btn btn-outline-secondary btn-sm px-3 py-2 d-inline-flex align-items-center gap-1 rounded-pill bg-white"
                >
                  <Printer size={16} /> In vé điện tử
                </button>
                <Link 
                  to="/my-bookings" 
                  className="btn btn-primary btn-sm px-3 py-2 d-inline-flex align-items-center gap-1 rounded-pill fw-semibold"
                >
                  Xem chuyến đi của tôi <ArrowRight size={16} />
                </Link>
                <Link 
                  to="/" 
                  className="btn btn-light btn-sm px-3 py-2 d-inline-flex align-items-center gap-1 rounded-pill"
                >
                  <Home size={16} /> Về trang chủ
                </Link>
              </div>
            </div>

            {/* THÔNG BÁO CHO KHÁCH VÃNG LAI (GUEST) ĐỂ ĐỒNG BỘ VÀO TÀI KHOẢN */}
            {(!isAuthenticated || booking.isGuest) && (
              <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white border-start border-4 border-warning">
                <div className="d-flex align-items-start gap-3">
                  <div className="p-2 bg-warning bg-opacity-25 text-warning-emphasis rounded-circle flex-shrink-0 mt-1">
                    <Sparkles size={22} className="text-warning" />
                  </div>
                  <div className="flex-grow-1">
                    <h6 className="fw-bold text-dark mb-1">
                      💡 Bạn đã đặt phòng thành công 
                    </h6>
                    <p className="small text-secondary mb-3">
                      Vé điện tử và mã xác nhận đã được gửi đến email <strong className="text-dark">{booking.contactEmail}</strong>. 
                      Đơn này hiện được lưu trữ tạm thời trên trình duyệt của bạn. Bạn có thể tạo tài khoản hoặc đăng nhập với email này để lưu vé điện tử vĩnh viễn và tích lũy điểm thưởng!
                    </p>
                    <div className="d-flex flex-wrap align-items-center gap-2">
                      <Link 
                        to="/register" 
                        state={{ email: booking.contactEmail, name: booking.contactName }}
                        className="btn btn-warning btn-sm rounded-pill fw-bold text-dark px-3 shadow-sm d-inline-flex align-items-center gap-1"
                        style={{ fontSize: '12.5px' }}
                      >
                        <UserPlus size={15} /> Tạo tài khoản với email này
                      </Link>
                      <Link 
                        to="/login" 
                        className="btn btn-outline-secondary btn-sm rounded-pill fw-semibold px-3"
                        style={{ fontSize: '12.5px' }}
                      >
                        Đăng nhập đồng bộ
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ================= THẺ VÉ ĐIỆN TỬ (E-VOUCHER) ================= */}
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white mb-4">
              
              {/* Header của E-Voucher */}
              <div className="bg-primary text-white p-4 d-flex flex-wrap justify-content-between align-items-center gap-3">
                <div>
                  <div className="d-flex align-items-center gap-2">
                    <span className="fs-4 fw-bold">Traveloka</span>
                    <span className="badge bg-white text-primary fw-bold text-uppercase">Phiếu Nhận Phòng (E-Voucher)</span>
                  </div>
                  <small className="opacity-75">Ngày xuất vé: {booking.createdAt}</small>
                </div>
                <div className="text-md-end text-start">
                  <span className="badge bg-success fs-6 px-3 py-2 rounded-pill">
                    ✓ ĐÃ XÁC NHẬN CHỖ
                  </span>
                </div>
              </div>

              <div className="p-4 p-md-5">
                <div className="row g-4">
                  {/* Cột trái: Chi tiết khách sạn & phòng */}
                  <div className="col-md-8 border-end-md">
                    
                    {/* Khách sạn */}
                    <div className="mb-4">
                      <span className="text-secondary small d-block mb-1">Khách sạn lưu trú</span>
                      <h4 className="fw-bold text-dark mb-1">{booking.hotelName}</h4>
                      <p className="text-secondary small mb-2 d-flex align-items-center gap-1">
                        <MapPin size={16} className="text-danger flex-shrink-0" />
                        <span>{booking.hotelAddress}</span>
                      </p>
                    </div>

                    {/* Phòng */}
                    <div className="p-3 bg-light rounded-3 mb-4 border">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                          <strong className="text-dark d-block fs-6">{booking.roomName}</strong>
                          <span className="text-secondary small">{booking.roomBed}</span>
                        </div>
                        <span className="badge bg-primary-subtle text-primary">{booking.nights} đêm lưu trú</span>
                      </div>
                      <div className="text-secondary small">
                        Bao gồm bữa sáng buffet miễn phí mỗi sáng & Wifi tốc độ cao.
                      </div>
                    </div>

                    {/* Thời gian nhận / trả phòng */}
                    <div className="row g-3 mb-4">
                      <div className="col-6">
                        <div className="p-3 border rounded-3 bg-white">
                          <span className="small text-secondary d-block">Giờ Nhận Phòng</span>
                          <strong className="text-dark fs-6 d-block mt-1">{booking.checkInDate}</strong>
                          <span className="badge bg-light text-dark border small mt-1">Từ 14:00</span>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="p-3 border rounded-3 bg-white">
                          <span className="small text-secondary d-block">Giờ Trả Phòng</span>
                          <strong className="text-dark fs-6 d-block mt-1">{booking.checkOutDate}</strong>
                          <span className="badge bg-light text-dark border small mt-1">Trước 12:00</span>
                        </div>
                      </div>
                    </div>

                    {/* Thông tin khách hàng */}
                    <div className="mb-4">
                      <h6 className="fw-bold text-dark mb-2">Thông Tin Khách Lưu Trú</h6>
                      <div className="row g-2 small text-secondary">
                        <div className="col-md-6">
                          <span>Họ tên khách: </span>
                          <strong className="text-dark">{customerName}</strong>
                        </div>
                        <div className="col-md-6">
                          <span>Số điện thoại: </span>
                          <strong className="text-dark">{customerPhone || 'Chưa cập nhật'}</strong>
                        </div>
                        <div className="col-md-12">
                          <span>Email: </span>
                          <strong className="text-dark">{customerEmail || 'Chưa cập nhật'}</strong>
                        </div>
                        {booking.specialRequests && booking.specialRequests.length > 0 && (
                          <div className="col-12 mt-1">
                            <span>Yêu cầu đặc biệt: </span>
                            <span className="text-primary fw-medium">{booking.specialRequests.join(', ')}</span>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>

                  {/* Cột phải: Mã QR check-in & Thanh toán */}
                  <div className="col-md-4 text-center d-flex flex-column justify-content-between">
                    <div>
                      <span className="text-secondary small d-block mb-2 fw-semibold">MÃ QR CHECK-IN NHANH</span>
                      
                      {/* Minh họa mã QR Check-in */}
                      <div className="p-3 bg-white border rounded-4 d-inline-block shadow-sm mb-3">
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(booking.id)}`} 
                          alt="Mã QR check-in" 
                          className="img-fluid"
                          style={{ width: '150px', height: '150px' }}
                        />
                      </div>
                      <p className="text-secondary small mb-0 px-2" style={{ fontSize: '11px' }}>
                        Quét mã này tại quầy lễ tân khách sạn để làm thủ tục nhận phòng tức thì không cần chờ đợi.
                      </p>
                    </div>

                    <div className="border-top pt-3 mt-4 text-start">
                      <span className="text-secondary small d-block">Hình thức thanh toán:</span>
                      <strong className="text-dark small d-block mb-2">
                        {getPaymentMethodLabel(booking.paymentMethod)}
                      </strong>

                      <span className="text-secondary small d-block">Tổng tiền đã thanh toán:</span>
                      <span className="fs-4 fw-bold text-danger d-block">
                        {booking.totalAmount?.toLocaleString('vi-VN')} đ
                      </span>
                    </div>
                  </div>
                </div>

                {/* Hướng dẫn khi nhận phòng */}
                <div className="p-3 bg-light rounded-3 mt-4 border small text-secondary">
                  <strong className="text-dark d-block mb-1">Lưu ý quan trọng cho kỳ nghỉ của bạn:</strong>
                  <ul className="mb-0 ps-3">
                    <li>Vui lòng mang theo Căn cước công dân / Hộ chiếu gốc của khách lưu trú để đối chiếu.</li>
                    <li>Khách sạn có thể yêu cầu một khoản đặt cọc nhỏ bằng tiền mặt hoặc thẻ tín dụng để bảo đảm đồ đạc, khoản này sẽ hoàn trả 100% khi trả phòng.</li>
                    <li>Hỗ trợ khách hàng 24/7 qua Hotline Traveloka: <strong>1900 1234</strong>.</li>
                  </ul>
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
