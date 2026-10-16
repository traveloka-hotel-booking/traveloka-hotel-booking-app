import { apiFetch } from './api';

/**
 * FR-21: Tạo đánh giá mới cho đơn đặt phòng đã hoàn tất lưu trú (COMPLETED)
 * POST /customer/reviews
 * Body: { bookingId, rating, comment }
 */
export async function createReviewApi({ bookingId, rating, comment }) {
  const response = await apiFetch('/customer/reviews', {
    method: 'POST',
    body: JSON.stringify({
      bookingId: Number(bookingId),
      rating: Number(rating),
      comment: comment?.trim() || '',
    }),
  });

  const payload = await response.json();
  if (response.ok) {
    return payload?.result ?? payload;
  }
  throw new Error(payload?.message || `Gửi đánh giá thất bại (HTTP ${response.status})`);
}

/**
 * FR-21: Lấy danh sách đánh giá của khách sạn
 * GET /hotels/{hotelId}/reviews
 */
export async function getHotelReviewsApi(hotelId) {
  const response = await apiFetch(`/hotels/${hotelId}/reviews`);
  if (response.ok) {
    const payload = await response.json();
    return payload?.result ?? [];
  }
  throw new Error(`Lấy danh sách đánh giá thất bại (HTTP ${response.status})`);
}

/**
 * FR-21: Kiểm tra xem đơn đặt phòng có đủ điều kiện đánh giá không
 * GET /customer/reviews/can-review/{bookingId}
 */
export async function canReviewBookingApi(bookingId) {
  try {
    const response = await apiFetch(`/customer/reviews/can-review/${bookingId}`);
    if (response.ok) {
      const payload = await response.json();
      return Boolean(payload?.result);
    }
    return false;
  } catch {
    return false;
  }
}
