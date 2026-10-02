import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../services/api';
import { uploadToCloudinary } from '../services/cloudinary';
import { MOCK_HOTELS } from '../data/mockData';
import {
  LayoutDashboard, Building, BookOpen, LogOut, Plus, Edit2,
  Trash2, Search, DollarSign, Users, Star,
  ShieldAlert, ExternalLink, Printer, Receipt, Banknote,
  CheckCircle2, BedDouble, BedSingle, Menu, X,
  BarChart2, CreditCard, Tag, MessageSquare, FileBarChart,
  Wifi, Coffee, Car, Dumbbell, Waves, UtensilsCrossed, Shield,
  TrendingUp, TrendingDown, Award, Clock, LogIn, LogOut as LogOutIcon,
  AlertCircle, UploadCloud
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
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [toastMsg, setToastMsg] = useState(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // ── Hotels state ──
  const [hotels, setHotels] = useState(() => {
    try { const s = localStorage.getItem('traveloka_custom_hotels'); return s ? JSON.parse(s) : MOCK_HOTELS; }
    catch { return MOCK_HOTELS; }
  });

  // ── Rooms state (FR-14) ──
  const [roomsList, setRoomsList] = useState(() => {
    const flat = hotels.flatMap(h => (h.rooms || []).map(r => ({ ...r, hotelId: h.id, hotelName: h.name })));
    return flat;
  });

  // ── Bookings state ──
  const [bookings, setBookings] = useState(() => {
    try { return JSON.parse(localStorage.getItem('traveloka_bookings') || '[]'); }
    catch { return []; }
  });

  // Tải dữ liệu thật từ Backend nếu Backend online và đã đăng nhập
  useEffect(() => {
    const fetchBackendData = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      try {
        const hotelRes = await apiFetch('/admin/hotels?size=50');
        if (hotelRes.ok) {
          const hotelData = await hotelRes.json();
          if (hotelData.result && hotelData.result.content && hotelData.result.content.length > 0) {
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
          if (roomData.result && roomData.result.length > 0) {
            setRoomsList(roomData.result);
          }
        }
      } catch (e) {
        console.warn('API rooms fetch fallback:', e);
      }
    };

    if (isAdmin) {
      fetchBackendData();
    }
  }, [isAdmin]);

  const updateHotels = (next) => { setHotels(next); localStorage.setItem('traveloka_custom_hotels', JSON.stringify(next)); };
  const updateBookings = (next) => { setBookings(next); localStorage.setItem('traveloka_bookings', JSON.stringify(next)); };

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
      alert('Vui lòng chọn tập tin hình ảnh hợp lệ (JPG, PNG, WEBP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Dung lượng hình ảnh tối đa là 5MB');
      return;
    }

    try {
      setIsUploadingHotelImage(true);
      showToast('Đang tải ảnh đại diện lên Cloudinary...');
      const uploadedUrl = await uploadToCloudinary(file, 'traveloka/hotels');
      setHotelForm(prev => ({ ...prev, thumbnailUrl: uploadedUrl }));
      showToast('Tải ảnh đại diện lên Cloudinary thành công!');
    } catch (err) {
      console.error('Lỗi khi tải ảnh lên Cloudinary:', err);
      // Fallback object URL cục bộ để người dùng vẫn xem trước được
      const localPreview = URL.createObjectURL(file);
      setHotelForm(prev => ({ ...prev, thumbnailUrl: localPreview }));
      showToast('Lỗi tải ảnh lên Cloudinary: ' + err.message);
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
          showToast('Lỗi cập nhật: ' + (errJson.message || errJson.errors || 'Cập nhật thất bại'));
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
          showToast('Lỗi thêm khách sạn: ' + (errJson.message || errJson.errors || 'Thêm thất bại'));
        }
      }
    } catch (err) {
      console.warn('Lỗi kết nối API khách sạn:', err);
      showToast('Lỗi kết nối máy chủ: ' + err.message);
    }
    setShowHotelModal(false);
  };

  const deleteHotel = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa khách sạn này khỏi hệ thống không?')) return;
    try {
      const res = await apiFetch(`/admin/hotels/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Đã xóa khách sạn khỏi máy chủ');
      }
    } catch (e) {
      console.warn('Delete hotel API error, updating state:', e);
    }
    updateHotels(hotels.filter(h => h.id !== id));
    setRoomsList(roomsList.filter(r => r.hotelId !== id));
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
      alert('Vui lòng chọn tập tin hình ảnh hợp lệ (JPG, PNG, WEBP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Dung lượng hình ảnh tối đa là 5MB');
      return;
    }

    try {
      setIsUploadingRoomImage(true);
      showToast('Đang tải ảnh loại phòng lên Cloudinary...');
      const uploadedUrl = await uploadToCloudinary(file, 'traveloka/rooms');
      setRoomForm(prev => ({ ...prev, imageUrl: uploadedUrl }));
      showToast('Tải ảnh loại phòng lên Cloudinary thành công!');
    } catch (err) {
      console.error('Lỗi khi tải ảnh phòng lên Cloudinary:', err);
      const localPreview = URL.createObjectURL(file);
      setRoomForm(prev => ({ ...prev, imageUrl: localPreview }));
      showToast('Lỗi tải ảnh lên Cloudinary: ' + err.message);
    } finally {
      setIsUploadingRoomImage(false);
      if (roomImageInputRef.current) {
        roomImageInputRef.current.value = '';
      }
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
          setRoomsList(roomsList.map(r => r.id === editingRoom.id ? json.result : r));
          showToast('Cập nhật loại phòng trên máy chủ thành công!');
        } else {
          setRoomsList(roomsList.map(r => r.id === editingRoom.id ? { ...r, ...roomForm, hotelName: targetHotel?.name } : r));
          showToast('Đã lưu thay đổi loại phòng');
        }
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
          setRoomsList([json.result, ...roomsList]);
          showToast('Tạo mới loại phòng trên máy chủ thành công!');
        } else {
          const newRoom = { id: `r-${Date.now()}`, ...roomForm, hotelName: targetHotel?.name };
          setRoomsList([newRoom, ...roomsList]);
          showToast('Đã tạo loại phòng mới');
        }
      }
    } catch (err) {
      console.warn('API room save fallback:', err);
      const newRoom = { id: `r-${Date.now()}`, ...roomForm, hotelName: targetHotel?.name };
      setRoomsList([newRoom, ...roomsList]);
      showToast('Đã lưu loại phòng');
    }
    setShowRoomModal(false);
  };

  const deleteRoom = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa loại phòng này không?')) return;
    try {
      const res = await apiFetch(`/admin/rooms/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Đã xóa loại phòng khỏi máy chủ');
      }
    } catch (e) {
      console.warn('Delete room error:', e);
    }
    setRoomsList(roomsList.filter(r => r.id !== id));
  };

  // ── Bookings logic ──
  const [bookingSearch, setBookingSearch] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const toggleBookingStatus = (id, status) => updateBookings(bookings.map(b => b.id === id ? { ...b, status } : b));
  const markAsPaid = (id) => { const next = bookings.map(b => b.id === id ? { ...b, paymentStatus: 'paid', status: 'confirmed', paidAt: new Date().toLocaleString('vi-VN') } : b); updateBookings(next); setSelectedInvoice(next.find(b => b.id === id)); };
  const filteredBookings = useMemo(() => {
    if (!bookingSearch.trim()) return bookings;
    const q = bookingSearch.toLowerCase();
    return bookings.filter(b => b.id?.toLowerCase().includes(q) || b.contactName?.toLowerCase().includes(q) || b.guestName?.toLowerCase().includes(q) || b.contactPhone?.toLowerCase().includes(q) || b.hotelName?.toLowerCase().includes(q));
  }, [bookings, bookingSearch]);

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
              <button 
                onClick={async () => {
                  try {
                    await login('admin@traveloka.vn', 'admin123');
                  } catch (e) {
                    alert('Lỗi đăng nhập: ' + e.message);
                  }
                }} 
                className="btn btn-primary btn-lg fw-bold rounded-pill shadow-sm"
              >
                ⚡ Đăng nhập nhanh với quyền Admin mẫu
              </button>
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
              {{ dashboard: 'Tổng Quan', hotels: 'Quản Lý Khách Sạn (FR-13)', rooms: 'Quản Lý Loại Phòng (FR-14)', amenities: 'Tiện Nghi Khách Sạn', bookings: 'Quản Lý Đặt Phòng & Lễ Tân', customers: 'Quản Lý Khách Hàng', payments: 'Quản Lý Thanh Toán', coupons: 'Quản Lý Khuyến Mãi', reviews: 'Đánh Giá Từ Khách Lưu Trú', reports: 'Báo Cáo & Thống Kê' }[activeTab]}
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

          {/* ══ TAB: LOẠI PHÒNG (FR-14 - CRUD ĐỘC LẬP) ══ */}
          {activeTab === 'rooms' && (
            <SectionCard title={`Quản Lý Danh Sách Loại Phòng (${roomsList.length} loại phòng)`} sub="Thêm mới, điều chỉnh giá, thay đổi trạng thái (Available/Booked/Maintenance) theo khách sạn"
              action={<ActionBtn onClick={openAddRoom} icon={<Plus size={16} />}>Thêm Loại Phòng Mới</ActionBtn>}>
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0" style={{ fontSize: 13 }}>
                  <thead style={{ background: '#f8fafc' }}>
                    <tr>{['Hình Ảnh', 'Tên Loại Phòng', 'Khách Sạn', 'Loại Giường', 'Diện Tích', 'Sức Chứa', 'Giá / Đêm', 'Trạng Thái', 'Thao Tác'].map(h => <Th key={h}>{h}</Th>)}</tr>
                  </thead>
                  <tbody>
                    {roomsList.length === 0 ? (
                      <tr><td colSpan={9}><Empty text="Chưa có loại phòng nào trong hệ thống" /></td></tr>
                    ) : (
                      roomsList.map(r => (
                        <tr key={r.id}>
                          <td><img src={r.imageUrl || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&auto=format&fit=crop&q=60'} alt={r.name} style={{ width: 72, height: 48, borderRadius: 8, objectFit: 'cover' }} /></td>
                          <td>
                            <div style={{ fontWeight: 600, color: '#1e293b', maxWidth: 190 }}>{r.name}</div>
                            <div style={{ fontSize: 11, color: '#94a3b8', maxWidth: 190 }}>{r.description ? r.description.substring(0, 50) + '...' : ''}</div>
                          </td>
                          <td><span style={{ background: '#eff6ff', color: '#3b82f6', padding: '3px 10px', borderRadius: 8, fontSize: 12 }}>{r.hotelName || 'Khách sạn'}</span></td>
                          <td style={{ fontSize: 12, color: '#374151' }}>{r.bedType || 'Giường đôi'}</td>
                          <td style={{ fontSize: 12 }}>{r.roomSize || '35 m²'}</td>
                          <td><span style={{ background: '#f1f5f9', padding: '3px 8px', borderRadius: 6, fontSize: 12 }}>{r.maxGuests || 2} khách</span></td>
                          <td style={{ fontWeight: 700, color: '#dc2626' }}>{Number(r.pricePerNight || 0).toLocaleString('vi-VN')} đ</td>
                          <td>
                            {r.status === 'AVAILABLE' && <Badge bg="#dcfce7" color="#16a34a">✓ Sẵn Sàng</Badge>}
                            {r.status === 'BOOKED' && <Badge bg="#fef9c3" color="#92400e">⏳ Có Khách</Badge>}
                            {r.status === 'MAINTENANCE' && <Badge bg="#fee2e2" color="#dc2626">🛠️ Bảo Trì</Badge>}
                            {!['AVAILABLE', 'BOOKED', 'MAINTENANCE'].includes(r.status) && <Badge bg="#eff6ff" color="#3b82f6">{r.status || 'AVAILABLE'}</Badge>}
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <SmBtn color="blue" onClick={() => openEditRoom(r)} icon={<Edit2 size={12} />}>Sửa</SmBtn>
                              <SmBtn color="red" onClick={() => deleteRoom(r.id)} icon={<Trash2 size={12} />}>Xóa</SmBtn>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </SectionCard>
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
          {activeTab === 'bookings' && (
            <SectionCard title="Quản Lý Đơn Đặt Phòng & Nghiệp Vụ Lễ Tân" sub="Tra cứu đặt phòng, thu tiền mặt tại quầy và xuất hóa đơn">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 16px', marginBottom: 20 }}>
                <Search size={16} color="#94a3b8" />
                <input type="text" placeholder="Tìm theo mã đơn, tên khách, số điện thoại, tên khách sạn..." value={bookingSearch} onChange={e => setBookingSearch(e.target.value)} style={{ border: 'none', background: 'transparent', outline: 'none', flex: 1, fontSize: 13, color: '#1e293b' }} />
                {bookingSearch && <button onClick={() => setBookingSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex' }}><X size={16} /></button>}
                <span style={{ fontSize: 12, color: '#94a3b8', flexShrink: 0 }}>Hiển thị {filteredBookings.length}/{bookings.length} đơn</span>
              </div>
              {filteredBookings.length === 0 ? <Empty text={bookingSearch ? `Không tìm thấy đơn khớp với "${bookingSearch}"` : 'Chưa có đơn đặt phòng nào'} /> : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0" style={{ fontSize: 12.5 }}>
                    <thead style={{ background: '#f8fafc' }}><tr>{['Mã Đơn', 'Khách Hàng', 'Khách Sạn & Phòng', 'Lưu Trú', 'Thanh Toán', 'Tổng Tiền', 'Trạng Thái', 'Thao Tác Lễ Tân'].map(h => <Th key={h}>{h}</Th>)}</tr></thead>
                    <tbody>{filteredBookings.map(b => (
                      <tr key={b.id}>
                        <td className="font-monospace fw-bold text-primary" style={{ fontSize: 11.5 }}>{b.id}</td>
                        <td><div style={{ fontWeight: 600, color: '#1e293b' }}>{b.contactName || b.guestName}</div><div style={{ fontSize: 11, color: '#94a3b8' }}>{b.contactPhone}</div><span style={{ background: b.isGuest ? '#f1f5f9' : '#eff6ff', color: b.isGuest ? '#64748b' : '#3b82f6', padding: '2px 7px', borderRadius: 6, fontSize: 10, fontWeight: 600 }}>{b.isGuest ? 'Vãng lai' : 'Thành viên'}</span></td>
                        <td><div style={{ fontWeight: 600, color: '#1e293b', maxWidth: 160 }}>{b.hotelName}</div><div style={{ fontSize: 11, color: '#94a3b8' }}>{b.roomName}</div></td>
                        <td><div style={{ fontSize: 11.5, color: '#374151' }}>{b.checkInDate} → {b.checkOutDate}</div><span style={{ background: '#f1f5f9', color: '#64748b', padding: '2px 7px', borderRadius: 6, fontSize: 10 }}>{b.nights} đêm</span></td>
                        <td>{b.paymentMethod === 'pay_at_hotel' ? (b.paymentStatus === 'paid' ? <Badge bg="#dcfce7" color="#16a34a">✓ Đã thu tiền mặt</Badge> : <Badge bg="#fef9c3" color="#92400e">⏳ Chờ thu tiền mặt</Badge>) : <Badge bg="#eff6ff" color="#3b82f6">✓ {b.paymentMethod === 'vnpay' ? 'VNPAY' : 'Thẻ/Ví'}</Badge>}</td>
                        <td style={{ fontWeight: 700, color: '#dc2626' }}>{b.totalAmount?.toLocaleString('vi-VN')} đ</td>
                        <td><StatusBadge status={b.status} /></td>
                        <td><div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {b.paymentMethod === 'pay_at_hotel' && b.paymentStatus !== 'paid' && b.status === 'confirmed' && <SmBtn color="green" onClick={() => markAsPaid(b.id)} icon={<Banknote size={12} />}>Thu tiền</SmBtn>}
                          <SmBtn color="blue" onClick={() => setSelectedInvoice(b)} icon={<Printer size={12} />}>Hóa đơn</SmBtn>
                          {b.status === 'confirmed' ? <SmBtn color="red" onClick={() => toggleBookingStatus(b.id, 'cancelled')}>Hủy</SmBtn> : <SmBtn color="green" onClick={() => toggleBookingStatus(b.id, 'confirmed')}>Khôi phục</SmBtn>}
                        </div></td>
                      </tr>
                    ))}</tbody>
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
                <input type="number" step="50000" className="form-control" value={roomForm.pricePerNight} onChange={e => setRoomForm({ ...roomForm, pricePerNight: e.target.value })} required />
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
              </div>
              <div>
                <FL>Diện tích phòng</FL>
                <input className="form-control" value={roomForm.roomSize} onChange={e => setRoomForm({ ...roomForm, roomSize: e.target.value })} placeholder="VD: 45 m²" />
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
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: 16, width: '90%', maxWidth: 720, maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '16px 24px', background: dark ? '#1e293b' : '#fff', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: 700, fontSize: 16, color: dark ? '#fff' : '#1e293b' }}>{title}</div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>{action}<button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: dark ? '#fff' : '#64748b', display: 'flex' }}><X size={22} /></button></div>
        </div>
        {children}
      </div>
    </div>
  );
}
function Th({ children }) { return <th style={{ color: '#64748b', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', border: 'none', paddingBottom: 12, whiteSpace: 'nowrap' }}>{children}</th>; }
function Badge({ bg, color, children }) { return <span style={{ background: bg, color, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>{children}</span>; }
function StatusBadge({ status }) { return status === 'confirmed' ? <Badge bg="#dcfce7" color="#16a34a">✓ Xác nhận</Badge> : <Badge bg="#fee2e2" color="#dc2626">✕ Đã hủy</Badge>; }
function ActionBtn({ onClick, icon, children }) { return <button onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 20px', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>{icon}{children}</button>; }
function SmBtn({ color, onClick, icon, children }) { const colors = { blue: ['#eff6ff', '#3b82f6'], red: ['#fee2e2', '#dc2626'], green: ['#dcfce7', '#16a34a'] }; const [bg, fg] = colors[color] || colors.blue; return <button onClick={onClick} style={{ background: bg, color: fg, border: 'none', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>{icon}{children}</button>; }
function FL({ children }) { return <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: '#374151' }}>{children}</label>; }
function Empty({ text }) { return <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8', fontSize: 14 }}><BarChart2 size={40} style={{ opacity: 0.2, marginBottom: 12 }} /><br />{text}</div>; }
