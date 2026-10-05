import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Hotel, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { apiFetch } from '../services/api';
import { getFriendlyErrorMessage, sanitizeErrorMessage } from '../utils/errorHandler';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, loginWithGoogle, loginWithFacebook } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setErrorMsg('');
    setSuccessMsg('');

    if (!fullName.trim() || !email.trim() || !password) {
      setErrorMsg('Vui lòng điền đầy đủ các trường bắt buộc!');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Mật khẩu phải có ít nhất 6 ký tự!');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Mật khẩu xác nhận không trùng khớp!');
      return;
    }

    setIsSubmitting(true);
    let timeoutId;

    try {
      const request = (async () => {
        const response = await apiFetch('/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fullName,
            email,
            phone,
            password,
            confirmPassword
          })
        });

        let data = {};
        try {
          data = await response.json();
        } catch {
          // Cho phép xử lý response không có JSON body.
        }
        return { response, data };
      })();

      const timeout = new Promise((_, reject) => {
        timeoutId = setTimeout(
          () => reject(new Error('REGISTER_TIMEOUT')),
          20000
        );
      });

      const { response, data } = await Promise.race([request, timeout]);

      if (!response.ok) {
        const errors = data?.result?.errors;
        const message =
          data?.result?.message ||
          (typeof errors === 'string'
            ? errors
            : Array.isArray(errors)
              ? errors.join(', ')
              : errors && typeof errors === 'object'
                ? Object.values(errors).flat().join(', ')
                : 'Đăng ký thất bại!');
        setErrorMsg(message);
        return;
      }

      setSuccessMsg('Đăng ký tài khoản thành công! Đang chuyển hướng...');
      setTimeout(() => navigate('/login'), 1000);
    } catch (error) {
      if (error?.message === 'REGISTER_TIMEOUT') {
        setErrorMsg('Yêu cầu đăng ký mất quá nhiều thời gian. Vui lòng kiểm tra kết nối và thử lại.');
      } else {
        setErrorMsg('Không thể kết nối đến server!');
      }
      console.error('Register error:', error);
    } finally {
      clearTimeout(timeoutId);
      setIsSubmitting(false);
    }

  };

  // Đăng nhập nhanh qua Google
  const handleGoogleLogin = () => {
    loginWithGoogle();
    navigate('/');
  };

  // Đăng nhập nhanh qua Facebook
  const handleFacebookLogin = () => {
    loginWithFacebook();
    navigate('/');
  };

  return (
    <div className="bg-light min-vh-100 py-5 page-top-spacing d-flex align-items-center">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-6 col-md-8 col-sm-10">

            <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 bg-white">
              
              {/* Logo & Tiêu đề */}
              <div className="text-center mb-4">
                <div className="d-inline-flex align-items-center justify-content-center p-2 bg-primary text-white rounded-3 mb-2 shadow-sm">
                  <Hotel size={28} />
                </div>
                <h3 className="fw-bold text-dark mb-1">Tạo Tài Khoản Mới</h3>
                <p className="text-secondary small mb-0">
                  Đăng ký ngay để nhận vô vàn ưu đãi đặt phòng độc quyền từ Traveloka
                </p>
              </div>

              {/* Thông báo lỗi */}
              {errorMsg && (
                <div className="alert alert-danger py-2 small d-flex align-items-center gap-2 mb-3">
                  <AlertCircle size={16} className="flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Thông báo thành công */}
              {successMsg && (
                <div className="alert alert-success py-2 small d-flex align-items-center gap-2 mb-3">
                  <CheckCircle2 size={16} className="flex-shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Form đăng ký */}
              <form onSubmit={handleSubmit} className="row g-3 mb-4">
                
                {/* Họ tên */}
                <div className="col-12">
                  <label className="form-label small fw-semibold text-dark mb-1">
                    Họ và tên của bạn <span className="text-danger">*</span>
                  </label>
                  <input 
                    type="text" 
                    className="form-control border-secondary-subtle" 
                    placeholder="VD: Nguyễn Văn A"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      setErrorMsg('');
                    }}
                    required
                  />
                </div>

                {/* Email */}
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-dark mb-1">
                    Email <span className="text-danger">*</span>
                  </label>
                  <input 
                    type="email" 
                    className="form-control border-secondary-subtle" 
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrorMsg('');
                    }}
                    required
                  />
                </div>

                {/* Số điện thoại */}
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-dark mb-1">
                    Số điện thoại
                  </label>
                  <input 
                    type="tel" 
                    className="form-control border-secondary-subtle" 
                    placeholder="0912 345 678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                {/* Mật khẩu */}
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-dark mb-1">
                    Mật khẩu <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      className="form-control border-secondary-subtle" 
                      placeholder="Ít nhất 6 ký tự"
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

                {/* Xác nhận mật khẩu */}
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-dark mb-1">
                    Xác nhận mật khẩu <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <input 
                      type={showConfirmPassword ? "text" : "password"} 
                      className="form-control border-secondary-subtle" 
                      placeholder="Nhập lại mật khẩu"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setErrorMsg('');
                      }}
                      required
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                      className="btn btn-outline-secondary border-secondary-subtle"
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Điều khoản */}
                <div className="col-12">
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" id="termsCheck" required defaultChecked />
                    <label className="form-check-label small text-secondary" htmlFor="termsCheck">
                      Tôi đồng ý với <a href="#" className="text-primary text-decoration-none">Điều khoản sử dụng</a> và <a href="#" className="text-primary text-decoration-none">Chính sách bảo mật</a> của Traveloka.
                    </label>
                  </div>
                </div>

                {/* Nút Đăng ký */}
                <div className="col-12 mt-3">
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg w-100 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm"
                          role="status"
                          aria-hidden="true"
                        />
                        <span>Đang đăng ký...</span>
                      </>
                    ) : (
                      'Đăng Ký Tài Khoản'
                    )}
                  </button>
                </div>
              </form>

              {/* Đường kẻ phân cách */}
              <div className="position-relative text-center my-3">
                <hr className="text-secondary" />
                <span className="position-absolute top-50 start-50 translate-middle px-3 bg-white text-secondary small" style={{ fontSize: '12px' }}>
                  hoặc đăng ký nhanh bằng
                </span>
              </div>

              {/* Các nút Đăng ký bằng Google & Facebook */}
              <div className="d-flex flex-column gap-2 mb-4">
                
                {/* Nút Google */}
                <button 
                  type="button" 
                  onClick={handleGoogleLogin} 
                  className="btn btn-outline-secondary d-flex align-items-center justify-content-center gap-2 py-2 rounded-3 bg-white hover-shadow transition-all"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.27 21.36 7.35 24 12 24z"/>
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.94 0 12s.46 3.84 1.26 5.42l4.02-3.15z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.27 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                  </svg>
                  <span className="fw-semibold small text-dark">Tiếp tục với Google</span>
                </button>

                {/* Nút Facebook */}
                <button 
                  type="button" 
                  onClick={handleFacebookLogin} 
                  className="btn btn-outline-secondary d-flex align-items-center justify-content-center gap-2 py-2 rounded-3 bg-white hover-shadow transition-all"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span className="fw-semibold small text-dark">Tiếp tục với Facebook</span>
                </button>

              </div>

              {/* Chuyển sang trang Đăng nhập */}
              <div className="text-center small text-secondary">
                Đã có tài khoản?{' '}
                <Link to="/login" className="text-primary fw-bold text-decoration-none">
                  Đăng nhập ngay
                </Link>
              </div>

            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
