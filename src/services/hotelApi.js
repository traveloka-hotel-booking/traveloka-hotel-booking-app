import { apiFetch } from './api';

/**
 * FR-06: Tìm kiếm khách sạn theo thành phố, ngày nhận/trả phòng và số khách
 * GET /hotels/search?city=...&checkIn=...&checkOut=...&guests=...&page=...&size=...
 */
export async function searchHotelsApi({ city, checkIn, checkOut, guests = 1, page = 0, size = 10 } = {}) {
  const params = new URLSearchParams();
  const cleanCity = city?.trim();
  const isNationwide = !cleanCity || cleanCity === 'Tất cả' || cleanCity.includes('Việt Nam') || cleanCity.includes('Toàn bộ');

  if (!isNationwide) {
    params.append('city', cleanCity);
  }
  if (checkIn) params.append('checkIn', checkIn);
  if (checkOut) params.append('checkOut', checkOut);
  if (guests != null) params.append('guests', String(guests));
  params.append('page', String(page));
  params.append('size', String(size));

  const response = await apiFetch(`/hotels/search?${params.toString()}`);
  if (response.ok) {
    const payload = await response.json();
    return payload?.result ?? payload;
  }
  throw new Error(`Tìm kiếm khách sạn thất bại (HTTP ${response.status})`);
}

/**
 * FR-07: Lọc khách sạn theo thành phố, hạng sao, tiện ích
 * GET /hotels/filter?city=...&minStar=...&maxStar=...&amenities=...&page=...&size=...
 */
export async function filterHotelsApi({ city, minStar, maxStar, amenities, page = 0, size = 10 } = {}) {
  const params = new URLSearchParams();
  if (city && city !== 'Tất cả') params.append('city', city);
  if (minStar != null) params.append('minStar', String(minStar));
  if (maxStar != null) params.append('maxStar', String(maxStar));
  if (amenities) {
    const amenityStr = Array.isArray(amenities) ? amenities.filter(Boolean).join(',') : amenities;
    if (amenityStr) params.append('amenities', amenityStr);
  }
  params.append('page', String(page));
  params.append('size', String(size));

  const response = await apiFetch(`/hotels/filter?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Lọc khách sạn thất bại (HTTP ${response.status})`);
  }
  const payload = await response.json();
  return payload?.result ?? payload;
}

/**
 * Lấy danh sách khách sạn chung kèm tìm kiếm theo từ khóa hoặc thành phố
 * GET /hotels?search=...&city=...&page=...&size=...
 */
export async function getHotelsApi({ search = '', city = '', page = 0, size = 10 } = {}) {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (city && city !== 'Tất cả') params.append('city', city);
  params.append('page', String(page));
  params.append('size', String(size));

  const response = await apiFetch(`/hotels?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Tải danh sách khách sạn thất bại (HTTP ${response.status})`);
  }
  const payload = await response.json();
  return payload?.result ?? payload;
}

/**
 * Lấy thông tin chi tiết một khách sạn theo ID
 * GET /hotels/{id}
 */
export async function getHotelByIdApi(id) {
  const response = await apiFetch(`/hotels/${id}`);
  if (!response.ok) {
    throw new Error(`Không thể tải thông tin khách sạn #${id} (HTTP ${response.status})`);
  }
  const payload = await response.json();
  return payload?.result ?? payload;
}

/**
 * Lấy danh sách phòng thuộc một khách sạn
 * GET /hotels/{id}/rooms
 */
export async function getHotelRoomsApi(id) {
  const response = await apiFetch(`/hotels/${id}/rooms`);
  if (!response.ok) {
    throw new Error(`Không thể tải danh sách phòng của khách sạn #${id} (HTTP ${response.status})`);
  }
  const payload = await response.json();
  return payload?.result ?? payload;
}
