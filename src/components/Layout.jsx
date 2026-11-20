import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Search, MessageCircle, BellDot, Menu, X,
  LayoutDashboard, ChevronDown, ChevronRight,
  ShoppingCart, Users, UserCheck, Calculator, Package, Warehouse,
  FileText, Activity, BarChart2, Settings, DollarSign,
  Tag, Wrench, Briefcase, TrendingUp, ClipboardList, Zap, Building2,
  Rocket, Moon, Sun, Truck, Scale, FileSpreadsheet,
} from 'lucide-react';
import LeadImage from "../assets/images/dp.jpeg";
import LogoImg from "../assets/aminoid_logo.png";
import { useNotifications, resolveNotificationRoute } from '../context/NotificationContext';

const SECTION_ICONS = {
  'Purchase Orders': ShoppingCart,
  'Vendors': Users,
  'Inventory': Package,
  'Requisitions': ClipboardList,
  'RFQs & Quotes': FileText,
  'Quotations': Scale,
  'Goods Receipt': Truck,
  'Reports': BarChart2,
  'Settings': Settings,
  'Contracts': FileText,
  'Invoices': DollarSign,
  'Performance': Activity,
  'Clients': Building2,
  'Leads': TrendingUp,
  'Opportunities': Briefcase,
  'Orders': ShoppingCart,
  'Service': Wrench,
  'Financials': DollarSign,
  'Payments': DollarSign,
  'Expenses': Tag,
  'Cost Centers': Building2,
  'Budgets': TrendingUp,
  'Fixed Assets': Briefcase,
  'Advances': Users,
  'Stock': Package,
  'Items': Package,
  'Warehouse': Warehouse,
  'Production': Zap,
  'Manage Webhooks': Zap,
  'Logs': Activity,
};

const MODULE_COLORS = {
  purchase:      { from: '#3b82f6', to: '#2563eb', text: '#60a5fa' },
  vendor:        { from: '#10b981', to: '#059669', text: '#34d399' },
  client:        { from: '#8b5cf6', to: '#7c3aed', text: '#a78bfa' },
  accounts:      { from: '#f59e0b', to: '#d97706', text: '#fbbf24' },
  stock:         { from: '#ef4444', to: '#dc2626', text: '#f87171' },
  inventorymgmt: { from: '#14b8a6', to: '#0d9488', text: '#2dd4bf' },
  webhooks:      { from: '#f43f5e', to: '#be123c', text: '#fb7185' },
};

const sidebarModules = [
  {
    key: 'purchase',
    label: 'Purchase Management',
    icon: ShoppingCart,
    basePath: '/dashboard/purchase',
    sections: [
      { id: 'purchase-orders', label: 'Purchase Orders' },
      { id: 'vendors',         label: 'Vendors' },
      { id: 'inventory',       label: 'Inventory' },
      { id: 'requisitions',    label: 'Requisitions' },
      { id: 'rfqs',            label: 'RFQs & Quotes' },
      { id: 'quotations',      label: 'Quotations' },
      { id: 'grn',             label: 'Goods Receipt' },
      { id: 'reports',         label: 'Reports' },
      { id: 'settings',        label: 'Settings' },
    ],
  },
  {
    key: 'vendor',
    label: 'Vendor Management',
    icon: Users,
    basePath: '/dashboard/vendor',
    sections: [
      { id: 'vendors',     label: 'Vendors' },
      { id: 'contracts',   label: 'Contracts' },
      { id: 'invoices',    label: 'Invoices' },
      { id: 'performance', label: 'Performance' },
      { id: 'reports',     label: 'Reports' },
      { id: 'settings',    label: 'Settings' },
    ],
  },
  {
    key: 'client',
    label: 'Client Management',
    icon: UserCheck,
    basePath: '/dashboard/client',
    sections: [
      { id: 'clients',       label: 'Clients' },
      { id: 'leads',         label: 'Leads' },
      { id: 'opportunities', label: 'Opportunities' },
      { id: 'orders',        label: 'Orders' },
      { id: 'service',       label: 'Service' },
      { id: 'reports',       label: 'Reports' },
    ],
  },
  {
    key: 'accounts',
    label: 'Accounts Management',
    icon: Calculator,
    basePath: '/dashboard/accounts',
    sections: [
      { id: 'financials',        label: 'Financials' },
      { id: 'invoices',          label: 'Invoices' },
      { id: 'payments',          label: 'Payments' },
      { id: 'expenses',          label: 'Expenses' },
      { id: 'vendors',           label: 'Vendors' },
      { id: 'cost-centers',      label: 'Cost Centers' },
      { id: 'budgets',           label: 'Budgets' },
      { id: 'fixed-assets',      label: 'Fixed Assets' },
      { id: 'employee-advances', label: 'Advances' },
      { id: 'reports',           label: 'Reports' },
    ],
  },
  {
    key: 'stock',
    label: 'Stock Management',
    icon: Package,
    basePath: '/dashboard/stock',
    sections: [
      { id: 'inventory',  label: 'Inventory' },
      { id: 'items',      label: 'Items' },
      { id: 'warehouse',  label: 'Warehouse' },
      { id: 'production', label: 'Production' },
      { id: 'reports',    label: 'Reports' },
      { id: 'settings',   label: 'Settings' },
    ],
  },
  {
    key: 'inventorymgmt',
    label: 'Inventory Management',
    icon: Warehouse,
    basePath: '/dashboard/inventorymgmt',
    sections: [
      { id: 'items',      label: 'Items' },
      { id: 'stock',      label: 'Stock' },
      { id: 'warehouse',  label: 'Warehouse' },
      { id: 'production', label: 'Production' },
      { id: 'reports',    label: 'Reports' },
    ],
  },
  {
    key: 'webhooks',
    label: 'Webhooks',
    icon: Zap,
    basePath: '/dashboard/webhooks',
    sections: [
      { id: 'manage', label: 'Manage Webhooks', path: '/dashboard/webhooks/manage-webhooks' },
      { id: 'logs',   label: 'Logs',            path: '/dashboard/webhooks/logs' },
    ],
  },
];

const toId = (label) => label.toLowerCase().replace(/\s+/g, '-');

const BrandLogo = ({ size = 40 }) => (
  <div className="relative flex items-center justify-center overflow-hidden" style={{ width: size, height: size }}>
    <img src={LogoImg} alt="Brand Logo" className="w-full h-full object-contain" />
  </div>
);

const Sidebar = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [openModules, setOpenModules] = useState({ purchase: true });

  const toggle = (key) => setOpenModules((p) => ({ ...p, [key]: !p[key] }));
  const go = (path) => { navigate(path); setIsOpen(false); };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsOpen(false)} />
      )}
      <div className={`
        fixed lg:static inset-y-4 left-4 z-50
        w-[305px] min-w-[305px] bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[32px]
        transform transition-all duration-500 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-[120%] lg:translate-x-0'}
        flex flex-col justify-between shadow-2xl overflow-hidden
      `}>
        <button className="lg:hidden absolute top-5 right-5 text-gray-400 hover:text-white p-2 rounded-full bg-white/10" onClick={() => setIsOpen(false)}>
          <X size={18} />
        </button>

        <div className="px-6 pt-7 pb-5 flex items-center gap-3.5 relative">
          <BrandLogo size={44} />
          <div className="flex flex-col">
            <span className="text-lg font-black text-white tracking-tight">Aminoid Ai</span>
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Enterprise ERP</span>
          </div>
        </div>

        <nav className="flex-1 px-3 py-2 space-y-1.5 overflow-y-auto custom-scrollbar">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] px-3 mb-3 mt-1">Menu</p>
          
          <button
            onClick={() => go('/dashboard')}
            className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-2xl transition-all duration-300 ${
              location.pathname === '/dashboard'
                ? 'bg-white/10 text-white shadow-[0_4px_12px_rgba(0,0,0,0.1)] border border-white/10'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <LayoutDashboard size={19} className={location.pathname === '/dashboard' ? 'text-indigo-400' : ''} />
            <span className="font-semibold text-sm">Dashboard</span>
          </button>

          <div className="my-3 px-2"><hr className="border-white/5" /></div>

          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] px-3 mb-3">Modules</p>
          
          <div className="space-y-1.5">
            {sidebarModules.filter(module => {
              try {
                const userObj = JSON.parse(localStorage.getItem('user'));
                const role = userObj?.user?.role || userObj?.role || 'admin';
                if (role === 'admin') return true;
                return module.key === role;
              } catch (e) {
                return true;
              }
            }).map(({ key, label, icon: Icon, basePath, sections }) => {
              const open = openModules[key];
              const active = location.pathname.startsWith(basePath);
              const colors = MODULE_COLORS[key] || MODULE_COLORS.purchase;

              return (
                <div key={key} className="relative">
                  <button
                    onClick={() => { toggle(key); if (!open) go(basePath); }}
                    className={`w-full flex items-center justify-between gap-2.5 px-3.5 py-2.5 rounded-2xl transition-all duration-300 ${
                      active
                        ? 'bg-white/10 text-white border border-white/10 shadow-sm'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className={`p-1.5 rounded-lg flex-shrink-0 transition-all duration-300 ${active ? 'shadow-md scale-105' : 'bg-white/5'}`} style={{ 
                        backgroundImage: active ? `linear-gradient(to bottom right, ${colors.from}, ${colors.to})` : ''
                      }}>
                        <Icon size={16} className={active ? 'text-white' : 'text-gray-400'} />
                      </div>
                      <span className="font-semibold text-sm whitespace-nowrap overflow-hidden text-ellipsis text-left flex-1">{label}</span>
                    </div>
                    {open ? <ChevronDown size={14} className="text-gray-500 flex-shrink-0" /> : <ChevronRight size={14} className="text-gray-500 flex-shrink-0" />}
                  </button>

                  {open && (
                    <div className="ml-7 mt-1.5 mb-2 space-y-0.5 relative before:absolute before:left-0 before:top-2 before:bottom-2 before:w-[2px] before:bg-white/10 before:rounded-full pl-2">
                      {sections.map((sec) => {
                        const secLabel = typeof sec === 'string' ? sec : sec.label;
                        const secId = typeof sec === 'string' ? toId(sec) : sec.id;
                        const secPath = typeof sec === 'object' && sec.path ? sec.path : `${basePath}/${secId}`;
                        const SIcon = SECTION_ICONS[secLabel] || Package;
                        const secActive = location.pathname === secPath || location.pathname.startsWith(secPath + '/');
                        return (
                          <button
                            key={secId || secLabel}
                            onClick={() => go(secPath)}
                            className={`w-full flex items-center justify-between gap-2.5 px-3 py-1.5 rounded-xl text-[13px] transition-all duration-200 group text-left ${
                              secActive
                                ? 'text-white bg-white/10 font-semibold shadow-sm'
                                : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                              <SIcon
                                size={14}
                                className={`flex-shrink-0 transition-all ${secActive ? 'scale-110' : 'opacity-70 group-hover:opacity-100'}`}
                                style={{ color: secActive ? colors.text : undefined }}
                              />
                              <span className="font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                                {secLabel}
                              </span>
                            </div>
                            {secActive && (
                              <div
                                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                style={{ backgroundColor: colors.text }}
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>
        
        <button
          type="button"
          onClick={() => navigate('/dashboard/settings')}
          className="w-[calc(100%-1.5rem)] p-3.5 m-3 rounded-2xl bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-500/20 relative overflow-hidden group cursor-pointer hover:border-indigo-500/40 transition-colors text-left"
        >
          <div className="absolute -top-2 -right-2 p-4 opacity-10 group-hover:opacity-20 transition-all duration-500 transform group-hover:rotate-45">
            <Settings size={64} />
          </div>
          <div className="relative z-10 flex flex-col gap-0.5">
            <span className="text-white font-bold text-sm">System Config</span>
            <span className="text-indigo-200 text-xs">Manage ERP Settings</span>
          </div>
        </button>
      </div>
    </>
  );
};

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [navbarSearch, setNavbarSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const { notifications, unreadCount, markAllAsRead, markAsRead } = useNotifications();

  const notificationDropdownRef = useRef(null);
  const profileDropdownRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationDropdownRef.current &&
        !notificationDropdownRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target)
      ) {
        setShowProfile(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // Close dropdowns on route navigation
  useEffect(() => {
    setShowNotifications(false);
    setShowProfile(false);
  }, [location.pathname, location.search]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="min-h-screen relative bg-[#0B0A10] dark:text-white text-gray-100 overflow-hidden dark">
      {/* Dynamic Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px]" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 flex h-screen overflow-hidden p-4 gap-4">
        {/* Floating Sidebar */}
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        
        {/* Floating Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[32px] shadow-2xl relative">
          
          <header className="flex items-center justify-between px-8 py-5 border-b border-white/5 z-20">
            <div className="flex items-center gap-4">
              <button className="lg:hidden w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors" onClick={() => setSidebarOpen(true)}>
                <Menu size={18} className="text-white" />
              </button>
              
              <div className="relative hidden md:block group">
                <input
                  type="text"
                  placeholder="Search modules..."
                  value={navbarSearch}
                  onChange={(e) => {
                    const q = e.target.value;
                    setNavbarSearch(q);
                    if (!q) {
                      setSearchResults([]);
                      return;
                    }
                    const lowered = q.toLowerCase();
                    const results = [];
                    sidebarModules.forEach((mod) => {
                      if (mod.label.toLowerCase().includes(lowered)) {
                        results.push({ key: mod.key, label: mod.label, basePath: mod.basePath });
                      }
                      mod.sections.forEach((sec) => {
                        const secLabel = typeof sec === 'string' ? sec : sec.label;
                        if (secLabel.toLowerCase().includes(lowered)) {
                          const secId = typeof sec === 'string' ? sec : sec.id;
                          const path = `${mod.basePath}/${secId}`;
                          results.push({ key: `${mod.key}-${secId}`, label: `${mod.label} > ${secLabel}`, basePath: path });
                        }
                      });
                    });
                    setSearchResults(results.slice(0, 5));
                  }}
                  className="h-11 pl-12 pr-6 rounded-full bg-black/20 border border-white/10 text-sm text-white placeholder-gray-500 focus:outline-none w-[360px] focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all shadow-inner group-hover:bg-black/30"
                />
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-hover:text-indigo-400 transition-colors" />
                {searchResults.length > 0 && (
                  <div className="absolute top-full left-0 w-full mt-1 bg-[#140f2d]/80 border border-white/10 rounded-xl shadow-lg z-20">
                    {searchResults.map((mod) => (
                      <button
                        key={mod.key}
                        onClick={() => { navigate(mod.basePath); setNavbarSearch(''); setSearchResults([]); }}
                        className="w-full text-left px-4 py-2 text-sm text-white hover:bg-white/5"
                      >
                        {mod.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/dashboard')} className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                <Rocket size={18} />
              </button>
              
              <div className="relative" ref={notificationDropdownRef}>
                <button onClick={() => setShowNotifications(!showNotifications)} className="relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors" aria-label="Notifications">
                  <BellDot size={18} />
                  {unreadCount > 0 && <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />}
                </button>
                {showNotifications && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute top-14 right-0 w-72 bg-[#1A1924]/95 backdrop-blur-xl rounded-2xl shadow-2xl p-4 border border-white/10 z-50 animate-fade-in-up"
                  >
                    <div className="flex justify-between items-center mb-4 px-1">
                      <h4 className="font-bold text-sm text-white">Notifications</h4>
                      <button type="button" onClick={() => markAllAsRead()} disabled={!unreadCount} className="text-[10px] font-bold uppercase text-indigo-400 disabled:cursor-not-allowed disabled:opacity-50">Mark all read</button>
                    </div>
                    <div className="space-y-2">
                      {notifications.slice(0, 3).map((notification) => (
                        <button
                          type="button"
                          key={notification.id}
                          onClick={() => {
                            markAsRead(notification.id);
                            setShowNotifications(false);
                            const targetRoute = notification.route || resolveNotificationRoute(notification);
                            if (targetRoute) navigate(targetRoute);
                          }}
                          className={`flex w-full items-center justify-between gap-3 p-2 rounded-xl hover:bg-white/10 transition-colors text-left cursor-pointer group ${notification.read ? 'opacity-60' : ''}`}
                        >
                          <div className="flex gap-3 items-start min-w-0 flex-1">
                            {!notification.read && <div className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${notification.type === 'alert' ? 'bg-red-500' : 'bg-indigo-500'}`} />}
                            <div className={`min-w-0 flex-1 ${notification.read ? 'pl-5' : ''}`}>
                              <p className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors">{notification.title}</p>
                              <p className="text-xs text-gray-400 mt-0.5 truncate">{notification.message}</p>
                            </div>
                          </div>
                          <ChevronRight size={14} className="text-gray-500 group-hover:text-indigo-300 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                        </button>
                      ))}
                    </div>
                    <button type="button" onClick={() => { setShowNotifications(false); navigate('/dashboard/notifications'); }} className="mt-3 w-full border-t border-white/10 pt-3 text-xs font-semibold text-indigo-300 hover:text-indigo-200">View all notifications</button>
                  </div>
                )}
              </div>
              
              <div className="h-6 w-px bg-white/10 mx-2 hidden sm:block"></div>
              
              <div
                ref={profileDropdownRef}
                className="relative flex items-center gap-3 cursor-pointer group"
                onClick={() => setShowProfile((prev) => !prev)}
              >
                <div className="hidden md:flex flex-col items-end">
                  <p className="text-sm font-bold text-white leading-tight group-hover:text-indigo-300 transition-colors">
                    {(() => {
                      try {
                        const userObj = JSON.parse(localStorage.getItem('user'));
                        return userObj?.user?.username || 'Admin';
                      } catch (e) {
                        return 'Admin';
                      }
                    })()}
                  </p>
                  <p className="text-[10px] font-medium text-gray-400 uppercase">
                    {(() => {
                      try {
                        const userObj = JSON.parse(localStorage.getItem('user'));
                        return userObj?.user?.role || 'Super Administrator';
                      } catch (e) {
                        return 'Super Administrator';
                      }
                    })()}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-indigo-500/30 group-hover:border-indigo-400 transition-colors">
                  <img src={LeadImage} alt="Profile" className="w-full h-full object-cover" />
                </div>
                
                {showProfile && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute top-14 right-0 w-56 bg-[#1A1924]/95 backdrop-blur-xl rounded-2xl shadow-2xl p-2 border border-white/10 z-50 animate-fade-in-up"
                  >
                    <div className="px-4 py-3 border-b border-white/10 mb-2">
                      <p className="text-sm font-bold text-white">
                        {(() => {
                          try {
                            const userObj = JSON.parse(localStorage.getItem('user'));
                            return userObj?.user?.username || 'Admin User';
                          } catch (e) {
                            return 'Admin User';
                          }
                        })()}
                      </p>
                      <p className="text-[11px] text-gray-400">
                        {(() => {
                          try {
                            const userObj = JSON.parse(localStorage.getItem('user'));
                            return userObj?.user?.role || 'admin';
                          } catch (e) {
                            return 'admin';
                          }
                        })()}@acme.com
                      </p>
                    </div>
                    <div
                      onClick={() => {
                        setShowProfile(false);
                        navigate('/dashboard/purchase/settings');
                      }}
                      className="p-2.5 hover:bg-white/5 rounded-xl text-sm font-medium text-gray-300 hover:text-white transition-colors cursor-pointer flex items-center gap-3"
                    >
                      <Settings size={16} /> Settings
                    </div>
                    <div 
                      onClick={() => {
                        setShowProfile(false);
                        handleLogout();
                      }}
                      className="p-2.5 mt-1 hover:bg-red-500/10 text-red-400 hover:text-red-300 rounded-xl text-sm font-medium transition-colors cursor-pointer flex items-center gap-3"
                    >
                      <Rocket size={16} /> Logout
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            <div key={location.pathname} className="animate-fade-in-up h-full">
              <Outlet />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Layout;
