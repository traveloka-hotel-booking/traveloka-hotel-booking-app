import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';

export default function AlertModal({
  isOpen,
  onClose,
  type = 'error',
  title = 'Thông báo',
  message = '',
  confirmText = 'Đã hiểu',
  onConfirm
}) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    if (onClose) {
      onClose();
    }
  };

  // Cấu hình màu sắc & biểu tượng theo từng loại thông báo
  const config = {
    error: {
      bgIcon: '#fee2e2',
      iconColor: '#dc2626',
      icon: <AlertCircle size={36} color="#dc2626" />,
      btnClass: 'btn-danger',
      btnStyle: { backgroundColor: '#ef4444', borderColor: '#ef4444' }
    },
    warning: {
      bgIcon: '#fef3c7',
      iconColor: '#d97706',
      icon: <AlertTriangle size={36} color="#d97706" />,
      btnClass: 'btn-warning text-dark',
      btnStyle: { backgroundColor: '#f59e0b', borderColor: '#f59e0b', color: '#fff' }
    },
    info: {
      bgIcon: '#e0f2fe',
      iconColor: '#0284c7',
      icon: <Info size={36} color="#0284c7" />,
      btnClass: 'btn-primary',
      btnStyle: { backgroundColor: '#0194f3', borderColor: '#0194f3' }
    },
    success: {
      bgIcon: '#dcfce7',
      iconColor: '#16a34a',
      icon: <CheckCircle2 size={36} color="#16a34a" />,
      btnClass: 'btn-success',
      btnStyle: { backgroundColor: '#10b981', borderColor: '#10b981' }
    }
  }[type] || {
    bgIcon: '#fee2e2',
    iconColor: '#dc2626',
    icon: <AlertCircle size={36} color="#dc2626" />,
    btnClass: 'btn-primary',
    btnStyle: { backgroundColor: '#0194f3', borderColor: '#0194f3' }
  };

  return (
    <div 
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center px-3"
      style={{
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 2000,
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={onClose}
    >
      <div 
        className="card border-0 shadow-lg rounded-4 text-center p-4 position-relative"
        style={{
          maxWidth: '440px',
          width: '100%',
          backgroundColor: '#ffffff',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          animation: 'slideUp 0.25s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Nút đóng X góc trên */}
        <button
          type="button"
          onClick={onClose}
          className="btn-close position-absolute top-0 end-0 m-3"
          aria-label="Đóng"
          style={{ fontSize: '12px' }}
        />

        {/* Biểu tượng tròn nổi bật */}
        <div 
          className="mx-auto rounded-circle d-flex align-items-center justify-content-center mb-3"
          style={{
            width: '76px',
            height: '76px',
            backgroundColor: config.bgIcon
          }}
        >
          {config.icon}
        </div>

        {/* Tiêu đề thông báo */}
        <h5 className="fw-bold text-dark mb-2" style={{ fontSize: '19px' }}>
          {title}
        </h5>

        {/* Nội dung thông báo */}
        <p className="text-secondary small mb-4 px-2" style={{ fontSize: '14.5px', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
          {message}
        </p>

        {/* Nút bấm xác nhận thân thiện */}
        <div>
          <button
            type="button"
            className="btn w-100 py-2 fw-semibold rounded-3 text-white shadow-sm"
            style={{
              ...config.btnStyle,
              fontSize: '15px'
            }}
            onClick={handleConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
