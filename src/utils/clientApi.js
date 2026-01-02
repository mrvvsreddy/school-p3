/**
 * Client API utilities - for public/read-only data fetching
 * No authentication required - used by public-facing pages
 */

const API_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:8000';
const API_BASE = `${API_URL}/api/v1`;

/**
 * Fetch data from public API endpoints (no auth required)
 * @param {string} endpoint - API endpoint path (e.g., '/site-content/public/home')
 * @param {object} options - Fetch options
 * @returns {Promise<Response>}
 */
export const clientFetch = async (endpoint, options = {}) => {
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers
        });
        return response;
    } catch (error) {
        console.error('Client API Error:', error);
        throw error;
    }
};

/**
 * Fetch page content from the public API
 * @param {string} pageSlug - Page identifier (e.g., 'home', 'about', 'contact')
 * @returns {Promise<object>} - Content map keyed by section_key
 */
export const fetchPageContent = async (pageSlug) => {
    try {
        const response = await clientFetch(`/site-content/public/${pageSlug}`);
        if (response.ok) {
            const data = await response.json();
            // Transform array to object keyed by section_key
            const contentMap = {};
            data.forEach(section => {
                contentMap[section.section_key] = section.content;
            });
            return contentMap;
        }
        return {};
    } catch (error) {
        console.error(`Failed to fetch ${pageSlug} content:`, error);
        return {};
    }
};

/**
 * Fetch JSON data from any public endpoint
 * @param {string} endpoint - API endpoint
 * @returns {Promise<any>}
 */
export const fetchJson = async (endpoint) => {
    try {
        const response = await clientFetch(endpoint);
        if (response.ok) {
            return await response.json();
        }
        return null;
    } catch (error) {
        console.error(`Failed to fetch ${endpoint}:`, error);
        return null;
    }
};

export { API_BASE };
export default clientFetch;
