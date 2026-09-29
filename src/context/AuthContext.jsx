import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Đọc thông tin user từ localStorage nếu đã có phiên trước đó
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('traveloka_auth_user');
      return savedUser ? JSON.parse(savedUser) : null;
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

  // Hàm đăng nhập thông thường
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
          throw new Error(
              data?.result?.message ||
              'Email hoặc mật khẩu không đúng'
          );
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
            throw error;
        }
    
  };

  const loginWithGoogle = () => {
    const googleUser = {
      id: 'usr_google_99',
      name: 'Trần Hữu',
      email: 'huutran0991@gmail.com',
      role: 'ROLE_ADMIN', // Đồng bộ với chuẩn role của Backend JWT
      avatar: 'https://lh3.googleusercontent.com/a/default-user=s96-c',
      loginType: 'google'
    };
    setUser(googleUser);
    return googleUser;
  };

  // Hàm đăng nhập nhanh bằng tài khoản Facebook (mô phỏng OAuth2)
  const loginWithFacebook = () => {
    const fbUser = {
      id: 'usr_fb_88',
      name: 'Trần Văn Hữu',
      email: 'huutran.fb@gmail.com',
      role: 'user',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=60',
      loginType: 'facebook'
    };
    setUser(fbUser);
    return fbUser;
  };

  // Hàm cập nhật thông tin người dùng
  const updateUserProfile = (updatedData) => {
    const updated = { ...user, ...updatedData };
    setUser(updated);
    return updated;
  };

  // Hàm đăng xuất
  const logout = async () => {
     try {
        const refreshToken = localStorage.getItem('refreshToken');

        if (refreshToken) {
            await apiFetch(
                `/auth/logout`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        refreshToken,
                    }),
                }
            );
        }
    } catch (error) {
        console.error('Logout API error:', error);
    } finally {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('traveloka_auth_user');

        setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin'  || user?.role === 'ROLE_ADMIN',
      login,
      loginWithGoogle,
      loginWithFacebook,
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
