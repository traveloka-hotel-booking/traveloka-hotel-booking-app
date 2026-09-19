import React, { useState, useEffect } from 'react';
import { 
  BookOpen, RotateCcw, FileText, Shield, Handshake, 
  X, CheckCircle, ArrowRight, Phone, Mail, Clock, HelpCircle, 
  Sparkles, AlertCircle, ExternalLink, Calendar, MapPin
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PolicyModal({ isOpen, onClose, initialTab = 'booking_guide' }) {
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  if (!isOpen) return null;

  const tabs = [
    { id: 'booking_guide', label: 'Hướng dẫn đặt phòng', icon: <BookOpen size={17} /> },
    { id: 'cancellation', label: 'Chính sách hoàn hủy', icon: <RotateCcw size={17} /> },
    { id: 'terms', label: 'Điều khoản sử dụng', icon: <FileText size={17} /> },
    { id: 'privacy', label: 'Chính sách bảo mật', icon: <Shield size={17} /> },
    { id: 'partner', label: 'Liên hệ hợp tác', icon: <Handshake size={17} /> }
  ];

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.65)', zIndex: 1250 }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content rounded-4 border-0 shadow-lg overflow-hidden">
          
          {/* Header Modal */}
          <div className="bg-primary text-white p-4 d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-3">
              <div className="p-2 bg-white bg-opacity-25 rounded-3">
                <FileText size={26} />
              </div>
              <div>
                <h5 className="modal-title fw-bold mb-0">Trung Tâm Chính Sách & Điều Khoản Dịch Vụ</h5>
                <small className="opacity-75">Quy định minh bạch, bảo vệ quyền lợi tối đa cho khách hàng Traveloka</small>
              </div>
            </div>
            <button 
              type="button" 
              className="btn-close btn-close-white" 
              onClick={onClose}
            ></button>
          </div>

          {/* Thanh chuyển đổi Tab */}
          <div className="bg-light border-bottom px-3 pt-2 d-flex gap-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`btn btn-sm py-2 px-3 fw-semibold border-bottom-0 rounded-top-3 d-flex align-items-center gap-2 text-nowrap transition-all ${
                  activeTab === tab.id 
                    ? 'bg-white text-primary border-top border-start border-end shadow-sm' 
                    : 'text-secondary hover-bg-white'
                }`}
                style={{ marginBottom: '-1px' }}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Nội dung chi tiết của từng Tab */}
          <div className="modal-body p-4 p-md-5 bg-white" style={{ maxHeight: '68vh', overflowY: 'auto' }}>
            
            {/* 1. TAB HƯỚNG DẪN ĐẶT PHÒNG */}
            {activeTab === 'booking_guide' && (
              <div>
                <div className="d-flex align-items-center gap-2 mb-3 text-primary">
                  <BookOpen size={24} />
                  <h5 className="fw-bold text-dark mb-0">Quy Trình 5 Bước Đặt Phòng Khách Sạn Trực Tuyến</h5>
                </div>
                <p className="text-secondary small mb-4">
                  Traveloka cung cấp trải nghiệm đặt phòng dễ dàng, nhanh chóng trong vòng chưa đầy 2 phút với các bước hướng dẫn cụ thể sau:
                </p>

                <div className="d-flex flex-column gap-3 mb-4">
                  
                  <div className="p-3 bg-light rounded-3 border d-flex gap-3 align-items-start">
                    <div className="badge bg-primary rounded-circle p-2 fs-6 flex-shrink-0" style={{ width: '32px', height: '32px' }}>
                      1
                    </div>
                    <div>
                      <strong className="text-dark d-block mb-1">Tìm kiếm điểm đến & Ngày lưu trú</strong>
                      <span className="small text-secondary">
                        Tại trang chủ, nhập Thành phố (VD: Hà Nội, Đà Nẵng, TP.HCM...), chọn Ngày nhận phòng (Check-in), Ngày trả phòng (Check-out) và số lượng khách (Phòng, Người lớn, Trẻ em) rồi bấm <em>"Kiểm tra phòng trống"</em>.
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-light rounded-3 border d-flex gap-3 align-items-start">
                    <div className="badge bg-primary rounded-circle p-2 fs-6 flex-shrink-0" style={{ width: '32px', height: '32px' }}>
                      2
                    </div>
                    <div>
                      <strong className="text-dark d-block mb-1">Lựa chọn Khách sạn & Hạng phòng ưng ý</strong>
                      <span className="small text-secondary">
                        Sử dụng bộ lọc linh hoạt theo số sao (1-5 sao), khoảng giá và tiện ích (hồ bơi, bữa sáng, wifi, bãi biển). Xem ảnh thực tế, tiện nghi và bấm <em>"Đặt phòng ngay"</em> tại hạng phòng bạn chọn.
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-light rounded-3 border d-flex gap-3 align-items-start">
                    <div className="badge bg-primary rounded-circle p-2 fs-6 flex-shrink-0" style={{ width: '32px', height: '32px' }}>
                      3
                    </div>
                    <div>
                      <strong className="text-dark d-block mb-1">Điền thông tin khách lưu trú chính xác</strong>
                      <span className="small text-secondary">
                        Nhập Họ tên đầy đủ (trùng với CCCD/Hộ chiếu), Số điện thoại di động và Email nhận vé. Khách hàng có thể ghi chú thêm yêu cầu đặc biệt như: phòng không hút thuốc, tầng cao, 1 giường đôi lớn...
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-light rounded-3 border d-flex gap-3 align-items-start">
                    <div className="badge bg-primary rounded-circle p-2 fs-6 flex-shrink-0" style={{ width: '32px', height: '32px' }}>
                      4
                    </div>
                    <div>
                      <strong className="text-dark d-block mb-1">Thanh toán linh hoạt & An toàn</strong>
                      <span className="small text-secondary">
                        Khách có thể chọn thanh toán trực tuyến qua <strong>Cổng VNPAY QR, Thẻ Visa/Mastercard, Ví MoMo</strong> hoặc chọn <strong>"Thanh toán trực tiếp bằng tiền mặt tại khách sạn khi nhận phòng"</strong> mà không cần thẻ.
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-light rounded-3 border d-flex gap-3 align-items-start">
                    <div className="badge bg-success rounded-circle p-2 fs-6 flex-shrink-0" style={{ width: '32px', height: '32px' }}>
                      5
                    </div>
                    <div>
                      <strong className="text-dark d-block mb-1">Nhận Vé điện tử E-Voucher & Check-in tức thì</strong>
                      <span className="small text-secondary">
                        Hệ thống cấp ngay Mã đặt phòng (Booking ID: <code>TVLK-xxxxxx</code>) và Mã QR check-in gửi về Email. Khi đến khách sạn, bạn chỉ cần xuất trình mã QR trên điện thoại kèm CCCD là nhận phòng ngay lập tức.
                      </span>
                    </div>
                  </div>

                </div>

                <div className="alert alert-info border-0 rounded-3 small text-dark d-flex align-items-center gap-2">
                  <Sparkles size={18} className="text-primary flex-shrink-0" />
                  <span><strong>Mẹo du lịch:</strong> Bạn có thể tạo tài khoản hoặc đăng nhập trước khi đặt phòng để tự động tích lũy điểm thưởng Traveloka Points và lưu trữ chuyến đi vĩnh viễn trên mọi thiết bị.</span>
                </div>
              </div>
            )}

            {/* 2. TAB CHÍNH SÁCH HOÀN HỦY */}
            {activeTab === 'cancellation' && (
              <div>
                <div className="d-flex align-items-center gap-2 mb-3 text-danger">
                  <RotateCcw size={24} />
                  <h5 className="fw-bold text-dark mb-0">Chính Sách Hủy Phòng, Đổi Lịch Trình & Hoàn Tiền</h5>
                </div>
                <p className="text-secondary small mb-4">
                  Traveloka cam kết chính sách minh bạch giúp khách hàng an tâm đặt phòng ngay cả khi có thay đổi kế hoạch đột xuất:
                </p>

                <div className="card border-0 shadow-sm rounded-3 p-3 bg-light mb-3">
                  <h6 className="fw-bold text-dark small mb-2 d-flex align-items-center gap-2">
                    <CheckCircle size={16} className="text-success" /> 1. Miễn phí hủy phòng (Free Cancellation)
                  </h6>
                  <p className="small text-secondary mb-0">
                    Đối với các phòng có chính sách <strong>"Miễn phí hủy phòng"</strong>, khách hàng được quyền hủy đơn và nhận lại 100% số tiền đã thanh toán nếu thực hiện thao tác hủy trước thời hạn quy định (thường từ 24 đến 48 giờ trước 14:00 ngày nhận phòng).
                  </p>
                </div>

                <div className="card border-0 shadow-sm rounded-3 p-3 bg-light mb-3">
                  <h6 className="fw-bold text-dark small mb-2 d-flex align-items-center gap-2">
                    <Clock size={16} className="text-primary" /> 2. Thời gian xử lý hoàn tiền (Refund Timeline)
                  </h6>
                  <ul className="small text-secondary mb-0 ps-3">
                    <li><strong>Thanh toán qua Ví điện tử (MoMo/ZaloPay) & VNPAY QR:</strong> Tiền được hoàn trả tự động vào tài khoản của bạn trong vòng <strong>24 - 48 giờ làm việc</strong>.</li>
                    <li><strong>Thanh toán qua Thẻ tín dụng/Ghi nợ quốc tế (Visa/Mastercard):</strong> Tiền được hoàn vào hạn mức thẻ trong vòng <strong>3 - 7 ngày làm việc</strong> tùy chính sách ngân hàng phát hành thẻ.</li>
                  </ul>
                </div>

                <div className="card border-0 shadow-sm rounded-3 p-3 bg-light mb-3">
                  <h6 className="fw-bold text-dark small mb-2 d-flex align-items-center gap-2">
                    <Calendar size={16} className="text-warning" /> 3. Thay đổi ngày lưu trú (Reschedule)
                  </h6>
                  <p className="small text-secondary mb-0">
                    Khách hàng có thể yêu cầu dời ngày nhận phòng bằng cách liên hệ Hotline <strong>1900 1234</strong> hoặc gửi yêu cầu trợ giúp trực tuyến. Việc đổi ngày sẽ được khách sạn hỗ trợ miễn phí nếu còn phòng trống cùng hạng.
                  </p>
                </div>

                <div className="card border-0 shadow-sm rounded-3 p-3 bg-light mb-3">
                  <h6 className="fw-bold text-dark small mb-2 d-flex align-items-center gap-2">
                    <AlertCircle size={16} className="text-danger" /> 4. Trường hợp bất khả kháng (Force Majeure)
                  </h6>
                  <p className="small text-secondary mb-0">
                    Trong trường hợp thiên tai, bão lũ, dịch bệnh bùng phát hoặc chuyến bay bị hủy bởi hãng hàng không, Traveloka sẽ hỗ trợ khách hàng hủy phòng và hoàn tiền 100% khi có bằng chứng xác nhận chính thức.
                  </p>
                </div>
              </div>
            )}

            {/* 3. TAB ĐIỀU KHOẢN SỬ DỤNG */}
            {activeTab === 'terms' && (
              <div>
                <div className="d-flex align-items-center gap-2 mb-3 text-primary">
                  <FileText size={24} />
                  <h5 className="fw-bold text-dark mb-0">Điều Khoản & Điều Kiện Sử Dụng Dịch Vụ</h5>
                </div>
                <p className="text-secondary small mb-4">
                  Bằng việc truy cập và sử dụng dịch vụ trên nền tảng Traveloka, bạn đồng ý tuân thủ các điều khoản hợp đồng dịch vụ sau:
                </p>

                <div className="d-flex flex-column gap-3 small text-secondary">
                  <div>
                    <strong className="text-dark d-block mb-1">1. Quyền hạn và vai trò của nền tảng</strong>
                    <p className="mb-0">
                      Traveloka đóng vai trò là sàn thương mại điện tử du lịch trung gian, kết nối khách hàng với các cơ sở lưu trú (khách sạn, khu nghỉ dưỡng, homestay) hoạt động hợp pháp tại Việt Nam. Traveloka đảm bảo tính chính xác của đơn đặt phòng và hỗ trợ xử lý mọi khiếu nại phát sinh trong suốt kỳ nghỉ của bạn.
                    </p>
                  </div>

                  <div>
                    <strong className="text-dark d-block mb-1">2. Cam kết giữ phòng (Booking Guarantee)</strong>
                    <p className="mb-0">
                      Khi đơn đặt phòng được phát hành trạng thái "Đã xác nhận", phòng của khách đã được giữ chỗ chắc chắn tại khách sạn. Cơ sở lưu trú không được phép tự ý hủy phòng hoặc tăng giá phòng của khách dưới bất kỳ hình thức nào.
                    </p>
                  </div>

                  <div>
                    <strong className="text-dark d-block mb-1">3. Giờ nhận phòng và trả phòng tiêu chuẩn</strong>
                    <p className="mb-0">
                      Thời gian nhận phòng tiêu chuẩn (Check-in) là từ <strong>14:00</strong> cùng ngày. Thời gian trả phòng tiêu chuẩn (Check-out) là trước <strong>12:00</strong> trưa ngày kế tiếp. Khách sạn có quyền tính phụ phí nếu khách trả phòng trễ sau giờ quy định mà không thông báo trước.
                    </p>
                  </div>

                  <div>
                    <strong className="text-dark d-block mb-1">4. Giá cả minh bạch & Không phụ phí ẩn</strong>
                    <p className="mb-0">
                      Tất cả các mức giá hiển thị trên Traveloka đã bao gồm 10% thuế VAT và phí dịch vụ. Chúng tôi cam kết tuyệt đối không có phí ẩn phụ thu ngoài các chi phí dịch vụ cá nhân phát sinh thêm do khách tự yêu cầu tại khách sạn (như minibar, giặt là, spa...).
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 4. TAB CHÍNH SÁCH BẢO MẬT */}
            {activeTab === 'privacy' && (
              <div>
                <div className="d-flex align-items-center gap-2 mb-3 text-success">
                  <Shield size={24} />
                  <h5 className="fw-bold text-dark mb-0">Chính Sách Bảo Mật Dữ Liệu Khách Hàng</h5>
                </div>
                <p className="text-secondary small mb-4">
                  Traveloka cam kết bảo vệ tuyệt đối thông tin riêng tư và dữ liệu cá nhân của mọi khách hàng theo tiêu chuẩn an ninh thông tin quốc tế:
                </p>

                <div className="d-flex flex-column gap-3 small text-secondary">
                  <div className="p-3 bg-light rounded-3 border">
                    <strong className="text-dark d-block mb-1">1. Phạm vi thu thập thông tin</strong>
                    <p className="mb-0">
                      Chúng tôi chỉ thu thập các thông tin tối thiểu cần thiết để phục vụ cho việc đặt phòng, xuất vé điện tử và khai báo tạm trú: Họ và tên, Địa chỉ email, Số điện thoại liên lạc và số CCCD/Hộ chiếu.
                    </p>
                  </div>

                  <div className="p-3 bg-light rounded-3 border">
                    <strong className="text-dark d-block mb-1">2. Mã hóa giao dịch và thanh toán</strong>
                    <p className="mb-0">
                      Toàn bộ dữ liệu truyền tải trên hệ thống đều được mã hóa bằng giao thức bảo mật cao cấp <strong>SSL/TLS 256-bit</strong>. Thông tin thẻ ngân hàng được xử lý trực tiếp qua các cổng thanh toán đạt chuẩn bảo mật quốc tế <strong>PCI-DSS Cấp độ 1</strong>. Traveloka không lưu trữ mã CVV/CVC của thẻ khách hàng.
                    </p>
                  </div>

                  <div className="p-3 bg-light rounded-3 border">
                    <strong className="text-dark d-block mb-1">3. Cam kết không chia sẻ dữ liệu</strong>
                    <p className="mb-0">
                      Thông tin của bạn chỉ được chia sẻ duy nhất cho cơ sở lưu trú nơi bạn đặt phòng để làm thủ tục tiếp đón tại quầy lễ tân. Chúng tôi tuyệt đối không bán, cho thuê hay tiết lộ dữ liệu người dùng cho bất kỳ bên thứ ba nào vì mục đích thương mại hoặc quảng cáo trái phép.
                    </p>
                  </div>

                  <div className="p-3 bg-light rounded-3 border">
                    <strong className="text-dark d-block mb-1">4. Quyền kiểm soát tài khoản của người dùng</strong>
                    <p className="mb-0">
                      Khách hàng có toàn quyền truy cập mục <strong>Quản Lý Tài Khoản (/profile)</strong> để cập nhật thông tin cá nhân, thay đổi mật khẩu, xem lịch sử thiết bị đăng nhập hoặc yêu cầu hủy bỏ dữ liệu tài khoản khi không còn nhu cầu sử dụng.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 5. TAB LIÊN HỆ HỢP TÁC ĐỐI TÁC */}
            {activeTab === 'partner' && (
              <div>
                <div className="d-flex align-items-center gap-2 mb-3 text-warning">
                  <Handshake size={24} />
                  <h5 className="fw-bold text-dark mb-0">Hợp Tác Đối Tác Khách Sạn & Cổng Extranet</h5>
                </div>
                <p className="text-secondary small mb-4">
                  Bạn là Chủ khách sạn, Resort, Biệt thự hoặc Homestay? Hãy đồng hành cùng Traveloka để gia tăng công suất lấp đầy phòng và tiếp cận hàng triệu du khách tiềm năng:
                </p>

                <div className="row g-3 mb-4">
                  <div className="col-md-4">
                    <div className="p-3 bg-light rounded-3 border text-center h-100">
                      <div className="fs-3 fw-bold text-primary mb-1">5 Triệu+</div>
                      <strong className="small text-dark d-block">Lượt truy cập/tháng</strong>
                      <span className="small text-secondary" style={{ fontSize: '11px' }}>Tiếp cận nguồn khách dồi dào cả khách du lịch và công tác</span>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="p-3 bg-light rounded-3 border text-center h-100">
                      <div className="fs-3 fw-bold text-success mb-1">12% - 15%</div>
                      <strong className="small text-dark d-block">Hoa hồng cạnh tranh</strong>
                      <span className="small text-secondary" style={{ fontSize: '11px' }}>Mức phí hợp lý nhất thị trường, không mất phí đăng ký ban đầu</span>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="p-3 bg-light rounded-3 border text-center h-100">
                      <div className="fs-3 fw-bold text-danger mb-1">24/7</div>
                      <strong className="small text-dark d-block">Đội ngũ hỗ trợ đối tác</strong>
                      <span className="small text-secondary" style={{ fontSize: '11px' }}>Chuyên viên hỗ trợ cài đặt giá, phòng và tối ưu doanh thu</span>
                    </div>
                  </div>
                </div>

                <div className="card border-0 shadow-sm rounded-3 p-4 bg-primary-subtle text-dark mb-3">
                  <h6 className="fw-bold text-primary mb-2">Quy Trình 3 Bước Đăng Ký Niêm Yết Khách Sạn:</h6>
                  <ol className="small mb-0 ps-3">
                    <li className="mb-1"><strong>Gửi thông tin cơ sở lưu trú:</strong> Tên khách sạn, địa chỉ, ảnh phòng và giấy phép kinh doanh.</li>
                    <li className="mb-1"><strong>Ký kết hợp đồng hợp tác:</strong> Ký hợp đồng điện tử nhanh chóng trong vòng 24 giờ.</li>
                    <li><strong>Kích hoạt bán phòng:</strong> Nhận tài khoản Cổng Extranet để chủ động cập nhật giá và đón khách ngay lập tức.</li>
                  </ol>
                </div>

                <div className="p-3 bg-light rounded-3 border d-flex flex-wrap align-items-center justify-content-between gap-3">
                  <div>
                    <strong className="text-dark small d-block">Phòng Phát Triển Thị Trường & Hợp Tác Đối Tác</strong>
                    <span className="small text-secondary">Hotline: <strong>1900 1234 (Nhánh 2)</strong> • Email: <strong>partner@traveloka.vn</strong></span>
                  </div>
                  <a 
                    href="mailto:partner@traveloka.vn?subject=Dang%20ky%20doi%20tac%20khach%20san%20Traveloka" 
                    className="btn btn-primary btn-sm rounded-pill px-3 fw-bold"
                  >
                    Gửi hồ sơ hợp tác
                  </a>
                </div>
              </div>
            )}

          </div>

          {/* Footer Modal */}
          <div className="modal-footer border-top bg-light p-3 d-flex justify-content-between">
            <button 
              type="button" 
              className="btn btn-secondary btn-sm rounded-pill px-4" 
              onClick={onClose}
            >
              Đóng
            </button>
            {activeTab === 'booking_guide' && (
              <Link 
                to="/hotels" 
                onClick={onClose}
                className="btn btn-primary btn-sm rounded-pill px-4 fw-bold d-inline-flex align-items-center gap-1 shadow-sm"
              >
                Tìm Khách Sạn Ngay <ArrowRight size={15} />
              </Link>
            )}
            {activeTab === 'cancellation' && (
              <Link 
                to="/my-bookings" 
                onClick={onClose}
                className="btn btn-primary btn-sm rounded-pill px-4 fw-bold d-inline-flex align-items-center gap-1 shadow-sm"
              >
                Chuyến Đi Của Tôi <ArrowRight size={15} />
              </Link>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
