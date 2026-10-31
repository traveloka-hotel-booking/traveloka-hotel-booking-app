# 🏨 Traveloka Hotel Booking — Frontend Application

[![React](https://img.shields.io/badge/React-19.2.8-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.3.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3.8-7952B3?logo=bootstrap&logoColor=white)](https://getbootstrap.com/)
[![React Router](https://img.shields.io/badge/React_Router-7.18.4-CA4245?logo=react-router&logoColor=white)](https://reactrouter.com/)
[![Recharts](https://img.shields.io/badge/Recharts-3.10.1-22B5BF)](https://recharts.org/)
[![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000000?logo=vercel&logoColor=white)](https://traveloka-hotel-booking-app.vercel.app)

Ứng dụng Web **Single Page Application (SPA)** mô phỏng hệ thống đặt phòng khách sạn trực tuyến **Traveloka**, được phát triển bằng **React 19** và **Vite 8**. Hệ thống kết nối trực tiếp với **Spring Boot RESTful API**, tích hợp thanh toán **VNPay Sandbox (HMAC-SHA512)**, lưu trữ đám mây **Cloudinary**, bộ đệm **Redis Cache**, và cung cấp đầy đủ hai phân hệ **Khách hàng (Customer Portal)** cùng **Quản trị viên (Admin PMS Dashboard)**.

🌐 **Production Demo (Vercel):** [https://traveloka-hotel-booking-app.vercel.app](https://traveloka-hotel-booking-app.vercel.app)

---

## 📑 Mục Lục
- [Kiến Trúc & Công Nghệ Sử Dụng (Tech Stack)](#-kiến-trúc--công-nghệ-sử-dụng-tech-stack)
- [Tính Năng Hệ Thống Thực Tế (System Features)](#-tính-năng-hệ-thống-thực-tế-system-features)
- [Cấu Trúc Thư Mục Thực Tế (Project Structure)](#-cấu-trúc-thư-mục-thực-tế-project-structure)
- [Cơ Chế Kỹ Thuật Nổi Bật Ở Frontend](#-cơ-chế-kỹ-thuật-nổi-bật-ở-frontend)
- [Yêu Cầu Môi Trường (Prerequisites)](#-yêu-cầu-môi-trường-prerequisites)
- [Hướng Dẫn Cài Đặt & Chạy Local](#-hướng-dẫn-cài-đặt--chạy-local)
- [Cấu Hình Biến Môi Trường (.env)](#-cấu-hình-biến-môi-trường-env)
- [Triển Khai Production (Vercel Deployment)](#-triển-khai-production-vercel-deployment)
- [Quy Chuẩn Git & Đóng Góp (Git Workflow)](#-quy-chuẩn-git--đóng-góp-git-workflow)

---

## 🚀 Kiến Trúc & Công Nghệ Sử Dụng (Tech Stack)

| Thành phần | Công nghệ / Thư viện | Phiên bản | Mục đích sử dụng trong hệ thống |
| :--- | :--- | :--- | :--- |
| **Core UI Library** | React (Hooks & Context API) | `19.2.8` | Xây dựng kiến trúc Component-based, quản lý State toàn cục (`AuthContext`, `AlertContext`) |
| **Build Tool & Bundler** | Vite | `8.3.0` | Dev Server với Hot Module Replacement (HMR) tốc độ cao và tối ưu gói tin Production |
| **Client-side Routing** | React Router DOM | `7.18.4` | Điều hướng SPA, bảo vệ Route phân quyền Customer/Admin, truyền State đặt phòng |
| **UI & Styling** | Bootstrap 5 + Custom CSS | `5.3.8` | Giao diện chuẩn Traveloka, Responsive đa thiết bị, Glassmorphism Navbar, Custom Modals |
| **Icon System** | Lucide React | `1.47.0` | Hệ thống biểu tượng vector SVG đồng nhất, sắc nét |
| **Data Visualization** | Recharts | `3.10.1` | Biểu đồ thống kê doanh thu, tỷ lệ lấp đầy và hiệu suất kinh doanh trên Admin Dashboard |
| **HTTP & Auth Interceptor** | Native Fetch API (`apiFetch`) | ES2024 | Tự động đính kèm `Bearer AccessToken`, tự động gọi `/auth/refresh` khi gặp mã `401 Unauthorized` |
| **Image Optimization** | HTML5 Canvas Compressor | Custom | Nén và chuẩn hóa kích thước ảnh phía Client (`imageCompressor.js`) trước khi gửi lên Backend Cloudinary |
| **Code Quality** | ESLint | `10.10.0` | Kiểm soát chất lượng mã nguồn JavaScript / React Hooks |

---

## ✨ Tính Năng Hệ Thống Thực Tế (System Features)

### 👤 1. Phân Hệ Khách Hàng (Customer Portal)

* 🔐 **Xác thực & Bảo mật tài khoản (`FR-01`, `FR-02`, `FR-12`, `FR-19`)**:
  * Đăng ký tài khoản mới với kiểm tra định dạng chặt chẽ; cấm sử dụng tài khoản Admin để đặt phòng khách hàng.
  * Đăng nhập bằng **JWT (Access Token + Refresh Token)**. Tự động làm mới phiên đăng nhập ngầm (Silent Token Refresh) khi Access Token hết hạn mà không làm gián đoạn trải nghiệm.
  * Đăng xuất an toàn: Đưa Access Token vào danh sách đen (`TokenBlackList`) và xóa Refresh Token dưới Database.
  * Đổi mật khẩu và khôi phục mật khẩu qua Email (**Forgot & Reset Password** với mã xác nhận gửi qua SMTP Gmail).
* 🗺️ **Hồ sơ cá nhân & Định vị thông minh (`FR-05`)**:
  * Cập nhật thông tin cá nhân, tải ảnh đại diện (Avatar) được nén tự động phía trình duyệt và lưu trữ lên **Cloudinary** qua Backend.
  * Tích hợp gợi ý địa chỉ tự động (**Address Autocomplete**) kết hợp dữ liệu hành chính Việt Nam và OpenStreetMap / Google Maps Geocoding.
* 🔍 **Tìm kiếm & Bộ lọc khách sạn đa tiêu chí (`FR-06`, `FR-07`)**:
  * Tìm kiếm khách sạn theo **Thành phố/Điểm đến** (hỗ trợ gợi ý thông minh không dấu & có dấu), **Ngày nhận phòng (`checkIn`)**, **Ngày trả phòng (`checkOut`)**, và **Số lượng khách/phòng**.
  * Kiểm tra phòng trống theo thời gian thực dựa trên thuật toán chống trùng lịch (`Interval Overlapping Check`).
  * Lọc kết quả theo khoảng giá, hạng sao (`1 - 5 sao`), tiện ích dịch vụ (Wifi, Hồ bơi, Bữa sáng, Đỗ xe, Spa, Gym...), sắp xếp theo giá tăng/giảm dần và phân trang Server-side (`Pageable`).
* 🏨 **Chi tiết khách sạn & Đánh giá thực tế (`FR-21`)**:
  * Xem thư viện ảnh đa góc độ của khách sạn và từng hạng phòng, bản đồ vị trí, danh sách tiện nghi và chính sách lưu trú.
  * Hệ thống **Đánh giá & Nhận xét (Reviews & Ratings)** theo thang điểm 10, tự động tính điểm trung bình và phân loại mức độ hài lòng.
* 💳 **Đặt phòng & Thanh toán kép (`FR-18`)**:
  * Tự động tính số đêm lưu trú, thuế phí, áp dụng **Mã giảm giá (Coupon)** và tổng tiền thanh toán.
  * **Phương thức 1 — Thanh toán trực tuyến qua cổng VNPay Sandbox**:
    * Khởi tạo URL thanh toán có chữ ký số **`HMAC-SHA512`** chuyển hướng sang cổng VNPay Sandbox.
    * Trang tiếp nhận kết quả **`PaymentCallbackPage.jsx`** gọi Backend đối chiếu chữ ký số chống giả mạo URL (`Invalid Checksum`), cập nhật trạng thái đơn sang `CONFIRMED` và tự động điều hướng về trang hoàn tất.
  * **Phương thức 2 — Thanh toán tiền mặt tại khách sạn (`CASH`)**:
    * Tự động xác nhận giữ chỗ (`CONFIRMED`) và cho phép thanh toán trực tiếp tại quầy lễ tân khi làm thủ tục Check-in.
* 📜 **Quản lý lịch sử đặt chỗ (`MyBookingsPage.jsx`)**:
  * Theo dõi toàn bộ vòng đời đơn hàng: `PENDING` (Chờ thanh toán), `CONFIRMED` (Đã xác nhận), `CHECKED_IN` (Đang lưu trú), `COMPLETED` (Đã trả phòng), `CANCELLED` (Đã hủy), `EXPIRED` (Quá hạn).
  * **Đồng hồ đếm ngược 30 phút** cho các đơn `PENDING` thanh toán qua VNPay (cho phép bấm thanh toán lại hoặc tự động hủy khi hết hạn 30 phút).
  * Hỗ trợ khách hàng tự hủy đơn phòng hợp lệ và xem/in phiếu xác nhận đặt phòng.

---

### 🛡️ 2. Phân Hệ Quản Trị Viên (Admin PMS Dashboard)

* 📊 **Bảng điều khiển thống kê & Biểu đồ doanh thu (`Dashboard & Analytics`)**:
  * Thống kê KPI thời gian thực: Tổng doanh thu thực thu, doanh thu chờ thu tiền mặt tại quầy, tổng số đơn đặt phòng, tỷ lệ lấp đầy phòng và điểm đánh giá uy tín.
  * Trực quan hóa dữ liệu bằng biểu đồ cột/đường (`Recharts`) và xuất hóa đơn/phiếu thu chuyên nghiệp.
* 🏨 **Quản lý Khách sạn (`FR-13`)**:
  * Thêm mới, chỉnh sửa, xóa khách sạn, cấu hình **giá khởi điểm (`pricePerNight`)** và tải lên nhiều hình ảnh qua **Cloudinary API**.
  * **Đồng bộ tức thì sang trang khách hàng (Homepage & HotelsPage)**: Kết hợp cơ chế xóa bộ đệm `@CacheEvict` trên Redis ở Backend và sự kiện `CustomEvent` (`traveloka_hotels_updated`) ở Frontend.
* 🛏️ **Quản lý Phòng nghỉ (`FR-14`)**:
  * Quản lý danh sách loại phòng theo từng khách sạn, thiết lập sức chứa tối đa (`maxGuests`), loại giường, giá mỗi đêm, ảnh phòng và trạng thái vận hành (`AVAILABLE`, `BOOKED`, `MAINTENANCE`).
* 📋 **Vận hành Đặt phòng & Lễ tân (`FR-15`)**:
  * Quy trình nghiệp vụ lễ tân khép kín (**Thu tiền ➔ Nhận phòng ➔ Trả phòng**):
    * **Duyệt đơn (`Confirm`)**: Kiểm tra điều kiện thanh toán và hạn ngày nhận phòng trước khi duyệt.
    * **Thu tiền mặt tại quầy (`Pay Cash`)**: Ghi nhận thanh toán `SUCCESS` cho khách chọn phương thức tiền mặt.
    * **Thủ tục Nhận phòng (`Check-in`)**: Cho phép chọn ngày nhận phòng thực tế, tự động tính lại số đêm & tổng tiền nếu khách nhận phòng sớm/muộn. Chặn nhận phòng nếu đơn chưa thanh toán.
    * **Thủ tục Trả phòng (`Check-out`)**: Chọn ngày trả phòng thực tế, tự động tính toán lại chi phí lưu trú và hoàn tất đơn (`COMPLETED`).
    * **Dọn dẹp đơn quá hạn (`Cleanup Expired Bookings`)**: Tự động đồng bộ và dọn dẹp các đơn quá hạn thanh toán 30 phút hoặc quá ngày Check-in (No-Show).
* 👥 **Quản lý Người dùng & Phân quyền (`AdminUserManagement.jsx`)**:
  * Tra cứu danh sách tài khoản khách hàng và quản trị viên, khóa/mở khóa tài khoản, theo dõi tổng chi tiêu của từng khách hàng.
* 🏷️ **Quản lý Mã khuyến mãi (Coupons) & Kiểm duyệt Đánh giá (Reviews)**:
  * Tạo và quản lý các chương trình giảm giá theo phần trăm hoặc số tiền cố định; theo dõi các phản hồi đánh giá từ khách lưu trú.

---

## 📁 Cấu Trúc Thư Mục Thực Tế (Project Structure)

```text
traveloka-hotel-booking-app/
├── public/
│   └── logo/                        # Logo thương hiệu và favicon
├── src/
│   ├── assets/                      # Hình ảnh banner tĩnh và tài nguyên đồ họa
│   ├── components/                  # Các Component dùng chung trên toàn hệ thống
│   │   ├── AdminUserManagement.jsx  # Phân hệ quản lý tài khoản người dùng trong Admin
│   │   ├── AlertModal.jsx           # Hộp thoại thông báo / xác nhận thay thế window.alert
│   │   ├── Footer.jsx               # Chân trang thông tin & liên kết
│   │   ├── Navbar.jsx               # Thanh điều hướng thông minh, menu tài khoản & đăng xuất
│   │   ├── PolicyModal.jsx          # Modal chính sách bảo mật & điều khoản dịch vụ
│   │   ├── ScrollToTop.jsx          # Tự động cuộn lên đầu trang khi chuyển Route
│   │   └── SupportModal.jsx         # Trung tâm hỗ trợ khách hàng 24/7
│   ├── context/                     # Quản lý trạng thái toàn cục (React Context API)
│   │   ├── AlertContext.jsx         # Cung cấp hook useAlert() hiển thị thông báo toàn cục
│   │   └── AuthContext.jsx          # Cung cấp hook useAuth(), quản lý JWT, Login/Logout
│   ├── data/
│   │   └── mockData.js              # Dữ liệu địa danh gợi ý & cấu hình mặc định
│   ├── pages/                       # 13 Trang giao diện chức năng chính
│   │   ├── HomePage.jsx             # Trang chủ tìm kiếm, điểm đến nổi bật & danh sách khách sạn
│   │   ├── HotelsPage.jsx           # Trang tìm kiếm nâng cao, bộ lọc đa tiêu chí & phân trang
│   │   ├── HotelDetailPage.jsx      # Trang chi tiết khách sạn, danh sách phòng trống & đánh giá
│   │   ├── CheckoutPage.jsx         # Trang điền thông tin đặt phòng, áp mã giảm giá & chọn thanh toán
│   │   ├── PaymentCallbackPage.jsx  # Trang nhận Redirect từ VNPay Sandbox & xác thực chữ ký số
│   │   ├── BookingSuccessPage.jsx   # Trang xác nhận đặt phòng thành công & hóa đơn điện tử
│   │   ├── MyBookingsPage.jsx       # Trang quản lý lịch sử đặt chỗ của khách hàng
│   │   ├── ProfilePage.jsx          # Trang hồ sơ cá nhân, đổi mật khẩu & tải ảnh đại diện
│   │   ├── LoginPage.jsx            # Trang đăng nhập
│   │   ├── RegisterPage.jsx         # Trang đăng ký tài khoản
│   │   ├── ForgotPasswordPage.jsx   # Trang yêu cầu khôi phục mật khẩu qua Email
│   │   ├── ResetPasswordPage.jsx    # Trang đặt lại mật khẩu mới với mã xác nhận
│   │   └── AdminDashboardPage.jsx   # Hệ thống quản trị toàn diện (KPIs, Khách sạn, Phòng, Đơn đặt)
│   ├── services/                    # Tầng giao tiếp RESTful API với Backend Spring Boot
│   │   ├── api.js                   # Wrapper apiFetch(), tự động đính kèm JWT & Refresh Token khi 401
│   │   ├── hotelApi.js              # Các hàm gọi API tìm kiếm, lọc khách sạn và lấy chi tiết
│   │   └── reviewApi.js             # Các hàm gọi API lấy và gửi đánh giá khách sạn
│   ├── utils/                       # Các tiện ích xử lý dữ liệu và hình ảnh
│   │   ├── errorHandler.js          # Chuẩn hóa và biên dịch thông báo lỗi thân thiện cho người dùng
│   │   └── imageCompressor.js       # Thuật toán nén ảnh phía Client bằng HTML5 Canvas trước khi upload
│   ├── App.jsx                      # Cấu hình hệ thống định tuyến (React Router v7)
│   ├── App.css                      # CSS tùy chỉnh cho các thành phần đặc thù
│   ├── index.css                    # Hệ thống biến CSS toàn cục, hiệu ứng chuyển động & responsive
│   └── main.jsx                     # Điểm khởi chạy ứng dụng React DOM
├── vercel.json                      # Cấu hình Rewrite SPA cho Vercel (chống lỗi 404 khi tải lại trang)
├── eslint.config.js                 # Cấu hình quy tắc kiểm tra mã nguồn ESLint
├── index.html                       # Tệp HTML gốc
├── package.json                     # Khai báo thư viện phụ thuộc và scripts
└── vite.config.js                   # Cấu hình trình đóng gói Vite
```

---

## 🔧 Cơ Chế Kỹ Thuật Nổi Bật Ở Frontend

1. **Silent JWT Refresh Token Interceptor (`src/services/api.js`)**:
   * Mọi yêu cầu HTTP đi qua `apiFetch()` đều tự động gắn header `Authorization: Bearer <accessToken>`.
   * Khi Access Token hết hạn (Backend trả về `401 Unauthorized`), `apiFetch()` tự động gọi ngầm endpoint `POST /api/v1/auth/refresh` với `refreshToken`, lưu cặp token mới vào `localStorage` và **gửi lại request ban đầu** mà người dùng không hề bị văng ra trang đăng nhập.
2. **Xác thực chữ ký số VNPay 2 lớp (`src/pages/PaymentCallbackPage.jsx`)**:
   * Khi VNPay Sandbox chuyển hướng trình duyệt về `/payment-callback?vnp_Amount=...&vnp_SecureHash=...`, Frontend không tự ý tin tưởng tham số trên URL mà gửi toàn bộ query string xuống Backend (`/customer/payments/vnpay-callback`) để kiểm tra chữ ký `HMAC-SHA512` trước khi xác nhận đơn hàng.
3. **Nén ảnh phía Client & Upload bảo mật qua Backend (`src/utils/imageCompressor.js`)**:
   * Thay vì lưu khóa bí mật Cloudinary ở Frontend, ảnh tải lên được nén giảm dung lượng tới 70% ngay trên trình duyệt bằng `HTML5 Canvas`, sau đó gửi dạng `multipart/form-data` xuống Backend để ký số và đẩy lên Cloudinary an toàn tuyệt đối.
4. **Đồng bộ dữ liệu thời gian thực giữa Admin và Customer**:
   * Khi Admin thêm/sửa khách sạn hoặc cập nhật trạng thái phòng, hệ thống kết hợp việc xóa cache Redis (`@CacheEvict`) ở Backend với cơ chế phát sự kiện `window.dispatchEvent(new Event('traveloka_hotels_updated'))` giúp giao diện trang chủ cập nhật ngay lập tức.

---

## 📋 Yêu Cầu Môi Trường (Prerequisites)

* **Node.js**: Phiên bản `>= 18.0.0` (Khuyến nghị **Node.js 20 LTS** hoặc **22 LTS**)
* **npm**: Phiên bản `>= 9.0.0`
* **Backend Service (`traveloka-hotel-booking-service`)**: Đang chạy tại `http://localhost:8080` (hoặc kết nối tới URL Backend trên Render).

---

## 🛠️ Hướng Dẫn Cài Đặt & Chạy Local

### Bước 1: Di chuyển vào thư mục Frontend
```bash
cd traveloka-hotel-booking-app
```

### Bước 2: Cài đặt các gói thư viện (`node_modules`)
```bash
npm install
```

### Bước 3: Cấu hình biến môi trường (`.env`)
Tạo file `.env` tại thư mục gốc của dự án Frontend:
```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

### Bước 4: Khởi chạy máy chủ phát triển (Development Server)
```bash
npm run dev
```
Mở trình duyệt và truy cập: **`http://localhost:5173`**

---

## ⚙️ Cấu Hình Biến Môi Trường (.env)

> 💡 **Bảo mật**: Toàn bộ các khóa nhạy cảm như `CLOUDINARY_API_SECRET`, `VNPAY_HASH_SECRET`, `JWT_SECRET` đều được bảo vệ nghiêm ngặt ở phía **Backend Spring Boot**. Phía Frontend chỉ cần cấu hình địa chỉ máy chủ API.

| Tên Biến | Bắt buộc | Mô tả | Giá trị Local mặc định |
| :--- | :---: | :--- | :--- |
| `VITE_API_BASE_URL` | Có | Đường dẫn gốc tới Backend Spring Boot REST API | `http://localhost:8080/api/v1` |

---

## 🌐 Triển Khai Production (Vercel Deployment)

Dự án đã được cấu hình sẵn file [`vercel.json`](./vercel.json) để xử lý cơ chế **SPA Fallback Routing** cho React Router DOM (đảm bảo khi người dùng nhấn F5 tại các đường dẫn con như `/hotels`, `/admin`, `/payment-callback` không bị lỗi `404 Not Found` trên Vercel):

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Các bước cấu hình trên Vercel Dashboard:
1. Import repository `traveloka-hotel-booking-app` từ GitHub vào **Vercel**.
2. Chọn **Framework Preset**: `Vite`.
3. Trong mục **Environment Variables**, thêm biến:
   * **Name**: `VITE_API_BASE_URL`
   * **Value**: `https://<ten-service-backend-cua-ban>.onrender.com/api/v1`
4. Nhấn **Deploy** — hệ thống CI/CD của Vercel sẽ tự động build và xuất bản ứng dụng mỗi khi có commit mới được đẩy lên GitHub.

---

## 📦 Các Lệnh Thường Dùng (Scripts)

| Lệnh | Mô tả chức năng |
| :--- | :--- |
| `npm run dev` | Chạy máy chủ phát triển tại `http://localhost:5173` với tính năng Hot Reload |
| `npm run build` | Đóng gói và tối ưu hóa mã nguồn ra thư mục `dist/` phục vụ Production |
| `npm run preview` | Chạy thử bản build Production (`dist/`) ngay trên máy Local |
| `npm run lint` | Kiểm tra lỗi cú pháp và quy tắc code chuẩn bằng ESLint |

---

## 🌿 Quy Chuẩn Git & Đóng Góp (Git Workflow)

Dự án áp dụng quy trình **Git Feature Branch Workflow**:
* **`main`**: Nhánh Production ổn định, được kết nối trực tiếp với CI/CD trên Vercel.
* **`develop`**: Nhánh tích hợp chính dùng để kiểm thử các tính năng hoàn thiện.
* **`feature/<ten-tinh-nang>`**: Nhánh phát triển từng yêu cầu chức năng (Ví dụ: `feature/fr-18-vnpay-payment-integration`, `feature/FR-21-hotel-reviews`).
* **`fix/<ten-loi>`**: Nhánh sửa lỗi đồng bộ và giao diện (Ví dụ: `fix/sync-new-hotel-homepage`).
