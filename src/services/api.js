export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

let warmupStarted = false;

/**
 * Đánh thức máy chủ Backend (Warm-up) ngay khi ứng dụng khởi chạy
 * và duy trì kết nối Keep-Alive định kỳ khi tab trình duyệt đang hiển thị,
 * giúp triệt tiêu độ trễ Cold Start trên môi trường đám mây (Render).
 */
export const warmupBackendApi = () => {
    if (warmupStarted || typeof window === 'undefined') return;
    warmupStarted = true;

    const pingHealth = () => {
        if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
            return;
        }
        fetch(`${API_BASE_URL}/health?warmup=true`, {
            method: 'GET',
            keepalive: true,
        }).catch(() => {
            // Bỏ qua lỗi mạng ngầm trong lúc máy chủ đang khởi động
        });
    };

    pingHealth();
    // Gửi tín hiệu Keep-Alive mỗi 4 phút khi người dùng đang mở trang
    window.setInterval(pingHealth, 4 * 60 * 1000);
};

export const apiFetch = async (endpoint, options = {}) => {
    const accessToken = localStorage.getItem('accessToken');

    // Tạo headers mặc định là application/json khi body không phải FormData
    const headers = {
        ...options.headers,
    };
    if (!(options.body instanceof FormData) && !options.headers?.['Content-Type']) {
        headers['Content-Type'] = 'application/json';
    }

    // Nếu có Access Token thì gửi lên Backend
    if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
    }

    // Gọi API lần đầu
    let response = await fetch(
        `${API_BASE_URL}${endpoint}`,
        {
            ...options,
            headers,
        }
    );
    // Xử lý khi logout hoặc Access Token hết hạn phải trả đúng mã lỗi 401
    // Đăng nhập sai hoặc đang đăng xuất/refresh cũng có thể trả về 401. Không refresh token hoặc
    // chuyển hướng trong trường hợp này để tránh vòng lặp token không mong muốn.
    const isAuthRequest =
        endpoint.includes('/auth/login') || endpoint === '/login' ||
        endpoint.includes('/auth/logout') || endpoint.includes('/auth/refresh');

    if (response.status === 401 && !isAuthRequest) {

        const refreshToken = localStorage.getItem('refreshToken');
        // Không có Refresh Token
        if (!refreshToken) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('traveloka_auth_user');
            localStorage.removeItem('traveloka_bookings');
            localStorage.removeItem('traveloka_deleted_booking_ids');

            window.location.href = '/login';
            return response;
        }

        // Gọi API Refresh Token
        const refreshResponse = await fetch(
            `${API_BASE_URL}/auth/refresh`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    refreshToken: refreshToken,
                }),
            }
        );

        // Refresh Token hết hạn / không hợp lệ
        if (!refreshResponse.ok) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('traveloka_auth_user');
            localStorage.removeItem('traveloka_bookings');
            localStorage.removeItem('traveloka_deleted_booking_ids');

            window.location.href = '/login';

            return response;
        }

        // Đọc response refresh
        const refreshData = await refreshResponse.json();

        // Backend của bạn trả token trong result
        const newAccessToken = refreshData.result.accessToken;
            
        // Lưu Access Token mới
        localStorage.setItem(
            'accessToken',
            newAccessToken
        );

        // =========================
        // Gọi lại API ban đầu
        // =========================

        response = await fetch(
            `${API_BASE_URL}${endpoint}`,
            {
                ...options,
                headers: {
                    ...headers,
                    Authorization: `Bearer ${newAccessToken}`,
                },
            }
        );


    }

    // =========================
    // 403 - Không có quyền
    // =========================
    if (response.status === 403) {
        console.log('403 - Không có quyền truy cập');
    }

    return response;
};