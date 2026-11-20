import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'erp-notifications';

export const resolveNotificationRoute = (notification) => {
  if (!notification) return '/dashboard';
  if (notification.route) return notification.route;
  if (notification.link) return notification.link;
  if (notification.path) return notification.path;

  const text = `${notification.id || ''} ${notification.title || ''} ${notification.message || ''}`.toLowerCase();

  if (text.includes('po') || text.includes('purchase order')) {
    return '/dashboard/purchase/purchase-orders/po-list';
  }
  if (text.includes('invoice') || text.includes('inv-')) {
    return '/dashboard/vendor/invoices/list';
  }
  if (text.includes('rfq') || text.includes('quote')) {
    return '/dashboard/purchase/rfqs/rfq-list';
  }
  if (text.includes('contract')) {
    return '/dashboard/vendor/contracts/list';
  }
  if (text.includes('vendor')) {
    return '/dashboard/vendor/vendors/list';
  }
  if (text.includes('grn') || text.includes('goods receipt')) {
    return '/dashboard/purchase/grn-list';
  }
  if (text.includes('stock') || text.includes('inventory')) {
    return '/dashboard/stock/inventory/stock-levels';
  }
  if (text.includes('lead')) {
    return '/dashboard/client/leads/list';
  }
  if (text.includes('opportunity') || text.includes('deal')) {
    return '/dashboard/client/opportunities/list';
  }
  if (text.includes('order')) {
    return '/dashboard/client/orders/list';
  }
  if (text.includes('client')) {
    return '/dashboard/client/clients/list';
  }
  if (text.includes('service')) {
    return '/dashboard/client/service/history';
  }
  if (text.includes('complaint')) {
    return '/dashboard/client/service/complaints';
  }
  if (text.includes('warranty')) {
    return '/dashboard/client/service/warranty';
  }
  if (text.includes('payment')) {
    return '/dashboard/accounts/payments/list';
  }

  return '/dashboard';
};

export const getNotificationTargetLabel = (notification) => {
  const route = resolveNotificationRoute(notification);
  if (route.includes('/purchase-orders')) return 'Purchase Orders';
  if (route.includes('/invoices')) return 'Vendor Invoices';
  if (route.includes('/rfqs')) return 'RFQs & Quotes';
  if (route.includes('/contracts')) return 'Contracts';
  if (route.includes('/vendors')) return 'Vendors';
  if (route.includes('/grn')) return 'Goods Receipt (GRN)';
  if (route.includes('/stock') || route.includes('/inventory')) return 'Inventory Stock';
  if (route.includes('/leads')) return 'Leads';
  if (route.includes('/opportunities')) return 'Opportunities';
  if (route.includes('/orders')) return 'Orders';
  if (route.includes('/clients')) return 'Clients';
  if (route.includes('/service')) return 'Service Management';
  if (route.includes('/complaints')) return 'Complaints';
  if (route.includes('/payments')) return 'Payments';
  return 'Dashboard';
};

const DEFAULT_NOTIFICATIONS = [
  {
    id: 'po-2026-0045',
    title: 'New PO Created',
    message: 'PO-2026-0045 requires approval',
    type: 'info',
    createdAt: 'Just now',
    read: false,
    route: '/dashboard/purchase/purchase-orders/po-list',
  },
  {
    id: 'invoice-992',
    title: 'Invoice Overdue',
    message: 'INV-992 from Bharat Tools is overdue',
    type: 'alert',
    createdAt: 'Today',
    read: false,
    route: '/dashboard/vendor/invoices/list',
  },
];

const NotificationContext = createContext(null);

const getStoredNotifications = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return DEFAULT_NOTIFICATIONS;
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_NOTIFICATIONS;
    return parsed.map((item) => ({
      ...item,
      route: item.route || resolveNotificationRoute(item),
    }));
  } catch {
    return DEFAULT_NOTIFICATIONS;
  }
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState(getStoredNotifications);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  }, [notifications]);

  const value = useMemo(() => ({
    notifications,
    unreadCount: notifications.filter((notification) => !notification.read).length,
    markAllAsRead: () => setNotifications((current) => current.map((notification) => ({ ...notification, read: true }))),
    markAsRead: (id) => setNotifications((current) => current.map((notification) => (
      notification.id === id ? { ...notification, read: true } : notification
    ))),
    addNotification: (item) => {
      const fullItem = {
        id: `notif-${Date.now()}`,
        createdAt: 'Just now',
        read: false,
        type: 'info',
        ...item,
      };
      fullItem.route = fullItem.route || resolveNotificationRoute(fullItem);
      setNotifications((current) => [fullItem, ...current]);
    },
  }), [notifications]);

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within a NotificationProvider');
  return context;
};
