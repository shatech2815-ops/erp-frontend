import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, CheckCircle, XCircle, Clock, ChevronRight,
  GitBranch, Search, User, Shield, MessageSquare, AlertCircle,
} from 'lucide-react';

import {
  getAllRequisitions,
  approveRequisition,
  getRequisitionApprovals,
  updateRequisitionStatus,
} from "../../services/purchase/requisition.services";

const STATUS_CONFIG = {
  PENDING:  { label: 'Pending',  color: '#d97706', bg: 'rgba(245,158,11,0.15)', icon: Clock },
  APPROVED: { label: 'Approved', color: '#059669', bg: 'rgba(16,185,129,0.15)', icon: CheckCircle },
  REJECTED: { label: 'Rejected', color: '#dc2626', bg: 'rgba(239,68,68,0.15)', icon: XCircle },
};

const ROLE_OPTIONS = ['Manager', 'Admin', 'Supervisor', 'HOD', 'Director'];

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
  const Icon = cfg.icon;
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ background: cfg.bg, color: cfg.color }}>
      <Icon size={11} />
      {cfg.label}
    </span>
  );
};

const ApprovalWorkflow = () => {
  const navigate = useNavigate();

  // Load requisitions from localStorage as state
  const [requisitions, setRequisitions] = useState([]);

  const [form, setForm] = useState({
    requisitionId: '',
    approverName: '',
    role: '',
    remarks: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [actionSuccess, setActionSuccess] = useState('');

  const [searchId, setSearchId] = useState('');
  const [timeline, setTimeline] = useState([]);
  const [timelineLoaded, setTimelineLoaded] = useState(false);
  const [requisitionInfo, setRequisitionInfo] = useState(null);

  // Load requisitions on mount
  // useEffect(() => {
  //   try {
  //     const stored = localStorage.getItem('srivaari_requisitions');
  //     setRequisitions(stored ? JSON.parse(stored) : []);
  //   } catch {
  //     setRequisitions([]);
  //   }
  // }, []);

  useEffect(() => {
  fetchRequisitions();
}, []);

const fetchRequisitions = async () => {
  try {
    const data = await getAllRequisitions();
    setRequisitions(data);
  } catch (error) {
    console.error("Error loading requisitions:", error);
  }
};

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.requisitionId) e.requisitionId = 'Requisition ID is required';
    if (!form.approverName.trim()) e.approverName = 'Approver name is required';
    if (!form.role) e.role = 'Role is required';
    return e;
  };

  // const submitApproval = (status) => {
  //   const e = validate();
  //   if (Object.keys(e).length > 0) { setFormErrors(e); return; }

  //   const reqId = Number(form.requisitionId);
  //   const req = requisitions.find(r => r.id === reqId);

  //   if (!req) {
  //     setFormErrors({ requisitionId: 'No requisition found with this ID' });
  //     return;
  //   }

  //   const approval = {
  //     id: Date.now(),
  //     requisitionId: reqId,
  //     approverName: form.approverName,
  //     role: form.role,
  //     status,
  //     remarks: form.remarks,
  //     actionTime: new Date().toISOString(),
  //   };

  //   const approvalsKey = `srivaari_approvals_${reqId}`;
  //   const existingApprovals = JSON.parse(localStorage.getItem(approvalsKey) || '[]');
  //   existingApprovals.push(approval);
  //   localStorage.setItem(approvalsKey, JSON.stringify(existingApprovals));

  //   if (status === 'APPROVED' || status === 'REJECTED') {
  //     const updated = requisitions.map(r => r.id === reqId ? { ...r, status } : r);
  //     localStorage.setItem('srivaari_requisitions', JSON.stringify(updated));
  //     setRequisitions(updated);
  //   }

  //   setActionSuccess(status);
  //   setTimeout(() => {
  //     setActionSuccess('');
  //     setForm({ requisitionId: '', approverName: '', role: '', remarks: '' });
  //   }, 2500);

  //   if (String(searchId) === String(reqId)) {
  //     loadTimeline(reqId);
  //   }
  // };

  const submitApproval = async (status) => {
  const e = validate();
  if (Object.keys(e).length > 0) {
    setFormErrors(e);
    return;
  }

  const reqId = Number(form.requisitionId);
  const req = requisitions.find((r) => r.id === reqId);

  if (!req) {
    setFormErrors({ requisitionId: "No requisition found with this ID" });
    return;
  }

  const approvalData = {
    requisitionId: reqId,
    approverName: form.approverName,
    role: form.role,
    status: status,
    remarks: form.remarks,
  };

  try {
    // Save approval history
    await approveRequisition(approvalData);

    // Update requisition status
    await updateRequisitionStatus(reqId, status);

    // Refresh requisitions list
    await fetchRequisitions();

    setActionSuccess(status);

    setTimeout(() => {
      setActionSuccess("");
      setForm({
        requisitionId: "",
        approverName: "",
        role: "",
        remarks: "",
      });
    }, 2500);

    // Reload timeline if currently viewing same requisition
    if (String(searchId) === String(reqId)) {
      loadTimeline(reqId);
    }
  } catch (error) {
    console.error("Error processing approval:", error);
  }
};

  // const loadTimeline = (idOverride) => {
  //   const reqId = Number(idOverride || searchId);
  //   if (!reqId) return;

  //   const req = requisitions.find(r => r.id === reqId);
  //   setRequisitionInfo(req || null);

  //   const approvals = JSON.parse(localStorage.getItem(`srivaari_approvals_${reqId}`) || '[]');
  //   setTimeline(approvals);
  //   setTimelineLoaded(true);
  // };

  const loadTimeline = async (idOverride) => {
  const reqId = Number(idOverride || searchId);

  if (!reqId) return;

  try {
    const req = requisitions.find((r) => r.id === reqId);
    setRequisitionInfo(req || null);

    const approvals = await getRequisitionApprovals(reqId);

    setTimeline(approvals);
    setTimelineLoaded(true);
  } catch (error) {
    console.error("Error loading approval timeline:", error);
    setTimeline([]);
    setTimelineLoaded(true);
  }
};

  const inputClass = (field) =>
    `w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 bg-white/5 transition-colors ${
      formErrors[field]
        ? 'border-red-300 focus:ring-red-200'
        : 'border-white/10 focus:ring-[#1cc88a]/30'
    }`;

  const FieldError = ({ field }) =>
    formErrors[field] ? (
      <p className="flex items-center gap-1 text-xs text-red-400 mt-1">
        <AlertCircle size={11} /> {formErrors[field]}
      </p>
    ) : null;

  const formatTime = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-purple-300 mb-4 font-medium">
        <button onClick={() => navigate('/dashboard/purchase')} className="hover:text-purple-300 transition-colors">Purchase Management</button>
        <ChevronRight size={12} className="text-gray-300" />
        <button onClick={() => navigate('/dashboard/purchase/requisitions')} className="hover:text-purple-300 transition-colors">Requisitions</button>
        <ChevronRight size={12} className="text-gray-300" />
        <span className="text-white font-semibold">Approval Workflow</span>
      </div>

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/dashboard/purchase/requisitions')}
          className="w-10 h-10 rounded-xl bg-[#140f2d]/80 border border-white/10 flex items-center justify-center text-purple-300 hover:bg-white/10 transition-colors shadow-sm">
          <ArrowLeft size={16} />
        </button>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm" style={{ background: 'rgba(16,185,129,0.15)' }}>
          <GitBranch size={22} style={{ color: '#059669' }} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Approval Workflow</h2>
          <p className="text-sm text-gray-400">Approve or reject requisitions and view history</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* LEFT: Action Form */}
        <div className="bg-[#140f2d]/80 rounded-2xl shadow-sm border border-white/10 p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.15)' }}>
              <Shield size={14} style={{ color: '#059669' }} />
            </div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wide">Take Action</h3>
          </div>

          {actionSuccess && (
            <div className={`flex items-center gap-2 px-4 py-3 rounded-xl mb-4 text-sm font-medium ${
              actionSuccess === 'APPROVED'
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                : 'bg-red-500/10 border border-red-500/30 text-red-400'
            }`}>
              {actionSuccess === 'APPROVED' ? <CheckCircle size={15} /> : <XCircle size={15} />}
              Requisition {actionSuccess.toLowerCase()} successfully!
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-purple-300 mb-1.5">Requisition ID <span className="text-red-400">*</span></label>
              <select name="requisitionId" value={form.requisitionId} onChange={handleChange}
                className={inputClass('requisitionId')}>
                <option value="">Select Requisition...</option>
                {requisitions.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.id} — {r.requisitionNumber || ('REQ-' + r.id)} | {r.itemName} ({r.status})
                  </option>
                ))}
              </select>
              <FieldError field="requisitionId" />
              <p className="text-xs text-gray-400 mt-1">Select from existing requisitions</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-purple-300 mb-1.5">Approver Name <span className="text-red-400">*</span></label>
              <div className="relative">
                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input name="approverName" value={form.approverName} onChange={handleChange}
                  placeholder="e.g. Rajesh Sharma"
                  className={`${inputClass('approverName')} pl-9`} />
              </div>
              <FieldError field="approverName" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-purple-300 mb-1.5">Role <span className="text-red-400">*</span></label>
              <select name="role" value={form.role} onChange={handleChange}
                className={inputClass('role')}>
                <option value="">Select Role</option>
                {ROLE_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              <FieldError field="role" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-purple-300 mb-1.5">
                <span className="flex items-center gap-1"><MessageSquare size={12} /> Remarks <span className="text-gray-400 font-normal">(optional)</span></span>
              </label>
              <textarea name="remarks" value={form.remarks} onChange={handleChange}
                rows={3} placeholder="Reason for approval or rejection..."
                className="w-full px-4 py-2.5 rounded-xl border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-[#1cc88a]/30 bg-white/5 resize-none" />
            </div>

            <div className="flex gap-3 pt-1">
              <button
                onClick={() => submitApproval('APPROVED')}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-white text-sm font-bold shadow-md hover:opacity-90 transition-opacity"
                style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}>
                <CheckCircle size={16} /> Approve
              </button>
              <button
                onClick={() => submitApproval('REJECTED')}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-white text-sm font-bold shadow-md hover:opacity-90 transition-opacity"
                style={{ background: 'linear-gradient(135deg, #dc2626, #ef4444)' }}>
                <XCircle size={16} /> Reject
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT: Approval Timeline */}
        <div className="bg-[#140f2d]/80 rounded-2xl shadow-sm border border-white/10 p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(139,92,246,0.12)' }}>
              <Clock size={14} style={{ color: '#8b5cf6' }} />
            </div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wide">Approval Timeline</h3>
          </div>

          <div className="flex gap-2 mb-5">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <select
                value={searchId} onChange={e => setSearchId(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 bg-white/5">
                <option value="">Select Requisition ID...</option>
                {requisitions.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.id} — {r.requisitionNumber || ('REQ-' + r.id)} | {r.itemName}
                  </option>
                ))}
              </select>
            </div>
            <button onClick={() => loadTimeline()}
              className="px-4 py-2.5 rounded-xl text-white text-sm font-semibold shadow-sm hover:opacity-90 transition-opacity"
              style={{ background: '#8b5cf6' }}>
              Load
            </button>
          </div>

          {timelineLoaded && requisitionInfo && (
            <div className="bg-white/5 border border-blue-100 rounded-xl p-3 mb-4">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-bold text-white">{requisitionInfo.itemName}</p>
                <StatusBadge status={requisitionInfo.status} />
              </div>
              <p className="text-xs text-gray-400">{requisitionInfo.requisitionNumber} · {requisitionInfo.requestedBy} · {requisitionInfo.department}</p>
            </div>
          )}

          {timelineLoaded && !requisitionInfo && (
            <div className="text-center py-8 text-gray-400">
              <AlertCircle size={32} className="opacity-30 mx-auto mb-2" />
              <p className="text-sm font-medium">Requisition not found</p>
              <p className="text-xs">Check the ID and try again</p>
            </div>
          )}

          {timelineLoaded && requisitionInfo && (
            timeline.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <Clock size={32} className="opacity-30 mx-auto mb-2" />
                <p className="text-sm font-medium">No approvals yet</p>
                <p className="text-xs">Actions taken will appear here</p>
              </div>
            ) : (
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-white/5" />
                <div className="space-y-4">
                  {timeline.map((a) => {
                    const cfg = STATUS_CONFIG[a.status] || STATUS_CONFIG.PENDING;
                    const Icon = cfg.icon;
                    return (
                      <div key={a.id} className="relative flex gap-4 pl-10">
                        <div className="absolute left-0 w-8 h-8 rounded-full flex items-center justify-center border-2 border-white shadow-sm flex-shrink-0"
                          style={{ background: cfg.bg }}>
                          <Icon size={14} style={{ color: cfg.color }} />
                        </div>
                        <div className="flex-1 bg-white/5 rounded-xl p-3 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div>
                              <p className="text-sm font-bold text-white">{a.approverName}</p>
                              <p className="text-xs text-gray-400">{a.role}</p>
                            </div>
                            <StatusBadge status={a.status} />
                          </div>
                          {a.remarks && (
                            <p className="text-xs text-gray-400 mt-1 italic">"{a.remarks}"</p>
                          )}
                          <p className="text-xs text-gray-400 mt-1">{formatTime(a.actionTime)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )
          )}

          {!timelineLoaded && (
            <div className="text-center py-12 text-gray-300">
              <GitBranch size={40} className="opacity-40 mx-auto mb-3" />
              <p className="text-sm text-gray-400 font-medium">Select a Requisition ID to view approval history</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ApprovalWorkflow;
