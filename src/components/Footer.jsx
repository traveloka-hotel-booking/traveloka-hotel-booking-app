import React, { useState } from 'react';
import { Hotel, Phone, Mail, MapPin } from 'lucide-react';
import PolicyModal from './PolicyModal';

export default function Footer() {
  const [policyModalOpen, setPolicyModalOpen] = useState(false);
  const [activePolicyTab, setActivePolicyTab] = useState('booking_guide');

  const openPolicy = (tabKey) => {
    setActivePolicyTab(tabKey);
    setPolicyModalOpen(true);
  };
  return (
    <footer className="bg-dark text-white pt-5 pb-3 mt-auto">
      <div className="container">
        <div className="row g-4 pb-4 border-bottom border-secondary">
          {/* Cột 1: Giới thiệu */}
          <div className="col-lg-4 col-md-6">
            <div className="d-flex align-items-center gap-2 mb-3 fs-4 fw-bold text-primary">
              <Hotel size={30} />
              <span className="text-white">Traveloka Booking</span>
            </div>
            <p className="text-secondary small mb-3">
              Nền tảng đặt phòng khách sạn trực tuyến hàng đầu Việt Nam. Chúng tôi kết nối bạn với hàng nghìn khách sạn, resort và homestay chất lượng cao với mức giá ưu đãi nhất.
            </p>
            <div className="d-flex flex-column gap-2 text-secondary small">
              <div className="d-flex align-items-center gap-2">
                <MapPin size={16} className="text-primary" />
                <span>Hà Nội & TP. Hồ Chí Minh, Việt Nam</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <Phone size={16} className="text-primary" />
                <span>Hotline: 1900 1234 (24/7)</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <Mail size={16} className="text-primary" />
                <span>support@travelokabooking.vn</span>
              </div>
            </div>
          </div>

          {/* Cột 2: Điểm đến phổ biến */}
          <div className="col-lg-2 col-md-6 col-6">
            <h6 className="text-white fw-bold mb-3">Điểm đến nổi tiếng</h6>
            <ul className="list-unstyled text-secondary small d-flex flex-column gap-2">
              <li><a href="#" className="text-secondary text-decoration-none">Hà Nội</a></li>
              <li><a href="#" className="text-secondary text-decoration-none">Đà Nẵng</a></li>
              <li><a href="#" className="text-secondary text-decoration-none">TP. Hồ Chí Minh</a></li>
              <li><a href="#" className="text-secondary text-decoration-none">Nha Trang</a></li>
              <li><a href="#" className="text-secondary text-decoration-none">Phú Quốc</a></li>
              <li><a href="#" className="text-secondary text-decoration-none">Đà Lạt</a></li>
            </ul>
          </div>

          {/* Cột 3: Chính sách & Hỗ trợ */}
          <div className="col-lg-3 col-md-6 col-6">
            <h6 className="text-white fw-bold mb-3">Chính sách & Hỗ trợ</h6>
            <ul className="list-unstyled text-secondary small d-flex flex-column gap-2">
              <li>
                <button 
                  type="button" 
                  onClick={() => openPolicy('booking_guide')} 
                  className="btn btn-link p-0 text-secondary text-decoration-none hover-white small text-start"
                >
                  Hướng dẫn đặt phòng
                </button>
              </li>
              <li>
                <button 
                  type="button" 
                  onClick={() => openPolicy('cancellation')} 
                  className="btn btn-link p-0 text-secondary text-decoration-none hover-white small text-start"
                >
                  Chính sách hoàn hủy
                </button>
              </li>
              <li>
                <button 
                  type="button" 
                  onClick={() => openPolicy('terms')} 
                  className="btn btn-link p-0 text-secondary text-decoration-none hover-white small text-start"
                >
                  Điều khoản sử dụng
                </button>
              </li>
              <li>
                <button 
                  type="button" 
                  onClick={() => openPolicy('privacy')} 
                  className="btn btn-link p-0 text-secondary text-decoration-none hover-white small text-start"
                >
                  Chính sách bảo mật
                </button>
              </li>
              <li>
                <button 
                  type="button" 
                  onClick={() => openPolicy('partner')} 
                  className="btn btn-link p-0 text-secondary text-decoration-none hover-white small text-start"
                >
                  Liên hệ hợp tác
                </button>
              </li>
            </ul>
          </div>

          {/* Cột 4: Phương thức thanh toán */}
          <div className="col-lg-3 col-md-6">
            <h6 className="text-white fw-bold mb-3">Đối tác thanh toán</h6>
            <p className="text-secondary small mb-3">Hỗ trợ đa dạng phương thức thanh toán an toàn và bảo mật.</p>
            <div className="d-flex flex-wrap gap-2">
              <span className="badge bg-secondary p-2">VNPAY QR</span>
              <span className="badge bg-secondary p-2">Thẻ Visa / Master</span>
              <span className="badge bg-secondary p-2">ATM Nội địa</span>
              <span className="badge bg-secondary p-2">Thanh toán tại KS</span>
            </div>
          </div>
        </div>

        {/* Dòng bản quyền */}
        <div className="pt-3 text-center text-secondary small">
          <p className="mb-0">
            © 2026 <strong>Traveloka Hotel Booking Project</strong>. Phát triển bởi Nhóm Dự án OJT.
          </p>
        </div>
      </div>

      {/* Modal Chi Tiết Chính Sách & Điều Khoản */}
      <PolicyModal 
        isOpen={policyModalOpen} 
        onClose={() => setPolicyModalOpen(false)} 
        initialTab={activePolicyTab} 
      />
    </footer>
  );
}
