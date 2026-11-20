// src/pages/client/QuotationManagement.jsx

import React, {
  useEffect,
  useState,
} from "react";

import apiInterceptor from "../../interceptors/interceptors";

import {
  ArrowLeft,
  ChevronRight,
  FileText,
  Plus,
  Search,
  Eye,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

const QuotationManagement = () => {

  const navigate = useNavigate();

  // ================= STATES =================

  const [quotations,
    setQuotations] =
    useState([]);

  const [filteredQuotations,
    setFilteredQuotations] =
    useState([]);

  const [loading,
    setLoading] =
    useState(false);

  const [search,
    setSearch] =
    useState("");

  const [statusFilter,
    setStatusFilter] =
    useState("");

  const [clientFilter,
    setClientFilter] =
    useState("");

  // ================= FETCH =================

  const fetchQuotations =
    async () => {

      try {

        setLoading(true);

        const response = await apiInterceptor.get("/quotation");
        
        const fetchedData = (response.data || []).map(item => ({
          id: item.id,
          quoteNo: item.quotationNumber,
          client: item.clientId || "N/A",
          items: item.items?.length || 0,
          subtotal: item.subtotal,
          gst: item.taxAmount,
          total: item.grandTotal,
          discount: item.totalDiscount,
          validTill: item.validity,
          preparedBy: "System",
          status: item.status || "Draft",
        }));

        setQuotations(fetchedData);
        setFilteredQuotations(fetchedData);

      } catch (error) {

        console.error(error);

      } finally {

        setLoading(false);
      }
    };

  // ================= LOAD =================

  useEffect(() => {

    fetchQuotations();

  }, []);

  // ================= FILTER =================

  useEffect(() => {

    let filtered =
      quotations;

    // SEARCH

    if (search) {

      filtered =
        filtered.filter(
          (item) =>
            item.quoteNo
              .toLowerCase()
              .includes(
                search.toLowerCase()
              ) ||
            item.client
              .toLowerCase()
              .includes(
                search.toLowerCase()
              )
        );
    }

    // STATUS

    if (statusFilter) {

      filtered =
        filtered.filter(
          (item) =>
            item.status ===
            statusFilter
        );
    }

    // CLIENT

    if (clientFilter) {

      filtered =
        filtered.filter(
          (item) =>
            item.client ===
            clientFilter
        );
    }

    setFilteredQuotations(
      filtered
    );

  }, [
    search,
    statusFilter,
    clientFilter,
    quotations,
  ]);

  // ================= STATUS STYLE =================

  const getStatusStyle =
    (status) => {

      switch (status) {

        case "Accepted":

          return "bg-green-100 text-emerald-400";

        case "Pending":

          return "bg-yellow-100 text-amber-400";

        case "Sent":

          return "bg-blue-100 text-blue-400";

        case "Expired":

          return "bg-red-100 text-red-400";

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

        <span className="font-medium text-white">
          Quotation Management
        </span>

      </div>

      {/* ================= HEADER ================= */}

      <div className="flex items-center justify-between mb-6">

        {/* LEFT */}

        <div className="flex items-center gap-4">

          {/* BACK */}

          <button
            onClick={() =>
              navigate(
                "/dashboard/client/opportunities"
              )
            }
            className="w-10 h-10 rounded-xl bg-[#140f2d]/80 border border-white/10 flex items-center justify-center shadow-sm text-purple-300"
          >

            <ArrowLeft size={16} />

          </button>

          {/* ICON */}

          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center shadow-sm">

            <FileText
              size={22}
              className="text-blue-300"
            />

          </div>

          {/* TITLE */}

          <div>

            <h2 className="text-xl font-bold text-white">
              Quotation Management
            </h2>

            <p className="text-sm text-gray-400">
              Manage client quotations
            </p>

          </div>

        </div>

        {/* BUTTON */}

        {/* BUTTON */}

            <button
            onClick={() =>
                navigate(
                "/dashboard/client/quotations/add"
                )
            }
            className="flex items-center gap-2 px-5 py-3 rounded-xl text-white text-sm font-semibold shadow-md"
            style={{
                background:
                "linear-gradient(135deg,#2563EB,#3B82F6)",
            }}
            >

            <Plus size={18} />

            New Quotation

            </button>

      </div>

      {/* ================= TABLE CARD ================= */}

      <div className="bg-[#140f2d]/80 rounded-3xl shadow-sm overflow-hidden">

        {/* TOP BAR */}

        <div className="p-5 border-b border-white/10 flex flex-wrap items-center gap-4">

          {/* SEARCH */}

          <div className="flex items-center bg-purple-500/10 rounded-2xl px-4 py-3 flex-1 min-w-[260px]">

            <Search
              size={18}
              className="text-gray-400"
            />

            <input
              type="text"
              placeholder="Search quotations..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              className="bg-transparent outline-none px-3 w-full"
            />

          </div>

          {/* STATUS */}

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(
                e.target.value
              )
            }
            className="px-4 py-3 rounded-2xl bg-purple-500/10 outline-none text-sm"
          >

            <option value="" className="bg-[#140f2d] text-white">
              All Status
            </option>

            <option className="bg-[#140f2d] text-white">
              Accepted
            </option>

            <option className="bg-[#140f2d] text-white">
              Pending
            </option>

            <option className="bg-[#140f2d] text-white">
              Sent
            </option>

            <option className="bg-[#140f2d] text-white">
              Expired
            </option>

          </select>

          {/* CLIENT */}

          <select
            value={clientFilter}
            onChange={(e) =>
              setClientFilter(
                e.target.value
              )
            }
            className="px-4 py-3 rounded-2xl bg-purple-500/10 outline-none text-sm"
          >

            <option value="" className="bg-[#140f2d] text-white">
              All Clients
            </option>

            <option className="bg-[#140f2d] text-white">
              Aminoid Ai
            </option>

            <option className="bg-[#140f2d] text-white">
              TechWave
            </option>

            <option className="bg-[#140f2d] text-white">
              Innova
            </option>

            <option className="bg-[#140f2d] text-white">
              Globex
            </option>

          </select>

        </div>

        {/* TABLE */}

        <div className="overflow-x-auto">

          <table className="w-full">

            {/* HEAD */}

            <thead className="bg-white/5 text-white">

              <tr>

                <th className="text-left px-6 py-4 text-xs font-semibold text-purple-300 uppercase">
                  Quote #
                </th>

                <th className="text-left px-6 py-4 text-xs font-semibold text-purple-300 uppercase">
                  Client
                </th>

                <th className="text-left px-6 py-4 text-xs font-semibold text-purple-300 uppercase">
                  Items
                </th>

                <th className="text-left px-6 py-4 text-xs font-semibold text-purple-300 uppercase">
                  Subtotal
                </th>

                <th className="text-left px-6 py-4 text-xs font-semibold text-purple-300 uppercase">
                  GST
                </th>

                <th className="text-left px-6 py-4 text-xs font-semibold text-purple-300 uppercase">
                  Total
                </th>

                <th className="text-left px-6 py-4 text-xs font-semibold text-purple-300 uppercase">
                  Discount
                </th>

                <th className="text-left px-6 py-4 text-xs font-semibold text-purple-300 uppercase">
                  Valid Till
                </th>

                <th className="text-left px-6 py-4 text-xs font-semibold text-purple-300 uppercase">
                  Prepared By
                </th>

                <th className="text-left px-6 py-4 text-xs font-semibold text-purple-300 uppercase">
                  Status
                </th>

                <th className="text-center px-6 py-4 text-xs font-semibold text-purple-300 uppercase">
                  Action
                </th>

              </tr>

            </thead>

            {/* BODY */}

            <tbody>

              {!loading &&
              filteredQuotations.length >
                0 ? (

                filteredQuotations.map(
                  (item) => (

                    <tr
                      key={item.id}
                      className="border-t border-white/10 hover:bg-[rgba(250,252,255,0.12)]"
                    >

                      {/* QUOTE */}

                      <td className="px-6 py-5 text-sm font-bold text-white">

                        {item.quoteNo}

                      </td>

                      {/* CLIENT */}

                      <td className="px-6 py-5 text-sm font-medium text-white">

                        {item.client}

                      </td>

                      {/* ITEMS */}

                      <td className="px-6 py-5 text-sm font-medium text-white">

                        {item.items}

                      </td>

                      {/* SUBTOTAL */}

                      <td className="px-6 py-5 text-sm font-semibold text-white">

                        ₹{item.subtotal}

                      </td>

                      {/* GST */}

                      <td className="px-6 py-5 text-sm font-semibold text-white">

                        ₹{item.gst}

                      </td>

                      {/* TOTAL */}

                      <td className="px-6 py-5 text-sm font-bold text-blue-300">

                        ₹{item.total}

                      </td>

                      {/* DISCOUNT */}

                      <td className="px-6 py-5">

                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-emerald-400">

                          {item.discount}

                        </span>

                      </td>

                      {/* VALID */}

                      <td className="px-6 py-5 text-sm font-medium text-white">

                        {item.validTill}

                      </td>

                      {/* PREPARED */}

                      <td className="px-6 py-5 text-sm font-medium text-white">

                        {item.preparedBy}

                      </td>

                      {/* STATUS */}

                      <td className="px-6 py-5">

                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle(
                            item.status
                          )}`}
                        >

                          {item.status}

                        </span>

                      </td>

                      {/* ACTION */}

                      <td className="px-6 py-5">

                        <div className="flex items-center justify-center gap-2">

                          <button className="px-3 py-1.5 rounded-xl bg-blue-500/10 text-blue-300 text-xs font-semibold flex items-center gap-1">

                            <Eye size={13} />

                            View

                          </button>

                        </div>

                      </td>

                    </tr>
                  )
                )

              ) : (

                <tr>

                  <td
                    colSpan="11"
                    className="text-center py-16 text-gray-400"
                  >

                    {loading
                      ? "Loading quotations..."
                      : "No quotations found"}

                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
};

export default QuotationManagement;

