import React, { createContext, useContext, useState, useEffect } from 'react';

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
  const login = (email, password) => {
    // Nếu là tài khoản admin
    if (email.toLowerCase().includes('admin')) {
      const adminUser = {
        id: 'usr_admin_01',
        name: 'Trần Hữu (Quản trị viên)',
        email: email,
        role: 'admin',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60',
        loginType: 'password'
      };
      setUser(adminUser);
      return { success: true, user: adminUser };
    }

    // Tài khoản người dùng bình thường
    const standardUser = {
      id: 'usr_' + Date.now(),
      name: email.split('@')[0],
      email: email,
      role: 'user',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=60',
      loginType: 'password'
    };
    setUser(standardUser);
    return { success: true, user: standardUser };
  };

  // Hàm đăng nhập nhanh bằng tài khoản Google (mô phỏng OAuth2)
  const loginWithGoogle = () => {
    const googleUser = {
      id: 'usr_google_99',
      name: 'Trần Hữu',
      email: 'huutran0991@gmail.com',
      role: 'admin', // Mặc định cấp quyền admin cho email dự án để kiểm thử mọi tính năng thuận tiện
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

  // Hàm đăng ký tài khoản mới
  const register = ({ fullName, email, phone, password }) => {
    const newUser = {
      id: 'usr_' + Date.now(),
      name: fullName || email.split('@')[0],
      email: email,
      phone: phone || '',
      role: 'user',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=60',
      loginType: 'registered'
    };
    setUser(newUser);
    return { success: true, user: newUser };
  };

  // Hàm cập nhật thông tin người dùng
  const updateUserProfile = (updatedData) => {
    const updated = { ...user, ...updatedData };
    setUser(updated);
    return updated;
  };

  // Hàm đăng xuất
  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin',
      login,
      loginWithGoogle,
      loginWithFacebook,
      register,
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
