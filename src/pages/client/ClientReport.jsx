// src/pages/client/ClientReport.jsx

import React, {
  useEffect,
  useState,
} from "react";

import apiInterceptor from "../../interceptors/interceptors";

import {
  ArrowLeft,
  ChevronRight,
  FileBarChart2,
  Users,
  Briefcase,
  TrendingUp,
  IndianRupee,
  Download,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

const ClientReport = () => {

  const navigate =
    useNavigate();

  // ================= STATES =================

  const [clients,
    setClients] =
    useState([]);

  const [leads,
    setLeads] =
    useState([]);

  const [opportunities,
    setOpportunities] =
    useState([]);

  const [loading,
    setLoading] =
    useState(false);

  // ================= FETCH DATA =================

  const fetchReports =
    async () => {

      try {

        setLoading(true);

        const [
          clientsRes,
          leadsRes,
          opportunitiesRes,
        ] = await Promise.all([

          apiInterceptor.get(
            "/clients"
          ),

          apiInterceptor.get(
            "/leads"
          ),

          apiInterceptor.get(
            "/opportunities"
          ),

        ]);

        setClients(
          clientsRes.data || []
        );

        setLeads(
          leadsRes.data.leads || leadsRes.data || []
        );

        setOpportunities(
          opportunitiesRes.data.opportunities || opportunitiesRes.data || []
        );

      } catch (error) {

        console.error(
          "Report fetch error:",
          error
        );

      } finally {

        setLoading(false);
      }
    };

  useEffect(() => {

    fetchReports();

  }, []);

  // ================= CALCULATIONS =================

  const totalClients =
    clients.length;

  const totalLeads =
    leads.length;

  const totalOpportunities =
    opportunities.length;

  const totalRevenue =
    opportunities.reduce(
      (sum, item) =>
        sum + (item.amount || 0),
      0
    );

  const wonDeals =
    opportunities.filter(
      (item) =>
        item.status === "WON"
    ).length;

  const conversionRate =
    totalOpportunities > 0
      ? (
          (wonDeals /
            totalOpportunities) *
          100
        ).toFixed(1)
      : 0;

  const handleExport = () => {
    const headers = [
      "Opportunity Name",
      "Stage",
      "Status",
      "Amount (INR)",
      "Assigned To",
      "Close Date"
    ];

    const rows = opportunities.map((item) => [
      item.opportunityName || "—",
      item.stage || "—",
      item.status || "—",
      item.amount || 0,
      item.assignedTo || "—",
      item.closeDate || "—"
    ]);

    const summaryHeader = ["--- SUMMARY METRICS ---"];
    const summaryRows = [
      ["Total Clients", totalClients],
      ["Total Leads", totalLeads],
      ["Total Opportunities", totalOpportunities],
      ["Total Revenue (INR)", totalRevenue],
      ["Conversion Rate (%)", `${conversionRate}%`],
      []
    ];

    const csvContent = [
      ...summaryHeader.map((h) => `"${h}"`),
      ...summaryRows.map((r) => r.map((v) => `"${v ?? ""}"`).join(",")),
      headers.map((h) => `"${h}"`).join(","),
      ...rows.map((r) => r.map((v) => `"${v ?? ""}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `client-report-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
          className="hover:text-purple-200 transition-colors"
        >
          Client Management
        </button>

        <ChevronRight size={12} />

        <button
          onClick={() =>
            navigate(
              "/dashboard/client/reports"
            )
          }
          className="hover:text-purple-200 transition-colors"
        >
          Reports
        </button>

        <ChevronRight size={12} />

        <span className="text-white font-semibold">

          Client Reports

        </span>

      </div>

      {/* ================= HEADER ================= */}

      <div className="flex items-center justify-between mb-8">

        <div className="flex items-center gap-4">

          {/* BACK */}

          <button
            onClick={() =>
              navigate(
                "/dashboard/client/reports"
              )
            }
            className="w-11 h-11 rounded-2xl bg-[#140f2d]/80 border border-white/10 flex items-center justify-center shadow-sm text-purple-300 hover:bg-white/10 transition-colors"
          >

            <ArrowLeft size={18} />

          </button>

          {/* ICON */}

          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">

            <FileBarChart2
              size={28}
              className="text-blue-300"
            />

          </div>

          {/* TITLE */}

          <div>

            <h1 className="text-xl font-bold text-white">

              Client Reports

            </h1>

            <p className="text-sm text-gray-400 mt-1">

              CRM analytics & business performance

            </p>

          </div>

        </div>

        {/* EXPORT */}

        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-blue-500 hover:bg-blue-600 transition-colors text-white font-semibold shadow-sm cursor-pointer"
        >

          <Download size={18} />

          Export Report

        </button>

      </div>

      {/* ================= STATS ================= */}

      <div className="grid grid-cols-1 md:grid-cols-5 gap-5 mb-8">

        {/* CLIENTS */}

        <div className="bg-[#140f2d]/80 rounded-3xl p-6 shadow-sm border border-white/10">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm text-gray-400 font-medium">

                Total Clients

              </p>

              <h2 className="text-3xl font-bold text-blue-300 mt-2">

                {totalClients}

              </h2>

            </div>

            <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center">

              <Users
                size={28}
                className="text-blue-400"
              />

            </div>

          </div>

        </div>

        {/* LEADS */}

        <div className="bg-[#140f2d]/80 rounded-3xl p-6 shadow-sm border border-white/10">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm text-gray-400 font-medium">

                Total Leads

              </p>

              <h2 className="text-3xl font-bold text-[#F59E0B] mt-2">

                {totalLeads}

              </h2>

            </div>

            <div className="w-14 h-14 rounded-2xl bg-yellow-100 flex items-center justify-center">

              <TrendingUp
                size={26}
                className="text-amber-400"
              />

            </div>

          </div>

        </div>

        {/* OPPORTUNITIES */}

        <div className="bg-[#140f2d]/80 rounded-3xl p-6 shadow-sm border border-white/10">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm text-gray-400 font-medium">

                Opportunities

              </p>

              <h2 className="text-3xl font-bold text-[#10B981] mt-2">

                {totalOpportunities}

              </h2>

            </div>

            <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center">

              <Briefcase
                size={26}
                className="text-emerald-400"
              />

            </div>

          </div>

        </div>

        {/* REVENUE */}

        <div className="bg-[#140f2d]/80 rounded-3xl p-6 shadow-sm border border-white/10">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm text-gray-400 font-medium">

                Revenue

              </p>

              <h2 className="text-2xl font-bold text-[#EC4899] mt-2">

                ₹{totalRevenue.toLocaleString()}

              </h2>

            </div>

            <div className="w-14 h-14 rounded-2xl bg-pink-100 flex items-center justify-center">

              <IndianRupee
                size={26}
                className="text-pink-600"
              />

            </div>

          </div>

        </div>

        {/* CONVERSION */}

        <div className="bg-[#140f2d]/80 rounded-3xl p-6 shadow-sm border border-white/10">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm text-gray-400 font-medium">

                Conversion

              </p>

              <h2 className="text-3xl font-bold text-[#8B5CF6] mt-2">

                {conversionRate}%

              </h2>

            </div>

            <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center">

              <FileBarChart2
                size={24}
                className="text-purple-400"
              />

            </div>

          </div>

        </div>

      </div>

      {/* ================= RECENT OPPORTUNITIES ================= */}

      <div className="bg-[#140f2d]/80 rounded-3xl shadow-sm border border-white/10 overflow-hidden">

        {/* HEADER */}

        <div className="p-6 border-b border-white/10">

          <h2 className="text-xl font-bold text-white">

            Recent Opportunities

          </h2>

        </div>

        {/* TABLE */}

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead className="bg-white/5 text-white">

              <tr>

                <th className="px-6 py-4 text-left text-xs font-bold text-purple-300 uppercase">
                  Opportunity
                </th>

                <th className="px-6 py-4 text-left text-xs font-bold text-purple-300 uppercase">
                  Stage
                </th>

                <th className="px-6 py-4 text-left text-xs font-bold text-purple-300 uppercase">
                  Status
                </th>

                <th className="px-6 py-4 text-left text-xs font-bold text-purple-300 uppercase">
                  Amount
                </th>

                <th className="px-6 py-4 text-left text-xs font-bold text-purple-300 uppercase">
                  Assigned To
                </th>

              </tr>

            </thead>

            <tbody>

              {opportunities.length > 0 ? (

                opportunities.map(
                  (item) => (

                    <tr
                      key={item.id}
                      className="border-b border-white/10 hover:bg-[rgba(248,250,252,0.12)]"
                    >

                      <td className="px-6 py-5 font-semibold text-white">

                        {item.opportunityName}

                      </td>

                      <td className="px-6 py-5 text-gray-400">

                        {item.stage}

                      </td>

                      <td className="px-6 py-5">

                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            item.status === "WON"
                              ? "bg-green-100 text-emerald-400"
                              : item.status === "LOST"
                              ? "bg-red-100 text-red-400"
                              : "bg-yellow-100 text-amber-400"
                          }`}
                        >

                          {item.status}

                        </span>

                      </td>

                      <td className="px-6 py-5 font-bold text-blue-300">

                        ₹{item.amount}

                      </td>

                      <td className="px-6 py-5 text-gray-400">

                        {item.assignedTo}

                      </td>

                    </tr>
                  )
                )

              ) : (

                <tr>

                  <td
                    colSpan="5"
                    className="text-center py-12 text-gray-400"
                  >

                    {loading
                      ? "Loading reports..."
                      : "No opportunity reports found"}

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

export default ClientReport;

