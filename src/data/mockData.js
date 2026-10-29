// Dữ liệu khách sạn mẫu đã được dọn dẹp để hệ thống vận hành hoàn toàn bằng dữ liệu thật từ Backend MySQL
export const MOCK_HOTELS = [];

export const normalizeHotel = (hotel) => {
  if (!hotel) return hotel;
  const amenities = Array.isArray(hotel.amenities)
    ? hotel.amenities
    : typeof hotel.amenities === 'string'
      ? hotel.amenities.split(',').map(s => s.trim()).filter(Boolean)
      : [];

  const rooms = Array.isArray(hotel.rooms) ? hotel.rooms : [];

  return {
    ...hotel,
    amenities,
    rooms
  };
};

// Hàm tiện ích lấy danh sách khách sạn từ Backend / Cache
export const getHotelsData = () => {
  return [];
};