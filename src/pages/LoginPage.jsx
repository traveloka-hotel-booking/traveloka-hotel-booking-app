import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Hotel, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { sanitizeErrorMessage } from '../utils/errorHandler';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Lấy đường dẫn trước đó và state dữ liệu nếu có để redirect sau khi đăng nhập
  const from = location.state?.from?.pathname || (typeof location.state?.from === 'string' ? location.state.from : null) || '/';
  const fromState = location.state?.from?.state || location.state?.bookingState || null;
  const noticeMsg = location.state?.notice || '';

  // Xử lý đăng nhập thông thường
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Tránh gửi nhiều yêu cầu đăng nhập liên tiếp
    if (isLoggingIn) return;

    if (!email || !password) {
      setErrorMsg('Vui lòng nhập đầy đủ Email và Mật khẩu!');
      return;
    }

    setIsLoggingIn(true);
    setErrorMsg('');

    try {
      await login(email, password);

      // Lấy user hiện tại từ localStorage
      const savedUser = localStorage.getItem('traveloka_auth_user');
      const user = savedUser ? JSON.parse(savedUser) : null;

      if (user?.role === 'ROLE_ADMIN' || user?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate(from, { state: fromState, replace: true });
      }

    } catch (error) {
      setErrorMsg(sanitizeErrorMessage(error, 'Email hoặc mật khẩu không đúng!'));
    } finally {
      setIsLoggingIn(false);
    }
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

              {/* Thông báo chuyển hướng đặt phòng */}
              {noticeMsg && (
                <div className="alert alert-info py-2 small d-flex align-items-center gap-2 mb-3">
                  <AlertCircle size={16} className="flex-shrink-0 text-primary" />
                  <span>{noticeMsg}</span>
                </div>
              )}

              {/* Thông báo lỗi nếu có */}
              {errorMsg && (
                <div className="alert alert-danger py-2 small d-flex align-items-center gap-2 mb-3">
                  <AlertCircle size={16} className="flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Form đăng nhập */}
              <form onSubmit={handleSubmit}>
                
                {/* Email */}
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-dark mb-1">
                    Email <span className="text-danger">*</span>
                  </label>
                  <input 
                    type="text" 
                    className="form-control border-secondary-subtle" 
                    placeholder="VD: huutran0991@gmail.com"
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
                    <Link to="/forgot-password" className="small text-primary text-decoration-none">
                      Quên mật khẩu?
                    </Link>
                  </div>
                  <div className="input-group">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      className="form-control border-secondary-subtle" 
                      placeholder="Nhập mật khẩu"
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
                      title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Ghi nhớ đăng nhập */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" id="rememberMe" defaultChecked />
                    <label className="form-check-label small text-secondary" htmlFor="rememberMe">
                      Ghi nhớ đăng nhập
                    </label>
                  </div>
                </div>

                {/* Nút Submit Đăng nhập */}
                <button 
                  type="submit" 
                  className="btn btn-primary btn-lg w-100 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2"
                  disabled={isLoggingIn}
                >
                  {isLoggingIn ? (
                    <>
                      <span 
                        className="spinner-border spinner-border-sm" 
                        role="status" 
                        aria-hidden="true"
                      ></span>
                      Đang đăng nhập...
                    </>
                  ) : (
                    'Đăng Nhập'
                  )}
                </button>
              </form>

              {/* Chuyển sang trang Đăng ký */}
              <div className="text-center small text-secondary mt-4 pt-3 border-top">
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
