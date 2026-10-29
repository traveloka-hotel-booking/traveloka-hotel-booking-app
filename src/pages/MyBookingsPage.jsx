import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../services/api';
import { getHotelByIdApi } from '../services/hotelApi';
import { createReviewApi } from '../services/reviewApi';
import { 
  Luggage, Calendar, MapPin, BedDouble, ArrowRight, Eye, 
  XCircle, CheckCircle, Clock, AlertTriangle, RotateCcw, Building, Info, Sparkles, RefreshCw, CreditCard, AlertCircle, Star
} from 'lucide-react';
import AlertModal from '../components/AlertModal';
import { getFriendlyErrorMessage, sanitizeErrorMessage } from '../utils/errorHandler';

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

    // 2. Chuyển khoản VNPay khi đã thanh toán thành công HOẶC Tiền mặt -> TỰ ĐỘNG DUYỆT ĐƠN (CONFIRMED), không cần admin duyệt
    if (((paymentMethod === 'vnpay' && paymentStatus === 'paid') || paymentMethod === 'pay_at_hotel') && rawStatus === 'PENDING') {
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

    const validImage = (url) => {
      if (!url || typeof url !== 'string') return null;
      const trimmed = url.trim();
      if (!trimmed) return null;
      if (trimmed.includes('photo-1566073771259') || trimmed.includes('photo-1590490360182')) return null;
      return trimmed;
    };

    const resolvedHotelThumbnail = 
      validImage(b.hotelThumbnailUrl) ||
      validImage(b.thumbnailUrl) ||
      validImage(b.hotelThumbnail) ||
      validImage(b.hotelImage) ||
      validImage(b.hotel?.thumbnailUrl) ||
      validImage(Array.isArray(b.hotel?.images) ? b.hotel.images[0] : null) ||
      validImage(Array.isArray(b.images) ? b.images[0] : null) ||
      validImage(b.roomImageUrl) ||
      validImage(b.roomImage) ||
      b.hotelThumbnailUrl ||
      b.hotelThumbnail ||
      b.hotelImage ||
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=60';

    const resolvedRoomImage = 
      validImage(b.roomImageUrl) ||
      validImage(b.roomImage) ||
      validImage(b.hotelThumbnailUrl) ||
      validImage(b.hotelThumbnail) ||
      validImage(b.hotelImage) ||
      b.roomImageUrl ||
      b.roomImage ||
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&auto=format&fit=crop&q=60';

    return {
      id: bookingCode,
      backendId: typeof rawId === 'number' ? rawId : (b.backendBookingId || null),
      bookingCode,
      createdAt: b.createdAt || new Date().toLocaleDateString('vi-VN') + ' 09:30',
      hotelId: b.hotelId,
      hotelName: b.hotelName || 'Khách sạn',
      hotelCity: b.hotelCity || 'Việt Nam',
      hotelAddress: b.hotelAddress || b.hotelCity || '',
      hotelThumbnail: resolvedHotelThumbnail,
      hotelThumbnailUrl: resolvedHotelThumbnail,
      roomId: b.roomId,
      roomName: b.roomName || 'Phòng nghỉ cao cấp',
      roomImage: resolvedRoomImage,
      roomImageUrl: resolvedRoomImage,
      roomBed: b.roomBedType || b.roomBed || '1 Giường King lớn',
      checkInDate,
      checkOutDate,
      nights,
      guestCount: b.guestCount || 2,
      contactName: b.customerName || b.userFullName || b.contactName || b.guestName || 'Khách hàng',
      guestName: b.customerName || b.userFullName || b.guestName || b.contactName || 'Khách hàng',
      contactEmail: b.customerEmail || b.userEmail || b.contactEmail || '',
      contactPhone: b.customerPhone || b.userPhone || b.contactPhone || '',
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
      isReviewed: Boolean(b.isReviewed),
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
  const [loading, setLoading] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [payingBookingId, setPayingBookingId] = useState(null);

  // State cho toast thông báo nổi đồng nhất hệ thống (showToast)
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState('success');

  const showToast = (msg, type = 'success') => {
    setToastType(type);
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // State cho Alert Modal thân thiện thay thế alert() và window.confirm()
  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'error',
    confirmText: 'Đã hiểu',
    cancelText: 'Hủy',
    showCancel: false,
    onConfirm: null
  });

  const showAlert = ({ title, message, type = 'error', confirmText = 'Đã hiểu', cancelText = 'Hủy', showCancel = false, onConfirm = null }) => {
    setAlertModal({
      isOpen: true,
      title,
      message,
      type,
      confirmText,
      cancelText,
      showCancel,
      onConfirm
    });
  };

  const closeAlert = () => {
    setAlertModal(prev => ({ ...prev, isOpen: false }));
  };

  // State quản lý Modal Đánh Giá Khách Sạn (FR-21)
  const [reviewModal, setReviewModal] = useState({
    isOpen: false,
    booking: null,
    rating: 10,
    comment: '',
    submitting: false,
    error: null,
  });

  const handleOpenReviewModal = (bookingItem) => {
    setReviewModal({
      isOpen: true,
      booking: bookingItem,
      rating: 10,
      comment: '',
      submitting: false,
      error: null,
    });
  };

  const handleCloseReviewModal = () => {
    setReviewModal({
      isOpen: false,
      booking: null,
      rating: 10,
      comment: '',
      submitting: false,
      error: null,
    });
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewModal.booking) return;

    if (!reviewModal.comment.trim()) {
      setReviewModal(prev => ({ ...prev, error: 'Vui lòng nhập nhận xét chi tiết về kỳ nghỉ của bạn!' }));
      return;
    }

    try {
      setReviewModal(prev => ({ ...prev, submitting: true, error: null }));
      const bookingIdToSubmit = reviewModal.booking.backendId || reviewModal.booking.id;
      await createReviewApi({
        bookingId: bookingIdToSubmit,
        rating: reviewModal.rating,
        comment: reviewModal.comment.trim(),
      });

      // Cập nhật trạng thái isReviewed trực tiếp trên state và localStorage
      setBookings(prev => {
        const updated = prev.map(b => {
          if (b.id === reviewModal.booking.id || b.backendId === reviewModal.booking.backendId) {
            return { ...b, isReviewed: true };
          }
          return b;
        });
        localStorage.setItem('traveloka_bookings', JSON.stringify(updated));
        return updated;
      });

      showToast('Đánh giá kỳ nghỉ của bạn đã được gửi thành công!', 'success');
      handleCloseReviewModal();
      window.dispatchEvent(new Event('traveloka_hotels_updated'));
      loadBookings();
    } catch (err) {
      console.error('Lỗi khi gửi đánh giá:', err);
      setReviewModal(prev => ({
        ...prev,
        submitting: false,
        error: err.message || 'Gửi đánh giá thất bại. Vui lòng thử lại!',
      }));
    }
  };

  // Tải danh sách đơn đặt phòng từ Backend và LocalStorage
  const loadBookings = async () => {
    let currentList = [];
    const deletedIds = JSON.parse(localStorage.getItem('traveloka_deleted_booking_ids') || '[]');
    const isNotDeleted = (b) => {
      const idStr = String(b.id || '');
      const codeStr = String(b.bookingCode || '');
      const backendIdStr = b.backendId ? String(b.backendId) : '';
      return !deletedIds.includes(idStr) && !deletedIds.includes(codeStr) && (!backendIdStr || !deletedIds.includes(backendIdStr));
    };

    try {
      const saved = JSON.parse(localStorage.getItem('traveloka_bookings') || '[]');
      if (Array.isArray(saved) && saved.length > 0) {
        currentList = saved.map(normalizeBooking).filter(isNotDeleted);
        setBookings(currentList);
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
            const mapped = data.result.map(normalizeBooking).filter(isNotDeleted);
            currentList = mapped;
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

    // Tự động kiểm tra và đồng bộ ảnh Cloudinary thật của khách sạn nếu đơn chưa có ảnh thật
    if (currentList.length > 0) {
      const needEnrich = currentList.some(b => b.hotelId && (!b.hotelThumbnail || b.hotelThumbnail.includes('unsplash.com')));
      if (needEnrich) {
        try {
          const hotelIds = [...new Set(currentList.filter(b => b.hotelId).map(b => b.hotelId))];
          const hotelMap = {};
          await Promise.all(
            hotelIds.map(async (hid) => {
              try {
                const hotelData = await getHotelByIdApi(hid);
                if (hotelData) {
                  const realImg = hotelData.thumbnailUrl || (Array.isArray(hotelData.images) ? hotelData.images[0] : null);
                  if (realImg) hotelMap[hid] = realImg;
                }
              } catch (_) {}
            })
          );
          if (Object.keys(hotelMap).length > 0) {
            setBookings(prev => {
              const updated = prev.map(b => {
                if (b.hotelId && hotelMap[b.hotelId] && (!b.hotelThumbnail || b.hotelThumbnail.includes('unsplash.com'))) {
                  return { ...b, hotelThumbnail: hotelMap[b.hotelId], hotelThumbnailUrl: hotelMap[b.hotelId] };
                }
                return b;
              });
              localStorage.setItem('traveloka_bookings', JSON.stringify(updated));
              return updated;
            });
          }
        } catch (enrichErr) {
          console.warn('Đồng bộ ảnh khách sạn cho bookings lỗi:', enrichErr);
        }
      }
    }
  };

  useEffect(() => {
    loadBookings();
    const handleUpdate = () => loadBookings();
    window.addEventListener('traveloka_bookings_updated', handleUpdate);
    return () => window.removeEventListener('traveloka_bookings_updated', handleUpdate);
  }, [isAuthenticated]);

  // Xử lý khi nhấn nút Hủy đặt phòng - hiển thị AlertModal xác nhận đồng nhất hệ thống
  const handleCancelBooking = (bookingItem) => {
    showAlert({
      title: 'Xác nhận hủy đặt phòng',
      message: `Bạn có chắc chắn muốn hủy đơn đặt phòng [${bookingItem.bookingCode || bookingItem.id}] và xóa khỏi danh sách không?`,
      type: 'warning',
      confirmText: 'Xác nhận hủy',
      cancelText: 'Đóng',
      showCancel: true,
      onConfirm: () => handleConfirmCancel(bookingItem)
    });
  };

  // Xử lý xác nhận hủy đặt phòng và xóa đơn khỏi danh sách
  const handleConfirmCancel = async (bookingItem) => {
    try {
      setIsCancelling(true);
      const targetBackendId = bookingItem.backendId 
        || (typeof bookingItem.id === 'number' ? bookingItem.id : null)
        || (bookingItem.bookingCode ? parseInt(String(bookingItem.bookingCode).replace(/\D/g, ''), 10) : null);

      if (targetBackendId) {
        const rawS = (bookingItem.rawStatus || bookingItem.status || '').toUpperCase();
        // Gọi API hủy đơn nếu đơn đang ở trạng thái PENDING hoặc CONFIRMED
        if (rawS === 'PENDING' || rawS === 'CONFIRMED') {
          try {
            await apiFetch(`/customer/bookings/${targetBackendId}/cancel`, {
              method: 'PUT',
              body: JSON.stringify({ reason: 'Khách hàng tự hủy trên website' })
            });
          } catch (apiErr) {
            console.warn('Lỗi gọi API hủy đơn backend:', apiErr);
          }
        }
      }

      // 1. Xóa đơn đặt phòng khỏi danh sách hiển thị
      const updated = bookings.filter(b => {
        if (b.id === bookingItem.id) return false;
        if (bookingItem.bookingCode && b.bookingCode === bookingItem.bookingCode) return false;
        if (bookingItem.backendId && b.backendId === bookingItem.backendId) return false;
        return true;
      });

      // 2. Cập nhật state và localStorage
      setBookings(updated);
      localStorage.setItem('traveloka_bookings', JSON.stringify(updated));

      // 3. Ghi nhớ ID đã xóa vào danh sách loại trừ để không nạp lại từ backend
      const deletedIds = JSON.parse(localStorage.getItem('traveloka_deleted_booking_ids') || '[]');
      const newDeletedIds = [...new Set([
        ...deletedIds,
        String(bookingItem.id),
        String(bookingItem.bookingCode),
        bookingItem.backendId ? String(bookingItem.backendId) : null,
        targetBackendId ? String(targetBackendId) : null
      ].filter(Boolean))];
      localStorage.setItem('traveloka_deleted_booking_ids', JSON.stringify(newDeletedIds));

      // 4. Phát sự kiện đồng bộ toàn hệ thống
      window.dispatchEvent(new Event('traveloka_bookings_updated'));
      showToast(`Đơn đặt phòng ${bookingItem.bookingCode || bookingItem.id} đã được hủy và xóa khỏi danh sách thành công!`, 'success');
    } catch (err) {
      console.error('Lỗi khi hủy đơn:', err);
      showToast('Có lỗi xảy ra khi hủy đơn đặt phòng. Vui lòng thử lại sau!', 'error');
    } finally {
      setIsCancelling(false);
    }
  };

  // Xử lý thanh toán trực tuyến qua VNPay cho đơn đặt phòng
  const handlePayNow = async (bookingItem) => {
    const targetBookingId = bookingItem.backendId 
      || (typeof bookingItem.id === 'number' ? bookingItem.id : null)
      || (bookingItem.bookingCode ? parseInt(String(bookingItem.bookingCode).replace(/\D/g, ''), 10) : null)
      || (typeof bookingItem.id === 'string' ? parseInt(bookingItem.id.replace(/\D/g, ''), 10) : null);

    if (!targetBookingId) {
      showAlert({
        title: 'Không thể thanh toán',
        message: 'Không tìm thấy ID hợp lệ của đơn đặt phòng này.',
        type: 'error'
      });
      return;
    }

    try {
      setPayingBookingId(bookingItem.id);
      const payResponse = await apiFetch('/customer/payments/create-url', {
        method: 'POST',
        body: JSON.stringify({
          bookingId: targetBookingId,
          paymentMethod: 'VNPAY'
        })
      });

      if (payResponse.ok) {
        const payData = await payResponse.json();
        const payResult = payData?.result;
        if (payResult?.paymentUrl) {
          window.location.href = payResult.paymentUrl;
          return;
        } else {
          showAlert({
            title: 'Thành công',
            message: payResult?.message || 'Đã tạo liên kết thanh toán thành công!',
            type: 'success'
          });
        }
      } else {
        const payErr = await payResponse.json().catch(() => ({}));
        const payMsg = getFriendlyErrorMessage(payErr, 'Lỗi kết nối cổng thanh toán.');
        showAlert({
          title: 'Lỗi cổng thanh toán',
          message: payMsg,
          type: 'error',
          confirmText: 'Đã hiểu'
        });
      }
    } catch (err) {
      console.error('Lỗi khi thanh toán đơn:', err);
      showAlert({
        title: 'Có lỗi xảy ra',
        message: 'Đã xảy ra lỗi trong quá trình kết nối cổng thanh toán: ' + sanitizeErrorMessage(err),
        type: 'error',
        confirmText: 'Đã hiểu'
      });
    } finally {
      setPayingBookingId(null);
    }
  };

  // Xóa toàn bộ lịch sử (Reset demo)
  const handleClearAll = () => {
    showAlert({
      title: 'Xóa toàn bộ lịch sử?',
      message: 'Bạn có chắc chắn muốn xóa toàn bộ lịch sử đặt phòng đã lưu không? ',
      type: 'warning',
      confirmText: 'Xóa toàn bộ',
      cancelText: 'Giữ lại',
      showCancel: true,
      onConfirm: () => {
        const allIds = bookings.flatMap(b => [String(b.id), String(b.bookingCode), b.backendId ? String(b.backendId) : null]).filter(Boolean);
        const deletedIds = JSON.parse(localStorage.getItem('traveloka_deleted_booking_ids') || '[]');
        localStorage.setItem('traveloka_deleted_booking_ids', JSON.stringify([...new Set([...deletedIds, ...allIds])]));
        localStorage.removeItem('traveloka_bookings');
        setBookings([]);
        window.dispatchEvent(new Event('traveloka_bookings_updated'));
      }
    });
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

            {bookings.length > 0 && (
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

        {/* Banner dành cho khách chưa đăng nhập */}
        {!isAuthenticated && (
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
              Đăng nhập
            </Link>
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
                        {/* Nút thanh toán ngay: Chỉ hiển thị cho đơn chưa thanh toán và chưa bị hủy */}
                        {b.paymentStatus !== 'paid' && b.status !== 'cancelled' && !b.isExpired && b.status !== 'completed' && b.status !== 'checked_in' && (
                          <button
                            onClick={() => handlePayNow(b)}
                            disabled={payingBookingId === b.id}
                            className="btn btn-warning btn-sm fw-bold d-inline-flex align-items-center justify-content-center gap-1 rounded-pill text-dark shadow-sm"
                            title="Thanh toán đơn đặt phòng qua cổng VNPay"
                          >
                            <CreditCard size={15} />
                            {payingBookingId === b.id ? 'Đang kết nối...' : 'Thanh toán ngay'}
                          </button>
                        )}

                        {/* Nút xem vé điện tử */}
                        <button 
                          onClick={() => navigate('/booking-success', { state: { booking: b } })}
                          className="btn btn-outline-primary btn-sm fw-semibold d-inline-flex align-items-center justify-content-center gap-1 rounded-pill"
                        >
                          <Eye size={15} /> Xem vé điện tử
                        </button>

                        {/* Nút Đánh giá khách sạn (FR-21) */}
                        {b.status === 'completed' && (
                          b.isReviewed ? (
                            <div className="badge bg-success-subtle text-success py-2 px-3 rounded-pill small border border-success-subtle d-inline-flex align-items-center justify-content-center gap-1">
                              <CheckCircle size={14} /> Đã đánh giá
                            </div>
                          ) : (
                            <button
                              onClick={() => handleOpenReviewModal(b)}
                              className="btn btn-warning btn-sm fw-bold d-inline-flex align-items-center justify-content-center gap-1 rounded-pill text-dark shadow-sm"
                            >
                              <Star size={15} fill="#ffc107" /> Đánh giá khách sạn
                            </button>
                          )
                        )}

                        {/* Nút hủy phòng / xóa đơn khỏi danh sách */}
                        {b.status !== 'checked_in' && (
                          <button 
                            onClick={() => handleCancelBooking(b)} 
                            className="btn btn-link text-danger text-decoration-none btn-sm"
                          >
                            Hủy đặt phòng này
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* Toast thông báo nổi đồng nhất hệ thống (showToast) */}
      {toastMessage && (
        <div
          className="position-fixed top-0 start-50 translate-middle-x mt-4"
          style={{ zIndex: 99999, maxWidth: 'calc(100vw - 32px)' }}
        >
          <div className={`alert ${toastType === 'error' ? 'alert-danger' : 'alert-success'} shadow-lg border-0 rounded-pill px-4 py-2 d-flex align-items-center gap-2 mb-0`}>
            {toastType === 'error'
              ? <AlertCircle size={18} className="text-danger" />
              : <CheckCircle size={18} className="text-success" />}
            <span className="fw-semibold small">{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Modal Thông Báo Thân Thiện Người Dùng */}
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={closeAlert}
        type={alertModal.type}
        title={alertModal.title}
        message={alertModal.message}
        confirmText={alertModal.confirmText}
        cancelText={alertModal.cancelText}
        showCancel={alertModal.showCancel}
        onConfirm={alertModal.onConfirm}
      />

      {/* Modal Đánh Giá Khách Sạn (FR-21) */}
      {reviewModal.isOpen && reviewModal.booking && (
        <div 
          className="modal fade show d-block" 
          tabIndex="-1" 
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)', zIndex: 1050 }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow-lg overflow-hidden">
              <div className="modal-header bg-primary text-white border-0 px-4 py-3">
                <div>
                  <h5 className="modal-title fw-bold mb-0 d-flex align-items-center gap-2">
                    <Star size={20} fill="#ffc107" className="text-warning" />
                    Đánh Giá Kỳ Nghỉ
                  </h5>
                  <span className="small opacity-75">{reviewModal.booking.hotelName}</span>
                </div>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={handleCloseReviewModal}
                  disabled={reviewModal.submitting}
                />
              </div>

              <form onSubmit={handleSubmitReview}>
                <div className="modal-body p-4">
                  {/* Thông tin phòng đã lưu trú */}
                  <div className="bg-light p-3 rounded-3 mb-3 border">
                    <div className="d-flex justify-content-between align-items-center small">
                      <span className="text-secondary">Phòng đã đặt:</span>
                      <strong className="text-dark">{reviewModal.booking.roomName}</strong>
                    </div>
                    <div className="d-flex justify-content-between align-items-center small mt-1">
                      <span className="text-secondary">Thời gian lưu trú:</span>
                      <span className="text-dark">{reviewModal.booking.checkInDate} ➔ {reviewModal.booking.checkOutDate}</span>
                    </div>
                  </div>

                  {/* Chọn điểm số từ 1 đến 10 */}
                  <div className="mb-4 text-center">
                    <label className="form-label fw-bold d-block text-dark mb-2">
                      Bạn đánh giá kỳ nghỉ này bao nhiêu điểm?
                    </label>
                    <div className="d-flex justify-content-center align-items-center gap-1 flex-wrap mb-2">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                        const isSelected = reviewModal.rating === num;
                        return (
                          <button
                            key={num}
                            type="button"
                            onClick={() => setReviewModal(prev => ({ ...prev, rating: num }))}
                            className={`btn btn-sm rounded-circle fw-bold ${
                              isSelected 
                                ? 'btn-primary text-white shadow' 
                                : 'btn-outline-secondary border-opacity-50'
                            }`}
                            style={{ width: 36, height: 36, padding: 0 }}
                          >
                            {num}
                          </button>
                        );
                      })}
                    </div>
                    <div className="fw-bold fs-6 text-primary">
                      {reviewModal.rating === 10 && '🌟 10/10 - Tuyệt hảo! Trải nghiệm hoàn hảo'}
                      {reviewModal.rating === 9 && '✨ 9/10 - Xuất sắc! Vượt ngoài mong đợi'}
                      {reviewModal.rating === 8 && '👍 8/10 - Rất tốt! Rất hài lòng'}
                      {reviewModal.rating === 7 && '😊 7/10 - Tốt! Đạt yêu cầu'}
                      {reviewModal.rating >= 5 && reviewModal.rating <= 6 && `😐 ${reviewModal.rating}/10 - Tạm ổn / Bình thường`}
                      {reviewModal.rating < 5 && `⚠️ ${reviewModal.rating}/10 - Cần cải thiện dịch vụ`}
                    </div>
                  </div>

                  {/* Nhận xét văn bản */}
                  <div className="mb-3">
                    <label className="form-label fw-bold text-dark mb-1">
                      Nhận xét chi tiết của bạn <span className="text-danger">*</span>
                    </label>
                    <textarea
                      rows="4"
                      className="form-control rounded-3"
                      placeholder="Chia sẻ trải nghiệm của bạn về phòng ốc, vệ sinh, dịch vụ, thái độ nhân viên và vị trí khách sạn..."
                      value={reviewModal.comment}
                      onChange={(e) => setReviewModal(prev => ({ ...prev, comment: e.target.value, error: null }))}
                      disabled={reviewModal.submitting}
                      required
                    />
                    <div className="form-text text-secondary small">
                      Đánh giá của bạn sẽ hiển thị công khai trên trang chi tiết khách sạn kèm huy hiệu "✓ Đã xác thực kỳ nghỉ".
                    </div>
                  </div>

                  {/* Thông báo lỗi nếu có */}
                  {reviewModal.error && (
                    <div className="alert alert-danger py-2 px-3 small rounded-3 mb-0">
                      {reviewModal.error}
                    </div>
                  )}
                </div>

                <div className="modal-footer bg-light px-4 py-3 border-top">
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary rounded-pill px-4"
                    onClick={handleCloseReviewModal}
                    disabled={reviewModal.submitting}
                  >
                    Hủy
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm"
                    disabled={reviewModal.submitting}
                  >
                    {reviewModal.submitting ? 'Đang gửi...' : 'Gửi Đánh Giá'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
