import React, { useEffect, useState } from "react";

import apiInterceptor from "../../interceptors/interceptors";

import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  Eye,
  ChevronRight,
  BriefcaseBusiness,
  Search,
  Filter,
  CheckCircle2,
  Clock3,
  TrendingUp,
  FileText,
  RotateCcw,
  X,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

const OpportunityList = () => {

  const navigate = useNavigate();

  // ================= STATES =================

  const [opportunities, setOpportunities] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchId, setSearchId] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [openCount, setOpenCount] = useState(0);
  const [openAmount, setOpenAmount] = useState(0);
  const [totalOpportunities, setTotalOpportunities] = useState(0);
  const [loading, setLoading] = useState(false);
  const [viewOpportunity, setViewOpportunity] = useState(null);
  const [editOpportunity, setEditOpportunity] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);

  // ================= FETCH ALL =================

  const fetchAllOpportunities = async (pageToFetch = page) => {
    try {
      setLoading(true);
      const response = await apiInterceptor.get(`/opportunities?page=${pageToFetch}&size=10`);
      const data = response.data;
      const list = Array.isArray(data) ? data : (data?.opportunities || []);
      setOpportunities(list);
      setTotalPages(data?.totalPages !== undefined ? data.totalPages : (list.length > 0 ? 1 : 0));
      setTotalOpportunities(data?.totalItems !== undefined ? data.totalItems : list.length);
    } catch (error) {
      console.error("Fetch error:", error);
      setOpportunities([]);
    } finally {
      setLoading(false);
    }
  };

  // ================= GET BY ID OR CODE OR NAME =================

  const fetchOpportunityById = async () => {
    if (!searchId || !searchId.trim()) {
      fetchAllOpportunities(0);
      return;
    }

    try {
      setLoading(true);
      const response = await apiInterceptor.get(`/opportunities/${encodeURIComponent(searchId.trim())}`);
      const data = response.data;
      if (data) {
        const list = Array.isArray(data) ? data : [data];
        setOpportunities(list);
        setTotalOpportunities(list.length);
        setTotalPages(1);
      } else {
        setOpportunities([]);
        setTotalOpportunities(0);
        setTotalPages(0);
      }
    } catch (error) {
      console.error("Get by ID error:", error);
      setOpportunities([]);
      setTotalOpportunities(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  // ================= GET BY STATUS =================

  const fetchByStatus = async (status) => {
    try {
      setLoading(true);
      const response = await apiInterceptor.get(`/opportunities/status/${encodeURIComponent(status)}`);
      const data = response.data;
      const list = Array.isArray(data) ? data : (data?.opportunities || []);
      setOpportunities(list);
      setTotalOpportunities(list.length);
      setTotalPages(Math.ceil(list.length / 10) || (list.length > 0 ? 1 : 0));
    } catch (error) {
      console.error("Status fetch error:", error);
      setOpportunities([]);
      setTotalOpportunities(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  // ================= ACTIVE OPPORTUNITIES =================

  const fetchActiveOpportunities = async () => {
    try {
      setLoading(true);
      setSearchId("");
      setStatusFilter("");
      const response = await apiInterceptor.get("/opportunities/active/list");
      const data = response.data;
      const list = Array.isArray(data) ? data : (data?.opportunities || []);
      setOpportunities(list);
      setTotalOpportunities(list.length);
      setTotalPages(Math.ceil(list.length / 10) || (list.length > 0 ? 1 : 0));
    } catch (error) {
      console.error("Active fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  // ================= OPEN COUNT =================

  const fetchOpenCount = async () => {
    try {
      const response = await apiInterceptor.get("/opportunities/count/open");
      setOpenCount(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  // ================= OPEN AMOUNT =================

  const fetchOpenAmount = async () => {
    try {
      const response = await apiInterceptor.get("/opportunities/amount/open");
      setOpenAmount(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  // ================= DELETE =================

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this opportunity?");
    if (!confirmDelete) return;

    try {
      await apiInterceptor.delete(`/opportunities/${id}`);
      alert("Opportunity deleted successfully");
      fetchAllOpportunities(page);
      fetchOpenCount();
      fetchOpenAmount();
    } catch (error) {
      console.error("Delete failed:", error);
      alert(error?.response?.data?.message || "Failed to delete opportunity");
    }
  };

  // ================= SAVE EDIT =================

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editOpportunity) return;

    setSavingEdit(true);
    try {
      await apiInterceptor.put(`/opportunities/${editOpportunity.id}`, editOpportunity);
      alert("Opportunity updated successfully");
      setEditOpportunity(null);
      fetchAllOpportunities(page);
      fetchOpenCount();
      fetchOpenAmount();
    } catch (error) {
      console.error("Update failed:", error);
      alert(error?.response?.data?.message || "Failed to update opportunity");
    } finally {
      setSavingEdit(false);
    }
  };

  // ================= STATUS COLOR =================

  const getStatusColor =
    (status) => {

      switch (status) {

        case "OPEN":
          return "bg-blue-100 text-blue-400";

        case "WON":
          return "bg-green-100 text-emerald-400";

        case "LOST":
          return "bg-red-100 text-red-400";

        case "IN_PROGRESS":
          return "bg-yellow-100 text-amber-400";

        case "CLOSED":
          return "bg-white/10 text-gray-300";

        default:
          return "bg-white/5 text-white text-gray-300";
      }
    };

  // ================= USE EFFECT =================

  useEffect(() => {

    fetchAllOpportunities();

    fetchOpenCount();

    fetchOpenAmount();

  }, [page]);

  return (

    <div>

      {/* ================= BREADCRUMB ================= */}

      <div className="flex items-center gap-2 text-sm text-[#7A96B2] mb-4 font-medium">

        <span>
          Client Management
        </span>

        <ChevronRight size={14} />

        <span>
          Opportunities
        </span>

        <ChevronRight size={14} />

        <span className="font-semibold text-white">
          Opportunity List
        </span>

      </div>

      {/* ================= HEADER ================= */}

      <div className="flex items-center justify-between mb-6">

        <div className="flex items-center gap-4">

          <button
            onClick={() =>
              navigate(
                "/dashboard/client/opportunities"
              )
            }
            className="w-10 h-10 rounded-xl bg-[#140f2d]/80 border flex items-center justify-center shadow-sm"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center">

            <BriefcaseBusiness
              size={24}
              className="text-[#7C4DFF]"
            />

          </div>

          <div>

            <h2 className="text-2xl font-bold text-white">
              Opportunity List
            </h2>

            <p className="text-[#7A96B2]">
              Manage all opportunities
            </p>

          </div>

        </div>

        {/* ADD */}

        <button
          onClick={() =>
            navigate(
              "/dashboard/client/opportunities/add"
            )
          }
          className="px-5 py-3 rounded-2xl bg-[#7C4DFF] text-white flex items-center gap-2 font-semibold shadow-lg"
        >
          <Plus size={18} />
          New Opportunity
        </button>

      </div>

      {/* ================= CARDS ================= */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">

        {/* TOTAL */}

        <div className="bg-[#140f2d]/80 rounded-3xl p-5 shadow-sm">

          <div className="flex items-center gap-4">

            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center">

              <FileText className="text-[#7C4DFF]" />

            </div>

            <div>

              <p className="text-sm text-gray-400">
                Total Opportunities
              </p>

              <h2 className="text-3xl font-bold text-white">
                {totalOpportunities}
              </h2>

            </div>

          </div>

        </div>

        {/* OPEN */}

        <div className="bg-[#140f2d]/80 rounded-3xl p-5 shadow-sm">

          <div className="flex items-center gap-4">

            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">

              <CheckCircle2 className="text-emerald-400" />

            </div>

            <div>

              <p className="text-sm text-gray-400">
                Open Opportunities
              </p>

              <h2 className="text-3xl font-bold text-white">
                {openCount}
              </h2>

            </div>

          </div>

        </div>

        {/* OPEN AMOUNT */}

        <div className="bg-[#140f2d]/80 rounded-3xl p-5 shadow-sm">

          <div className="flex items-center gap-4">

            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">

              <TrendingUp className="text-blue-400" />

            </div>

            <div>

              <p className="text-sm text-gray-400">
                Open Opportunity Amount
              </p>

              <h2 className="text-3xl font-bold text-white">
                ₹ {openAmount}
              </h2>

            </div>

          </div>

        </div>

      </div>

      {/* ================= FILTERS ================= */}

      <div className="bg-[#140f2d]/80 rounded-3xl p-4 shadow-sm mb-6 flex flex-wrap gap-4 items-center">

        {/* SEARCH BY ID */}
        <div className="flex items-center bg-purple-500/10 rounded-2xl px-3 py-2 w-[340px]">
          <Search size={18} className="text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Search by ID, Code or Name"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchOpportunityById()}
            className="bg-transparent outline-none px-2 text-sm w-full text-white placeholder-gray-400"
          />
          <button
            onClick={fetchOpportunityById}
            className="px-3 py-1.5 rounded-lg bg-[#7C4DFF] text-white text-sm shrink-0 hover:bg-[#6b3ee3]"
          >
            Search
          </button>
        </div>

        {/* STATUS FILTER */}
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              if (e.target.value === "") {
                fetchAllOpportunities(0);
              } else {
                fetchByStatus(e.target.value);
              }
            }}
            className="px-4 py-3 rounded-2xl bg-purple-500/10 outline-none text-white text-sm"
          >
            <option value="" className="bg-[#140f2d] text-white">
              All Status
            </option>
            <option value="OPEN" className="bg-[#140f2d] text-white">
              OPEN
            </option>
            <option value="WON" className="bg-[#140f2d] text-white">
              WON
            </option>
            <option value="LOST" className="bg-[#140f2d] text-white">
              LOST
            </option>
            <option value="IN_PROGRESS" className="bg-[#140f2d] text-white">
              IN_PROGRESS
            </option>
            <option value="CLOSED" className="bg-[#140f2d] text-white">
              CLOSED
            </option>
          </select>
        </div>

        {/* ACTIVE */}
        <button
          onClick={fetchActiveOpportunities}
          className="px-5 py-3 rounded-2xl bg-green-100 text-emerald-600 font-semibold text-sm hover:opacity-90"
        >
          Active Opportunities
        </button>

        {/* RESET */}
        <button
          onClick={() => {
            setSearchId("");
            setStatusFilter("");
            setPage(0);
            fetchAllOpportunities(0);
            fetchOpenCount();
            fetchOpenAmount();
          }}
          className="px-5 py-3 rounded-2xl bg-white/5 text-gray-300 font-semibold text-sm flex items-center gap-2 hover:bg-white/10"
        >
          <RotateCcw size={16} />
          Reset
        </button>
      </div>

      {/* ================= TABLE ================= */}
      <div className="bg-[#140f2d]/80 rounded-3xl shadow-sm overflow-hidden border border-white/5">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[rgba(246,248,252,0.12)]">
              <tr>
                <th className="px-6 py-5 text-left text-sm font-semibold text-gray-400">ID</th>
                <th className="px-6 py-5 text-left text-sm font-semibold text-gray-400">Opportunity</th>
                <th className="px-6 py-5 text-left text-sm font-semibold text-gray-400">Client</th>
                <th className="px-6 py-5 text-left text-sm font-semibold text-gray-400">Lead ID</th>
                <th className="px-6 py-5 text-left text-sm font-semibold text-gray-400">Amount</th>
                <th className="px-6 py-5 text-left text-sm font-semibold text-gray-400">Status</th>
                <th className="px-6 py-5 text-left text-sm font-semibold text-gray-400">Actions</th>
              </tr>
            </thead>

            <tbody>
              {!loading && opportunities.length > 0 ? (
                opportunities.map((item) => (
                  <tr key={item.id} className="border-t border-white/5 hover:bg-[rgba(250,251,253,0.06)]">
                    <td className="px-6 py-5 text-gray-300 text-sm">{item.id}</td>
                    <td className="px-6 py-5 font-semibold text-white">
                      <div>{item.opportunityName}</div>
                      {item.opportunityId && (
                        <div className="text-xs text-purple-300 font-normal">{item.opportunityId}</div>
                      )}
                    </td>
                    <td className="px-6 py-5 text-gray-300 text-sm">{item.clientId || "-"}</td>
                    <td className="px-6 py-5 text-gray-300 text-sm">{item.leadId || "-"}</td>
                    <td className="px-6 py-5 font-semibold text-white text-sm">
                      ₹ {item.amount != null ? Number(item.amount).toLocaleString() : "0"}
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-4 py-1.5 rounded-full text-xs font-semibold ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex gap-2">
                        {/* VIEW */}
                        <button
                          onClick={() => setViewOpportunity(item)}
                          className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center hover:opacity-85 shadow-sm"
                          title="View Details"
                        >
                          <Eye size={15} />
                        </button>
                        {/* EDIT */}
                        <button
                          onClick={() => setEditOpportunity({ ...item })}
                          className="w-9 h-9 rounded-xl bg-yellow-100 text-amber-600 flex items-center justify-center hover:opacity-85 shadow-sm"
                          title="Edit Opportunity"
                        >
                          <Pencil size={15} />
                        </button>
                        {/* DELETE */}
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="w-9 h-9 rounded-xl bg-red-100 text-red-600 flex items-center justify-center hover:opacity-85 shadow-sm"
                          title="Delete Opportunity"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-16 text-gray-400">
                    {loading ? "Loading opportunities..." : "No opportunities found"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ================= PAGINATION ================= */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/10">
          <p className="text-sm text-gray-400">
            Showing {opportunities.length} of {totalOpportunities} opportunities
          </p>
          <div className="flex gap-3">
            <button
              disabled={page === 0 || loading}
              onClick={() => {
                const prevPage = page - 1;
                setPage(prevPage);
                fetchAllOpportunities(prevPage);
              }}
              className="px-4 py-2 rounded-xl bg-white/5 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/10 text-sm"
            >
              Previous
            </button>
            <button
              disabled={totalPages <= 1 || page + 1 >= totalPages || loading}
              onClick={() => {
                const nextPage = page + 1;
                setPage(nextPage);
                fetchAllOpportunities(nextPage);
              }}
              className="px-4 py-2 rounded-xl bg-[#7C4DFF] text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#6b3ee3] text-sm"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* ================= VIEW MODAL ================= */}
      {viewOpportunity && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#140f2d] border border-white/15 rounded-3xl w-full max-w-xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-[#7C4DFF]">
                  <BriefcaseBusiness size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{viewOpportunity.opportunityName}</h3>
                  <span className="text-xs text-purple-300">{viewOpportunity.opportunityId || `ID: ${viewOpportunity.id}`}</span>
                </div>
              </div>
              <button
                onClick={() => setViewOpportunity(null)}
                className="w-8 h-8 rounded-full bg-white/5 text-gray-400 hover:text-white flex items-center justify-center"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
              <div className="bg-white/5 p-3 rounded-2xl">
                <span className="text-gray-400 text-xs block">Status</span>
                <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(viewOpportunity.status)}`}>
                  {viewOpportunity.status}
                </span>
              </div>
              <div className="bg-white/5 p-3 rounded-2xl">
                <span className="text-gray-400 text-xs block">Amount</span>
                <span className="text-white font-bold text-base mt-1 block">
                  ₹ {viewOpportunity.amount != null ? Number(viewOpportunity.amount).toLocaleString() : "0"}
                </span>
              </div>
              <div className="bg-white/5 p-3 rounded-2xl">
                <span className="text-gray-400 text-xs block">Client</span>
                <span className="text-white font-medium mt-1 block">{viewOpportunity.clientId || "N/A"}</span>
              </div>
              <div className="bg-white/5 p-3 rounded-2xl">
                <span className="text-gray-400 text-xs block">Lead ID</span>
                <span className="text-white font-medium mt-1 block">{viewOpportunity.leadId || "N/A"}</span>
              </div>
              <div className="bg-white/5 p-3 rounded-2xl">
                <span className="text-gray-400 text-xs block">Stage</span>
                <span className="text-white font-medium mt-1 block">{viewOpportunity.stage || "N/A"}</span>
              </div>
              <div className="bg-white/5 p-3 rounded-2xl">
                <span className="text-gray-400 text-xs block">Probability</span>
                <span className="text-white font-medium mt-1 block">
                  {viewOpportunity.probability != null ? `${viewOpportunity.probability}%` : "N/A"}
                </span>
              </div>
              <div className="bg-white/5 p-3 rounded-2xl">
                <span className="text-gray-400 text-xs block">Expected Close Date</span>
                <span className="text-white font-medium mt-1 block">
                  {viewOpportunity.expectedCloseDate ? new Date(viewOpportunity.expectedCloseDate).toLocaleDateString() : "N/A"}
                </span>
              </div>
              <div className="bg-white/5 p-3 rounded-2xl">
                <span className="text-gray-400 text-xs block">Actual Close Date</span>
                <span className="text-white font-medium mt-1 block">
                  {viewOpportunity.actualCloseDate ? new Date(viewOpportunity.actualCloseDate).toLocaleDateString() : "N/A"}
                </span>
              </div>
              <div className="bg-white/5 p-3 rounded-2xl col-span-2">
                <span className="text-gray-400 text-xs block">Assigned To</span>
                <span className="text-white font-medium mt-1 block">{viewOpportunity.assignedTo || "Unassigned"}</span>
              </div>
              {viewOpportunity.description && (
                <div className="bg-white/5 p-3 rounded-2xl col-span-2">
                  <span className="text-gray-400 text-xs block">Description</span>
                  <p className="text-white/90 text-sm mt-1 whitespace-pre-line">{viewOpportunity.description}</p>
                </div>
              )}
              {viewOpportunity.notes && (
                <div className="bg-white/5 p-3 rounded-2xl col-span-2">
                  <span className="text-gray-400 text-xs block">Notes</span>
                  <p className="text-white/90 text-sm mt-1 whitespace-pre-line">{viewOpportunity.notes}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setViewOpportunity(null)}
                className="px-5 py-2.5 rounded-xl bg-white/10 text-white hover:bg-white/15 text-sm font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= EDIT MODAL ================= */}
      {editOpportunity && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#140f2d] border border-white/15 rounded-3xl w-full max-w-xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center text-amber-400">
                  <Pencil size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Edit Opportunity</h3>
                  <span className="text-xs text-purple-300">ID: {editOpportunity.id}</span>
                </div>
              </div>
              <button
                onClick={() => setEditOpportunity(null)}
                className="w-8 h-8 rounded-full bg-white/5 text-gray-400 hover:text-white flex items-center justify-center"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-purple-300 mb-1">Opportunity Name *</label>
                <input
                  type="text"
                  required
                  value={editOpportunity.opportunityName || ""}
                  onChange={(e) => setEditOpportunity({ ...editOpportunity, opportunityName: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-purple-300 mb-1">Status</label>
                  <select
                    value={editOpportunity.status || "OPEN"}
                    onChange={(e) => setEditOpportunity({ ...editOpportunity, status: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white text-sm"
                  >
                    <option value="OPEN" className="bg-[#140f2d] text-white">OPEN</option>
                    <option value="IN_PROGRESS" className="bg-[#140f2d] text-white">IN_PROGRESS</option>
                    <option value="WON" className="bg-[#140f2d] text-white">WON</option>
                    <option value="LOST" className="bg-[#140f2d] text-white">LOST</option>
                    <option value="CLOSED" className="bg-[#140f2d] text-white">CLOSED</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-purple-300 mb-1">Stage</label>
                  <input
                    type="text"
                    value={editOpportunity.stage || ""}
                    onChange={(e) => setEditOpportunity({ ...editOpportunity, stage: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-purple-300 mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    value={editOpportunity.amount ?? ""}
                    onChange={(e) => setEditOpportunity({ ...editOpportunity, amount: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-purple-300 mb-1">Probability (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editOpportunity.probability ?? ""}
                    onChange={(e) => setEditOpportunity({ ...editOpportunity, probability: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-purple-300 mb-1">Expected Close Date</label>
                  <input
                    type="date"
                    value={editOpportunity.expectedCloseDate ? editOpportunity.expectedCloseDate.substring(0, 10) : ""}
                    onChange={(e) => setEditOpportunity({ ...editOpportunity, expectedCloseDate: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-purple-300 mb-1">Assigned To</label>
                  <input
                    type="text"
                    value={editOpportunity.assignedTo || ""}
                    onChange={(e) => setEditOpportunity({ ...editOpportunity, assignedTo: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-purple-300 mb-1">Description</label>
                <textarea
                  rows="3"
                  value={editOpportunity.description || ""}
                  onChange={(e) => setEditOpportunity({ ...editOpportunity, description: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditOpportunity(null)}
                  className="px-5 py-2.5 rounded-xl bg-white/10 text-white hover:bg-white/15 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-6 py-2.5 rounded-xl bg-[#7C4DFF] text-white hover:bg-[#6b3ee3] text-sm font-semibold disabled:opacity-50"
                >
                  {savingEdit ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default OpportunityList;

