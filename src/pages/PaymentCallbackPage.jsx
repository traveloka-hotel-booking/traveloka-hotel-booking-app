import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../services/api';
import { CheckCircle2, XCircle, ArrowRight, Home, RefreshCw, ShieldCheck } from 'lucide-react';

export default function PaymentCallbackPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [paymentResult, setPaymentResult] = useState(null);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    verifyPayment();
  }, [location.search]);

  const verifyPayment = async () => {
    try {
      const searchParams = new URLSearchParams(location.search);
      const queryString = searchParams.toString();

      if (!queryString) {
        setError('Không tìm thấy thông tin phản hồi từ cổng thanh toán VNPay.');
        setLoading(false);
        return;
      }

      // Gọi API Backend để xác thực chữ ký số HMAC-SHA512 và cập nhật DB
      const response = await apiFetch(`/customer/payments/vnpay-callback?${queryString}`, {
        method: 'GET'
      });

      const data = await response.json();

      if (response.ok && data?.result) {
        const result = data.result;
        setPaymentResult(result);

        // Đồng bộ trạng thái đơn hàng trong localStorage
        let targetBooking = null;
        try {
          const bookings = JSON.parse(localStorage.getItem('traveloka_bookings') || '[]');
          const updatedBookings = bookings.map(b => {
            if (b.backendBookingId === result.bookingId || b.id === `BK-${String(result.bookingId).padStart(4, '0')}`) {
              const updated = {
                ...b,
                contactName: (b.contactName && b.contactName !== 'Khách hàng') ? b.contactName : (user?.fullName || user?.name || b.contactName || 'Khách hàng'),
                guestName: (b.guestName && b.guestName !== 'Khách hàng') ? b.guestName : (user?.fullName || user?.name || b.guestName || 'Khách hàng'),
                contactEmail: b.contactEmail || user?.email || '',
                contactPhone: b.contactPhone || user?.phone || '',
                status: result.status === 'SUCCESS' ? 'confirmed' : 'failed',
                paymentStatus: result.status,
                transactionId: result.transactionId,
                paymentDate: result.paymentDate
              };
              targetBooking = updated;
              return updated;
            }
            return b;
          });
          localStorage.setItem('traveloka_bookings', JSON.stringify(updatedBookings));
          if (!targetBooking && updatedBookings.length > 0) {
            targetBooking = updatedBookings[0];
          }
          if (targetBooking) {
            if (!targetBooking.contactName || targetBooking.contactName === 'Khách hàng') {
              targetBooking.contactName = user?.fullName || user?.name || targetBooking.contactName || 'Khách hàng';
            }
            if (!targetBooking.guestName || targetBooking.guestName === 'Khách hàng') {
              targetBooking.guestName = user?.fullName || user?.name || targetBooking.guestName || 'Khách hàng';
            }
            if (!targetBooking.contactEmail) {
              targetBooking.contactEmail = user?.email || '';
            }
            if (!targetBooking.contactPhone) {
              targetBooking.contactPhone = user?.phone || '';
            }
          }
          setConfirmedBooking(targetBooking);
        } catch (e) {
          console.warn('Lỗi khi cập nhật localStorage bookings:', e);
        }

        // Nếu thanh toán thành công, tự động chuyển về trang Booking Success sau 3 giây
        if (result.status === 'SUCCESS') {
          setTimeout(() => {
            navigate('/booking-success', {
              state: { booking: targetBooking }
            });
          }, 3000);
        }
      } else {
        setError(data?.message || 'Xác thực thanh toán thất bại từ cổng VNPay.');
      }
    } catch (err) {
      console.error('Lỗi khi xử lý callback VNPay:', err);
      setError('Đã có lỗi xảy ra trong quá trình xác thực giao dịch.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center bg-light">
        <div className="spinner-border text-primary mb-3" style={{ width: '3.5rem', height: '3.5rem' }} role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <h4 className="fw-bold text-dark mb-1">Đang Xác Thực Giao Dịch VNPay...</h4>
        <p className="text-secondary small">Vui lòng không tắt hoặc tải lại trang này trong giây lát</p>
      </div>
    );
  }

  const isSuccess = paymentResult?.status === 'SUCCESS';

  return (
    <div className="min-vh-100 bg-light py-5 d-flex align-items-center">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-6 col-md-8 col-12">
            <div className="card border-0 shadow-lg rounded-4 overflow-hidden text-center p-4 p-md-5 bg-white">
              
              {isSuccess ? (
                <>
                  <div className="d-inline-flex p-3 bg-success-subtle text-success rounded-circle mb-3 mx-auto">
                    <CheckCircle2 size={56} />
                  </div>
                  <h3 className="fw-bold text-success mb-2">Thanh Toán VNPay Thành Công!</h3>
                  <p className="text-secondary mb-4">
                    Giao dịch của bạn đã được xác thực an toàn qua hệ thống cổng thanh toán VNPay Sandbox.
                  </p>

                  <div className="bg-light p-3 rounded-3 text-start mb-4 border">
                    <div className="d-flex justify-content-between py-2 border-bottom">
                      <span className="text-secondary small">Mã đơn đặt phòng:</span>
                      <strong className="text-dark">BK-{String(paymentResult.bookingId).padStart(4, '0')}</strong>
                    </div>
                    <div className="d-flex justify-content-between py-2 border-bottom">
                      <span className="text-secondary small">Mã giao dịch VNPay:</span>
                      <span className="badge bg-primary-subtle text-primary">{paymentResult.transactionId}</span>
                    </div>
                    <div className="d-flex justify-content-between py-2 border-bottom">
                      <span className="text-secondary small">Số tiền thanh toán:</span>
                      <strong className="text-danger fs-6">{Number(paymentResult.amount).toLocaleString('vi-VN')} đ</strong>
                    </div>
                    <div className="d-flex justify-content-between py-2">
                      <span className="text-secondary small">Phương thức:</span>
                      <span className="fw-bold text-dark">Cổng thanh toán VNPAY-QR / ATM</span>
                    </div>
                  </div>

                  <div className="d-flex flex-column flex-sm-row gap-2 justify-content-center">
                    <button
                      onClick={() => navigate('/booking-success', {
                        state: { booking: confirmedBooking }
                      })}
                      className="btn btn-primary px-4 py-2 fw-bold d-inline-flex align-items-center justify-content-center gap-2 shadow-sm"
                    >
                      Xem Vé & Hóa Đơn Ngay <ArrowRight size={18} />
                    </button>
                    <Link to="/my-bookings" className="btn btn-outline-secondary px-4 py-2">
                      Chuyến đi của tôi
                    </Link>
                  </div>
                  <small className="text-secondary mt-3 d-block fst-italic">
                    Hệ thống sẽ tự động chuyển hướng sau 3 giây...
                  </small>
                </>
              ) : (
                <>
                  <div className="d-inline-flex p-3 bg-danger-subtle text-danger rounded-circle mb-3 mx-auto">
                    <XCircle size={56} />
                  </div>
                  <h3 className="fw-bold text-danger mb-2">Thanh Toán Chưa Hoàn Tất</h3>
                  <p className="text-secondary mb-4">
                    {error || paymentResult?.message || 'Giao dịch của bạn đã bị hủy hoặc có lỗi xảy ra trong quá trình trừ tiền trên VNPay.'}
                  </p>

                  <div className="d-flex flex-column flex-sm-row gap-2 justify-content-center">
                    <button
                      onClick={() => navigate('/checkout')}
                      className="btn btn-primary px-4 py-2 fw-bold d-inline-flex align-items-center justify-content-center gap-2"
                    >
                      <RefreshCw size={18} /> Thử Thanh Toán Lại
                    </button>
                    <Link to="/" className="btn btn-outline-secondary px-4 py-2 d-inline-flex align-items-center justify-content-center gap-1">
                      <Home size={18} /> Về Trang Chủ
                    </Link>
                  </div>
                </>
              )}

              <div className="mt-4 pt-3 border-top d-flex align-items-center justify-content-center gap-2 text-secondary small">
                <ShieldCheck size={16} className="text-success" />
                <span>Giao dịch được bảo vệ và mã hóa bởi VNPay Sandbox Security</span>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
