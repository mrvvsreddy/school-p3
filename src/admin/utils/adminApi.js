/**
 * Admin API utilities - handles authentication using cookies
 */

const API_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:8000';
const API_BASE = `${API_URL}/api/v1`;

// Get admin token from cookie
export const getAdminToken = () => {
    const match = document.cookie.match(/adminToken=([^;]+)/);
    return match ? match[1] : null;
};

// Set admin session in cookies
export const setAdminSession = (data) => {
    const maxAge = 4 * 60 * 60; // 4 hours
    if (data.access_token) {
        document.cookie = `adminToken=${data.access_token}; path=/; max-age=${maxAge}; SameSite=Strict`;
    }
    if (data.role) {
        document.cookie = `adminRole=${data.role}; path=/; max-age=${maxAge}; SameSite=Strict`;
    }
    if (data.full_name) {
        document.cookie = `adminName=${encodeURIComponent(data.full_name)}; path=/; max-age=${maxAge}; SameSite=Strict`;
    }
    if (data.admin_id) {
        document.cookie = `adminId=${data.admin_id}; path=/; max-age=${maxAge}; SameSite=Strict`;
    }
    if (data.profile_image) {
        document.cookie = `adminImage=${encodeURIComponent(data.profile_image)}; path=/; max-age=${maxAge}; SameSite=Strict`;
    }
};

// Clear admin session
export const clearAdminSession = () => {
    document.cookie = 'adminToken=; path=/; max-age=0';
    document.cookie = 'adminRole=; path=/; max-age=0';
    document.cookie = 'adminName=; path=/; max-age=0';
    document.cookie = 'adminId=; path=/; max-age=0';
    document.cookie = 'adminImage=; path=/; max-age=0';
};

// Get admin info from cookies
export const getAdminInfo = () => {
    const getCookie = (name) => {
        const match = document.cookie.match(new RegExp(`${name}=([^;]+)`));
        return match ? decodeURIComponent(match[1]) : null;
    };
    return {
        token: getAdminToken(),
        role: getCookie('adminRole'),
        name: getCookie('adminName'),
        adminId: getCookie('adminId'),
        image: getCookie('adminImage')
    };
};

// Authenticated fetch wrapper
export const adminFetch = async (endpoint, options = {}) => {
    const token = getAdminToken();

    if (!token) {
        window.location.href = '/admin/login';
        throw new Error('No authentication token');
    }

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
    };

    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers
    });

    if (response.status === 401) {
        clearAdminSession();
        window.location.href = '/admin/login';
        throw new Error('Authentication required');
    }

    return response;
};

// Public fetch wrapper (no auth required)
export const publicFetch = async (endpoint, options = {}) => {
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers
    });

    return response;
};

// Export API_BASE for direct use if needed
export { API_BASE };

export default adminFetch;

