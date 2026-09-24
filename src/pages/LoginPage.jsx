import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Hotel, Eye, EyeOff, ShieldCheck, UserCheck, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginWithGoogle, loginWithFacebook } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Lấy đường dẫn trước đó nếu có để redirect sau khi đăng nhập
  const from = location.state?.from?.pathname || '/';

  // Xử lý đăng nhập thông thường
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Vui lòng nhập đầy đủ Email và Mật khẩu!');
      return;
    }

    try {
        await login(email, password);

        // Lấy user hiện tại từ localStorage
        const savedUser = localStorage.getItem('traveloka_auth_user');
        const user = savedUser ? JSON.parse(savedUser) : null;

        if (user?.role === 'ROLE_ADMIN') {
            navigate('/admin');
        } else {
            navigate(from, { replace: true });
        }

    } catch (error) {
        setErrorMsg(error.message);
    }
  };

  // Đăng nhập nhanh Google
  const handleGoogleLogin = () => {
    const user = loginWithGoogle();
    navigate(user.role === 'admin' ? '/admin' : from, { replace: true });
  };

  // Đăng nhập nhanh Facebook
  const handleFacebookLogin = () => {
    loginWithFacebook();
    navigate(from, { replace: true });
  };

  // Đăng nhập nhanh tài khoản Admin mẫu
  const handleQuickAdmin = () => {
    const res = login('admin@traveloka.vn', 'admin123');
    navigate('/admin');
  };

  // Đăng nhập nhanh tài khoản User mẫu
  const handleQuickUser = () => {
    login('user@traveloka.vn', '123456');
    navigate(from, { replace: true });
  };

  return (
    <div className="bg-light min-vh-100 py-5 page-top-spacing d-flex align-items-center">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-5 col-md-8 col-sm-10">

            <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 bg-white">
              
              {/* Logo & Tiêu đề */}
              <div className="text-center mb-4">
                <div className="d-inline-flex align-items-center justify-content-center p-2 bg-primary text-white rounded-3 mb-2 shadow-sm">
                  <Hotel size={28} />
                </div>
                <h3 className="fw-bold text-dark mb-1">Đăng Nhập Tài Khoản</h3>
                <p className="text-secondary small mb-0">
                  Chào mừng bạn quay trở lại với Traveloka Hotel Booking
                </p>
              </div>

              {/* Thông báo lỗi nếu có */}
              {errorMsg && (
                <div className="alert alert-danger py-2 small d-flex align-items-center gap-2 mb-3">
                  <AlertCircle size={16} className="flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Form đăng nhập */}
              <form onSubmit={handleSubmit} className="mb-4">
                
                {/* Email */}
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-dark mb-1">
                    Email hoặc Tên đăng nhập <span className="text-danger">*</span>
                  </label>
                  <input 
                    type="text" 
                    className="form-control border-secondary-subtle" 
                    placeholder="VD: name@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrorMsg('');
                    }}
                    required
                  />
                </div>

                {/* Mật khẩu */}
                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <label className="form-label small fw-semibold text-dark mb-0">
                      Mật khẩu <span className="text-danger">*</span>
                    </label>
                    <a href="#" className="small text-primary text-decoration-none" style={{ fontSize: '12px' }}>
                      Quên mật khẩu?
                    </a>
                  </div>
                  <div className="input-group">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      className="form-control border-secondary-subtle" 
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setErrorMsg('');
                      }}
                      required
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)} 
                      className="btn btn-outline-secondary border-secondary-subtle"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Nút Đăng nhập */}
                <button type="submit" className="btn btn-primary btn-lg w-100 fw-bold mt-2 shadow-sm">
                  Đăng Nhập
                </button>
              </form>

              {/* Đường kẻ phân cách */}
              <div className="position-relative text-center my-3">
                <hr className="text-secondary" />
                <span className="position-absolute top-50 start-50 translate-middle px-3 bg-white text-secondary small" style={{ fontSize: '12px' }}>
                  hoặc tiếp tục với
                </span>
              </div>

              {/* Các nút Đăng nhập bằng Google & Facebook */}
              <div className="d-flex flex-column gap-2 mb-4">
                
                {/* Nút Google */}
                <button 
                  type="button" 
                  onClick={handleGoogleLogin} 
                  className="btn btn-outline-secondary d-flex align-items-center justify-content-center gap-2 py-2 rounded-3 bg-white hover-shadow transition-all"
                >
                  {/* Logo Google 4 màu chuẩn SVG */}
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.27 21.36 7.35 24 12 24z"/>
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.94 0 12s.46 3.84 1.26 5.42l4.02-3.15z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.27 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                  </svg>
                  <span className="fw-semibold small text-dark">Đăng nhập bằng Google</span>
                </button>

                {/* Nút Facebook */}
                <button 
                  type="button" 
                  onClick={handleFacebookLogin} 
                  className="btn btn-outline-secondary d-flex align-items-center justify-content-center gap-2 py-2 rounded-3 bg-white hover-shadow transition-all"
                >
                  {/* Logo Meta Facebook SVG */}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span className="fw-semibold small text-dark">Đăng nhập bằng Facebook</span>
                </button>

              </div>

              {/* KHỐI TÀI KHOẢN MẪU ĐĂNG NHẬP 1-CLICK TIỆN LỢI */}
              <div className="p-3 bg-light rounded-3 border mb-3">
                <span className="small fw-bold text-dark d-block mb-2 text-uppercase" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>
                  ⚡ Trải nghiệm nhanh với tài khoản mẫu:
                </span>
                <div className="row g-2">
                  <div className="col-6">
                    <button 
                      type="button" 
                      onClick={handleQuickAdmin} 
                      className="btn btn-warning btn-sm w-100 fw-bold d-flex align-items-center justify-content-center gap-1 py-2"
                      title="Tài khoản có toàn quyền quản trị khách sạn và đơn phòng"
                    >
                      <ShieldCheck size={16} /> Admin Demo
                    </button>
                  </div>
                  <div className="col-6">
                    <button 
                      type="button" 
                      onClick={handleQuickUser} 
                      className="btn btn-outline-primary btn-sm w-100 fw-semibold d-flex align-items-center justify-content-center gap-1 py-2 bg-white"
                      title="Tài khoản khách hàng bình thường"
                    >
                      <UserCheck size={16} /> Khách Hàng
                    </button>
                  </div>
                </div>
              </div>

              {/* Chuyển sang trang Đăng ký */}
              <div className="text-center small text-secondary">
                Bạn chưa có tài khoản?{' '}
                <Link to="/register" className="text-primary fw-bold text-decoration-none">
                  Đăng ký ngay
                </Link>
              </div>

            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
