import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Hotel, Headphones, Search, Globe, User } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <header className="fixed-top" style={{ zIndex: 1050 }}>
      <nav 
        className="navbar navbar-expand-lg navbar-dark py-2 px-3 transition-all"
        style={{
          background: isHome ? 'rgba(15, 23, 42, 0.75)' : 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        <div className="container-fluid px-lg-4">
          {/* Logo Traveloka */}
          <Link className="navbar-brand fw-bold d-flex align-items-center gap-2 fs-4 me-4" to="/">
            <div className="p-1 bg-primary rounded-3 d-flex align-items-center justify-content-center text-white">
              <Hotel size={22} />
            </div>
            <span className="text-white tracking-wide" style={{ letterSpacing: '-0.5px' }}>
              Traveloka<span className="text-primary fs-5">.vn</span>
            </span>
          </Link>

          {/* Toggle button trên thiết bị di động */}
          <button 
            className="navbar-toggler border-0" 
            type="button" 
            data-bs-toggle="collapse" 
            data-bs-target="#navTripContent"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* Menu Items */}
          <div className="collapse navbar-collapse" id="navTripContent">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0 d-flex align-items-center gap-1">
              <li className="nav-item">
                <Link 
                  className={`nav-link px-3 py-1 text-white small fw-medium rounded-pill position-relative ${isHome ? 'active fw-bold' : 'opacity-85'}`} 
                  to="/"
                >
                  Chỗ ở / Khách sạn
                  {isHome && (
                    <span 
                      className="position-absolute bottom-0 start-50 translate-middle-x bg-white rounded-pill"
                      style={{ width: '28px', height: '2.5px', marginBottom: '-4px' }}
                    ></span>
                  )}
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link px-3 py-1 text-white opacity-85 hover-opacity small fw-medium" to="/hotels">
                  Khách sạn
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link px-3 py-1 text-white opacity-85 hover-opacity small fw-medium" to="/my-bookings">
                  Chuyến đi của tôi
                </Link>
              </li>
              <li className="nav-item">
                <a href="#hotel-list-section" className="nav-link px-3 py-1 text-white opacity-85 hover-opacity small fw-medium d-flex align-items-center gap-1">
                  <Search size={14} /> Tìm kiếm đặt chỗ
                </a>
              </li>
              <li className="nav-item">
                <a href="tel:19001234" className="nav-link px-3 py-1 text-white opacity-85 hover-opacity small fw-medium d-flex align-items-center gap-1">
                  <Headphones size={14} /> Hỗ trợ khách hàng
                </a>
              </li>
            </ul>

            {/* Menu Phải: Tiền tệ & Đăng nhập / Đăng ký */}
            <div className="d-flex align-items-center gap-3 mt-2 mt-lg-0">
              {/* Quốc gia / Tiền tệ */}
              <div className="d-flex align-items-center gap-1 text-white opacity-90 small cursor-pointer px-2 py-1 rounded hover-bg-dark">
                <Globe size={16} />
                <span className="fw-semibold">🇻🇳 VND</span>
              </div>

              {/* Nút Đăng nhập / Đăng ký bo góc trắng nổi bật */}
              <Link 
                to="/login" 
                className="btn btn-light rounded-pill px-3 py-1 fs-6 fw-bold text-dark shadow-sm d-flex align-items-center gap-1 hover-shadow"
                style={{ fontSize: '13px' }}
              >
                <User size={15} /> Đăng nhập / Đăng ký
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}