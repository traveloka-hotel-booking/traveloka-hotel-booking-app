// Dữ liệu mẫu mô phỏng danh sách khách sạn và phòng
export const MOCK_HOTELS = [
  {
    id: 1,
    name: "Khách Sạn Grand Plaza Hà Nội",
    city: "Hà Nội",
    address: "117 Trần Duy Hưng, Cầu Giấy, Hà Nội",
    starRating: 5,
    thumbnailUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop&q=60",
    description: "Khách sạn 5 sao sang trọng bậc nhất tại trung tâm Hà Nội với đầy đủ tiện nghi đẳng cấp quốc tế.",
    amenities: ["Wifi miễn phí", "Hồ bơi", "Spa", "Bữa sáng miễn phí", "Phòng gym", "Chỗ để xe"],
    rooms: [
      {
        id: 101,
        name: "Phòng Deluxe Hướng Phố",
        pricePerNight: 1200000,
        maxGuests: 2,
        bedType: "1 Giường đôi lớn (King)",
        imageUrl: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&auto=format&fit=crop&q=60",
        description: "Phòng rộng 35m2 với cửa sổ kính lớn nhìn toàn cảnh thành phố."
      },
      {
        id: 102,
        name: "Phòng Suite Hạng Thương Gia",
        pricePerNight: 2500000,
        maxGuests: 4,
        bedType: "2 Giường đôi lớn",
        imageUrl: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&auto=format&fit=crop&q=60",
        description: "Phòng cao cấp 60m2 có phòng khách riêng và bồn tắm sục massage."
      }
    ]
  },
  {
    id: 2,
    name: "Vinpearl Resort & Spa Đà Nẵng",
    city: "Đà Nẵng",
    address: "Đường Trường Sa, Ngũ Hành Sơn, Đà Nẵng",
    starRating: 5,
    thumbnailUrl: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&auto=format&fit=crop&q=60",
    description: "Khu nghỉ dưỡng biển tuyệt đẹp nằm ngay bãi biển Non Nước với hồ bơi vô cực.",
    amenities: ["Bãi biển riêng", "Hồ bơi vô cực", "Bữa sáng miễn phí", "Xe đưa đón sân bay", "Quầy bar"],
    rooms: [
      {
        id: 201,
        name: "Villa 2 Phòng Ngủ Hướng Biển",
        pricePerNight: 3500000,
        maxGuests: 4,
        bedType: "2 Giường King",
        imageUrl: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600&auto=format&fit=crop&q=60",
        description: "Biệt thự riêng tư có hồ bơi nhỏ và lối đi thẳng ra bãi cát trắng."
      }
    ]
  },
  {
    id: 3,
    name: "Rex Hotel Sài Gòn",
    city: "Hồ Chí Minh",
    address: "141 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh",
    starRating: 4,
    thumbnailUrl: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&auto=format&fit=crop&q=60",
    description: "Khách sạn mang tính biểu tượng lịch sử ngay trên phố đi bộ Nguyễn Huệ.",
    amenities: ["Vị trí trung tâm", "Wifi tốc độ cao", "Nhà hàng trên tầng thượng", "Hồ bơi"],
    rooms: [
      {
        id: 301,
        name: "Phòng Superior Cổ Điển",
        pricePerNight: 950000,
        maxGuests: 2,
        bedType: "1 Giường đôi hoặc 2 giường đơn",
        imageUrl: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&auto=format&fit=crop&q=60",
        description: "Phong cách kiến trúc cổ điển Pháp, ấm cúng và đầy đủ tiện nghi."
      }
    ]
  }
];