import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import { apiFetch } from '../services/api';
import { getFriendlyErrorMessage, sanitizeErrorMessage } from '../utils/errorHandler';
import AdminUserManagement from '../components/AdminUserManagement';


import {
  LayoutDashboard, Building, BookOpen, LogOut, Plus, Edit2,
  Trash2, Search, DollarSign, Users, Star,
  ShieldAlert, ExternalLink, Printer, Receipt, Banknote,
  CheckCircle2, BedDouble, BedSingle, Menu, X,
  BarChart2, CreditCard, Tag, MessageSquare, FileBarChart,
  Wifi, Coffee, Car, Dumbbell, Waves, UtensilsCrossed, Shield,
  TrendingUp, TrendingDown, Award, Clock, LogIn, LogOut as LogOutIcon,
  AlertCircle, UploadCloud, Filter, RotateCcw, Check
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Area, AreaChart, PieChart, Pie, Cell, Legend
} from 'recharts';

// ─── Dữ liệu biểu đồ 7 ngày gần nhất ────────────────────────────────────────
const last7Days = (() => {
  const days = [];
  const seeds = [3200000, 5100000, 4400000, 6800000, 3900000, 7200000, 8500000];
  const bookSeeds = [2, 4, 3, 6, 3, 5, 7];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    days.push({
      ngay: d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
      doanhThu: seeds[6 - i],
      daDat: bookSeeds[6 - i],
    });
  }
  return days;
})();

// ─── Dữ liệu mẫu Tiện nghi ───────────────────────────────────────────────────
const AMENITIES_DATA = [
  { id: 1, name: 'WiFi Miễn Phí', icon: '📶', category: 'Kết nối', hotelsCount: 5, description: 'Internet tốc độ cao phủ sóng toàn khu' },
  { id: 2, name: 'Hồ Bơi', icon: '🏊', category: 'Vui chơi', hotelsCount: 4, description: 'Hồ bơi ngoài trời hoặc trong nhà' },
  { id: 3, name: 'Spa & Massage', icon: '💆', category: 'Sức khỏe', hotelsCount: 4, description: 'Dịch vụ spa thư giãn cao cấp' },
  { id: 4, name: 'Bữa Sáng Buffet', icon: '🍳', category: 'Ẩm thực', hotelsCount: 5, description: 'Buffet sáng phong phú nhiều món' },
  { id: 5, name: 'Phòng Gym', icon: '🏋️', category: 'Sức khỏe', hotelsCount: 3, description: 'Trung tâm thể dục hiện đại' },
  { id: 6, name: 'Bãi Đỗ Xe', icon: '🚗', category: 'Di chuyển', hotelsCount: 5, description: 'Bãi đỗ xe miễn phí trong khuôn viên' },
  { id: 7, name: 'Đưa Đón Sân Bay', icon: '✈️', category: 'Di chuyển', hotelsCount: 4, description: 'Dịch vụ xe đưa đón sân bay' },
  { id: 8, name: 'Bãi Biển Riêng', icon: '🏖️', category: 'Vui chơi', hotelsCount: 1, description: 'Bãi biển riêng tư cho khách lưu trú' },
  { id: 9, name: 'Nhà Hàng', icon: '🍽️', category: 'Ẩm thực', hotelsCount: 5, description: 'Nhà hàng ẩm thực đa dạng phong cách' },
  { id: 10, name: 'Quầy Bar', icon: '🍸', category: 'Ẩm thực', hotelsCount: 3, description: 'Quầy bar cocktail và đồ uống cao cấp' },
  { id: 11, name: 'Phòng Hội Nghị', icon: '💼', category: 'Kinh doanh', hotelsCount: 2, description: 'Phòng hội nghị trang bị hiện đại' },
  { id: 12, name: 'Lễ Tân 24/7', icon: '🛎️', category: 'Dịch vụ', hotelsCount: 5, description: 'Lễ tân phục vụ 24 giờ mỗi ngày' },
];

// ─── Dữ liệu mẫu Mã Giảm Giá ────────────────────────────────────────────────
const COUPONS_DATA = [
  { id: 'TV-SUMMER26', discount: 20, type: 'percent', minOrder: 2000000, maxDiscount: 500000, expiry: '31/12/2026', usedCount: 143, totalCount: 500, status: 'active', description: 'Ưu đãi mùa hè - Giảm 20% cho đặt phòng từ 2 triệu' },
  { id: 'TV-NEW30', discount: 30, type: 'percent', minOrder: 1500000, maxDiscount: 800000, expiry: '31/10/2026', usedCount: 87, totalCount: 200, status: 'active', description: 'Khách hàng mới - Giảm 30% lần đầu đặt phòng' },
  { id: 'TV-FLASH200K', discount: 200000, type: 'fixed', minOrder: 1000000, maxDiscount: 200000, expiry: '15/10/2026', usedCount: 320, totalCount: 320, status: 'expired', description: 'Flash Sale - Giảm ngay 200.000đ đặt phòng cuối tuần' },
  { id: 'TV-LOYAL15', discount: 15, type: 'percent', minOrder: 500000, maxDiscount: 300000, expiry: '31/12/2026', usedCount: 56, totalCount: 1000, status: 'active', description: 'Khách hàng thân thiết - Giảm 15% không giới hạn' },
  { id: 'TV-WEEKEND', discount: 10, type: 'percent', minOrder: 800000, maxDiscount: 150000, expiry: '30/11/2026', usedCount: 0, totalCount: 300, status: 'scheduled', description: 'Ưu đãi cuối tuần - Giảm 10% đặt phòng thứ 6, 7, CN' },
];

// ─── Màu pie chart ───────────────────────────────────────────────────────────
const PIE_COLORS = ['#3b82f6', '#f59e0b', '#22c55e', '#ec4899', '#8b5cf6'];

// ─── Sidebar menu ────────────────────────────────────────────────────────────
const SIDEBAR_MENU = [
  { group: 'TỔNG QUAN', items: [{ key: 'dashboard', label: 'Tổng Quan', icon: <LayoutDashboard size={17} /> }] },
  {
    group: 'QUẢN LÝ KHO PHÒNG',
    items: [
      { key: 'hotels', label: 'Khách Sạn', icon: <Building size={17} /> },
      { key: 'rooms', label: 'Loại Phòng', icon: <BedDouble size={17} /> },
      { key: 'amenities', label: 'Tiện Nghi', icon: <Star size={17} /> },
    ]
  },
  {
    group: 'VẬN HÀNH',
    items: [
      { key: 'bookings', label: 'Đặt Phòng', icon: <BookOpen size={17} /> },
      { key: 'customers', label: 'Khách Hàng', icon: <Users size={17} /> },
      { key: 'users', label: 'Người Dùng', icon: <Shield size={17} /> },
      { key: 'payments', label: 'Thanh Toán', icon: <CreditCard size={17} /> },
      { key: 'coupons', label: 'Khuyến Mãi', icon: <Tag size={17} /> },
      { key: 'reviews', label: 'Đánh Giá', icon: <MessageSquare size={17} /> },
    ]
  },
  { group: 'PHÂN TÍCH', items: [{ key: 'reports', label: 'Báo Cáo & Thống Kê', icon: <FileBarChart size={17} /> }] },
];

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { user, isAdmin, login, logout } = useAuth();
  const { showAlert, showConfirm } = useAlert();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [toastMsg, setToastMsg] = useState(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // ── Hotels state ──
  const [hotels, setHotels] = useState(() => {
    try { const s = localStorage.getItem('traveloka_custom_hotels'); return s ? JSON.parse(s) : []; }
    catch { return []; }
  });

  // ── Rooms state (FR-14) ──
  const [roomsList, setRoomsList] = useState(() => {
    try {
      const s = localStorage.getItem('traveloka_custom_rooms');
      if (s) {
        const parsed = JSON.parse(s);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Error reading traveloka_custom_rooms:', e);
    }
    return [];
  });

  // ── Helper chuẩn hóa đơn đặt phòng ──
  const normalizeBooking = (b) => {
    const rawId = b.id;
    const bookingCode = b.bookingCode || (typeof rawId === 'number' ? `BK-${String(rawId).padStart(4, '0')}` : (b.bookingCode || rawId));
    const nights = b.nights || 1;
    const totalAmount = b.totalPrice != null ? Number(b.totalPrice) : (b.totalAmount || 0);
    let rawStatus = (b.status || 'PENDING').toUpperCase();
    const checkInDate = b.checkIn || b.checkInDate || '—';
    const checkOutDate = b.checkOut || b.checkOutDate || '—';
    const paymentMethod = (b.paymentMethod === 'VNPAY' || b.paymentMethod === 'vnpay') ? 'vnpay' : 'pay_at_hotel';
    let paymentStatus = (b.paymentStatus === 'SUCCESS' || b.paymentStatus === 'paid' || b.paymentStatus === 'PAID') ? 'paid' : 'pending';

    // 1. Khi đơn đã COMPLETED (trả phòng hoàn tất lưu trú) và là tiền mặt -> Bắt buộc thanh toán là 'paid'
    if (rawStatus === 'COMPLETED' && paymentMethod === 'pay_at_hotel') {
      paymentStatus = 'paid';
    }

    // 2. Chuyển khoản VNPay khi đã thanh toán thành công -> TỰ ĐỘNG DUYỆT ĐƠN (CONFIRMED), không cần admin duyệt
    if (paymentMethod === 'vnpay' && paymentStatus === 'paid' && rawStatus === 'PENDING') {
      rawStatus = 'CONFIRMED';
    }

    // 3. Xác định xem đơn có bị quá hạn nhận phòng hoặc trả phòng hay không
    const todayStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    let isPastCheckIn = false;
    let isPastCheckOut = false;
    if (checkInDate && checkInDate !== '—') {
      if (/^\d{4}-\d{2}-\d{2}$/.test(checkInDate)) {
        isPastCheckIn = checkInDate < todayStr;
      } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(checkInDate)) {
        const [dd, mm, yyyy] = checkInDate.split('/');
        isPastCheckIn = `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}` < todayStr;
      }
    }
    if (checkOutDate && checkOutDate !== '—') {
      if (/^\d{4}-\d{2}-\d{2}$/.test(checkOutDate)) {
        isPastCheckOut = checkOutDate < todayStr;
      } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(checkOutDate)) {
        const [dd, mm, yyyy] = checkOutDate.split('/');
        isPastCheckOut = `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}` < todayStr;
      }
    }

    // Các trường hợp Quá hạn (EXPIRED):
    // - PENDING mà checkIn < today (quá hạn duyệt)
    // - CONFIRMED mà checkIn < today (Khách không đến nhận phòng - No Show)
    // - VNPay chưa thanh toán mà checkIn < today
    // - rawStatus === 'EXPIRED'
    const isExpired = (
      (rawStatus === 'PENDING' && isPastCheckIn) ||
      (rawStatus === 'CONFIRMED' && isPastCheckIn) ||
      (paymentMethod === 'vnpay' && paymentStatus !== 'paid' && isPastCheckIn) ||
      rawStatus === 'EXPIRED'
    );

    // Quá hạn trả phòng: CHECKED_IN mà checkOut < today
    const isOverdueCheckout = (rawStatus === 'CHECKED_IN' && isPastCheckOut);

    // 4. Giới hạn thời gian 30 phút cho đơn chuyển khoản VNPay chưa thanh toán -> Tự động HỦY (CANCELLED)
    let isPaymentTimeout = false;
    if (paymentMethod === 'vnpay' && paymentStatus !== 'paid' && (rawStatus === 'PENDING' || rawStatus === 'pending')) {
      const createdStr = b.rawCreatedAt || b.createdAt;
      if (createdStr) {
        let createdDate = null;
        if (typeof createdStr === 'string' && createdStr.includes('/')) {
          const parts = createdStr.split(' ');
          const datePart = parts[0];
          const timePart = parts[1] || '00:00';
          const [dd, mm, yyyy] = datePart.split('/');
          createdDate = new Date(`${yyyy}-${mm}-${dd}T${timePart}`);
        } else {
          createdDate = new Date(createdStr);
        }
        if (createdDate && !isNaN(createdDate.getTime())) {
          const diffMinutes = (Date.now() - createdDate.getTime()) / (1000 * 60);
          if (diffMinutes > 30) {
            isPaymentTimeout = true;
          }
        }
      }
    }

    let finalRawStatus = rawStatus;
    if (isExpired) {
      finalRawStatus = 'EXPIRED';
    } else if (isPaymentTimeout) {
      finalRawStatus = 'CANCELLED';
    }
    const finalStatus = finalRawStatus.toLowerCase();

    return {
      id: rawId,
      bookingCode,
      contactName: b.customerName || b.contactName || b.guestName || 'Khách hàng',
      contactPhone: b.customerPhone || b.contactPhone || '—',
      contactEmail: b.customerEmail || b.contactEmail || '—',
      hotelName: b.hotelName || 'Khách sạn',
      roomName: b.roomName || 'Phòng nghỉ',
      checkInDate,
      checkOutDate,
      nights,
      paymentMethod,
      paymentStatus,
      totalAmount,
      status: finalStatus,
      rawStatus: finalRawStatus,
      isExpired,
      isOverdueCheckout,
      isPastCheckIn,
      isPastCheckOut,
      isPaymentTimeout,
      createdAt: b.createdAt || new Date().toLocaleString('vi-VN'),
      raw: b
    };
  };

  // ── Bookings state ──
  const [bookings, setBookings] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('traveloka_bookings') || '[]');
      return Array.isArray(saved) ? saved.map(normalizeBooking) : [];
    }
    catch { return []; }
  });
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);

  const updateHotels = (next) => {
    setHotels(next);
    localStorage.setItem('traveloka_custom_hotels', JSON.stringify(next));
    window.dispatchEvent(new Event('traveloka_hotels_updated'));
  };
  const updateBookings = (next) => {
    setBookings(next);
    localStorage.setItem('traveloka_bookings', JSON.stringify(next));
    window.dispatchEvent(new Event('traveloka_bookings_updated'));
  };
  const updateRooms = (next) => {
    setRoomsList(next);
    localStorage.setItem('traveloka_custom_rooms', JSON.stringify(next));
    window.dispatchEvent(new Event('traveloka_rooms_updated'));
  };

  // Đồng bộ thông tin khách sạn khi danh sách phòng thay đổi (minPrice, totalRooms, rooms)
  const syncHotelWithRooms = (hotelId, currentRooms) => {
    const hotelRooms = currentRooms.filter(r => String(r.hotelId) === String(hotelId));
    const minPrice = hotelRooms.length > 0
      ? Math.min(...hotelRooms.map(r => Number(r.pricePerNight) || 1000000))
      : 1000000;
    const updatedHotels = hotels.map(h => {
      if (String(h.id) === String(hotelId)) {
        return {
          ...h,
          rooms: hotelRooms,
          minPrice: isFinite(minPrice) ? minPrice : (h.minPrice || 1000000),
          totalRooms: hotelRooms.length
        };
      }
      return h;
    });
    updateHotels(updatedHotels);
  };

  // ── Bộ lọc danh sách loại phòng (FR-14) ──
  const [roomSearchQuery, setRoomSearchQuery] = useState('');
  const [roomHotelFilter, setRoomHotelFilter] = useState('ALL');
  const [roomStatusFilter, setRoomStatusFilter] = useState('ALL');

  const filteredRoomsList = useMemo(() => {
    return roomsList.filter(r => {
      if (roomHotelFilter !== 'ALL' && String(r.hotelId) !== String(roomHotelFilter)) {
        return false;
      }
      if (roomStatusFilter !== 'ALL' && r.status !== roomStatusFilter) {
        return false;
      }
      if (roomSearchQuery.trim()) {
        const q = roomSearchQuery.toLowerCase().trim();
        const matchName = r.name?.toLowerCase().includes(q);
        const matchHotel = r.hotelName?.toLowerCase().includes(q);
        const matchBed = r.bedType?.toLowerCase().includes(q);
        if (!matchName && !matchHotel && !matchBed) {
          return false;
        }
      }
      return true;
    });
  }, [roomsList, roomHotelFilter, roomStatusFilter, roomSearchQuery]);

  // Thống kê trạng thái loại phòng cho 4 thẻ KPI
  const roomStats = useMemo(() => {
    const total = roomsList.length;
    const available = roomsList.filter(r => r.status === 'AVAILABLE').length;
    const booked = roomsList.filter(r => r.status === 'BOOKED').length;
    const maintenance = roomsList.filter(r => r.status === 'MAINTENANCE').length;
    return { total, available, booked, maintenance };
  }, [roomsList]);

  // Tải dữ liệu thật từ Backend nếu Backend online và đã đăng nhập
  useEffect(() => {
    const fetchBackendData = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      try {
        const hotelRes = await apiFetch('/admin/hotels?size=50');
        if (hotelRes.ok) {
          const hotelData = await hotelRes.json();
          if (hotelData.result && Array.isArray(hotelData.result.content)) {
            setHotels(hotelData.result.content);
            localStorage.setItem('traveloka_custom_hotels', JSON.stringify(hotelData.result.content));
          }
        }
      } catch (e) {
        console.warn('API hotels fetch fallback:', e);
      }

      try {
        const roomRes = await apiFetch('/admin/rooms');
        if (roomRes.ok) {
          const roomData = await roomRes.json();
          if (roomData.result && Array.isArray(roomData.result)) {
            setRoomsList(roomData.result);
            localStorage.setItem('traveloka_custom_rooms', JSON.stringify(roomData.result));
          }
        }
      } catch (e) {
        console.warn('API rooms fetch fallback:', e);
      }

      // Tải danh sách đơn đặt phòng từ Backend
      try {
        await fetchBookings();
      } catch (e) {
        console.warn('API bookings fetch fallback:', e);
      }
    };

    if (isAdmin) {
      fetchBackendData();
    }
  }, [isAdmin]);

  // ── Hotel modal (FR-13) ──
  const [showHotelModal, setShowHotelModal] = useState(false);
  const [editingHotel, setEditingHotel] = useState(null);
  const [hotelForm, setHotelForm] = useState({ name: '', city: 'Hồ Chí Minh', address: '', starRating: 5, pricePerNight: 1200000, description: '', thumbnailUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=60' });
  const hotelImageInputRef = useRef(null);
  const [isUploadingHotelImage, setIsUploadingHotelImage] = useState(false);

  const openAddHotel = () => { setEditingHotel(null); setHotelForm({ name: '', city: 'Hồ Chí Minh', address: '', starRating: 5, pricePerNight: 1200000, description: '', thumbnailUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=60' }); setShowHotelModal(true); };
  const openEditHotel = (h) => { setEditingHotel(h); setHotelForm({ name: h.name, city: h.city, address: h.address, starRating: h.starRating, pricePerNight: h.minPrice || h.rooms?.[0]?.pricePerNight || h.pricePerNight || 1000000, description: h.description, thumbnailUrl: h.thumbnailUrl }); setShowHotelModal(true); };

  // Xử lý upload ảnh đại diện khách sạn (MultipartFile) lên Cloudinary
  const handleHotelImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showAlert({
        title: 'Tập tin không hợp lệ',
        message: 'Vui lòng chọn tập tin hình ảnh hợp lệ (JPG, PNG, WEBP).',
        type: 'error'
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showAlert({
        title: 'Tập tin quá lớn',
        message: 'Dung lượng hình ảnh tối đa là 5MB.',
        type: 'warning'
      });
      return;
    }

    try {
      setIsUploadingHotelImage(true);
      showToast('Đang tải ảnh đại diện lên Cloudinary...');

      const formData = new FormData();
      formData.append('file', file);

      let uploadedUrl = '';
      if (editingHotel?.id) {
        // Cập nhật ảnh trực tiếp vào khách sạn theo ID trong database
        const res = await apiFetch(`/admin/hotels/${editingHotel.id}/thumbnail`, {
          method: 'PUT',
          body: formData
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(getFriendlyErrorMessage(data, 'Tải ảnh đại diện khách sạn thất bại'));
        }
        uploadedUrl = data.result?.thumbnailUrl || data.result;
        // Đồng bộ cập nhật ngay vào danh sách khách sạn
        updateHotels(hotels.map(h => h.id === editingHotel.id ? { ...h, thumbnailUrl: uploadedUrl } : h));
      } else {
        // Tạo mới: tải ảnh qua Backend lấy link Cloudinary an toàn
        const res = await apiFetch('/admin/hotels/upload-thumbnail', {
          method: 'POST',
          body: formData
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(getFriendlyErrorMessage(data, 'Tải ảnh đại diện khách sạn thất bại'));
        }
        uploadedUrl = data.result;
      }

      setHotelForm(prev => ({ ...prev, thumbnailUrl: uploadedUrl }));
      showToast('Tải ảnh đại diện lên Cloudinary thành công!');
    } catch (err) {
      console.error('Lỗi khi tải ảnh khách sạn lên Cloudinary:', err);
      showToast('Lỗi tải ảnh lên Cloudinary: ' + sanitizeErrorMessage(err));
    } finally {
      setIsUploadingHotelImage(false);
      if (hotelImageInputRef.current) {
        hotelImageInputRef.current.value = '';
      }
    }
  };

  const saveHotel = async (e) => {
    e.preventDefault();
    try {
      if (editingHotel) {
        const res = await apiFetch(`/admin/hotels/${editingHotel.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            name: hotelForm.name,
            city: hotelForm.city,
            address: hotelForm.address,
            starRating: Number(hotelForm.starRating),
            pricePerNight: Number(hotelForm.pricePerNight),
            description: hotelForm.description,
            thumbnailUrl: hotelForm.thumbnailUrl,
            amenities: editingHotel.amenities || 'WiFi, Bữa sáng, Hồ bơi'
          })
        });
        if (res.ok) {
          const json = await res.json();
          updateHotels(hotels.map(h => h.id === editingHotel.id ? json.result : h));
          showToast('Cập nhật khách sạn lên máy chủ thành công!');
        } else {
          const errJson = await res.json().catch(() => ({}));
          showToast('Lỗi cập nhật: ' + getFriendlyErrorMessage(errJson, 'Cập nhật thất bại'));
        }
      } else {
        const res = await apiFetch('/admin/hotels', {
          method: 'POST',
          body: JSON.stringify({
            name: hotelForm.name,
            city: hotelForm.city,
            address: hotelForm.address,
            starRating: Number(hotelForm.starRating),
            pricePerNight: Number(hotelForm.pricePerNight),
            description: hotelForm.description,
            thumbnailUrl: hotelForm.thumbnailUrl,
            amenities: 'WiFi miễn phí, Bữa sáng buffet, Hồ bơi ngoài trời'
          })
        });
        if (res.ok) {
          const json = await res.json();
          updateHotels([json.result, ...hotels]);
          showToast('Thêm khách sạn mới lên cơ sở dữ liệu thành công!');
        } else {
          const errJson = await res.json().catch(() => ({}));
          showToast('Lỗi thêm khách sạn: ' + getFriendlyErrorMessage(errJson, 'Thêm thất bại'));
        }
      }
    } catch (err) {
      console.warn('Lỗi kết nối API khách sạn:', err);
      showToast(sanitizeErrorMessage(err, 'Lỗi kết nối máy chủ'));
    }
    setShowHotelModal(false);
  };

  const deleteHotel = async (id) => {
    const hotelToDelete = hotels.find(h => h.id === id);
    const confirmed = await showConfirm({
      title: 'Xóa khách sạn khỏi hệ thống',
      message: `Bạn có chắc chắn muốn xóa khách sạn "${hotelToDelete?.name || ''}" không?\nThao tác này sẽ xóa toàn bộ các loại phòng thuộc khách sạn này.`,
      type: 'warning',
      confirmText: 'Xóa khách sạn',
      cancelText: 'Hủy'
    });
    if (!confirmed) return;
    try {
      const res = await apiFetch(`/admin/hotels/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Đã xóa khách sạn khỏi máy chủ');
      }
    } catch (e) {
      console.warn('Delete hotel API error, updating state:', e);
    }
    updateHotels(hotels.filter(h => h.id !== id));
    const nextRooms = roomsList.filter(r => r.hotelId !== id);
    updateRooms(nextRooms);
  };

  // ── Room modal (FR-14) ──
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [roomForm, setRoomForm] = useState({
    hotelId: '',
    name: '',
    pricePerNight: 1200000,
    maxGuests: 2,
    bedType: '1 Giường đôi lớn (King Size)',
    roomSize: '35 m²',
    status: 'AVAILABLE',
    imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&auto=format&fit=crop&q=60',
    description: 'Phòng đầy đủ tiện nghi tiêu chuẩn cao cấp, nội thất hiện đại và view thoáng đãng.'
  });
  const roomImageInputRef = useRef(null);
  const [isUploadingRoomImage, setIsUploadingRoomImage] = useState(false);

  // Xử lý upload ảnh loại phòng (MultipartFile) lên Cloudinary
  const handleRoomImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showAlert({
        title: 'Tập tin không hợp lệ',
        message: 'Vui lòng chọn tập tin hình ảnh hợp lệ (JPG, PNG, WEBP).',
        type: 'error'
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showAlert({
        title: 'Tập tin quá lớn',
        message: 'Dung lượng hình ảnh tối đa là 5MB.',
        type: 'warning'
      });
      return;
    }

    try {
      setIsUploadingRoomImage(true);
      showToast('Đang tải ảnh loại phòng lên Cloudinary...');

      const formData = new FormData();
      formData.append('file', file);

      let uploadedUrl = '';
      if (editingRoom?.id && !String(editingRoom.id).startsWith('r-')) {
        // Cập nhật ảnh trực tiếp vào loại phòng theo ID trong database
        const res = await apiFetch(`/admin/rooms/${editingRoom.id}/image`, {
          method: 'PUT',
          body: formData
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(getFriendlyErrorMessage(data, 'Tải ảnh loại phòng thất bại'));
        }
        uploadedUrl = data.result?.imageUrl || data.result;
        // Đồng bộ cập nhật ngay vào danh sách loại phòng
        const updated = roomsList.map(r => r.id === editingRoom.id ? { ...r, imageUrl: uploadedUrl } : r);
        updateRooms(updated);
        const targetHotelId = editingRoom?.hotelId || roomForm.hotelId;
        if (targetHotelId) {
          syncHotelWithRooms(targetHotelId, updated);
        }
      } else {
        // Tạo mới: tải ảnh qua Backend lấy link Cloudinary an toàn
        const res = await apiFetch('/admin/rooms/upload-image', {
          method: 'POST',
          body: formData
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(getFriendlyErrorMessage(data, 'Tải ảnh loại phòng thất bại'));
        }
        uploadedUrl = data.result;
      }

      setRoomForm(prev => ({ ...prev, imageUrl: uploadedUrl }));
      showToast('Tải ảnh loại phòng lên Cloudinary thành công!');
    } catch (err) {
      console.error('Lỗi khi tải ảnh loại phòng lên Cloudinary:', err);
      showToast('Lỗi tải ảnh lên Cloudinary: ' + sanitizeErrorMessage(err));
    } finally {
      setIsUploadingRoomImage(false);
      if (roomImageInputRef.current) {
        roomImageInputRef.current.value = '';
      }
    }
  };

  // Đổi trạng thái phòng nhanh trực tiếp trên bảng danh sách (FR-14)
  const handleQuickChangeRoomStatus = async (roomId, newStatus) => {
    const updated = roomsList.map(r => r.id === roomId ? { ...r, status: newStatus } : r);
    updateRooms(updated);
    const targetRoom = updated.find(r => r.id === roomId);
    if (targetRoom) {
      syncHotelWithRooms(targetRoom.hotelId, updated);
    }
    const statusLabels = {
      AVAILABLE: 'Sẵn Sàng (Available)',
      BOOKED: 'Đang Có Khách (Booked)',
      MAINTENANCE: 'Đang Bảo Trì (Maintenance)'
    };
    showToast(`Đã đổi trạng thái phòng thành: ${statusLabels[newStatus] || newStatus}`);

    try {
      if (typeof roomId === 'number' || !String(roomId).startsWith('r-')) {
        await apiFetch(`/admin/rooms/${roomId}`, {
          method: 'PUT',
          body: JSON.stringify({
            hotelId: Number(targetRoom.hotelId),
            name: targetRoom.name,
            pricePerNight: Number(targetRoom.pricePerNight),
            maxGuests: Number(targetRoom.maxGuests),
            bedType: targetRoom.bedType,
            roomSize: targetRoom.roomSize,
            status: newStatus,
            imageUrl: targetRoom.imageUrl,
            description: targetRoom.description
          })
        });
      }
    } catch (e) {
      console.warn('Quick change room status API warning:', e);
    }
  };

  const openAddRoom = () => {
    setEditingRoom(null);
    setRoomForm({
      hotelId: hotels[0]?.id || '',
      name: '',
      pricePerNight: 1200000,
      maxGuests: 2,
      bedType: '1 Giường đôi lớn (King Size)',
      roomSize: '35 m²',
      status: 'AVAILABLE',
      imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&auto=format&fit=crop&q=60',
      description: 'Phòng đầy đủ tiện nghi cao cấp, nội thất gỗ sang trọng.'
    });
    setShowRoomModal(true);
  };

  const openEditRoom = (r) => {
    setEditingRoom(r);
    setRoomForm({
      hotelId: r.hotelId || hotels[0]?.id,
      name: r.name,
      pricePerNight: r.pricePerNight,
      maxGuests: r.maxGuests || 2,
      bedType: r.bedType || '1 Giường đôi lớn (King Size)',
      roomSize: r.roomSize || '35 m²',
      status: r.status || 'AVAILABLE',
      imageUrl: r.imageUrl || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&auto=format&fit=crop&q=60',
      description: r.description || ''
    });
    setShowRoomModal(true);
  };

  const saveRoom = async (e) => {
    e.preventDefault();
    const targetHotel = hotels.find(h => String(h.id) === String(roomForm.hotelId)) || hotels[0];
    let savedRoomObj = null;

    try {
      if (editingRoom) {
        const res = await apiFetch(`/admin/rooms/${editingRoom.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            hotelId: Number(roomForm.hotelId),
            name: roomForm.name,
            pricePerNight: Number(roomForm.pricePerNight),
            maxGuests: Number(roomForm.maxGuests),
            bedType: roomForm.bedType,
            roomSize: roomForm.roomSize,
            status: roomForm.status,
            imageUrl: roomForm.imageUrl,
            description: roomForm.description
          })
        });
        if (res.ok) {
          const json = await res.json();
          savedRoomObj = { ...json.result, hotelName: targetHotel?.name };
          showToast('Cập nhật loại phòng trên máy chủ thành công!');
        } else {
          savedRoomObj = { ...editingRoom, ...roomForm, hotelId: targetHotel?.id, hotelName: targetHotel?.name };
          showToast('Đã lưu thay đổi loại phòng');
        }
        const updated = roomsList.map(r => r.id === editingRoom.id ? savedRoomObj : r);
        updateRooms(updated);
        syncHotelWithRooms(roomForm.hotelId, updated);
      } else {
        const res = await apiFetch('/admin/rooms', {
          method: 'POST',
          body: JSON.stringify({
            hotelId: Number(roomForm.hotelId),
            name: roomForm.name,
            pricePerNight: Number(roomForm.pricePerNight),
            maxGuests: Number(roomForm.maxGuests),
            bedType: roomForm.bedType,
            roomSize: roomForm.roomSize,
            status: roomForm.status,
            imageUrl: roomForm.imageUrl,
            description: roomForm.description
          })
        });
        if (res.ok) {
          const json = await res.json();
          savedRoomObj = {
            ...json.result,
            hotelId: json.result?.hotelId || Number(roomForm.hotelId),
            hotelName: json.result?.hotelName || targetHotel?.name
          };
          showToast('Tạo mới loại phòng trên máy chủ thành công!');
        } else {
          savedRoomObj = {
            id: `r-${Date.now()}`,
            ...roomForm,
            hotelId: targetHotel ? targetHotel.id : (Number(roomForm.hotelId) || hotels[0]?.id),
            hotelName: targetHotel?.name
          };
          showToast('Đã tạo loại phòng mới');
        }
        const updated = [savedRoomObj, ...roomsList];
        updateRooms(updated);
        syncHotelWithRooms(roomForm.hotelId, updated);
        // Đặt lại bộ lọc để phòng mới tạo luôn hiển thị ngay lập tức
        setRoomSearchQuery('');
        setRoomHotelFilter('ALL');
        setRoomStatusFilter('ALL');
      }
    } catch (err) {
      console.warn('API room save fallback:', err);
      if (editingRoom) {
        savedRoomObj = { ...editingRoom, ...roomForm, hotelId: targetHotel?.id, hotelName: targetHotel?.name };
        const updated = roomsList.map(r => r.id === editingRoom.id ? savedRoomObj : r);
        updateRooms(updated);
        syncHotelWithRooms(roomForm.hotelId, updated);
        showToast('Đã lưu loại phòng');
      } else {
        savedRoomObj = {
          id: `r-${Date.now()}`,
          ...roomForm,
          hotelId: targetHotel ? targetHotel.id : (Number(roomForm.hotelId) || hotels[0]?.id),
          hotelName: targetHotel?.name
        };
        const updated = [savedRoomObj, ...roomsList];
        updateRooms(updated);
        syncHotelWithRooms(roomForm.hotelId, updated);
        setRoomSearchQuery('');
        setRoomHotelFilter('ALL');
        setRoomStatusFilter('ALL');
        showToast('Đã lưu loại phòng mới');
      }
    }
    setShowRoomModal(false);
  };

  const deleteRoom = async (id) => {
    const targetRoom = roomsList.find(r => r.id === id);
    const confirmed = await showConfirm({
      title: 'Xóa loại phòng',
      message: `Bạn có chắc muốn xóa loại phòng "${targetRoom?.name || ''}" không?\nThao tác này không thể hoàn tác.`,
      type: 'warning',
      confirmText: 'Xóa loại phòng',
      cancelText: 'Hủy'
    });
    if (!confirmed) return;
    try {
      if (typeof id === 'number' || !String(id).startsWith('r-')) {
        const res = await apiFetch(`/admin/rooms/${id}`, { method: 'DELETE' });
        if (res.ok) {
          showToast('Đã xóa loại phòng khỏi máy chủ');
        }
      }
    } catch (e) {
      console.warn('Delete room error:', e);
    }
    const updated = roomsList.filter(r => r.id !== id);
    updateRooms(updated);
    if (targetRoom) {
      syncHotelWithRooms(targetRoom.hotelId, updated);
    }
    showToast('Đã xóa loại phòng khỏi hệ thống');
  };

  // ── Bookings logic (FR-15) ──
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState('ALL');
  const [bookingHotelFilter, setBookingHotelFilter] = useState('ALL');
  const [bookingPaymentFilter, setBookingPaymentFilter] = useState('ALL');
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Tải danh sách đơn đặt phòng từ Backend
  const fetchBookings = async () => {
    try {
      setIsLoadingBookings(true);
      const res = await apiFetch('/admin/bookings');
      if (res.ok) {
        const data = await res.json();
        if (data.result && Array.isArray(data.result)) {
          const mapped = data.result.map(normalizeBooking);
          setBookings(mapped);
          localStorage.setItem('traveloka_bookings', JSON.stringify(mapped));
          return;
        }
      }
    } catch (e) {
      console.warn('API /admin/bookings fallback:', e);
    } finally {
      setIsLoadingBookings(false);
    }
  };

  // Duyệt đơn đặt phòng (Sơ đồ tuần tự 3.3)
  const handleConfirmBooking = async (b) => {
    // 1. Chặn duyệt đơn quá hạn
    if (b.isExpired || (b.rawStatus || b.status || '').toUpperCase() === 'EXPIRED') {
      showAlert({
        title: 'Không thể duyệt đơn',
        message: `Đơn đặt phòng [${b.bookingCode || b.id}] đã quá ngày nhận phòng (${b.checkInDate})!\nBạn có thể nhấn nút "Xóa đơn" để dọn dẹp hệ thống.`,
        type: 'warning',
        confirmText: 'Đã hiểu'
      });
      return;
    }

    // 2. Chặn duyệt đơn nếu khách chọn chuyển khoản mà chưa thanh toán
    if (b.paymentMethod === 'vnpay' && b.paymentStatus !== 'paid') {
      showAlert({
        title: 'Chưa thanh toán VNPay',
        message: 'Khách hàng chưa thanh toán bằng phương thức chuyển khoản/VNPay!\nVui lòng đợi khách thanh toán hoàn tất trước khi duyệt.',
        type: 'warning',
        confirmText: 'Đã hiểu'
      });
      return;
    }

    const bookingId = b.raw?.id || (typeof b.id === 'number' ? b.id : null);
    try {
      showToast('Đang duyệt đơn đặt phòng...');
      if (bookingId) {
        const res = await apiFetch(`/admin/bookings/${bookingId}/confirm`, {
          method: 'PUT'
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(getFriendlyErrorMessage(data, 'Duyệt đơn đặt phòng thất bại'));
        }
      }
      showToast('Duyệt đơn đặt phòng thành công!');
      await fetchBookings();
    } catch (err) {
      console.error('Confirm booking error:', err);
      showToast(sanitizeErrorMessage(err, 'Duyệt đơn đặt phòng thất bại'));
    }
  };

  // Xóa đơn đặt phòng khỏi hệ thống
  const handleDeleteBooking = async (b) => {
    const code = b.bookingCode || b.id;
    const confirmed = await showConfirm({
      title: 'Xóa đơn đặt phòng',
      message: `Bạn có chắc chắn muốn xóa vĩnh viễn đơn đặt phòng [${code}] khỏi hệ thống không?\nThao tác này sẽ xóa dữ liệu đơn lưu trên hệ thống.`,
      type: 'warning',
      confirmText: 'Xóa vĩnh viễn',
      cancelText: 'Hủy'
    });
    if (!confirmed) {
      return;
    }
    const bookingId = b.raw?.id || (typeof b.id === 'number' ? b.id : null);
    try {
      showToast('Đang xóa đơn đặt phòng...');
      if (bookingId) {
        const res = await apiFetch(`/admin/bookings/${bookingId}`, {
          method: 'DELETE'
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(getFriendlyErrorMessage(data, 'Xóa đơn đặt phòng thất bại'));
        }
      }
      const updated = bookings.filter(item => item.id !== b.id && item.bookingCode !== code);
      updateBookings(updated);
      showToast(`Đã xóa đơn đặt phòng [${code}] thành công!`);
    } catch (err) {
      console.error('Delete booking error:', err);
      showToast(sanitizeErrorMessage(err, 'Xóa đơn đặt phòng thất bại'));
    }
  };

  // Dọn dẹp tất cả các đơn đặt phòng quá hạn
  const handleCleanupExpiredBookings = async () => {
    const expiredBookings = bookings.filter(b => b.isExpired || (b.rawStatus || b.status || '').toUpperCase() === 'EXPIRED');
    if (expiredBookings.length === 0) {
      showAlert({
        title: 'Thông báo',
        message: 'Hiện tại không có đơn đặt phòng nào bị quá hạn!',
        type: 'info',
        confirmText: 'Đã hiểu'
      });
      return;
    }
    const confirmed = await showConfirm({
      title: 'Dọn dẹp đơn quá hạn',
      message: `Tìm thấy ${expiredBookings.length} đơn đặt phòng đã quá ngày nhận phòng.\nBạn có chắc chắn muốn dọn dẹp và xóa các đơn này khỏi hệ thống không?`,
      type: 'warning',
      confirmText: 'Dọn dẹp ngay',
      cancelText: 'Hủy'
    });
    if (!confirmed) {
      return;
    }
    try {
      showToast('Đang dọn dẹp các đơn đặt phòng quá hạn...');
      const res = await apiFetch('/admin/bookings/cleanup-expired', {
        method: 'DELETE'
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(getFriendlyErrorMessage(data, 'Dọn dẹp đơn quá hạn thất bại'));
      }
      showToast(data.message || `Đã dọn dẹp thành công các đơn quá hạn!`);
      await fetchBookings();
    } catch (err) {
      console.error('Cleanup expired bookings error:', err);
      showToast(sanitizeErrorMessage(err, 'Dọn dẹp đơn quá hạn thất bại'));
    }
  };

  // Hủy đơn đặt phòng bởi Admin
  const handleCancelBooking = async (b, reason = 'Admin hủy đơn') => {
    const bookingId = b.raw?.id || b.id;
    const confirmed = await showConfirm({
      title: 'Hủy đơn đặt phòng',
      message: `Bạn có chắc chắn muốn hủy đơn đặt phòng [${b.bookingCode || bookingId}] không?`,
      type: 'warning',
      confirmText: 'Xác nhận hủy',
      cancelText: 'Đóng'
    });
    if (!confirmed) return;
    try {
      showToast('Đang xử lý hủy đơn đặt phòng...');
      const res = await apiFetch(`/admin/bookings/${bookingId}/cancel?reason=${encodeURIComponent(reason)}`, {
        method: 'PUT'
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(getFriendlyErrorMessage(data, 'Hủy đơn đặt phòng thất bại'));
      }
      showToast('Đã hủy đơn đặt phòng thành công!');
      await fetchBookings();
    } catch (err) {
      console.error('Cancel booking error:', err);
      showToast(sanitizeErrorMessage(err, 'Hủy đơn thất bại'));
    }
  };

  // Cập nhật trạng thái linh hoạt (CHECKED_IN, COMPLETED)
  const handleUpdateBookingStatus = async (b, newStatus) => {
    const bookingId = b.raw?.id || b.id;

    // Khi chuyển sang COMPLETED (Hoàn thành/Trả phòng) với đơn tiền mặt: Xác nhận đã thu tiền
    if (newStatus === 'COMPLETED' && b.paymentMethod === 'pay_at_hotel' && b.paymentStatus !== 'paid') {
      const confirmedCash = await showConfirm({
        title: 'Xác nhận thu tiền mặt',
        message: `Đơn phòng [${b.bookingCode || bookingId}] chọn thanh toán tiền mặt tại khách sạn.\n\nBạn có xác nhận đã thu đủ số tiền (${(b.totalAmount || 0).toLocaleString('vi-VN')} đ) từ khách trước khi hoàn tất trả phòng không?`,
        type: 'info',
        confirmText: 'Đã thu tiền đủ',
        cancelText: 'Chưa thu'
      });
      if (!confirmedCash) return;
    }

    try {
      showToast('Đang cập nhật trạng thái đơn...');
      const res = await apiFetch(`/admin/bookings/${bookingId}/status?status=${newStatus}`, {
        method: 'PUT'
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(getFriendlyErrorMessage(data, 'Cập nhật trạng thái thất bại'));
      }
      showToast(newStatus === 'COMPLETED' ? 'Đã hoàn tất đơn! Đơn đã chuyển sang mục Hoàn thành.' : 'Cập nhật trạng thái đơn thành công!');
      await fetchBookings();
    } catch (err) {
      console.error('Update status error:', err);
      // Fallback cục bộ cập nhật đồng bộ trạng thái thanh toán tiền mặt nếu hoàn thành
      const updated = bookings.map(item => {
        if (item.id === b.id || (bookingId && item.raw?.id === bookingId)) {
          return {
            ...item,
            status: newStatus.toLowerCase(),
            rawStatus: newStatus,
            paymentStatus: (newStatus === 'COMPLETED' && item.paymentMethod === 'pay_at_hotel') ? 'paid' : item.paymentStatus
          };
        }
        return item;
      });
      updateBookings(updated);
      showToast(newStatus === 'COMPLETED' ? 'Đã hoàn tất đơn! Đơn đã chuyển sang mục Hoàn thành.' : sanitizeErrorMessage(err, 'Đã cập nhật trạng thái đơn!'));
    }
  };

  const toggleBookingStatus = (id, status) => {
    const target = bookings.find(b => b.id === id);
    if (status === 'confirmed') {
      handleConfirmBooking(target || { id });
    } else if (status === 'cancelled') {
      handleCancelBooking(target || { id });
    } else {
      updateBookings(bookings.map(b => b.id === id ? { ...b, status } : b));
    }
  };

  const markAsPaid = async (id) => {
    const target = bookings.find(b => b.id === id);
    const bookingId = target?.raw?.id || (typeof id === 'number' ? id : null);
    try {
      showToast('Đang ghi nhận thu tiền mặt...');
      if (bookingId) {
        const res = await apiFetch(`/admin/bookings/${bookingId}/pay-cash`, { method: 'PUT' });
        if (res.ok) {
          showToast('Đã xác nhận thu tiền mặt thành công!');
          await fetchBookings();
          return;
        }
      }
    } catch (e) {
      console.warn('pay-cash API fallback:', e);
    }
    const next = bookings.map(b => b.id === id ? { ...b, paymentStatus: 'paid', paidAt: new Date().toLocaleString('vi-VN') } : b);
    updateBookings(next);
    showToast('Đã xác nhận thu tiền mặt cho đơn!');
  };

  // ── Flexible Check-in Modal state & handlers ──
  const [checkinModalBooking, setCheckinModalBooking] = useState(null);
  const [actualCheckInDate, setActualCheckInDate] = useState('');
  const [isSubmittingCheckin, setIsSubmittingCheckin] = useState(false);

  const openCheckinModal = (b) => {
    setCheckinModalBooking(b);
    const todayStr = new Date().toISOString().split('T')[0];
    const defaultDate = (b.checkInDate && /^\d{4}-\d{2}-\d{2}$/.test(b.checkInDate))
      ? b.checkInDate
      : todayStr;
    setActualCheckInDate(defaultDate);
  };

  const handleConfirmCheckin = async () => {
    if (!checkinModalBooking || !actualCheckInDate) return;
    const b = checkinModalBooking;
    const bookingId = b.raw?.id || (typeof b.id === 'number' ? b.id : null);

    if (b.checkOutDate && /^\d{4}-\d{2}-\d{2}$/.test(b.checkOutDate) && actualCheckInDate > b.checkOutDate) {
      showAlert({
        title: 'Ngày không hợp lệ',
        message: `Ngày nhận phòng thực tế (${actualCheckInDate}) không thể sau ngày trả phòng (${b.checkOutDate})!`,
        type: 'error'
      });
      return;
    }

    try {
      setIsSubmittingCheckin(true);
      showToast('Đang xử lý nhận phòng và cập nhật lịch lưu trú...');
      if (bookingId) {
        const res = await apiFetch(`/admin/bookings/${bookingId}/checkin?actualCheckInDate=${actualCheckInDate}`, {
          method: 'PUT'
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(getFriendlyErrorMessage(data, 'Nhận phòng thất bại'));
        }
      }
      showToast('Đã hoàn tất nhận phòng và cập nhật lịch lưu trú thành công!');
      setCheckinModalBooking(null);
      await fetchBookings();
    } catch (err) {
      console.error('Checkin error:', err);
      // Fallback tính toán cục bộ
      let nights = 1;
      if (b.checkOutDate && /^\d{4}-\d{2}-\d{2}$/.test(b.checkOutDate)) {
        nights = Math.max(1, Math.round((new Date(b.checkOutDate) - new Date(actualCheckInDate)) / (1000 * 60 * 60 * 24)));
      }
      const pricePerNight = Math.round((b.totalAmount || 0) / (b.nights || 1));
      const newTotal = pricePerNight * nights;

      const updated = bookings.map(item => {
        if (item.id === b.id || (bookingId && item.raw?.id === bookingId)) {
          return {
            ...item,
            status: 'checked_in',
            rawStatus: 'CHECKED_IN',
            checkInDate: actualCheckInDate,
            nights,
            totalAmount: newTotal
          };
        }
        return item;
      });
      updateBookings(updated);
      setCheckinModalBooking(null);
      showToast(sanitizeErrorMessage(err, 'Đã hoàn tất nhận phòng và cập nhật lịch lưu trú!'));
    } finally {
      setIsSubmittingCheckin(false);
    }
  };

  // ── Flexible Checkout Modal state & handlers ──
  const [checkoutModalBooking, setCheckoutModalBooking] = useState(null);
  const [actualCheckOutDate, setActualCheckOutDate] = useState('');
  const [isSubmittingCheckout, setIsSubmittingCheckout] = useState(false);

  const openCheckoutModal = (b) => {
    setCheckoutModalBooking(b);
    const todayStr = new Date().toISOString().split('T')[0];
    const defaultDate = (b.checkOutDate && /^\d{4}-\d{2}-\d{2}$/.test(b.checkOutDate) && b.checkOutDate >= todayStr)
      ? b.checkOutDate
      : todayStr;
    setActualCheckOutDate(defaultDate);
  };

  const handleConfirmCheckout = async () => {
    if (!checkoutModalBooking || !actualCheckOutDate) return;
    const b = checkoutModalBooking;
    const bookingId = b.raw?.id || (typeof b.id === 'number' ? b.id : null);

    if (b.checkInDate && /^\d{4}-\d{2}-\d{2}$/.test(b.checkInDate) && actualCheckOutDate < b.checkInDate) {
      showAlert({
        title: 'Ngày không hợp lệ',
        message: `Ngày trả phòng thực tế (${actualCheckOutDate}) không thể trước ngày nhận phòng (${b.checkInDate})!`,
        type: 'error'
      });
      return;
    }

    try {
      setIsSubmittingCheckout(true);
      showToast('Đang xử lý trả phòng và quyết toán hóa đơn...');
      if (bookingId) {
        const res = await apiFetch(`/admin/bookings/${bookingId}/checkout?actualCheckOutDate=${actualCheckOutDate}`, {
          method: 'PUT'
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(getFriendlyErrorMessage(data, 'Trả phòng thất bại'));
        }
      }
      showToast('Đã hoàn tất trả phòng và quyết toán hóa đơn! Đơn đã được chuyển qua mục Hoàn thành.');
      setCheckoutModalBooking(null);
      await fetchBookings();
    } catch (err) {
      console.error('Checkout error:', err);
      // Fallback tính toán cục bộ
      let nights = 1;
      if (b.checkInDate && /^\d{4}-\d{2}-\d{2}$/.test(b.checkInDate)) {
        nights = Math.max(1, Math.round((new Date(actualCheckOutDate) - new Date(b.checkInDate)) / (1000 * 60 * 60 * 24)));
      }
      const pricePerNight = Math.round((b.totalAmount || 0) / (b.nights || 1));
      const newTotal = pricePerNight * nights;

      const updated = bookings.map(item => {
        if (item.id === b.id || (bookingId && item.raw?.id === bookingId)) {
          return {
            ...item,
            status: 'completed',
            rawStatus: 'COMPLETED',
            checkOutDate: actualCheckOutDate,
            nights,
            totalAmount: newTotal,
            paymentStatus: item.paymentMethod === 'pay_at_hotel' ? 'paid' : item.paymentStatus,
            isOverdueCheckout: false
          };
        }
        return item;
      });
      updateBookings(updated);
      setCheckoutModalBooking(null);
      showToast('Đã hoàn tất trả phòng và quyết toán hóa đơn! Đơn đã được chuyển qua mục Hoàn thành.');
    } finally {
      setIsSubmittingCheckout(false);
    }
  };

  // Danh sách tên khách sạn duy nhất để đưa vào Dropdown lọc Khách sạn
  const uniqueHotels = useMemo(() => {
    const set = new Set();
    hotels.forEach(h => { if (h.name) set.add(h.name); });
    bookings.forEach(b => { if (b.hotelName) set.add(b.hotelName); });
    return Array.from(set).sort();
  }, [hotels, bookings]);

  // Số lượng đơn đang xử lý (không tính đơn đã hoàn thành) và đơn hoàn thành
  const activeBookingsCount = useMemo(() => {
    return bookings.filter(b => (b.rawStatus || b.status || '').toUpperCase() !== 'COMPLETED').length;
  }, [bookings]);

  const completedBookingsCount = useMemo(() => {
    return bookings.filter(b => (b.rawStatus || b.status || '').toUpperCase() === 'COMPLETED').length;
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      const rawS = (b.rawStatus || b.status || '').toUpperCase();

      // 1. Lọc theo Trạng thái (Dropdown hoặc Tab)
      // Khi chọn "Tất cả đơn" (ALL): Đơn đã hoàn thành (COMPLETED) tự động chuyển qua mục "Hoàn thành" và biến mất khỏi danh mục "Tất cả đơn"
      if (bookingStatusFilter === 'ALL') {
        if (rawS === 'COMPLETED') return false;
      } else if (bookingStatusFilter === 'EXPIRED') {
        if (!b.isExpired && rawS !== 'EXPIRED') return false;
      } else {
        if (rawS !== bookingStatusFilter) return false;
      }

      // 2. Lọc theo Khách sạn
      if (bookingHotelFilter !== 'ALL') {
        const hName = (b.hotelName || '').toLowerCase().trim();
        if (!hName.includes(bookingHotelFilter.toLowerCase().trim())) return false;
      }

      // 3. Lọc theo Thanh toán
      if (bookingPaymentFilter !== 'ALL') {
        if (bookingPaymentFilter === 'paid') {
          if (b.paymentStatus !== 'paid') return false;
        } else if (bookingPaymentFilter === 'pending') {
          if (b.paymentStatus === 'paid') return false;
        } else if (bookingPaymentFilter === 'pay_at_hotel') {
          if (b.paymentMethod !== 'pay_at_hotel' && b.paymentMethod !== 'cash') return false;
        } else if (bookingPaymentFilter === 'vnpay') {
          if (b.paymentMethod !== 'vnpay') return false;
        }
      }

      // 4. Lọc theo Ô tìm kiếm
      if (!bookingSearch.trim()) return true;
      const q = bookingSearch.toLowerCase();
      return (
        String(b.id)?.toLowerCase().includes(q) ||
        b.bookingCode?.toLowerCase().includes(q) ||
        b.contactName?.toLowerCase().includes(q) ||
        b.guestName?.toLowerCase().includes(q) ||
        b.contactPhone?.toLowerCase().includes(q) ||
        b.contactEmail?.toLowerCase().includes(q) ||
        b.hotelName?.toLowerCase().includes(q) ||
        b.roomName?.toLowerCase().includes(q)
      );
    });
  }, [bookings, bookingSearch, bookingStatusFilter, bookingHotelFilter, bookingPaymentFilter]);

  // ── Coupons state ──
  const [coupons] = useState(COUPONS_DATA);

  // ── KPI stats ──
  const stats = useMemo(() => {
    const totalRooms = roomsList.length > 0 ? roomsList.length : hotels.reduce((s, h) => s + (h.rooms?.length || 1), 0);
    const occupiedRooms = bookings.filter(b => b.status === 'confirmed').length;
    const confirmed = bookings.filter(b => b.status === 'confirmed').length;
    const pending = bookings.filter(b => !b.status || b.status === 'pending').length;
    const revenue = bookings.filter(b => b.status === 'confirmed').reduce((s, b) => s + (b.totalAmount || 0), 0);
    const today = new Date().toLocaleDateString('vi-VN');
    const checkins = bookings.filter(b => b.checkInDate === today).length;
    const checkouts = bookings.filter(b => b.checkOutDate === today).length;
    const customers = new Set(bookings.map(b => b.contactPhone).filter(Boolean)).size;
    const avgRating = hotels.reduce((s, h) => s + (h.ratingScore || 9), 0) / (hotels.length || 1);
    const reviewsAll = hotels.flatMap(h => h.reviews || []);
    return { totalRooms, occupiedRooms, confirmed, pending, revenue, checkins, checkouts, customers, totalBookings: bookings.length, allRooms: roomsList, avgRating: avgRating.toFixed(1), reviewsAll };
  }, [hotels, bookings, roomsList]);

  const allReviews = useMemo(() => hotels.flatMap(h => (h.reviews || []).map(r => ({ ...r, hotelName: h.name, hotelId: h.id }))), [hotels]);

  const paymentStats = useMemo(() => {
    const vnpay = bookings.filter(b => b.paymentMethod === 'vnpay').length;
    const cash = bookings.filter(b => b.paymentMethod === 'pay_at_hotel').length;
    const other = bookings.length - vnpay - cash;
    const paidRevenue = bookings.filter(b => b.status === 'confirmed' && (b.paymentMethod !== 'pay_at_hotel' || b.paymentStatus === 'paid')).reduce((s, b) => s + (b.totalAmount || 0), 0);
    const pendingRevenue = bookings.filter(b => b.status === 'confirmed' && b.paymentMethod === 'pay_at_hotel' && b.paymentStatus !== 'paid').reduce((s, b) => s + (b.totalAmount || 0), 0);
    return { vnpay, cash, other, paidRevenue, pendingRevenue };
  }, [bookings]);

  const customerList = useMemo(() => {
    const map = {};
    bookings.forEach(b => {
      const key = b.contactPhone || b.contactEmail || b.guestName;
      if (!key) return;
      if (!map[key]) map[key] = { name: b.contactName || b.guestName, phone: b.contactPhone, email: b.contactEmail, isGuest: b.isGuest, bookings: [], totalSpent: 0 };
      map[key].bookings.push(b);
      if (b.status === 'confirmed') map[key].totalSpent += (b.totalAmount || 0);
    });
    return Object.values(map).sort((a, b) => b.totalSpent - a.totalSpent);
  }, [bookings]);

  // Màn hình bảo vệ
  if (!isAdmin) {
    return (
      <div className="bg-light min-vh-100 py-5 page-top-spacing d-flex align-items-center">
        <div className="container"><div className="row justify-content-center"><div className="col-lg-6 col-md-8 text-center">
          <div className="card border-0 shadow-sm rounded-4 p-5 bg-white">
            <div className="d-inline-flex p-3 bg-danger-subtle text-danger rounded-circle mb-3 mx-auto"><ShieldAlert size={48} /></div>
            <h3 className="fw-bold text-dark mb-2">Khu Vực Quản Trị Viên</h3>
            <p className="text-secondary mb-4">Bạn cần đăng nhập bằng tài khoản có quyền Quản trị viên để truy cập vào hệ thống này.</p>
            <div className="d-flex flex-column gap-2">
              <Link to="/login" state={{ from: '/admin' }} className="btn btn-primary btn-lg fw-bold rounded-pill shadow-sm">
                Đăng nhập tài khoản Quản trị viên
              </Link>
              <Link to="/" className="btn btn-light rounded-pill py-2 text-secondary">Quay lại trang chủ</Link>
            </div>
          </div>
        </div></div></div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>

      {/* TOAST THÔNG BÁO NỔI */}
      {toastMsg && (
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 1000, background: '#10b981', color: '#fff', padding: '12px 20px', borderRadius: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
          <CheckCircle2 size={18} /> {toastMsg}
        </div>
      )}

      {/* SIDEBAR */}
      <aside style={{ width: sidebarOpen ? 240 : 0, minWidth: sidebarOpen ? 240 : 0, background: '#1e293b', display: 'flex', flexDirection: 'column', transition: 'all 0.25s ease', overflow: 'hidden', flexShrink: 0, zIndex: 100 }}>
        <div style={{ padding: '20px 20px 12px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, background: '#f59e0b', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Building size={20} color="#fff" /></div>
            <div><div style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>Traveloka</div><div style={{ color: '#94a3b8', fontSize: 11 }}>Quản Trị Khách Sạn</div></div>
          </div>
        </div>

        {/* Thông tin Admin + Avatar từ Cloudinary */}
        <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: 10 }}>
          {user?.avatarUrl || user?.avatar ? (
            <img src={user.avatarUrl || user.avatar} alt={user.name} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '2px solid #3b82f6', flexShrink: 0 }} />
          ) : (
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
              {(user?.name || 'A').charAt(0).toUpperCase()}
            </div>
          )}
          <div style={{ overflow: 'hidden' }}>
            <div style={{ color: '#f1f5f9', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name || 'Quản trị viên'}</div>
            <div style={{ color: '#f59e0b', fontSize: 11, fontWeight: 700 }}>👑 Quản Trị Viên</div>
          </div>
        </div>

        <nav style={{ flex: 1, overflowY: 'auto', padding: '10px 0' }}>
          {SIDEBAR_MENU.map(group => (
            <div key={group.group} style={{ marginBottom: 6 }}>
              <div style={{ padding: '8px 20px 4px', color: '#475569', fontSize: 10, fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase' }}>{group.group}</div>
              {group.items.map(item => (
                <button key={item.key} onClick={() => setActiveTab(item.key)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 20px', background: activeTab === item.key ? 'rgba(245,158,11,0.18)' : 'transparent', border: 'none', cursor: 'pointer', color: activeTab === item.key ? '#f59e0b' : '#94a3b8', fontWeight: activeTab === item.key ? 700 : 400, fontSize: 13.5, textAlign: 'left', borderLeft: activeTab === item.key ? '3px solid #f59e0b' : '3px solid transparent', transition: 'all 0.15s' }}>
                  <span style={{ opacity: activeTab === item.key ? 1 : 0.7 }}>{item.icon}</span>{item.label}
                </button>
              ))}
            </div>
          ))}
        </nav>
        <div style={{ padding: '12px 0', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 20px', color: '#94a3b8', textDecoration: 'none', fontSize: 13.5 }}><ExternalLink size={17} style={{ opacity: 0.7 }} /> Quay Lại Trang Web</Link>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#f8fafc' }}>
        {/* Header */}
        <header style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex' }}><Menu size={22} /></button>
            <span style={{ color: '#1e293b', fontWeight: 700, fontSize: 16 }}>
              {{ dashboard: 'Tổng Quan', hotels: 'Quản Lý Khách Sạn (FR-13)', rooms: 'Quản Lý Loại Phòng (FR-14)', amenities: 'Tiện Nghi Khách Sạn', bookings: 'Quản Lý Đặt Phòng & Lễ Tân', customers: 'Quản Lý Khách Hàng', users: 'Quản Lý Người Dùng', payments: 'Quản Lý Thanh Toán', coupons: 'Quản Lý Khuyến Mãi', reviews: 'Đánh Giá Từ Khách Lưu Trú', reports: 'Báo Cáo & Thống Kê' }[activeTab]}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {/* Link sang Profile cá nhân */}
            <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', background: '#f1f5f9', padding: '6px 14px', borderRadius: 20 }}>
              {user?.avatarUrl || user?.avatar ? (
                <img src={user.avatarUrl || user.avatar} alt="avatar" style={{ width: 26, height: 26, borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#3b82f6', color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {(user?.name || 'A').charAt(0).toUpperCase()}
                </div>
              )}
              <span style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>Hồ Sơ Của Tôi</span>
            </Link>

            <button onClick={() => { logout(); navigate('/'); }} style={{ display: 'flex', alignItems: 'center', gap: 7, background: '#fee2e2', border: 'none', borderRadius: 20, padding: '7px 16px', color: '#dc2626', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
              <LogOut size={15} /> Đăng Xuất
            </button>
          </div>
        </header>

        {/* Content area */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>

          {/* ══ TAB: TỔNG QUAN ══ */}
          {activeTab === 'dashboard' && (
            <div>
              {/* KPI hàng 1 */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 16 }}>
                <KpiCard icon={<BedDouble size={26} color="#6366f1" />} iconBg="#eef2ff" value={stats.totalRooms} label="Tổng Số Loại Phòng" sub={<span style={{ color: '#22c55e', fontWeight: 600, fontSize: 13 }}>{Math.max(0, stats.totalRooms - stats.occupiedRooms)} phòng sẵn sàng</span>} />
                <KpiCard icon={<BedSingle size={26} color="#f59e0b" />} iconBg="#fffbeb" value={stats.occupiedRooms} label="Phòng Đang Có Khách" sub={<span style={{ color: '#f59e0b', fontWeight: 600, fontSize: 13 }}>Đang lưu trú</span>} />
                <KpiCard icon={<BookOpen size={26} color="#3b82f6" />} iconBg="#eff6ff" value={stats.totalBookings} label="Tổng Đơn Đặt Phòng" sub={<span style={{ color: '#f59e0b', fontWeight: 600, fontSize: 13 }}>{stats.pending} đang chờ xử lý</span>} />
                <KpiCard icon={<CheckCircle2 size={26} color="#22c55e" />} iconBg="#f0fdf4" value={stats.confirmed} label="Đơn Đã Xác Nhận" sub={<span style={{ color: '#6b7280', fontSize: 13 }}>Hoàn tất đặt phòng</span>} />
              </div>
              {/* KPI hàng 2 */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
                <KpiCard icon={<LogIn size={26} color="#8b5cf6" />} iconBg="#f5f3ff" value={stats.checkins} label="Nhận Phòng Hôm Nay" sub={<span style={{ color: '#6b7280', fontSize: 13 }}>Khách Check-in</span>} />
                <KpiCard icon={<LogOutIcon size={26} color="#ec4899" />} iconBg="#fdf2f8" value={stats.checkouts} label="Trả Phòng Hôm Nay" sub={<span style={{ color: '#6b7280', fontSize: 13 }}>Khách Check-out</span>} />
                <KpiCard icon={<Users size={26} color="#06b6d4" />} iconBg="#ecfeff" value={stats.customers} label="Tổng Khách Hàng" sub={<span style={{ color: '#6b7280', fontSize: 13 }}>Đã đặt phòng</span>} />
                <KpiCard icon={<DollarSign size={26} color="#fff" />} iconBg="#f59e0b" iconBgFull value={stats.revenue.toLocaleString('vi-VN') + ' đ'} label="Tổng Doanh Thu" sub={<span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>Từ đơn đã xác nhận</span>} dark />
              </div>
              {/* Biểu đồ */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                <ChartCard title="Doanh Thu – 7 Ngày Gần Nhất" sub="Tổng tiền đặt phòng theo ngày">
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={last7Days} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                      <defs><linearGradient id="gDT" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} /><stop offset="95%" stopColor="#3b82f6" stopOpacity={0} /></linearGradient></defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="ngay" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => (v / 1000000).toFixed(1) + 'tr'} />
                      <Tooltip formatter={v => [v.toLocaleString('vi-VN') + ' đ', 'Doanh thu']} contentStyle={{ borderRadius: 10, fontSize: 13 }} />
                      <Area type="monotone" dataKey="doanhThu" stroke="#3b82f6" strokeWidth={2.5} fill="url(#gDT)" dot={{ r: 3, fill: '#3b82f6' }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartCard>
                <ChartCard title="Đặt Phòng – 7 Ngày Gần Nhất" sub="Số lượng đơn đặt phòng từng ngày">
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={last7Days} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="ngay" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip formatter={v => [v + ' đơn', 'Đặt phòng']} contentStyle={{ borderRadius: 10, fontSize: 13 }} />
                      <Bar dataKey="daDat" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>
              </div>
              {/* Đơn mới nhất */}
              <SectionCard title="Đơn Đặt Phòng Mới Nhất" action={<button onClick={() => setActiveTab('bookings')} style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Xem tất cả →</button>}>
                {bookings.length === 0 ? <Empty text="Chưa có đơn đặt phòng nào" /> : (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0" style={{ fontSize: 13 }}>
                      <thead style={{ background: '#f8fafc' }}><tr>{['Mã Đơn', 'Khách Hàng', 'Khách Sạn', 'Ngày Lưu Trú', 'Tổng Tiền', 'Trạng Thái'].map(h => <Th key={h}>{h}</Th>)}</tr></thead>
                      <tbody>{bookings.slice(0, 5).map(b => (
                        <tr key={b.id}>
                          <td className="fw-bold text-primary font-monospace" style={{ fontSize: 12 }}>{b.id}</td>
                          <td><div style={{ fontWeight: 600, color: '#1e293b' }}>{b.contactName || b.guestName}</div><div style={{ fontSize: 11, color: '#94a3b8' }}>{b.contactPhone}</div></td>
                          <td style={{ color: '#374151', fontWeight: 500 }}>{b.hotelName}</td>
                          <td style={{ color: '#64748b', fontSize: 12 }}>{b.checkInDate} → {b.checkOutDate}</td>
                          <td style={{ fontWeight: 700, color: '#dc2626' }}>{b.totalAmount?.toLocaleString('vi-VN')} đ</td>
                          <td><StatusBadge status={b.status} /></td>
                        </tr>
                      ))}</tbody>
                    </table>
                  </div>
                )}
              </SectionCard>
            </div>
          )}

          {/* ══ TAB: KHÁCH SẠN (FR-13) ══ */}
          {activeTab === 'hotels' && (
            <SectionCard title={`Danh Sách Khách Sạn & Khu Nghỉ Dưỡng (${hotels.length} cơ sở)`} sub="Thêm mới, cập nhật hoặc xóa khách sạn khỏi hệ thống"
              action={<ActionBtn onClick={openAddHotel} icon={<Plus size={16} />}>Thêm Khách Sạn Mới</ActionBtn>}>
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0" style={{ fontSize: 13 }}>
                  <thead style={{ background: '#f8fafc' }}><tr>{['Hình Ảnh', 'Tên Khách Sạn', 'Thành Phố', 'Hạng Sao', 'Điểm Đánh Giá', 'Giá Khởi Điểm', 'Số Phòng', 'Thao Tác'].map(h => <Th key={h}>{h}</Th>)}</tr></thead>
                  <tbody>{hotels.map(h => (
                    <tr key={h.id}>
                      <td><img src={h.thumbnailUrl} alt={h.name} style={{ width: 64, height: 48, borderRadius: 8, objectFit: 'cover' }} /></td>
                      <td><div style={{ fontWeight: 600, color: '#1e293b' }}>{h.name}</div><div style={{ fontSize: 11, color: '#94a3b8' }}>{h.address}</div></td>
                      <td><span style={{ background: '#f1f5f9', color: '#475569', padding: '3px 10px', borderRadius: 8, fontSize: 12 }}>{h.city}</span></td>
                      <td style={{ color: '#f59e0b', fontWeight: 700 }}>{'★'.repeat(h.starRating || 5)} {h.starRating} sao</td>
                      <td><span style={{ background: '#dcfce7', color: '#16a34a', padding: '3px 10px', borderRadius: 8, fontSize: 12, fontWeight: 700 }}>{h.ratingScore || 9.0}/10</span></td>
                      <td style={{ fontWeight: 700, color: '#dc2626' }}>{(h.minPrice || h.rooms?.[0]?.pricePerNight || h.pricePerNight || 0).toLocaleString('vi-VN')} đ</td>
                      <td>{h.totalRooms ?? h.rooms?.length ?? 1} phòng</td>
                      <td><div style={{ display: 'flex', gap: 8 }}>
                        <SmBtn color="blue" onClick={() => openEditHotel(h)} icon={<Edit2 size={12} />}>Sửa</SmBtn>
                        <SmBtn color="red" onClick={() => deleteHotel(h.id)} icon={<Trash2 size={12} />}>Xóa</SmBtn>
                      </div></td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </SectionCard>
          )}

          {/* ══ TAB: LOẠI PHÒNG (FR-14 - QUẢN LÝ KHO PHÒNG CHUYÊN SÂU) ══ */}
          {activeTab === 'rooms' && (
            <div>
              {/* 4 THẺ KPI TRẠNG THÁI KHO PHÒNG */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 20 }}>
                <KpiCard
                  icon={<BedDouble size={26} color="#6366f1" />}
                  iconBg="#eef2ff"
                  value={roomStats.total}
                  label="Tổng Số Loại Phòng"
                  sub={<span style={{ color: '#6366f1', fontWeight: 600, fontSize: 13 }}>Đang quản lý trong hệ thống</span>}
                />
                <KpiCard
                  icon={<CheckCircle2 size={26} color="#22c55e" />}
                  iconBg="#f0fdf4"
                  value={roomStats.available}
                  label="Phòng Sẵn Sàng"
                  sub={<span style={{ color: '#22c55e', fontWeight: 600, fontSize: 13 }}>AVAILABLE • Sẵn sàng đón khách</span>}
                />
                <KpiCard
                  icon={<Clock size={26} color="#f59e0b" />}
                  iconBg="#fffbeb"
                  value={roomStats.booked}
                  label="Phòng Đang Có Khách"
                  sub={<span style={{ color: '#f59e0b', fontWeight: 600, fontSize: 13 }}>BOOKED • Đang có khách lưu trú</span>}
                />
                <KpiCard
                  icon={<AlertCircle size={26} color="#dc2626" />}
                  iconBg="#fef2f2"
                  value={roomStats.maintenance}
                  label="Phòng Đang Bảo Trì"
                  sub={<span style={{ color: '#dc2626', fontWeight: 600, fontSize: 13 }}>MAINTENANCE • Đang sửa chữa</span>}
                />
              </div>

              {/* THANH TÌM KIẾM & BỘ LỌC ĐA TIÊU CHÍ */}
              <div style={{
                background: '#fff',
                borderRadius: 14,
                padding: '16px 20px',
                marginBottom: 20,
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                border: '1px solid #e2e8f0',
                display: 'flex',
                flexWrap: 'wrap',
                gap: 14,
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', flex: 1 }}>
                  {/* Ô tìm kiếm */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    borderRadius: 10,
                    padding: '8px 14px',
                    minWidth: 260,
                    flex: 1
                  }}>
                    <Search size={16} color="#64748b" />
                    <input
                      type="text"
                      placeholder="Tìm theo tên phòng, loại giường, khách sạn..."
                      value={roomSearchQuery}
                      onChange={e => setRoomSearchQuery(e.target.value)}
                      style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: 13, color: '#1e293b' }}
                    />
                    {roomSearchQuery && (
                      <button onClick={() => setRoomSearchQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0, display: 'flex' }}>
                        <X size={15} />
                      </button>
                    )}
                  </div>

                  {/* Lọc theo khách sạn */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Building size={16} color="#64748b" />
                    <select
                      value={roomHotelFilter}
                      onChange={e => setRoomHotelFilter(e.target.value)}
                      className="form-select form-select-sm"
                      style={{ fontSize: 13, minWidth: 200, borderRadius: 8, borderColor: '#cbd5e1' }}
                    >
                      <option value="ALL">Tất cả khách sạn ({hotels.length})</option>
                      {hotels.map(h => (
                        <option key={h.id} value={h.id}>{h.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Lọc theo trạng thái */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Filter size={16} color="#64748b" />
                    <select
                      value={roomStatusFilter}
                      onChange={e => setRoomStatusFilter(e.target.value)}
                      className="form-select form-select-sm"
                      style={{ fontSize: 13, minWidth: 160, borderRadius: 8, borderColor: '#cbd5e1' }}
                    >
                      <option value="ALL">Tất cả trạng thái</option>
                      <option value="AVAILABLE">✓ Sẵn Sàng (Available)</option>
                      <option value="BOOKED">⏳ Có Khách (Booked)</option>
                      <option value="MAINTENANCE">🛠️ Bảo Trì (Maintenance)</option>
                    </select>
                  </div>

                  {/* Nút reset nếu đang có lọc */}
                  {(roomSearchQuery || roomHotelFilter !== 'ALL' || roomStatusFilter !== 'ALL') && (
                    <button
                      onClick={() => {
                        setRoomSearchQuery('');
                        setRoomHotelFilter('ALL');
                        setRoomStatusFilter('ALL');
                      }}
                      className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
                      style={{ borderRadius: 8, fontSize: 12.5 }}
                    >
                      <RotateCcw size={13} />
                      <span>Xóa bộ lọc</span>
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 12.5, color: '#64748b', fontWeight: 600 }}>
                    Hiển thị <span className="text-primary">{filteredRoomsList.length}</span> / {roomsList.length} loại phòng
                  </span>
                  <ActionBtn onClick={openAddRoom} icon={<Plus size={16} />}>Thêm Loại Phòng Mới</ActionBtn>
                </div>
              </div>

              {/* BẢNG DỮ LIỆU PHÒNG */}
              <SectionCard
                title="Danh Sách Loại Phòng Lưu Trú"
                sub="Quản lý chi tiết từng loại phòng, cập nhật đơn giá, tải ảnh Cloudinary và đổi trạng thái phòng nhanh"
              >
                {filteredRoomsList.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                    <Empty
                      text={
                        roomSearchQuery || roomHotelFilter !== 'ALL' || roomStatusFilter !== 'ALL'
                          ? 'Không tìm thấy loại phòng nào phù hợp với bộ lọc hiện tại'
                          : 'Chưa có loại phòng nào trong hệ thống'
                      }
                    />
                    {(roomSearchQuery || roomHotelFilter !== 'ALL' || roomStatusFilter !== 'ALL') ? (
                      <button
                        onClick={() => { setRoomSearchQuery(''); setRoomHotelFilter('ALL'); setRoomStatusFilter('ALL'); }}
                        className="btn btn-outline-primary btn-sm mt-3"
                      >
                        Đặt lại bộ lọc tìm kiếm
                      </button>
                    ) : (
                      <button onClick={openAddRoom} className="btn btn-primary btn-sm mt-3">
                        + Tạo loại phòng đầu tiên
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0" style={{ fontSize: 13 }}>
                      <thead style={{ background: '#f8fafc' }}>
                        <tr>
                          {['Hình Ảnh', 'Tên Loại Phòng', 'Khách Sạn', 'Loại Giường & DT', 'Sức Chứa', 'Giá / Đêm', 'Trạng Thái (Đổi Nhanh)', 'Thao Tác'].map(h => (
                            <Th key={h}>{h}</Th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRoomsList.map(r => (
                          <tr key={r.id}>
                            <td>
                              <img
                                src={r.imageUrl || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&auto=format&fit=crop&q=60'}
                                alt={r.name}
                                style={{ width: 72, height: 48, borderRadius: 8, objectFit: 'cover', border: '1px solid #e2e8f0' }}
                                onError={(e) => {
                                  e.target.src = 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&auto=format&fit=crop&q=60';
                                }}
                              />
                            </td>
                            <td>
                              <div style={{ fontWeight: 700, color: '#1e293b', maxWidth: 220 }}>{r.name}</div>
                              {r.description && (
                                <div style={{ fontSize: 11, color: '#94a3b8', maxWidth: 220 }} className="text-truncate" title={r.description}>
                                  {r.description}
                                </div>
                              )}
                            </td>
                            <td>
                              <span style={{ background: '#eff6ff', color: '#2563eb', padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600 }}>
                                {r.hotelName || 'Khách sạn'}
                              </span>
                            </td>
                            <td>
                              <div style={{ fontSize: 12.5, fontWeight: 500, color: '#334155' }}>{r.bedType || 'Giường đôi'}</div>
                              <span style={{ fontSize: 11, color: '#64748b' }}>📐 {r.roomSize || '35 m²'}</span>
                            </td>
                            <td>
                              <span style={{ background: '#f1f5f9', color: '#475569', padding: '3px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600 }}>
                                👥 {r.maxGuests || 2} khách
                              </span>
                            </td>
                            <td style={{ fontWeight: 800, color: '#dc2626', fontSize: 14 }}>
                              {Number(r.pricePerNight || 0).toLocaleString('vi-VN')} đ
                              <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 400, display: 'block' }}>/ đêm</span>
                            </td>
                            <td>
                              {/* Dropdown Đổi Trạng Thái Nhanh */}
                              <select
                                value={r.status || 'AVAILABLE'}
                                onChange={(e) => handleQuickChangeRoomStatus(r.id, e.target.value)}
                                style={{
                                  fontSize: 12,
                                  fontWeight: 700,
                                  padding: '5px 8px',
                                  borderRadius: 8,
                                  cursor: 'pointer',
                                  border: '1px solid ' + (r.status === 'AVAILABLE' ? '#86efac' : r.status === 'BOOKED' ? '#fde047' : '#fca5a5'),
                                  background: r.status === 'AVAILABLE' ? '#dcfce7' : r.status === 'BOOKED' ? '#fef9c3' : '#fee2e2',
                                  color: r.status === 'AVAILABLE' ? '#16a34a' : r.status === 'BOOKED' ? '#92400e' : '#dc2626',
                                  outline: 'none'
                                }}
                                title="Click để chuyển nhanh trạng thái phòng"
                              >
                                <option value="AVAILABLE" style={{ background: '#fff', color: '#16a34a' }}>✓ Sẵn Sàng</option>
                                <option value="BOOKED" style={{ background: '#fff', color: '#92400e' }}>⏳ Có Khách</option>
                                <option value="MAINTENANCE" style={{ background: '#fff', color: '#dc2626' }}>🛠️ Bảo Trì</option>
                              </select>
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: 6 }}>
                                <SmBtn color="blue" onClick={() => openEditRoom(r)} icon={<Edit2 size={12} />}>Sửa</SmBtn>
                                <SmBtn color="red" onClick={() => deleteRoom(r.id)} icon={<Trash2 size={12} />}>Xóa</SmBtn>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </SectionCard>
            </div>
          )}

          {/* ══ TAB: TIỆN NGHI ══ */}
          {activeTab === 'amenities' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 20 }}>
                {[{ label: 'Tổng Tiện Nghi', value: AMENITIES_DATA.length, color: '#3b82f6', bg: '#eff6ff' }, { label: 'Kết Nối & Công Nghệ', value: AMENITIES_DATA.filter(a => a.category === 'Kết nối').length, color: '#8b5cf6', bg: '#f5f3ff' }, { label: 'Sức Khỏe & Vui Chơi', value: AMENITIES_DATA.filter(a => ['Sức khỏe', 'Vui chơi'].includes(a.category)).length, color: '#22c55e', bg: '#f0fdf4' }, { label: 'Ẩm Thực & Dịch Vụ', value: AMENITIES_DATA.filter(a => ['Ẩm thực', 'Dịch vụ'].includes(a.category)).length, color: '#f59e0b', bg: '#fffbeb' }].map(c => (
                  <div key={c.label} style={{ background: '#fff', borderRadius: 14, padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div><div style={{ color: '#94a3b8', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>{c.label}</div><div style={{ color: '#1e293b', fontSize: 28, fontWeight: 800, marginTop: 6 }}>{c.value}</div></div>
                    <div style={{ width: 46, height: 46, background: c.bg, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>⭐</div>
                  </div>
                ))}
              </div>
              <SectionCard title="Danh Sách Tiện Nghi Khách Sạn" sub="Các tiện ích đã được đăng ký trong hệ thống">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
                  {AMENITIES_DATA.map(a => (
                    <div key={a.id} style={{ background: '#f8fafc', borderRadius: 12, padding: 16, border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{ fontSize: 28, flexShrink: 0 }}>{a.icon}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, color: '#1e293b', fontSize: 14 }}>{a.name}</div>
                        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{a.description}</div>
                        <div style={{ marginTop: 6, display: 'flex', gap: 6 }}>
                          <span style={{ background: '#eff6ff', color: '#3b82f6', padding: '2px 8px', borderRadius: 6, fontSize: 11 }}>{a.category}</span>
                          <span style={{ background: '#f1f5f9', color: '#64748b', padding: '2px 8px', borderRadius: 6, fontSize: 11 }}>{a.hotelsCount} khách sạn</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            </div>
          )}

          {/* ══ TAB: ĐẶT PHÒNG ══ */}
          {/* ══ TAB: ĐẶT PHÒNG (FR-15) ══ */}
          {activeTab === 'bookings' && (
            <SectionCard>
              {/* Thanh lọc trạng thái đặt phòng */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16, alignItems: 'center' }}>
                {[
                  { key: 'ALL', label: 'Tất cả đơn', count: activeBookingsCount },
                  { key: 'PENDING', label: '⏳ Chờ duyệt', count: bookings.filter(b => (b.rawStatus || b.status || '').toUpperCase() === 'PENDING').length },
                  { key: 'EXPIRED', label: '⚠️ Đã quá hạn', count: bookings.filter(b => (b.rawStatus || b.status || '').toUpperCase() === 'EXPIRED').length },
                  { key: 'CONFIRMED', label: '✓ Đã xác nhận', count: bookings.filter(b => (b.rawStatus || b.status || '').toUpperCase() === 'CONFIRMED').length },
                  { key: 'CHECKED_IN', label: '🏨 Đã nhận phòng', count: bookings.filter(b => (b.rawStatus || b.status || '').toUpperCase() === 'CHECKED_IN').length },
                  { key: 'COMPLETED', label: '✓ Hoàn thành', count: completedBookingsCount },
                  { key: 'CANCELLED', label: '✕ Đã hủy', count: bookings.filter(b => (b.rawStatus || b.status || '').toUpperCase() === 'CANCELLED').length },
                ].map(tab => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setBookingStatusFilter(tab.key)}
                    style={{
                      background: bookingStatusFilter === tab.key ? '#3b82f6' : '#f1f5f9',
                      color: bookingStatusFilter === tab.key ? '#fff' : '#475569',
                      border: 'none',
                      borderRadius: 20,
                      padding: '6px 14px',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >
                    <span>{tab.label}</span>
                    <span style={{
                      background: bookingStatusFilter === tab.key ? 'rgba(255,255,255,0.25)' : '#e2e8f0',
                      color: bookingStatusFilter === tab.key ? '#fff' : '#64748b',
                      padding: '1px 7px',
                      borderRadius: 10,
                      fontSize: 11
                    }}>
                      {tab.count}
                    </span>
                  </button>
                ))}

                <button
                  type="button"
                  onClick={fetchBookings}
                  style={{
                    background: '#fff',
                    border: '1px solid #cbd5e1',
                    color: '#334155',
                    borderRadius: 20,
                    padding: '6px 14px',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    marginLeft: 'auto'
                  }}
                  title="Tải lại danh sách từ server"
                >
                  <RotateCcw size={13} className={isLoadingBookings ? 'spinner-border spinner-border-sm' : ''} />
                  <span>Tải lại</span>
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 16px', marginBottom: 20 }}>
                <Search size={16} color="#94a3b8" />
                <input type="text" placeholder="Tìm theo mã đơn (BK-...), tên khách, số điện thoại, tên khách sạn, tên phòng..." value={bookingSearch} onChange={e => setBookingSearch(e.target.value)} style={{ border: 'none', background: 'transparent', outline: 'none', flex: 1, fontSize: 13, color: '#1e293b' }} />
                {bookingSearch && <button onClick={() => setBookingSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex' }}><X size={16} /></button>}
                {(bookingStatusFilter !== 'ALL' || bookingHotelFilter !== 'ALL' || bookingPaymentFilter !== 'ALL') && (
                  <button
                    type="button"
                    onClick={() => {
                      setBookingStatusFilter('ALL');
                      setBookingHotelFilter('ALL');
                      setBookingPaymentFilter('ALL');
                    }}
                    className="btn btn-sm btn-outline-secondary"
                    style={{ fontSize: 11, padding: '2px 8px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 4 }}
                    title="Xóa tất cả bộ lọc trên cột"
                  >
                    <RotateCcw size={11} /> Đặt lại lọc cột
                  </button>
                )}
                <span style={{ fontSize: 12, color: '#94a3b8', flexShrink: 0 }}>Hiển thị {filteredBookings.length}/{bookingStatusFilter === 'ALL' ? activeBookingsCount : bookings.length} đơn</span>
              </div>
              {filteredBookings.length === 0 ? <Empty text={bookingSearch ? `Không tìm thấy đơn khớp với "${bookingSearch}"` : 'Chưa có đơn đặt phòng nào'} /> : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0" style={{ fontSize: 12.5 }}>
                    <thead style={{ background: '#f8fafc' }}>
                      <tr>
                        <Th>Mã Đơn</Th>
                        <Th>Khách Hàng</Th>
                        <th style={{ color: '#64748b', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', border: 'none', paddingBottom: 10 }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <span>Khách Sạn & Phòng</span>
                            <select
                              value={bookingHotelFilter}
                              onChange={(e) => setBookingHotelFilter(e.target.value)}
                              style={{
                                fontSize: 11,
                                padding: '2px 4px',
                                borderRadius: 6,
                                border: bookingHotelFilter !== 'ALL' ? '1.5px solid #3b82f6' : '1px solid #cbd5e1',
                                background: bookingHotelFilter !== 'ALL' ? '#eff6ff' : '#fff',
                                color: bookingHotelFilter !== 'ALL' ? '#1d4ed8' : '#64748b',
                                fontWeight: bookingHotelFilter !== 'ALL' ? 700 : 500,
                                cursor: 'pointer',
                                maxWidth: 130,
                                textTransform: 'none'
                              }}
                              title="Lọc nhanh theo Khách sạn"
                            >
                              <option value="ALL">Tất cả ({uniqueHotels.length})</option>
                              {uniqueHotels.map(hName => (
                                <option key={hName} value={hName}>{hName}</option>
                              ))}
                            </select>
                          </div>
                        </th>
                        <Th>Lưu Trú</Th>
                        <th style={{ color: '#64748b', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', border: 'none', paddingBottom: 10 }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <span>Thanh Toán</span>
                            <select
                              value={bookingPaymentFilter}
                              onChange={(e) => setBookingPaymentFilter(e.target.value)}
                              style={{
                                fontSize: 11,
                                padding: '2px 4px',
                                borderRadius: 6,
                                border: bookingPaymentFilter !== 'ALL' ? '1.5px solid #3b82f6' : '1px solid #cbd5e1',
                                background: bookingPaymentFilter !== 'ALL' ? '#eff6ff' : '#fff',
                                color: bookingPaymentFilter !== 'ALL' ? '#1d4ed8' : '#64748b',
                                fontWeight: bookingPaymentFilter !== 'ALL' ? 700 : 500,
                                cursor: 'pointer',
                                maxWidth: 110,
                                textTransform: 'none'
                              }}
                              title="Lọc nhanh theo Thanh toán"
                            >
                              <option value="ALL">Tất cả</option>
                              <option value="paid">✅ Đã TT</option>
                              <option value="pending">⏳ Chờ TT</option>
                              <option value="pay_at_hotel">💵 Tiền mặt</option>
                              <option value="vnpay">💳 VNPay</option>
                            </select>
                          </div>
                        </th>
                        <Th>Tổng Tiền</Th>
                        <th style={{ color: '#64748b', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', border: 'none', paddingBottom: 10 }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <span>Trạng Thái</span>
                            <select
                              value={bookingStatusFilter}
                              onChange={(e) => setBookingStatusFilter(e.target.value)}
                              style={{
                                fontSize: 11,
                                padding: '2px 4px',
                                borderRadius: 6,
                                border: bookingStatusFilter !== 'ALL' ? '1.5px solid #3b82f6' : '1px solid #cbd5e1',
                                background: bookingStatusFilter !== 'ALL' ? '#eff6ff' : '#fff',
                                color: bookingStatusFilter !== 'ALL' ? '#1d4ed8' : '#64748b',
                                fontWeight: bookingStatusFilter !== 'ALL' ? 700 : 500,
                                cursor: 'pointer',
                                maxWidth: 110,
                                textTransform: 'none'
                              }}
                              title="Lọc nhanh theo Trạng thái"
                            >
                              <option value="ALL">Tất cả ({activeBookingsCount})</option>
                              <option value="PENDING">⏳ Chờ duyệt</option>
                              <option value="CONFIRMED">✓ Đã xác nhận</option>
                              <option value="CHECKED_IN">🏨 Đã nhận phòng</option>
                              <option value="COMPLETED">🏁 Hoàn thành ({completedBookingsCount})</option>
                              <option value="EXPIRED">⚠️ Quá hạn</option>
                              <option value="CANCELLED">✕ Đã hủy</option>
                            </select>
                          </div>
                        </th>
                        <Th>Lễ Tân</Th>
                      </tr>
                    </thead>
                    <tbody>{filteredBookings.map(b => {
                      const rawS = (b.rawStatus || b.status || '').toUpperCase();
                      return (
                        <tr key={b.id}>
                          <td className="font-monospace fw-bold text-primary" style={{ fontSize: 12 }}>{b.bookingCode || b.id}</td>
                          <td>
                            <div style={{ fontWeight: 600, color: '#1e293b' }}>{b.contactName || b.guestName}</div>
                            <div style={{ fontSize: 11, color: '#94a3b8' }}>{b.contactPhone}</div>
                          </td>
                          <td>
                            <div style={{ fontWeight: 600, color: '#1e293b', maxWidth: 140 }} className="text-truncate" title={b.hotelName}>{b.hotelName}</div>
                            <div style={{ fontSize: 11, color: '#64748b', maxWidth: 140 }} className="text-truncate" title={b.roomName}>{b.roomName}</div>
                          </td>
                          <td>
                            <div style={{ fontSize: 11.5, color: '#374151', whiteSpace: 'nowrap' }}>{b.checkInDate} → {b.checkOutDate}</div>
                            <span style={{ background: '#f1f5f9', color: '#64748b', padding: '1px 6px', borderRadius: 4, fontSize: 10, fontWeight: 500 }}>{b.nights} đêm</span>
                          </td>
                          <td>
                            {b.paymentMethod === 'vnpay' ? (
                              <Badge bg="#eff6ff" color="#3b82f6">✓ VNPay ({b.paymentStatus === 'paid' ? 'Đã TT' : 'Chờ TT'})</Badge>
                            ) : (
                              b.paymentStatus === 'paid' 
                                ? <Badge bg="#dcfce7" color="#16a34a">✓ Tiền mặt (Đã thu)</Badge> 
                                : <Badge bg="#fef9c3" color="#92400e">⏳ Tiền mặt (Chưa thu)</Badge>
                            )}
                          </td>
                          <td style={{ fontWeight: 700, color: '#dc2626', whiteSpace: 'nowrap' }}>{b.totalAmount?.toLocaleString('vi-VN')} đ</td>
                          <td><StatusBadge status={rawS} isOverdueCheckout={b.isOverdueCheckout} /></td>
                          <td>
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                              {/* Đơn QUÁ HẠN: Nút Xóa đơn quá hạn */}
                              {rawS === 'EXPIRED' && (
                                <SmBtn color="red" onClick={() => handleDeleteBooking(b)} icon={<Trash2 size={12} />}>
                                  Xóa đơn
                                </SmBtn>
                              )}

                              {/* Đơn PENDING: Chặn duyệt nếu chưa thanh toán chuyển khoản */}
                              {rawS === 'PENDING' && (
                                <>
                                  {b.paymentMethod === 'vnpay' && b.paymentStatus !== 'paid' ? (
                                    <button
                                      type="button"
                                      onClick={() => showAlert({
                                        title: 'Chờ thanh toán VNPay',
                                        message: `Không thể duyệt đơn thủ công: Khách hàng chưa thanh toán bằng phương thức chuyển khoản/VNPay!\n\n• Hệ thống áp dụng thời hạn 30 phút để thanh toán.\n• Khi khách thanh toán thành công, hệ thống sẽ TỰ ĐỘNG DUYỆT ĐƠN.\n• Nếu quá 30 phút chưa thanh toán, hệ thống sẽ tự động hủy đơn.`,
                                        type: 'info',
                                        confirmText: 'Đã hiểu'
                                      })}
                                      style={{
                                        background: '#fef3c7',
                                        color: '#92400e',
                                        border: '1px solid #fde68a',
                                        borderRadius: 8,
                                        padding: '6px 10px',
                                        fontSize: 12,
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 4
                                      }}
                                      title="Khách chưa thanh toán VNPay (hạn 30p). Đơn sẽ tự động duyệt khi chuyển khoản thành công!"
                                    >
                                      <Clock size={12} /> Chờ TT (30p)
                                    </button>
                                  ) : (
                                    <SmBtn color="green" onClick={() => handleConfirmBooking(b)} icon={<Check size={13} />}>
                                      Duyệt đơn
                                    </SmBtn>
                                  )}
                                  <SmBtn color="red" onClick={() => handleCancelBooking(b)}>
                                    Hủy
                                  </SmBtn>
                                </>
                              )}

                              {/* Đơn CONFIRMED: Khách thanh toán tiền mặt bắt buộc: Thu tiền -> Nhận phòng */}
                              {rawS === 'CONFIRMED' && (
                                <>
                                  {b.paymentMethod === 'pay_at_hotel' && b.paymentStatus !== 'paid' ? (
                                    <SmBtn color="green" onClick={() => markAsPaid(b.id)} icon={<Banknote size={12} />}>
                                      Thu tiền
                                    </SmBtn>
                                  ) : (
                                    <SmBtn color="blue" onClick={() => openCheckinModal(b)} icon={<LogIn size={12} />}>
                                      Nhận phòng
                                    </SmBtn>
                                  )}
                                  <SmBtn color="red" onClick={() => handleCancelBooking(b)}>
                                    Hủy
                                  </SmBtn>
                                </>
                              )}

                              {/* Đơn CHECKED_IN: Trả phòng linh hoạt (chọn ngày & tính lại bill) */}
                              {rawS === 'CHECKED_IN' && (
                                <>
                                  <SmBtn color="purple" onClick={() => openCheckoutModal(b)} icon={<CheckCircle2 size={12} />}>
                                    Trả phòng
                                  </SmBtn>
                                  {b.isOverdueCheckout && (
                                    <SmBtn color="red" onClick={() => handleDeleteBooking(b)} icon={<Trash2 size={12} />}>
                                      Xóa
                                    </SmBtn>
                                  )}
                                </>
                              )}

                              {/* Đơn COMPLETED: Xuất hóa đơn / Xem phiếu thu */}
                              {rawS === 'COMPLETED' && (
                                <SmBtn color="blue" onClick={() => setSelectedInvoice(b)} icon={<Receipt size={12} />}>
                                  Hóa đơn
                                </SmBtn>
                              )}

                              {/* Đơn CANCELLED: Cho phép Xóa vĩnh viễn hoặc Duyệt lại */}
                              {rawS === 'CANCELLED' && (
                                <>
                                  <SmBtn color="red" onClick={() => handleDeleteBooking(b)} icon={<Trash2 size={12} />}>
                                    Xóa
                                  </SmBtn>
                                  <SmBtn color="green" onClick={() => handleConfirmBooking(b)} icon={<RotateCcw size={12} />}>
                                    Duyệt lại
                                  </SmBtn>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}</tbody>
                  </table>
                </div>
              )}
            </SectionCard>
          )}

          {/* ══ TAB: KHÁCH HÀNG ══ */}
          {activeTab === 'customers' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 20 }}>
                <KpiCard icon={<Users size={26} color="#3b82f6" />} iconBg="#eff6ff" value={customerList.length} label="Tổng Khách Hàng" sub={<span style={{ color: '#6b7280', fontSize: 13 }}>Đã từng đặt phòng</span>} />
                <KpiCard icon={<Award size={26} color="#f59e0b" />} iconBg="#fffbeb" value={customerList.filter(c => !c.isGuest).length} label="Thành Viên Đăng Ký" sub={<span style={{ color: '#6b7280', fontSize: 13 }}>Có tài khoản hệ thống</span>} />
                <KpiCard icon={<Users size={26} color="#8b5cf6" />} iconBg="#f5f3ff" value={customerList.filter(c => c.isGuest).length} label="Khách Vãng Lai" sub={<span style={{ color: '#6b7280', fontSize: 13 }}>Đặt không cần tài khoản</span>} />
                <KpiCard icon={<DollarSign size={26} color="#22c55e" />} iconBg="#f0fdf4" value={customerList.length > 0 ? Math.round(customerList.reduce((s, c) => s + c.totalSpent, 0) / customerList.length).toLocaleString('vi-VN') + ' đ' : '0 đ'} label="Chi Tiêu TB/Khách" sub={<span style={{ color: '#6b7280', fontSize: 13 }}>Trên đơn đã xác nhận</span>} />
              </div>
              <SectionCard title="Danh Sách Khách Hàng" sub="Danh sách được xây dựng từ lịch sử đặt phòng">
                {customerList.length === 0 ? <Empty text="Chưa có dữ liệu khách hàng. Hãy thực hiện đặt phòng thử nghiệm từ trang khách hàng!" /> : (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0" style={{ fontSize: 13 }}>
                      <thead style={{ background: '#f8fafc' }}><tr>{['#', 'Tên Khách Hàng', 'Số Điện Thoại', 'Email', 'Phân Loại', 'Số Đơn', 'Tổng Chi Tiêu', 'Trạng Thái VIP'].map(h => <Th key={h}>{h}</Th>)}</tr></thead>
                      <tbody>{customerList.map((c, i) => (
                        <tr key={i}>
                          <td style={{ color: '#94a3b8', fontWeight: 600 }}>#{i + 1}</td>
                          <td><div style={{ fontWeight: 700, color: '#1e293b' }}>{c.name}</div></td>
                          <td style={{ color: '#374151' }}>{c.phone || '—'}</td>
                          <td style={{ color: '#374151', fontSize: 12 }}>{c.email || '—'}</td>
                          <td>{c.isGuest ? <Badge bg="#f1f5f9" color="#64748b">Vãng lai</Badge> : <Badge bg="#eff6ff" color="#3b82f6">Thành viên</Badge>}</td>
                          <td style={{ fontWeight: 600 }}>{c.bookings.length} đơn</td>
                          <td style={{ fontWeight: 700, color: '#dc2626' }}>{c.totalSpent.toLocaleString('vi-VN')} đ</td>
                          <td>{c.totalSpent > 5000000 ? <Badge bg="#fef9c3" color="#92400e">👑 VIP</Badge> : c.bookings.length >= 2 ? <Badge bg="#dcfce7" color="#16a34a">⭐ Thân thiết</Badge> : <Badge bg="#f1f5f9" color="#64748b">Thường</Badge>}</td>
                        </tr>
                      ))}</tbody>
                    </table>
                  </div>
                )}
              </SectionCard>
            </div>
          )}

          {/* ══ TAB: QUẢN LÝ NGƯỜI DÙNG ══ */}
          {activeTab === 'users' && <AdminUserManagement />}

          {/* ══ TAB: THANH TOÁN ══ */}
          {activeTab === 'payments' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 20 }}>
                <KpiCard icon={<DollarSign size={26} color="#22c55e" />} iconBg="#f0fdf4" value={stats.revenue.toLocaleString('vi-VN') + ' đ'} label="Tổng Doanh Thu" sub={<span style={{ color: '#6b7280', fontSize: 13 }}>Từ đơn đã xác nhận</span>} />
                <KpiCard icon={<CheckCircle2 size={26} color="#3b82f6" />} iconBg="#eff6ff" value={paymentStats.paidRevenue.toLocaleString('vi-VN') + ' đ'} label="Đã Thu Thành Công" sub={<span style={{ color: '#22c55e', fontSize: 13, fontWeight: 600 }}>Online + Tiền mặt đã thu</span>} />
                <KpiCard icon={<Clock size={26} color="#f59e0b" />} iconBg="#fffbeb" value={paymentStats.pendingRevenue.toLocaleString('vi-VN') + ' đ'} label="Chờ Thu Tiền Mặt" sub={<span style={{ color: '#f59e0b', fontSize: 13, fontWeight: 600 }}>Tại quầy lễ tân</span>} />
                <KpiCard icon={<CreditCard size={26} color="#8b5cf6" />} iconBg="#f5f3ff" value={bookings.length} label="Tổng Giao Dịch" sub={<span style={{ color: '#6b7280', fontSize: 13 }}>VNPAY + Tiền mặt</span>} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                <ChartCard title="Phân Bổ Phương Thức Thanh Toán" sub="Tỷ lệ các hình thức thanh toán">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart><Pie data={[{ name: 'VNPAY', value: paymentStats.vnpay || 1 }, { name: 'Tiền mặt', value: paymentStats.cash || 1 }, { name: 'Khác', value: paymentStats.other || 1 }]} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {[0, 1, 2].map(i => <Cell key={i} fill={PIE_COLORS[i]} />)}
                    </Pie><Tooltip /></PieChart>
                  </ResponsiveContainer>
                </ChartCard>
                <ChartCard title="Doanh Thu Theo Ngày (7 Ngày)" sub="Doanh thu từ đặt phòng online và tại quầy">
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={last7Days} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="ngay" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => (v / 1000000).toFixed(1) + 'tr'} />
                      <Tooltip formatter={v => [v.toLocaleString('vi-VN') + ' đ', 'Doanh thu']} contentStyle={{ borderRadius: 10, fontSize: 13 }} />
                      <Line type="monotone" dataKey="doanhThu" stroke="#22c55e" strokeWidth={2.5} dot={{ r: 3, fill: '#22c55e' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartCard>
              </div>
              <SectionCard title="Lịch Sử Giao Dịch" sub="Tất cả giao dịch thanh toán trong hệ thống">
                {bookings.length === 0 ? <Empty text="Chưa có giao dịch thanh toán nào" /> : (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0" style={{ fontSize: 13 }}>
                      <thead style={{ background: '#f8fafc' }}><tr>{['Mã Đơn', 'Khách Hàng', 'Số Tiền', 'Phương Thức', 'Ngày Đặt', 'Trạng Thái'].map(h => <Th key={h}>{h}</Th>)}</tr></thead>
                      <tbody>{bookings.map(b => (
                        <tr key={b.id}>
                          <td className="font-monospace fw-bold text-primary" style={{ fontSize: 12 }}>{b.id}</td>
                          <td><div style={{ fontWeight: 600 }}>{b.contactName || b.guestName}</div><div style={{ fontSize: 11, color: '#94a3b8' }}>{b.hotelName}</div></td>
                          <td style={{ fontWeight: 700, color: '#dc2626', fontSize: 14 }}>{b.totalAmount?.toLocaleString('vi-VN')} đ</td>
                          <td>{b.paymentMethod === 'vnpay' ? <Badge bg="#eff6ff" color="#3b82f6">💳 VNPAY</Badge> : <Badge bg="#fef9c3" color="#92400e">💵 Tiền mặt</Badge>}</td>
                          <td style={{ fontSize: 12, color: '#64748b' }}>{b.createdAt || '—'}</td>
                          <td>{b.status === 'confirmed' && (b.paymentMethod !== 'pay_at_hotel' || b.paymentStatus === 'paid') ? <Badge bg="#dcfce7" color="#16a34a">✓ Đã thanh toán</Badge> : b.status === 'cancelled' ? <Badge bg="#fee2e2" color="#dc2626">✕ Đã hủy</Badge> : <Badge bg="#fef9c3" color="#92400e">⏳ Chờ thu tiền</Badge>}</td>
                        </tr>
                      ))}</tbody>
                    </table>
                  </div>
                )}
              </SectionCard>
            </div>
          )}

          {/* ══ TAB: KHUYẾN MÃI ══ */}
          {activeTab === 'coupons' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 20 }}>
                <KpiCard icon={<Tag size={26} color="#8b5cf6" />} iconBg="#f5f3ff" value={coupons.length} label="Tổng Mã Giảm Giá" sub={<span style={{ color: '#6b7280', fontSize: 13 }}>Đang quản lý</span>} />
                <KpiCard icon={<CheckCircle2 size={26} color="#22c55e" />} iconBg="#f0fdf4" value={coupons.filter(c => c.status === 'active').length} label="Đang Hoạt Động" sub={<span style={{ color: '#22c55e', fontWeight: 600, fontSize: 13 }}>Có thể sử dụng</span>} />
                <KpiCard icon={<Clock size={26} color="#f59e0b" />} iconBg="#fffbeb" value={coupons.filter(c => c.status === 'scheduled').length} label="Sắp Kích Hoạt" sub={<span style={{ color: '#f59e0b', fontWeight: 600, fontSize: 13 }}>Chưa đến ngày</span>} />
                <KpiCard icon={<X size={26} color="#dc2626" />} iconBg="#fee2e2" value={coupons.filter(c => c.status === 'expired').length} label="Đã Hết Hạn" sub={<span style={{ color: '#dc2626', fontWeight: 600, fontSize: 13 }}>Không còn dùng được</span>} />
              </div>
              <SectionCard title="Danh Sách Mã Khuyến Mãi" sub="Quản lý các chương trình ưu đãi và mã giảm giá">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 16 }}>
                  {coupons.map(c => (
                    <div key={c.id} style={{ background: '#f8fafc', border: c.status === 'active' ? '2px solid #bbf7d0' : '1px solid #e2e8f0', borderRadius: 14, padding: 20 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                        <div>
                          <div style={{ fontFamily: 'monospace', fontWeight: 900, fontSize: 18, color: '#1e293b', letterSpacing: 1 }}>{c.id}</div>
                          <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>{c.description}</div>
                        </div>
                        <div style={{ background: c.type === 'percent' ? '#eff6ff' : '#fef9c3', color: c.type === 'percent' ? '#3b82f6' : '#92400e', fontWeight: 900, fontSize: 20, padding: '8px 16px', borderRadius: 12 }}>
                          {c.type === 'percent' ? `-${c.discount}%` : `-${(c.discount / 1000).toFixed(0)}K`}
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                        {[['Đơn tối thiểu', c.minOrder.toLocaleString('vi-VN') + ' đ'], ['Giảm tối đa', c.maxDiscount.toLocaleString('vi-VN') + ' đ'], ['Hết hạn', c.expiry], ['Đã dùng', `${c.usedCount}/${c.totalCount} lần`]].map(([label, val]) => (
                          <div key={label}><div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase' }}>{label}</div><div style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{val}</div></div>
                        ))}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ flex: 1, background: '#e2e8f0', borderRadius: 10, height: 6, marginRight: 12 }}><div style={{ width: `${Math.min(100, (c.usedCount / c.totalCount) * 100)}%`, background: c.status === 'active' ? '#22c55e' : '#94a3b8', height: '100%', borderRadius: 10 }} /></div>
                        {c.status === 'active' ? <Badge bg="#dcfce7" color="#16a34a">✓ Đang hoạt động</Badge> : c.status === 'scheduled' ? <Badge bg="#fef9c3" color="#92400e">⏳ Sắp kích hoạt</Badge> : <Badge bg="#fee2e2" color="#dc2626">✕ Hết hạn</Badge>}
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            </div>
          )}

          {/* ══ TAB: ĐÁNH GIÁ ══ */}
          {activeTab === 'reviews' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 20 }}>
                <KpiCard icon={<MessageSquare size={26} color="#f59e0b" />} iconBg="#fffbeb" value={allReviews.length} label="Tổng Đánh Giá" sub={<span style={{ color: '#6b7280', fontSize: 13 }}>Từ khách lưu trú</span>} />
                <KpiCard icon={<Star size={26} color="#f59e0b" />} iconBg="#fffbeb" value={stats.avgRating + '/10'} label="Điểm TB Hệ Thống" sub={<span style={{ color: '#22c55e', fontWeight: 600, fontSize: 13 }}>⭐ Xuất sắc</span>} />
                <KpiCard icon={<TrendingUp size={26} color="#22c55e" />} iconBg="#f0fdf4" value={allReviews.filter(r => r.rating >= 9).length} label="Đánh Giá Xuất Sắc" sub={<span style={{ color: '#22c55e', fontWeight: 600, fontSize: 13 }}>Điểm ≥ 9/10</span>} />
                <KpiCard icon={<Building size={26} color="#3b82f6" />} iconBg="#eff6ff" value={hotels.reduce((s, h) => s + (h.reviewCount || 0), 0)} label="Tổng Lượt Đánh Giá" sub={<span style={{ color: '#6b7280', fontSize: 13 }}>Trên nền tảng Traveloka</span>} />
              </div>
              <SectionCard title="Tổng Hợp Đánh Giá Theo Khách Sạn" sub="Điểm trung bình và số lượng đánh giá từng cơ sở">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 16, marginBottom: 20 }}>
                  {hotels.map(h => (
                    <div key={h.id} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 14, padding: 16, display: 'flex', gap: 14, alignItems: 'center' }}>
                      <img src={h.thumbnailUrl} alt={h.name} style={{ width: 72, height: 56, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, color: '#1e293b', fontSize: 14 }}>{h.name}</div>
                        <div style={{ fontSize: 12, color: '#94a3b8' }}>{h.city} • {h.starRating} sao</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
                          <span style={{ background: '#dcfce7', color: '#16a34a', padding: '3px 10px', borderRadius: 8, fontWeight: 800, fontSize: 15 }}>{h.ratingScore}</span>
                          <span style={{ fontSize: 12, color: '#94a3b8' }}>{h.ratingText} • {h.reviewCount} lượt đánh giá</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>
              <SectionCard title="Bình Luận Từ Khách Lưu Trú" sub="Phản hồi chi tiết từ khách hàng đã trải nghiệm">
                {allReviews.length === 0 ? <Empty text="Chưa có đánh giá nào từ khách hàng" /> : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {allReviews.map((r, i) => (
                      <div key={i} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 15, flexShrink: 0 }}>{r.author.charAt(0)}</div>
                            <div><div style={{ fontWeight: 700, color: '#1e293b' }}>{r.author}</div><div style={{ fontSize: 12, color: '#94a3b8' }}>{r.hotelName} • {r.date}</div></div>
                          </div>
                          <span style={{ background: r.rating >= 9 ? '#dcfce7' : '#fef9c3', color: r.rating >= 9 ? '#16a34a' : '#92400e', padding: '4px 12px', borderRadius: 20, fontWeight: 800, fontSize: 14 }}>⭐ {r.rating}/10</span>
                        </div>
                        <p style={{ margin: 0, fontSize: 13, color: '#374151', lineHeight: 1.6 }}>{r.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </SectionCard>
            </div>
          )}

          {/* ══ TAB: BÁO CÁO ══ */}
          {activeTab === 'reports' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 20 }}>
                <KpiCard icon={<TrendingUp size={26} color="#22c55e" />} iconBg="#f0fdf4" value={last7Days.reduce((s, d) => s + d.doanhThu, 0).toLocaleString('vi-VN') + ' đ'} label="Doanh Thu 7 Ngày" sub={<span style={{ color: '#22c55e', fontWeight: 600, fontSize: 13 }}>↑ Tăng trưởng tốt</span>} />
                <KpiCard icon={<BarChart2 size={26} color="#3b82f6" />} iconBg="#eff6ff" value={Math.round(stats.revenue / Math.max(stats.confirmed, 1)).toLocaleString('vi-VN') + ' đ'} label="Doanh Thu TB/Đơn" sub={<span style={{ color: '#6b7280', fontSize: 13 }}>Trên đơn đã xác nhận</span>} />
                <KpiCard icon={<Building size={26} color="#8b5cf6" />} iconBg="#f5f3ff" value={hotels.length + ' cơ sở'} label="Khách Sạn Quản Lý" sub={<span style={{ color: '#6b7280', fontSize: 13 }}>Tổng {stats.totalRooms} loại phòng</span>} />
                <KpiCard icon={<Star size={26} color="#f59e0b" />} iconBg="#fffbeb" value={stats.avgRating + '/10'} label="Điểm Uy Tín TB" sub={<span style={{ color: '#22c55e', fontWeight: 600, fontSize: 13 }}>Từ {allReviews.length} đánh giá</span>} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 20 }}>
                <ChartCard title="Biểu Đồ Doanh Thu & Đặt Phòng 7 Ngày" sub="So sánh doanh thu và số đơn theo ngày">
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={last7Days} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="ngay" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                      <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => (v / 1000000).toFixed(1) + 'tr'} />
                      <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip contentStyle={{ borderRadius: 10, fontSize: 13 }} />
                      <Legend />
                      <Bar yAxisId="left" dataKey="doanhThu" name="Doanh Thu (đ)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      <Bar yAxisId="right" dataKey="daDat" name="Số Đơn" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>
                <ChartCard title="Phân Bổ Khách Sạn Theo Thành Phố" sub="Tỷ lệ cơ sở theo địa bàn">
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={(() => { const m = {}; hotels.forEach(h => { m[h.city] = (m[h.city] || 0) + 1; }); return Object.entries(m).map(([name, value]) => ({ name, value })); })()} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name} (${value})`}>
                        {hotels.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartCard>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ════ MODAL THÊM / SỬA KHÁCH SẠN (FR-13) ════ */}
      {showHotelModal && (
        <Modal onClose={() => setShowHotelModal(false)} title={editingHotel ? 'Chỉnh Sửa Thông Tin Khách Sạn' : 'Thêm Khách Sạn Mới Vào Hệ Thống'}>
          <form onSubmit={saveHotel}>
            <div style={{ padding: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ gridColumn: '1/2' }}><FL>Tên khách sạn *</FL><input className="form-control" value={hotelForm.name} onChange={e => setHotelForm({ ...hotelForm, name: e.target.value })} required placeholder="VD: Khách Sạn New World Sài Gòn" /></div>
              <div><FL>Thành phố *</FL><select className="form-select" value={hotelForm.city} onChange={e => setHotelForm({ ...hotelForm, city: e.target.value })}>{['Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Nha Trang', 'Đà Lạt', 'Phú Quốc'].map(c => <option key={c}>{c}</option>)}</select></div>
              <div style={{ gridColumn: '1/-1' }}><FL>Địa chỉ chi tiết *</FL><input className="form-control" value={hotelForm.address} onChange={e => setHotelForm({ ...hotelForm, address: e.target.value })} required placeholder="VD: 76 Lê Lai, Phường Bến Thành, Quận 1" /></div>
              <div><FL>Hạng sao</FL><select className="form-select" value={hotelForm.starRating} onChange={e => setHotelForm({ ...hotelForm, starRating: e.target.value })}>{[5,4,3,2].map(s => <option key={s} value={s}>{s} sao</option>)}</select></div>
              <div><FL>Giá phòng khởi điểm / đêm (VNĐ) *</FL><input type="number" step="50000" className="form-control" value={hotelForm.pricePerNight} onChange={e => setHotelForm({ ...hotelForm, pricePerNight: e.target.value })} required /></div>
              <div style={{ gridColumn: '1/-1' }}>
                <FL>URL hình ảnh đại diện</FL>
                <div className="input-group">
                  <input
                    type="url"
                    className="form-control"
                    value={hotelForm.thumbnailUrl}
                    onChange={e => setHotelForm({ ...hotelForm, thumbnailUrl: e.target.value })}
                    placeholder="https://... hoặc bấm nút Upload để chọn ảnh"
                  />
                  <button
                    type="button"
                    className="btn btn-primary d-flex align-items-center gap-2 fw-semibold px-3"
                    onClick={() => hotelImageInputRef.current?.click()}
                    disabled={isUploadingHotelImage}
                    title="Tải ảnh từ máy tính (MultipartFile) lên Cloudinary"
                  >
                    {isUploadingHotelImage ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                        <span>Đang tải lên...</span>
                      </>
                    ) : (
                      <>
                        <UploadCloud size={16} />
                        <span>Upload Ảnh</span>
                      </>
                    )}
                  </button>
                </div>
                <input
                  type="file"
                  ref={hotelImageInputRef}
                  style={{ display: 'none' }}
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={handleHotelImageUpload}
                />
                {hotelForm.thumbnailUrl && (
                  <div className="d-flex align-items-center gap-3 mt-2 p-2 bg-light rounded-3 border">
                    <img
                      src={hotelForm.thumbnailUrl}
                      alt="Xem trước ảnh khách sạn"
                      className="rounded-2 object-fit-cover shadow-sm border"
                      style={{ width: 70, height: 50 }}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <div className="small text-secondary" style={{ fontSize: '12px' }}>
                      <div className="fw-semibold text-dark">Xem trước ảnh đại diện khách sạn</div>
                      <div className="text-truncate" style={{ maxWidth: 380 }}>{hotelForm.thumbnailUrl}</div>
                    </div>
                  </div>
                )}
              </div>
              <div style={{ gridColumn: '1/-1' }}><FL>Mô tả giới thiệu</FL><textarea rows={3} className="form-control" value={hotelForm.description} onChange={e => setHotelForm({ ...hotelForm, description: e.target.value })} placeholder="Nêu các điểm nổi bật..." /></div>
            </div>
            <div style={{ padding: '16px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button type="button" onClick={() => setShowHotelModal(false)} style={{ background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: 10, padding: '10px 24px', fontWeight: 600, cursor: 'pointer' }}>Hủy Bỏ</button>
              <button type="submit" style={{ background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 24px', fontWeight: 700, cursor: 'pointer' }}>{editingHotel ? 'Lưu Thay Đổi' : 'Tạo Khách Sạn'}</button>
            </div>
          </form>
        </Modal>
      )}

      {/* ════ MODAL THÊM / SỬA LOẠI PHÒNG (FR-14) ════ */}
      {showRoomModal && (
        <Modal onClose={() => setShowRoomModal(false)} title={editingRoom ? 'Chỉnh Sửa Loại Phòng' : 'Thêm Loại Phòng Mới Cho Khách Sạn'}>
          <form onSubmit={saveRoom}>
            <div style={{ padding: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ gridColumn: '1/-1' }}>
                <FL>Chọn Khách Sạn Thuộc Về *</FL>
                <select className="form-select" value={roomForm.hotelId} onChange={e => setRoomForm({ ...roomForm, hotelId: e.target.value })} required>
                  <option value="">-- Chọn khách sạn --</option>
                  {hotels.map(h => <option key={h.id} value={h.id}>{h.name} ({h.city})</option>)}
                </select>
              </div>
              <div style={{ gridColumn: '1/2' }}>
                <FL>Tên loại phòng *</FL>
                <input className="form-control" value={roomForm.name} onChange={e => setRoomForm({ ...roomForm, name: e.target.value })} required placeholder="VD: Phòng Deluxe Giường Đôi Hướng Biển" />
              </div>
              <div>
                <FL>Giá phòng 1 đêm (VNĐ) *</FL>
                <input
                  type="number"
                  step="50000"
                  min="50000"
                  className="form-control"
                  value={roomForm.pricePerNight}
                  onChange={e => setRoomForm({ ...roomForm, pricePerNight: e.target.value })}
                  required
                />
                <div style={{ fontSize: 12, color: '#2563eb', fontWeight: 600, marginTop: 4 }}>
                  💰 Xem nhanh: {Number(roomForm.pricePerNight || 0).toLocaleString('vi-VN')} VNĐ / đêm
                </div>
              </div>
              <div>
                <FL>Số lượng khách tối đa *</FL>
                <input type="number" min="1" max="10" className="form-control" value={roomForm.maxGuests} onChange={e => setRoomForm({ ...roomForm, maxGuests: e.target.value })} required />
              </div>
              <div>
                <FL>Trạng thái phòng *</FL>
                <select className="form-select" value={roomForm.status} onChange={e => setRoomForm({ ...roomForm, status: e.target.value })}>
                  <option value="AVAILABLE">AVAILABLE (Sẵn sàng)</option>
                  <option value="BOOKED">BOOKED (Đang có khách)</option>
                  <option value="MAINTENANCE">MAINTENANCE (Đang bảo trì)</option>
                </select>
              </div>
              <div>
                <FL>Loại giường</FL>
                <input className="form-control" value={roomForm.bedType} onChange={e => setRoomForm({ ...roomForm, bedType: e.target.value })} placeholder="VD: 1 Giường King hoặc 2 Giường đơn" />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
                  {['1 Giường King', '2 Giường đơn', '1 King & 1 Đơn', '2 Giường đôi'].map(b => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setRoomForm({ ...roomForm, bedType: b })}
                      style={{
                        fontSize: 11,
                        padding: '2px 8px',
                        borderRadius: 6,
                        border: '1px solid #cbd5e1',
                        background: roomForm.bedType === b ? '#eff6ff' : '#f8fafc',
                        color: roomForm.bedType === b ? '#2563eb' : '#475569',
                        cursor: 'pointer'
                      }}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <FL>Diện tích phòng</FL>
                <input className="form-control" value={roomForm.roomSize} onChange={e => setRoomForm({ ...roomForm, roomSize: e.target.value })} placeholder="VD: 45 m²" />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
                  {['28 m²', '35 m²', '45 m²', '65 m²'].map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setRoomForm({ ...roomForm, roomSize: s })}
                      style={{
                        fontSize: 11,
                        padding: '2px 8px',
                        borderRadius: 6,
                        border: '1px solid #cbd5e1',
                        background: roomForm.roomSize === s ? '#eff6ff' : '#f8fafc',
                        color: roomForm.roomSize === s ? '#2563eb' : '#475569',
                        cursor: 'pointer'
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <FL>URL hình ảnh phòng</FL>
                <div className="input-group">
                  <input
                    type="url"
                    className="form-control"
                    value={roomForm.imageUrl}
                    onChange={e => setRoomForm({ ...roomForm, imageUrl: e.target.value })}
                    placeholder="https://... hoặc bấm nút Upload để chọn ảnh"
                  />
                  <button
                    type="button"
                    className="btn btn-primary d-flex align-items-center gap-2 fw-semibold px-3"
                    onClick={() => roomImageInputRef.current?.click()}
                    disabled={isUploadingRoomImage}
                    title="Tải ảnh loại phòng từ máy tính lên Cloudinary"
                  >
                    {isUploadingRoomImage ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                        <span>Đang tải lên...</span>
                      </>
                    ) : (
                      <>
                        <UploadCloud size={16} />
                        <span>Upload Ảnh (Cloudinary)</span>
                      </>
                    )}
                  </button>
                </div>
                <input
                  type="file"
                  ref={roomImageInputRef}
                  style={{ display: 'none' }}
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={handleRoomImageUpload}
                />
                {roomForm.imageUrl && (
                  <div className="d-flex align-items-center gap-3 mt-2 p-2 bg-light rounded-3 border">
                    <img
                      src={roomForm.imageUrl}
                      alt="Xem trước ảnh phòng"
                      className="rounded-2 object-fit-cover shadow-sm border"
                      style={{ width: 70, height: 50 }}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <div className="small text-secondary" style={{ fontSize: '12px' }}>
                      <div className="fw-semibold text-dark">Xem trước ảnh phòng</div>
                      <div className="text-truncate" style={{ maxWidth: 380 }}>{roomForm.imageUrl}</div>
                    </div>
                  </div>
                )}
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <FL>Mô tả chi tiết phòng</FL>
                <textarea rows={3} className="form-control" value={roomForm.description} onChange={e => setRoomForm({ ...roomForm, description: e.target.value })} placeholder="Nêu các đặc điểm nổi bật, view phòng, tiện ích..." />
              </div>
            </div>
            <div style={{ padding: '16px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button type="button" onClick={() => setShowRoomModal(false)} style={{ background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: 10, padding: '10px 24px', fontWeight: 600, cursor: 'pointer' }}>Hủy Bỏ</button>
              <button type="submit" style={{ background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 24px', fontWeight: 700, cursor: 'pointer' }}>{editingRoom ? 'Lưu Thay Đổi' : 'Tạo Loại Phòng'}</button>
            </div>
          </form>
        </Modal>
      )}

      {/* ════ MODAL HÓA ĐƠN LỄ TÂN ════ */}
      {selectedInvoice && (
        <Modal onClose={() => setSelectedInvoice(null)} title="Xem Trước Hóa Đơn Dịch Vụ & Phiếu Thu Lễ Tân" dark
          action={<button onClick={() => window.print()} style={{ background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}><Printer size={14} /> In Hóa Đơn</button>}>
          <div id="hotel-invoice-printable" style={{ overflowY: 'auto', flex: 1, padding: '28px 32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #e2e8f0', paddingBottom: 20, marginBottom: 20 }}>
              <div><div style={{ fontSize: 24, fontWeight: 900, color: '#2563eb' }}>Traveloka</div><div style={{ fontWeight: 700, fontSize: 16, color: '#1e293b', marginTop: 4 }}>{selectedInvoice.hotelName}</div><div style={{ fontSize: 12, color: '#94a3b8' }}>Hotline: 1900 1234 • MST: 0102938475</div></div>
              <div style={{ textAlign: 'right' }}><div style={{ fontWeight: 800, fontSize: 18, color: '#1e293b', textTransform: 'uppercase' }}>Phiếu Thu Tiền</div><div style={{ fontFamily: 'monospace', fontWeight: 700, color: '#2563eb', marginTop: 4 }}>Số: HD-{selectedInvoice.id}</div><div style={{ fontSize: 11, color: '#94a3b8' }}>Ngày in: {new Date().toLocaleString('vi-VN')}</div></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              {[{ title: '👤 Thông Tin Khách', rows: [['Họ và tên', selectedInvoice.contactName || selectedInvoice.guestName], ['Điện thoại', selectedInvoice.contactPhone], ['Email', selectedInvoice.contactEmail]] }, { title: '🏨 Chi Tiết Lưu Trú', rows: [['Mã đặt chỗ', selectedInvoice.id], ['Hạng phòng', selectedInvoice.roomName], ['Kỳ lưu trú', `${selectedInvoice.checkInDate} → ${selectedInvoice.checkOutDate} (${selectedInvoice.nights} đêm)`]] }].map(card => (
                <div key={card.title} style={{ background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0', padding: 14 }}>
                  <div style={{ fontWeight: 700, fontSize: 12, textTransform: 'uppercase', color: '#475569', marginBottom: 10 }}>{card.title}</div>
                  {card.rows.map(([l, v]) => <div key={l} style={{ display: 'flex', gap: 8, fontSize: 13, marginBottom: 5 }}><span style={{ color: '#94a3b8', flexShrink: 0 }}>{l}:</span><span style={{ fontWeight: 600, color: '#1e293b' }}>{v}</span></div>)}
                </div>
              ))}
            </div>
            <table className="table table-bordered" style={{ fontSize: 13, marginBottom: 16 }}>
              <thead style={{ background: '#f8fafc' }}><tr><th>Nội Dung Dịch Vụ</th><th className="text-center">Số Lượng</th><th className="text-end">Đơn Giá</th><th className="text-end">Thành Tiền</th></tr></thead>
              <tbody>
                <tr><td><strong>{selectedInvoice.roomName}</strong></td><td className="text-center">{selectedInvoice.nights} đêm</td><td className="text-end">{Math.round((selectedInvoice.totalAmount || 0) / (selectedInvoice.nights || 1)).toLocaleString('vi-VN')} đ</td><td className="text-end fw-semibold">{selectedInvoice.totalAmount?.toLocaleString('vi-VN')} đ</td></tr>
                <tr><td>Thuế VAT & Phí dịch vụ (10%)</td><td className="text-center">1 gói</td><td className="text-end">10%</td><td className="text-end">{Math.round((selectedInvoice.totalAmount || 0) * 0.1).toLocaleString('vi-VN')} đ</td></tr>
                <tr style={{ background: '#f8fafc' }}><td colSpan={3} style={{ textAlign: 'right', fontWeight: 700 }}>TỔNG CỘNG:</td><td style={{ textAlign: 'right', fontWeight: 900, color: '#dc2626', fontSize: 16 }}>{selectedInvoice.totalAmount?.toLocaleString('vi-VN')} đ</td></tr>
              </tbody>
            </table>
            <div style={{ background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 13 }}><span style={{ color: '#94a3b8' }}>Hình thức: </span><strong>{selectedInvoice.paymentMethod === 'pay_at_hotel' ? '💵 Tiền mặt tại quầy' : selectedInvoice.paymentMethod === 'vnpay' ? '💳 VNPAY QR' : '💳 Thẻ/Ví điện tử'}</strong></div>
              {selectedInvoice.paymentStatus === 'paid' || selectedInvoice.paymentMethod !== 'pay_at_hotel' ? <Badge bg="#dcfce7" color="#16a34a">✓ ĐÃ THANH TOÁN ĐỦ</Badge> : <Badge bg="#fef9c3" color="#92400e">⚠️ CHƯA THU TIỀN MẶT</Badge>}
            </div>
          </div>
          <div style={{ padding: '14px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button onClick={() => setSelectedInvoice(null)} style={{ background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: 10, padding: '10px 24px', fontWeight: 600, cursor: 'pointer' }}>Đóng</button>
            <button onClick={() => window.print()} style={{ background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 24px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}><Printer size={15} /> In Phiếu Thu</button>
          </div>
        </Modal>
      )}

      {/* ════ MODAL NHẬN PHÒNG LINH HOẠT & CẬP NHẬT LỊCH LƯU TRÚ ════ */}
      {checkinModalBooking && (
        <Modal onClose={() => setCheckinModalBooking(null)} title="Thủ Tục Nhận Phòng & Cập Nhật Lịch Lưu Trú">
          <div style={{ padding: '24px 28px' }}>
            <div style={{ background: '#f8fafc', borderRadius: 12, padding: 16, border: '1px solid #e2e8f0', marginBottom: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 13 }}>
                <div><span style={{ color: '#64748b' }}>Mã đặt phòng: </span><strong>{checkinModalBooking.bookingCode || checkinModalBooking.id}</strong></div>
                <div><span style={{ color: '#64748b' }}>Khách hàng: </span><strong>{checkinModalBooking.contactName}</strong> ({checkinModalBooking.contactPhone})</div>
                <div><span style={{ color: '#64748b' }}>Khách sạn & Phòng: </span><strong>{checkinModalBooking.hotelName}</strong> - {checkinModalBooking.roomName}</div>
                <div><span style={{ color: '#64748b' }}>Phương thức: </span><strong>{checkinModalBooking.paymentMethod === 'pay_at_hotel' ? 'Tiền mặt tại quầy' : 'VNPAY'}</strong></div>
                <div><span style={{ color: '#64748b' }}>Ngày nhận phòng ban đầu: </span><strong>{checkinModalBooking.checkInDate}</strong></div>
                <div><span style={{ color: '#64748b' }}>Ngày trả dự kiến: </span><strong>{checkinModalBooking.checkOutDate}</strong> ({checkinModalBooking.nights} đêm)</div>
              </div>
            </div>

            {/* Input chọn ngày nhận phòng thực tế */}
            <div style={{ marginBottom: 20 }}>
              <FL>Lựa chọn ngày nhận phòng thực tế của khách hàng</FL>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <input
                  type="date"
                  className="form-control"
                  style={{ maxWidth: 260, fontSize: 14, fontWeight: 600 }}
                  value={actualCheckInDate}
                  max={checkinModalBooking.checkOutDate}
                  onChange={(e) => setActualCheckInDate(e.target.value)}
                  required
                />
                <span style={{ fontSize: 12.5, color: '#64748b' }}>
                  (Áp dụng khi khách đến nhận phòng sớm hơn hoặc muộn hơn lịch đặt)
                </span>
              </div>
            </div>

            {/* Bảng tính toán lại số đêm & tổng tiền */}
            {(() => {
              const checkOutDate = checkinModalBooking.checkOutDate;
              let calcNights = checkinModalBooking.nights || 1;
              if (actualCheckInDate && checkOutDate && /^\d{4}-\d{2}-\d{2}$/.test(actualCheckInDate) && /^\d{4}-\d{2}-\d{2}$/.test(checkOutDate)) {
                const diffTime = new Date(checkOutDate).getTime() - new Date(actualCheckInDate).getTime();
                calcNights = Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)));
              }
              const origNights = checkinModalBooking.nights || 1;
              const pricePerNight = Math.round((checkinModalBooking.totalAmount || 0) / origNights);
              const newTotal = pricePerNight * calcNights;
              const diffAmount = newTotal - (checkinModalBooking.totalAmount || 0);

              return (
                <div style={{ background: '#eff6ff', borderRadius: 12, padding: 18, border: '1px solid #bfdbfe', marginBottom: 20 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#1e40af', marginBottom: 10 }}>
                    📊 Bảng Quyết Toán Tiền Phòng Theo Ngày Nhận Thực Tế
                  </div>
                  <table className="table table-sm table-bordered bg-white mb-2" style={{ fontSize: 13 }}>
                    <tbody>
                      <tr>
                        <td style={{ color: '#64748b', width: '40%' }}>Số đêm lưu trú thực tế:</td>
                        <td><strong>{calcNights} đêm</strong> {calcNights !== origNights && <span style={{ fontSize: 11.5, color: '#b45309' }}>(Ban đầu: {origNights} đêm)</span>}</td>
                      </tr>
                      <tr>
                        <td style={{ color: '#64748b' }}>Đơn giá mỗi đêm:</td>
                        <td><strong>{pricePerNight.toLocaleString('vi-VN')} đ</strong> / đêm</td>
                      </tr>
                      <tr>
                        <td style={{ color: '#64748b' }}>Tổng tiền ban đầu:</td>
                        <td style={{ color: '#64748b' }}>{checkinModalBooking.totalAmount?.toLocaleString('vi-VN')} đ</td>
                      </tr>
                      <tr style={{ background: '#f8fafc' }}>
                        <td style={{ fontWeight: 700, color: '#1e293b' }}>Tổng tiền hóa đơn mới:</td>
                        <td style={{ fontWeight: 800, fontSize: 15, color: '#2563eb' }}>{newTotal.toLocaleString('vi-VN')} đ</td>
                      </tr>
                    </tbody>
                  </table>

                  {diffAmount > 0 && (
                    <div style={{ fontSize: 12.5, color: '#92400e', background: '#fef3c7', padding: '8px 12px', borderRadius: 8, border: '1px solid #fde68a' }}>
                      ⚠️ Khách nhận phòng sớm hơn dự kiến ({calcNights - origNights} đêm thêm). Phụ thu lưu trú: <strong>+{diffAmount.toLocaleString('vi-VN')} đ</strong>.
                    </div>
                  )}
                  {diffAmount < 0 && (
                    <div style={{ fontSize: 12.5, color: '#1e40af', background: '#dbeafe', padding: '8px 12px', borderRadius: 8, border: '1px solid #bfdbfe' }}>
                      ℹ️ Khách nhận phòng trễ hơn dự kiến (giảm {origNights - calcNights} đêm). Số tiền giảm trừ: <strong>{diffAmount.toLocaleString('vi-VN')} đ</strong>.
                    </div>
                  )}
                  {diffAmount === 0 && (
                    <div style={{ fontSize: 12.5, color: '#166534' }}>
                      ✓ Khách nhận phòng đúng ngày dự kiến. Số tiền hóa đơn giữ nguyên.
                    </div>
                  )}
                </div>
              );
            })()}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                type="button"
                onClick={() => setCheckinModalBooking(null)}
                style={{ background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: 10, padding: '10px 22px', fontWeight: 600, cursor: 'pointer' }}
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                disabled={isSubmittingCheckin}
                onClick={handleConfirmCheckin}
                style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 24px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <LogIn size={16} />
                {isSubmittingCheckin ? 'Đang Xử Lý...' : 'Xác Nhận Nhận Phòng & Cập Nhật Lịch Lưu Trú'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ════ MODAL TRẢ PHÒNG LINH HOẠT & QUYẾT TOÁN HÓA ĐƠN ════ */}
      {checkoutModalBooking && (
        <Modal onClose={() => setCheckoutModalBooking(null)} title="Thủ Tục Trả Phòng & Quyết Toán Hóa Đơn">
          <div style={{ padding: '24px 28px' }}>
            <div style={{ background: '#f8fafc', borderRadius: 12, padding: 16, border: '1px solid #e2e8f0', marginBottom: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 13 }}>
                <div><span style={{ color: '#64748b' }}>Mã đặt phòng: </span><strong>{checkoutModalBooking.bookingCode || checkoutModalBooking.id}</strong></div>
                <div><span style={{ color: '#64748b' }}>Khách hàng: </span><strong>{checkoutModalBooking.contactName}</strong> ({checkoutModalBooking.contactPhone})</div>
                <div><span style={{ color: '#64748b' }}>Khách sạn & Phòng: </span><strong>{checkoutModalBooking.hotelName}</strong> - {checkoutModalBooking.roomName}</div>
                <div><span style={{ color: '#64748b' }}>Phương thức: </span><strong>{checkoutModalBooking.paymentMethod === 'pay_at_hotel' ? 'Tiền mặt tại quầy' : 'VNPAY'}</strong></div>
                <div><span style={{ color: '#64748b' }}>Ngày nhận phòng ban đầu: </span><strong>{checkoutModalBooking.checkInDate}</strong></div>
                <div><span style={{ color: '#64748b' }}>Ngày trả dự kiến: </span><strong>{checkoutModalBooking.checkOutDate}</strong> ({checkoutModalBooking.nights} đêm)</div>
              </div>
            </div>

            {/* Input chọn ngày trả phòng thực tế */}
            <div style={{ marginBottom: 20 }}>
              <FL>Lựa chọn ngày trả phòng thực tế của khách hàng</FL>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <input
                  type="date"
                  className="form-control"
                  style={{ maxWidth: 260, fontSize: 14, fontWeight: 600 }}
                  value={actualCheckOutDate}
                  min={checkoutModalBooking.checkInDate}
                  onChange={(e) => setActualCheckOutDate(e.target.value)}
                  required
                />
                <span style={{ fontSize: 12.5, color: '#64748b' }}>
                  (Hệ thống tự động tính toán lại số đêm và quyết toán hóa đơn)
                </span>
              </div>
            </div>

            {/* Bảng tính toán lại số đêm & tổng tiền */}
            {(() => {
              const checkInDate = checkoutModalBooking.checkInDate;
              let calcNights = checkoutModalBooking.nights || 1;
              if (checkInDate && actualCheckOutDate && /^\d{4}-\d{2}-\d{2}$/.test(checkInDate) && /^\d{4}-\d{2}-\d{2}$/.test(actualCheckOutDate)) {
                const diffTime = new Date(actualCheckOutDate).getTime() - new Date(checkInDate).getTime();
                calcNights = Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)));
              }
              const origNights = checkoutModalBooking.nights || 1;
              const pricePerNight = Math.round((checkoutModalBooking.totalAmount || 0) / origNights);
              const newTotal = pricePerNight * calcNights;
              const diffAmount = newTotal - (checkoutModalBooking.totalAmount || 0);

              return (
                <div style={{ background: '#f0fdf4', borderRadius: 12, padding: 18, border: '1px solid #bbf7d0', marginBottom: 20 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#166534', marginBottom: 10 }}>
                    📊 Bảng Quyết Toán Tiền Phòng Theo Ngày Trả Thực Tế
                  </div>
                  <table className="table table-sm table-bordered bg-white mb-2" style={{ fontSize: 13 }}>
                    <tbody>
                      <tr>
                        <td style={{ color: '#64748b', width: '40%' }}>Số đêm lưu trú thực tế:</td>
                        <td><strong>{calcNights} đêm</strong> {calcNights !== origNights && <span style={{ fontSize: 11.5, color: '#b45309' }}>(Ban đầu: {origNights} đêm)</span>}</td>
                      </tr>
                      <tr>
                        <td style={{ color: '#64748b' }}>Đơn giá mỗi đêm:</td>
                        <td><strong>{pricePerNight.toLocaleString('vi-VN')} đ</strong> / đêm</td>
                      </tr>
                      <tr>
                        <td style={{ color: '#64748b' }}>Tổng tiền ban đầu:</td>
                        <td style={{ color: '#64748b' }}>{checkoutModalBooking.totalAmount?.toLocaleString('vi-VN')} đ</td>
                      </tr>
                      <tr style={{ background: '#f8fafc' }}>
                        <td style={{ fontWeight: 700, color: '#1e293b' }}>Tổng tiền hóa đơn mới:</td>
                        <td style={{ fontWeight: 800, fontSize: 15, color: '#dc2626' }}>{newTotal.toLocaleString('vi-VN')} đ</td>
                      </tr>
                    </tbody>
                  </table>

                  {diffAmount > 0 && (
                    <div style={{ fontSize: 12.5, color: '#92400e', background: '#fef3c7', padding: '8px 12px', borderRadius: 8, border: '1px solid #fde68a' }}>
                      ⚠️ Khách ở thêm {calcNights - origNights} đêm so với dự kiến. Phát sinh phụ thu cần thu thêm: <strong>+{diffAmount.toLocaleString('vi-VN')} đ</strong>.
                    </div>
                  )}
                  {diffAmount < 0 && (
                    <div style={{ fontSize: 12.5, color: '#1e40af', background: '#dbeafe', padding: '8px 12px', borderRadius: 8, border: '1px solid #bfdbfe' }}>
                      ℹ️ Khách trả phòng sớm {origNights - calcNights} đêm. Số tiền giảm trừ: <strong>{diffAmount.toLocaleString('vi-VN')} đ</strong>.
                    </div>
                  )}
                  {diffAmount === 0 && (
                    <div style={{ fontSize: 12.5, color: '#166534' }}>
                      ✓ Khách trả phòng đúng kỳ hạn dự kiến. Số tiền hóa đơn giữ nguyên.
                    </div>
                  )}
                </div>
              );
            })()}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                type="button"
                onClick={() => setCheckoutModalBooking(null)}
                style={{ background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: 10, padding: '10px 22px', fontWeight: 600, cursor: 'pointer' }}
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                disabled={isSubmittingCheckout}
                onClick={handleConfirmCheckout}
                style={{ background: '#16a34a', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 24px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <CheckCircle2 size={16} />
                {isSubmittingCheckout ? 'Đang Xử Lý...' : 'Xác Nhận Trả Phòng & Cập Nhật Hóa Đơn'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      <style>{`@media print { body * { visibility: hidden !important; } #hotel-invoice-printable, #hotel-invoice-printable * { visibility: visible !important; } #hotel-invoice-printable { position: fixed !important; left: 0 !important; top: 0 !important; width: 100% !important; padding: 20px !important; background: white !important; max-height: none !important; overflow: visible !important; } }`}</style>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function KpiCard({ icon, iconBg, iconBgFull, value, label, sub, dark }) {
  return (
    <div style={{ background: dark ? '#f59e0b' : '#fff', borderRadius: 14, padding: '20px 20px 16px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div style={{ color: dark ? 'rgba(255,255,255,0.85)' : '#94a3b8', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 6 }}>{label}</div>
          <div style={{ color: dark ? '#fff' : '#1e293b', fontWeight: 800, fontSize: 26, lineHeight: 1 }}>{value}</div>
        </div>
        <div style={{ width: 46, height: 46, borderRadius: 12, background: iconBgFull ? 'rgba(255,255,255,0.25)' : iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{icon}</div>
      </div>
      <div>{sub}</div>
    </div>
  );
}
function ChartCard({ title, sub, children }) {
  return (
    <div style={{ background: '#fff', borderRadius: 14, padding: '20px 20px 12px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
      <div style={{ marginBottom: 14 }}><div style={{ fontWeight: 700, color: '#1e293b', fontSize: 15 }}>{title}</div><div style={{ color: '#94a3b8', fontSize: 12, marginTop: 2 }}>{sub}</div></div>
      {children}
    </div>
  );
}
function SectionCard({ title, sub, action, children }) {
  return (
    <div style={{ background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
      {(title || action) && <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div><div style={{ fontWeight: 700, color: '#1e293b', fontSize: 17 }}>{title}</div>{sub && <div style={{ color: '#94a3b8', fontSize: 13, marginTop: 4 }}>{sub}</div>}</div>
        {action}
      </div>}
      {children}
    </div>
  );
}
function Modal({ title, children, onClose, dark, action }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 740, maxHeight: '92vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
        <div style={{ padding: '16px 24px', background: dark ? '#1e293b' : '#fff', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 16, color: dark ? '#fff' : '#1e293b' }}>{title}</div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>{action}<button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: dark ? '#fff' : '#64748b', display: 'flex' }}><X size={22} /></button></div>
        </div>
        <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
function Th({ children, style }) { return <th style={{ color: '#64748b', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', border: 'none', paddingBottom: 12, whiteSpace: 'nowrap', ...style }}>{children}</th>; }
function Badge({ bg, color, children }) { return <span style={{ background: bg, color, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>{children}</span>; }
function StatusBadge({ status, isOverdueCheckout }) {
  if (isOverdueCheckout) return <Badge bg="#fee2e2" color="#b91c1c">⚠️ Quá hạn trả phòng</Badge>;
  const s = String(status || '').toUpperCase();
  if (s === 'CONFIRMED') return <Badge bg="#dcfce7" color="#16a34a">✓ Đã xác nhận</Badge>;
  if (s === 'PENDING') return <Badge bg="#fef9c3" color="#92400e">⏳ Chờ duyệt</Badge>;
  if (s === 'EXPIRED') return <Badge bg="#fffbeb" color="#b45309">⚠️ Đã quá hạn</Badge>;
  if (s === 'CHECKED_IN') return <Badge bg="#dbeafe" color="#1d4ed8">🏨 Đã nhận phòng</Badge>;
  if (s === 'COMPLETED') return <Badge bg="#ede9fe" color="#6d28d9">✓ Hoàn thành</Badge>;
  if (s === 'CANCELLED') return <Badge bg="#fee2e2" color="#dc2626">✕ Đã hủy</Badge>;
  return <Badge bg="#f1f5f9" color="#64748b">{status || 'Chưa rõ'}</Badge>;
}
function ActionBtn({ onClick, icon, children }) { return <button onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 20px', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>{icon}{children}</button>; }
function SmBtn({ color, onClick, icon, children }) { const colors = { blue: ['#eff6ff', '#3b82f6'], red: ['#fee2e2', '#dc2626'], green: ['#dcfce7', '#16a34a'], purple: ['#f5f3ff', '#7c3aed'] }; const [bg, fg] = colors[color] || colors.blue; return <button onClick={onClick} style={{ background: bg, color: fg, border: 'none', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>{icon}{children}</button>; }
function FL({ children }) { return <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: '#374151' }}>{children}</label>; }
function Empty({ text }) { return <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8', fontSize: 14 }}><BarChart2 size={40} style={{ opacity: 0.2, marginBottom: 12 }} /><br />{text}</div>; }
