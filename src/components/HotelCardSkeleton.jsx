import React from 'react';

/**
 * Skeleton UI cho danh sách thẻ khách sạn (HomePage & HotelsPage).
 * Giúp hiển thị khung giao diện tức thì (0 giây) trong lúc chờ API hoặc khi máy chủ Render đang khởi động (Cold Start).
 */
export default function HotelCardSkeleton({ count = 4, showColdStartHint = false }) {
  return (
    <div className="d-flex flex-column gap-3" aria-busy="true" aria-label="Đang tải danh sách khách sạn">
      {showColdStartHint && (
        <div className="alert alert-primary border-0 shadow-sm rounded-3 d-flex align-items-center gap-3 py-2 px-3 mb-1">
          <div className="spinner-border spinner-border-sm text-primary flex-shrink-0" role="status" />
          <div className="small">
            <strong className="d-block">Đang kết nối máy chủ và đồng bộ dữ liệu khách sạn mới nhất...</strong>
            <span className="text-secondary" style={{ fontSize: '12px' }}>
              Lần truy cập đầu tiên có thể mất vài giây để máy chủ đám mây khởi động. Các lần tiếp theo sẽ hiển thị tức thì.
            </span>
          </div>
        </div>
      )}

      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="card border-0 shadow-sm rounded-3 overflow-hidden bg-white">
          <div className="row g-0">
            {/* Cột trái: Skeleton 1 ảnh lớn + 3 ảnh nhỏ */}
            <div className="col-lg-4 col-md-5 p-2">
              <div
                className="skeleton-shimmer rounded-2 mb-1 w-100"
                style={{ height: '180px' }}
              />
              <div className="row g-1">
                <div className="col-4">
                  <div className="skeleton-shimmer rounded-1 w-100" style={{ height: '55px' }} />
                </div>
                <div className="col-4">
                  <div className="skeleton-shimmer rounded-1 w-100" style={{ height: '55px' }} />
                </div>
                <div className="col-4">
                  <div className="skeleton-shimmer rounded-1 w-100" style={{ height: '55px' }} />
                </div>
              </div>
            </div>

            {/* Cột giữa: Skeleton thông tin khách sạn */}
            <div className="col-lg-5 col-md-7 p-3 d-flex flex-column justify-content-between border-end">
              <div>
                <div className="skeleton-shimmer rounded-2 mb-2" style={{ width: '75%', height: '22px' }} />
                <div className="skeleton-shimmer rounded-2 mb-2" style={{ width: '110px', height: '16px' }} />
                <div className="skeleton-shimmer rounded-2 mb-3" style={{ width: '90%', height: '16px' }} />
                <div className="d-flex gap-2 mb-2">
                  <div className="skeleton-shimmer rounded-pill" style={{ width: '80px', height: '22px' }} />
                  <div className="skeleton-shimmer rounded-pill" style={{ width: '95px', height: '22px' }} />
                  <div className="skeleton-shimmer rounded-pill" style={{ width: '70px', height: '22px' }} />
                </div>
              </div>
            </div>

            {/* Cột phải: Skeleton đánh giá, giá phòng & nút đặt */}
            <div className="col-lg-3 col-12 p-3 d-flex flex-column justify-content-between bg-light bg-opacity-25">
              <div className="d-flex justify-content-lg-end justify-content-start align-items-center gap-2">
                <div className="skeleton-shimmer rounded-2" style={{ width: '85px', height: '32px' }} />
                <div className="skeleton-shimmer rounded-2" style={{ width: '54px', height: '32px' }} />
              </div>

              <div className="mt-3 d-flex flex-column align-items-lg-end align-items-start">
                <div className="skeleton-shimmer rounded-2 mb-1" style={{ width: '50px', height: '14px' }} />
                <div className="skeleton-shimmer rounded-2 mb-2" style={{ width: '140px', height: '28px' }} />
                <div className="skeleton-shimmer rounded-2 w-100" style={{ height: '38px' }} />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
