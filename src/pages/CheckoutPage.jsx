import React, { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../services/api';
import { getFriendlyErrorMessage, sanitizeErrorMessage } from '../utils/errorHandler';
import AlertModal from '../components/AlertModal';

import { 
  ArrowLeft, ShieldCheck, CreditCard, QrCode, Wallet, Building2, 
  CheckCircle2, Info, Calendar, Users, BedDouble, Tag, Sparkles, Clock, AlertCircle, User
} from 'lucide-react';

export default function CheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  // Lấy dữ liệu hotel và room từ state chuyển trang, hoặc khôi phục từ pending booking
  const pendingBooking = (() => {
    try {
      return JSON.parse(localStorage.getItem('traveloka_pending_booking')) || {};
    } catch {
      return {};
    }
  })();
  const passedData = location.state || pendingBooking || {};
  const hotel = passedData.hotel;
  const room = passedData.room || hotel?.rooms?.[0];
  const isAdminUser = Boolean(isAuthenticated && user && (user.role === 'ROLE_ADMIN' || user.role === 'admin'));

  // Bắt buộc đăng nhập & phải chọn phòng trước
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { 
        state: { 
          from: location,
          notice: 'Vui lòng đăng nhập tài khoản Khách hàng để hoàn tất đặt phòng.' 
        },
        replace: true 
      });
      return;
    }

    if (!hotel || !room) {
      navigate('/hotels', { replace: true });
      return;
    }

    // Dọn dẹp pending booking sau khi đã vào trang thành công
    try {
      localStorage.removeItem('traveloka_pending_booking');
    } catch {}
  }, [isAuthenticated, navigate, location, hotel, room]);

  if (!hotel || !room) {
    return (
      <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center bg-light">
        <div className="spinner-border text-primary mb-3" role="status"></div>
        <p className="text-secondary fw-semibold">Đang chuẩn bị thông tin đặt phòng...</p>
      </div>
    );
  }

  // State thông tin khách hàng: Tự động điền nếu đã đăng nhập, hoặc để trống nếu là khách vãng lai
  const [fullName, setFullName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || '0912345678');
  const [isBookingForSomeoneElse, setIsBookingForSomeoneElse] = useState(false);
  const [guestName, setGuestName] = useState('');

  // Tự động đồng bộ thông tin tài khoản nếu người dùng vừa đăng nhập
  useEffect(() => {
    if (isAuthenticated && user) {
      if (!fullName) setFullName(user.name || '');
      if (!email) setEmail(user.email || '');
      if (!phoneNumber && user.phone) setPhoneNumber(user.phone);
    }
  }, [isAuthenticated, user]);

  // Đọc thông tin tìm kiếm dự phòng từ localStorage nếu F5 hoặc mở tab mới
  const savedSearch = (() => {
    try {
      return JSON.parse(localStorage.getItem('traveloka_search_params')) || {};
    } catch {
      return {};
    }
  })();

  // State ngày lưu trú (đồng bộ theo ngày tìm kiếm từ HomePage / localStorage)
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const initialCheckIn = passedData.checkInDate || passedData.checkIn || savedSearch.checkIn || today;
  const initialCheckOut = passedData.checkOutDate || passedData.checkOut || savedSearch.checkOut || tomorrow;

  const [checkInDate, setCheckInDate] = useState(initialCheckIn);
  const [checkOutDate, setCheckOutDate] = useState(initialCheckOut);

  // Tính số đêm lưu trú
  const nights = useMemo(() => {
    const d1 = new Date(checkInDate);
    const d2 = new Date(checkOutDate);
    const diffTime = d2.getTime() - d1.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  }, [checkInDate, checkOutDate]);

  // State yêu cầu đặc biệt
  const [specialRequests, setSpecialRequests] = useState([]);
  const requestOptions = [
    "Phòng không hút thuốc",
    "Phòng ở tầng cao",
    "Nhận phòng sớm (tùy tình trạng phòng)",
    "Trả phòng trễ",
    "1 giường đôi lớn (King bed)"
  ];

  const toggleSpecialRequest = (req) => {
    setSpecialRequests(prev => 
      prev.includes(req) ? prev.filter(r => r !== req) : [...prev, req]
    );
  };

  // State phương thức thanh toán
  const [paymentMethod, setPaymentMethod] = useState('vnpay'); // vnpay, card, momo, pay_at_hotel

  // State thông tin thẻ
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // State mã giảm giá
  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponMessage, setCouponMessage] = useState(null);

  // Xử lý áp dụng voucher
  const handleApplyCoupon = (e) => {
    e.preventDefault();
    const code = couponCode.trim().toUpperCase();
    if (code === 'TRAVELOKA' || code === 'TRAVELOKA2026' || code === 'GIAM150K') {
      setDiscountAmount(150000);
      setCouponMessage({ type: 'success', text: 'Áp dụng mã thành công! Giảm 150.000 đ' });
    } else if (code === 'SUMMER100K') {
      setDiscountAmount(100000);
      setCouponMessage({ type: 'success', text: 'Áp dụng mã thành công! Giảm 100.000 đ' });
    } else {
      setDiscountAmount(0);
      setCouponMessage({ type: 'danger', text: 'Mã giảm giá không hợp lệ hoặc đã hết hạn.' });
    }
  };

  // Tính toán chi phí
  const roomPriceTotal = room.pricePerNight * nights;
  const taxAndFee = Math.round(roomPriceTotal * 0.1); // 10% thuế và phí dịch vụ
  const finalTotal = Math.max(0, roomPriceTotal + taxAndFee - discountAmount);

  // State cho Alert Modal thân thiện thay thế alert() mặc định của trình duyệt
  const [alertState, setAlertState] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'error',
    confirmText: 'Đã hiểu',
    onConfirm: null
  });

  const showAlert = ({ title, message, type = 'error', confirmText = 'Đã hiểu', onConfirm = null }) => {
    setAlertState({
      isOpen: true,
      title,
      message,
      type,
      confirmText,
      onConfirm
    });
  };

  const closeAlert = () => {
    setAlertState(prev => ({ ...prev, isOpen: false }));
  };

  // Xử lý xác nhận thanh toán & đặt phòng
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    if (!fullName || !email || !phoneNumber) {
      showAlert({
        title: 'Thông tin chưa đầy đủ',
        message: 'Vui lòng điền đầy đủ Họ tên, Email và Số điện thoại liên hệ để nhận xác nhận đặt phòng nhé!',
        type: 'warning',
        confirmText: 'Bổ sung ngay'
      });
      return;
    }

    const isOnlinePayment = (paymentMethod === 'vnpay' || paymentMethod === 'card');
    const isAdminUser = Boolean(isAuthenticated && user && (user.role === 'ROLE_ADMIN' || user.role === 'admin'));

    // Chặn tài khoản Quản trị viên (Admin) không được phép đặt phòng
    if (isAdminUser) {
      showAlert({
        title: 'Không thể đặt phòng',
        message: 'Tài khoản Quản trị viên (Admin) không được phép thực hiện đặt phòng!\nVui lòng đăng xuất và sử dụng tài khoản Khách hàng (Customer) để đặt phòng.',
        type: 'warning',
        confirmText: 'Đã hiểu'
      });
      return;
    }

    // Bắt buộc đăng nhập tài khoản Khách hàng
    if (!isAuthenticated) {
      showAlert({
        title: 'Yêu cầu đăng nhập',
        message: 'Vui lòng đăng nhập tài khoản Khách hàng để hoàn tất đặt phòng.',
        type: 'info',
        confirmText: 'Đăng nhập ngay',
        onConfirm: () => {
          navigate('/login', { 
            state: { 
              from: location,
              notice: 'Vui lòng đăng nhập tài khoản Khách hàng để hoàn tất đặt phòng.' 
            } 
          });
        }
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Gọi API Backend để lưu vào bảng bookings trong MySQL
      const bookingPayload = {
        roomId: room.id,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        numberOfGuests: Number(passedData.guestCount || passedData.adultsCount || savedSearch.adultsCount || room.maxGuests || 2)
      };

      const response = await apiFetch('/customer/bookings', {
        method: 'POST',
        body: JSON.stringify(bookingPayload)
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        const rawErrMsg = getFriendlyErrorMessage(errData, '');

        let friendlyTitle = 'Đặt phòng thất bại';
        let friendlyMsg = 'Phòng đã có khách đặt trong khoảng thời gian này!\nBạn vui lòng chọn ngày khác hoặc chọn phòng khác nhé.';

        // Xử lý thông báo trực quan, thân thiện nếu phòng bị trùng lịch
        if (!rawErrMsg || rawErrMsg.includes('trùng') || rawErrMsg.includes('khoảng thời gian') || rawErrMsg.includes('đã được đặt') || rawErrMsg.includes('không còn trống')) {
          friendlyTitle = 'Đặt phòng thất bại';
          friendlyMsg = 'Phòng đã bị trùng lịch đặt trong khoảng thời gian này!\nBạn vui lòng chọn ngày khác hoặc chọn phòng khác nhé.';
        } else if (rawErrMsg) {
          friendlyMsg = rawErrMsg;
        }

        showAlert({
          title: friendlyTitle,
          message: friendlyMsg,
          type: 'error',
          confirmText: 'Đã hiểu'
        });
        setIsSubmitting(false);
        return;
      }

      const data = await response.json();
      const realBookingId = data.bookingId;

      // 2. Tạo mã đặt phòng hiển thị từ ID thật của MySQL (VD: BK-0001)
      const bookingCode = `BK-${String(realBookingId).padStart(4, '0')}`;

      const newBooking = {
        id: bookingCode,
        backendBookingId: realBookingId,
        createdAt: new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        hotelId: hotel.id,
        hotelName: hotel.name,
        hotelCity: hotel.city,
        hotelThumbnail: hotel.thumbnailUrl || (Array.isArray(hotel.images) ? hotel.images[0] : null),
        hotelThumbnailUrl: hotel.thumbnailUrl || (Array.isArray(hotel.images) ? hotel.images[0] : null),
        hotelImage: hotel.thumbnailUrl || (Array.isArray(hotel.images) ? hotel.images[0] : null),
        roomId: room.id,
        roomName: room.name,
        roomImage: room.imageUrl,
        roomImageUrl: room.imageUrl,
        roomBed: room.bedType,
        checkInDate,
        checkOutDate,
        nights,
        guestCount: passedData.guestCount || passedData.adultsCount || savedSearch.adultsCount || room.maxGuests || 2,
        contactName: fullName,
        guestName: isBookingForSomeoneElse ? guestName : fullName,
        contactEmail: email,
        contactPhone: phoneNumber,
        specialRequests,
        paymentMethod,
        roomPrice: roomPriceTotal,
        taxAndFee,
        discountAmount,
        totalAmount: finalTotal,
        status: isOnlinePayment ? 'pending' : 'confirmed',
        freeCancellation: room.freeCancellation,
        isGuest: false,
        userId: user?.id || null,
        userEmail: user?.email || email
      };

      // 3. Xử lý thanh toán tích hợp (VNPay Sandbox hoặc Tiền mặt tại khách sạn)
      const paymentMethodEnum = isOnlinePayment ? 'VNPAY' : 'CASH';

      const payResponse = await apiFetch('/customer/payments/create-url', {
        method: 'POST',
        body: JSON.stringify({
          bookingId: realBookingId,
          paymentMethod: paymentMethodEnum
        })
      });

      if (payResponse.ok) {
        const payData = await payResponse.json();
        const payResult = payData?.result;

        // Nếu là thanh toán online VNPay -> Lưu đơn dạng PENDING và chuyển hướng sang cổng VNPay
        if (isOnlinePayment && payResult?.paymentUrl) {
          const pendingBooking = {
            ...newBooking,
            status: 'pending',
            paymentStatus: 'PENDING'
          };
          const savedBookings = JSON.parse(localStorage.getItem('traveloka_bookings') || '[]');
          localStorage.setItem('traveloka_bookings', JSON.stringify([pendingBooking, ...savedBookings]));

          setIsSubmitting(false);
          // Chuyển hướng trực tiếp sang cổng thanh toán VNPay Sandbox
          window.location.href = payResult.paymentUrl;
          return;
        }
      } else {
        const payErr = await payResponse.json().catch(() => ({}));
        const payMsg = getFriendlyErrorMessage(payErr, 'Lỗi kết nối cổng thanh toán.');
        showAlert({
          title: 'Lỗi cổng thanh toán',
          message: `Không thể kết nối cổng thanh toán lúc này: ${payMsg}\nBạn có thể thử lại hoặc chọn phương thức Thanh toán tại khách sạn nhé!`,
          type: 'error',
          confirmText: 'Đã hiểu'
        });
        setIsSubmitting(false);
        return;
      }

      // 4. Thanh toán tiền mặt tại khách sạn: Lưu lịch sử và chuyển sang trang hoàn tất
      const savedBookings = JSON.parse(localStorage.getItem('traveloka_bookings') || '[]');
      localStorage.setItem('traveloka_bookings', JSON.stringify([newBooking, ...savedBookings]));

      setIsSubmitting(false);
      navigate('/booking-success', { state: { booking: newBooking } });

    } catch (err) {
      console.error('Lỗi quá trình đặt phòng:', err);
      showAlert({
        title: 'Có lỗi xảy ra',
        message: 'Đã xảy ra lỗi trong quá trình xử lý đặt phòng: ' + sanitizeErrorMessage(err),
        type: 'error',
        confirmText: 'Đã hiểu'
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-light pb-5 min-vh-100 page-top-spacing">
      <div className="container">
        
        {/* Nút quay lại & Tiêu đề */}
        <div className="d-flex align-items-center justify-content-between mb-4">
          <button 
            onClick={() => navigate(-1)} 
            className="btn btn-outline-secondary btn-sm bg-white d-inline-flex align-items-center gap-1 shadow-sm"
          >
            <ArrowLeft size={16} /> Quay lại
          </button>

          {/* Stepper chỉ báo các bước */}
          <div className="d-none d-md-flex align-items-center gap-3 small">
            <span className="text-primary fw-bold d-flex align-items-center gap-1">
              <span className="badge bg-primary rounded-circle">1</span> Điền thông tin
            </span>
            <span className="text-secondary">———</span>
            <span className="text-primary fw-bold d-flex align-items-center gap-1">
              <span className="badge bg-primary rounded-circle">2</span> Thanh toán
            </span>
            <span className="text-secondary">———</span>
            <span className="text-secondary d-flex align-items-center gap-1">
              <span className="badge bg-secondary-subtle text-secondary rounded-circle">3</span> Hoàn tất vé
            </span>
          </div>
        </div>

        <div className="row g-4">
          {/* ================= CỘT TRÁI: FORM ĐIỀN THÔNG TIN & PHƯƠNG THỨC THANH TOÁN ================= */}
          <div className="col-lg-8">
            <form onSubmit={handleSubmitBooking}>
              
              {/* KHỐI 1: THÔNG TIN KHÁCH HÀNG */}
              <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
                <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
                  <h5 className="fw-bold text-dark mb-0">1. Thông Tin Người Liên Hệ</h5>
                  <span className="badge bg-primary-subtle text-primary small">Yêu cầu thông tin chính xác</span>
                </div>
                {/* BANNER PHÂN BIỆT: KHÁCH VÃNG LAI (GUEST) VÀ THÀNH VIÊN ĐÃ ĐĂNG NHẬP */}
                {!isAuthenticated ? (
                  <div className="card border-0 shadow-sm rounded-3 p-3 mb-4" style={{ background: 'linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 100%)', borderLeft: '4px solid #0264c8' }}>
                    <div className="d-flex align-items-start gap-3">
                      <div className="p-2 bg-primary text-white rounded-circle flex-shrink-0 mt-1">
                        <Sparkles size={18} />
                      </div>
                      <div className="flex-grow-1">
                        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-1">
                          <strong className="text-primary small">
                            Yêu cầu đăng nhập tài khoản Khách hàng
                          </strong>
                          <Link 
                            to="/login" 
                            state={{ from: location, notice: 'Vui lòng đăng nhập tài khoản Khách hàng để tiếp tục đặt phòng.' }}
                            className="btn btn-primary btn-sm rounded-pill px-3 py-1 fw-bold shadow-sm"
                            style={{ fontSize: '12px' }}
                          >
                            Đăng nhập ngay
                          </Link>
                        </div>
                        <p className="small text-secondary mb-0" style={{ fontSize: '12.5px' }}>
                          Để đảm bảo phòng được giữ chỗ chính xác trên hệ thống và tránh trùng lặp phòng, bạn cần đăng nhập tài khoản Khách hàng trước khi hoàn tất đặt phòng.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="card border-0 shadow-sm rounded-3 p-3 mb-4 bg-success-subtle border-start border-4 border-success">
                    <div className="d-flex align-items-center gap-3">
                      <div className="p-2 bg-success text-white rounded-circle flex-shrink-0">
                        <CheckCircle2 size={18} />
                      </div>
                      <div className="flex-grow-1">
                        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
                          <div>
                            <strong className="text-success small d-block">
                              ✓ Thành viên đã đăng nhập: {user?.name} ({user?.email})
                            </strong>
                            <span className="small text-secondary" style={{ fontSize: '12px' }}>
                              Thông tin liên hệ đã được tự động điền. Đơn đặt phòng này sẽ được đồng bộ trực tiếp vào mục <strong>Chuyến đi của tôi</strong>.
                            </span>
                          </div>
                          <span className="badge bg-success text-white px-2 py-1">Thành viên thân thiết</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="row g-3">
                  <div className="col-md-12">
                    <label className="form-label fw-semibold small text-dark">
                      Họ và tên khách hàng (như trên CCCD/Hộ chiếu) <span className="text-danger">*</span>
                    </label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="VD: NGUYEN VAN A"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold small text-dark">
                      Địa chỉ Email nhận vé <span className="text-danger">*</span>
                    </label>
                    <input 
                      type="email" 
                      className="form-control" 
                      placeholder="email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold small text-dark">
                      Số điện thoại di động <span className="text-danger">*</span>
                    </label>
                    <input 
                      type="tel" 
                      className="form-control" 
                      placeholder="0912 345 678"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      required
                    />
                  </div>

                  {/* Checkbox đặt phòng cho người khác */}
                  <div className="col-12 mt-3">
                    <div className="form-check">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        id="bookingForOther"
                        checked={isBookingForSomeoneElse}
                        onChange={(e) => setIsBookingForSomeoneElse(e.target.checked)}
                      />
                      <label className="form-check-label small text-secondary" htmlFor="bookingForOther">
                        Tôi đặt phòng giúp cho người khác (nhập họ tên người lưu trú thực tế)
                      </label>
                    </div>

                    {isBookingForSomeoneElse && (
                      <div className="mt-3 p-3 bg-light rounded-3 border">
                        <label className="form-label fw-semibold small text-dark">
                          Họ và tên người lưu trú chính <span className="text-danger">*</span>
                        </label>
                        <input 
                          type="text" 
                          className="form-control" 
                          placeholder="Nhập tên người sẽ nhận phòng tại khách sạn"
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                          required={isBookingForSomeoneElse}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* KHỐI 2: THỜI GIAN LƯU TRÚ & YÊU CẦU ĐẶC BIỆT */}
              <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
                <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
                  <h5 className="fw-bold text-dark mb-0">2. Thời Gian & Yêu Cầu Lưu Trú</h5>
                  <span className="badge bg-light text-secondary border">Lưu trú: {nights} đêm</span>
                </div>

                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold small text-dark">Ngày nhận phòng (Check-in)</label>
                    <input 
                      type="date" 
                      className="form-control" 
                      value={checkInDate}
                      min={today}
                      onChange={(e) => {
                        const newCheckIn = e.target.value;
                        setCheckInDate(newCheckIn);
                        if (checkOutDate <= newCheckIn) {
                          const nextDay = new Date(new Date(newCheckIn).getTime() + 86400000).toISOString().split('T')[0];
                          setCheckOutDate(nextDay);
                        }
                      }}
                    />
                    <small className="text-secondary d-block mt-1">Giờ nhận phòng từ: 14:00</small>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold small text-dark">Ngày trả phòng (Check-out)</label>
                    <input 
                      type="date" 
                      className="form-control" 
                      value={checkOutDate}
                      min={checkInDate}
                      onChange={(e) => setCheckOutDate(e.target.value)}
                    />
                    <small className="text-secondary d-block mt-1">Giờ trả phòng trước: 12:00</small>
                  </div>
                </div>

                <label className="form-label fw-semibold small text-dark mb-2">
                  Yêu cầu đặc biệt (Khách sạn sẽ cố gắng đáp ứng tùy theo tình trạng phòng thực tế)
                </label>
                <div className="row g-2">
                  {requestOptions.map((opt, i) => (
                    <div key={i} className="col-md-6 col-12">
                      <div 
                        className={`p-2 px-3 rounded-3 border cursor-pointer d-flex align-items-center gap-2 small transition-all ${
                          specialRequests.includes(opt) ? 'bg-primary-subtle border-primary text-primary fw-semibold' : 'bg-light text-secondary'
                        }`}
                        onClick={() => toggleSpecialRequest(opt)}
                      >
                        <input 
                          type="checkbox" 
                          className="form-check-input mt-0"
                          checked={specialRequests.includes(opt)}
                          onChange={() => {}}
                        />
                        <span>{opt}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* KHỐI 3: PHƯƠNG THỨC THANH TOÁN */}
              <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
                <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
                  <h5 className="fw-bold text-dark mb-0">3. Chọn Phương Thức Thanh Toán</h5>
                  <span className="badge bg-success-subtle text-success small d-flex align-items-center gap-1">
                    <ShieldCheck size={14} /> Bảo mật SSL 256-bit
                  </span>
                </div>

                <div className="d-flex flex-column gap-3 mb-4">
                  {/* Phương thức 1: VNPAY QR */}
                  <label className={`p-3 rounded-3 border cursor-pointer d-flex align-items-start gap-3 transition-all ${
                    paymentMethod === 'vnpay' ? 'border-primary bg-primary-subtle bg-opacity-25' : 'bg-white'
                  }`}>
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      className="form-check-input mt-1" 
                      checked={paymentMethod === 'vnpay'}
                      onChange={() => setPaymentMethod('vnpay')}
                    />
                    <div className="flex-grow-1">
                      <div className="d-flex align-items-center justify-content-between">
                        <strong className="text-dark d-flex align-items-center gap-2">
                          <QrCode size={18} className="text-primary" /> Cổng thanh toán VNPAY QR
                        </strong>
                        <span className="badge bg-danger text-white">Khuyên dùng</span>
                      </div>
                      <small className="text-secondary d-block mt-1">
                        Quét mã QR tiện lợi qua hơn 40 ứng dụng ngân hàng và ví VNPAY. Xác nhận tức thì.
                      </small>
                    </div>
                  </label>

                  {/* Phương thức 2: Thẻ Quốc Tế (Visa / Mastercard) */}
                  <label className={`p-3 rounded-3 border cursor-pointer d-flex align-items-start gap-3 transition-all ${
                    paymentMethod === 'card' ? 'border-primary bg-primary-subtle bg-opacity-25' : 'bg-white'
                  }`}>
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      className="form-check-input mt-1" 
                      checked={paymentMethod === 'card'}
                      onChange={() => setPaymentMethod('card')}
                    />
                    <div className="flex-grow-1">
                      <strong className="text-dark d-flex align-items-center gap-2">
                        <CreditCard size={18} className="text-primary" /> Thẻ Tín Dụng / Ghi Nợ Quốc Tế (Visa, Master, JCB)
                      </strong>
                      <small className="text-secondary d-block mt-1">
                        Miễn phí giao dịch quốc tế, mã hóa an toàn theo tiêu chuẩn ngân hàng.
                      </small>

                      {paymentMethod === 'card' && (
                        <div className="row g-2 mt-3 p-3 bg-white rounded-3 border">
                          <div className="col-12">
                            <label className="form-label small text-secondary mb-1">Số thẻ thanh toán</label>
                            <input 
                              type="text" 
                              className="form-control form-control-sm" 
                              placeholder="4111 •••• •••• 1234"
                              value={cardNumber}
                              onChange={(e) => setCardNumber(e.target.value)}
                            />
                          </div>
                          <div className="col-6">
                            <label className="form-label small text-secondary mb-1">Tên in trên thẻ</label>
                            <input 
                              type="text" 
                              className="form-control form-control-sm" 
                              placeholder="NGUYEN VAN A"
                              value={cardHolder}
                              onChange={(e) => setCardHolder(e.target.value)}
                            />
                          </div>
                          <div className="col-3">
                            <label className="form-label small text-secondary mb-1">Hạn thẻ (MM/YY)</label>
                            <input 
                              type="text" 
                              className="form-control form-control-sm" 
                              placeholder="12/28"
                              value={cardExpiry}
                              onChange={(e) => setCardExpiry(e.target.value)}
                            />
                          </div>
                          <div className="col-3">
                            <label className="form-label small text-secondary mb-1">Mã CVV</label>
                            <input 
                              type="password" 
                              maxLength="4" 
                              className="form-control form-control-sm" 
                              placeholder="•••"
                              value={cardCvv}
                              onChange={(e) => setCardCvv(e.target.value)}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </label>

                  {/* Phương thức 3: Ví Điện Tử */}
                  <label className={`p-3 rounded-3 border cursor-pointer d-flex align-items-start gap-3 transition-all ${
                    paymentMethod === 'momo' ? 'border-primary bg-primary-subtle bg-opacity-25' : 'bg-white'
                  }`}>
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      className="form-check-input mt-1" 
                      checked={paymentMethod === 'momo'}
                      onChange={() => setPaymentMethod('momo')}
                    />
                    <div className="flex-grow-1">
                      <strong className="text-dark d-flex align-items-center gap-2">
                        <Wallet size={18} className="text-primary" /> Ví điện tử MoMo / ZaloPay
                      </strong>
                      <small className="text-secondary d-block mt-1">
                        Liên kết trực tiếp với ứng dụng ví di động để thanh toán nhanh chóng.
                      </small>
                    </div>
                  </label>

                  {/* Phương thức 4: Thanh toán tại khách sạn */}
                  <label className={`p-3 rounded-3 border cursor-pointer d-flex align-items-start gap-3 transition-all ${
                    paymentMethod === 'pay_at_hotel' ? 'border-primary bg-primary-subtle bg-opacity-25' : 'bg-white'
                  }`}>
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      className="form-check-input mt-1" 
                      checked={paymentMethod === 'pay_at_hotel'}
                      onChange={() => setPaymentMethod('pay_at_hotel')}
                    />
                    <div className="flex-grow-1">
                      <strong className="text-dark d-flex align-items-center gap-2">
                        <Building2 size={18} className="text-primary" /> Thanh toán trực tiếp tại khách sạn khi nhận phòng
                      </strong>
                      <small className="text-secondary d-block mt-1">
                        Bạn chỉ cần thanh toán bằng tiền mặt hoặc thẻ tại quầy lễ tân khi làm thủ tục check-in.
                      </small>
                    </div>
                  </label>
                </div>

                {/* Cam kết hoàn hủy & điều khoản */}
                <div className="p-3 bg-light rounded-3 small text-secondary border mb-4">
                  <div className="d-flex align-items-center gap-2 text-dark fw-bold mb-1">
                    <Info size={16} className="text-primary" /> Chính sách thanh toán & hoàn phòng
                  </div>
                  <div>
                    {room.freeCancellation ? (
                      <span className="text-success fw-semibold">✓ Khách sạn hỗ trợ miễn phí hủy phòng trước 24 giờ kể từ ngày nhận phòng.</span>
                    ) : (
                      <span className="text-warning fw-semibold">⚠ Đơn đặt phòng với mức giá ưu đãi đặc biệt này không hỗ trợ hoàn tiền khi hủy.</span>
                    )}
                    <div>Bằng việc nhấn xác nhận, bạn đồng ý với các Điều khoản & Điều kiện đặt phòng của Traveloka.</div>
                  </div>
                </div>

                {/* Cảnh báo nếu đang đăng nhập tài khoản ADMIN */}
                {isAdminUser && (
                  <div className="alert alert-warning d-flex align-items-center gap-2 mb-3">
                    <AlertCircle size={20} className="flex-shrink-0 text-danger" />
                    <div className="small">
                      <strong>Tài khoản Quản trị viên (Admin):</strong> Bạn đang đăng nhập bằng tài khoản Quản trị viên. Tài khoản Admin chỉ dùng để quản lý hệ thống và không được phép đặt phòng. Vui lòng đăng xuất và sử dụng tài khoản Khách hàng để thực hiện đặt phòng.
                    </div>
                  </div>
                )}

                {/* Nút hành động thanh toán */}
                <button 
                  type="submit" 
                  disabled={isSubmitting || isAdminUser} 
                  className={`btn ${isAdminUser ? 'btn-secondary' : 'btn-primary'} btn-lg w-100 fw-bold py-3 shadow-sm d-flex align-items-center justify-content-center gap-2`}
                  title={isAdminUser ? 'Tài khoản Admin không thể đặt phòng' : ''}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status"></span>
                      Đang xử lý đặt phòng & cấp vé...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={20} /> Xác Nhận & Thanh Toán ({finalTotal.toLocaleString('vi-VN')} đ)
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>

          {/* ================= CỘT PHẢI: TÓM TẮT CHI TIẾT ĐẶT PHÒNG & GIÁ TIỀN ================= */}
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm rounded-4 p-4 sticky-top bg-white" style={{ top: '90px' }}>
              
              {/* Tên khách sạn & ảnh */}
              <div className="d-flex gap-3 mb-3 pb-3 border-bottom">
                <img 
                  src={hotel.thumbnailUrl} 
                  alt={hotel.name} 
                  className="rounded-3 object-fit-cover flex-shrink-0"
                  style={{ width: '90px', height: '90px' }}
                />
                <div>
                  <span className="badge bg-primary-subtle text-primary small mb-1">Khách sạn {hotel.starRating} sao</span>
                  <h6 className="fw-bold text-dark mb-1 line-clamp-2">{hotel.name}</h6>
                  <p className="text-secondary small mb-0 line-clamp-1">{hotel.city}</p>
                </div>
              </div>

              {/* Thông tin phòng */}
              <div className="mb-3 pb-3 border-bottom">
                <div className="d-flex align-items-center gap-2 mb-1">
                  <BedDouble size={16} className="text-primary" />
                  <strong className="text-dark small">{room.name}</strong>
                </div>
                <div className="small text-secondary ps-4">
                  <div>• Sức chứa: {room.maxGuests || 2} khách lưu trú</div>
                  <div>• Loại giường: {room.bedType}</div>
                  <div>• Bữa ăn: Đã bao gồm bữa sáng buffet</div>
                </div>
              </div>

              {/* Thời gian lưu trú */}
              <div className="p-3 bg-light rounded-3 mb-3 small">
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-secondary">Nhận phòng:</span>
                  <strong className="text-dark">{checkInDate} (14:00)</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-secondary">Trả phòng:</span>
                  <strong className="text-dark">{checkOutDate} (12:00)</strong>
                </div>
                <div className="d-flex justify-content-between pt-2 border-top border-secondary-subtle">
                  <span className="text-secondary">Thời gian lưu trú:</span>
                  <strong className="text-primary">{nights} đêm</strong>
                </div>
              </div>

              {/* Mã giảm giá Voucher */}
              <div className="mb-4">
                <label className="form-label small fw-bold text-dark d-flex align-items-center gap-1">
                  <Tag size={15} className="text-primary" /> Mã Giảm Giá / Khuyến Mãi
                </label>
                <div className="input-group">
                  <input 
                    type="text" 
                    className="form-control form-control-sm text-uppercase" 
                    placeholder="VD: TRAVELOKA2026"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                  />
                  <button 
                    onClick={handleApplyCoupon} 
                    className="btn btn-outline-primary btn-sm fw-semibold"
                    type="button"
                  >
                    Áp dụng
                  </button>
                </div>

                {couponMessage && (
                  <div className={`small mt-2 text-${couponMessage.type}`}>
                    {couponMessage.text}
                  </div>
                )}
                <small className="text-secondary d-block mt-1" style={{ fontSize: '11px' }}>
                  Gợi ý mã khuyến mãi: <strong>TRAVELOKA2026</strong> (-150k) hoặc <strong>SUMMER100K</strong> (-100k)
                </small>
              </div>

              {/* Bảng tính chi phí chi tiết */}
              <div className="border-top pt-3">
                <h6 className="fw-bold text-dark mb-3">Chi Tiết Giá</h6>
                
                <div className="d-flex justify-content-between small mb-2 text-secondary">
                  <span>Giá phòng ({nights} đêm):</span>
                  <span className="text-dark fw-medium">{roomPriceTotal.toLocaleString('vi-VN')} đ</span>
                </div>

                <div className="d-flex justify-content-between small mb-2 text-secondary">
                  <span>Thuế & Phí dịch vụ (10%):</span>
                  <span className="text-dark fw-medium">{taxAndFee.toLocaleString('vi-VN')} đ</span>
                </div>

                {discountAmount > 0 && (
                  <div className="d-flex justify-content-between small mb-2 text-success fw-semibold">
                    <span>Mã ưu đãi giảm giá:</span>
                    <span>-{discountAmount.toLocaleString('vi-VN')} đ</span>
                  </div>
                )}

                <div className="d-flex justify-content-between align-items-center pt-3 border-top mt-2">
                  <div>
                    <span className="fw-bold text-dark fs-6 d-block">Tổng tiền thanh toán</span>
                    <small className="text-secondary" style={{ fontSize: '11px' }}>Đã gồm mọi loại thuế & phí</small>
                  </div>
                  <span className="fs-4 fw-bold text-danger">
                    {finalTotal.toLocaleString('vi-VN')} đ
                  </span>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* Modal Thông Báo Thân Thiện Người Dùng */}
      <AlertModal
        isOpen={alertState.isOpen}
        onClose={closeAlert}
        type={alertState.type}
        title={alertState.title}
        message={alertState.message}
        confirmText={alertState.confirmText}
        onConfirm={alertState.onConfirm}
      />
    </div>
  );
}
