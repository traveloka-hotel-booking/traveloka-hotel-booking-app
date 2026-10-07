import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  Hotel,
  Eye,
  EyeOff,
  LockKeyhole,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Check
} from 'lucide-react';
import { apiFetch } from '../services/api';
import { getFriendlyErrorMessage } from '../utils/errorHandler';

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const hasMinLength = password.length >= 6;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const passwordsMatch =
    password.length > 0 &&
    confirmPassword.length > 0 &&
    password === confirmPassword;

  const isValid =
    !!token &&
    hasMinLength &&
    hasUppercase &&
    hasNumber &&
    passwordsMatch;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    if (!token) {
      setErrorMsg('Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.');
      return;
    }

    if (!hasMinLength || !hasUppercase || !hasNumber) {
      setErrorMsg(
        'Mật khẩu phải có ít nhất 6 ký tự, 1 chữ hoa và 1 chữ số.'
      );
      return;
    }

    if (!passwordsMatch) {
      setErrorMsg('Mật khẩu xác nhận không khớp.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      await apiFetch('/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          newPassword: password,
        }),
      });

      setSuccess(true);
    } catch (error) {
      console.error('Reset password error:', error);
      setErrorMsg(
        getFriendlyErrorMessage(error, 'Không thể đặt lại mật khẩu. Vui lòng thử lại.')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="bg-light min-vh-100 py-5 page-top-spacing d-flex align-items-center">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-5 col-md-8 col-sm-10">
              <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 bg-white text-center">
                <div className="d-inline-flex align-items-center justify-content-center p-3 bg-success bg-opacity-10 text-success rounded-circle mb-3 mx-auto">
                  <CheckCircle2 size={34} />
                </div>

                <h3 className="fw-bold text-dark mb-2">
                  Đặt lại mật khẩu thành công
                </h3>

                <p className="text-secondary small mb-4">
                  Mật khẩu của bạn đã được thay đổi. Bạn có thể đăng nhập bằng
                  mật khẩu mới ngay bây giờ.
                </p>

                <button
                  type="button"
                  className="btn btn-primary w-100 fw-bold py-2"
                  onClick={() => navigate('/login', { replace: true })}
                >
                  Đăng nhập
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-light min-vh-100 py-5 page-top-spacing d-flex align-items-center">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-5 col-md-8 col-sm-10">
            <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 bg-white">

              <div className="text-center mb-4">
                <div className="d-inline-flex align-items-center justify-content-center p-2 bg-primary text-white rounded-3 mb-2 shadow-sm">
                  <Hotel size={28} />
                </div>

                <h3 className="fw-bold text-dark mb-1">
                  Đặt lại mật khẩu
                </h3>

                <p className="text-secondary small mb-0">
                  Tạo mật khẩu mới cho tài khoản của bạn.
                </p>
              </div>

              {errorMsg && (
                <div className="alert alert-danger py-2 small d-flex align-items-center gap-2 mb-3">
                  <AlertCircle size={16} className="flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {!token && (
                <div className="alert alert-warning py-2 small d-flex align-items-center gap-2 mb-3">
                  <AlertCircle size={16} className="flex-shrink-0" />
                  <span>
                    Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.
                  </span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-dark mb-1">
                    Mật khẩu mới <span className="text-danger">*</span>
                  </label>

                  <div className="input-group">
                    <span className="input-group-text bg-white border-secondary-subtle">
                      <LockKeyhole size={16} className="text-secondary" />
                    </span>

                    <input
                      type={showPassword ? 'text' : 'password'}
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
                      className="btn btn-outline-secondary border-secondary-subtle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold text-dark mb-1">
                    Xác nhận mật khẩu <span className="text-danger">*</span>
                  </label>

                  <div className="input-group">
                    <span className="input-group-text bg-white border-secondary-subtle">
                      <LockKeyhole size={16} className="text-secondary" />
                    </span>

                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      className="form-control border-secondary-subtle"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setErrorMsg('');
                      }}
                      required
                    />

                    <button
                      type="button"
                      className="btn btn-outline-secondary border-secondary-subtle"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>
                  </div>
                </div>

                <div className="bg-light border rounded-3 p-3 mb-3">
                  <div className="small fw-semibold text-dark mb-2">
                    Mật khẩu phải có:
                  </div>

                  <div className="d-flex flex-column gap-1">
                    <PasswordRule
                      valid={hasMinLength}
                      text="Ít nhất 6 ký tự"
                    />
                    <PasswordRule
                      valid={hasUppercase}
                      text="Ít nhất 1 chữ hoa"
                    />
                    <PasswordRule
                      valid={hasNumber}
                      text="Ít nhất 1 chữ số"
                    />
                    <PasswordRule
                      valid={passwordsMatch}
                      text="Mật khẩu xác nhận trùng khớp"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100 fw-bold py-2"
                  disabled={isSubmitting || !isValid}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Đang cập nhật...
                    </>
                  ) : (
                    'Đặt lại mật khẩu'
                  )}
                </button>
              </form>

              <div className="text-center mt-4">
                <Link
                  to="/login"
                  className="text-primary text-decoration-none small fw-semibold d-inline-flex align-items-center gap-1"
                >
                  <ArrowLeft size={15} />
                  Quay lại đăng nhập
                </Link>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PasswordRule({ valid, text }) {
  return (
    <div
      className={`small d-flex align-items-center gap-2 ${
        valid ? 'text-success' : 'text-secondary'
      }`}
    >
      <Check size={14} />
      <span>{text}</span>
    </div>
  );
}
