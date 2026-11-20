
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ChevronRight, Users, Search,
  Download, TrendingUp, TrendingDown, CheckCircle,
  Clock, AlertTriangle, DollarSign, AlertCircle,
} from 'lucide-react';

import {
  generateVendorReport,
  getAllVendorReports,
} from "../../services/purchase/vendorPerformanceReport.services";


const DEMO_DATA = [
  { id: 1, vendorId: 1, vendorName: 'Ravi Kumar',    companyName: 'Ravi Traders',     totalOrders: 12, completedOrders: 11, delayedOrders: 1, totalPurchaseAmount: 385000, performanceRating: 91.67 },
  { id: 2, vendorId: 2, vendorName: 'Ganesh Babu',   companyName: 'Sri Ganesh Stores', totalOrders: 8,  completedOrders: 6,  delayedOrders: 2, totalPurchaseAmount: 220000, performanceRating: 75.00 },
  { id: 3, vendorId: 3, vendorName: 'Murugan S',     companyName: 'Murugan Supplies',  totalOrders: 15, completedOrders: 14, delayedOrders: 1, totalPurchaseAmount: 510000, performanceRating: 93.33 },
  { id: 4, vendorId: 4, vendorName: 'Arun Prakash',  companyName: 'Chennai Hardware',  totalOrders: 6,  completedOrders: 4,  delayedOrders: 2, totalPurchaseAmount: 145000, performanceRating: 66.67 },
  { id: 5, vendorId: 5, vendorName: 'Vijay Shankar', companyName: 'Vijay Enterprises', totalOrders: 10, completedOrders: 5,  delayedOrders: 5, totalPurchaseAmount: 290000, performanceRating: 50.00 },
  { id: 6, vendorId: 6, vendorName: 'Suresh Kumar',  companyName: 'Kumar & Sons',      totalOrders: 9,  completedOrders: 8,  delayedOrders: 1, totalPurchaseAmount: 340000, performanceRating: 88.89 },
];

const getRatingStyle = (rating) => {
  if (rating >= 80) return { color: '#059669', bg: 'rgba(16,185,129,0.15)', label: 'Good',    icon: TrendingUp };
  if (rating >= 50) return { color: '#d97706', bg: 'rgba(245,158,11,0.15)', label: 'Average', icon: Clock };
  return              { color: '#dc2626', bg: 'rgba(239,68,68,0.15)', label: 'Poor',    icon: TrendingDown };
};

export default function VendorPerformanceReport() {
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate]     = useState('');
  const [vendorSearch, setVendorSearch] = useState('');  
  const [data, setData]           = useState([]);
  const [loading, setLoading]     = useState(false);

  // Load all reports on mount
  // useEffect(() => {
  //   try {
  //     const stored = localStorage.getItem('mveng_vendor_reports');
  //     if (stored) {
  //       const arr = JSON.parse(stored);
  //       setData(arr);
  //     }
  //   } catch {}
  // }, []);

  useEffect(() => {
    loadAllReports();
  }, []);

  const loadAllReports = async () => {
    setLoading(true);

    try {
      const response = await getAllVendorReports();
      setData(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error("Error loading vendor reports:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };



  // const handleGenerate = () => {
  //   if (!startDate || !endDate) { alert('Please select both start and end dates'); return; }
  //   setLoading(true);
  //   try {
  //     // Filter demo data by date range (using demo data as fallback)
  //     setData(DEMO_DATA);
  //   } catch {
  //     setData(DEMO_DATA);
  //   } finally {
  //     setLoading(false);
  //   }
  // };


 const handleGenerate = async () => {
  if (!startDate || !endDate) {
    alert("Please select both start and end dates");
    return;
  }

  setLoading(true);

  try {
    const response = await generateVendorReport(startDate, endDate);
    setData(Array.isArray(response) ? response : []);
  } catch (error) {
    console.error("Error generating vendor report:", error);
    setData([]); // no fallback
  } finally {
    setLoading(false);
  }
};

  const handleExport = () => {
    const headers = ['Vendor Name', 'Company', 'Total Orders', 'Completed', 'Delayed', 'Total Amount', 'Performance %'];
    // const rows = data.filter(row => !vendorSearch || (row.vendorName || row.supplier || '').toLowerCase().includes(vendorSearch.toLowerCase())).map(row  => [v.vendorName, v.companyName, v.totalOrders, v.completedOrders, v.delayedOrders, v.totalPurchaseAmount, v.performanceRating]);
    const rows = data
  .filter(
    (row) =>
      !vendorSearch ||
      (row.vendorName || row.supplier || "")
        .toLowerCase()
        .includes(vendorSearch.toLowerCase())
  )
  .map((v) => [
    v.vendorName,
    v.companyName,
    v.totalOrders,
    v.completedOrders,
    v.delayedOrders,
    v.totalPurchaseAmount,
    v.performanceRating,
  ]);
    const csv = [headers, ...rows].map(r => r.map(x => `"${x ?? ''}"`).join(',')).join('\n');
    const a = document.createElement('a'); a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    a.download = 'vendor-performance.csv'; a.click();
  };

  const avgRating   = data.length ? (data.reduce((s, v) => s + (v.performanceRating || 0), 0) / data.length).toFixed(1) : 0;
  const totalAmount = data.reduce((s, v) => s + (v.totalPurchaseAmount || 0), 0);
const filteredData = data.filter(
  (row) =>
    !vendorSearch ||
    (row.vendorName || row.supplier || "")
      .toLowerCase()
      .includes(vendorSearch.toLowerCase())
);
  return (
    <div>
      <div className="flex items-center gap-2 text-xs text-purple-300 mb-4 font-medium">
        <button onClick={() => navigate('/dashboard/purchase')} className="hover:text-purple-300 transition-colors">Purchase Management</button>
        <ChevronRight size={12} className="text-gray-300" />
        <button onClick={() => navigate('/dashboard/purchase/reports')} className="hover:text-purple-300 transition-colors">Reports</button>
        <ChevronRight size={12} className="text-gray-300" />
        <span className="text-white font-semibold">Vendor Performance Report</span>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/dashboard/purchase/reports')}
          className="w-10 h-10 rounded-xl bg-[#140f2d]/80 border border-white/10 flex items-center justify-center text-purple-300 hover:bg-white/10 transition-colors shadow-sm">
          <ArrowLeft size={16} />
        </button>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm" style={{ background: 'rgba(16,185,129,0.15)' }}>
          <Users size={22} style={{ color: '#059669' }} />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-white">Vendor Performance Report</h2>
          <p className="text-sm text-gray-400">Scorecard, SLAs & delivery metrics</p>
        </div>
        <button onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-[#140f2d]/80 text-sm font-semibold text-purple-300 hover:bg-white/10 transition-colors">
          <Download size={14} /> Export CSV
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Total Vendors',   value: data.length,   icon: Users,        color: '#059669', bg: 'rgba(16,185,129,0.15)' },
          { label: 'Avg Performance', value: `${avgRating}%`, icon: TrendingUp, color: '#7c3aed', bg: 'rgba(139,92,246,0.12)' },
          { label: 'Total Spend',     value: `₹${(totalAmount/100000).toFixed(1)}L`, icon: DollarSign, color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
          { label: 'Good Performers', value: data.filter(v => (v.performanceRating||0) >= 80).length, icon: CheckCircle, color: '#d97706', bg: 'rgba(245,158,11,0.15)' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-[#140f2d]/80 rounded-2xl p-4 shadow-sm border border-white/10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
              <Icon size={18} style={{ color }} />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">{label}</p>
              <p className="text-lg font-bold text-white">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[#140f2d]/80 rounded-2xl shadow-sm border border-white/10 p-4 mb-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs font-semibold text-purple-300 mb-1">Start Date</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-[#059669]/30 bg-white/5" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-purple-300 mb-1">End Date</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-[#059669]/30 bg-white/5" />
          </div>
          <button onClick={handleGenerate}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold shadow-sm hover:opacity-90 transition-opacity"
            style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}>
            <Search size={14} /> Generate Report
          </button>
        </div>
      </div>

      <div className="bg-[#140f2d]/80 rounded-2xl shadow-sm border border-white/10 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-[#059669] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10" style={{ background: 'linear-gradient(90deg, rgba(16,185,129,0.08), rgba(59,130,246,0.08))' }}>
                  {['Vendor Name', 'Company', 'Total Orders', 'Completed', 'Delayed', 'Total Amount', 'Performance'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-bold text-purple-300 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredData.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-14 text-gray-400">No data found</td></tr>
                ) :filteredData.map((v, i) => {
                  const rs = getRatingStyle(v.performanceRating || 0);
                  const RatingIcon = rs.icon;
                  return (
                    <tr key={v.vendorId || i} className="hover:bg-[rgba(255,255,255,0.03)] transition-colors">
                      <td className="px-4 py-3 font-bold text-white">{v.vendorName}</td>
                      <td className="px-4 py-3 text-gray-400">{v.companyName}</td>
                      <td className="px-4 py-3 text-center font-semibold text-white">{v.totalOrders}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center gap-1 font-semibold text-[#059669]">
                          <CheckCircle size={12} /> {v.completedOrders}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center gap-1 font-semibold text-[#dc2626]">
                          <AlertTriangle size={12} /> {v.delayedOrders}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-bold text-white">₹{(v.totalPurchaseAmount||0).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
                          style={{ background: rs.bg, color: rs.color }}>
                          <RatingIcon size={11} />
                          {(v.performanceRating||0).toFixed(2)}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <div className="px-4 py-3 border-t border-white/10 flex items-center gap-4">
          <p className="text-xs text-gray-400">Showing {filteredData.length} vendors</p>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> Good ≥ 80%</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500 inline-block" /> Average 50–79%</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Poor &lt; 50%</span>
          </div>
        </div>
      </div>
    </div>
  );
}