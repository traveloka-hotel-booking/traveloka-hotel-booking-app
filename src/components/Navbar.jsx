import React from 'react';
import { Link } from 'react-router-dom';
import { Hotel, User, LogIn } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary sticky-top shadow-sm py-3">
      <div className="container">
        <Link className="navbar-brand fw-bold d-flex align-items-center gap-2 fs-4" to="/">
          <Hotel size={28} />
          <span>Traveloka Booking</span>
        </Link>
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navContent"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-4">
            <li className="nav-item">
              <Link className="nav-link active fw-semibold" to="/">Trang chủ</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link fw-semibold" to="/hotels">Khách sạn</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link fw-semibold" to="/my-bookings">Chuyến đi của tôi</Link>
            </li>
          </ul>
          <div className="d-flex gap-2">
            <Link to="/login" className="btn btn-light text-primary fw-semibold d-flex align-items-center gap-1">
              <LogIn size={18} /> Đăng nhập
            </Link>
            <Link to="/register" className="btn btn-outline-light fw-semibold d-flex align-items-center gap-1">
              <User size={18} /> Đăng ký
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}