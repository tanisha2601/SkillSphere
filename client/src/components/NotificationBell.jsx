import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../services/notificationService';

import {
  setNotifications,
  addNotification,
  markAllRead,
  markOneRead,
} from '../store/slices/notificationSlice';

import { getSocket } from '../services/socket';

const timeAgo = (dateStr) => {
  const diffMs = Date.now() - new Date(dateStr).getTime();

  const mins = Math.floor(diffMs / 60000);

  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;

  const hrs = Math.floor(mins / 60);

  if (hrs < 24) return `${hrs}h ago`;

  const days = Math.floor(hrs / 24);

  return `${days}d ago`;
};

export default function NotificationBell() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { token, user } = useSelector((state) => state.auth);

  const { notifications, unreadCount } = useSelector((state) => state.notification);

  const [open, setOpen] = useState(false);

  const wrapperRef = useRef(null);

  // Load notifications
  useEffect(() => {
    if (!token) return;

    const load = async () => {
      try {
        const res = await getNotifications();

        dispatch(
          setNotifications({
            notifications: res.data.notifications,
            unreadCount: res.data.unreadCount,
          })
        );
      } catch (err) {
        console.log(err);
      }
    };

    load();
  }, [token, dispatch]);

  // Socket notifications
  useEffect(() => {
    if (!token || !user) return;

    const socket = getSocket();

    if (!socket) return;

    const handleNew = (notification) => {
      dispatch(addNotification(notification));

      toast.success(notification.title || 'New notification');
    };

    socket.on('new_notification', handleNew);

    return () => {
      socket.off('new_notification', handleNew);
    };
  }, [token, user, dispatch]);

  // Outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handler);

    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!token) return null;

  const handleItemClick = async (notification) => {
    if (!notification.isRead) {
      dispatch(markOneRead(notification._id));

      try {
        await markNotificationRead(notification._id);
      } catch {}
    }

    setOpen(false);

    if (notification.link) {
      navigate(notification.link);
    }
  };

  const handleMarkAllRead = async () => {
    dispatch(markAllRead());

    try {
      await markAllNotificationsRead();
    } catch {}
  };

  return (
    <div className="relative" ref={wrapperRef}>
      {/* Bell */}
      <button
        onClick={() => setOpen(!open)}
        className="
          relative
          w-11
          h-11
          rounded-2xl
          bg-white/[0.04]
          border
          border-white/10
          text-lg
          flex
          items-center
          justify-center
          hover:bg-white/[0.08]
          transition-all
        "
      >
        🔔
        {unreadCount > 0 && (
          <span
            className="
            absolute
            -top-1
            -right-1
            min-w-[22px]
            h-[22px]
            rounded-full
            bg-gradient-to-r
            from-rose-500
            to-red-600
            text-white
            text-[11px]
            font-bold
            flex
            items-center
            justify-center
          "
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="
            absolute
            top-14
            right-2
            w-[380px]
            rounded-[36px]
            border
            border-white/10
            bg-[#0b1023]
            backdrop-blur-3xl
            shadow-2xl
            overflow-hidden
            z-[9999]
          "
        >
          {/* Header */}
          <div
            className="
              flex
              items-center
              justify-between
              px-5
              py-4
              border-b
              border-white/10
            "
          >
            <h3 className="text-white font-bold text-lg">Notifications</h3>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="
                  text-sm
                  text-violet-400
                  hover:text-violet-300
                "
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Content */}
          <div className="max-h-[500px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-16 text-center">
                <div className="text-5xl mb-4">🔔</div>

                <p className="text-slate-400">No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification._id}
                  onClick={() => handleItemClick(notification)}
                  className={`
                      w-full
                      text-left
                      px-5
                      py-4
                      border-b
                      border-white/5
                      hover:bg-white/5
                      transition-all
                      ${!notification.isRead ? 'bg-violet-500/10' : ''}
                    `}
                >
                  <p className="font-semibold text-white">{notification.title}</p>

                  <p className="text-sm text-slate-400 mt-2">{notification.message}</p>

                  <p className="text-xs text-slate-500 mt-3">{timeAgo(notification.createdAt)}</p>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
