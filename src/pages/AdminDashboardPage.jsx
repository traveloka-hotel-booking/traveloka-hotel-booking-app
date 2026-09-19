import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MOCK_HOTELS } from '../data/mockData';
import { 
  LayoutDashboard, Building, BookOpen, LogOut, Plus, Edit2, 
  Trash2, CheckCircle, XCircle, Search, DollarSign, Calendar, 
  Users, Star, ShieldAlert, ArrowLeft, Home, Eye, ExternalLink,
  Printer, FileText, Receipt, Banknote, MapPin, Phone, Mail, CheckCircle2
} from 'lucide-react';

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { user, isAdmin, login, logout } = useAuth();

  // Tab đang hoạt động trong Admin: 'dashboard', 'hotels', 'bookings'
  const [activeTab, setActiveTab] = useState('dashboard');

  // State danh sách khách sạn quản trị (lưu vào localStorage để có hiệu lực toàn app)
  const [hotels, setHotels] = useState(() => {
    try {
      const saved = localStorage.getItem('traveloka_custom_hotels');
      return saved ? JSON.parse(saved) : MOCK_HOTELS;
    } catch (e) {
      return MOCK_HOTELS;
    }
  });

  // State danh sách đơn đặt phòng
  const [bookings, setBookings] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('traveloka_bookings') || '[]');
    } catch (e) {
      return [];
    }
  });

  // Đồng bộ khách sạn vào localStorage khi có thay đổi
  const updateHotelsState = (newHotels) => {
    setHotels(newHotels);
    localStorage.setItem('traveloka_custom_hotels', JSON.stringify(newHotels));
  };

  // Đồng bộ đơn đặt phòng
  const updateBookingsState = (newBookings) => {
    setBookings(newBookings);
    localStorage.setItem('traveloka_bookings', JSON.stringify(newBookings));
  };

  // State Modal Thêm / Sửa Khách Sạn
  const [showHotelModal, setShowHotelModal] = useState(false);
  const [editingHotel, setEditingHotel] = useState(null);
  const [hotelFormData, setHotelFormData] = useState({
    name: '',
    city: 'Hồ Chí Minh',
    address: '',
    starRating: 5,
    pricePerNight: 1200000,
    description: '',
    thumbnailUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=60'
  });

  // Mở modal thêm khách sạn
  const handleOpenAddHotel = () => {
    setEditingHotel(null);
    setHotelFormData({
      name: '',
      city: 'Hồ Chí Minh',
      address: '',
      starRating: 5,
      pricePerNight: 1200000,
      description: '',
      thumbnailUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=60'
    });
    setShowHotelModal(true);
  };

  // Mở modal sửa khách sạn
  const handleOpenEditHotel = (h) => {
    setEditingHotel(h);
    setHotelFormData({
      name: h.name,
      city: h.city,
      address: h.address,
      starRating: h.starRating,
      pricePerNight: h.rooms[0]?.pricePerNight || 1000000,
      description: h.description,
      thumbnailUrl: h.thumbnailUrl
    });
    setShowHotelModal(true);
  };

  // Lưu Khách Sạn (Thêm hoặc Sửa)
  const handleSaveHotel = (e) => {
    e.preventDefault();
    if (editingHotel) {
      // Sửa
      const updated = hotels.map(h => {
        if (h.id === editingHotel.id) {
          return {
            ...h,
            name: hotelFormData.name,
            city: hotelFormData.city,
            address: hotelFormData.address,
            starRating: Number(hotelFormData.starRating),
            description: hotelFormData.description,
            thumbnailUrl: hotelFormData.thumbnailUrl,
            rooms: [
              {
                ...h.rooms[0],
                pricePerNight: Number(hotelFormData.pricePerNight),
                name: `Phòng Tiêu Chuẩn - ${hotelFormData.name}`
              },
              ...(h.rooms.slice(1))
            ]
          };
        }
        return h;
      });
      updateHotelsState(updated);
    } else {
      // Thêm mới
      const newHotel = {
        id: Date.now(),
        name: hotelFormData.name,
        city: hotelFormData.city,
        address: hotelFormData.address,
        starRating: Number(hotelFormData.starRating),
        ratingScore: 9.0,
        ratingText: "Tuyệt vời",
        reviewCount: 1,
        thumbnailUrl: hotelFormData.thumbnailUrl,
        images: [hotelFormData.thumbnailUrl],
        description: hotelFormData.description,
        amenities: ["Wifi miễn phí", "Hồ bơi", "Bữa sáng miễn phí", "Lễ tân 24/7"],
        rooms: [
          {
            id: Date.now() + 1,
            name: `Phòng Deluxe Giường Đôi`,
            pricePerNight: Number(hotelFormData.pricePerNight),
            originalPrice: Number(hotelFormData.pricePerNight) * 1.2,
            maxGuests: 2,
            bedType: "1 Giường lớn (King)",
            roomSize: "35 m²",
            imageUrl: hotelFormData.thumbnailUrl,
            description: "Phòng nghỉ hiện đại với đầy đủ tiện nghi cao cấp.",
            amenities: ["Bao gồm bữa sáng", "Wifi miễn phí", "Điều hòa"],
            freeCancellation: true
          }
        ]
      };
      updateHotelsState([newHotel, ...hotels]);
    }
    setShowHotelModal(false);
  };

  // Xóa Khách Sạn
  const handleDeleteHotel = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa khách sạn này khỏi hệ thống không?')) {
      const updated = hotels.filter(h => h.id !== id);
      updateHotelsState(updated);
    }
  };

  // Thay đổi trạng thái đơn đặt phòng từ Admin (Xác nhận / Hủy)
  const handleToggleBookingStatus = (id, newStatus) => {
    const updated = bookings.map(b => {
      if (b.id === id) {
        return { ...b, status: newStatus };
      }
      return b;
    });
    updateBookingsState(updated);
  };

  // State tìm kiếm đơn đặt phòng
  const [bookingSearchQuery, setBookingSearchQuery] = useState('');

  // State Modal Hóa Đơn / Phiếu Thu Lễ Tân
  const [selectedInvoiceBooking, setSelectedInvoiceBooking] = useState(null);

  // Nghiệp vụ Lễ tân: Xác nhận đã thu tiền mặt tại quầy & Mở hóa đơn
  const handleMarkAsPaid = (id) => {
    const updated = bookings.map(b => {
      if (b.id === id) {
        return { 
          ...b, 
          paymentStatus: 'paid', 
          status: 'confirmed',
          paidAt: new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
        };
      }
      return b;
    });
    updateBookingsState(updated);
    
    // Tự động mở ngay Hóa đơn / Phiếu thu cho lễ tân in
    const target = updated.find(b => b.id === id);
    if (target) {
      setSelectedInvoiceBooking(target);
    }
  };

  // Mở modal hóa đơn để xem lại hoặc in lại
  const handleOpenInvoice = (b) => {
    setSelectedInvoiceBooking(b);
  };

  // Danh sách đơn được lọc theo từ khóa tìm kiếm của lễ tân
  const searchedBookings = useMemo(() => {
    if (!bookingSearchQuery.trim()) return bookings;
    const q = bookingSearchQuery.toLowerCase();
    return bookings.filter(b => 
      b.id?.toLowerCase().includes(q) ||
      b.contactName?.toLowerCase().includes(q) ||
      b.guestName?.toLowerCase().includes(q) ||
      b.contactPhone?.toLowerCase().includes(q) ||
      b.hotelName?.toLowerCase().includes(q)
    );
  }, [bookings, bookingSearchQuery]);

  // Tính toán thống kê KPI
  const stats = useMemo(() => {
    const totalRevenue = bookings
      .filter(b => b.status === 'confirmed')
      .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

    const totalRooms = hotels.reduce((sum, h) => sum + (h.rooms?.length || 1), 0);
    const confirmedCount = bookings.filter(b => b.status === 'confirmed').length;
    const cancelledCount = bookings.filter(b => b.status === 'cancelled').length;

    return {
      totalRevenue,
      totalHotels: hotels.length,
      totalRooms,
      totalBookings: bookings.length,
      confirmedCount,
      cancelledCount
    };
  }, [hotels, bookings]);

  // NẾU CHƯA ĐĂNG NHẬP HOẶC KHÔNG PHẢI ADMIN: HIỂN THỊ CẢNH BÁO & NÚT LOGIN 1-CLICK
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
                <h3 className="fw-bold text-dark mb-2">Khu Vực Quản Trị Viên (Admin)</h3>
                <p className="text-secondary mb-4">
                  Bạn cần đăng nhập bằng tài khoản có quyền Quản trị viên (`role: 'admin'`) để truy cập vào hệ thống này.
                </p>

                <div className="d-flex flex-column gap-2">
                  <button 
                    onClick={() => {
                      login('admin@traveloka.vn', 'admin123');
                    }}
                    className="btn btn-primary btn-lg fw-bold rounded-pill shadow-sm"
                  >
                    ⚡ Đăng nhập nhanh với quyền Admin mẫu
                  </button>
                  <Link to="/" className="btn btn-light rounded-pill py-2 text-secondary">
                    Quay lại trang chủ
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // GIAO DIỆN ADMIN CHÍNH THỨC
  return (
    <div className="min-vh-100 bg-light d-flex flex-column page-top-spacing">
      
      {/* Top Bar Admin */}
      <div className="bg-dark text-white py-2 px-4 d-flex justify-content-between align-items-center shadow-sm">
        <div className="d-flex align-items-center gap-3">
          <span className="badge bg-warning text-dark fw-bold px-3 py-1 rounded-pill">
            ADMIN PORTAL
          </span>
          <span className="small text-white-50 d-none d-md-inline">
            Hệ thống Quản trị Traveloka Hotel Booking
          </span>
        </div>

        <div className="d-flex align-items-center gap-3">
          <Link to="/" className="btn btn-outline-light btn-sm d-flex align-items-center gap-1 rounded-pill px-3">
            <ExternalLink size={14} /> Xem trang người dùng
          </Link>
          <button 
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="btn btn-danger btn-sm d-flex align-items-center gap-1 rounded-pill px-3"
          >
            <LogOut size={14} /> Đăng xuất
          </button>
        </div>
      </div>

      <div className="container-fluid py-4 px-lg-5 flex-grow-1">
        
        {/* Navigation Tabs */}
        <div className="card border-0 shadow-sm rounded-4 p-2 bg-white mb-4">
          <div className="d-flex gap-2 flex-wrap">
            <button 
              className={`btn rounded-pill px-4 fw-semibold d-flex align-items-center gap-2 ${activeTab === 'dashboard' ? 'btn-primary' : 'btn-light text-secondary'}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <LayoutDashboard size={18} /> Tổng Quan (Dashboard)
            </button>
            <button 
              className={`btn rounded-pill px-4 fw-semibold d-flex align-items-center gap-2 ${activeTab === 'hotels' ? 'btn-primary' : 'btn-light text-secondary'}`}
              onClick={() => setActiveTab('hotels')}
            >
              <Building size={18} /> Quản Lý Khách Sạn ({hotels.length})
            </button>
            <button 
              className={`btn rounded-pill px-4 fw-semibold d-flex align-items-center gap-2 ${activeTab === 'bookings' ? 'btn-primary' : 'btn-light text-secondary'}`}
              onClick={() => setActiveTab('bookings')}
            >
              <BookOpen size={18} /> Quản Lý Đơn Đặt Phòng ({bookings.length})
            </button>
          </div>
        </div>

        {/* ================= TAB 1: DASHBOARD TỔNG QUAN ================= */}
        {activeTab === 'dashboard' && (
          <div>
            {/* 4 Thẻ KPI */}
            <div className="row g-4 mb-4">
              
              {/* Doanh thu */}
              <div className="col-xl-3 col-md-6">
                <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <span className="text-secondary small fw-semibold text-uppercase">Tổng Doanh Thu</span>
                    <div className="p-2 bg-success-subtle text-success rounded-3">
                      <DollarSign size={22} />
                    </div>
                  </div>
                  <h3 className="fw-bold text-dark mb-1">
                    {stats.totalRevenue.toLocaleString('vi-VN')} đ
                  </h3>
                  <small className="text-success fw-semibold">
                    ✓ Từ {stats.confirmedCount} đơn phòng đã xác nhận
                  </small>
                </div>
              </div>

              {/* Tổng số đơn đặt phòng */}
              <div className="col-xl-3 col-md-6">
                <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <span className="text-secondary small fw-semibold text-uppercase">Đơn Đặt Phòng</span>
                    <div className="p-2 bg-primary-subtle text-primary rounded-3">
                      <BookOpen size={22} />
                    </div>
                  </div>
                  <h3 className="fw-bold text-dark mb-1">{stats.totalBookings} đơn</h3>
                  <small className="text-secondary">
                    {stats.confirmedCount} thành công, {stats.cancelledCount} đã hủy
                  </small>
                </div>
              </div>

              {/* Khách sạn quản lý */}
              <div className="col-xl-3 col-md-6">
                <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <span className="text-secondary small fw-semibold text-uppercase">Khách Sạn & Resort</span>
                    <div className="p-2 bg-info-subtle text-info rounded-3">
                      <Building size={22} />
                    </div>
                  </div>
                  <h3 className="fw-bold text-dark mb-1">{stats.totalHotels} cơ sở</h3>
                  <small className="text-secondary">
                    Tổng cộng {stats.totalRooms} loại phòng lưu trú
                  </small>
                </div>
              </div>

              {/* Đánh giá dịch vụ */}
              <div className="col-xl-3 col-md-6">
                <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <span className="text-secondary small fw-semibold text-uppercase">Đánh Giá Uy Tín</span>
                    <div className="p-2 bg-warning-subtle text-warning rounded-3">
                      <Star size={22} />
                    </div>
                  </div>
                  <h3 className="fw-bold text-dark mb-1">9.4 / 10</h3>
                  <small className="text-secondary">
                    Dựa trên 1.500+ phản hồi khách lưu trú
                  </small>
                </div>
              </div>

            </div>

            {/* Bảng đơn mới nhất trong dashboard */}
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold text-dark mb-0">Các Đơn Đặt Phòng Mới Nhất</h5>
                <button onClick={() => setActiveTab('bookings')} className="btn btn-sm btn-link text-primary text-decoration-none">
                  Xem tất cả đơn đặt phòng &gt;
                </button>
              </div>

              {bookings.length === 0 ? (
                <p className="text-secondary small py-3 mb-0">Chưa có đơn đặt phòng nào trên hệ thống.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light small text-secondary">
                      <tr>
                        <th>MÃ ĐƠN</th>
                        <th>KHÁCH HÀNG</th>
                        <th>KHÁCH SẠN</th>
                        <th>NGÀY NHẬN/TRẢ</th>
                        <th>TỔNG TIỀN</th>
                        <th>TRẠNG THÁI</th>
                      </tr>
                    </thead>
                    <tbody className="small">
                      {bookings.slice(0, 5).map(b => (
                        <tr key={b.id}>
                          <td className="fw-bold text-primary font-monospace">{b.id}</td>
                          <td>
                            <strong>{b.contactName || b.guestName}</strong>
                            <div className="text-secondary" style={{ fontSize: '11px' }}>{b.contactPhone}</div>
                          </td>
                          <td>{b.hotelName}</td>
                          <td>{b.checkInDate} ➔ {b.checkOutDate}</td>
                          <td className="fw-bold text-danger">{b.totalAmount?.toLocaleString('vi-VN')} đ</td>
                          <td>
                            {b.status === 'confirmed' ? (
                              <span className="badge bg-success-subtle text-success">Đã xác nhận</span>
                            ) : (
                              <span className="badge bg-danger-subtle text-danger">Đã hủy</span>
                            )}
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

        {/* ================= TAB 2: QUẢN LÝ KHÁCH SẠN (CRUD HOTELS) ================= */}
        {activeTab === 'hotels' && (
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
              <div>
                <h4 className="fw-bold text-dark mb-1">Danh Sách Khách Sạn & Khu Nghỉ Dưỡng</h4>
                <p className="text-secondary small mb-0">
                  Thêm mới, cập nhật giá, chỉnh sửa thông tin hoặc xóa khách sạn khỏi hệ thống.
                </p>
              </div>
              <button 
                onClick={handleOpenAddHotel} 
                className="btn btn-primary d-flex align-items-center gap-2 rounded-pill px-4 fw-bold shadow-sm"
              >
                <Plus size={18} /> Thêm Khách Sạn Mới
              </button>
            </div>

            {/* Bảng danh sách khách sạn */}
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light small text-secondary">
                  <tr>
                    <th>HÌNH ẢNH</th>
                    <th>TÊN KHÁCH SẠN</th>
                    <th>THÀNH PHỐ</th>
                    <th>HẠNG SAO</th>
                    <th>GIÁ KHỞI ĐIỂM</th>
                    <th>SỐ LOẠI PHÒNG</th>
                    <th className="text-end">THAO TÁC</th>
                  </tr>
                </thead>
                <tbody className="small">
                  {hotels.map(h => (
                    <tr key={h.id}>
                      <td style={{ width: '80px' }}>
                        <img 
                          src={h.thumbnailUrl} 
                          alt={h.name} 
                          className="rounded-3 object-fit-cover shadow-sm"
                          style={{ width: '64px', height: '48px' }}
                        />
                      </td>
                      <td>
                        <strong className="text-dark d-block">{h.name}</strong>
                        <span className="text-secondary" style={{ fontSize: '11px' }}>{h.address}</span>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border">{h.city}</span>
                      </td>
                      <td>
                        <span className="text-warning fw-bold">★ {h.starRating} sao</span>
                      </td>
                      <td className="fw-bold text-danger">
                        {(h.rooms[0]?.pricePerNight || 0).toLocaleString('vi-VN')} đ
                      </td>
                      <td>{h.rooms?.length || 1} phòng</td>
                      <td className="text-end">
                        <button 
                          onClick={() => handleOpenEditHotel(h)} 
                          className="btn btn-outline-primary btn-sm me-2 rounded-pill px-3"
                          title="Sửa thông tin"
                        >
                          <Edit2 size={14} /> Sửa
                        </button>
                        <button 
                          onClick={() => handleDeleteHotel(h.id)} 
                          className="btn btn-outline-danger btn-sm rounded-pill px-3"
                          title="Xóa khách sạn"
                        >
                          <Trash2 size={14} /> Xóa
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB 3: QUẢN LÝ ĐƠN ĐẶT PHÒNG (BOOKINGS) & NGHIỆP VỤ LỄ TÂN ================= */}
        {activeTab === 'bookings' && (
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
              <div>
                <h4 className="fw-bold text-dark mb-1">Quản Lý Đơn Đặt Phòng & Nghiệp Vụ Lễ Tân</h4>
                <p className="text-secondary small mb-0">
                  Tra cứu đặt phòng khi khách đến, thu tiền mặt tại quầy lễ tân và xuất Hóa đơn / Phiếu thu dịch vụ.
                </p>
              </div>
            </div>

            {/* Thanh tìm kiếm nhanh dành cho Lễ tân khi khách đến quầy */}
            <div className="row g-3 align-items-center mb-4">
              <div className="col-md-7 col-12">
                <div className="input-group shadow-sm rounded-pill overflow-hidden border">
                  <span className="input-group-text bg-white border-0 ps-3">
                    <Search size={18} className="text-primary" />
                  </span>
                  <input 
                    type="text" 
                    className="form-control border-0 py-2" 
                    placeholder="🔍 Lễ tân tra cứu: Nhập Mã đặt phòng (VD: TVLK-812147), Tên khách hoặc SĐT..." 
                    value={bookingSearchQuery}
                    onChange={(e) => setBookingSearchQuery(e.target.value)}
                  />
                  {bookingSearchQuery && (
                    <button 
                      className="btn btn-white border-0 text-secondary pe-3" 
                      type="button" 
                      onClick={() => setBookingSearchQuery('')}
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
              <div className="col-md-5 col-12 text-md-end text-secondary small">
                Hiển thị <strong>{searchedBookings.length}</strong> / {bookings.length} đơn đặt phòng
              </div>
            </div>

            {searchedBookings.length === 0 ? (
              <div className="text-center py-5 text-secondary border rounded-3 bg-light">
                <p className="mb-0">
                  {bookingSearchQuery 
                    ? `Không tìm thấy đơn đặt phòng nào khớp với từ khóa "${bookingSearchQuery}"` 
                    : "Chưa có đơn đặt phòng nào trong hệ thống."}
                </p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light small text-secondary">
                    <tr>
                      <th>MÃ ĐƠN</th>
                      <th>NGÀY ĐẶT</th>
                      <th>KHÁCH HÀNG</th>
                      <th>KHÁCH SẠN & PHÒNG</th>
                      <th>LƯU TRÚ</th>
                      <th>THANH TOÁN</th>
                      <th>TỔNG TIỀN</th>
                      <th>TRẠNG THÁI</th>
                      <th className="text-end" style={{ minWidth: '220px' }}>THAO TÁC LỄ TÂN</th>
                    </tr>
                  </thead>
                  <tbody className="small">
                    {searchedBookings.map(b => (
                      <tr key={b.id}>
                        <td className="fw-bold text-primary font-monospace">{b.id}</td>
                        <td className="text-secondary" style={{ fontSize: '11.5px' }}>{b.createdAt}</td>
                        <td>
                          <strong className="text-dark d-block">{b.contactName || b.guestName}</strong>
                          <span className="text-secondary d-block" style={{ fontSize: '11px' }}>{b.contactPhone}</span>
                          {b.isGuest ? (
                            <span className="badge bg-secondary-subtle text-secondary" style={{ fontSize: '10px' }}>Khách vãng lai</span>
                          ) : (
                            <span className="badge bg-primary-subtle text-primary" style={{ fontSize: '10px' }}>Thành viên</span>
                          )}
                        </td>
                        <td>
                          <div className="fw-semibold text-dark text-truncate" style={{ maxWidth: '160px' }}>{b.hotelName}</div>
                          <span className="text-secondary d-block text-truncate" style={{ maxWidth: '160px', fontSize: '11px' }}>{b.roomName}</span>
                        </td>
                        <td>
                          <div style={{ fontSize: '11.5px' }}>{b.checkInDate} ➔ {b.checkOutDate}</div>
                          <span className="badge bg-light text-secondary border" style={{ fontSize: '10px' }}>
                            {b.nights} đêm
                          </span>
                        </td>
                        <td>
                          {/* Hình thức thanh toán & Trạng thái thu tiền */}
                          {b.paymentMethod === 'pay_at_hotel' ? (
                            b.paymentStatus === 'paid' ? (
                              <span className="badge bg-success-subtle text-success border border-success-subtle py-1 px-2 rounded-pill d-inline-flex align-items-center gap-1" style={{ fontSize: '11px' }}>
                                <CheckCircle2 size={12} /> Đã thu tiền mặt
                              </span>
                            ) : (
                              <span className="badge bg-warning-subtle text-dark border border-warning-subtle py-1 px-2 rounded-pill d-inline-flex align-items-center gap-1" style={{ fontSize: '11px' }}>
                                <Banknote size={12} className="text-danger" /> Chờ thu tiền mặt
                              </span>
                            )
                          ) : (
                            <span className="badge bg-primary-subtle text-primary border border-primary-subtle py-1 px-2 rounded-pill d-inline-flex align-items-center gap-1" style={{ fontSize: '11px' }}>
                              <CheckCircle2 size={12} /> {b.paymentMethod === 'vnpay' ? 'VNPAY' : 'Thẻ/Ví'} (Đã trả)
                            </span>
                          )}
                        </td>
                        <td className="fw-bold text-danger fs-6">
                          {b.totalAmount?.toLocaleString('vi-VN')} đ
                        </td>
                        <td>
                          {b.status === 'confirmed' ? (
                            <span className="badge bg-success-subtle text-success py-1 px-2 rounded-pill fw-semibold" style={{ fontSize: '11px' }}>
                              ✓ Đã xác nhận
                            </span>
                          ) : (
                            <span className="badge bg-danger-subtle text-danger py-1 px-2 rounded-pill fw-semibold" style={{ fontSize: '11px' }}>
                              ✕ Đã hủy
                            </span>
                          )}
                        </td>
                        <td className="text-end">
                          <div className="d-flex align-items-center justify-content-end gap-1 flex-wrap">
                            {/* Nút Nghiệp vụ 1: Lễ tân bấm khi khách đưa tiền mặt */}
                            {b.paymentMethod === 'pay_at_hotel' && b.paymentStatus !== 'paid' && b.status === 'confirmed' && (
                              <button 
                                onClick={() => handleMarkAsPaid(b.id)} 
                                className="btn btn-success btn-sm rounded-pill px-2 py-1 fw-bold shadow-sm d-inline-flex align-items-center gap-1"
                                style={{ fontSize: '11.5px' }}
                                title="Bấm khi khách đã đưa tiền mặt tại quầy lễ tân"
                              >
                                <Banknote size={13} /> Thu tiền & In bill
                              </button>
                            )}

                            {/* Nút Nghiệp vụ 2: In Hóa Đơn / Phiếu Thu Dịch Vụ */}
                            <button 
                              onClick={() => handleOpenInvoice(b)} 
                              className="btn btn-outline-primary btn-sm rounded-pill px-2 py-1 d-inline-flex align-items-center gap-1"
                              style={{ fontSize: '11.5px' }}
                              title="Xem và in Phiếu thu / Hóa đơn"
                            >
                              <Printer size={13} /> Hóa đơn
                            </button>

                            {/* Nút Nghiệp vụ 3: Hủy hoặc Phục hồi đơn */}
                            {b.status === 'confirmed' ? (
                              <button 
                                onClick={() => handleToggleBookingStatus(b.id, 'cancelled')} 
                                className="btn btn-outline-danger btn-sm rounded-pill px-2 py-1"
                                style={{ fontSize: '11px' }}
                              >
                                Hủy
                              </button>
                            ) : (
                              <button 
                                onClick={() => handleToggleBookingStatus(b.id, 'confirmed')} 
                                className="btn btn-outline-success btn-sm rounded-pill px-2 py-1"
                                style={{ fontSize: '11px' }}
                              >
                                Khôi phục
                              </button>
                            )}
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

      </div>

      {/* ================= MODAL THÊM / SỬA KHÁCH SẠN ================= */}
      {showHotelModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold text-dark">
                  {editingHotel ? 'Chỉnh Sửa Khách Sạn' : 'Thêm Khách Sạn Mới Vào Hệ Thống'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowHotelModal(false)}></button>
              </div>
              <form onSubmit={handleSaveHotel}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    
                    {/* Tên khách sạn */}
                    <div className="col-md-8">
                      <label className="form-label small fw-semibold text-dark">Tên khách sạn *</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={hotelFormData.name}
                        onChange={(e) => setHotelFormData({ ...hotelFormData, name: e.target.value })}
                        required
                        placeholder="VD: Khách Sạn New World Sài Gòn"
                      />
                    </div>

                    {/* Thành phố */}
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold text-dark">Thành phố *</label>
                      <select 
                        className="form-select"
                        value={hotelFormData.city}
                        onChange={(e) => setHotelFormData({ ...hotelFormData, city: e.target.value })}
                      >
                        <option value="Hồ Chí Minh">Hồ Chí Minh</option>
                        <option value="Hà Nội">Hà Nội</option>
                        <option value="Đà Nẵng">Đà Nẵng</option>
                        <option value="Nha Trang">Nha Trang</option>
                        <option value="Đà Lạt">Đà Lạt</option>
                        <option value="Phú Quốc">Phú Quốc</option>
                      </select>
                    </div>

                    {/* Địa chỉ */}
                    <div className="col-12">
                      <label className="form-label small fw-semibold text-dark">Địa chỉ chi tiết *</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={hotelFormData.address}
                        onChange={(e) => setHotelFormData({ ...hotelFormData, address: e.target.value })}
                        required
                        placeholder="VD: 76 Lê Lai, Phường Bến Thành, Quận 1"
                      />
                    </div>

                    {/* Hạng sao */}
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-dark">Hạng sao (1-5 sao)</label>
                      <select 
                        className="form-select"
                        value={hotelFormData.starRating}
                        onChange={(e) => setHotelFormData({ ...hotelFormData, starRating: e.target.value })}
                      >
                        <option value={5}>5 sao</option>
                        <option value={4}>4 sao</option>
                        <option value={3}>3 sao</option>
                        <option value={2}>2 sao</option>
                      </select>
                    </div>

                    {/* Giá khởi điểm */}
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-dark">Giá phòng khởi điểm / đêm (VNĐ) *</label>
                      <input 
                        type="number" 
                        step="50000"
                        className="form-control" 
                        value={hotelFormData.pricePerNight}
                        onChange={(e) => setHotelFormData({ ...hotelFormData, pricePerNight: e.target.value })}
                        required
                      />
                    </div>

                    {/* URL Ảnh */}
                    <div className="col-12">
                      <label className="form-label small fw-semibold text-dark">Đường dẫn hình ảnh đại diện (URL)</label>
                      <input 
                        type="url" 
                        className="form-control" 
                        value={hotelFormData.thumbnailUrl}
                        onChange={(e) => setHotelFormData({ ...hotelFormData, thumbnailUrl: e.target.value })}
                        placeholder="https://..."
                      />
                    </div>

                    {/* Mô tả */}
                    <div className="col-12">
                      <label className="form-label small fw-semibold text-dark">Mô tả giới thiệu khách sạn</label>
                      <textarea 
                        rows="3" 
                        className="form-control" 
                        value={hotelFormData.description}
                        onChange={(e) => setHotelFormData({ ...hotelFormData, description: e.target.value })}
                        placeholder="Nêu các điểm nổi bật, vị trí, tiện ích..."
                      ></textarea>
                    </div>

                  </div>
                </div>
                <div className="modal-footer border-top">
                  <button type="button" className="btn btn-secondary rounded-pill px-4" onClick={() => setShowHotelModal(false)}>
                    Hủy bỏ
                  </button>
                  <button type="submit" className="btn btn-primary rounded-pill px-4 fw-bold">
                    {editingHotel ? 'Lưu Thay Đổi' : 'Tạo Khách Sạn'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL XUẤT HÓA ĐƠN / PHIẾU THU LỄ TÂN ================= */}
      {selectedInvoiceBooking && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.65)', zIndex: 1200 }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-4 border-0 shadow-lg overflow-hidden">
              
              {/* Action Bar trên modal */}
              <div className="p-3 bg-dark text-white d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-2">
                  <Receipt size={20} className="text-primary" />
                  <span className="fw-bold">Xem Trước Hóa Đơn Dịch Vụ & Phiếu Thu Lễ Tân</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <button 
                    type="button" 
                    onClick={() => window.print()}
                    className="btn btn-primary btn-sm rounded-pill px-3 fw-bold d-inline-flex align-items-center gap-1 shadow-sm"
                  >
                    <Printer size={15} /> In Hóa Đơn (Print / PDF)
                  </button>
                  <button 
                    type="button" 
                    className="btn-close btn-close-white" 
                    onClick={() => setSelectedInvoiceBooking(null)}
                  ></button>
                </div>
              </div>

              {/* Nội dung Hóa đơn chuẩn in */}
              <div className="modal-body p-4 p-md-5 bg-white" id="hotel-invoice-printable" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
                
                {/* Header hóa đơn */}
                <div className="border-bottom pb-4 mb-4">
                  <div className="row align-items-start">
                    <div className="col-8">
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <span className="fs-3 fw-bold text-primary">Traveloka</span>
                        <span className="badge bg-primary-subtle text-primary">Đối Tác Khách Sạn</span>
                      </div>
                      <h5 className="fw-bold text-dark mb-1">{selectedInvoiceBooking.hotelName}</h5>
                      <p className="text-secondary small mb-1">{selectedInvoiceBooking.hotelAddress || 'Địa chỉ đối tác lưu trú Traveloka'}</p>
                      <p className="text-secondary small mb-0">Hotline quầy lễ tân: 1900 1234 • MST: 0102938475</p>
                    </div>
                    <div className="col-4 text-end">
                      <div className="fw-bold text-uppercase text-dark fs-5">PHIẾU THU TIỀN</div>
                      <div className="text-secondary small mb-1">HOTEL GUEST FOLIO</div>
                      <div className="small font-monospace fw-bold text-primary">Số: HD-{selectedInvoiceBooking.id}</div>
                      <div className="text-secondary" style={{ fontSize: '11px' }}>
                        Ngày in: {new Date().toLocaleDateString('vi-VN')} {new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Thông tin Khách hàng & Kỳ lưu trú */}
                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <div className="p-3 bg-light rounded-3 border h-100">
                      <h6 className="fw-bold text-dark mb-2 small text-uppercase" style={{ letterSpacing: '0.5px' }}>
                        👤 Thông Tin Khách Lưu Trú
                      </h6>
                      <div className="small text-secondary mb-1">
                        Họ và tên: <strong className="text-dark">{selectedInvoiceBooking.contactName || selectedInvoiceBooking.guestName}</strong>
                      </div>
                      <div className="small text-secondary mb-1">
                        Số điện thoại: <strong className="text-dark">{selectedInvoiceBooking.contactPhone}</strong>
                      </div>
                      <div className="small text-secondary mb-1">
                        Email nhận vé: <strong className="text-dark">{selectedInvoiceBooking.contactEmail}</strong>
                      </div>
                      <div className="small text-secondary">
                        Phân loại: <span className="badge bg-white border text-dark">{selectedInvoiceBooking.isGuest ? 'Khách vãng lai' : 'Thành viên thân thiết'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="p-3 bg-light rounded-3 border h-100">
                      <h6 className="fw-bold text-dark mb-2 small text-uppercase" style={{ letterSpacing: '0.5px' }}>
                        🏨 Chi Tiết Phòng & Lưu Trú
                      </h6>
                      <div className="small text-secondary mb-1">
                        Mã đặt chỗ: <strong className="text-primary font-monospace">{selectedInvoiceBooking.id}</strong>
                      </div>
                      <div className="small text-secondary mb-1">
                        Hạng phòng: <strong className="text-dark">{selectedInvoiceBooking.roomName}</strong>
                      </div>
                      <div className="small text-secondary mb-1">
                        Kỳ lưu trú: <strong className="text-dark">{selectedInvoiceBooking.checkInDate}</strong> ➔ <strong className="text-dark">{selectedInvoiceBooking.checkOutDate}</strong> ({selectedInvoiceBooking.nights} đêm)
                      </div>
                      <div className="small text-secondary">
                        Số lượng khách: <strong className="text-dark">{selectedInvoiceBooking.guestCount || 2} người</strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bảng kê chi phí thanh toán */}
                <div className="table-responsive mb-4">
                  <table className="table table-bordered align-middle mb-0">
                    <thead className="table-light small text-secondary">
                      <tr>
                        <th style={{ width: '45%' }}>NỘI DUNG DỊCH VỤ / TIỀN PHÒNG</th>
                        <th className="text-center" style={{ width: '15%' }}>SỐ LƯỢNG</th>
                        <th className="text-end" style={{ width: '20%' }}>ĐƠN GIÁ</th>
                        <th className="text-end" style={{ width: '20%' }}>THÀNH TIỀN</th>
                      </tr>
                    </thead>
                    <tbody className="small">
                      <tr>
                        <td>
                          <strong className="text-dark d-block">Tiền thuê phòng: {selectedInvoiceBooking.roomName}</strong>
                          <span className="text-secondary" style={{ fontSize: '11px' }}>
                            Áp dụng từ {selectedInvoiceBooking.checkInDate} đến {selectedInvoiceBooking.checkOutDate} ({selectedInvoiceBooking.nights} đêm)
                          </span>
                        </td>
                        <td className="text-center">{selectedInvoiceBooking.nights} đêm</td>
                        <td className="text-end">
                          {Math.round((selectedInvoiceBooking.roomPrice || selectedInvoiceBooking.totalAmount) / (selectedInvoiceBooking.nights || 1)).toLocaleString('vi-VN')} đ
                        </td>
                        <td className="text-end fw-semibold">
                          {(selectedInvoiceBooking.roomPrice || selectedInvoiceBooking.totalAmount)?.toLocaleString('vi-VN')} đ
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <span className="text-dark">Thuế giá trị gia tăng VAT & Phí dịch vụ (10%)</span>
                        </td>
                        <td className="text-center">1 gói</td>
                        <td className="text-end">10%</td>
                        <td className="text-end">
                          {(selectedInvoiceBooking.taxAndFee || Math.round((selectedInvoiceBooking.totalAmount || 0) * 0.1))?.toLocaleString('vi-VN')} đ
                        </td>
                      </tr>
                      {selectedInvoiceBooking.discountAmount > 0 && (
                        <tr className="text-success">
                          <td>
                            <span>Giảm giá từ mã khuyến mãi Traveloka</span>
                          </td>
                          <td className="text-center">1</td>
                          <td className="text-end">Voucher</td>
                          <td className="text-end fw-semibold">
                            -{selectedInvoiceBooking.discountAmount?.toLocaleString('vi-VN')} đ
                          </td>
                        </tr>
                      )}
                      <tr className="table-light">
                        <td colSpan={3} className="text-end fw-bold text-dark fs-6">
                          TỔNG CỘNG TIỀN THANH TOÁN (TOTAL):
                        </td>
                        <td className="text-end fw-bold text-danger fs-5">
                          {selectedInvoiceBooking.totalAmount?.toLocaleString('vi-VN')} đ
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Thông tin hình thức và trạng thái thu tiền */}
                <div className="p-3 bg-light rounded-3 border mb-4">
                  <div className="row g-2 small">
                    <div className="col-md-7">
                      <span className="text-secondary">Hình thức thanh toán: </span>
                      <strong className="text-dark">
                        {selectedInvoiceBooking.paymentMethod === 'pay_at_hotel' 
                          ? '💵 TIỀN MẶT TẠI QUẦY LỄ TÂN (CASH ON ARRIVAL)' 
                          : (selectedInvoiceBooking.paymentMethod === 'vnpay' ? '💳 CỔNG VNPAY QR' : '💳 THẺ TÍN DỤNG / VÍ ĐIỆN TỬ')}
                      </strong>
                    </div>
                    <div className="col-md-5 text-md-end">
                      <span className="text-secondary">Trạng thái: </span>
                      {selectedInvoiceBooking.paymentStatus === 'paid' || selectedInvoiceBooking.paymentMethod !== 'pay_at_hotel' ? (
                        <span className="badge bg-success fs-6 py-1 px-3 rounded-pill fw-bold">
                          ✓ ĐÃ THANH TOÁN ĐỦ
                        </span>
                      ) : (
                        <span className="badge bg-warning text-dark fs-6 py-1 px-3 rounded-pill fw-bold">
                          ⚠️ CHƯA THU TIỀN MẶT
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Khu vực ký xác nhận */}
                <div className="row text-center mt-4 pt-3 border-top">
                  <div className="col-6">
                    <strong className="d-block text-dark small text-uppercase">Khách Hàng Lưu Trú</strong>
                    <small className="text-secondary" style={{ fontSize: '11px' }}>(Ký và ghi rõ họ tên)</small>
                    <div style={{ height: '60px' }}></div>
                    <div className="fw-semibold text-dark small">{selectedInvoiceBooking.contactName || selectedInvoiceBooking.guestName}</div>
                  </div>
                  <div className="col-6">
                    <strong className="d-block text-dark small text-uppercase">Nhân Viên Lễ Tân / Thu Ngân</strong>
                    <small className="text-secondary" style={{ fontSize: '11px' }}>(Ký, đóng dấu xác nhận)</small>
                    <div style={{ height: '60px' }} className="d-flex align-items-center justify-content-center">
                      <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-2 p-2 px-3 text-uppercase font-monospace" style={{ transform: 'rotate(-5deg)' }}>
                        ✓ ĐÃ THU TIỀN MẶT
                      </span>
                    </div>
                    <div className="fw-semibold text-dark small">{user?.name || 'Lễ Tân Khách Sạn'}</div>
                  </div>
                </div>

              </div>

              <div className="modal-footer bg-light border-top p-3 d-flex justify-content-between">
                <button 
                  type="button" 
                  className="btn btn-secondary btn-sm rounded-pill px-4" 
                  onClick={() => setSelectedInvoiceBooking(null)}
                >
                  Đóng
                </button>
                <button 
                  type="button" 
                  onClick={() => window.print()}
                  className="btn btn-primary btn-sm rounded-pill px-4 fw-bold d-inline-flex align-items-center gap-1 shadow-sm"
                >
                  <Printer size={15} /> In Phiếu Thu Này (Print)
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* CSS dành riêng khi in hóa đơn */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #hotel-invoice-printable, #hotel-invoice-printable * {
            visibility: visible !important;
          }
          #hotel-invoice-printable {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 20px !important;
            background: white !important;
            box-shadow: none !important;
            max-height: none !important;
            overflow: visible !important;
          }
        }
      `}</style>

    </div>
  );
}
