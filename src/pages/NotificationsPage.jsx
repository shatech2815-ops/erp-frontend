import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, Info, AlertTriangle, ChevronRight, ExternalLink, X, Eye, ArrowRight } from 'lucide-react';
import { useNotifications, resolveNotificationRoute, getNotificationTargetLabel } from '../context/NotificationContext';

const NotificationsPage = () => {
  const navigate = useNavigate();
  const { notifications, unreadCount, markAllAsRead, markAsRead } = useNotifications();
  const [selectedNotification, setSelectedNotification] = useState(null);

  const handleOpenPage = (notification, e) => {
    if (e) e.stopPropagation();
    markAsRead(notification.id);
    const targetRoute = notification.route || resolveNotificationRoute(notification);
    if (targetRoute) {
      navigate(targetRoute);
    }
  };

  const handleOpenDetails = (notification, e) => {
    if (e) e.stopPropagation();
    markAsRead(notification.id);
    setSelectedNotification(notification);
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-indigo-500/15 text-indigo-300"><Bell size={24} /></div>
            <div>
              <h1 className="text-2xl font-bold text-white">Notifications</h1>
              <p className="text-sm text-gray-400">{unreadCount ? `${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}` : 'You are all caught up'}</p>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={markAllAsRead}
          disabled={!unreadCount}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <CheckCheck size={17} /> Mark all as read
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#140f2d]/80 shadow-xl">
        {notifications.length === 0 ? (
          <div className="p-12 text-center text-sm text-gray-400">No notifications yet.</div>
        ) : notifications.map((notification) => {
          const isAlert = notification.type === 'alert';
          const Icon = isAlert ? AlertTriangle : Info;
          const targetLabel = getNotificationTargetLabel(notification);

          return (
            <div
              key={notification.id}
              onClick={() => handleOpenPage(notification)}
              className={`group flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 p-5 text-left transition-all duration-150 last:border-b-0 hover:bg-white/10 cursor-pointer ${notification.read ? 'opacity-65' : ''}`}
            >
              <div className="flex items-start gap-4 min-w-0 flex-1">
                <span className={`mt-0.5 rounded-xl p-2.5 flex-shrink-0 ${isAlert ? 'bg-red-500/15 text-red-400' : 'bg-indigo-500/15 text-indigo-300'}`}>
                  <Icon size={20} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-white group-hover:text-indigo-300 transition-colors text-base">{notification.title}</span>
                    {!notification.read && <span className="h-2 w-2 rounded-full bg-indigo-400" aria-label="Unread" />}
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-300">
                      {targetLabel}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-300 leading-relaxed">{notification.message}</p>
                  <span className="mt-2 block text-xs text-gray-500">{notification.createdAt}</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2.5 self-end sm:self-center flex-shrink-0">
                <button
                  type="button"
                  onClick={(e) => handleOpenDetails(notification, e)}
                  className="px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/15 text-xs font-semibold text-gray-300 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
                  title="View full notification details"
                >
                  <Eye size={13} />
                  <span>Details</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => handleOpenPage(notification, e)}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600/80 hover:bg-indigo-600 text-xs font-semibold text-white transition-all flex items-center gap-1.5 shadow-sm group-hover:translate-x-0.5 cursor-pointer"
                  title={`Go to ${targetLabel}`}
                >
                  <span>Go to {targetLabel}</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Details Modal */}
      {selectedNotification && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
          onClick={() => setSelectedNotification(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-3xl border border-white/15 bg-[#171233] p-6 shadow-2xl relative animate-fade-in-up"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${selectedNotification.type === 'alert' ? 'bg-red-500/15 text-red-400' : 'bg-indigo-500/15 text-indigo-300'}`}>
                  {selectedNotification.type === 'alert' ? <AlertTriangle size={20} /> : <Info size={20} />}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">{selectedNotification.title}</h3>
                  <p className="text-xs text-gray-400">{selectedNotification.createdAt}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedNotification(null)}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-xs uppercase tracking-wider text-gray-400 font-semibold block mb-1">Message</label>
                <div className="p-3.5 rounded-xl bg-black/30 border border-white/5 text-sm text-gray-200 leading-relaxed">
                  {selectedNotification.message}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-gray-400 block mb-1">Status</span>
                  <span className="font-semibold text-emerald-400">Read</span>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-gray-400 block mb-1">Destination</span>
                  <span className="font-semibold text-indigo-300">{getNotificationTargetLabel(selectedNotification)}</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setSelectedNotification(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-300 hover:bg-white/5 transition-colors"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const target = selectedNotification.route || resolveNotificationRoute(selectedNotification);
                  setSelectedNotification(null);
                  if (target) navigate(target);
                }}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-colors flex items-center gap-2 shadow-lg"
              >
                <span>Open {getNotificationTargetLabel(selectedNotification)}</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
