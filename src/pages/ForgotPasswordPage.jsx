import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Hotel, Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { apiFetch } from '../services/api';
import { getFriendlyErrorMessage } from '../utils/errorHandler';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    if (!email.trim()) {
      setErrorMsg('Vui lòng nhập email.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const response = await apiFetch('/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
        }),
      });

      const resetToken = response?.result;
      if (resetToken) {
        navigate(`/reset-password/${resetToken}`);
        return;
      }

      setSubmitted(true);
    } catch (error) {
      console.error('Forgot password error:', error);
      setErrorMsg(
        getFriendlyErrorMessage(error, 'Không thể gửi yêu cầu đặt lại mật khẩu. Vui lòng thử lại sau.')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
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
                  Kiểm tra email của bạn
                </h3>

                <p className="text-secondary small mb-4">
                  Nếu email <strong>{email}</strong> tồn tại trong hệ thống,
                  chúng tôi đã gửi hướng dẫn đặt lại mật khẩu.
                </p>

                <p className="text-secondary" style={{ fontSize: '12px' }}>
                  Vui lòng kiểm tra cả thư mục Spam hoặc Quảng cáo.
                </p>

                <Link
                  to="/login"
                  className="btn btn-primary w-100 fw-bold py-2 mt-2"
                >
                  Quay lại đăng nhập
                </Link>

                <button
                  type="button"
                  className="btn btn-link text-primary text-decoration-none small mt-2"
                  onClick={() => {
                    setSubmitted(false);
                    setEmail('');
                  }}
                >
                  Gửi lại yêu cầu
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
                  Quên mật khẩu?
                </h3>

                <p className="text-secondary small mb-0">
                  Nhập email đã đăng ký để nhận liên kết đặt lại mật khẩu.
                </p>
              </div>

              {errorMsg && (
                <div className="alert alert-danger py-2 small d-flex align-items-center gap-2 mb-3">
                  <AlertCircle size={16} className="flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-dark mb-1">
                    Email <span className="text-danger">*</span>
                  </label>

                  <div className="input-group">
                    <span className="input-group-text bg-white border-secondary-subtle">
                      <Mail size={16} className="text-secondary" />
                    </span>

                    <input
                      type="email"
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
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100 fw-bold py-2 mt-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Đang gửi yêu cầu...
                    </>
                  ) : (
                    'Gửi yêu cầu đặt lại'
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
