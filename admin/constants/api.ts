// app/constants/api.ts
export const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || 'http://192.168.2.53:9605/app';

export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: `${API_BASE_URL}/auth/login-admin`,
        REGISTER: `${API_BASE_URL}/auth/register`,
        PROFILE: `${API_BASE_URL}/auth/profile`,
    },
    CATEGORIES: {
        BASE: `${API_BASE_URL}/products/categories`,
        ADMIN: `${API_BASE_URL}/admin/categories`
    },
    PRODUCTS: {
        BASE: `${API_BASE_URL}/products`,
        ADMIN: `${API_BASE_URL}/admin/products`
    },
    USERS: {
        BASE: `${API_BASE_URL}/admin/users`,
    },
    ORDERS: {
        BASE: `${API_BASE_URL}/admin/orders`,
    },
    STATISTICS: {
        DASHBOARD: `${API_BASE_URL}/statistics/dashboard`,
        SALES: `${API_BASE_URL}/statistics/sales`,
    },
    ADMIN: {
        DASHBOARD: '/admin/dashboard',
    }
};
