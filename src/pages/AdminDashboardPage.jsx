import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MOCK_HOTELS } from '../data/mockData';
import {
  LayoutDashboard, Building, BookOpen, LogOut, Plus, Edit2,
  Trash2, Search, DollarSign, Calendar, Users, Star,
  ShieldAlert, ExternalLink, Printer, Receipt, Banknote,
  CheckCircle2, BedDouble, BedSingle, ChevronRight, Menu, X,
  TrendingUp, ClipboardList, LogIn, LogOut as LogOutIcon,
  BarChart2, CreditCard, Tag, MessageSquare, FileBarChart
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Area, AreaChart
} from 'recharts';

// ─── Dữ liệu biểu đồ 7 ngày gần nhất (mô phỏng) ───────────────────────────
const last7Days = (() => {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push({
      ngay: d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
      doanhThu: Math.floor(Math.random() * 8000000) + 2000000,
      daDat: Math.floor(Math.random() * 6) + 1,
    });
  }
  return days;
})();

// ─── Tooltip tuỳ chỉnh cho biểu đồ Doanh thu ──────────────────────────────
const CustomRevenueTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '8px 14px', fontSize: 13 }}>
        <p style={{ margin: 0, color: '#6b7280' }}>{label}</p>
        <p style={{ margin: 0, fontWeight: 700, color: '#2563eb' }}>
          {payload[0].value.toLocaleString('vi-VN')} đ
        </p>
      </div>
    );
  }
  return null;
};

// ─── Các mục menu Sidebar ──────────────────────────────────────────────────
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
  { group: 'PHÂN TÍCH', items: [{ key: 'reports', label: 'Báo Cáo', icon: <FileBarChart size={17} /> }] },
];

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { user, isAdmin, login, logout } = useAuth();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // ── Dữ liệu khách sạn ──
  const [hotels, setHotels] = useState(() => {
    try {
      const saved = localStorage.getItem('traveloka_custom_hotels');
      return saved ? JSON.parse(saved) : MOCK_HOTELS;
    } catch { return MOCK_HOTELS; }
  });

  // ── Dữ liệu đơn đặt phòng ──
  const [bookings, setBookings] = useState(() => {
    try { return JSON.parse(localStorage.getItem('traveloka_bookings') || '[]'); }
    catch { return []; }
  });

  const updateHotelsState = (next) => {
    setHotels(next);
    localStorage.setItem('traveloka_custom_hotels', JSON.stringify(next));
  };
  const updateBookingsState = (next) => {
    setBookings(next);
    localStorage.setItem('traveloka_bookings', JSON.stringify(next));
  };

  // ── Modal khách sạn ──
  const [showHotelModal, setShowHotelModal] = useState(false);
  const [editingHotel, setEditingHotel] = useState(null);
  const [hotelForm, setHotelForm] = useState({
    name: '', city: 'Hồ Chí Minh', address: '',
    starRating: 5, pricePerNight: 1200000,
    description: '',
    thumbnailUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=60'
  });

  const handleOpenAddHotel = () => {
    setEditingHotel(null);
    setHotelForm({ name: '', city: 'Hồ Chí Minh', address: '', starRating: 5, pricePerNight: 1200000, description: '', thumbnailUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=60' });
    setShowHotelModal(true);
  };
  const handleOpenEditHotel = (h) => {
    setEditingHotel(h);
    setHotelForm({ name: h.name, city: h.city, address: h.address, starRating: h.starRating, pricePerNight: h.rooms[0]?.pricePerNight || 1000000, description: h.description, thumbnailUrl: h.thumbnailUrl });
    setShowHotelModal(true);
  };
  const handleSaveHotel = (e) => {
    e.preventDefault();
    if (editingHotel) {
      updateHotelsState(hotels.map(h => h.id === editingHotel.id ? {
        ...h, name: hotelForm.name, city: hotelForm.city, address: hotelForm.address,
        starRating: Number(hotelForm.starRating), description: hotelForm.description,
        thumbnailUrl: hotelForm.thumbnailUrl,
        rooms: [{ ...h.rooms[0], pricePerNight: Number(hotelForm.pricePerNight), name: `Phòng Tiêu Chuẩn - ${hotelForm.name}` }, ...h.rooms.slice(1)]
      } : h));
    } else {
      const newHotel = {
        id: `hotel-${Date.now()}`, name: hotelForm.name, city: hotelForm.city, address: hotelForm.address,
        starRating: Number(hotelForm.starRating), description: hotelForm.description, thumbnailUrl: hotelForm.thumbnailUrl,
        rooms: [{ id: `room-${Date.now()}`, name: `Phòng Tiêu Chuẩn - ${hotelForm.name}`, pricePerNight: Number(hotelForm.pricePerNight), maxOccupancy: 2, bedType: 'Giường đôi', size: 28, amenities: ['WiFi miễn phí', 'Điều hòa', 'TV màn hình phẳng'] }]
      };
      updateHotelsState([newHotel, ...hotels]);
    }
    setShowHotelModal(false);
  };
  const handleDeleteHotel = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa khách sạn này không?')) updateHotelsState(hotels.filter(h => h.id !== id));
  };

  // ── Quản lý đơn đặt phòng ──
  const [bookingSearch, setBookingSearch] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const handleToggleBookingStatus = (id, status) => updateBookingsState(bookings.map(b => b.id === id ? { ...b, status } : b));
  const handleMarkAsPaid = (id) => {
    const next = bookings.map(b => b.id === id ? { ...b, paymentStatus: 'paid', status: 'confirmed', paidAt: new Date().toLocaleString('vi-VN') } : b);
    updateBookingsState(next);
    setSelectedInvoice(next.find(b => b.id === id));
  };

  const filteredBookings = useMemo(() => {
    if (!bookingSearch.trim()) return bookings;
    const q = bookingSearch.toLowerCase();
    return bookings.filter(b =>
      b.id?.toLowerCase().includes(q) || b.contactName?.toLowerCase().includes(q) ||
      b.guestName?.toLowerCase().includes(q) || b.contactPhone?.toLowerCase().includes(q) ||
      b.hotelName?.toLowerCase().includes(q)
    );
  }, [bookings, bookingSearch]);

  // ── Thống kê KPI ──
  const stats = useMemo(() => {
    const today = new Date().toLocaleDateString('vi-VN');
    const totalRooms = hotels.reduce((s, h) => s + (h.rooms?.length || 1), 0);
    const occupiedRooms = bookings.filter(b => b.status === 'confirmed').length;
    const confirmedCount = bookings.filter(b => b.status === 'confirmed').length;
    const pendingCount = bookings.filter(b => !b.status || b.status === 'pending').length;
    const totalRevenue = bookings.filter(b => b.status === 'confirmed').reduce((s, b) => s + (b.totalAmount || 0), 0);
    const todayCheckins = bookings.filter(b => b.checkInDate === today).length;
    const todayCheckouts = bookings.filter(b => b.checkOutDate === today).length;
    const uniqueCustomers = new Set(bookings.map(b => b.contactPhone).filter(Boolean)).size;
    return { totalRooms, occupiedRooms, confirmedCount, pendingCount, totalRevenue, todayCheckins, todayCheckouts, uniqueCustomers, totalBookings: bookings.length };
  }, [hotels, bookings]);

  // ─────────────────────────────────────────────────────────────────────────
  // MÀN HÌNH BẢO VỆ (Chưa đăng nhập / Không có quyền Admin)
  // ─────────────────────────────────────────────────────────────────────────
  if (!isAdmin) {
    return (
      <div className="bg-light min-vh-100 py-5 page-top-spacing d-flex align-items-center">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-6 col-md-8 text-center">
              <div className="card border-0 shadow-sm rounded-4 p-5 bg-white">
                <div className="d-inline-flex p-3 bg-danger-subtle text-danger rounded-circle mb-3 mx-auto">
                  <ShieldAlert size={48} />
                </div>
                <h3 className="fw-bold text-dark mb-2">Khu Vực Quản Trị Viên</h3>
                <p className="text-secondary mb-4">Bạn cần đăng nhập bằng tài khoản có quyền Quản trị viên để truy cập vào hệ thống này.</p>
                <div className="d-flex flex-column gap-2">
                  <button onClick={() => login('admin@traveloka.vn', 'admin123')} className="btn btn-primary btn-lg fw-bold rounded-pill shadow-sm">
                    ⚡ Đăng nhập nhanh với quyền Admin mẫu
                  </button>
                  <Link to="/" className="btn btn-light rounded-pill py-2 text-secondary">Quay lại trang chủ</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // GIAO DIỆN ADMIN DASHBOARD CHÍNH
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>

      {/* ══════════════════ SIDEBAR ══════════════════ */}
      <aside style={{
        width: sidebarOpen ? 240 : 0,
        minWidth: sidebarOpen ? 240 : 0,
        background: '#1e293b',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.25s ease',
        overflow: 'hidden',
        flexShrink: 0,
        zIndex: 100,
      }}>
        {/* Logo */}
        <div style={{ padding: '20px 20px 12px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, background: '#f59e0b', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Building size={20} color="#fff" />
            </div>
            <div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 15, lineHeight: 1.2 }}>Traveloka</div>
              <div style={{ color: '#94a3b8', fontSize: 11 }}>Quản Trị Khách Sạn</div>
            </div>
          </div>
        </div>

        {/* Thông tin Admin */}
        <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
            {(user?.name || 'A').charAt(0).toUpperCase()}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ color: '#f1f5f9', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name || 'Quản trị viên'}</div>
            <div style={{ color: '#64748b', fontSize: 11 }}>Quản Trị Viên</div>
          </div>
        </div>

        {/* Menu điều hướng */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '10px 0' }}>
          {SIDEBAR_MENU.map(group => (
            <div key={group.group} style={{ marginBottom: 6 }}>
              <div style={{ padding: '8px 20px 4px', color: '#475569', fontSize: 10, fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                {group.group}
              </div>
              {group.items.map(item => (
                <button
                  key={item.key}
                  onClick={() => setActiveTab(item.key)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    width: '100%', padding: '9px 20px',
                    background: activeTab === item.key ? 'rgba(245,158,11,0.18)' : 'transparent',
                    border: 'none', cursor: 'pointer',
                    color: activeTab === item.key ? '#f59e0b' : '#94a3b8',
                    fontWeight: activeTab === item.key ? 700 : 400,
                    fontSize: 13.5, textAlign: 'left',
                    borderLeft: activeTab === item.key ? '3px solid #f59e0b' : '3px solid transparent',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { if (activeTab !== item.key) { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#e2e8f0'; } }}
                  onMouseLeave={e => { if (activeTab !== item.key) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; } }}
                >
                  <span style={{ opacity: activeTab === item.key ? 1 : 0.7 }}>{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>
          ))}
        </nav>

        {/* Quay lại trang web */}
        <div style={{ padding: '12px 0', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 20px', color: '#94a3b8', textDecoration: 'none', fontSize: 13.5 }}>
            <ExternalLink size={17} style={{ opacity: 0.7 }} /> Quay Lại Trang Web
          </Link>
        </div>
      </aside>

      {/* ══════════════════ PHẦN NỘI DUNG CHÍNH ══════════════════ */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#f8fafc' }}>

        {/* Thanh Header trên */}
        <header style={{
          background: '#fff', borderBottom: '1px solid #e2e8f0',
          padding: '0 24px', height: 60, display: 'flex',
          alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center' }}>
              <Menu size={22} />
            </button>
            <div>
              <span style={{ color: '#1e293b', fontWeight: 700, fontSize: 16 }}>
                {activeTab === 'dashboard' && 'Tổng Quan'}
                {activeTab === 'hotels' && 'Quản Lý Khách Sạn'}
                {activeTab === 'bookings' && 'Quản Lý Đặt Phòng'}
                {activeTab === 'customers' && 'Quản Lý Khách Hàng'}
                {activeTab === 'payments' && 'Quản Lý Thanh Toán'}
                {activeTab === 'rooms' && 'Quản Lý Loại Phòng'}
                {activeTab === 'amenities' && 'Tiện Nghi Khách Sạn'}
                {activeTab === 'coupons' && 'Quản Lý Khuyến Mãi'}
                {activeTab === 'reviews' && 'Đánh Giá Từ Khách'}
                {activeTab === 'reports' && 'Báo Cáo & Phân Tích'}
              </span>
            </div>
          </div>
          <button
            onClick={() => { logout(); navigate('/'); }}
            style={{ display: 'flex', alignItems: 'center', gap: 7, background: '#fee2e2', border: 'none', borderRadius: 20, padding: '7px 16px', color: '#dc2626', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}
          >
            <LogOut size={15} /> Đăng Xuất
          </button>
        </header>

        {/* Vùng nội dung cuộn */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>

          {/* ════════ TAB: TỔNG QUAN ════════ */}
          {activeTab === 'dashboard' && (
            <div>
              {/* Hàng 1 – 4 thẻ KPI trên */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 16 }}>
                <KpiCard
                  icon={<BedDouble size={26} color="#6366f1" />}
                  iconBg="#eef2ff"
                  value={stats.totalRooms}
                  label="Tổng Số Phòng"
                  sub={<span style={{ color: '#22c55e', fontWeight: 600, fontSize: 13 }}>{stats.totalRooms - stats.occupiedRooms} phòng trống</span>}
                />
                <KpiCard
                  icon={<BedSingle size={26} color="#f59e0b" />}
                  iconBg="#fffbeb"
                  value={stats.occupiedRooms}
                  label="Phòng Đã Lấp Đầy"
                  sub={<span style={{ color: '#f59e0b', fontWeight: 600, fontSize: 13 }}>Đang có khách</span>}
                />
                <KpiCard
                  icon={<BookOpen size={26} color="#3b82f6" />}
                  iconBg="#eff6ff"
                  value={stats.totalBookings}
                  label="Tổng Đơn Đặt Phòng"
                  sub={<span style={{ color: '#f59e0b', fontWeight: 600, fontSize: 13 }}>{stats.pendingCount} đang chờ xử lý</span>}
                />
                <KpiCard
                  icon={<CheckCircle2 size={26} color="#22c55e" />}
                  iconBg="#f0fdf4"
                  value={stats.confirmedCount}
                  label="Đơn Đã Xác Nhận"
                  sub={<span style={{ color: '#6b7280', fontSize: 13 }}>Đã hoàn tất đặt phòng</span>}
                />
              </div>

              {/* Hàng 2 – 4 thẻ KPI dưới */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
                <KpiCard
                  icon={<LogIn size={26} color="#8b5cf6" />}
                  iconBg="#f5f3ff"
                  value={stats.todayCheckins}
                  label="Nhận Phòng Hôm Nay"
                  sub={<span style={{ color: '#6b7280', fontSize: 13 }}>Khách Check-in</span>}
                />
                <KpiCard
                  icon={<LogOutIcon size={26} color="#ec4899" />}
                  iconBg="#fdf2f8"
                  value={stats.todayCheckouts}
                  label="Trả Phòng Hôm Nay"
                  sub={<span style={{ color: '#6b7280', fontSize: 13 }}>Khách Check-out</span>}
                />
                <KpiCard
                  icon={<Users size={26} color="#06b6d4" />}
                  iconBg="#ecfeff"
                  value={stats.uniqueCustomers}
                  label="Tổng Khách Hàng"
                  sub={<span style={{ color: '#6b7280', fontSize: 13 }}>Khách hàng đã đặt phòng</span>}
                />
                <KpiCard
                  icon={<DollarSign size={26} color="#fff" />}
                  iconBg="#f59e0b"
                  iconBgFull
                  value={stats.totalRevenue.toLocaleString('vi-VN') + ' đ'}
                  label="Tổng Doanh Thu"
                  sub={<span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>Từ đơn đã xác nhận</span>}
                  dark
                />
              </div>

              {/* Hàng biểu đồ */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                {/* Biểu đồ Doanh thu 7 ngày */}
                <div style={{ background: '#fff', borderRadius: 14, padding: '20px 20px 12px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontWeight: 700, color: '#1e293b', fontSize: 15 }}>Doanh Thu – 7 Ngày Gần Nhất</div>
                    <div style={{ color: '#94a3b8', fontSize: 12, marginTop: 2 }}>Tính theo đơn đặt phòng đã xác nhận</div>
                  </div>
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={last7Days} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorDT" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="ngay" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => (v / 1000000).toFixed(1) + 'tr'} />
                      <Tooltip content={<CustomRevenueTooltip />} />
                      <Area type="monotone" dataKey="doanhThu" stroke="#3b82f6" strokeWidth={2.5} fill="url(#colorDT)" dot={{ r: 3, fill: '#3b82f6', strokeWidth: 0 }} activeDot={{ r: 5 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Biểu đồ Đặt phòng 7 ngày */}
                <div style={{ background: '#fff', borderRadius: 14, padding: '20px 20px 12px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontWeight: 700, color: '#1e293b', fontSize: 15 }}>Đặt Phòng – 7 Ngày Gần Nhất</div>
                    <div style={{ color: '#94a3b8', fontSize: 12, marginTop: 2 }}>Tổng số đơn đặt phòng từng ngày</div>
                  </div>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={last7Days} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="ngay" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip formatter={(v) => [v + ' đơn', 'Đặt phòng']} labelStyle={{ color: '#64748b', fontSize: 12 }} contentStyle={{ borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 13 }} />
                      <Bar dataKey="daDat" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Bảng đơn mới nhất */}
              <div style={{ background: '#fff', borderRadius: 14, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', marginTop: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div style={{ fontWeight: 700, color: '#1e293b', fontSize: 15 }}>Đơn Đặt Phòng Mới Nhất</div>
                  <button onClick={() => setActiveTab('bookings')} style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                    Xem tất cả →
                  </button>
                </div>
                {bookings.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px 0', color: '#94a3b8', fontSize: 14 }}>Chưa có đơn đặt phòng nào</div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0" style={{ fontSize: 13 }}>
                      <thead style={{ background: '#f8fafc' }}>
                        <tr>
                          <th style={{ color: '#64748b', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', border: 'none', paddingBottom: 10 }}>Mã Đơn</th>
                          <th style={{ color: '#64748b', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', border: 'none' }}>Khách Hàng</th>
                          <th style={{ color: '#64748b', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', border: 'none' }}>Khách Sạn</th>
                          <th style={{ color: '#64748b', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', border: 'none' }}>Ngày Lưu Trú</th>
                          <th style={{ color: '#64748b', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', border: 'none' }}>Tổng Tiền</th>
                          <th style={{ color: '#64748b', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', border: 'none' }}>Trạng Thái</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookings.slice(0, 5).map(b => (
                          <tr key={b.id}>
                            <td className="fw-bold text-primary font-monospace" style={{ fontSize: 12 }}>{b.id}</td>
                            <td>
                              <div style={{ fontWeight: 600, color: '#1e293b' }}>{b.contactName || b.guestName}</div>
                              <div style={{ fontSize: 11, color: '#94a3b8' }}>{b.contactPhone}</div>
                            </td>
                            <td style={{ color: '#374151', fontWeight: 500 }}>{b.hotelName}</td>
                            <td style={{ color: '#64748b', fontSize: 12 }}>{b.checkInDate} → {b.checkOutDate}</td>
                            <td style={{ fontWeight: 700, color: '#dc2626' }}>{b.totalAmount?.toLocaleString('vi-VN')} đ</td>
                            <td>
                              {b.status === 'confirmed'
                                ? <span style={{ background: '#dcfce7', color: '#16a34a', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>✓ Xác nhận</span>
                                : <span style={{ background: '#fee2e2', color: '#dc2626', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>✕ Đã hủy</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ════════ TAB: QUẢN LÝ KHÁCH SẠN ════════ */}
          {activeTab === 'hotels' && (
            <div style={{ background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <div style={{ fontWeight: 700, color: '#1e293b', fontSize: 18 }}>Danh Sách Khách Sạn & Khu Nghỉ Dưỡng</div>
                  <div style={{ color: '#94a3b8', fontSize: 13, marginTop: 4 }}>Thêm mới, cập nhật hoặc xóa khách sạn khỏi hệ thống</div>
                </div>
                <button onClick={handleOpenAddHotel} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 20px', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                  <Plus size={18} /> Thêm Khách Sạn Mới
                </button>
              </div>
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0" style={{ fontSize: 13 }}>
                  <thead style={{ background: '#f8fafc' }}>
                    <tr>
                      {['Hình Ảnh', 'Tên Khách Sạn', 'Thành Phố', 'Hạng Sao', 'Giá Khởi Điểm', 'Số Phòng', 'Thao Tác'].map(h => (
                        <th key={h} style={{ color: '#64748b', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', border: 'none', paddingBottom: 12 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {hotels.map(h => (
                      <tr key={h.id}>
                        <td><img src={h.thumbnailUrl} alt={h.name} style={{ width: 64, height: 48, borderRadius: 8, objectFit: 'cover' }} /></td>
                        <td>
                          <div style={{ fontWeight: 600, color: '#1e293b' }}>{h.name}</div>
                          <div style={{ fontSize: 11, color: '#94a3b8' }}>{h.address}</div>
                        </td>
                        <td><span style={{ background: '#f1f5f9', color: '#475569', padding: '3px 10px', borderRadius: 8, fontSize: 12 }}>{h.city}</span></td>
                        <td style={{ color: '#f59e0b', fontWeight: 700 }}>{'★'.repeat(h.starRating)} {h.starRating} sao</td>
                        <td style={{ fontWeight: 700, color: '#dc2626' }}>{(h.rooms[0]?.pricePerNight || 0).toLocaleString('vi-VN')} đ</td>
                        <td>{h.rooms?.length || 1} phòng</td>
                        <td>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button onClick={() => handleOpenEditHotel(h)} style={{ background: '#eff6ff', color: '#3b82f6', border: 'none', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                              <Edit2 size={13} /> Sửa
                            </button>
                            <button onClick={() => handleDeleteHotel(h.id)} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                              <Trash2 size={13} /> Xóa
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ════════ TAB: QUẢN LÝ ĐẶT PHÒNG ════════ */}
          {activeTab === 'bookings' && (
            <div style={{ background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontWeight: 700, color: '#1e293b', fontSize: 18 }}>Quản Lý Đơn Đặt Phòng & Nghiệp Vụ Lễ Tân</div>
                <div style={{ color: '#94a3b8', fontSize: 13, marginTop: 4 }}>Tra cứu đặt phòng, thu tiền mặt tại quầy và xuất hóa đơn</div>
              </div>
              {/* Thanh tìm kiếm */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 16px', marginBottom: 20 }}>
                <Search size={16} color="#94a3b8" />
                <input
                  type="text"
                  placeholder="Tìm theo mã đơn, tên khách, số điện thoại, tên khách sạn..."
                  value={bookingSearch}
                  onChange={e => setBookingSearch(e.target.value)}
                  style={{ border: 'none', background: 'transparent', outline: 'none', flex: 1, fontSize: 13, color: '#1e293b' }}
                />
                {bookingSearch && <button onClick={() => setBookingSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex' }}><X size={16} /></button>}
              </div>
              {filteredBookings.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8', fontSize: 14 }}>
                  {bookingSearch ? `Không tìm thấy đơn khớp với "${bookingSearch}"` : 'Chưa có đơn đặt phòng nào'}
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0" style={{ fontSize: 12.5 }}>
                    <thead style={{ background: '#f8fafc' }}>
                      <tr>
                        {['Mã Đơn', 'Khách Hàng', 'Khách Sạn & Phòng', 'Lưu Trú', 'Thanh Toán', 'Tổng Tiền', 'Trạng Thái', 'Thao Tác'].map(h => (
                          <th key={h} style={{ color: '#64748b', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', border: 'none', paddingBottom: 12, whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBookings.map(b => (
                        <tr key={b.id}>
                          <td className="font-monospace fw-bold text-primary" style={{ fontSize: 11.5 }}>{b.id}</td>
                          <td>
                            <div style={{ fontWeight: 600, color: '#1e293b' }}>{b.contactName || b.guestName}</div>
                            <div style={{ fontSize: 11, color: '#94a3b8' }}>{b.contactPhone}</div>
                            <span style={{ background: b.isGuest ? '#f1f5f9' : '#eff6ff', color: b.isGuest ? '#64748b' : '#3b82f6', padding: '2px 7px', borderRadius: 6, fontSize: 10, fontWeight: 600 }}>
                              {b.isGuest ? 'Vãng lai' : 'Thành viên'}
                            </span>
                          </td>
                          <td>
                            <div style={{ fontWeight: 600, color: '#1e293b', maxWidth: 160 }}>{b.hotelName}</div>
                            <div style={{ fontSize: 11, color: '#94a3b8' }}>{b.roomName}</div>
                          </td>
                          <td>
                            <div style={{ fontSize: 11.5, color: '#374151' }}>{b.checkInDate} → {b.checkOutDate}</div>
                            <span style={{ background: '#f1f5f9', color: '#64748b', padding: '2px 7px', borderRadius: 6, fontSize: 10 }}>{b.nights} đêm</span>
                          </td>
                          <td>
                            {b.paymentMethod === 'pay_at_hotel' ? (
                              b.paymentStatus === 'paid'
                                ? <span style={{ background: '#dcfce7', color: '#16a34a', padding: '3px 8px', borderRadius: 8, fontSize: 11, display: 'flex', alignItems: 'center', gap: 4, width: 'fit-content' }}><CheckCircle2 size={11} /> Đã thu tiền mặt</span>
                                : <span style={{ background: '#fef9c3', color: '#92400e', padding: '3px 8px', borderRadius: 8, fontSize: 11, display: 'flex', alignItems: 'center', gap: 4, width: 'fit-content' }}><Banknote size={11} /> Chờ thu tiền mặt</span>
                            ) : (
                              <span style={{ background: '#eff6ff', color: '#3b82f6', padding: '3px 8px', borderRadius: 8, fontSize: 11, display: 'flex', alignItems: 'center', gap: 4, width: 'fit-content' }}><CheckCircle2 size={11} /> {b.paymentMethod === 'vnpay' ? 'VNPAY' : 'Thẻ/Ví'}</span>
                            )}
                          </td>
                          <td style={{ fontWeight: 700, color: '#dc2626' }}>{b.totalAmount?.toLocaleString('vi-VN')} đ</td>
                          <td>
                            {b.status === 'confirmed'
                              ? <span style={{ background: '#dcfce7', color: '#16a34a', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>✓ Xác nhận</span>
                              : <span style={{ background: '#fee2e2', color: '#dc2626', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>✕ Đã hủy</span>}
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                              {b.paymentMethod === 'pay_at_hotel' && b.paymentStatus !== 'paid' && b.status === 'confirmed' && (
                                <button onClick={() => handleMarkAsPaid(b.id)} style={{ background: '#dcfce7', color: '#16a34a', border: 'none', borderRadius: 7, padding: '5px 10px', fontSize: 11, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                                  <Banknote size={12} /> Thu tiền
                                </button>
                              )}
                              <button onClick={() => setSelectedInvoice(b)} style={{ background: '#eff6ff', color: '#3b82f6', border: 'none', borderRadius: 7, padding: '5px 10px', fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Printer size={12} /> Hóa đơn
                              </button>
                              {b.status === 'confirmed'
                                ? <button onClick={() => handleToggleBookingStatus(b.id, 'cancelled')} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 7, padding: '5px 10px', fontSize: 11, cursor: 'pointer' }}>Hủy</button>
                                : <button onClick={() => handleToggleBookingStatus(b.id, 'confirmed')} style={{ background: '#dcfce7', color: '#16a34a', border: 'none', borderRadius: 7, padding: '5px 10px', fontSize: 11, cursor: 'pointer' }}>Khôi phục</button>}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ════════ CÁC TAB ĐANG PHÁT TRIỂN ════════ */}
          {!['dashboard', 'hotels', 'bookings'].includes(activeTab) && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', color: '#94a3b8', gap: 12 }}>
              <BarChart2 size={56} style={{ opacity: 0.3 }} />
              <div style={{ fontSize: 18, fontWeight: 700, color: '#64748b' }}>Tính Năng Đang Phát Triển</div>
              <div style={{ fontSize: 14, textAlign: 'center', maxWidth: 340 }}>
                Chức năng này sẽ sớm được hoàn thiện trong các phiên bản tiếp theo. Vui lòng quay lại sau!
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ══════════════════ MODAL THÊM / SỬA KHÁCH SẠN ══════════════════ */}
      {showHotelModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 16, width: '90%', maxWidth: 680, maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: 17, color: '#1e293b' }}>
                {editingHotel ? 'Chỉnh Sửa Thông Tin Khách Sạn' : 'Thêm Khách Sạn Mới Vào Hệ Thống'}
              </div>
              <button onClick={() => setShowHotelModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex' }}><X size={22} /></button>
            </div>
            <form onSubmit={handleSaveHotel} style={{ overflowY: 'auto', flex: 1 }}>
              <div style={{ padding: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={{ gridColumn: '1 / 2' }}>
                  <FormLabel>Tên khách sạn *</FormLabel>
                  <input className="form-control" value={hotelForm.name} onChange={e => setHotelForm({ ...hotelForm, name: e.target.value })} required placeholder="VD: Khách Sạn New World Sài Gòn" />
                </div>
                <div>
                  <FormLabel>Thành phố *</FormLabel>
                  <select className="form-select" value={hotelForm.city} onChange={e => setHotelForm({ ...hotelForm, city: e.target.value })}>
                    {['Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Nha Trang', 'Đà Lạt', 'Phú Quốc'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <FormLabel>Địa chỉ chi tiết *</FormLabel>
                  <input className="form-control" value={hotelForm.address} onChange={e => setHotelForm({ ...hotelForm, address: e.target.value })} required placeholder="VD: 76 Lê Lai, Phường Bến Thành, Quận 1" />
                </div>
                <div>
                  <FormLabel>Hạng sao</FormLabel>
                  <select className="form-select" value={hotelForm.starRating} onChange={e => setHotelForm({ ...hotelForm, starRating: e.target.value })}>
                    {[5, 4, 3, 2].map(s => <option key={s} value={s}>{s} sao</option>)}
                  </select>
                </div>
                <div>
                  <FormLabel>Giá phòng khởi điểm / đêm (VNĐ) *</FormLabel>
                  <input type="number" step="50000" className="form-control" value={hotelForm.pricePerNight} onChange={e => setHotelForm({ ...hotelForm, pricePerNight: e.target.value })} required />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <FormLabel>Đường dẫn hình ảnh đại diện (URL)</FormLabel>
                  <input type="url" className="form-control" value={hotelForm.thumbnailUrl} onChange={e => setHotelForm({ ...hotelForm, thumbnailUrl: e.target.value })} placeholder="https://..." />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <FormLabel>Mô tả giới thiệu</FormLabel>
                  <textarea rows={3} className="form-control" value={hotelForm.description} onChange={e => setHotelForm({ ...hotelForm, description: e.target.value })} placeholder="Nêu các điểm nổi bật, vị trí, tiện ích..." />
                </div>
              </div>
              <div style={{ padding: '16px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button type="button" onClick={() => setShowHotelModal(false)} style={{ background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: 10, padding: '10px 24px', fontWeight: 600, cursor: 'pointer' }}>Hủy Bỏ</button>
                <button type="submit" style={{ background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 24px', fontWeight: 700, cursor: 'pointer' }}>
                  {editingHotel ? 'Lưu Thay Đổi' : 'Tạo Khách Sạn'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════ MODAL HÓA ĐƠN / PHIẾU THU ══════════════════ */}
      {selectedInvoice && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 16, width: '90%', maxWidth: 720, maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '16px 24px', background: '#1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#fff', fontWeight: 700, fontSize: 15 }}>
                <Receipt size={20} color="#f59e0b" /> Xem Trước Hóa Đơn Dịch Vụ & Phiếu Thu Lễ Tân
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => window.print()} style={{ background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Printer size={14} /> In Hóa Đơn
                </button>
                <button onClick={() => setSelectedInvoice(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', display: 'flex' }}><X size={22} /></button>
              </div>
            </div>
            <div id="hotel-invoice-printable" style={{ overflowY: 'auto', flex: 1, padding: '28px 32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #e2e8f0', paddingBottom: 20, marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 24, fontWeight: 900, color: '#2563eb' }}>Traveloka</div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: '#1e293b', marginTop: 4 }}>{selectedInvoice.hotelName}</div>
                  <div style={{ fontSize: 12, color: '#94a3b8' }}>{selectedInvoice.hotelAddress || 'Đối tác lưu trú Traveloka'}</div>
                  <div style={{ fontSize: 12, color: '#94a3b8' }}>Hotline: 1900 1234 • MST: 0102938475</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, fontSize: 18, color: '#1e293b', textTransform: 'uppercase' }}>Phiếu Thu Tiền</div>
                  <div style={{ fontSize: 12, color: '#94a3b8' }}>Hotel Guest Folio</div>
                  <div style={{ fontFamily: 'monospace', fontWeight: 700, color: '#2563eb', marginTop: 4 }}>Số: HD-{selectedInvoice.id}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>Ngày in: {new Date().toLocaleString('vi-VN')}</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                {[
                  { title: '👤 Thông Tin Khách Lưu Trú', rows: [['Họ và tên', selectedInvoice.contactName || selectedInvoice.guestName], ['Số điện thoại', selectedInvoice.contactPhone], ['Email', selectedInvoice.contactEmail], ['Phân loại', selectedInvoice.isGuest ? 'Khách vãng lai' : 'Thành viên thân thiết']] },
                  { title: '🏨 Chi Tiết Phòng & Lưu Trú', rows: [['Mã đặt chỗ', selectedInvoice.id], ['Hạng phòng', selectedInvoice.roomName], ['Kỳ lưu trú', `${selectedInvoice.checkInDate} → ${selectedInvoice.checkOutDate} (${selectedInvoice.nights} đêm)`], ['Số khách', `${selectedInvoice.guestCount || 2} người`]] }
                ].map(card => (
                  <div key={card.title} style={{ background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0', padding: 14 }}>
                    <div style={{ fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#475569', marginBottom: 10 }}>{card.title}</div>
                    {card.rows.map(([label, val]) => (
                      <div key={label} style={{ display: 'flex', gap: 8, fontSize: 13, marginBottom: 5 }}>
                        <span style={{ color: '#94a3b8', flexShrink: 0 }}>{label}:</span>
                        <span style={{ fontWeight: 600, color: '#1e293b' }}>{val}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              <table className="table table-bordered" style={{ fontSize: 13, marginBottom: 16 }}>
                <thead style={{ background: '#f8fafc' }}>
                  <tr>
                    <th style={{ width: '45%' }}>Nội Dung Dịch Vụ / Tiền Phòng</th>
                    <th className="text-center" style={{ width: '15%' }}>Số Lượng</th>
                    <th className="text-end" style={{ width: '20%' }}>Đơn Giá</th>
                    <th className="text-end" style={{ width: '20%' }}>Thành Tiền</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>{selectedInvoice.roomName}</strong><br /><span style={{ fontSize: 11, color: '#94a3b8' }}>{selectedInvoice.checkInDate} → {selectedInvoice.checkOutDate}</span></td>
                    <td className="text-center">{selectedInvoice.nights} đêm</td>
                    <td className="text-end">{Math.round((selectedInvoice.roomPrice || selectedInvoice.totalAmount) / (selectedInvoice.nights || 1)).toLocaleString('vi-VN')} đ</td>
                    <td className="text-end fw-semibold">{(selectedInvoice.roomPrice || selectedInvoice.totalAmount)?.toLocaleString('vi-VN')} đ</td>
                  </tr>
                  <tr>
                    <td>Thuế VAT & Phí dịch vụ (10%)</td>
                    <td className="text-center">1 gói</td>
                    <td className="text-end">10%</td>
                    <td className="text-end">{(selectedInvoice.taxAndFee || Math.round((selectedInvoice.totalAmount || 0) * 0.1))?.toLocaleString('vi-VN')} đ</td>
                  </tr>
                  {selectedInvoice.discountAmount > 0 && (
                    <tr style={{ color: '#16a34a' }}>
                      <td>Giảm giá từ mã khuyến mãi Traveloka</td>
                      <td className="text-center">1</td>
                      <td className="text-end">Voucher</td>
                      <td className="text-end fw-semibold">-{selectedInvoice.discountAmount?.toLocaleString('vi-VN')} đ</td>
                    </tr>
                  )}
                  <tr style={{ background: '#f8fafc' }}>
                    <td colSpan={3} style={{ textAlign: 'right', fontWeight: 700, fontSize: 14 }}>TỔNG CỘNG TIỀN THANH TOÁN:</td>
                    <td style={{ textAlign: 'right', fontWeight: 900, color: '#dc2626', fontSize: 16 }}>{selectedInvoice.totalAmount?.toLocaleString('vi-VN')} đ</td>
                  </tr>
                </tbody>
              </table>
              <div style={{ background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0', padding: '12px 16px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 13 }}>
                  <span style={{ color: '#94a3b8' }}>Hình thức thanh toán: </span>
                  <strong>{selectedInvoice.paymentMethod === 'pay_at_hotel' ? '💵 Tiền mặt tại quầy lễ tân' : selectedInvoice.paymentMethod === 'vnpay' ? '💳 Cổng VNPAY QR' : '💳 Thẻ tín dụng / Ví điện tử'}</strong>
                </div>
                {selectedInvoice.paymentStatus === 'paid' || selectedInvoice.paymentMethod !== 'pay_at_hotel'
                  ? <span style={{ background: '#dcfce7', color: '#16a34a', padding: '5px 14px', borderRadius: 20, fontWeight: 700, fontSize: 13 }}>✓ ĐÃ THANH TOÁN ĐỦ</span>
                  : <span style={{ background: '#fef9c3', color: '#92400e', padding: '5px 14px', borderRadius: 20, fontWeight: 700, fontSize: 13 }}>⚠️ CHƯA THU TIỀN MẶT</span>}
              </div>
            </div>
            <div style={{ padding: '14px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button onClick={() => setSelectedInvoice(null)} style={{ background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: 10, padding: '10px 24px', fontWeight: 600, cursor: 'pointer' }}>Đóng</button>
              <button onClick={() => window.print()} style={{ background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 24px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Printer size={15} /> In Phiếu Thu (Print)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSS in hóa đơn */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #hotel-invoice-printable, #hotel-invoice-printable * { visibility: visible !important; }
          #hotel-invoice-printable { position: fixed !important; left: 0 !important; top: 0 !important; width: 100% !important; margin: 0 !important; padding: 20px !important; background: white !important; max-height: none !important; overflow: visible !important; }
        }
      `}</style>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────
function KpiCard({ icon, iconBg, iconBgFull, value, label, sub, dark }) {
  return (
    <div style={{
      background: dark ? '#f59e0b' : '#fff',
      borderRadius: 14,
      padding: '20px 20px 16px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
      display: 'flex', flexDirection: 'column', gap: 10
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div style={{ color: dark ? 'rgba(255,255,255,0.85)' : '#94a3b8', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 6 }}>{label}</div>
          <div style={{ color: dark ? '#fff' : '#1e293b', fontWeight: 800, fontSize: 28, lineHeight: 1 }}>{value}</div>
        </div>
        <div style={{ width: 46, height: 46, borderRadius: 12, background: iconBgFull ? 'rgba(255,255,255,0.25)' : iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {icon}
        </div>
      </div>
      <div>{sub}</div>
    </div>
  );
}

function FormLabel({ children }) {
  return <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: '#374151' }}>{children}</label>;
}
