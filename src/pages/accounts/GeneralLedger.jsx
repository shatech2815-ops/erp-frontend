
import React, { useState , useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, BookOpen, Search, Download, Plus, Trash2, AlertCircle, CheckCircle2 } from 'lucide-react';

// const BASE_URL = '/api/accounting';

import {
  createJournalEntry,
  getAllJournalEntries,
} from "../../services/account/generalLedger.services";

const ACCOUNT_TYPES = ['All','Assets','Liabilities','Income','Expense','Equity'];
const TRANSACTION_TYPES = ['All','Journal','Payment','Receipt','Purchase','Sales'];
const ENTRY_TYPES = ['Journal','Payment','Receipt','Purchase','Sales','Contra','Credit Note','Debit Note'];
const SHOW_ZERO_OPTIONS = ['No','Yes'];

const emptyItem = () => ({ accountName: '', accountCode: '', debit: '0.00', credit: '0.00', remarks: '' });

export default function GeneralLedger() {
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  // Filter fields
  const [filter, setFilter] = useState({
    accountType: 'All', accountCode: '', accountName: '',
    transactionType: 'All', dateFrom: '', dateTo: '',
    referenceNo: '', showZeroBalances: 'No',
  });

  // Journal Entry fields
  const [voucherNo, setVoucherNo] = useState('JV-0001');
  const [entryDate, setEntryDate] = useState('');
  const [entryType, setEntryType] = useState('Journal');
  const [narration, setNarration] = useState('');
  const [items, setItems] = useState([emptyItem(), emptyItem()]);

  const setFilterField = (k, v) => setFilter(p => ({ ...p, [k]: v }));

  const updateItem = (idx, k, v) => {
    setItems(prev => { const c = [...prev]; c[idx] = { ...c[idx], [k]: v }; return c; });
  };

  const totalDebit  = items.reduce((s, i) => s + (parseFloat(i.debit)  || 0), 0);
  const totalCredit = items.reduce((s, i) => s + (parseFloat(i.credit) || 0), 0);
  const difference  = totalDebit - totalCredit;

  // const handleSearch = async () => {
  //   setLoading(true); setMsg('');
  //   try {
  //     let url = `${BASE_URL}/ledger?`;
  //     if (filter.dateFrom) url += `start=${filter.dateFrom}&`;
  //     if (filter.dateTo)   url += `end=${filter.dateTo}&`;
  //     if (filter.accountCode) url += `accountCode=${filter.accountCode}&`;
  //     if (filter.accountName) url += `accountName=${encodeURIComponent(filter.accountName)}&`;
  //     if (filter.transactionType !== 'All') url += `transactionType=${filter.transactionType}&`;
  //     if (filter.referenceNo) url += `referenceNo=${filter.referenceNo}&`;
  //     const res = await fetch(url);
  //     if (!res.ok) throw new Error(`Error ${res.status}`);
  //     const data = await res.json();
  //     setEntries(Array.isArray(data) ? data : []);
  //     setFetched(true);
  //   } catch (err) { setMsg(err.message || 'Failed to load ledger.'); setEntries([]); }
  //   finally { setLoading(false); }
  // };

  const handleSearch = async () => {
  setLoading(true);
  setMsg('');

  try {
    const data = await getAllJournalEntries(filter);

    setEntries(Array.isArray(data) ? data : []);
    setFetched(true);
  } catch (error) {
    console.error('Error loading ledger entries:', error);
    setMsg('Failed to load ledger.');
    setEntries([]);
    setFetched(true);
  } finally {
    setLoading(false);
  }
};

useEffect(() => { handleSearch(); }, []);
  // const handlePostEntry = async () => {
  //   setSaving(true); setMsg('');
  //   try {
  //     const payload = {
  //       voucherNo, entryDate: entryDate || null, entryType, narration,
  //       items: items.map(i => ({ accountName: i.accountName, accountCode: i.accountCode, debit: parseFloat(i.debit)||0, credit: parseFloat(i.credit)||0, remarks: i.remarks })),
  //     };
  //     const res = await fetch(`${BASE_URL}/ledger/journal`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  //     if (res.ok) { setMsg('Journal entry posted successfully!'); handleSearch(); }
  //     else { setMsg('Error posting entry.'); }
  //   } catch { setMsg('Failed to post entry.'); } finally { setSaving(false); }
  // };

  const getLedgerRows = () => {
    return entries.flatMap((entry, i) => {
      if (entry.items && Array.isArray(entry.items) && entry.items.length > 0) {
        return entry.items.map((item, idx) => ({
          key: `${entry.id || i}-${item.id || idx}`,
          date: entry.entryDate || entry.transactionDate || (entry.createdAt ? new Date(entry.createdAt).toISOString().split('T')[0] : '—'),
          voucherNo: entry.voucherNo || entry.voucherNumber || '—',
          accountName: item.accountName || item.accountCode || '—',
          narration: item.remarks || entry.narration || entry.description || '—',
          debit: Number(item.debit || 0),
          credit: Number(item.credit || 0),
          balance: Number((item.debit || 0) - (item.credit || 0)),
        }));
      }
      return [{
        key: `${entry.id || i}`,
        date: entry.entryDate || entry.transactionDate || entry.transaction_date || (entry.createdAt ? new Date(entry.createdAt).toISOString().split('T')[0] : '—'),
        voucherNo: entry.voucherNo || entry.voucherNumber || entry.voucher_number || entry.transactionId || '—',
        accountName: entry.accountName || entry.account_name || entry.account?.accountName || entry.customer_vendor || entry.customerVendor || '—',
        narration: entry.narration || entry.description || entry.remarks || '—',
        debit: Number(entry.debit || 0),
        credit: Number(entry.credit || 0),
        balance: entry.runningBalance !== undefined ? Number(entry.runningBalance) : Number((entry.debit || 0) - (entry.credit || 0)),
      }];
    });
  };

  const handlePostEntry = async () => {
    if (!entryDate) {
      setMsg('Error: Please select Entry Date.');
      return;
    }

    const validItems = items.filter(
      (item) => item.accountName?.trim() && (parseFloat(item.debit) > 0 || parseFloat(item.credit) > 0)
    );

    if (validItems.length < 2) {
      setMsg('Error: Journal entry requires at least 2 line items with valid account names and amounts.');
      return;
    }

    if (totalDebit <= 0 || totalCredit <= 0) {
      setMsg('Error: Total Debit and Total Credit must be greater than zero.');
      return;
    }

    if (Math.abs(difference) > 0.01) {
      setMsg(`Error: Total Debit (₹${totalDebit.toFixed(2)}) and Total Credit (₹${totalCredit.toFixed(2)}) must balance. Difference: ₹${difference.toFixed(2)}`);
      return;
    }

    setSaving(true);
    setMsg('');

    try {
      const payload = {
        voucherNo: voucherNo || `JV-${String(1001 + entries.length)}`,
        entryDate,
        entryType,
        narration,
        items: validItems.map((item) => ({
          accountName: item.accountName.trim(),
          accountCode: item.accountCode?.trim() || '',
          debit: parseFloat(item.debit) || 0,
          credit: parseFloat(item.credit) || 0,
          remarks: item.remarks || '',
        })),
      };

      await createJournalEntry(payload);

      setMsg('Journal entry posted successfully!');
      setEntryDate('');
      setNarration('');
      setVoucherNo(`JV-${String(1002 + entries.length)}`);
      setItems([emptyItem(), emptyItem()]);
      handleSearch();
    } catch (error) {
      console.error('Error posting journal entry:', error);

      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data ||
        'Failed to post entry.';

      setMsg(`Error: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  };

  const escapePdf = (str) => {
    return String(str || '').replace(/[()\\\\]/g, '\\$&');
  };

  const handleExportPDF = () => {
    const rows = getLedgerRows();
    if (rows.length === 0) {
      setMsg('Error: No ledger entries to export.');
      return;
    }

    const title = 'General Ledger Report';
    const meta = [
      `Date Range: ${filter.dateFrom || 'All'} to ${filter.dateTo || 'All'}`,
      `Account: ${filter.accountName || filter.accountCode || 'All'} | Type: ${filter.accountType}`,
      `Generated On: ${new Date().toLocaleString()}`,
    ];

    const content = [];
    content.push(`BT /F1 15 Tf 40 750 Td (${escapePdf(title)}) Tj ET`);

    let metaY = 730;
    for (const m of meta) {
      content.push(`BT /F2 8 Tf 40 ${metaY} Td (${escapePdf(m)}) Tj ET`);
      metaY -= 12;
    }

    content.push('0.5 w');
    content.push(`40 ${metaY - 4} m 570 ${metaY - 4} l S`);

    // Table Headers
    const tableTop = metaY - 18;
    content.push(`BT /F1 9 Tf 40 ${tableTop} Td (Date) Tj ET`);
    content.push(`BT /F1 9 Tf 100 ${tableTop} Td (Voucher No) Tj ET`);
    content.push(`BT /F1 9 Tf 175 ${tableTop} Td (Account) Tj ET`);
    content.push(`BT /F1 9 Tf 270 ${tableTop} Td (Description) Tj ET`);
    content.push(`BT /F1 9 Tf 410 ${tableTop} Td (Debit) Tj ET`);
    content.push(`BT /F1 9 Tf 475 ${tableTop} Td (Credit) Tj ET`);
    content.push(`BT /F1 9 Tf 530 ${tableTop} Td (Balance) Tj ET`);
    content.push(`40 ${tableTop - 6} m 570 ${tableTop - 6} l S`);

    let rowY = tableTop - 18;
    const exportSlice = rows.slice(0, 32);
    for (const r of exportSlice) {
      content.push(`BT /F2 8 Tf 40 ${rowY} Td (${escapePdf(r.date)}) Tj ET`);
      content.push(`BT /F2 8 Tf 100 ${rowY} Td (${escapePdf(r.voucherNo)}) Tj ET`);
      content.push(`BT /F2 8 Tf 175 ${rowY} Td (${escapePdf(r.accountName.slice(0, 16))}) Tj ET`);
      content.push(`BT /F2 8 Tf 270 ${rowY} Td (${escapePdf(r.narration.slice(0, 22))}) Tj ET`);
      content.push(`BT /F2 8 Tf 410 ${rowY} Td (${escapePdf(r.debit.toFixed(2))}) Tj ET`);
      content.push(`BT /F2 8 Tf 475 ${rowY} Td (${escapePdf(r.credit.toFixed(2))}) Tj ET`);
      content.push(`BT /F1 8 Tf 530 ${rowY} Td (${escapePdf(r.balance.toFixed(2))}) Tj ET`);
      content.push('0.2 w');
      content.push(`40 ${rowY - 4} m 570 ${rowY - 4} l S`);
      rowY -= 16;
    }

    content.push('BT /F2 8 Tf 40 30 Td (Generated by ERP System - Confidential General Ledger) Tj ET');

    const stream = content.join('\n');
    const streamLen = new Blob([stream]).size;

    let out = '%PDF-1.4\n';
    const offsets = [];

    const addObj = (str) => {
      offsets.push(new Blob([out]).size);
      out += str + '\n';
    };

    addObj('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj');
    addObj('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj');
    addObj('3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>\nendobj');
    addObj('4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj');
    addObj('5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj');
    addObj(`6 0 obj\n<< /Length ${streamLen} >>\nstream\n${stream}\nendstream\nendobj`);

    const startXref = new Blob([out]).size;
    out += 'xref\n0 7\n0000000000 65535 f \n';
    for (let i = 0; i < 6; i++) {
      out += String(offsets[i]).padStart(10, '0') + ' 00000 n \n';
    }
    out += `trailer\n<< /Size 7 /Root 1 0 R >>\nstartxref\n${startXref}\n%%EOF`;

    const blob = new Blob([out], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `general_ledger_${new Date().toISOString().split('T')[0]}.pdf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportExcel = () => {
    const rows = getLedgerRows();
    if (rows.length === 0) {
      setMsg('Error: No ledger entries to export.');
      return;
    }
    const headers = ['Date', 'Voucher No', 'Account', 'Description', 'Debit', 'Credit', 'Balance'];
    const csvRows = [
      headers.join(','),
      ...rows.map(r => [
        `"${(r.date || '').replace(/"/g, '""')}"`,
        `"${(r.voucherNo || '').replace(/"/g, '""')}"`,
        `"${(r.accountName || '').replace(/"/g, '""')}"`,
        `"${(r.narration || '').replace(/"/g, '""')}"`,
        r.debit || 0,
        r.credit || 0,
        r.balance || 0,
      ].join(','))
    ];
    const blob = new Blob([csvRows.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `general_ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const lbl = "block text-xs font-semibold text-gray-300 mb-1";
  const inp = "w-full px-3 py-2 rounded-lg border border-white/10 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 bg-[#140f2d]/80";
  const jinp = "px-2 py-1.5 rounded border border-white/10 text-xs focus:outline-none bg-[#140f2d]/80";

  const renderRows = getLedgerRows();

  return (
    <div>
      <div className="flex items-center gap-1 text-xs text-gray-400 mb-3 font-medium">
        <button onClick={() => navigate('/dashboard/accounts')} className="hover:text-amber-300">Financials</button>
        <ChevronRight size={12} />
        <span className="text-gray-300 font-semibold">General Ledger</span>
      </div>
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-lg bg-[#140f2d]/80 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-white/10 shadow-sm"><ArrowLeft size={15} /></button>
        <h2 className="text-xl font-bold text-gray-200">General Ledger</h2>
      </div>
      <hr className="border-white/10 mb-5" />

      {msg && (
        <div className={`mb-4 px-4 py-3 rounded-lg text-sm font-semibold border flex items-center gap-2 ${
          msg.toLowerCase().includes('error') || msg.toLowerCase().includes('failed') || msg.toLowerCase().includes('please') || msg.toLowerCase().includes('validation')
            ? 'bg-red-500/10 border-red-500/30 text-red-400' 
            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
        }`}>
          {msg.toLowerCase().includes('error') || msg.toLowerCase().includes('failed') || msg.toLowerCase().includes('please') || msg.toLowerCase().includes('validation') ? (
            <AlertCircle size={18} />
          ) : (
            <CheckCircle2 size={18} />
          )}
          {msg}
        </div>
      )}

      {/* Filter Section */}
      <div className="bg-[#140f2d]/80 rounded-lg border border-white/10 p-5 mb-4 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-300 mb-4">Filter Ledger</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className={lbl}>Account Type</label>
            <select value={filter.accountType} onChange={e => setFilterField('accountType', e.target.value)} className={inp}>
              {ACCOUNT_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className={lbl}>Account Code</label>
            <input value={filter.accountCode} onChange={e => setFilterField('accountCode', e.target.value)} className={inp} placeholder="e.g. 1001" />
          </div>
          <div>
            <label className={lbl}>Account Name</label>
            <input value={filter.accountName} onChange={e => setFilterField('accountName', e.target.value)} className={inp} placeholder="Search account name" />
          </div>
          <div>
            <label className={lbl}>Transaction Type</label>
            <select value={filter.transactionType} onChange={e => setFilterField('transactionType', e.target.value)} className={inp}>
              {TRANSACTION_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className={lbl}>Date From</label>
            <input type="date" value={filter.dateFrom} onChange={e => setFilterField('dateFrom', e.target.value)} className={inp} />
          </div>
          <div>
            <label className={lbl}>Date To</label>
            <input type="date" value={filter.dateTo} onChange={e => setFilterField('dateTo', e.target.value)} className={inp} />
          </div>
          <div>
            <label className={lbl}>Reference No</label>
            <input value={filter.referenceNo} onChange={e => setFilterField('referenceNo', e.target.value)} className={inp} placeholder="Invoice / Voucher no" />
          </div>
          <div>
            <label className={lbl}>Show Zero Balances</label>
            <select value={filter.showZeroBalances} onChange={e => setFilterField('showZeroBalances', e.target.value)} className={inp}>
              {SHOW_ZERO_OPTIONS.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={handleSearch} className="flex items-center gap-2 px-5 py-2 rounded-lg text-white text-sm font-semibold hover:opacity-90" style={{ background: '#4C6BF5' }}>
            <Search size={14} /> Search
          </button>
          <button onClick={handleExportPDF} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 text-sm font-semibold text-gray-300 hover:bg-white/10">
            <Download size={14} /> Export PDF
          </button>
          <button onClick={handleExportExcel} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 text-sm font-semibold text-gray-300 hover:bg-white/10">
            <Download size={14} /> Export Excel
          </button>
        </div>
      </div>

      {/* Add Journal Entry Section */}
      <div className="bg-[#140f2d]/80 rounded-lg border border-white/10 p-5 mb-4 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-300 mb-4">Add Journal Entry</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className={lbl}>Voucher No</label>
            <input value={voucherNo} onChange={e => setVoucherNo(e.target.value)} className={inp} placeholder="JV-0001" />
          </div>
          <div>
            <label className={lbl}>Entry Date *</label>
            <input type="date" value={entryDate} onChange={e => setEntryDate(e.target.value)} className={inp} />
          </div>
          <div>
            <label className={lbl}>Entry Type</label>
            <select value={entryType} onChange={e => setEntryType(e.target.value)} className={inp}>
              {ENTRY_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className={lbl}>Narration</label>
            <input value={narration} onChange={e => setNarration(e.target.value)} className={inp} placeholder="Description of entry" />
          </div>
        </div>

        {/* Journal Items Table */}
        <div className="overflow-x-auto mb-3">
          <table className="w-full text-sm border border-white/10 rounded-lg overflow-hidden">
            <thead>
              <tr style={{ background: '#2d3748' }}>
                {['Account Name','Account Code','Debit (₹)','Credit (₹)','Remarks',''].map(h => (
                  <th key={h} className="text-left px-3 py-2.5 text-xs font-semibold text-white">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx} className="border-b border-white/10">
                  <td className="px-2 py-2"><input value={item.accountName} onChange={e => updateItem(idx,'accountName',e.target.value)} className={jinp + ' w-36'} placeholder="Account name" /></td>
                  <td className="px-2 py-2"><input value={item.accountCode} onChange={e => updateItem(idx,'accountCode',e.target.value)} className={jinp + ' w-20'} placeholder="Code" /></td>
                  <td className="px-2 py-2"><input type="number" value={item.debit} onChange={e => updateItem(idx,'debit',e.target.value)} className={jinp + ' w-24'} /></td>
                  <td className="px-2 py-2"><input type="number" value={item.credit} onChange={e => updateItem(idx,'credit',e.target.value)} className={jinp + ' w-24'} /></td>
                  <td className="px-2 py-2"><input value={item.remarks} onChange={e => updateItem(idx,'remarks',e.target.value)} className={jinp + ' w-32'} placeholder="Remarks" /></td>
                  <td className="px-2 py-2">{items.length > 2 && <button onClick={() => setItems(p => p.filter((_,i) => i!==idx))} className="text-red-400 hover:text-red-400"><Trash2 size={13} /></button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button onClick={() => setItems(p => [...p, emptyItem()])} className="flex items-center gap-2 px-4 py-1.5 rounded-lg border border-dashed border-gray-400 text-gray-300 text-xs font-semibold hover:bg-white/10 mb-4">
          <Plus size={13} /> Add Row
        </button>

        <div className="text-sm text-gray-300 mb-4">
          Total Debit: <strong>₹{totalDebit.toFixed(2)}</strong> &nbsp;|&nbsp; Total Credit: <strong>₹{totalCredit.toFixed(2)}</strong> &nbsp;|&nbsp;
          Difference: <strong className={Math.abs(difference) < 0.01 ? 'text-emerald-400' : 'text-red-400'}>₹{difference.toFixed(2)}</strong>
        </div>

        <div className="flex gap-2">
          <button onClick={handlePostEntry} disabled={saving} className="flex items-center gap-2 px-5 py-2 rounded-lg text-white text-sm font-semibold hover:opacity-90 disabled:opacity-60" style={{ background: '#4C6BF5' }}>
            {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null} Post Entry
          </button>
          <button className="px-4 py-2 rounded-lg border border-white/10 text-sm font-semibold text-gray-300 hover:bg-white/10">Save as Draft</button>
        </div>
      </div>

      {/* Ledger Entries Table */}
      <div className="bg-[#140f2d]/80 rounded-lg border border-white/10 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-white/10"><h3 className="text-sm font-semibold text-gray-300">Ledger Entries</h3></div>
        {loading ? (
          <div className="flex items-center justify-center py-16"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: '#2d3748' }}>
                  {['Date','Voucher No','Account','Description','Debit (₹)','Credit (₹)','Balance (₹)','Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-white whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {renderRows.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-10 text-gray-400 text-sm">
                      {fetched ? 'No entries found.' : 'No entries found. Use filter above to search.'}
                    </td>
                  </tr>
                ) : (
                  renderRows.map((row) => (
                    <tr key={row.key} className="hover:bg-white/10">
                      <td className="px-4 py-3 text-xs text-gray-400">{row.date}</td>
                      <td className="px-4 py-3 text-xs font-medium text-blue-400">{row.voucherNo}</td>
                      <td className="px-4 py-3 text-xs font-semibold text-gray-200">{row.accountName}</td>
                      <td className="px-4 py-3 text-xs text-gray-400 max-w-[180px] truncate">{row.narration}</td>
                      <td className="px-4 py-3 text-xs text-right font-semibold text-emerald-400">
                        ₹{Number(row.debit || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-xs text-right font-semibold text-red-400">
                        ₹{Number(row.credit || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-xs text-right font-bold text-gray-200">
                        ₹{Number(row.balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <button className="text-blue-500 hover:underline">View</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
        {renderRows.length > 0 && (
          <div className="px-4 py-3 border-t border-white/10">
            <p className="text-xs text-gray-400">Showing {renderRows.length} entries</p>
          </div>
        )}
      </div>
    </div>
  );
}