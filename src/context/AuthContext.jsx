import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch } from '../services/api';
import { getFriendlyErrorMessage, sanitizeErrorMessage } from '../utils/errorHandler';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Đọc thông tin user từ localStorage nếu đã có phiên trước đó (tự động loại bỏ phiên demo cũ)
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('traveloka_auth_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        // Nếu là phiên demo cũ -> dọn dẹp sạch sẽ
        if (
          parsed?.email === 'admin@traveloka.vn' ||
          parsed?.email === 'customer@traveloka.vn' ||
          parsed?.email === 'huutran.fb@gmail.com' ||
          parsed?.loginType
        ) {
          localStorage.removeItem('traveloka_auth_user');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          return null;
        }
        return parsed;
      }
      return null;
    } catch (e) {
      console.error('Lỗi khi đọc auth_user từ localStorage', e);
      return null;
    }
  });

  // Lưu hoặc xóa user khỏi localStorage khi state thay đổi
  useEffect(() => {
    if (user) {
      localStorage.setItem('traveloka_auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('traveloka_auth_user');
    }
  }, [user]);

  // Hàm đăng nhập chuẩn qua Backend API (JWT Token)
  const login = async (email, password) => {
    try {
      const response = await apiFetch('/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      // Login thất bại
      if (!response.ok) {
        throw new Error(getFriendlyErrorMessage(data, 'Email hoặc mật khẩu không đúng!'));
      }

      // Lấy result từ LoginResponse
      const result = data.result;

      // Lưu Access Token
      localStorage.setItem(
        'accessToken',
        result.accessToken
      );

      // Lưu Refresh Token
      localStorage.setItem(
        'refreshToken',
        result.refreshToken
      );

      // Lưu thông tin user
      localStorage.setItem(
        'traveloka_auth_user',
        JSON.stringify(result.user)
      );

      // Cập nhật user trong React
      setUser(result.user);

      return true;
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(sanitizeErrorMessage(error, 'Đăng nhập không thành công, vui lòng thử lại!'));
    }
  };

  // Hàm cập nhật thông tin người dùng
  const updateUserProfile = (updatedData) => {
    const updated = { ...user, ...updatedData };
    setUser(updated);
    return updated;
  };

  // Hàm đăng xuất: xóa phiên local ngay để giao diện không bị treo
  const logout = () => {
    const refreshToken = localStorage.getItem('refreshToken');

    // Xóa thông tin đăng nhập ngay lập tức
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('traveloka_auth_user');
    setUser(null);

    // Gửi yêu cầu thu hồi refresh token ở nền
    if (refreshToken) {
      apiFetch('/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      }).catch((error) => {
        console.error('Logout API error:', error);
      });
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin' || user?.role === 'ROLE_ADMIN',
      login,
      updateUserProfile,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
