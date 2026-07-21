import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, BookOpen, Brain, Trophy, Lightbulb, UserCheck, PlayCircle } from 'lucide-react';
import { useNotification } from '../../hooks/useNotification';

// Map notification types to icons and colors
const getTypeConfig = (type) => {
  switch (type) {
    case 'remedial_ready':
      return { icon: BookOpen, color: 'text-red-500', bg: 'bg-red-50' };
    case 'deep_dive_ready':
      return { icon: Brain, color: 'text-purple-500', bg: 'bg-purple-50' };
    case 'next_module_ready':
      return { icon: PlayCircle, color: 'text-blue-500', bg: 'bg-blue-50' };
    case 'curriculum_ready':
      return { icon: Lightbulb, color: 'text-amber-500', bg: 'bg-amber-50' };
    case 'welcome':
      return { icon: UserCheck, color: 'text-emerald-500', bg: 'bg-emerald-50' };
    case 'level_up':
      return { icon: Trophy, color: 'text-yellow-500', bg: 'bg-yellow-50' };
    default:
      return { icon: Bell, color: 'text-gray-500', bg: 'bg-gray-50' };
  }
};

const formatTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return 'Baru saja';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} mnt lalu`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} jam lalu`;
  return `${Math.floor(diffInSeconds / 86400)} hr lalu`;
};

export const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead 
  } = useNotification(isOpen); // Poll more frequently when open? Actually, useNotification auto-fetches. We pass true.

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleNotificationClick = (notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    
    setIsOpen(false);
    
    if (notification.link) {
      navigate(notification.link);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-500 hover:text-gray-700 transition-colors focus:outline-none rounded-full hover:bg-gray-100"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 origin-top-right rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50 overflow-hidden flex flex-col max-h-[80vh]">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50/80 backdrop-blur-sm sticky top-0 z-10">
            <h3 className="text-sm font-semibold text-gray-900">Notifikasi</h3>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
              >
                <Check size={14} />
                Tandai semua dibaca
              </button>
            )}
          </div>

          {/* List */}
          <div className="overflow-y-auto overflow-x-hidden flex-1">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-gray-500 flex flex-col items-center gap-2">
                <Bell size={24} className="text-gray-300" />
                Belum ada notifikasi
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => {
                  const config = getTypeConfig(notification.type);
                  const Icon = config.icon;
                  
                  return (
                    <div 
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`
                        group relative flex gap-4 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer
                        ${!notification.is_read ? 'bg-blue-50/30' : ''}
                      `}
                    >
                      {/* Unread Indicator */}
                      {!notification.is_read && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r" />
                      )}
                      
                      {/* Icon */}
                      <div className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${config.bg}`}>
                        <Icon className={`h-5 w-5 ${config.color}`} />
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0 pt-1">
                        <div className="flex justify-between items-start gap-2 mb-0.5">
                          <p className={`text-sm font-medium truncate ${!notification.is_read ? 'text-gray-900' : 'text-gray-700'}`}>
                            {notification.title}
                          </p>
                          <p className="text-xs text-gray-400 whitespace-nowrap shrink-0 mt-0.5">
                            {formatTimeAgo(notification.created_at)}
                          </p>
                        </div>
                        <p className={`text-xs line-clamp-2 ${!notification.is_read ? 'text-gray-700' : 'text-gray-500'}`}>
                          {notification.message}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          
          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-2 border-t border-gray-100 bg-gray-50 sticky bottom-0">
              <button 
                onClick={() => setIsOpen(false)}
                className="w-full py-1.5 text-xs text-center font-medium text-gray-500 hover:text-gray-700 transition-colors"
              >
                Tutup Notifikasi
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
