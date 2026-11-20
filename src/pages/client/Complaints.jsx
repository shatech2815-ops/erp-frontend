// src/pages/client/Complaints.jsx

import React, {
  useState,
  useEffect,
} from "react";
import { createPortal } from "react-dom";
import apiInterceptor from "../../interceptors/interceptors";

import {
  ArrowLeft,
  ChevronRight,
  AlertTriangle,
  Plus,
  Search,
  X,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

const Complaints = () => {

  const navigate = useNavigate();

  // ================= STATES =================

  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [viewComplaint, setViewComplaint] = useState(null);
  const [editComplaint, setEditComplaint] = useState(null);
  const [search, setSearch] = useState("");
  const [stats, setStats] = useState({ open: 0, inProgress: 0, resolved: 0, closed: 0 });

  // ================= DATA =================

  const [complaints, setComplaints] = useState([]);
  const [clients, setClients] = useState([]);
  const [newComplaint, setNewComplaint] = useState({
    complaintNumber: "",
    clientId: "",
    serviceRequestId: "",
    subject: "",
    description: "",
    priority: "High",
    status: "Open"
  });

  const fetchComplaints = async () => {
    try {
      const response = await apiInterceptor.get("/complaints");
      const list = response.data || [];
      setComplaints(list);
      // compute stats
      const open = list.filter(c => c.status === "Open").length;
      const inProgress = list.filter(c => c.status === "In Progress").length;
      const resolved = list.filter(c => c.status === "Resolved").length;
      const closed = list.filter(c => c.status === "Closed").length;
      setStats({ open, inProgress, resolved, closed });
    } catch (error) {
      console.error("Error fetching complaints:", error);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await apiInterceptor.get("/clients");
      setClients(response.data || []);
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  };

  // helper to get client name from id
  const getClientName = (id) => {
    const client = clients.find(c => String(c.id) === String(id));
    return client ? client.name : id;
  };

  useEffect(() => {
    fetchComplaints();
    fetchClients();
  }, []);

  const handleChange = (e) => {
    setNewComplaint({ ...newComplaint, [e.target.name]: e.target.value });
  };

  const handleEditChange = (e) => {
    setEditComplaint({ ...editComplaint, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    // Validate required fields
    if (!newComplaint.subject || !newComplaint.subject.trim()) {
      alert("Please enter a Subject");
      return;
    }
    if (!newComplaint.clientId || !newComplaint.clientId.trim()) {
      alert("Please enter a Client ID");
      return;
    }
    if (!newComplaint.description || !newComplaint.description.trim()) {
      alert("Please enter a Description");
      return;
    }
    try {
      await apiInterceptor.post("/complaints", newComplaint);
      setShowModal(false);
      fetchComplaints();
      setNewComplaint({
        complaintNumber: "",
        clientId: "",
        serviceRequestId: "",
        subject: "",
        description: "",
        priority: "High",
        status: "Open"
      });
      alert("Complaint Saved Successfully");
    } catch (error) {
      console.error("Error saving complaint:", error);
      alert("Failed to save complaint");
    }
  };

  const handleUpdate = async () => {
    try {
      await apiInterceptor.put(`/complaints/${editComplaint.id}`, editComplaint);
      setShowEditModal(false);
      fetchComplaints();
      alert("Complaint updated successfully");
    } catch (error) {
      console.error("Error updating complaint:", error);
      alert("Failed to update complaint");
    }
  };

  // ================= FILTER =================

  const filteredComplaints =
    complaints.filter((item) => {
      const term = search.toLowerCase();
      return (
        (item.subject || "").toLowerCase().includes(term) ||
        (item.clientId || "").toLowerCase().includes(term) ||
        (item.complaintNumber || "").toLowerCase().includes(term)
      );
    });

  // ================= STATUS STYLE =================

  const getStatusStyle =
    (status) => {

      switch (status) {

        case "Open":

          return "bg-red-100 text-red-400";

        case "In Progress":

          return "bg-yellow-100 text-amber-400";

        case "Resolved":

          return "bg-green-100 text-emerald-400";

        case "Closed":

          return "bg-blue-100 text-blue-400";

        default:

          return "bg-white/5 text-white text-gray-300";
      }
    };

  // ================= PRIORITY STYLE =================

  const getPriorityStyle =
    (priority) => {

      switch (priority) {

        case "High":

          return "bg-red-100 text-red-400";

        case "Medium":

          return "bg-yellow-100 text-amber-400";

        case "Low":

          return "bg-green-100 text-emerald-400";

        default:

          return "bg-white/5 text-white text-gray-300";
      }
    };

  return (

    <div>

      {/* ================= BREADCRUMB ================= */}

      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">

        <span
          className="cursor-pointer hover:text-purple-300"
          onClick={() =>
            navigate("/dashboard/client")
          }
        >
          Client Management
        </span>

        <ChevronRight size={14} />

        <span
          className="cursor-pointer hover:text-purple-300"
          onClick={() =>
            navigate("/dashboard/client/service")
          }
        >
          Service
        </span>

        <ChevronRight size={14} />

        <span className="font-medium text-white">
          Complaints
        </span>

      </div>

      {/* ================= HEADER ================= */}

      <div className="flex items-center justify-between mb-6">

        {/* LEFT */}

        <div className="flex items-center gap-4">

          {/* BACK */}

          <button
            onClick={() =>
              navigate("/dashboard/client/service")
            }
            className="w-10 h-10 rounded-xl bg-[#140f2d]/80 border border-white/10 flex items-center justify-center shadow-sm"
          >

            <ArrowLeft
              size={16}
              className="text-purple-300"
            />

          </button>

          {/* ICON */}

          <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center shadow-sm">

            <AlertTriangle
              size={22}
              className="text-[#DC2626]"
            />

          </div>

          {/* TITLE */}

          <div>

            <h2 className="text-xl font-bold text-white">
              Complaints
            </h2>

            <p className="text-sm text-gray-400">
              Track customer complaints & resolutions
            </p>

          </div>

        </div>

        {/* BUTTON */}

        <button
          onClick={() =>
            setShowModal(true)
          }
          className="flex items-center gap-2 px-5 py-3 rounded-xl text-white text-sm font-semibold shadow-md"
          style={{
            background:
              "linear-gradient(135deg,#2563EB,#3B82F6)",
          }}
        >

          <Plus size={18} />

          Add Complaint

        </button>

      </div>

      {/* ================= STATS ================= */}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6">

        <div className="bg-[#140f2d]/80 rounded-3xl shadow-sm p-5 border-t-4 border-red-500">

          <p className="text-xs font-semibold text-gray-400 uppercase">
            Open Complaints
          </p>

          <h2 className="text-3xl font-bold text-red-400 mt-2">
            {stats.open}
          </h2>

        </div>

        <div className="bg-[#140f2d]/80 rounded-3xl shadow-sm p-5 border-t-4 border-yellow-500">

          <p className="text-xs font-semibold text-gray-400 uppercase">
            In Progress
          </p>

          <h2 className="text-3xl font-bold text-amber-400 mt-2">
            {stats.inProgress}
          </h2>

        </div>

        <div className="bg-[#140f2d]/80 rounded-3xl shadow-sm p-5 border-t-4 border-green-500">

          <p className="text-xs font-semibold text-gray-400 uppercase">
            Resolved
          </p>

          <h2 className="text-3xl font-bold text-emerald-400 mt-2">
            {stats.resolved}
          </h2>

        </div>

        <div className="bg-[#140f2d]/80 rounded-3xl shadow-sm p-5 border-t-4 border-blue-500">

          <p className="text-xs font-semibold text-gray-400 uppercase">
            Closed
          </p>

          <h2 className="text-3xl font-bold text-blue-400 mt-2">
            {stats.closed}
          </h2>

        </div>

      </div>

      {/* ================= TABLE ================= */}

      <div className="bg-[#140f2d]/80 rounded-3xl shadow-sm overflow-hidden">

        {/* SEARCH */}

        <div className="p-5 border-b border-white/10">

          <div className="flex items-center bg-purple-500/10 rounded-2xl px-4 py-3">

            <Search
              size={18}
              className="text-gray-400"
            />

            <input
              type="text"
              placeholder="Search complaints..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              className="bg-transparent outline-none px-3 w-full"
            />

          </div>

        </div>

        {/* TABLE */}

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead className="bg-white/5 text-white">

              <tr>

                {[
                  "Complaint No",
                  "Client",
                  "Service Request",
                  "Subject",
                  "Priority",
                  "Status",
                  "Action",
                ].map((head) => (

                  <th
                    key={head}
                    className="text-left px-6 py-4 text-xs font-semibold text-purple-300 uppercase"
                  >

                    {head}

                  </th>

                ))}

              </tr>

            </thead>

            <tbody>

              {filteredComplaints.map(
                (item, index) => (

                  <tr
                    key={index}
                    className="border-t border-white/10 hover:bg-[rgba(250,252,255,0.12)]"
                  >

                    <td className="px-6 py-5 text-sm font-bold text-white">
                      {item.complaintNumber}
                    </td>

                    <td className="px-6 py-5 text-sm text-white">
                      {getClientName(item.clientId)}
                    </td>

                    <td className="px-6 py-5 text-sm text-white">
                      {item.serviceRequestId || item.serviceRequest}
                    </td>

                    <td className="px-6 py-5 text-sm text-white">
                      {item.subject}
                    </td>

                    <td className="px-6 py-5">

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityStyle(
                          item.priority
                        )}`}
                      >

                        {item.priority}

                      </span>

                    </td>

                    <td className="px-6 py-5">

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle(
                          item.status
                        )}`}
                      >

                        {item.status}

                      </span>

                    </td>

                    <td className="px-6 py-5">

                      <div className="flex items-center gap-2">

                        <button onClick={() => { setViewComplaint(item); setShowViewModal(true); }} className="px-3 py-1.5 rounded-xl bg-blue-500/10 text-blue-300 text-xs font-semibold">

                          View

                        </button>

                        <button onClick={() => { setEditComplaint(item); setShowEditModal(true); }} className="px-3 py-1.5 rounded-xl bg-white/5 text-white text-xs font-semibold">

                          Update

                        </button>

                      </div>

                    </td>

                  </tr>
                )
              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* ================= MODAL ================= */}

      {showModal && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-[#1a1340] border border-white/10 rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col relative my-auto overflow-hidden animate-fade-in-up">
            {/* HEADER */}
            <div className="flex items-center justify-between p-6 pb-4 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                  <Plus size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Add Complaint</h2>
                  <p className="text-xs text-gray-400">Submit a new customer complaint record</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* FORM BODY */}
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* COMPLAINT NUMBER */}
                <div>
                  <label className="block text-sm font-semibold text-purple-300 mb-2">
                    Complaint Number
                  </label>
                  <input
                    type="text"
                    name="complaintNumber"
                    value={newComplaint.complaintNumber}
                    onChange={handleChange}
                    placeholder="CMP-2024-001"
                    className="w-full px-4 py-3 rounded-2xl bg-purple-500/10 border border-white/10 focus:border-purple-400 outline-none text-white transition-colors"
                  />
                </div>

                {/* CLIENT */}
                <div>
                  <label className="block text-sm font-semibold text-purple-300 mb-2">
                    Client
                  </label>
                  <select
                    name="clientId"
                    value={newComplaint.clientId}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-2xl bg-purple-500/10 border border-white/10 focus:border-purple-400 outline-none text-white transition-colors"
                  >
                    <option value="" className="bg-[#140f2d] text-white">Select Client</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id} className="bg-[#140f2d] text-white">
                        {client.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* SERVICE REQUEST */}
                <div>
                  <label className="block text-sm font-semibold text-purple-300 mb-2">
                    Service Request ID
                  </label>
                  <input
                    type="text"
                    name="serviceRequestId"
                    value={newComplaint.serviceRequestId}
                    onChange={handleChange}
                    placeholder="Enter service request id"
                    className="w-full px-4 py-3 rounded-2xl bg-purple-500/10 border border-white/10 focus:border-purple-400 outline-none text-white transition-colors"
                  />
                </div>

                {/* PRIORITY */}
                <div>
                  <label className="block text-sm font-semibold text-purple-300 mb-2">
                    Priority
                  </label>
                  <select
                    name="priority"
                    value={newComplaint.priority}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-2xl bg-purple-500/10 border border-white/10 focus:border-purple-400 outline-none text-white transition-colors"
                  >
                    <option value="High" className="bg-[#140f2d] text-white">High</option>
                    <option value="Medium" className="bg-[#140f2d] text-white">Medium</option>
                    <option value="Low" className="bg-[#140f2d] text-white">Low</option>
                  </select>
                </div>

                {/* SUBJECT */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-purple-300 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={newComplaint.subject}
                    onChange={handleChange}
                    placeholder="Enter complaint subject"
                    className="w-full px-4 py-3 rounded-2xl bg-purple-500/10 border border-white/10 focus:border-purple-400 outline-none text-white transition-colors"
                  />
                </div>

                {/* DESCRIPTION */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-purple-300 mb-2">
                    Description
                  </label>
                  <textarea
                    rows="3"
                    name="description"
                    value={newComplaint.description}
                    onChange={handleChange}
                    placeholder="Describe complaint..."
                    className="w-full px-4 py-3 rounded-2xl bg-purple-500/10 border border-white/10 focus:border-purple-400 outline-none resize-none text-white transition-colors"
                  />
                </div>

                {/* STATUS */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-purple-300 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={newComplaint.status}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-2xl bg-purple-500/10 border border-white/10 focus:border-purple-400 outline-none text-white transition-colors"
                  >
                    <option value="Open" className="bg-[#140f2d] text-white">Open</option>
                    <option value="In Progress" className="bg-[#140f2d] text-white">In Progress</option>
                    <option value="Resolved" className="bg-[#140f2d] text-white">Resolved</option>
                    <option value="Closed" className="bg-[#140f2d] text-white">Closed</option>
                  </select>
                </div>
              </div>
            </div>

            {/* FOOTER BUTTONS */}
            <div className="flex items-center justify-end gap-3 p-4 sm:px-6 sm:py-4 border-t border-white/10 shrink-0 bg-[#140f2d]/60 rounded-b-3xl">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 rounded-2xl bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 text-sm font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
              >
                <span>✓</span> Save Complaint
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

        {/* VIEW MODAL */}
        {showViewModal && viewComplaint && createPortal(
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <div className="bg-[#1a1340] border border-white/10 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col relative my-auto overflow-hidden animate-fade-in-up">
              <div className="flex items-center justify-between p-6 pb-4 border-b border-white/10 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-400">
                    <AlertTriangle size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Complaint Details</h2>
                    <p className="text-xs text-gray-400">View complaint information and resolution status</p>
                  </div>
                </div>
                <button
                  onClick={() => { setShowViewModal(false); setViewComplaint(null); }}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="bg-purple-500/10 rounded-2xl p-4 border border-white/5">
                    <p className="text-xs text-purple-300 font-semibold uppercase mb-1">Complaint No</p>
                    <p className="text-white font-bold">{viewComplaint.complaintNumber}</p>
                  </div>
                  <div className="bg-purple-500/10 rounded-2xl p-4 border border-white/5">
                    <p className="text-xs text-purple-300 font-semibold uppercase mb-1">Client</p>
                    <p className="text-white font-bold">{getClientName(viewComplaint.clientId)}</p>
                  </div>
                  <div className="bg-purple-500/10 rounded-2xl p-4 border border-white/5">
                    <p className="text-xs text-purple-300 font-semibold uppercase mb-1">Service Request ID</p>
                    <p className="text-white font-bold">{viewComplaint.serviceRequestId || "—"}</p>
                  </div>
                  <div className="bg-purple-500/10 rounded-2xl p-4 border border-white/5">
                    <p className="text-xs text-purple-300 font-semibold uppercase mb-1">Priority</p>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityStyle(viewComplaint.priority)}`}>{viewComplaint.priority}</span>
                  </div>
                  <div className="bg-purple-500/10 rounded-2xl p-4 md:col-span-2 border border-white/5">
                    <p className="text-xs text-purple-300 font-semibold uppercase mb-1">Subject</p>
                    <p className="text-white font-bold">{viewComplaint.subject}</p>
                  </div>
                  <div className="bg-purple-500/10 rounded-2xl p-4 md:col-span-2 border border-white/5">
                    <p className="text-xs text-purple-300 font-semibold uppercase mb-1">Description</p>
                    <p className="text-white/80 text-sm leading-relaxed">{viewComplaint.description || "No description provided."}</p>
                  </div>
                  <div className="bg-purple-500/10 rounded-2xl p-4 border border-white/5">
                    <p className="text-xs text-purple-300 font-semibold uppercase mb-1">Status</p>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle(viewComplaint.status)}`}>{viewComplaint.status}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end p-4 sm:px-6 sm:py-4 border-t border-white/10 shrink-0 bg-[#140f2d]/60 rounded-b-3xl">
                <button
                  type="button"
                  onClick={() => { setShowViewModal(false); setViewComplaint(null); }}
                  className="px-5 py-2.5 rounded-2xl bg-white/5 text-white text-sm font-semibold hover:bg-white/10 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

        {/* EDIT MODAL */}
        {showEditModal && editComplaint && createPortal(
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <div className="bg-[#1a1340] border border-white/10 rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col relative my-auto overflow-hidden animate-fade-in-up">
              <div className="flex items-center justify-between p-6 pb-4 border-b border-white/10 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                    <AlertTriangle size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Edit Complaint</h2>
                    <p className="text-xs text-gray-400">Update customer complaint details</p>
                  </div>
                </div>
                <button
                  onClick={() => { setShowEditModal(false); setEditComplaint(null); }}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Complaint Number */}
                  <div>
                    <label className="block text-sm font-semibold text-purple-300 mb-2">Complaint Number</label>
                    <input
                      type="text"
                      name="complaintNumber"
                      value={editComplaint.complaintNumber}
                      onChange={handleEditChange}
                      className="w-full px-4 py-3 rounded-2xl bg-purple-500/10 border border-white/10 focus:border-purple-400 outline-none text-white transition-colors"
                    />
                  </div>

                  {/* Client */}
                  <div>
                    <label className="block text-sm font-semibold text-purple-300 mb-2">Client</label>
                    <select
                      name="clientId"
                      value={editComplaint.clientId}
                      onChange={handleEditChange}
                      className="w-full px-4 py-3 rounded-2xl bg-purple-500/10 border border-white/10 focus:border-purple-400 outline-none text-white transition-colors"
                    >
                      <option value="" className="bg-[#140f2d] text-white">Select Client</option>
                      {clients.map((client) => (
                        <option key={client.id} value={client.id} className="bg-[#140f2d] text-white">{client.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Service Request ID */}
                  <div>
                    <label className="block text-sm font-semibold text-purple-300 mb-2">Service Request ID</label>
                    <input
                      type="text"
                      name="serviceRequestId"
                      value={editComplaint.serviceRequestId}
                      onChange={handleEditChange}
                      className="w-full px-4 py-3 rounded-2xl bg-purple-500/10 border border-white/10 focus:border-purple-400 outline-none text-white transition-colors"
                    />
                  </div>

                  {/* Priority */}
                  <div>
                    <label className="block text-sm font-semibold text-purple-300 mb-2">Priority</label>
                    <select
                      name="priority"
                      value={editComplaint.priority}
                      onChange={handleEditChange}
                      className="w-full px-4 py-3 rounded-2xl bg-purple-500/10 border border-white/10 focus:border-purple-400 outline-none text-white transition-colors"
                    >
                      <option value="High" className="bg-[#140f2d] text-white">High</option>
                      <option value="Medium" className="bg-[#140f2d] text-white">Medium</option>
                      <option value="Low" className="bg-[#140f2d] text-white">Low</option>
                    </select>
                  </div>

                  {/* Subject */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-purple-300 mb-2">Subject</label>
                    <input
                      type="text"
                      name="subject"
                      value={editComplaint.subject}
                      onChange={handleEditChange}
                      className="w-full px-4 py-3 rounded-2xl bg-purple-500/10 border border-white/10 focus:border-purple-400 outline-none text-white transition-colors"
                    />
                  </div>

                  {/* Description */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-purple-300 mb-2">Description</label>
                    <textarea
                      rows="3"
                      name="description"
                      value={editComplaint.description}
                      onChange={handleEditChange}
                      className="w-full px-4 py-3 rounded-2xl bg-purple-500/10 border border-white/10 focus:border-purple-400 outline-none resize-none text-white transition-colors"
                    />
                  </div>

                  {/* Status */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-purple-300 mb-2">Status</label>
                    <select
                      name="status"
                      value={editComplaint.status}
                      onChange={handleEditChange}
                      className="w-full px-4 py-3 rounded-2xl bg-purple-500/10 border border-white/10 focus:border-purple-400 outline-none text-white transition-colors"
                    >
                      <option value="Open" className="bg-[#140f2d] text-white">Open</option>
                      <option value="In Progress" className="bg-[#140f2d] text-white">In Progress</option>
                      <option value="Resolved" className="bg-[#140f2d] text-white">Resolved</option>
                      <option value="Closed" className="bg-[#140f2d] text-white">Closed</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 p-4 sm:px-6 sm:py-4 border-t border-white/10 shrink-0 bg-[#140f2d]/60 rounded-b-3xl">
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); setEditComplaint(null); }}
                  className="px-5 py-2.5 rounded-2xl bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUpdate}
                  className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
                >
                  <span>✓</span> Update
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

    </div>

  );
};

export default Complaints;

