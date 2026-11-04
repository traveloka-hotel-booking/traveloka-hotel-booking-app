import { apiFetch } from './api';

const SWR_STORAGE_KEY = 'traveloka_hotels_swr_cache_v1';
const MEMORY_CACHE_TTL_MS = 5 * 60 * 1000; // 5 phút cho L1 RAM
const STORAGE_CACHE_TTL_MS = 30 * 60 * 1000; // 30 phút cho Stale-While-Revalidate trong localStorage

const memoryCache = new Map();
const inFlightRequests = new Map();

function loadStorageCache() {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(SWR_STORAGE_KEY) || '{}') || {};
  } catch {
    return {};
  }
}

function saveStorageCache(key, data) {
  if (typeof window === 'undefined') return;
  try {
    const store = loadStorageCache();
    // Giữ tối đa 15 mục gần nhất trong localStorage để tránh đầy bộ nhớ
    const keys = Object.keys(store);
    if (keys.length >= 15 && !store[key]) {
      const oldestKey = keys.sort((a, b) => (store[a]?.ts || 0) - (store[b]?.ts || 0))[0];
      if (oldestKey) delete store[oldestKey];
    }
    store[key] = { data, ts: Date.now() };
    localStorage.setItem(SWR_STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Bỏ qua nếu localStorage đầy hoặc ở chế độ ẩn danh hạn chế
  }
}

export function getCachedEntry(key, allowStale = true) {
  const now = Date.now();
  const mem = memoryCache.get(key);
  if (mem) {
    if (now - mem.ts <= MEMORY_CACHE_TTL_MS || allowStale) {
      return mem.data;
    }
  }
  const store = loadStorageCache();
  const persisted = store[key];
  if (persisted && persisted.data != null) {
    if (now - (persisted.ts || 0) <= STORAGE_CACHE_TTL_MS || allowStale) {
      memoryCache.set(key, persisted);
      return persisted.data;
    }
  }
  return null;
}

export function setCachedEntry(key, data, persistToStorage = true) {
  if (data == null) return;
  const entry = { data, ts: Date.now() };
  memoryCache.set(key, entry);
  if (persistToStorage) {
    saveStorageCache(key, data);
  }
}

export function invalidateHotelCache() {
  memoryCache.clear();
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(SWR_STORAGE_KEY);
    } catch {}
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('traveloka_hotels_updated', invalidateHotelCache);
  window.addEventListener('traveloka_rooms_updated', invalidateHotelCache);
}

function buildFilterParams({ city, minStar, maxStar, amenities, page = 0, size = 10 } = {}) {
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
  return params;
}

export function getCachedFilterHotels(options = {}) {
  const params = buildFilterParams(options);
  return getCachedEntry(`filter:${params.toString()}`, true);
}

export function getCachedHotelById(id) {
  if (id == null) return null;
  const direct = getCachedEntry(`hotel:${id}`, true);
  if (direct) return direct;

  // Tìm nhanh thông tin tóm tắt của khách sạn từ danh sách đã cache (để hiển thị tức thì 0ms khi chuyển trang)
  for (const [, entry] of memoryCache.entries()) {
    const list = Array.isArray(entry?.data?.content)
      ? entry.data.content
      : Array.isArray(entry?.data)
        ? entry.data
        : null;
    if (list) {
      const found = list.find(h => String(h?.id) === String(id));
      if (found) return found;
    }
  }
  const store = loadStorageCache();
  for (const key of Object.keys(store)) {
    const payload = store[key]?.data;
    const list = Array.isArray(payload?.content)
      ? payload.content
      : Array.isArray(payload)
        ? payload
        : null;
    if (list) {
      const found = list.find(h => String(h?.id) === String(id));
      if (found) return found;
    }
  }
  return null;
}

/**
 * Thực thi request kèm chống trùng lặp (In-flight deduplication) và tự động thử lại (Retry)
 * nếu gặp lỗi tạm thời khi máy chủ đám mây đang thức dậy từ trạng thái ngủ (Cold Start).
 */
async function deduplicatedFetchJson(cacheKey, endpoint, { persist = true, retries = 1 } = {}) {
  if (inFlightRequests.has(cacheKey)) {
    return inFlightRequests.get(cacheKey);
  }

  const requestPromise = (async () => {
    let lastError;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await apiFetch(endpoint);
        if (response.ok) {
          const payload = await response.json();
          const result = payload?.result ?? payload;
          setCachedEntry(cacheKey, result, persist);
          return result;
        }
        // Nếu server đang khởi động (502/503/504), đợi 1.5s rồi thử lại
        if ([502, 503, 504].includes(response.status) && attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, 1500));
          continue;
        }
        throw new Error(`Yêu cầu dữ liệu khách sạn thất bại (HTTP ${response.status})`);
      } catch (err) {
        lastError = err;
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
      }
    }
    throw lastError;
  })().finally(() => {
    inFlightRequests.delete(cacheKey);
  });

  inFlightRequests.set(cacheKey, requestPromise);
  return requestPromise;
}

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

  const query = params.toString();
  return deduplicatedFetchJson(`search:${query}`, `/hotels/search?${query}`, { persist: true, retries: 1 });
}

/**
 * FR-07: Lọc khách sạn theo thành phố, hạng sao, tiện ích
 * GET /hotels/filter?city=...&minStar=...&maxStar=...&amenities=...&page=...&size=...
 */
export async function filterHotelsApi(options = {}) {
  const params = buildFilterParams(options);
  const query = params.toString();
  return deduplicatedFetchJson(`filter:${query}`, `/hotels/filter?${query}`, { persist: true, retries: 1 });
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

  const query = params.toString();
  return deduplicatedFetchJson(`hotels:${query}`, `/hotels?${query}`, { persist: true, retries: 1 });
}

/**
 * Lấy thông tin chi tiết một khách sạn theo ID
 * GET /hotels/{id}
 */
export async function getHotelByIdApi(id) {
  return deduplicatedFetchJson(`hotel:${id}`, `/hotels/${id}`, { persist: true, retries: 1 });
}

/**
 * Lấy danh sách phòng thuộc một khách sạn
 * GET /hotels/{id}/rooms
 */
export async function getHotelRoomsApi(id) {
  return deduplicatedFetchJson(`hotel_rooms:${id}`, `/hotels/${id}/rooms`, { persist: false, retries: 1 });
}
