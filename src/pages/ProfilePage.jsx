import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  User, Shield, Lock, Smartphone, Mail, Key, Monitor, 
  History, Edit3, CheckCircle, AlertCircle, Hotel, LogOut, ChevronRight, X,
  Camera, Loader2, Eye, EyeOff
} from 'lucide-react';
import { apiFetch } from '../services/api';
import { getFriendlyErrorMessage, sanitizeErrorMessage } from '../utils/errorHandler';
import { compressImage } from '../utils/imageCompressor';



export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, updateUserProfile, logout } = useAuth();

  const avatarInputRef = useRef(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // State các Modal popup
  const [modalType, setModalType] = useState(null); // 'edit_profile', 'change_password', 'edit_email', 'edit_phone', 'devices', 'history'
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState('success');

  // Thông tin profile lấy từ backend
  const [profile, setProfile] = useState(null);

  // Form chỉnh sửa profile
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    phone: '',
    yob: '',
    gender: '',
    address: ''
  });

  const [errorMessage, setErrorMessage] = useState('');

  // Lấy profile khi mở trang
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchProfile = async () => {
        try {
            const response = await apiFetch('/customer/profile');

            console.log("PROFILE RESPONSE:", response);

            if (!response.ok) {
                console.warn("Cannot fetch profile:", response.status);
                if (user) setProfile(user);
                return;
            }

            const result = await response.json();

            console.log("PROFILE RESULT:", JSON.stringify(result, null, 2));

            setProfile(result.result || result);

        } catch (error) {
            console.error('Get profile error:', error);
            if (user) setProfile(user);
            showToast('Không thể lấy thông tin cá nhân');
        }
    };

    fetchProfile();
}, [isAuthenticated, user]);

  // Form State đổi mật khẩu
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const changingPasswordRef = useRef(false);

  // Trạng thái hiển thị/ẩn từng ô mật khẩu
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Form State cập nhật email / sđt
  const [newEmail, setNewEmail] = useState(user?.email || '');
  const [newPhone, setNewPhone] = useState(user?.phone || '0912 345 678');

  // Dữ liệu mô phỏng Lịch sử đăng nhập
  const [loginHistory] = useState([
    { id: 1, time: '19/09/2026 11:45', device: 'Chrome trên macOS (Apple Silicon)', ip: '14.241.228.18', location: 'Hà Nội, Việt Nam', status: 'Thành công (Hiện tại)' },
    { id: 2, time: '18/09/2026 21:10', device: 'Safari trên iPhone 15 Pro', ip: '113.161.72.95', location: 'TP. Hồ Chí Minh, Việt Nam', status: 'Thành công' },
    { id: 3, time: '17/09/2026 09:30', device: 'Chrome trên macOS', ip: '14.241.228.18', location: 'Hà Nội, Việt Nam', status: 'Thành công' }
  ]);

  // Dữ liệu mô phỏng Quản lý thiết bị
  const [activeDevices] = useState([
    { id: 1, name: 'MacBook Pro 14" (macOS)', browser: 'Google Chrome', lastActive: 'Đang hoạt động', current: true },
    { id: 2, name: 'iPhone 15 Pro (iOS 18)', browser: 'Traveloka App', lastActive: 'Hôm qua lúc 21:15', current: false }
  ]);


  // Tải ảnh đại diện lên backend (backend xử lý lưu ảnh lên Cloudinary)
  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Vui lòng chọn tập tin hình ảnh hợp lệ");
      e.target.value = "";
      return;
    }

    try {
      setIsUploadingAvatar(true);

      // Tối ưu hiệu năng: Tự động nén & thu nhỏ kích thước ảnh về chuẩn 400x400 px (~40-80KB)
      // Giúp giảm thời gian upload API PUT /customer/avatar từ ~3.7s xuống ~400ms và tiết kiệm dung lượng
      const fileToUpload = await compressImage(file, {
        maxWidth: 400,
        maxHeight: 400,
        quality: 0.85,
        outputType: 'image/jpeg',
      });

      const formData = new FormData();
      formData.append("file", fileToUpload);

      const response = await apiFetch("/customer/avatar", {
        method: "PUT",
        body: formData,
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(getFriendlyErrorMessage(result, "Tải ảnh đại diện thất bại"));
      }

      const avatarUrl = result.result;

      if (!avatarUrl) {
        throw new Error("API chưa trả về đường dẫn ảnh đại diện");
      }

      setProfile((prev) => prev ? { ...prev, avatarUrl } : prev);
      updateUserProfile({ avatarUrl });
      showToast("Cập nhật ảnh đại diện thành công");
    } catch (error) {
      console.error("Avatar upload error:", error);
      showToast(sanitizeErrorMessage(error, "Tải ảnh đại diện thất bại"));
    } finally {
      setIsUploadingAvatar(false);
      e.target.value = "";
    }
  };

  // Hiển thị toast thông báo
  const showToast = (msg, type = 'success') => {
    setToastType(type);
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Ẩn một phần email để bảo mật (vd: huu****0991@gmail.com)
  const maskEmail = (email) => {
    if (!email) return 'Chưa liên kết';
    const parts = email.split('@');
    if (parts.length < 2) return email;
    const name = parts[0];
    const masked = name.length > 3 
      ? name.slice(0, 3) + '****' + (name.length > 5 ? name.slice(-2) : '') 
      : name + '****';
    return `${masked}@${parts[1]}`;
  };

  // Ẩn một phần SĐT (vd: 0912 ••• 678)
  const maskPhone = (phone) => {
    if (!phone) return 'Chưa liên kết';
    const cleaned = phone.replace(/\s+/g, '');
    if (cleaned.length < 8) return phone;
    return `${cleaned.slice(0, 4)} ••• ${cleaned.slice(-3)}`;
  };

  // Mở modal chỉnh sửa và đổ dữ liệu hiện tại vào form
  const handleOpenEditProfile = () => {
    const current = profile || user || {};

    setProfileForm({
      fullName: current.fullName || current.name || '',
      phone: current.phone || '',
      yob: current.yob || '',
      gender: current.gender || '',
      address: current.address || ''
    });

    setModalType('edit_profile');
  };

// Xử lý lưu hồ sơ cá nhân
const handleSaveProfile = async (e) => {
  e.preventDefault();

  // Ngăn gửi nhiều request liên tiếp
  if (isSavingProfile) return;

  setIsSavingProfile(true);
  setErrorMessage('');

  try {
    const response = await apiFetch('/customer/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(profileForm)
    });

      const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      setErrorMessage(
        typeof result.result?.errors === 'string'
          ? result.result.errors
          : result.message || 'Cập nhật thông tin thất bại'
      );
      return;
    }

      // Backend trả về profile mới sau khi update
      setProfile(result.result);
      setErrorMessage('');

      setModalType(null);
      showToast('Cập nhật thông tin hồ sơ thành công!');
    } catch (error) {
      console.error('Update profile error:', error);
      showToast(sanitizeErrorMessage(error, 'Cập nhật thông tin thất bại'));
    } finally {
    setIsSavingProfile(false);
  }
  };

  // Xử lý đổi mật khẩu
  const handleChangePassword = async (e) => {
    e.preventDefault();

    // Ngăn gửi nhiều request liên tiếp
    if (changingPasswordRef.current) return;

    if (passwordForm.newPassword.length < 6) {
      showToast('Mật khẩu mới phải có ít nhất 6 ký tự!', 'error');
      return;
    }

    if (!/[A-Z]/.test(passwordForm.newPassword) || !/\d/.test(passwordForm.newPassword)) {
      showToast('Mật khẩu mới phải có ít nhất một chữ hoa và một chữ số!', 'error');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast('Mật khẩu xác nhận không trùng khớp!', 'error');
      return;
    }

    changingPasswordRef.current = true;
    setIsChangingPassword(true);

    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      }

      const response = await apiFetch('/auth/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result?.message || result?.result?.message || 'Đổi mật khẩu thất bại');
      }

      setModalType(null);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showToast('Đổi mật khẩu thành công. Vui lòng đăng nhập lại!');

      // Đợi toast hiển thị rồi mới xóa phiên và chuyển về trang đăng nhập
      setTimeout(() => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('traveloka_auth_user');
        navigate('/login', { replace: true });
      }, 2000);
    } catch (error) {
      console.error('Change password error:', error);
      showToast(error.message || 'Đổi mật khẩu thất bại', 'error');
    } finally {
      changingPasswordRef.current = false;
      setIsChangingPassword(false);
    }
  };

  // Xử lý lưu email
  const handleSaveEmail = (e) => {
    e.preventDefault();
    if (newEmail) {
      updateUserProfile({ email: newEmail });
      setModalType(null);
      showToast('Cập nhật địa chỉ email thành công!');
    }
  };

  // Xử lý lưu SĐT
  const handleSavePhone = (e) => {
    e.preventDefault();
    if (newPhone) {
      updateUserProfile({ phone: newPhone });
      setModalType(null);
      showToast('Cập nhật số điện thoại thành công!');
    }
  };

  // NẾU CHƯA ĐĂNG NHẬP
  if (!isAuthenticated) {
    return (
      <div className="bg-light min-vh-100 py-5 page-top-spacing d-flex align-items-center">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-5 col-md-7 text-center">
              <div className="card border-0 shadow-sm rounded-4 p-5 bg-white">
                <div className="d-inline-flex p-3 bg-primary-subtle text-primary rounded-circle mb-3 mx-auto">
                  <User size={48} />
                </div>
                <h4 className="fw-bold text-dark mb-2">Vui Lòng Đăng Nhập</h4>
                <p className="text-secondary small mb-4">
                  Bạn cần đăng nhập vào hệ thống để truy cập vào trang Quản lý tài khoản & Hồ sơ thành viên.
                </p>
                <Link to="/login" className="btn btn-primary rounded-pill px-4 py-2 fw-semibold">
                  Đăng nhập ngay
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-light pb-5 min-vh-100 page-top-spacing">
      <div className="container">
        
        {/* Toast thông báo nổi */}
        {toastMessage && (
          <div
            className="position-fixed top-0 start-50 translate-middle-x mt-4"
            style={{ zIndex: 99999, maxWidth: 'calc(100vw - 32px)' }}
          >
            <div className={`alert ${toastType === 'error' ? 'alert-danger' : 'alert-success'} shadow-lg border-0 rounded-pill px-4 py-2 d-flex align-items-center gap-2 mb-0`}>
              {toastType === 'error'
                ? <AlertCircle size={18} className="text-danger" />
                : <CheckCircle size={18} className="text-success" />}
              <span className="fw-semibold small">{toastMessage}</span>
            </div>
          </div>
        )}

        <div className="row g-4">
          
          {/* ================= CỘT TRÁI: SIDEBAR MENU ================= */}
          <div className="col-lg-3 col-md-4">
            
            {/* Thẻ Avatar Thành Viên (Chỗ 2: Đổi avatar nhanh khi nhấp trực tiếp vào ảnh) */}
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-3 text-center">
              <div 
                className="position-relative d-inline-block mx-auto mb-2 cursor-pointer"
                style={{ cursor: 'pointer' }}
                onClick={() => avatarInputRef.current?.click()}
                title="Nhấp vào ảnh để đổi nhanh ảnh đại diện"
              >
                <img 
                  src={user.avatarUrl || user.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=60"} 
                  alt={user.name} 
                  className="rounded-circle object-fit-cover shadow-sm border border-3 border-primary-subtle"
                  style={{ width: '88px', height: '88px', opacity: isUploadingAvatar ? 0.6 : 1, transition: 'opacity 0.2s' }}
                />
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); avatarInputRef.current?.click(); }}
                  disabled={isUploadingAvatar}
                  className="btn btn-sm btn-primary rounded-circle position-absolute bottom-0 end-0 p-1 shadow border border-white"
                  title="Nhấp để tải ảnh nhanh lên Cloudinary"
                  style={{ width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  {isUploadingAvatar ? <Loader2 size={14} className="spinner-border spinner-border-sm" style={{ width: 14, height: 14 }} /> : <Camera size={14} />}
                </button>
                <input
                  type="file"
                  ref={avatarInputRef}
                  style={{ display: 'none' }}
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={handleAvatarUpload}
                />
                {isAdmin && (
                  <span className="position-absolute top-0 start-0 badge bg-warning text-dark border border-white rounded-pill px-2 py-1 small fw-bold">
                    Admin
                  </span>
                )}
              </div>
              <div className="text-primary small mb-2 fw-medium" style={{ fontSize: '11px', cursor: 'pointer' }} onClick={() => avatarInputRef.current?.click()}>
                📷 Nhấp vào ảnh để đổi nhanh
              </div>

              <h5 className="fw-bold text-dark mb-1">{user.name}</h5>
              <p className="text-secondary small mb-2 text-truncate">{user.email}</p>

              <div className="d-inline-flex align-items-center gap-1 badge bg-light text-primary border px-3 py-1 rounded-pill small">
                {isAdmin ? '👑 Quản Trị Viên' : '⭐ Thành Viên Thân Thiết'}
              </div>
            </div>

            {/* Menu Danh Mục Tài Khoản (Chỉ hiển thị cho Khách hàng - Ẩn hoàn toàn với Admin) */}
            {!isAdmin && (
              <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
                
                {/* Nhóm: Đặt chỗ */}
                <div className="p-3 border-bottom">
                  <span className="small text-secondary fw-bold text-uppercase d-block mb-2" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>
                    Đặt Chỗ Của Tôi
                  </span>
                  <div className="d-flex flex-column gap-1">
                    <Link to="/my-bookings" className="d-flex align-items-center justify-content-between p-2 rounded-3 text-secondary text-decoration-none hover-bg-light small">
                      <span className="d-flex align-items-center gap-2">
                        <Hotel size={16} className="text-primary" /> Khách Sạn Đã Đặt
                      </span>
                      <ChevronRight size={14} className="text-secondary opacity-50" />
                    </Link>
                  </div>
                </div>

                {/* Nhóm: Quản lý tài khoản */}
                <div className="p-3">
                  <span className="small text-secondary fw-bold text-uppercase d-block mb-2" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>
                    Tài Khoản
                  </span>
                  <div className="d-flex flex-column gap-1">
                    <div className="d-flex align-items-center justify-content-between p-2 rounded-3 bg-primary-subtle text-primary fw-semibold small">
                      <span className="d-flex align-items-center gap-2">
                        <Shield size={16} /> Hồ Sơ & Bảo Mật
                      </span>
                      <ChevronRight size={14} />
                    </div>

                    <button 
                      onClick={() => {
                        logout();
                        navigate('/');
                      }}
                      className="d-flex align-items-center gap-2 p-2 rounded-3 text-danger border-0 bg-transparent text-start hover-bg-light small mt-2"
                    >
                      <LogOut size={16} /> Đăng xuất tài khoản
                    </button>
                  </div>
                </div>

              </div>
            )}

          </div>

          {/* ================= CỘT PHẢI: BẢO MẬT & THÔNG TIN CÁ NHÂN ================= */}
          <div className="col-lg-9 col-md-8">
            
            {/* ================= KHỐI 1: BẢO MẬT TÀI KHOẢN ================= */}
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
              <h4 className="fw-bold text-dark mb-4">Bảo Mật Tài Khoản</h4>

              <div className="row g-3">
                
                {/* 1. Email Đã Liên Kết */}
                <div className="col-lg-6 col-12">
                  <div className="p-3 rounded-4 bg-light bg-opacity-75 border d-flex align-items-center justify-content-between h-100">
                    <div className="d-flex align-items-center gap-3">
                      <div className="p-2 bg-white rounded-circle shadow-sm text-primary">
                        <Mail size={20} />
                      </div>
                      <div>
                        <span className="small text-secondary d-block">Email Đã Liên Kết</span>
                        <strong className="text-dark small">{maskEmail(user.email)}</strong>
                      </div>
                    </div>
                    <button 
                      onClick={() => setModalType('edit_email')} 
                      className="btn btn-sm btn-link text-primary text-decoration-none fw-semibold p-0"
                    >
                      Cập Nhật
                    </button>
                  </div>
                </div>

                {/* 2. Số Điện Thoại */}
                <div className="col-lg-6 col-12">
                  <div className="p-3 rounded-4 bg-light bg-opacity-75 border d-flex align-items-center justify-content-between h-100">
                    <div className="d-flex align-items-center gap-3">
                      <div className="p-2 bg-white rounded-circle shadow-sm text-success">
                        <Smartphone size={20} />
                      </div>
                      <div>
                        <span className="small text-secondary d-block">Liên kết số điện thoại</span>
                        <strong className="text-dark small">{maskPhone(user.phone || '0912 345 678')}</strong>
                      </div>
                    </div>
                    <button 
                      onClick={() => setModalType('edit_phone')} 
                      className="btn btn-sm btn-primary rounded-pill px-3 fw-semibold"
                      style={{ fontSize: '12px' }}
                    >
                      Liên kết
                    </button>
                  </div>
                </div>

                {/* 3. Mật Khẩu */}
                <div className="col-lg-6 col-12">
                  <div className="p-3 rounded-4 bg-light bg-opacity-75 border d-flex align-items-center justify-content-between h-100">
                    <div className="d-flex align-items-center gap-3">
                      <div className="p-2 bg-white rounded-circle shadow-sm text-danger">
                        <Lock size={20} />
                      </div>
                      <div>
                        <span className="small text-secondary d-block">Mật Khẩu</span>
                        <strong className="text-dark small">Đặt mật khẩu để bảo vệ tài khoản</strong>
                      </div>
                    </div>
                    <button 
                      onClick={() => setModalType('change_password')} 
                      className="btn btn-sm btn-primary rounded-pill px-3 fw-semibold"
                      style={{ fontSize: '12px' }}
                    >
                      Đổi
                    </button>
                  </div>
                </div>

                {/* 4. Quản lý thiết bị */}
                <div className="col-lg-6 col-12">
                  <div className="p-3 rounded-4 bg-light bg-opacity-75 border d-flex align-items-center justify-content-between h-100">
                    <div className="d-flex align-items-center gap-3">
                      <div className="p-2 bg-white rounded-circle shadow-sm text-info">
                        <Monitor size={20} />
                      </div>
                      <div>
                        <span className="small text-secondary d-block">
                          Quản lý thiết bị <span className="badge bg-danger-subtle text-danger ms-1">Mới</span>
                        </span>
                        <strong className="text-dark small">Các thiết bị đang đăng nhập</strong>
                      </div>
                    </div>
                    <button 
                      onClick={() => setModalType('devices')} 
                      className="btn btn-sm btn-link text-primary text-decoration-none fw-semibold p-0"
                    >
                      Xem
                    </button>
                  </div>
                </div>

                {/* 5. Lịch sử đăng nhập */}
                <div className="col-lg-6 col-12">
                  <div className="p-3 rounded-4 bg-light bg-opacity-75 border d-flex align-items-center justify-content-between h-100">
                    <div className="d-flex align-items-center gap-3">
                      <div className="p-2 bg-white rounded-circle shadow-sm text-warning">
                        <History size={20} />
                      </div>
                      <div>
                        <span className="small text-secondary d-block">Lịch sử đăng nhập</span>
                        <strong className="text-dark small">Xem lịch sử các phiên đăng nhập</strong>
                      </div>
                    </div>
                    <button 
                      onClick={() => setModalType('history')} 
                      className="btn btn-sm btn-link text-primary text-decoration-none fw-semibold p-0"
                    >
                      Xem
                    </button>
                  </div>
                </div>

              </div>
            </div>

            {/* ================= KHỐI 2: HỒ SƠ THÀNH VIÊN & THÔNG TIN CÁ NHÂN ================= */}
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div>
                  <h4 className="fw-bold text-dark mb-1">
                    {isAdmin ? "Hồ Sơ Quản Trị Viên" : "Thông Tin Cá Nhân & Hồ Sơ"}
                  </h4>
                  <p className="text-secondary small mb-0">
                    {isAdmin 
                      ? "Quản lý thông tin định danh và bảo mật cho tài khoản quản trị hệ thống Traveloka."
                      : "Hãy cập nhật thông tin chính xác để đối chiếu khi làm thủ tục nhận phòng khách sạn."}
                  </p>
                </div>
                <button 
                  onClick={handleOpenEditProfile} 
                  className="btn btn-outline-primary btn-sm rounded-pill px-3 fw-semibold d-flex align-items-center gap-1"
                >
                  <Edit3 size={14} /> Chỉnh Sửa
                </button>
              </div>

              <hr className="my-3 text-secondary-subtle" />

              <div className="row g-3">
                <div className="col-md-6">
                  <div className="p-3 bg-light rounded-3">
                    <span className="small text-secondary d-block">
                      {isAdmin ? "Họ và tên Quản trị viên" : "Họ và tên đầy đủ (hợp pháp)"}
                    </span>
                    <strong className="text-dark">{profile?.fullName || "Chưa cập nhật"}</strong>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="p-3 bg-light rounded-3">
                    <span className="small text-secondary d-block">
                      {isAdmin ? "Số điện thoại liên hệ" : "Số điện thoại"}
                    </span>
                    <strong className="text-dark">{profile?.phone || "Chưa cập nhật"}</strong>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="p-3 bg-light rounded-3">
                    <span className="small text-secondary d-block">Ngày sinh</span>
                    <strong className="text-dark">{profile?.yob || "Chưa cập nhật"}</strong>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="p-3 bg-light rounded-3">
                    <span className="small text-secondary d-block">Giới tính</span>
                    <strong className="text-dark">
                      {profile?.gender === 'MALE'
                        ? 'Nam'
                        : profile?.gender === 'FEMALE'
                          ? 'Nữ'
                          : 'Chưa cập nhật'}
                    </strong>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="p-3 bg-light rounded-3">
                    <span className="small text-secondary d-block">Địa chỉ</span>
                    <strong className="text-dark">{profile?.address || "Chưa cập nhật"}</strong>
                  </div>
                </div>


              </div>
            </div>

          </div>
        </div>

      </div>

      {/* ================= MODAL 1: CHỈNH SỬA THÔNG TIN CÁ NHÂN ================= */}
      {modalType === 'edit_profile' && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold text-dark">
                  {isAdmin ? "Cập Nhật Hồ Sơ Quản Trị Viên" : "Chỉnh Sửa Thông Tin Cá Nhân"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setModalType(null)}
                  disabled={isSavingProfile}
                ></button>
              </div>

              <form onSubmit={handleSaveProfile}>
                <div className="modal-body p-4">
                  
                  {/* Thông báo lỗi */}
                  {errorMessage && (
                  <div className="alert alert-danger py-2 small d-flex align-items-center gap-2 mb-3">
                    <AlertCircle size={16} className="flex-shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                  )}

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-dark">
                      Họ và tên đầy đủ *
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={profileForm.fullName}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          fullName: e.target.value
                        })
                      }
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-dark">
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      className="form-control"
                      value={profileForm.phone}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          phone: e.target.value
                        })
                      }
                      placeholder="0912345678"
                    />
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold text-dark">
                        Ngày sinh
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        value={profileForm.yob}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            yob: e.target.value
                          })
                        }
                      />
                    </div>

                    <div className="col-6">
                      <label className="form-label small fw-semibold text-dark">
                        Giới tính
                      </label>
                      <select
                        className="form-select"
                        value={profileForm.gender}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            gender: e.target.value
                          })
                        }
                      >
                        <option value="">Chọn giới tính</option>
                        <option value="MALE">Nam</option>
                        <option value="FEMALE">Nữ</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-dark">
                      Địa chỉ
                    </label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={profileForm.address}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          address: e.target.value
                        })
                      }
                      placeholder="Nhập địa chỉ của bạn"
                    ></textarea>
                  </div>

                </div>

                <div className="modal-footer border-top">
                  <button
                    type="button"
                    className="btn btn-secondary rounded-pill px-3"
                    onClick={() => setModalType(null)}
                    disabled={isSavingProfile}
                  >
                    Hủy bỏ
                  </button>

                  <button
                    type="submit"
                    className="btn btn-primary rounded-pill px-4 fw-bold"
                    disabled={isSavingProfile}
                  >
                    {isSavingProfile ? (
                      <>
                        <Loader2
                          size={16}
                          className="me-2 spinner-border spinner-border-sm"
                        />
                        Đang lưu...
                      </>
                    ) : (
                      'Lưu Thay Đổi'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: ĐỔI MẬT KHẨU ================= */}
      {modalType === 'change_password' && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold text-dark">Đổi Mật Khẩu Tài Khoản</h5>
                <button type="button" className="btn-close" onClick={() => setModalType(null)} disabled={isChangingPassword}></button>
              </div>
              <form onSubmit={handleChangePassword}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-dark">Mật khẩu hiện tại</label>
                    <div className="input-group">
                      <input
                        type={showPasswords.current ? 'text' : 'password'}
                        className="form-control"
                        placeholder="Nhập mật khẩu hiện tại"
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        autoComplete="current-password"
                        required
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        aria-label={showPasswords.current ? 'Ẩn mật khẩu hiện tại' : 'Hiển thị mật khẩu hiện tại'}
                        onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                      >
                        {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-dark">Mật khẩu mới (ít nhất 6 ký tự)</label>
                    <div className="input-group">
                      <input
                        type={showPasswords.new ? 'text' : 'password'}
                        className="form-control"
                        placeholder="Nhập mật khẩu mới"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        autoComplete="new-password"
                        required
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        aria-label={showPasswords.new ? 'Ẩn mật khẩu mới' : 'Hiển thị mật khẩu mới'}
                        onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                      >
                        {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-dark">Xác nhận mật khẩu mới</label>
                    <div className="input-group">
                      <input
                        type={showPasswords.confirm ? 'text' : 'password'}
                        className="form-control"
                        placeholder="Nhập lại mật khẩu mới"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        autoComplete="new-password"
                        required
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        aria-label={showPasswords.confirm ? 'Ẩn mật khẩu xác nhận' : 'Hiển thị mật khẩu xác nhận'}
                        onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                      >
                        {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-top">
                  <button
                    type="button"
                    className="btn btn-secondary rounded-pill px-3"
                    onClick={() => setModalType(null)}
                    disabled={isChangingPassword}
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary rounded-pill px-4 fw-bold"
                    disabled={isChangingPassword}
                  >
                    {isChangingPassword ? (
                      <>
                        <Loader2 size={16} className="me-2 spinner-border spinner-border-sm" />
                        Đang đổi mật khẩu...
                      </>
                    ) : (
                      'Xác Nhận Đổi'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 3: CẬP NHẬT EMAIL ================= */}
      {modalType === 'edit_email' && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold text-dark">Cập Nhật Địa Chỉ Email</h5>
                <button type="button" className="btn-close" onClick={() => setModalType(null)}></button>
              </div>
              <form onSubmit={handleSaveEmail}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-dark">Địa chỉ email mới *</label>
                    <input 
                      type="email" 
                      className="form-control" 
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      required
                    />
                    <small className="text-secondary d-block mt-1">
                      Vé điện tử E-voucher và thông báo xác nhận sẽ được gửi đến email này.
                    </small>
                  </div>
                </div>
                <div className="modal-footer border-top">
                  <button type="button" className="btn btn-secondary rounded-pill px-3" onClick={() => setModalType(null)}>
                    Hủy bỏ
                  </button>
                  <button type="submit" className="btn btn-primary rounded-pill px-4 fw-bold">
                    Cập Nhật Email
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 4: CẬP NHẬT SỐ ĐIỆN THOẠI ================= */}
      {modalType === 'edit_phone' && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold text-dark">Cập Nhật Số Điện Thoại</h5>
                <button type="button" className="btn-close" onClick={() => setModalType(null)}></button>
              </div>
              <form onSubmit={handleSavePhone}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-dark">Số điện thoại di động *</label>
                    <input 
                      type="tel" 
                      className="form-control" 
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      placeholder="0912 345 678"
                      required
                    />
                    <small className="text-secondary d-block mt-1">
                      Dùng để nhận tin nhắn SMS xác nhận mã đặt chỗ của khách sạn.
                    </small>
                  </div>
                </div>
                <div className="modal-footer border-top">
                  <button type="button" className="btn btn-secondary rounded-pill px-3" onClick={() => setModalType(null)}>
                    Hủy bỏ
                  </button>
                  <button type="submit" className="btn btn-primary rounded-pill px-4 fw-bold">
                    Lưu Số Điện Thoại
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 5: QUẢN LÝ THIẾT BỊ ================= */}
      {modalType === 'devices' && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold text-dark d-flex align-items-center gap-2">
                  <Monitor size={20} className="text-primary" /> Thiết Bị Đang Đăng Nhập
                </h5>
                <button type="button" className="btn-close" onClick={() => setModalType(null)}></button>
              </div>
              <div className="modal-body p-4">
                <p className="text-secondary small mb-3">
                  Danh sách các thiết bị hiện đang duy trì phiên đăng nhập vào tài khoản Traveloka của bạn:
                </p>
                <div className="d-flex flex-column gap-3">
                  {activeDevices.map(dev => (
                    <div key={dev.id} className="p-3 bg-light rounded-3 border d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center gap-3">
                        <div className="p-2 bg-white rounded-circle shadow-sm text-primary">
                          <Monitor size={22} />
                        </div>
                        <div>
                          <strong className="text-dark small d-block">
                            {dev.name} {dev.current && <span className="badge bg-success ms-1">Thiết bị này</span>}
                          </strong>
                          <span className="text-secondary" style={{ fontSize: '12px' }}>
                            {dev.browser} • {dev.lastActive}
                          </span>
                        </div>
                      </div>
                      {!dev.current && (
                        <button 
                          onClick={() => showToast('Đã đăng xuất khỏi thiết bị này!')} 
                          className="btn btn-outline-danger btn-sm rounded-pill px-3"
                          style={{ fontSize: '12px' }}
                        >
                          Đăng xuất
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="modal-footer border-top">
                <button type="button" className="btn btn-secondary rounded-pill px-4" onClick={() => setModalType(null)}>
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 6: LỊCH SỬ ĐĂNG NHẬP ================= */}
      {modalType === 'history' && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold text-dark d-flex align-items-center gap-2">
                  <History size={20} className="text-warning" /> Lịch Sử Đăng Nhập Gần Đây
                </h5>
                <button type="button" className="btn-close" onClick={() => setModalType(null)}></button>
              </div>
              <div className="modal-body p-4">
                <p className="text-secondary small mb-3">
                  Theo dõi thời gian, vị trí và thiết bị của các lần đăng nhập gần đây để bảo vệ tài khoản:
                </p>
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0 small">
                    <thead className="table-light">
                      <tr>
                        <th>THỜI GIAN</th>
                        <th>THIẾT BỊ</th>
                        <th>ĐỊA CHỈ IP</th>
                        <th>ĐỊA ĐIỂM</th>
                        <th>TRẠNG THÁI</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loginHistory.map(item => (
                        <tr key={item.id}>
                          <td className="text-dark fw-medium">{item.time}</td>
                          <td>{item.device}</td>
                          <td className="font-monospace text-secondary">{item.ip}</td>
                          <td>{item.location}</td>
                          <td>
                            <span className="badge bg-success-subtle text-success">
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="modal-footer border-top">
                <button type="button" className="btn btn-secondary rounded-pill px-4" onClick={() => setModalType(null)}>
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
