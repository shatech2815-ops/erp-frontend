// src/pages/client/LeadList.jsx

import React, { useEffect, useState } from "react";
import apiInterceptor from "../../interceptors/interceptors";
import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  ChevronRight,
  Plus,
  Search,
  TrendingUp,
} from "lucide-react";

const API_URL = "/leads";

const LeadList = () => {

  const navigate = useNavigate();

  const [leads, setLeads] = useState([]);
  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] =
    useState("");

  const [sourceFilter, setSourceFilter] =
    useState("");

  const [activeCount, setActiveCount] =
    useState(0);

  // ================= FETCH =================

  useEffect(() => {

    fetchLeads();
    fetchActiveCount();

  }, []);

  // ================= FETCH ALL =================

  const fetchLeads = async () => {

    try {

      const response = await apiInterceptor.get(
        API_URL
      );

      setLeads(
        response.data.leads || []
      );

    } catch (error) {

      console.error(
        "Error fetching leads:",
        error
      );

    }
  };

  // ================= ACTIVE COUNT =================

  const fetchActiveCount = async () => {

    try {

      const response = await apiInterceptor.get(
        `${API_URL}/count/active`
      );

      setActiveCount(response.data);

    } catch (error) {

      console.error(
        "Active count error:",
        error
      );

    }
  };

  // ================= SEARCH =================

  const handleSearch = async (keyword) => {

    setSearch(keyword);

    try {

      if (!keyword.trim()) {

        fetchLeads();
        return;

      }

      const response = await apiInterceptor.get(
        `${API_URL}/search?keyword=${keyword}`
      );

      setLeads(response.data);

    } catch (error) {

      console.error(
        "Search error:",
        error
      );

    }
  };

  // ================= STATUS FILTER =================

  const handleStatusFilter =
    async (status) => {

      setStatusFilter(status);

      try {

        if (!status) {

          fetchLeads();
          return;

        }

        const response =
          await apiInterceptor.get(
            `${API_URL}/status/${status}`
          );

        setLeads(response.data);

      } catch (error) {

        console.error(
          "Status filter error:",
          error
        );

      }
    };

  // ================= SOURCE FILTER =================

  const handleSourceFilter =
    async (source) => {

      setSourceFilter(source);

      try {

        if (!source) {

          fetchLeads();
          return;

        }

        const response =
          await apiInterceptor.get(
            `${API_URL}/source/${source}`
          );

        setLeads(response.data);

      } catch (error) {

        console.error(
          "Source filter error:",
          error
        );

      }
    };

  // ================= STATUS COLOR =================

  const getStatusColor = (
    status
  ) => {

    switch (status) {

      case "NEW":
        return "bg-blue-100 text-blue-400";

      case "CONTACTED":
        return "bg-yellow-100 text-amber-400";

      case "QUALIFIED":
        return "bg-green-100 text-emerald-400";

      case "PROPOSAL":
        return "bg-purple-100 text-purple-400";

      case "CONVERTED":
        return "bg-emerald-100 text-emerald-400";

      case "LOST":
        return "bg-red-100 text-red-400";

      default:
        return "bg-white/5 text-white text-gray-300";
    }
  };

  return (

    <div>

      {/* ================= BREADCRUMB ================= */}

      
            <div className="flex items-center gap-2 text-xs text-purple-300 mb-4 font-medium">
      
              <button
                onClick={() =>
                  navigate(
                    "/dashboard/client"
                  )
                }
              >
                Client Management
              </button>
      
              <ChevronRight size={12} />
      
              <button
                onClick={() =>
                  navigate(
                    "/dashboard/client/leads"
                  )
                }
              >
                Leads
              </button>
      
              <ChevronRight size={12} />
      
              <span className="text-white font-semibold">
                Lead List
              </span>
      
            </div>
      
      {/* ================= HEADER ================= */}

      <div className="flex items-center gap-4 mb-6">

        <button
          onClick={() =>
            navigate(
              "/dashboard/client"
            )
          }
          className="w-10 h-10 rounded-xl bg-[#140f2d]/80 border flex items-center justify-center"
        >

          <ArrowLeft size={16} />

        </button>

        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">

          <TrendingUp
            size={22}
            className="text-[#16A34A]"
          />

        </div>

        <div className="flex-1">

          <h2 className="text-xl font-bold text-white">
            Lead List
          </h2>

          <p className="text-sm text-gray-400">
            Manage all lead records
          </p>

        </div>

        <button
          onClick={() =>
            navigate(
              "/dashboard/client/leads/add"
            )
          }
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold bg-blue-500"
        >

          <Plus size={16} />

          Add Lead

        </button>

      </div>

      {/* ================= STATS ================= */}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">

        {/* TOTAL */}

        <div className="bg-[#140f2d]/80 rounded-2xl p-5 shadow-sm border-t-4 border-[#3B82F6]">

          <p className="text-xs font-semibold text-gray-400 uppercase">
            Total Leads
          </p>

          <h3 className="text-3xl font-bold text-blue-300 mt-2">
            {leads.length}
          </h3>

          <p className="text-xs text-green-500 mt-1">
            ↑ 18%
          </p>

        </div>

        {/* HOT */}

        <div className="bg-[#140f2d]/80 rounded-2xl p-5 shadow-sm border-t-4 border-[#EF4444]">

          <p className="text-xs font-semibold text-gray-400 uppercase">
            Hot Leads
          </p>

          <h3 className="text-3xl font-bold text-[#EF4444] mt-2">
            48
          </h3>

          <p className="text-xs text-red-400 mt-1">
            needs action
          </p>

        </div>

        {/* QUALIFIED */}

        <div className="bg-[#140f2d]/80 rounded-2xl p-5 shadow-sm border-t-4 border-[#10B981]">

          <p className="text-xs font-semibold text-gray-400 uppercase">
            Qualified
          </p>

          <h3 className="text-3xl font-bold text-[#10B981] mt-2">
            {activeCount}
          </h3>

          <p className="text-xs text-green-500 mt-1">
            ↑ 9%
          </p>

        </div>

        {/* AVG */}

        <div className="bg-[#140f2d]/80 rounded-2xl p-5 shadow-sm border-t-4 border-[#F59E0B]">

          <p className="text-xs font-semibold text-gray-400 uppercase">
            Avg Score
          </p>

          <h3 className="text-3xl font-bold text-[#F59E0B] mt-2">
            82.4
          </h3>

          <p className="text-xs text-green-500 mt-1">
            ↑ 4.1
          </p>

        </div>

      </div>

      {/* ================= FILTERS ================= */}

      <div className="bg-[#140f2d]/80 rounded-3xl p-5 shadow-sm mb-5">

        <div className="flex flex-wrap items-center gap-3">

          {/* SEARCH */}

          <div className="relative flex-1 min-w-[250px]">

            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              placeholder="Search leads..."
              value={search}
              onChange={(e) =>
                handleSearch(
                  e.target.value
                )
              }
              className="w-full h-11 rounded-xl border border-white/10 pl-11 pr-4 outline-none bg-white/5 text-white"
            />

          </div>

          {/* STATUS */}

          <select
            value={statusFilter}
            onChange={(e) =>
              handleStatusFilter(
                e.target.value
              )
            }
            className="h-11 rounded-xl border border-white/10 px-4 bg-white/5 text-white"
          >

            <option value="" className="bg-[#140f2d] text-white">
              All Status
            </option>

            <option value="NEW">
              New
            </option>

            <option value="CONTACTED">
              Contacted
            </option>

            <option value="QUALIFIED">
              Qualified
            </option>

            <option value="LOST">
              Lost
            </option>

          </select>

          {/* SOURCE */}

          <select
            value={sourceFilter}
            onChange={(e) =>
              handleSourceFilter(
                e.target.value
              )
            }
            className="h-11 rounded-xl border border-white/10 px-4 bg-white/5 text-white"
          >

            <option value="" className="bg-[#140f2d] text-white">
              All Sources
            </option>

            <option value="Website">
              Website
            </option>

            <option value="Referral">
              Referral
            </option>

            <option value="LinkedIn">
              LinkedIn
            </option>

          </select>

          {/* PRIORITY */}

          <select className="h-11 rounded-xl border border-white/10 px-4 bg-white/5 text-white">

            <option className="bg-[#140f2d] text-white">
              All Priority
            </option>

            <option className="bg-[#140f2d] text-white">
              High
            </option>

            <option className="bg-[#140f2d] text-white">
              Medium
            </option>

            <option className="bg-[#140f2d] text-white">
              Low
            </option>

          </select>

          {/* OWNERS */}

          <select className="h-11 rounded-xl border border-white/10 px-4 bg-white/5 text-white">

            <option className="bg-[#140f2d] text-white">
              All Owners
            </option>

            <option className="bg-[#140f2d] text-white">
              Arjun Kumar
            </option>

            <option className="bg-[#140f2d] text-white">
              Rahul
            </option>

          </select>

        </div>

      </div>

      {/* ================= TABLE ================= */}

      <div className="bg-[#140f2d]/80 rounded-3xl shadow-sm overflow-hidden">

        <div className="overflow-x-auto">

          <table className="w-full">

            {/* ================= HEAD ================= */}

            <thead className="bg-white/5 text-white">

              <tr>

                <th className="px-6 py-4">
                  <input type="checkbox" />
                </th>

                <th className="text-left px-6 py-4 text-xs font-semibold text-purple-300 uppercase">
                  Lead
                </th>

                <th className="text-left px-6 py-4 text-xs font-semibold text-purple-300 uppercase">
                  Company
                </th>

                <th className="text-left px-6 py-4 text-xs font-semibold text-purple-300 uppercase">
                  Source
                </th>

                <th className="text-left px-6 py-4 text-xs font-semibold text-purple-300 uppercase">
                  Score
                </th>

                <th className="text-left px-6 py-4 text-xs font-semibold text-purple-300 uppercase">
                  Est. Value
                </th>

                <th className="text-left px-6 py-4 text-xs font-semibold text-purple-300 uppercase">
                  Priority
                </th>

                <th className="text-left px-6 py-4 text-xs font-semibold text-purple-300 uppercase">
                  Status
                </th>

                <th className="text-left px-6 py-4 text-xs font-semibold text-purple-300 uppercase">
                  Owner
                </th>

                <th className="text-left px-6 py-4 text-xs font-semibold text-purple-300 uppercase">
                  Last Contact
                </th>

                <th className="text-center px-6 py-4 text-xs font-semibold text-purple-300 uppercase">
                  Actions
                </th>

              </tr>

            </thead>

            {/* ================= BODY ================= */}

            <tbody>

              {leads.map((lead) => (

                <tr
                  key={lead.id}
                  className="border-t border-white/10 hover:bg-[rgba(255,255,255,0.05)]"
                >

                  {/* CHECK */}

                  <td className="px-6 py-5">
                    <input type="checkbox" />
                  </td>

                  {/* LEAD */}

                  <td className="px-6 py-5">

                    <div className="flex items-center gap-3">

                      <div className="w-10 h-10 rounded-full bg-[#6366F1] text-white flex items-center justify-center text-xs font-bold">

                        {lead.firstName?.charAt(
                          0
                        )}

                        {lead.lastName?.charAt(
                          0
                        )}

                      </div>

                      <div>

                        <h4 className="font-semibold text-white text-sm">

                          {lead.firstName}{" "}
                          {lead.lastName}

                        </h4>

                        <p className="text-xs text-gray-400">

                          {lead.email}

                        </p>

                      </div>

                    </div>

                  </td>

                  {/* COMPANY */}

                  <td className="px-6 py-5 text-sm font-medium">

                    {lead.company}

                  </td>

                  {/* SOURCE */}

                  <td className="px-6 py-5 text-sm">

                    {lead.source?.name ||
                      "Website"}

                  </td>

                  {/* SCORE */}

                  <td className="px-6 py-5">

                    <div className="flex items-center gap-2">

                      <div className="w-20 h-2 rounded-full bg-white/10 overflow-hidden">

                        <div
                          className="h-full bg-[#6366F1]"
                          style={{
                            width: `${
                              lead.leadScore ||
                              70
                            }%`,
                          }}
                        />

                      </div>

                      <span className="text-xs font-semibold text-emerald-400">

                        {lead.leadScore ||
                          82}

                      </span>

                    </div>

                  </td>

                  {/* VALUE */}

                  <td className="px-6 py-5 text-sm font-semibold">

                    ₹
                    {lead.leadValue ||
                      "2L"}

                  </td>

                  {/* PRIORITY */}

                  <td className="px-6 py-5">

                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-400">

                      High

                    </span>

                  </td>

                  {/* STATUS */}

                  <td className="px-6 py-5">

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                        lead.status
                      )}`}
                    >

                      {lead.status}

                    </span>

                  </td>

                  {/* OWNER */}

                  <td className="px-6 py-5 text-sm">
                    Priya S.
                  </td>

                  {/* CONTACT */}

                  <td className="px-6 py-5 text-sm">
                    Today
                  </td>

                  {/* ACTION */}

                  <td className="px-6 py-5">

                    <div className="flex items-center justify-center gap-2">

                      <button className="px-3 py-1 rounded-lg bg-blue-500/10 text-blue-300 text-xs font-semibold">

                        View

                      </button>

                      <button className="px-3 py-1 rounded-lg bg-emerald-500/10 text-[#10B981] text-xs font-semibold">

                        Convert

                      </button>

                    </div>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
};

export default LeadList;

