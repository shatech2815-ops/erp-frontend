  import React, { useState, useEffect } from 'react';
  import { useNavigate } from 'react-router-dom';
  import {
    ArrowLeft, Plus, Search, Package, Tag,
    CheckCircle, XCircle, AlertCircle, X,
    ChevronRight, Box, Layers, Edit2, Trash2,
  } from 'lucide-react';


  import {
  getAllItems,
  deleteItem,
} from "../../services/stock/item.services";

 import { getAllCategories } from "../../services/stock/category.services";
  // const LS_KEY        = 'mveng_items';
  // const LS_CATEGORIES = 'mveng_categories';

  /* ─── Dummy demo data (used when backend is empty) ─── */
  // const DEMO_ITEMS = [
  //   { id: 1,  itemCode: 'ITM-001', itemName: 'Steel Bolt M10',       category: 'Spare Parts',   unit: 'NOS',   price: 12,    costPrice: 8,    quantity: 500,  reorderLevel: 100, brand: 'Unbranded', active: true,  discontinued: false, description: 'Hexagonal steel bolt, M10 size, zinc plated.' },
  //   { id: 2,  itemCode: 'ITM-002', itemName: 'Hydraulic Oil 20L',    category: 'Consumable',    unit: 'LITER', price: 1850,  costPrice: 1500, quantity: 40,   reorderLevel: 10,  brand: 'Castrol',   active: true,  discontinued: false, description: 'Premium hydraulic oil for industrial machinery.' },
  //   { id: 3,  itemCode: 'ITM-003', itemName: 'CNC Bearing 6205',     category: 'Spare Parts',   unit: 'NOS',   price: 380,   costPrice: 280,  quantity: 120,  reorderLevel: 20,  brand: 'SKF',       active: true,  discontinued: false, description: 'Deep groove ball bearing for CNC spindles.' },
  //   { id: 4,  itemCode: 'ITM-004', itemName: 'Welding Rod 3.15mm',   category: 'Raw Material',  unit: 'KG',    price: 95,    costPrice: 70,   quantity: 200,  reorderLevel: 50,  brand: 'D&H',       active: true,  discontinued: false, description: 'E6013 welding electrode for mild steel.' },
  //   { id: 5,  itemCode: 'ITM-005', itemName: 'Safety Gloves (L)',    category: 'Consumable',    unit: 'PACK',  price: 220,   costPrice: 160,  quantity: 80,   reorderLevel: 15,  brand: 'Karam',     active: true,  discontinued: false, description: 'Cut-resistant safety gloves, size Large.' },
  //   { id: 6,  itemCode: 'ITM-006', itemName: 'Angle Grinder 4"',     category: 'Equipment',     unit: 'NOS',   price: 2800,  costPrice: 2200, quantity: 10,   reorderLevel: 3,   brand: 'Bosch',     active: true,  discontinued: false, description: '850W angle grinder with safety guard.' },
  //   { id: 7,  itemCode: 'ITM-007', itemName: 'Cardboard Box 12x8',   category: 'Packaging',     unit: 'BOX',   price: 18,    costPrice: 12,   quantity: 1000, reorderLevel: 200, brand: '',          active: true,  discontinued: false, description: 'Single-wall corrugated carton box.' },
  //   { id: 8,  itemCode: 'ITM-008', itemName: 'Gear Coupling GC-50',  category: 'Spare Parts',   unit: 'NOS',   price: 1450,  costPrice: 1100, quantity: 25,   reorderLevel: 5,   brand: 'Rexnord',   active: true,  discontinued: false, description: 'Flexible gear coupling, bore 50mm.' },
  //   { id: 9,  itemCode: 'ITM-009', itemName: 'MS Sheet 3mm (1x2m)',  category: 'Raw Material',  unit: 'NOS',   price: 2100,  costPrice: 1750, quantity: 60,   reorderLevel: 10,  brand: 'SAIL',      active: true,  discontinued: false, description: 'Mild steel flat sheet, 3mm thickness.' },
  //   { id: 10, itemCode: 'ITM-010', itemName: 'Proximity Sensor NPN', category: 'Electronics',   unit: 'NOS',   price: 650,   costPrice: 480,  quantity: 35,   reorderLevel: 8,   brand: 'Autonics',  active: true,  discontinued: false, description: 'Inductive proximity sensor, NPN NC/NO.' },
  //   { id: 11, itemCode: 'ITM-011', itemName: 'V-Belt A-48',          category: 'Spare Parts',   unit: 'NOS',   price: 210,   costPrice: 155,  quantity: 90,   reorderLevel: 20,  brand: 'PIX',       active: false, discontinued: false, description: 'Classical V-belt, A section, 48 inches.' },
  //   { id: 12, itemCode: 'ITM-012', itemName: 'Finished Shaft 25mm',  category: 'Finished Good', unit: 'NOS',   price: 3200,  costPrice: 2400, quantity: 15,   reorderLevel: 5,   brand: 'In-House',  active: true,  discontinued: false, description: 'Precision turned EN8 shaft, 25mm dia.' },
  // ];

  const CATEGORY_COLORS = {
    'Spare Parts':   { bg: '#EEF2FF', accent: '#8b5cf6', icon: '⚙️' },
    'Consumable':    { bg: '#ECFDF5', accent: '#059669', icon: '🧴' },
    'Raw Material':  { bg: '#FFF7ED', accent: '#EA580C', icon: '🪨' },
    'Equipment':     { bg: '#FFF1F2', accent: '#E11D48', icon: '🔧' },
    'Packaging':     { bg: '#F0FDF4', accent: '#16A34A', icon: '📦' },
    'Electronics':   { bg: '#EFF6FF', accent: '#2563EB', icon: '⚡' },
    'Finished Good': { bg: '#FDF4FF', accent: '#9333EA', icon: '✅' },
  };
  const DEFAULT_COLOR = { bg: '#F8FAFC', accent: '#64748B', icon: '📋' };

  const getCatStyle = (cat) => CATEGORY_COLORS[cat] || DEFAULT_COLOR;

  /* ─── Item Detail Modal ─── */
  function ItemModal({ item, onClose, onEdit, onDelete }) {
    const style = getCatStyle(item.category);
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(4px)' }}>
        <div className="bg-[#140f2d]/80 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-modal">
          {/* Top accent bar */}
          <div className="h-2 w-full" style={{ background: style.accent }} />
          <div className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl" style={{ background: style.bg }}>
                  {style.icon}
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-white leading-tight">{item.itemName}</h2>
                  <span className="text-xs font-mono text-gray-400">{item.itemCode}</span>
                </div>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white/5 hover:bg-[rgba(226,232,240,0.12)] flex items-center justify-center transition-colors">
                <X size={15} className="text-gray-400" />
              </button>
            </div>

            {/* Category badge */}
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold" style={{ background: style.bg, color: style.accent }}>
                <Tag size={11} /> {item.category || 'Uncategorised'}
              </span>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${item.active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-gray-400'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${item.active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                {item.active ? 'Active' : 'Inactive'}
              </span>
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                { label: 'Unit',         value: item.unit        || '—' },
                { label: 'Brand',        value: item.brand       || '—' },
                { label: 'Sale Price',   value: item.price       != null ? `₹${Number(item.price).toLocaleString('en-IN')}` : '—' },
                { label: 'Cost Price',   value: item.costPrice   != null ? `₹${Number(item.costPrice).toLocaleString('en-IN')}` : '—' },
                { label: 'Stock Qty',    value: item.quantity    != null ? `${Number(item.quantity).toLocaleString('en-IN')} ${item.unit || ''}`.trim() : '—' },
                { label: 'Reorder Level',value: item.reorderLevel != null ? item.reorderLevel : '—' },
              ].map(({ label, value }) => (
                <div key={label} className="bg-white/5 rounded-xl px-3 py-2.5">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
                  <p className="text-sm font-bold text-white">{value}</p>
                </div>
              ))}
            </div>

            {item.description && (
              <div className="bg-white/5 rounded-xl px-3 py-2.5 mb-4">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Description</p>
                <p className="text-xs text-purple-300 leading-relaxed">{item.description}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <button onClick={() => { onEdit(item); onClose(); }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-purple-500 hover:bg-white/10 text-white text-xs font-semibold transition-colors shadow-sm">
                <Edit2 size={13} /> Edit Item
              </button>
              <button onClick={() => { onDelete(item.id); onClose(); }}
                className="w-10 flex items-center justify-center rounded-xl bg-red-500/10 hover:bg-red-500 hover:text-white text-red-400 transition-colors">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }



  /* ─── Item Tile ─── */
  function ItemTile({ item, onClick }) {
    const style = getCatStyle(item.category);
    const isLow = item.reorderLevel != null && item.quantity != null && item.quantity <= item.reorderLevel;

   

    return (
      <button
        onClick={onClick}
        className="group w-full text-left bg-[#140f2d]/80 rounded-2xl border border-white/10 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 overflow-hidden focus:outline-none focus:ring-2 focus:ring-purple-500/30"
      >
        {/* Category colour strip */}
        <div className="h-1.5 w-full" style={{ background: style.accent }} />

        <div className="p-4">
          {/* Icon + name row */}
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: style.bg }}>
              {style.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-white text-sm leading-tight truncate group-hover:text-purple-300 transition-colors">{item.itemName}</p>
              <p className="text-[11px] font-mono text-gray-400 mt-0.5">{item.itemCode}</p>
            </div>
            <ChevronRight size={15} className="text-gray-300 group-hover:text-purple-300 transition-colors flex-shrink-0 mt-0.5" />
          </div>

          {/* Category pill */}
          <div className="mb-3">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold" style={{ background: style.bg, color: style.accent }}>
              <Tag size={10} /> {item.category || 'Uncategorised'}
            </span>
          </div>

          {/* Bottom stats */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${item.active ? 'bg-emerald-400' : 'bg-slate-300'}`} />
              <span className="text-[11px] text-gray-400 font-medium">{item.active ? 'Active' : 'Inactive'}</span>
            </div>
            <div className="flex items-center gap-2">
              {isLow && (
                <span className="text-[10px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">Low Stock</span>
              )}
              {item.price != null && (
                <span className="text-xs font-bold text-white">₹{Number(item.price).toLocaleString('en-IN')}</span>
              )}
            </div>
          </div>
        </div>
      </button>
    );
  }

  /* ─── Main Page ─── */
  export default function ItemCatalogPage() {
    const navigate = useNavigate();

    const [items, setItems]         = useState([]);
    const [categories, setCategories] = useState([]);
    const [search, setSearch]       = useState('');
    const [filterCat, setFilterCat] = useState('ALL');
    const [filterActive, setFilterActive] = useState('ALL');
    const [selectedItem, setSelectedItem] = useState(null);
    const [toast, setToast]         = useState(null);

    const showToast = (msg, type = 'success') => {
      setToast({ msg, type });
      setTimeout(() => setToast(null), 3500);
    };

     const loadItems = async () => {
  try {
    const data = await getAllItems();

    const mapped = data.map((it) => ({
      id: it.id,
      itemCode: it.itemCode || it.sku || "",
      itemName: it.itemName || "",
      description: it.description || "",
      category:
        typeof it.category === "object"
          ? it.category?.categoryName || it.category?.name || ""
          : it.category || "",
      unit: it.unit || "",
      price: it.price ?? null,
      costPrice: it.costPrice ?? null,
      quantity: it.quantity ?? 0,
      reorderLevel: it.reorderLevel ?? 0,
      brand: it.brand || "",
      active: it.active ?? true,
      discontinued: it.discontinued ?? false,
    }));

    setItems(mapped);
  } catch (error) {
    console.error("Failed to load items:", error);
    setItems([]);
    showToast("Failed to load items", "error");
  }
};

const loadCategories = async () => {
  try {
    const data = await getAllCategories();
    setCategories(data || []);
  } catch (error) {
    console.error("Failed to load categories:", error);
  }
};

    // /* Load from localStorage; fall back to demo data */
    // useEffect(() => {
    //   try {
    //     const d = localStorage.getItem(LS_KEY);
    //     const loaded = d ? JSON.parse(d) : [];
    //     setItems(loaded.length > 0 ? loaded : DEMO_ITEMS);
    //   } catch { setItems(DEMO_ITEMS); }

    //   try {
    //     const c = localStorage.getItem(LS_CATEGORIES);
    //     if (c) setCategories(JSON.parse(c));
    //   } catch {}
    // }, []);

    useEffect(() => {
  loadItems();
  loadCategories();
}, []);

    /* Also try backend API for items (when connected) */
    // useEffect(() => {
    //   fetch('/api/items/getall')
    //     .then(r => r.ok ? r.json() : null)
    //     .then(data => {
    //       if (Array.isArray(data) && data.length > 0) {
    //         const mapped = data.map(it => ({
    //           id:           it.id,
    //           itemCode:     it.itemCode   || it.sku || '',
    //           itemName:     it.itemName   || it.name || '',
    //           description:  it.description || '',
    //           category:     it.category?.name || it.category || '',
    //           unit:         it.unit || '',
    //           price:        it.price ?? null,
    //           costPrice:    it.costPrice ?? null,
    //           quantity:     it.quantity ?? null,
    //           reorderLevel: it.reorderLevel ?? null,
    //           brand:        it.brand || '',
    //           active:       it.active ?? true,
    //           discontinued: it.discontinued ?? false,
    //         }));
    //         setItems(mapped);
    //       }
    //     })
    //     .catch(() => {});
    // }, []);

    // const saveToStorage = (data) => {
    //   try { localStorage.setItem(LS_KEY, JSON.stringify(data)); } catch {}
    // };

    // const handleDelete = (id) => {
    //   const updated = items.filter(it => it.id !== id);
    //   setItems(updated);
    //   saveToStorage(updated);
    //   showToast('Item deleted.');
    // };

    const handleDelete = async (id) => {
  try {
    await deleteItem(id);

    setItems((prev) => prev.filter((it) => it.id !== id));

    showToast("Item deleted successfully");
  } catch (error) {
    console.error("Delete failed:", error);
    showToast("Failed to delete item", "error");
  }
};

    /* Unique categories from actual items */
    const allCategories = [...new Set(items.map(i => i.category).filter(Boolean))].sort();

    const filtered = items.filter(i => {
      const q = search.toLowerCase();
      const matchQ = !q || (i.itemName||'').toLowerCase().includes(q) || (i.itemCode||'').toLowerCase().includes(q);
      const matchC = filterCat === 'ALL' || i.category === filterCat;
      const matchA = filterActive === 'ALL' || (filterActive === 'Active' ? i.active : !i.active);
      return matchQ && matchC && matchA;
    });

    const stats = [
      { label: 'Total Items', value: items.length, color: '#8b5cf6', icon: Package },
      { label: 'Active',      value: items.filter(i => i.active).length, color: '#059669', icon: CheckCircle },
      { label: 'Inactive',    value: items.filter(i => !i.active).length, color: '#d97706', icon: AlertCircle },
      { label: 'Categories',  value: allCategories.length, color: '#6366f1', icon: Layers },
    ];

    return (
      <div className="p-6 min-h-screen" style={{ background: 'rgba(139,92,246,0.10)' }}>

        {/* ── Toast ── */}
        {toast && (
          <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold flex items-center gap-2 ${toast.type === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/30' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'}`}>
            {toast.type === 'error' ? <XCircle size={15} /> : <CheckCircle size={15} />}
            {toast.msg}
          </div>
        )}

        {/* ── Item Detail Modal ── */}
        {selectedItem && (
          <ItemModal
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
            onEdit={(item) => navigate('add', { state: { item } })}
            onDelete={(id) => { handleDelete(id); setSelectedItem(null); }}
          />
        )}

        {/* ── Page Header ── */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl border border-white/10 bg-[#140f2d]/80 flex items-center justify-center hover:bg-white/10 transition-colors shadow-sm">
              <ArrowLeft size={16} className="text-purple-300" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-gray-500 flex items-center justify-center">
                <Package size={15} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-white">Item Catalog</h1>
                <p className="text-xs text-gray-400 mt-0.5">Manage inventory items, codes and pricing</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate('add')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-500 text-white text-sm font-semibold hover:bg-white/10 transition-colors shadow-md"
          >
            <Plus size={15} /> Add Item
          </button>
        </div>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {stats.map(s => (
            <div key={s.label} className="bg-[#140f2d]/80 rounded-2xl p-5 shadow-sm border border-white/10" style={{ borderLeftWidth: 4, borderLeftColor: s.color }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: `${s.color}18` }}>
                <s.icon size={18} style={{ color: s.color }} />
              </div>
              <p className="text-3xl font-extrabold text-white">{s.value}</p>
              <p className="text-xs text-gray-400 font-medium mt-1 uppercase tracking-wide">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── Search & Filters ── */}
        <div className="bg-[#140f2d]/80 rounded-2xl border border-white/10 shadow-sm px-5 py-4 mb-6 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              placeholder="Search by name or item code…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30"
            />
          </div>

          {/* Category filter pills */}
          <div className="flex flex-wrap gap-2">
            {['ALL', ...allCategories].map(cat => {
              const style = cat === 'ALL' ? null : getCatStyle(cat);
              const active = filterCat === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setFilterCat(cat)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors"
                  style={active
                    ? { background: cat === 'ALL' ? '#8b5cf6' : style.accent, color: '#fff' }
                    : { background: cat === 'ALL' ? '#F1F5F9' : style?.bg, color: cat === 'ALL' ? '#8b5cf6' : style?.accent, border: '1px solid transparent' }
                  }
                >
                  {cat === 'ALL' ? 'All Categories' : `${style?.icon} ${cat}`}
                </button>
              );
            })}
          </div>

          {/* Status filter */}
          <select
            value={filterActive}
            onChange={e => setFilterActive(e.target.value)}
            className="rounded-xl border border-white/10 px-3 py-2 text-xs text-purple-300 focus:outline-none bg-[#140f2d]/80"
          >
            <option value="ALL">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

          <span className="text-xs text-gray-400 ml-auto font-medium">{filtered.length} items</span>
        </div>

        {/* ── Tiles Grid ── */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400">
            <Box size={48} strokeWidth={1.2} className="mb-3" />
            <p className="text-base font-semibold">No items found.</p>
            <p className="text-sm mt-1">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
            {filtered.map(item => (
              <ItemTile key={item.id} item={item} onClick={() => setSelectedItem(item)} />
            ))}
          </div>
        )}

        <style>{`
          @keyframes modal-in {
            from { opacity: 0; transform: scale(0.94) translateY(10px); }
            to   { opacity: 1; transform: scale(1) translateY(0); }
          }
          .animate-modal { animation: modal-in 0.2s ease-out; }
        `}</style>
      </div>
    );
  }