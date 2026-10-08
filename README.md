# 🏨 Traveloka Hotel Booking - Frontend Application

[![React](https://img.shields.io/badge/React-19.2.8-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.3.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3.8-7952B3?logo=bootstrap&logoColor=white)](https://getbootstrap.com/)
[![React Router](https://img.shields.io/badge/React_Router-7.18.4-CA4245?logo=react-router&logoColor=white)](https://reactrouter.com/)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18.0-339933?logo=node.js&logoColor=white)](https://nodejs.org/)

Ứng dụng Single Page Application (SPA) mô phỏng nền tảng đặt phòng khách sạn trực tuyến **Traveloka**, được xây dựng bằng **React 19** và đóng gói bằng **Vite**. Dự án tập trung vào trải nghiệm người dùng hiện đại, giao diện trực quan, tốc độ tải nhanh và khả năng tương thích cao trên mọi thiết bị.

---

## 📑 Mục Lục
- [Công Nghệ Sử Dụng (Tech Stack)](#-công-nghệ-sử-dụng-tech-stack)
- [Tính Năng Chính (Key Features)](#-tính-năng-chính-key-features)
- [Cấu Trúc Thư Mục (Project Structure)](#-cấu-trúc-thư-mục-project-structure)
- [Yêu Cầu Môi Trường (Prerequisites)](#-yêu-cầu-môi-trường-prerequisites)
- [Hướng Dẫn Cài Đặt & Chạy Local](#-hướng-dẫn-cài-đặt--chạy-local)
- [Cấu Hình Biến Môi Trường (.env)](#-cấu-hình-biến-môi-trường-env)
- [Các Lệnh Thường Dùng (Scripts)](#-các-lệnh-thường-dùng-scripts)
- [Quy Chuẩn Git & Đóng Góp (Git Workflow)](#-quy-chuẩn-git--đóng-góp-git-workflow)

---

## 🚀 Công Nghệ Sử Dụng (Tech Stack)

| Thành phần | Công nghệ / Thư viện | Phiên bản | Mục đích sử dụng |
| :--- | :--- | :--- | :--- |
| **Core Framework** | React | 19.2.x | Xây dựng giao diện thành phần (Component-based) |
| **Build Tool** | Vite | 8.3.x | Máy chủ phát triển HMR siêu tốc và bundler tối ưu |
| **Routing** | React Router DOM | 7.18.x | Điều hướng đa trang phía Client (SPA Routing) |
| **Styling** | Bootstrap 5 + Custom CSS | 5.3.x | Hệ thống lưới (Grid system), Responsive, Modal, Navbar |
| **Icons** | Lucide React | 1.47.x | Bộ icon SVG hiện đại, tải nhẹ và nhất quán |
| **Biểu đồ** | Recharts | 3.10.x | Trực quan hóa dữ liệu thống kê doanh thu cho Admin Dashboard |
| **Lưu trữ ảnh** | Cloudinary Web API | - | Ký số và tải ảnh phòng/khách sạn trực tiếp lên đám mây |
| **Chất lượng mã** | ESLint | 10.x | Kiểm tra và chuẩn hoá cú pháp mã nguồn JavaScript/JSX |

---

## ✨ Tính Năng Chính (Key Features)

### 👤 Dành cho Khách Hàng (Customer)
* 🔍 **Tìm kiếm thông minh**: Tìm khách sạn theo địa điểm/thành phố, khoảng ngày nhận phòng - trả phòng, số lượng khách.
* 🎛️ **Bộ lọc đa tiêu chí**: Lọc theo khoảng giá ngân sách, đánh giá số sao (1-5 sao), các tiện ích đi kèm (Wifi, hồ bơi, ăn sáng, đỗ xe...).
* 🏨 **Chi tiết khách sạn & phòng**: Thư viện ảnh, mô tả chi tiết, tiện nghi, danh sách các loại phòng trống kèm giá theo đêm.
* 💳 **Quy trình Đặt phòng & Thanh toán**:
  * Tự động tính số đêm lưu trú và tổng tiền.
  * Tích hợp thanh toán an toàn qua cổng **VNPay Sandbox**.
  * Nhận kết quả thanh toán tức thì và chuyển hướng trang thông báo thành công.
* 📜 **Lịch sử đặt phòng (`My Bookings`)**: Theo dõi các đơn đặt phòng, trạng thái thanh toán (`PAID`, `PENDING`, `CANCELLED`).
* 🔒 **Tài khoản cá nhân**: Đăng ký, đăng nhập JWT, cập nhật hồ sơ đại diện, đổi mật khẩu và luồng quên mật khẩu qua mã xác nhận gửi về Gmail.

### 🛡️ Dành cho Quản Trị Viên (Admin)
* 📊 **Dashboard Thống kê**: Biểu đồ doanh thu tổng, tổng số lượt đặt phòng, tỷ lệ lấp đầy theo thời gian thực.
* 🏨 **Quản lý Khách sạn & Phòng**: Thêm, chỉnh sửa thông tin khách sạn/phòng, upload ảnh trực tiếp lên Cloudinary.
* 📋 **Quản lý Đơn đặt phòng**: Xem toàn bộ danh sách đơn đặt của khách hàng trên hệ thống, xử lý trạng thái đơn.
* 👥 **Quản lý Người dùng**: Xem danh sách tài khoản, thông tin liên hệ và trạng thái hoạt động.

---

## 📁 Cấu Trúc Thư Mục (Project Structure)

```text
traveloka-hotel-booking-app/
├── public/                 # Tài nguyên tĩnh (favicon, logo, icons)
├── src/
│   ├── assets/             # Hình ảnh minh hoạ, font chữ
│   ├── components/         # Các React component tái sử dụng (Navbar, Footer, SearchBar, Card...)
│   ├── pages/              # Các trang giao diện chính
│   │   ├── HomePage.jsx
│   │   ├── HotelsPage.jsx
│   │   ├── HotelDetailPage.jsx
│   │   ├── CheckoutPage.jsx
│   │   ├── BookingSuccessPage.jsx
│   │   ├── PaymentCallbackPage.jsx
│   │   ├── MyBookingsPage.jsx
│   │   ├── ProfilePage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── ForgotPasswordPage.jsx
│   │   ├── ResetPasswordPage.jsx
│   │   └── AdminDashboardPage.jsx
│   ├── services/           # Gọi API Backend và dịch vụ bên thứ ba
│   │   ├── api.js          # Cấu hình Fetch Base URL, chèn Authorization JWT Header
│   │   ├── hotelApi.js     # API gọi danh sách khách sạn, phòng, đặt phòng
│   │   └── cloudinary.js   # Logic băm SHA-1 và upload ảnh lên Cloudinary
│   ├── utils/              # Các hàm tiện ích, định dạng tiền tệ VND, ngày tháng
│   ├── App.jsx             # Cấu hình Routes chính của ứng dụng
│   ├── main.jsx            # Entry point của React DOM
│   └── index.css           # Global CSS tùy biến và hiệu ứng
├── .env.example            # Bản mẫu cấu hình biến môi trường (được lưu trên Git)
├── .env                    # Biến môi trường thực tế (bị Git bỏ qua theo .gitignore)
├── .gitignore              # Danh sách file loại trừ khỏi Git
├── eslint.config.js        # Cấu hình kiểm tra ESLint
├── index.html              # File HTML gốc của Vite
├── package.json            # Khai báo dependencies và scripts
└── vite.config.js          # Cấu hình plugin Vite
```

---

## 📋 Yêu Cầu Môi Trường (Prerequisites)

Trước khi khởi chạy dự án, hãy đảm bảo máy tính của bạn đã cài đặt:
* **Node.js**: Phiên bản `>= 18.0.0` (Khuyên dùng bản Node.js 20 LTS)
* **npm**: Phiên bản `>= 9.0.0` (hoặc `yarn` / `pnpm`)
* **Backend Spring Boot Service**: Đang khởi chạy ở cổng `8080`.

---

## 🛠️ Hướng Dẫn Cài Đặt & Chạy Local

### Bước 1: Clone dự án hoặc chuyển vào thư mục Frontend
```bash
cd traveloka-hotel-booking-app
```

### Bước 2: Cài đặt các gói thư viện
```bash
npm install
```

### Bước 3: Thiết lập biến môi trường
Tạo file `.env` từ file mẫu `.env.example`:
```bash
cp .env.example .env
```
Mở file `.env` vừa tạo và điền các giá trị thực tế:
```env
# URL API Backend Spring Boot
VITE_API_BASE_URL=http://localhost:8080/api/v1

# Cấu hình dịch vụ Cloudinary
VITE_CLOUDINARY_CLOUD_NAME=efddn40s
VITE_CLOUDINARY_API_KEY=355369716636389
VITE_CLOUDINARY_API_SECRET=AFdh-X6AXmjKr4G7NkVkxHipxSk
```

### Bước 4: Khởi chạy dự án ở chế độ Phát triển (Development)
```bash
npm run dev
```
Trình duyệt sẽ hiển thị ứng dụng tại địa chỉ: **`http://localhost:5173`** (hoặc cổng tương ứng được Vite cấp).

---

## ⚙️ Cấu Hình Biến Môi Trường (.env)

> ⚠️ **Lưu ý quan trọng**: Mọi biến môi trường trong Vite dùng ở Frontend **bắt buộc phải có tiền tố `VITE_`**. File `.env` chứa thông tin nhạy cảm nên **không bao giờ được commit lên Git**.

| Tên Biến | Ý Nghĩa | Giá Trị Mặc Định Mẫu |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Địa chỉ gốc của Backend Spring Boot REST API | `http://localhost:8080/api/v1` |
| `VITE_CLOUDINARY_CLOUD_NAME` | Tên tài khoản Cloudinary lưu trữ hình ảnh | `efddn40s` |
| `VITE_CLOUDINARY_API_KEY` | Public API Key của dịch vụ Cloudinary | `355369716636389` |
| `VITE_CLOUDINARY_API_SECRET` | Khóa bí mật dùng để tạo chữ ký số SHA-1 upload ảnh | `AFdh-X6AXmjKr4G7...` |

---

## 📦 Các Lệnh Thường Dùng (Scripts)

| Lệnh | Công dụng |
| :--- | :--- |
| `npm run dev` | Khởi động Local Dev Server với tính năng Hot Module Replacement (HMR) siêu tốc |
| `npm run build` | Biên dịch và tối ưu hóa mã nguồn ra thư mục `dist/` để sẵn sàng triển khai Production |
| `npm run preview` | Chạy thử nghiệm bản build Production nội bộ tại Local trước khi deploy |
| `npm run lint` | Chạy bộ kiểm tra cú pháp và quy chuẩn mã nguồn ESLint |

---

## 🌿 Quy Chuẩn Git & Đóng Góp (Git Workflow)

Nhóm phát triển tuân theo mô hình **Git Feature Branch Workflow**:

1. **Nhánh chính**:
   * `main`: Nhánh ổn định cao nhất, dùng để bàn giao và demo chính thức.
   * `develop`: Nhánh làm việc tích hợp chung của toàn đội ngũ.
2. **Quy tắc tạo nhánh**:
   * Tính năng mới: `feature/<ten-tinh-nang>` (Ví dụ: `feature/hotel-filter`)
   * Sửa lỗi: `fix/<ten-loi>` (Ví dụ: `fix/payment-callback`)
   * Cập nhật tài liệu: `docs/<ten-tai-lieu>` (Ví dụ: `docs/update-readme`)
3. **Quy tắc đặt tên Commit (Conventional Commits)**:
   * `feat: ...` : Thêm tính năng mới
   * `fix: ...` : Sửa lỗi phát sinh
   * `refactor: ...` : Tái cấu trúc mã nguồn mà không đổi logic
   * `style: ...` : Chỉnh sửa CSS, giao diện
   * `docs: ...` : Cập nhật tài liệu `README.md`
   * `chore: ...` : Cập nhật cấu hình build, dependencies

---

## 👥 Thành Viên Phát Triển

* Dự án thuộc chương trình đào tạo & thực tập **Project OJT Traveloka Hotel Booking**.
* Được xây dựng và duy trì bởi đội ngũ dự án.
