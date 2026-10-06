import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Hotel, Headphones, Search, Globe, User, ShieldCheck, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import SupportModal from './SupportModal';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { showAlert } = useAlert();

  // State điều khiển đóng/mở dropdown menu của người dùng
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const userMenuRef = useRef(null);

  // State điều khiển Modal Trung tâm Hỗ trợ khách hàng 24/7
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);

  // Xử lý chuyển hướng đến phần tìm kiếm đặt chỗ từ bất kỳ trang nào
  const handleSearchBookingsClick = (e) => {
    e.preventDefault();
    if (location.pathname === '/') {
      const section = document.getElementById('hotel-list-section');
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      navigate('/#hotel-list-section');
      setTimeout(() => {
        const section = document.getElementById('hotel-list-section');
        if (section) {
          section.scrollIntoView({ behavior: 'smooth' });
        }
      }, 200);
    }
  };

  // Đóng dropdown khi click chuột ra ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Đăng xuất và hiển thị trạng thái loading trong lúc xử lý
  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    try {
      await logout();
      setIsUserMenuOpen(false);
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
      showAlert({
        title: 'Đăng xuất thất bại',
        message: 'Đăng xuất không thành công. Vui lòng thử lại!',
        type: 'error'
      });
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="fixed-top" style={{ zIndex: 1050 }}>
      {isLoggingOut && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ background: "rgba(15, 23, 42, 0.35)", zIndex: 2000 }}
          role="status"
          aria-live="polite"
        >
          <div className="bg-white rounded-3 shadow px-4 py-3 d-flex align-items-center gap-3">
            <span className="spinner-border text-primary" aria-hidden="true" />
            <span className="fw-semibold text-dark">Đang đăng xuất...</span>
          </div>
        </div>
      )}
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
              {!isAdmin && (
                <li className="nav-item">
                  <Link className="nav-link px-3 py-1 text-white opacity-85 hover-opacity small fw-medium" to="/my-bookings">
                    Chuyến đi của tôi
                  </Link>
                </li>
              )}
              <li className="nav-item">
                <a 
                  href="#hotel-list-section" 
                  onClick={handleSearchBookingsClick}
                  className="nav-link px-3 py-1 text-white opacity-85 hover-opacity small fw-medium d-flex align-items-center gap-1 cursor-pointer"
                >
                  <Search size={14} /> Tìm kiếm đặt chỗ
                </a>
              </li>
              <li className="nav-item">
                <button 
                  type="button" 
                  onClick={() => setIsSupportModalOpen(true)}
                  className="nav-link px-3 py-1 text-white opacity-85 hover-opacity small fw-medium d-flex align-items-center gap-1 bg-transparent border-0"
                >
                  <Headphones size={14} /> Hỗ trợ khách hàng
                </button>
              </li>
            </ul>

            {/* Menu Phải: Tiền tệ & Đăng nhập / Đăng ký */}
            <div className="d-flex align-items-center gap-3 mt-2 mt-lg-0">
              {/* Quốc gia / Tiền tệ */}
              <div className="d-flex align-items-center gap-1 text-white opacity-90 small cursor-pointer px-2 py-1 rounded hover-bg-dark">
                <Globe size={16} />
                <span className="fw-semibold">🇻🇳 VND</span>
              </div>

              {/* Khu vực Đăng nhập / Đăng ký (Đã tách rời theo yêu cầu) */}
              {!isAuthenticated ? (
                <div className="d-flex align-items-center gap-2">
                  {/* Nút Đăng nhập */}
                  <Link 
                    to="/login" 
                    className="btn btn-outline-light rounded-pill px-3 py-1 fw-semibold small text-nowrap hover-shadow"
                    style={{ fontSize: '13px' }}
                  >
                    Đăng nhập
                  </Link>

                  {/* Nút Đăng ký */}
                  <Link 
                    to="/register" 
                    className="btn btn-primary rounded-pill px-3 py-1 fw-bold text-white shadow-sm small text-nowrap hover-shadow"
                    style={{ fontSize: '13px', backgroundColor: '#0264c8', borderColor: '#0264c8' }}
                  >
                    Đăng ký
                  </Link>
                </div>
              ) : (
                /* Khi người dùng đã đăng nhập: Hiển thị Avatar & Dropdown dùng React State */
                <div className="position-relative" ref={userMenuRef}>
                  <button 
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="btn btn-light rounded-pill px-2 py-1 d-flex align-items-center gap-2 shadow-sm border-0 hover-shadow"
                    type="button"
                  >
                    <img 
                      src={user.avatarUrl || user.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=60"} 
                      alt={user.name} 
                      className="rounded-circle object-fit-cover"
                      style={{ width: '26px', height: '26px' }}
                    />
                    <span className="fw-bold text-dark small text-truncate" style={{ maxWidth: '120px', fontSize: '13px' }}>
                      {user.name}
                    </span>
                    {isAdmin && (
                      <span className="badge bg-warning text-dark fw-bold" style={{ fontSize: '10px' }}>
                        Admin
                      </span>
                    )}
                    <ChevronDown size={14} className="text-secondary" />
                  </button>
                  
                  {/* Menu Dropdown hiển thị khi isUserMenuOpen = true */}
                  {isUserMenuOpen && (
                    <div 
                      className="dropdown-menu dropdown-menu-end shadow-lg border-0 rounded-3 p-2 show position-absolute end-0" 
                      style={{ minWidth: '240px', top: '100%', marginTop: '8px', zIndex: 1100 }}
                    >
                      {/* 1. Thông tin tài khoản & Email */}
                      <div className="px-3 py-2 border-bottom mb-2 bg-light rounded-2">
                        <div className="fw-bold text-dark text-truncate">{user.name}</div>
                        <div className="small text-secondary text-truncate" style={{ fontSize: '12px' }}>{user.email}</div>
                        {isAdmin ? (
                          <span className="badge bg-warning text-dark fw-bold mt-1" style={{ fontSize: '10px' }}>
                            👑 Quản trị viên hệ thống
                          </span>
                        ) : (
                          <span className="badge bg-primary-subtle text-primary mt-1" style={{ fontSize: '10px' }}>
                            👤 Khách hàng
                          </span>
                        )}
                      </div>

                      {/* 2. Trang Quản Trị (Admin) - Ưu tiên hàng đầu cho Admin */}
                      {isAdmin && (
                        <Link 
                          className="dropdown-item py-2 small fw-bold text-primary d-flex align-items-center gap-2 rounded-2" 
                          to="/admin"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <ShieldCheck size={16} /> Trang Quản Trị (Admin)
                        </Link>
                      )}

                      {/* 3. Quản lý tài khoản / Hồ sơ */}
                      <Link 
                        className="dropdown-item py-2 small d-flex align-items-center gap-2 rounded-2 text-dark fw-semibold" 
                        to="/profile"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <User size={16} className="text-primary" /> {isAdmin ? 'Hồ Sơ Quản Trị Viên' : 'Quản Lý Tài Khoản'}
                      </Link>

                      {/* 4. Chuyến đi của tôi - Chỉ hiển thị cho Khách hàng (Customer) */}
                      {!isAdmin && (
                        <Link 
                          className="dropdown-item py-2 small d-flex align-items-center gap-2 rounded-2 text-dark" 
                          to="/my-bookings"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Hotel size={16} className="text-secondary" /> Chuyến đi của tôi
                        </Link>
                      )}

                      <hr className="dropdown-divider my-1" />

                      {/* 4. Đăng xuất */}
                      <button
                        type="button"
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="dropdown-item py-2 small text-danger d-flex align-items-center gap-2 rounded-2"
                      >
                        {isLoggingOut ? (
                          <>
                            <span
                              className="spinner-border spinner-border-sm"
                              role="status"
                              aria-hidden="true"
                            />
                            <span>Đang đăng xuất...</span>
                          </>
                        ) : (
                          <>
                            <LogOut size={16} />
                            <span>Đăng xuất</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Modal Trung Tâm Chăm Sóc Khách Hàng 24/7 */}
      <SupportModal 
        isOpen={isSupportModalOpen} 
        onClose={() => setIsSupportModalOpen(false)} 
      />
    </header>
  );
}