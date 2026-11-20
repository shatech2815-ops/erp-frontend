// src/pages/client/WarrantyManagement.jsx

import React, {
  useState,
  useEffect,
} from "react";
import apiInterceptor from "../../interceptors/interceptors";

import {
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  Plus,
  X,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

const WarrantyManagement = () => {

  const navigate = useNavigate();

  // ================= MODAL =================

  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewWarranty, setViewWarranty] = useState(null);

  // ================= DATA =================

  const [warranties, setWarranties] = useState([]);
  const [clients, setClients] = useState([]);
  const [newWarranty, setNewWarranty] = useState({
    warrantyId: "",
    clientName: "",
    product: "",
    type: "Comprehensive",
    duration: "3 Months",
    startDate: "",
    maxClaims: 5,
    terms: ""
  });

  const fetchWarranties = async () => {
    try {
      const response = await apiInterceptor.get("/warranties");
      setWarranties(response.data || []);
    } catch (error) {
      console.error("Error fetching warranties:", error);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await apiInterceptor.get("/clients");
      const list = response.data || [];
      setClients(list);
      if (list.length > 0 && !newWarranty.clientName) {
        setNewWarranty((prev) => ({ ...prev, clientName: list[0].name }));
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  };

  useEffect(() => {
    fetchWarranties();
    fetchClients();
  }, []);

  const handleChange = (e) => {
    setNewWarranty({ ...newWarranty, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    // Validation
    const errors = [];
    if (!newWarranty.clientName || !newWarranty.clientName.trim()) {
      errors.push("Client is required");
    }
    if (!newWarranty.product || !newWarranty.product.trim()) {
      errors.push("Product / Service is required");
    }
    if (!newWarranty.startDate) {
      errors.push("Start Date is required");
    }
    if (!newWarranty.maxClaims || Number(newWarranty.maxClaims) < 1) {
      errors.push("Max Claims must be at least 1");
    }

    if (errors.length > 0) {
      alert("Please fill in mandatory details:\n- " + errors.join("\n- "));
      return;
    }

    try {
      // Calculate expiry date from start date and duration
      let expiryDate = "";
      if (newWarranty.startDate) {
        const d = new Date(newWarranty.startDate);
        let m = 3;
        if (newWarranty.duration === "6 Months") m = 6;
        else if (newWarranty.duration === "1 Year") m = 12;
        else if (newWarranty.duration === "2 Years") m = 24;
        d.setMonth(d.getMonth() + m);
        expiryDate = d.toISOString().split("T")[0];
      }

      const payload = {
        ...newWarranty,
        warrantyId: newWarranty.warrantyId.trim() || `WAR-${Date.now().toString().slice(-6)}`,
        expiryDate,
        status: "Active"
      };

      await apiInterceptor.post("/warranties", payload);
      setShowModal(false);
      fetchWarranties();
      setNewWarranty({
        warrantyId: "",
        clientName: clients.length > 0 ? clients[0].name : "Aminoid Ai",
        product: "",
        type: "Comprehensive",
        duration: "3 Months",
        startDate: "",
        maxClaims: 5,
        terms: ""
      });
      alert("Warranty Registered Successfully");
    } catch (error) {
      console.error("Error registering warranty:", error);
      alert(error.response?.data?.message || "Failed to register warranty");
    }
  };

  // ================= STATUS STYLE =================

  const getStatusStyle = (status) => {
    switch (status) {
      case "Active":
        return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
      case "Expiring":
        return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
      case "Expired":
        return "bg-red-500/10 text-red-400 border border-red-500/20";
      default:
        return "bg-white/5 text-gray-300 border border-white/10";
    }
  };

  const activeCount = warranties.filter(w => w.status === "Active").length;
  const expiringCount = warranties.filter(w => w.status === "Expiring").length;
  const expiredCount = warranties.filter(w => w.status === "Expired").length;
  const totalClaims = warranties.reduce((acc, w) => acc + (Number(w.currentClaims) || 0), 0);

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
          Warranty
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

          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center shadow-sm">

            <ShieldCheck
              size={22}
              className="text-[#16A34A]"
            />

          </div>

          {/* TITLE */}

          <div>

            <h2 className="text-xl font-bold text-white">
              Warranty Management
            </h2>

            <p className="text-sm text-gray-400">
              Track warranty registrations & claims
            </p>

          </div>

        </div>

        {/* REGISTER */}

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

          Register

        </button>

      </div>

      {/* ================= STATS ================= */}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6">

        {/* ACTIVE */}
        <div className="bg-[#140f2d]/80 rounded-3xl shadow-sm p-5 border-t-4 border-emerald-500">
          <p className="text-xs font-semibold text-gray-400 uppercase">
            Active
          </p>
          <h2 className="text-3xl font-bold text-emerald-400 mt-2">
            {warranties.length > 0 ? activeCount : 142}
          </h2>
        </div>

        {/* EXPIRING */}
        <div className="bg-[#140f2d]/80 rounded-3xl shadow-sm p-5 border-t-4 border-amber-500">
          <p className="text-xs font-semibold text-gray-400 uppercase">
            Expiring (&lt;90D)
          </p>
          <h2 className="text-3xl font-bold text-amber-400 mt-2">
            {warranties.length > 0 ? expiringCount : 28}
          </h2>
        </div>

        {/* EXPIRED */}
        <div className="bg-[#140f2d]/80 rounded-3xl shadow-sm p-5 border-t-4 border-red-500">
          <p className="text-xs font-semibold text-gray-400 uppercase">
            Expired
          </p>
          <h2 className="text-3xl font-bold text-red-400 mt-2">
            {warranties.length > 0 ? expiredCount : 64}
          </h2>
        </div>

        {/* CLAIMS */}
        <div className="bg-[#140f2d]/80 rounded-3xl shadow-sm p-5 border-t-4 border-blue-500">
          <p className="text-xs font-semibold text-gray-400 uppercase">
            Claims
          </p>
          <h2 className="text-3xl font-bold text-blue-400 mt-2">
            {warranties.length > 0 ? totalClaims : 18}
          </h2>
        </div>

      </div>

      {/* ================= TABLE ================= */}

      <div className="bg-[#140f2d]/80 rounded-3xl shadow-sm overflow-hidden">

        {/* TABLE HEADER */}

        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">

          <h3 className="text-lg font-bold text-white">
            Warranty Register
          </h3>

        </div>

        {/* TABLE */}

        <div className="overflow-x-auto">

          <table className="w-full min-w-[1000px]">

            <thead className="bg-white/5 text-white">

              <tr>

                {[
                  "Warranty ID",
                  "Client",
                  "Product",
                  "Type",
                  "Start Date",
                  "Expiry",
                  "Remaining",
                  "Claims",
                  "Status",
                  "Action",
                ].map((head) => (

                  <th
                    key={head}
                    className="text-left px-6 py-4 text-xs font-semibold text-purple-300 uppercase whitespace-nowrap"
                  >

                    {head}

                  </th>

                ))}

              </tr>

            </thead>

            <tbody>

              {warranties.map(
                (item, index) => (

                  <tr
                    key={index}
                    className="border-t border-white/10 hover:bg-[rgba(250,252,255,0.12)]"
                  >

                    <td className="px-6 py-5 text-sm font-bold text-white whitespace-nowrap">
                      {item.warrantyId}
                    </td>

                    <td className="px-6 py-5 text-sm font-medium text-white whitespace-nowrap">
                      {item.clientName}
                    </td>

                    <td className="px-6 py-5 text-sm text-white whitespace-nowrap">
                      {item.product}
                    </td>

                    <td className="px-6 py-5 text-sm text-white whitespace-nowrap">
                      {item.type}
                    </td>

                    <td className="px-6 py-5 text-sm text-white whitespace-nowrap">
                      {item.startDate}
                    </td>

                    <td className="px-6 py-5 text-sm text-white whitespace-nowrap">
                      {item.expiryDate || "-"}
                    </td>

                    <td className="px-6 py-5 whitespace-nowrap">

                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                          item.status === "Expired"
                            ? "bg-red-500/10 text-red-400 border border-red-500/20"
                            : item.status === "Expiring"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        }`}
                      >

                        {item.duration || "-"}

                      </span>

                    </td>

                    <td className="px-6 py-5 text-sm font-semibold text-white whitespace-nowrap">
                      {item.currentClaims || 0}/{item.maxClaims}
                    </td>

                    <td className="px-6 py-5 whitespace-nowrap">

                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getStatusStyle(
                          item.status
                        )}`}
                      >

                        {item.status}

                      </span>

                    </td>

                    <td className="px-6 py-5 whitespace-nowrap">

                      <div className="flex items-center gap-2">

                        <button
                          onClick={() => {
                            setViewWarranty(item);
                            setShowViewModal(true);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 text-xs font-semibold transition-colors"
                        >

                          View

                        </button>

                        <button className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold transition-colors">

                          Claim

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

      {/* ================= REGISTER MODAL ================= */}

      {showModal && (

        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">

          <div className="bg-[#140f2d] border border-white/10 rounded-3xl shadow-2xl w-full max-w-3xl p-6 sm:p-8 relative my-auto max-h-[85vh] overflow-y-auto flex flex-col">

            {/* CLOSE */}

            <button
              onClick={() =>
                setShowModal(false)
              }
              className="absolute top-5 right-5 text-gray-400 hover:text-red-400 transition-colors"
            >

              <X size={20} />

            </button>

            {/* TITLE */}

            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <ShieldCheck className="text-emerald-400" size={22} />
              Register Warranty
            </h2>

            {/* FORM */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* WARRANTY ID */}
              <div>
                <label className="block text-sm font-semibold text-purple-300 mb-2">
                  Warranty ID <span className="text-xs text-gray-400 font-normal">(Auto-generated if blank)</span>
                </label>
                <input
                  type="text"
                  name="warrantyId"
                  value={newWarranty.warrantyId}
                  onChange={handleChange}
                  placeholder="WAR-XXXXXX"
                  className="w-full px-4 py-3 rounded-2xl bg-purple-500/10 border border-white/10 outline-none text-white focus:border-purple-400 transition-colors"
                />
              </div>

              {/* CLIENT */}

              <div>

                <label className="block text-sm font-semibold text-purple-300 mb-2">

                  Client *

                </label>

                <select
                  name="clientName"
                  value={newWarranty.clientName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-2xl bg-purple-500/10 border border-white/10 outline-none text-white focus:border-purple-400 transition-colors"
                >
                  <option value="" className="bg-[#140f2d] text-white">Select Client</option>
                  {clients.length > 0 ? (
                    clients.map((c) => (
                      <option key={c.id} value={c.name} className="bg-[#140f2d] text-white">
                        {c.name}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="Aminoid Ai" className="bg-[#140f2d] text-white">Aminoid Ai</option>
                      <option value="Globex" className="bg-[#140f2d] text-white">Globex</option>
                      <option value="TechWave" className="bg-[#140f2d] text-white">TechWave</option>
                    </>
                  )}
                </select>

              </div>

              {/* PRODUCT */}

              <div>

                <label className="block text-sm font-semibold text-purple-300 mb-2">

                  Product / Service *

                </label>

                <input
                  type="text"
                  name="product"
                  value={newWarranty.product}
                  onChange={handleChange}
                  placeholder="e.g. Enterprise Server X1"
                  className="w-full px-4 py-3 rounded-2xl bg-purple-500/10 border border-white/10 outline-none text-white focus:border-purple-400 transition-colors"
                  required
                />

              </div>

              {/* TYPE */}

              <div>

                <label className="block text-sm font-semibold text-purple-300 mb-2">

                  Warranty Type

                </label>

                <select
                  name="type"
                  value={newWarranty.type}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-2xl bg-purple-500/10 border border-white/10 outline-none text-white focus:border-purple-400 transition-colors"
                >

                  <option value="Comprehensive" className="bg-[#140f2d] text-white">
                    Comprehensive
                  </option>
                  <option value="Standard" className="bg-[#140f2d] text-white">
                    Standard
                  </option>
                  <option value="Hardware" className="bg-[#140f2d] text-white">
                    Hardware
                  </option>

                </select>

              </div>

              {/* DURATION */}

              <div>

                <label className="block text-sm font-semibold text-purple-300 mb-2">

                  Duration

                </label>

                <select
                  name="duration"
                  value={newWarranty.duration}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-2xl bg-purple-500/10 border border-white/10 outline-none text-white focus:border-purple-400 transition-colors"
                >

                  <option value="3 Months" className="bg-[#140f2d] text-white">
                    3 Months
                  </option>
                  <option value="6 Months" className="bg-[#140f2d] text-white">
                    6 Months
                  </option>
                  <option value="1 Year" className="bg-[#140f2d] text-white">
                    1 Year
                  </option>
                  <option value="2 Years" className="bg-[#140f2d] text-white">
                    2 Years
                  </option>

                </select>

              </div>

              {/* DATE */}

              <div>

                <label className="block text-sm font-semibold text-purple-300 mb-2">

                  Start Date *

                </label>

                <input
                  type="date"
                  name="startDate"
                  value={newWarranty.startDate}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-2xl bg-purple-500/10 border border-white/10 outline-none text-white focus:border-purple-400 transition-colors"
                  required
                />

              </div>

              {/* CLAIMS */}

              <div>

                <label className="block text-sm font-semibold text-purple-300 mb-2">

                  Max Claims *

                </label>

                <input
                  type="number"
                  name="maxClaims"
                  min="1"
                  value={newWarranty.maxClaims}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-2xl bg-purple-500/10 border border-white/10 outline-none text-white focus:border-purple-400 transition-colors"
                  required
                />

              </div>

            </div>

            {/* TERMS */}

            <div className="mt-5">

              <label className="block text-sm font-semibold text-purple-300 mb-2">

                Terms & Conditions

              </label>

              <textarea
                rows="3"
                name="terms"
                value={newWarranty.terms}
                onChange={handleChange}
                placeholder="What's covered, exclusions..."
                className="w-full px-4 py-3 rounded-2xl bg-purple-500/10 border border-white/10 outline-none resize-none text-white focus:border-purple-400 transition-colors"
              />

            </div>

            {/* BUTTONS */}

            <div className="flex items-center justify-end gap-3 mt-8 pt-4 border-t border-white/10">

              <button
                type="button"
                onClick={() =>
                  setShowModal(false)
                }
                className="px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white text-sm font-semibold transition-colors"
              >

                Cancel

              </button>

              <button
                type="button"
                onClick={handleRegister}
                className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors shadow-lg shadow-blue-500/20"
              >

                ✓ Register Warranty

              </button>

            </div>

          </div>

        </div>

      )}

      {/* ================= VIEW MODAL ================= */}

      {showViewModal && viewWarranty && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-[#140f2d] border border-white/10 rounded-3xl shadow-2xl w-full max-w-2xl p-6 sm:p-8 relative my-auto max-h-[85vh] overflow-y-auto flex flex-col">
            <button
              onClick={() => setShowViewModal(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-red-400 transition-colors"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <ShieldCheck className="text-emerald-400" size={22} />
              Warranty Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="bg-purple-500/10 p-3.5 rounded-2xl">
                <span className="text-xs text-purple-300 font-semibold block uppercase mb-1">Warranty ID</span>
                <span className="font-bold text-white text-base">{viewWarranty.warrantyId}</span>
              </div>
              <div className="bg-purple-500/10 p-3.5 rounded-2xl">
                <span className="text-xs text-purple-300 font-semibold block uppercase mb-1">Client</span>
                <span className="font-bold text-white text-base">{viewWarranty.clientName}</span>
              </div>
              <div className="bg-purple-500/10 p-3.5 rounded-2xl">
                <span className="text-xs text-purple-300 font-semibold block uppercase mb-1">Product</span>
                <span className="text-white font-medium">{viewWarranty.product}</span>
              </div>
              <div className="bg-purple-500/10 p-3.5 rounded-2xl">
                <span className="text-xs text-purple-300 font-semibold block uppercase mb-1">Type</span>
                <span className="text-white font-medium">{viewWarranty.type}</span>
              </div>
              <div className="bg-purple-500/10 p-3.5 rounded-2xl">
                <span className="text-xs text-purple-300 font-semibold block uppercase mb-1">Duration / Remaining</span>
                <span className="text-white font-medium">{viewWarranty.duration}</span>
              </div>
              <div className="bg-purple-500/10 p-3.5 rounded-2xl">
                <span className="text-xs text-purple-300 font-semibold block uppercase mb-1">Status</span>
                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusStyle(viewWarranty.status)}`}>
                  {viewWarranty.status}
                </span>
              </div>
              <div className="bg-purple-500/10 p-3.5 rounded-2xl">
                <span className="text-xs text-purple-300 font-semibold block uppercase mb-1">Start Date</span>
                <span className="text-white font-medium">{viewWarranty.startDate || "-"}</span>
              </div>
              <div className="bg-purple-500/10 p-3.5 rounded-2xl">
                <span className="text-xs text-purple-300 font-semibold block uppercase mb-1">Expiry Date</span>
                <span className="text-white font-medium">{viewWarranty.expiryDate || "-"}</span>
              </div>
              <div className="bg-purple-500/10 p-3.5 rounded-2xl sm:col-span-2">
                <span className="text-xs text-purple-300 font-semibold block uppercase mb-1">Claims Usage</span>
                <span className="text-white font-medium">{viewWarranty.currentClaims || 0} of {viewWarranty.maxClaims} claims used</span>
              </div>
              {viewWarranty.terms && (
                <div className="bg-purple-500/10 p-3.5 rounded-2xl sm:col-span-2">
                  <span className="text-xs text-purple-300 font-semibold block uppercase mb-1">Terms</span>
                  <p className="text-white/80 text-xs leading-relaxed">{viewWarranty.terms}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end mt-6 pt-4 border-t border-white/10">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-6 py-2.5 bg-white/10 hover:bg-white/20 rounded-2xl text-xs font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>

  );
};

export default WarrantyManagement;

