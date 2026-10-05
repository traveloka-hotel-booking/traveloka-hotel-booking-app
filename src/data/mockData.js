// Dữ liệu mẫu mô phỏng danh sách khách sạn, phòng và tiện ích
export const MOCK_HOTELS = [
  {
    id: 1,
    name: "Khách Sạn Grand Plaza Hà Nội",
    city: "Hà Nội",
    address: "117 Trần Duy Hưng, Cầu Giấy, Hà Nội",
    starRating: 5,
    ratingScore: 9.2,
    ratingText: "Tuyệt vời",
    reviewCount: 348,
    thumbnailUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=60",
    images: [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&auto=format&fit=crop&q=60"
    ],
    description: "Khách sạn 5 sao Grand Plaza Hà Nội là biểu tượng xa hoa tọa lạc tại trung tâm khu đô thị mới phía Tây thủ đô. Với kiến trúc hoàng gia dát vàng lộng lẫy, khách sạn mang đến trải nghiệm nghỉ dưỡng thượng lưu kết hợp tinh hoa văn hóa Á - Âu.",
    checkInTime: "14:00",
    checkOutTime: "12:00",
    amenities: [
      "Wifi miễn phí",
      "Hồ bơi trong nhà",
      "Spa & Massage",
      "Bữa sáng buffet miễn phí",
      "Phòng gym & Fitness",
      "Bãi đỗ xe miễn phí",
      "Nhà hàng ẩm thực Á - Âu",
      "Quầy bar & Lounge",
      "Lễ tân phục vụ 24/7",
      "Dịch vụ đưa đón sân bay"
    ],
    rooms: [
      {
        id: 101,
        name: "Phòng Deluxe Giường Đôi Hướng Phố",
        pricePerNight: 1200000,
        originalPrice: 1500000,
        maxGuests: 2,
        bedType: "1 Giường đôi lớn (King Size)",
        roomSize: "38 m²",
        imageUrl: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&auto=format&fit=crop&q=60",
        description: "Không gian sang trọng với cửa kính chạm trần nhìn ra phố Cầu Giấy sôi động. Nội thất gỗ cao cấp và ánh sáng tự nhiên ngập tràn.",
        amenities: ["Bao gồm bữa sáng", "Wifi miễn phí", "Điều hòa hai chiều", "Bồn tắm nằm", "Smart TV 55 inch", "Két an toàn", "Máy pha trà & cà phê"],
        freeCancellation: true
      },
      {
        id: 102,
        name: "Phòng Executive Suite Sang Trọng",
        pricePerNight: 2400000,
        originalPrice: 3000000,
        maxGuests: 3,
        bedType: "1 Giường King & 1 Giường Sofa",
        roomSize: "65 m²",
        imageUrl: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&auto=format&fit=crop&q=60",
        description: "Hạng phòng cao cấp có khu vực phòng khách riêng biệt, bàn làm việc tiện nghi và bồn tắm sục jacuzzi nhìn ra thành phố.",
        amenities: ["Bao gồm bữa sáng cao cấp", "Đặc quyền Executive Lounge", "Bồn tắm sục Jacuzzi", "Mini bar miễn phí", "Máy pha cà phê Nespresso", "Áo choàng tắm cao cấp"],
        freeCancellation: true
      },
      {
        id: 103,
        name: "Phòng Family Suite Gia Đình",
        pricePerNight: 3200000,
        originalPrice: 3800000,
        maxGuests: 4,
        bedType: "2 Giường đôi cỡ lớn",
        roomSize: "75 m²",
        imageUrl: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&auto=format&fit=crop&q=60",
        description: "Phòng dành cho gia đình hoặc nhóm bạn 4 người với không gian rộng rãi, 2 phòng ngủ ấm cúng và ban công thoáng mát.",
        amenities: ["Bao gồm bữa sáng cho 4 người", "2 Phòng ngủ riêng", "Bếp nhỏ và tủ lạnh lớn", "Khu vui chơi trẻ em", "Wifi tốc độ cao"],
        freeCancellation: false
      }
    ],
    reviews: [
      { id: 1, author: "Trần Minh Quang", date: "15/09/2026", rating: 10, comment: "Khách sạn quá đẹp, nội thất dát vàng cực kỳ sang trọng. Buffet sáng phong phú và nhân viên phục vụ rất chu đáo!" },
      { id: 2, author: "Lê Thu Thảo", date: "02/09/2026", rating: 9, comment: "Phòng rộng rãi, giường ngủ êm ái, hồ bơi nước ấm 4 mùa rất thích. Lần sau ra Hà Nội chắc chắn sẽ quay lại." }
    ]
  },
  {
    id: 2,
    name: "Vinpearl Resort & Spa Đà Nẵng",
    city: "Đà Nẵng",
    address: "Đường Trường Sa, Ngũ Hành Sơn, Đà Nẵng",
    starRating: 5,
    ratingScore: 9.6,
    ratingText: "Xuất sắc",
    reviewCount: 512,
    thumbnailUrl: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&auto=format&fit=crop&q=60",
    images: [
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&auto=format&fit=crop&q=60"
    ],
    description: "Tọa lạc tại vị trí đắc địa trên bãi biển Non Nước nguyên sơ, Vinpearl Resort & Spa Đà Nẵng được mệnh danh là thiên đường nghỉ dưỡng nhiệt đới với hồ bơi vô cực hướng thẳng biển Đông và hệ thống spa trên mặt hồ thanh tịnh.",
    checkInTime: "14:00",
    checkOutTime: "12:00",
    amenities: [
      "Bãi biển riêng tư",
      "Hồ bơi vô cực hướng biển",
      "Bữa sáng buffet quốc tế",
      "Akoya Spa thư giãn",
      "Quầy bar bãi biển",
      "Xe đưa đón sân bay miễn phí",
      "Khu vui chơi trẻ em Kid's Club",
      "Sân tennis & chèo kayak",
      "Wifi phủ sóng toàn khu",
      "Dịch vụ phòng 24h"
    ],
    rooms: [
      {
        id: 201,
        name: "Villa 2 Phòng Ngủ Hướng Biển Kèm Hồ Bơi Riêng",
        pricePerNight: 3500000,
        originalPrice: 4200000,
        maxGuests: 4,
        bedType: "2 Giường King lớn",
        roomSize: "190 m²",
        imageUrl: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600&auto=format&fit=crop&q=60",
        description: "Biệt thự nghỉ dưỡng sang trọng có hồ bơi riêng biệt, hiên tắm nắng và lối đi thẳng ra bờ cát trắng mịn màng của biển Non Nước.",
        amenities: ["Hồ bơi riêng", "Bao gồm ăn sáng 4 người", "Bồn tắm hướng vườn", "Trái cây chào đón", "Miễn phí đưa đón sân bay", "Dịch vụ quản gia riêng"],
        freeCancellation: true
      },
      {
        id: 202,
        name: "Phòng Deluxe Hướng Đại Dương (Ocean View)",
        pricePerNight: 1800000,
        originalPrice: 2200000,
        maxGuests: 2,
        bedType: "1 Giường đôi hoặc 2 giường đơn",
        roomSize: "48 m²",
        imageUrl: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&auto=format&fit=crop&q=60",
        description: "Ban công riêng nhìn ra toàn cảnh đại dương xanh ngắt. Lựa chọn tuyệt vời cho các cặp đôi tận hưởng kỳ nghỉ ngọt ngào.",
        amenities: ["Ban công view biển", "Bữa sáng miễn phí", "Bồn tắm nằm sang trọng", "Wifi tốc độ cao", "Áo choàng & Dép đi biển"],
        freeCancellation: true
      }
    ],
    reviews: [
      { id: 1, author: "Nguyễn Hoàng Nam", date: "10/09/2026", rating: 10, comment: "Hồ bơi vô cực đẹp xuất sắc, bãi biển riêng yên tĩnh và sạch sẽ. Cả gia đình mình có một kỳ nghỉ khó quên tại đây!" },
      { id: 2, author: "Đặng Mai Anh", date: "28/08/2026", rating: 9.5, comment: "Dịch vụ xứng tầm 5 sao quốc tế, đồ ăn sáng cực kỳ ngon miệng." }
    ]
  },
  {
    id: 3,
    name: "Rex Hotel Sài Gòn",
    city: "Hồ Chí Minh",
    address: "141 Nguyễn Huệ, Bến Nghé, Quận 1, TP. Hồ Chí Minh",
    starRating: 5,
    ratingScore: 8.9,
    ratingText: "Rất tốt",
    reviewCount: 280,
    thumbnailUrl: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&auto=format&fit=crop&q=60",
    images: [
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop&q=60"
    ],
    description: "Chứng nhân lịch sử tọa lạc ngay giao lộ phố đi bộ Nguyễn Huệ và Lê Lợi. Khách sạn Rex kết hợp hài hòa nét kiến trúc Pháp cổ điển với tiện nghi hiện đại của đô thị năng động bậc nhất Việt Nam.",
    checkInTime: "14:00",
    checkOutTime: "12:00",
    amenities: [
      "Vị trí trái tim Quận 1",
      "Hồ bơi tầng thượng Rooftop",
      "Wifi tốc độ cao",
      "Rooftop Garden Bar nổi tiếng",
      "Bữa sáng phong phú",
      "Trung tâm thể dục",
      "Dịch vụ massage trị liệu",
      "Phòng hội nghị sang trọng",
      "Bãi đỗ xe",
      "Thu đổi ngoại tệ"
    ],
    rooms: [
      {
        id: 301,
        name: "Phòng Superior Cổ Điển Nhìn Ra Phố Đi Bộ",
        pricePerNight: 1100000,
        originalPrice: 1400000,
        maxGuests: 2,
        bedType: "1 Giường đôi hoặc 2 giường đơn",
        roomSize: "36 m²",
        imageUrl: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&auto=format&fit=crop&q=60",
        description: "Thiết kế mộc mạc cổ kính nhưng không kém phần tiện nghi, cửa sổ nhìn thẳng xuống dòng người tấp nập của phố đi bộ Nguyễn Huệ.",
        amenities: ["Bữa sáng kèm theo", "Wifi miễn phí", "Bồn tắm nằm cổ điển", "Máy điều hòa", "Két an toàn", "Bàn làm việc"],
        freeCancellation: true
      },
      {
        id: 302,
        name: "Phòng Premium Governor Suite",
        pricePerNight: 2100000,
        originalPrice: 2600000,
        maxGuests: 2,
        bedType: "1 Giường King siêu êm",
        roomSize: "55 m²",
        imageUrl: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&auto=format&fit=crop&q=60",
        description: "Hạng phòng mang phong cách quý tộc Đông Dương với ban công rộng, phòng khách riêng và bồn tắm đá cẩm thạch.",
        amenities: ["Miễn phí cocktail tại Rooftop Bar", "Bữa sáng buffet", "Ban công ngắm thành phố", "Bồn tắm đá cẩm thạch", "Máy pha cà phê"],
        freeCancellation: true
      }
    ],
    reviews: [
      { id: 1, author: "Vũ Hải Đăng", date: "05/09/2026", rating: 9, comment: "Vị trí không thể tuyệt vời hơn, bước chân xuống là phố đi bộ. Buổi tối ngồi uống cocktail trên rooftop ngắm thành phố cực kỳ chill." }
    ]
  },
  {
    id: 4,
    name: "InterContinental Nha Trang",
    city: "Nha Trang",
    address: "32-34 Trần Phú, Lộc Thọ, Nha Trang, Khánh Hòa",
    starRating: 5,
    ratingScore: 9.4,
    ratingText: "Tuyệt hảo",
    reviewCount: 420,
    thumbnailUrl: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&auto=format&fit=crop&q=60",
    images: [
      "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&auto=format&fit=crop&q=60"
    ],
    description: "Khách sạn quốc tế 5 sao nằm ngay cung đường biển Trần Phú đẹp nhất vịnh Nha Trang. Tầm nhìn bao quát toàn bộ vịnh biển cùng dịch vụ chuẩn mực thượng hạng từ tập đoàn IHG danh tiếng.",
    checkInTime: "15:00",
    checkOutTime: "12:00",
    amenities: [
      "Mặt biển Trần Phú",
      "3 Hồ bơi ngoài trời hiện đại",
      "Wifi miễn phí tốc độ cao",
      "Spa by InterContinental",
      "Phòng gym nhìn ra biển",
      "Câu lạc bộ trẻ em Planet Trekkers",
      "Nhà hàng hải sản tươi sống",
      "Bãi đỗ xe trong nhà",
      "Đưa đón sân bay Cam Ranh"
    ],
    rooms: [
      {
        id: 401,
        name: "Phòng Classic Ocean View Hướng Biển",
        pricePerNight: 1950000,
        originalPrice: 2400000,
        maxGuests: 2,
        bedType: "1 Giường King hoặc 2 Giường Đơn",
        roomSize: "44 m²",
        imageUrl: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&auto=format&fit=crop&q=60",
        description: "Ban công riêng với ghế nằm tắm nắng nhìn thẳng ra vịnh Nha Trang. Phòng tắm kính hiện đại với vòi sen mưa và bồn tắm sâu riêng biệt.",
        amenities: ["Ban công hướng biển", "Bao gồm bữa sáng", "Bồn tắm nằm sâu", "Bộ đồ dùng phòng tắm cao cấp", "Loa Bluetooth Bose"],
        freeCancellation: true
      }
    ],
    reviews: [
      { id: 1, author: "Phạm Phương Linh", date: "12/09/2026", rating: 10, comment: "View biển đẹp mê hồn! Phòng ốc sạch sẽ tinh tươm, nhân viên thân thiện và buffet sáng có nhiều món ngon." }
    ]
  },
  {
    id: 5,
    name: "Dalat Edensee Lake Resort & Spa",
    city: "Đà Lạt",
    address: "Khu chức năng VII.2, Hồ Tuyền Lâm, Đà Lạt, Lâm Đồng",
    starRating: 5,
    ratingScore: 9.1,
    ratingText: "Tuyệt vời",
    reviewCount: 310,
    thumbnailUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=60",
    images: [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&auto=format&fit=crop&q=60"
    ],
    description: "Tựa như một ngôi làng cổ tích châu Âu nép mình bên hồ Tuyền Lâm thơ mộng và bao quanh bởi rừng thông bạt ngàn. Nơi lý tưởng để tìm về sự bình yên và không khí trong lành se lạnh của xứ sở ngàn hoa.",
    checkInTime: "14:00",
    checkOutTime: "12:00",
    amenities: [
      "Ven hồ Tuyền Lâm thơ mộng",
      "Hồ bơi nước nóng trong nhà",
      "Bữa sáng bên hồ",
      "Bắn cung, chèo kayak, câu cá",
      "Rạp chiếu phim mini",
      "Khu spa thư giãn cao cấp",
      "Sân golf mini",
      "Xe điện đưa đón nội khu",
      "Lò sưởi ấm cúng"
    ],
    rooms: [
      {
        id: 501,
        name: "Mimosa Deluxe Nhìn Ra Rừng Thông",
        pricePerNight: 1450000,
        originalPrice: 1800000,
        maxGuests: 2,
        bedType: "1 Giường đôi Queen",
        roomSize: "40 m²",
        imageUrl: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&auto=format&fit=crop&q=60",
        description: "Ban công riêng nhìn ra đồi thông bạt ngàn với tiếng thông reo rì rào. Đem lại cảm giác thư thái và lãng mạn tuyệt đối.",
        amenities: ["Bao gồm bữa sáng", "Ban công view rừng thông", "Lò sưởi phòng", "Bồn tắm nằm", "Wifi miễn phí"],
        freeCancellation: true
      }
    ],
    reviews: [
      { id: 1, author: "Lê Hoàng Yến", date: "01/09/2026", rating: 9.3, comment: "Cảnh quan đẹp như trời Âu, không khí trong lành và yên bình. Thích hợp cho kỳ nghỉ dưỡng tái tạo năng lượng." }
    ]
  }
];

// Hàm chuẩn hóa dữ liệu khách sạn (đảm bảo amenities luôn là mảng chuỗi)
export const normalizeHotel = (hotel) => {
  if (!hotel) return hotel;
  let amenities = hotel.amenities;
  if (typeof amenities === 'string') {
    amenities = amenities.split(',').map(s => s.trim()).filter(Boolean);
  } else if (!Array.isArray(amenities)) {
    amenities = [];
  }

  const rooms = (hotel.rooms || []).map(r => {
    let rAmenities = r.amenities;
    if (typeof rAmenities === 'string') {
      rAmenities = rAmenities.split(',').map(s => s.trim()).filter(Boolean);
    } else if (!Array.isArray(rAmenities)) {
      rAmenities = ["Wifi miễn phí", "Điều hòa"];
    }
    return {
      ...r,
      amenities: rAmenities
    };
  });

  return {
    ...hotel,
    amenities,
    rooms: rooms.length > 0 ? rooms : [
      {
        id: `r-${hotel.id || Date.now()}-def`,
        name: `Phòng Tiêu Chuẩn - ${hotel.name || 'Khách sạn'}`,
        pricePerNight: hotel.minPrice || hotel.pricePerNight || 1000000,
        originalPrice: Math.round((hotel.minPrice || hotel.pricePerNight || 1000000) * 1.25),
        amenities: ["Wifi miễn phí", "Điều hòa"],
        maxGuests: 2,
        status: "AVAILABLE"
      }
    ]
  };
};

// Hàm tiện ích lấy danh sách khách sạn (đồng bộ với dữ liệu CRUD của Admin trong localStorage)
export const getHotelsData = () => {
  let hotelsList = MOCK_HOTELS;
  try {
    const saved = localStorage.getItem('traveloka_custom_hotels');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        hotelsList = parsed;
      }
    }
  } catch (e) {
    console.error(e);
  }

  // Đồng bộ với traveloka_custom_rooms nếu có dữ liệu phòng quản lý riêng (FR-14)
  try {
    const savedRooms = localStorage.getItem('traveloka_custom_rooms');
    if (savedRooms) {
      const customRooms = JSON.parse(savedRooms);
      if (Array.isArray(customRooms) && customRooms.length > 0) {
        hotelsList = hotelsList.map(h => {
          const hotelRooms = customRooms.filter(r => String(r.hotelId) === String(h.id));
          if (hotelRooms.length > 0) {
            const minPrice = Math.min(...hotelRooms.map(r => Number(r.pricePerNight) || 1000000));
            const mockHotelRooms = (MOCK_HOTELS.find(mh => String(mh.id) === String(h.id)) || {}).rooms || [];
            return {
              ...h,
              rooms: hotelRooms.map((r, idx) => {
                const mockRoomMatch = mockHotelRooms.find(mr => mr.id === r.id || mr.name === r.name) || mockHotelRooms[idx % mockHotelRooms.length];
                const fallbackImg = mockRoomMatch?.imageUrl || h.thumbnailUrl || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&auto=format&fit=crop&q=60';
                return {
                  ...r,
                  imageUrl: (r.imageUrl && typeof r.imageUrl === 'string' && r.imageUrl.trim()) ? r.imageUrl : fallbackImg
                };
              }),
              minPrice: isFinite(minPrice) ? minPrice : h.minPrice,
              totalRooms: hotelRooms.length
            };
          }
          return h;
        });
      }
    }
  } catch (e) {
    console.error(e);
  }

  return hotelsList.map(normalizeHotel);
};