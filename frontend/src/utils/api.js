const API_BASE = import.meta.env.VITE_API_URL || '/api';

async function fetchAPI(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`Failed to fetch ${endpoint}:`, error);
        throw error;
    }
}

export const api = {
    // Dashboard
    getDashboardSummary: () => fetchAPI('/dashboard/summary'),
    getActivities: () => fetchAPI('/dashboard/activities'),

    // Regions
    getRegions: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return fetchAPI(`/regions${query ? `?${query}` : ''}`);
    },
    getRegionTimeSeries: (regionId, months = 24) =>
        fetchAPI(`/region/${regionId}/timeseries?months=${months}`),

    // Carbon Credits
    getCredits: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return fetchAPI(`/credits${query ? `?${query}` : ''}`);
    },
    getCreditHistory: () => fetchAPI('/credits/history'),

    // Satellite
    getNDVIData: (regionId = null) =>
        fetchAPI(`/satellite/ndvi${regionId ? `?region_id=${regionId}` : ''}`),

    // Prediction
    predict: (data) =>
        fetchAPI('/predict', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
};

export default api;
