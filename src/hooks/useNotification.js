import { useState, useEffect, useCallback, useRef } from 'react';
import { notificationApi } from '../api/notification';

export const useNotification = (autoFetch = true) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Use ref to track if we're currently fetching to avoid race conditions
  const fetchingRef = useRef(false);

  const fetchNotifications = useCallback(async () => {
    if (fetchingRef.current) return;
    
    try {
      fetchingRef.current = true;
      setLoading(true);
      const response = await notificationApi.getNotifications();
      setNotifications(response.data);
      setUnreadCount(response.data.filter(n => !n.is_read).length);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
      setError('Gagal memuat notifikasi');
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, []);

  const markAsRead = async (id) => {
    try {
      // Optimistic update
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      await notificationApi.markAsRead(id);
    } catch (err) {
      console.error('Failed to mark notification as read', err);
      // Revert on error
      fetchNotifications();
    }
  };

  const markAllAsRead = async () => {
    if (unreadCount === 0) return;
    
    try {
      // Optimistic update
      setNotifications(prev => 
        prev.map(n => ({ ...n, is_read: true }))
      );
      setUnreadCount(0);
      
      await notificationApi.markAllAsRead();
    } catch (err) {
      console.error('Failed to mark all as read', err);
      // Revert on error
      fetchNotifications();
    }
  };

  const deleteNotification = async (id) => {
    try {
      const notifToDelete = notifications.find(n => n.id === id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      if (notifToDelete && !notifToDelete.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      await notificationApi.deleteNotification(id);
    } catch (err) {
      console.error('Failed to delete notification', err);
      fetchNotifications();
    }
  };

  const deleteAllNotifications = async () => {
    try {
      setNotifications([]);
      setUnreadCount(0);
      await notificationApi.deleteAllNotifications();
    } catch (err) {
      console.error('Failed to delete all notifications', err);
      fetchNotifications();
    }
  };

  useEffect(() => {
    if (autoFetch) {
      fetchNotifications();
      
      // Auto refresh every 30 seconds
      const intervalId = setInterval(fetchNotifications, 30000);
      return () => clearInterval(intervalId);
    }
  }, [autoFetch, fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications
  };
};
