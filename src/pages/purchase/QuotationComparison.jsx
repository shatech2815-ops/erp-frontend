import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ShieldCheck, Clock, Award, CheckCircle, Search, ThumbsUp } from 'lucide-react';
import axios from 'axios';

const BASE_URL = '/api';

const QuotationComparison = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [reason, setReason] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [VENDORS, setVENDORS] = useState([]);
  const [MOCK_RFQ, setMOCK_RFQ] = useState({ rfqNumber: 'RFQ-2023-085', item: 'Industrial Steel Rods (100 Kg)', itemName: 'Industrial Steel Rods (100 Kg)', quantity: 100 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Determine RFQ Number
    const params = new URLSearchParams(window.location.search);
    const queryRfq = params.get('rfqNumber');
    let rfqToUse = queryRfq || MOCK_RFQ.rfqNumber;
    
    let activeRfq = { ...MOCK_RFQ };
    if (location.state && location.state.rfq) {
      const incoming = location.state.rfq;
      rfqToUse = incoming.rfqNumber || rfqToUse;
      const itemName = incoming.items?.[0]?.itemName || incoming.item || incoming.itemName || 'Industrial Steel Rods (100 Kg)';
      const quantity = Number(incoming.items?.[0]?.quantity) || Number(incoming.quantity) || 100;
      activeRfq = {
        ...incoming,
        rfqNumber: rfqToUse,
        item: itemName,
        itemName: itemName,
        quantity: quantity,
        vendors: incoming.vendors || []
      };
      setMOCK_RFQ(activeRfq);
    } else {
      activeRfq = { ...MOCK_RFQ, rfqNumber: rfqToUse };
      setMOCK_RFQ(activeRfq);
    }

    fetchQuotations(rfqToUse, activeRfq);
  }, [location]);

  const generateComparativeQuotes = (rfqNo, rfqObj) => {
    const qty = Number(rfqObj.quantity) || 100;
    const item = rfqObj.itemName || rfqObj.item || 'Required Material';
    const vendorNames = rfqObj.vendors && rfqObj.vendors.length >= 3 
      ? rfqObj.vendors 
      : ['Apex Metal Industries', 'JSW Steel & Alloys', 'Kaveri Industrial Supplies'];

    return [
      {
        id: `VQ-${rfqNo}-01`,
        dbId: null,
        vendorId: 'VEND-01',
        name: vendorNames[0] || 'Apex Metal Industries',
        unitPrice: 420,
        tax: Math.round(420 * qty * 0.18),
        discount: 1000,
        total: Math.round(420 * qty * 1.18 - 1000),
        deliveryTime: '3 Days',
        paymentTerms: 'Net 30',
        warranty: '1 Year',
        rating: 4.6,
        qualityScore: 92,
        deliveryPerf: 95,
        history: 'PREFERRED',
        notes: 'Competitive pricing and reliable quality with standard delivery.'
      },
      {
        id: `VQ-${rfqNo}-02`,
        dbId: null,
        vendorId: 'VEND-02',
        name: vendorNames[1] || 'JSW Steel & Alloys',
        unitPrice: 390, // Best Price
        tax: Math.round(390 * qty * 0.18),
        discount: 500,
        total: Math.round(390 * qty * 1.18 - 500),
        deliveryTime: '7 Days',
        paymentTerms: 'Net 45',
        warranty: '6 Months',
        rating: 4.1,
        qualityScore: 84,
        deliveryPerf: 88,
        history: 'ACTIVE',
        notes: 'Lowest total cost bid, delivery duration is slightly longer.'
      },
      {
        id: `VQ-${rfqNo}-03`,
        dbId: null,
        vendorId: 'VEND-03',
        name: vendorNames[2] || 'Kaveri Industrial Supplies',
        unitPrice: 445,
        tax: Math.round(445 * qty * 0.18),
        discount: 1500,
        total: Math.round(445 * qty * 1.18 - 1500),
        deliveryTime: '2 Days', // Fastest delivery
        paymentTerms: 'Immediate',
        warranty: '2 Years',
        rating: 4.9,
        qualityScore: 98, // Best Quality
        deliveryPerf: 99,
        history: 'CERTIFIED',
        notes: 'Highest quality score and fastest on-time delivery track record.'
      }
    ];
  };

  const fetchQuotations = async (rfqNo, rfqObj) => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/vendor-quotations?rfqNumber=${rfqNo}`);
      if (Array.isArray(res.data) && res.data.length > 0) {
        const mapped = res.data.map(q => ({
          id: q.quotationNumber || `VQ-${q.id}`,
          dbId: q.id,
          vendorId: q.vendor,
          name: q.vendor,
          unitPrice: q.items && q.items.length > 0 ? Number(q.items[0].unitPrice) : 0,
          tax: Number(q.taxAmount || 0),
          discount: Number(q.discount || 0),
          total: Number(q.netAmount || q.totalAmount || 0),
          deliveryTime: q.deliveryTime || '3 Days',
          paymentTerms: q.paymentTerms || 'Net 30',
          warranty: q.warranty || '1 Year',
          rating: q.vendorStats ? Number(q.vendorStats.rating) : 4.5,
          qualityScore: q.vendorStats ? q.vendorStats.qualityScore : 90,
          deliveryPerf: q.vendorStats ? q.vendorStats.deliveryPerf : 95,
          history: q.vendorStats ? q.vendorStats.history : 'ACTIVE'
        }));
        setVENDORS(mapped);
      } else {
        // Fallback comparative bids matching the current RFQ
        setVENDORS(generateComparativeQuotes(rfqNo, rfqObj || MOCK_RFQ));
      }
    } catch (e) {
      console.warn("Backend quotations fetch, using comparative bids:", e);
      setVENDORS(generateComparativeQuotes(rfqNo, rfqObj || MOCK_RFQ));
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async () => {
    if (!selectedVendor || !reason.trim()) {
      alert("Please select a vendor and provide a reason.");
      return;
    }
    
    // Call API to update selection if db record exists
    try {
      if (selectedVendor.dbId) {
        await axios.put(`${BASE_URL}/vendor-quotations/${selectedVendor.dbId}/status`, { status: 'SELECTED' });
      }
    } catch(e) {
      console.warn("Status update fallback:", e);
    }
    
    setIsSaved(true);
    setTimeout(() => {
      // Redirect to PO creation with vendor data
      navigate('/dashboard/purchase/purchase-orders/create-po', { 
        state: { 
          vendor: selectedVendor, 
          rfq: MOCK_RFQ, 
          reason 
        } 
      });
    }, 1200);
  };

  const getBest = (field, type = 'low') => {
    if (VENDORS.length === 0) return 0;
    const vals = VENDORS.map(v => v[field]);
    return type === 'low' ? Math.min(...vals) : Math.max(...vals);
  };

  const bestPrice = getBest('total', 'low');
  const bestDelivery = getBest('deliveryPerf', 'high');
  const bestQuality = getBest('qualityScore', 'high');

  return (
    <div className="p-2">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-[#140f2d]/80 border border-white/10 flex items-center justify-center text-purple-300 hover:bg-white/10 shadow-sm">
          <ArrowLeft size={16} />
        </button>
        <div>
          <h2 className="text-xl font-bold text-white">Quotation Comparison</h2>
          <p className="text-sm text-gray-400">Compare vendor bids for {MOCK_RFQ.rfqNumber} • {MOCK_RFQ.item}</p>
        </div>
      </div>

      {isSaved && (
        <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/30 px-6 py-4 rounded-2xl mb-6">
          <div className="flex items-center gap-3 text-emerald-400 font-medium">
            <CheckCircle size={20} /> Vendor Selected Successfully! Redirecting to PO creation...
          </div>
        </div>
      )}

      <div className="mb-8 overflow-x-auto pb-2">
      <div
        className="grid min-w-[920px] gap-4"
        style={{ gridTemplateColumns: `minmax(190px, 0.8fr) repeat(${Math.max(VENDORS.length, 1)}, minmax(220px, 1fr))` }}
      >
        <div className="rounded-2xl border border-white/10 bg-[#140f2d]/80 p-4">
          <div className="h-[100px] border-b border-white/10" />
          <div className="space-y-4 pt-6 font-semibold text-gray-400 text-sm">
            <div className="h-10 flex items-center">Unit Price (₹)</div>
            <div className="h-10 flex items-center">Total Price (Incl. Tax)</div>
            <div className="h-10 flex items-center">Delivery Time</div>
            <div className="h-10 flex items-center">Payment Terms</div>
            <div className="h-10 flex items-center">Warranty</div>
            <div className="h-10 flex items-center">Vendor Rating</div>
            <div className="h-10 flex items-center">Quality Score</div>
            <div className="h-10 flex items-center">Delivery Performance</div>
            <div className="h-10 flex items-center">Purchase History</div>
          </div>
          <div className="mt-8 h-10" />
        </div>

        {VENDORS.map((v) => (
          <div key={v.id} 
            className={`rounded-2xl p-4 border transition-all cursor-pointer relative overflow-hidden ${
              selectedVendor?.id === v.id 
                ? 'bg-purple-900/30 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.15)]' 
                : 'bg-[#140f2d]/80 border-white/10 hover:border-purple-500/50'
            }`}
            onClick={() => {
              setSelectedVendor((current) => {
                const isDeselecting = current?.id === v.id;
                if (isDeselecting) setReason('');
                return isDeselecting ? null : v;
              });
            }}
          >
            {selectedVendor?.id === v.id && (
              <div className="absolute top-0 right-0 bg-purple-500 text-white px-3 py-1 rounded-bl-xl text-xs font-bold flex items-center gap-1">
                <CheckCircle size={12}/> SELECTED
              </div>
            )}
            <div className="h-[100px] border-b border-white/10 flex flex-col justify-center pr-12">
              <h3 className="text-lg font-bold text-white truncate" title={v.name}>{v.name}</h3>
              <p className="text-xs text-purple-300 font-medium mt-1">ID: {v.id}</p>
            </div>

            <div className="space-y-4 pt-6 text-sm font-medium">
              <div className="h-10 flex items-center text-gray-300">₹{v.unitPrice.toLocaleString()}</div>
              <div className={`h-10 flex items-center text-lg font-bold ${v.total === bestPrice ? 'text-emerald-400' : 'text-white'}`}>
                ₹{v.total.toLocaleString()} {v.total === bestPrice && <ThumbsUp size={14} className="ml-2"/>}
              </div>
              <div className="h-10 flex items-center text-gray-300 flex gap-2"><Clock size={16}/> {v.deliveryTime}</div>
              <div className="h-10 flex items-center text-gray-300">{v.paymentTerms}</div>
              <div className="h-10 flex items-center text-gray-300 flex gap-2"><ShieldCheck size={16}/> {v.warranty}</div>
              <div className="h-10 flex items-center text-amber-400 flex gap-1"><Award size={16}/> {v.rating}/5.0</div>
              <div className={`h-10 flex items-center ${v.qualityScore === bestQuality ? 'text-emerald-400 font-bold' : 'text-gray-300'}`}>
                {v.qualityScore}% {v.qualityScore === bestQuality && '(Best)'}
              </div>
              <div className={`h-10 flex items-center ${v.deliveryPerf === bestDelivery ? 'text-emerald-400 font-bold' : 'text-gray-300'}`}>
                {v.deliveryPerf}% On-Time
              </div>
              <div className="h-10 flex items-center text-gray-300">{v.history}</div>
            </div>
            
            <div className="mt-8">
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  const isDeselecting = selectedVendor?.id === v.id;
                  setSelectedVendor(isDeselecting ? null : v);
                  if (isDeselecting) setReason('');
                }}
                className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-colors ${
                  selectedVendor?.id === v.id ? 'bg-purple-600 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                {selectedVendor?.id === v.id ? 'Deselect Vendor' : 'Select Vendor'}
              </button>
            </div>
          </div>
        ))}
      </div>
      </div>

      {selectedVendor && (
        <div className="bg-purple-900/20 border border-purple-500/30 rounded-2xl p-6">
          <h3 className="text-white font-bold mb-4">Confirm Selection: {selectedVendor.name}</h3>
          <div className="mb-4">
            <label className="block text-xs font-semibold text-purple-300 mb-2">Selection Reason (Required) <span className="text-red-400">*</span></label>
            <textarea 
              value={reason} 
              onChange={e => setReason(e.target.value)}
              placeholder="E.g., Selected due to fastest delivery and highest quality score despite slightly higher price..." 
              className="w-full bg-[#140f2d]/80 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 min-h-[80px]"
            ></textarea>
          </div>
          <div className="flex justify-end">
            <button 
              onClick={handleSelect}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-white text-sm font-bold shadow-md hover:opacity-90 transition-opacity bg-purple-600"
            >
              Confirm & Proceed to PO <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
export default QuotationComparison;
