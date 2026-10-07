import React, { createContext, useContext, useState, useCallback } from 'react';
import AlertModal from '../components/AlertModal';

const AlertContext = createContext(null);

export function AlertProvider({ children }) {
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: 'Thông báo',
    message: '',
    type: 'info',
    confirmText: 'Đã hiểu',
    cancelText: 'Hủy',
    showCancel: false,
    onConfirm: null,
    onCancel: null
  });

  const closeAlert = useCallback(() => {
    setModalConfig(prev => ({ ...prev, isOpen: false }));
  }, []);

  /**
   * Hiển thị hộp thông báo đơn nút (giống alert())
   * Trả về Promise resolving true khi nhấn Xác nhận/Đã hiểu
   */
  const showAlert = useCallback(({
    title = 'Thông báo',
    message = '',
    type = 'info',
    confirmText = 'Đã hiểu',
    onConfirm = null
  } = {}) => {
    return new Promise((resolve) => {
      setModalConfig({
        isOpen: true,
        title,
        message,
        type,
        confirmText,
        cancelText: 'Hủy',
        showCancel: false,
        onConfirm: () => {
          if (typeof onConfirm === 'function') onConfirm();
          resolve(true);
        },
        onCancel: () => {
          resolve(false);
        }
      });
    });
  }, []);

  /**
   * Hiển thị hộp thoại xác nhận 2 nút (giống window.confirm())
   * Trả về Promise resolving true nếu Đồng ý / Xác nhận, resolving false nếu Hủy
   */
  const showConfirm = useCallback(({
    title = 'Xác nhận thao tác',
    message = '',
    type = 'warning',
    confirmText = 'Xác nhận',
    cancelText = 'Hủy',
    onConfirm = null,
    onCancel = null
  } = {}) => {
    return new Promise((resolve) => {
      setModalConfig({
        isOpen: true,
        title,
        message,
        type,
        confirmText,
        cancelText,
        showCancel: true,
        onConfirm: () => {
          if (typeof onConfirm === 'function') onConfirm();
          resolve(true);
        },
        onCancel: () => {
          if (typeof onCancel === 'function') onCancel();
          resolve(false);
        }
      });
    });
  }, []);

  return (
    <AlertContext.Provider value={{ showAlert, showConfirm, closeAlert }}>
      {children}
      <AlertModal
        isOpen={modalConfig.isOpen}
        onClose={closeAlert}
        type={modalConfig.type}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmText={modalConfig.confirmText}
        cancelText={modalConfig.cancelText}
        showCancel={modalConfig.showCancel}
        onConfirm={modalConfig.onConfirm}
        onCancel={modalConfig.onCancel}
      />
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);
  if (!context) {
    // Fallback an toàn nếu component nằm ngoài Provider
    return {
      showAlert: ({ message, title }) => {
        window.alert(title ? `${title}\n\n${message}` : message);
        return Promise.resolve(true);
      },
      showConfirm: ({ message, title }) => {
        const res = window.confirm(title ? `${title}\n\n${message}` : message);
        return Promise.resolve(res);
      },
      closeAlert: () => {}
    };
  }
  return context;
}
