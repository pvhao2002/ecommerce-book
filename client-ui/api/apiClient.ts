// app/api/apiClient.ts
import axios from 'axios';
import { API_BASE_URL } from '@/constants/api';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Attach token vào request
apiClient.interceptors.request.use((config) => {
    const token = typeof window !== 'undefined'
        ? localStorage.getItem('auth_token')
        : null;

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Auto logout khi server trả về 401 / 403
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {

        if (typeof window !== 'undefined') {
            const status = error?.response?.status;

            if (status === 401 || status === 403) {
                // Xoá tất cả token
                localStorage.removeItem('auth_token');
                localStorage.removeItem('refresh_token');
                localStorage.removeItem('user_email');
                localStorage.removeItem('user_role');

                // Redirect về trang login
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;
