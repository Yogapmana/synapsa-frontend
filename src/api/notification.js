import api from './client';

export const notificationApi = {
  getNotifications: (limit = 50) => 
    api.get(`/notifications?limit=${limit}`),
    
  markAsRead: (notificationId) => 
    api.put(`/notifications/${notificationId}/read`),
    
  markAllAsRead: () => 
    api.put('/notifications/read-all'),
};
