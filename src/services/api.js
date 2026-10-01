const API_BASE_URL = import.meta.env.VITE_API_BASE_URL  || 'http://localhost:8080/api/v1';

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
    if (response.status === 401) {

        const refreshToken = localStorage.getItem('refreshToken');
        // Không có Refresh Token
        if (!refreshToken) {
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