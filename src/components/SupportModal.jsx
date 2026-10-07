import React, { useState } from 'react';
import { 
  Headphones, Phone, MessageCircle, Mail, Clock, 
  HelpCircle, ChevronDown, ChevronUp, CheckCircle2, Send, X, ShieldCheck 
} from 'lucide-react';
import { useAlert } from '../context/AlertContext';

export default function SupportModal({ isOpen, onClose }) {
  const { showAlert } = useAlert();
  // State form gửi yêu cầu
  const [bookingCode, setBookingCode] = useState('');
  const [issueType, setIssueType] = useState('cancel_refund');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // State đóng mở các câu hỏi FAQ
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const faqList = [
    {
      q: "Làm thế nào để hủy phòng và nhận lại tiền hoàn?",
      a: "Bạn có thể vào trang 'Chuyến đi của tôi' từ menu tài khoản, chọn đơn đặt phòng tương ứng và bấm nút 'Hủy đặt phòng này'. Nếu phòng có chính sách 'Miễn phí hủy phòng', tiền sẽ được hoàn trả tự động vào tài khoản của bạn trong 24-48 giờ làm việc."
    },
    {
      q: "Tôi có thể đổi ngày nhận phòng (Check-in) được không?",
      a: "Tùy thuộc vào tình trạng phòng trống thực tế của khách sạn. Bạn vui lòng liên hệ trực tiếp số Hotline 1900 1234 hoặc gửi tin nhắn kèm Mã đặt phòng để nhân viên CSKH hỗ trợ dời ngày miễn phí."
    },
    {
      q: "Làm thế nào để xuất trình vé khi đến khách sạn nhận phòng?",
      a: "Bạn chỉ cần mở trang 'Chuyến đi của tôi' ➔ bấm 'Xem vé điện tử' và đưa Mã QR Check-in cùng Căn cước công dân/Hộ chiếu cho nhân viên lễ tân khách sạn để nhận phòng ngay lập tức mà không cần in giấy."
    },
    {
      q: "Khách sạn có cho phép nhận phòng sớm hoặc trả phòng trễ không?",
      a: "Giờ nhận phòng tiêu chuẩn là từ 14:00 và trả phòng trước 12:00. Khách sạn sẽ hỗ trợ nhận phòng sớm nếu có phòng sạch sẵn sàng mà không tính thêm phụ phí."
    }
  ];

  const handleSubmitTicket = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setBookingCode('');
      setMessage('');
      onClose();
    }, 3000);
  };

  if (!isOpen) return null;

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1200 }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content rounded-4 border-0 shadow-lg overflow-hidden">
          
          {/* Modal Header */}
          <div className="bg-primary text-white p-4 d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-3">
              <div className="p-2 bg-white bg-opacity-25 rounded-3">
                <Headphones size={28} />
              </div>
              <div>
                <h5 className="modal-title fw-bold mb-0">Trung Tâm Chăm Sóc Khách Hàng 24/7</h5>
                <small className="opacity-75">Traveloka luôn sẵn sàng đồng hành cùng chuyến đi của bạn</small>
              </div>
            </div>
            <button 
              type="button" 
              className="btn-close btn-close-white" 
              onClick={onClose}
            ></button>
          </div>

          <div className="modal-body p-4 bg-light" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
            
            {/* KHỐI 1: 3 KÊNH HỖ TRỢ TRỰC TIẾP */}
            <div className="row g-3 mb-4">
              
              {/* Kênh 1: Hotline */}
              <div className="col-md-4 col-12">
                <div className="p-3 bg-white rounded-3 shadow-sm border text-center h-100 d-flex flex-column justify-content-between">
                  <div>
                    <div className="d-inline-flex p-3 bg-danger-subtle text-danger rounded-circle mb-2">
                      <Phone size={24} />
                    </div>
                    <strong className="d-block text-dark small mb-1">Tổng Đài Khẩn Cấp</strong>
                    <span className="fs-5 fw-bold text-danger d-block">1900 1234</span>
                    <small className="text-secondary d-block mt-1" style={{ fontSize: '11px' }}>
                      Cước phí 1.000đ/phút • Hoạt động 24/7
                    </small>
                  </div>
                  <a href="tel:19001234" className="btn btn-outline-danger btn-sm rounded-pill mt-3 fw-semibold">
                    Gọi ngay
                  </a>
                </div>
              </div>

              {/* Kênh 2: Trò chuyện trực tuyến */}
              <div className="col-md-4 col-12">
                <div className="p-3 bg-white rounded-3 shadow-sm border text-center h-100 d-flex flex-column justify-content-between">
                  <div>
                    <div className="d-inline-flex p-3 bg-success-subtle text-success rounded-circle mb-2">
                      <MessageCircle size={24} />
                    </div>
                    <strong className="d-block text-dark small mb-1">Trò Chuyện Trực Tuyến</strong>
                    <span className="text-success small fw-semibold d-block">● Trợ lý AI đang online</span>
                    <small className="text-secondary d-block mt-1" style={{ fontSize: '11px' }}>
                      Phản hồi tức thì trong 10 giây
                    </small>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => showAlert({
                      title: 'Kết nối CSKH Trực Tuyến',
                      message: 'Đang kết nối tới chuyên viên CSKH Traveloka... Vui lòng chờ trong giây lát!',
                      type: 'info'
                    })}
                    className="btn btn-outline-success btn-sm rounded-pill mt-3 fw-semibold"
                  >
                    Bắt đầu chat
                  </button>
                </div>
              </div>

              {/* Kênh 3: Email */}
              <div className="col-md-4 col-12">
                <div className="p-3 bg-white rounded-3 shadow-sm border text-center h-100 d-flex flex-column justify-content-between">
                  <div>
                    <div className="d-inline-flex p-3 bg-primary-subtle text-primary rounded-circle mb-2">
                      <Mail size={24} />
                    </div>
                    <strong className="d-block text-dark small mb-1">Hộp Thư Hỗ Trợ</strong>
                    <span className="text-primary small fw-semibold text-truncate d-block">support@traveloka.vn</span>
                    <small className="text-secondary d-block mt-1" style={{ fontSize: '11px' }}>
                      Phản hồi trong 15-30 phút
                    </small>
                  </div>
                  <a href="mailto:support@traveloka.vn" className="btn btn-outline-primary btn-sm rounded-pill mt-3 fw-semibold">
                    Gửi email
                  </a>
                </div>
              </div>

            </div>

            {/* KHỐI 2: FORM GỬI YÊU CẦU TRỢ GIÚP */}
            <div className="card border-0 shadow-sm rounded-3 p-4 bg-white mb-4">
              <h6 className="fw-bold text-dark mb-2 d-flex align-items-center gap-2">
                <Send size={18} className="text-primary" /> Gửi Yêu Cầu Hỗ Trợ Trực Tuyến
              </h6>
              <p className="text-secondary small mb-3">
                Nếu bạn có thắc mắc về đơn đặt phòng hoặc khiếu nại dịch vụ, hãy điền thông tin bên dưới để bộ phận CSKH xử lý ngay:
              </p>

              {submitted ? (
                <div className="alert alert-success d-flex align-items-center gap-2 py-3 rounded-3">
                  <CheckCircle2 size={20} className="text-success flex-shrink-0" />
                  <div>
                    <strong className="d-block">Gửi yêu cầu thành công!</strong>
                    <small>Mã yêu cầu #TK-{Math.floor(1000 + Math.random() * 9000)} đã được ghi nhận. Nhân viên CSKH sẽ liên hệ với bạn trong vòng 15 phút.</small>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmitTicket} className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-dark mb-1">
                      Mã đặt phòng (Booking ID) <span className="text-secondary fw-normal">(nếu có)</span>
                    </label>
                    <input 
                      type="text" 
                      className="form-control form-control-sm text-uppercase font-monospace"
                      placeholder="VD: TVLK-462431"
                      value={bookingCode}
                      onChange={(e) => setBookingCode(e.target.value)}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-dark mb-1">Vấn đề cần trợ giúp *</label>
                    <select 
                      className="form-select form-select-sm"
                      value={issueType}
                      onChange={(e) => setIssueType(e.target.value)}
                    >
                      <option value="cancel_refund">Hủy phòng & Hoàn tiền</option>
                      <option value="reschedule">Thay đổi ngày nhận/trả phòng</option>
                      <option value="invoice">Yêu cầu hóa đơn VAT</option>
                      <option value="checkin">Hỗ trợ nhận phòng tại khách sạn</option>
                      <option value="other">Vấn đề khác</option>
                    </select>
                  </div>

                  <div className="col-12">
                    <label className="form-label small fw-semibold text-dark mb-1">Chi tiết yêu cầu *</label>
                    <textarea 
                      rows="3" 
                      className="form-control form-control-sm"
                      placeholder="Mô tả cụ thể thắc mắc hoặc yêu cầu của bạn để nhân viên hỗ trợ nhanh nhất..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                    ></textarea>
                  </div>

                  <div className="col-12 text-end">
                    <button type="submit" className="btn btn-primary btn-sm px-4 rounded-pill fw-bold">
                      Gửi Yêu Cầu Hỗ Trợ
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* KHỐI 3: CÁC CÂU HỎI THƯỜNG GẶP (FAQ) */}
            <div className="card border-0 shadow-sm rounded-3 p-4 bg-white">
              <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                <HelpCircle size={18} className="text-primary" /> Câu Hỏi Thường Gặp (FAQ)
              </h6>
              
              <div className="d-flex flex-column gap-2">
                {faqList.map((faq, index) => (
                  <div key={index} className="border rounded-3 overflow-hidden">
                    <button 
                      type="button"
                      onClick={() => toggleFaq(index)}
                      className="btn w-100 text-start p-3 fw-semibold small text-dark d-flex justify-content-between align-items-center bg-light bg-opacity-50"
                    >
                      <span>{faq.q}</span>
                      {openFaqIndex === index ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    {openFaqIndex === index && (
                      <div className="p-3 small text-secondary bg-white border-top">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>

          <div className="modal-footer border-top bg-white p-3">
            <button type="button" className="btn btn-secondary btn-sm rounded-pill px-4" onClick={onClose}>
              Đóng
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
