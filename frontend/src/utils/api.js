import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Store logout callback that will be set by AuthContext
let logoutCallback = null;

export const setLogoutCallback = (callback) => {
  logoutCallback = callback;
};

// Add a response interceptor to handle authentication errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      console.log('401 error detected, logging out user');

      // Call the logout callback from AuthContext if available
      if (logoutCallback) {
        logoutCallback();
      } else {
        // Fallback: clear localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        console.log('Fallback: cleared localStorage');
      }
    }

    return Promise.reject(error);
  }
);

export const searchUsers = async (query) => {
  try {
    const response = await api.get(
      `/users/search?query=${encodeURIComponent(query)}`
    );
    return response.data;
  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
};

// Notification functions
export const getNotifications = async (
  page = 1,
  limit = 20,
  filter = 'all'
) => {
  try {
    const response = await api.get(
      `/notifications?page=${page}&limit=${limit}&filter=${filter}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

export const getUnreadNotificationCount = async () => {
  try {
    const response = await api.get(
      '/notifications?limit=1&filter=unread'
    );
    return response.data.pagination?.unreadCount || 0;
  } catch (error) {
    console.error('Error fetching unread notification count:', error);
    return 0;
  }
};

export const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await api.patch(
      `/notifications/${notificationId}/read`
    );
    return response.data;
  } catch (error) {
    console.error(
      'Error marking notification as read:',
      error
    );
    throw error;
  }
};

export const markAllNotificationAsRead = async () => {
  try {
    const response = await api.patch('/notifications/read-all');
    return response.data;
  } catch (error) {
    console.error(
      'Error marking all notifications as read:',
      error
    );
    throw error;
  }
};

// Story search function
export const searchStories = async (
  query,
  page = 1,
  limit = 20
) => {
  try {
    const response = await api.get(
      `/stories/search?q=${encodeURIComponent(query)}`
    );
    return response.data;
  } catch (error) {
    console.error('Error searching stories:', error);
    throw error;
  }
};

// Draft functions
export const saveDraft = async (draftData) => {
  try {
    const response = await api.post('/drafts/save', draftData);
    return response.data;
  } catch (error) {
    console.error('Error saving draft:', error);
    throw error;
  }
};

export const getDrafts = async (type = null, storyId = null) => {
  try {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (storyId) params.append('storyId', storyId);

    const response = await api.get(`/drafts?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching drafts:', error);
    throw error;
  }
};

export const getDraft = async (draftId) => {
  try {
    const response = await api.get(`/drafts/${draftId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching draft:', error);
    throw error;
  }
};

export const deleteDraft = async (draftId) => {
  try {
    const response = await api.delete(`/drafts/${draftId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting draft:', error);
    throw error;
  }
};

export default api;
