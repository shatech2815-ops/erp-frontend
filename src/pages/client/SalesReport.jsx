// src/pages/client/SalesReport.jsx

import React, {
  useEffect,
  useState,
} from "react";

import apiInterceptor from "../../interceptors/interceptors";

import {
  ArrowLeft,
  ChevronRight,
  TrendingUp,
  IndianRupee,
  CircleDollarSign,
  Target,
  BadgePercent,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

const SalesReport = () => {

  const navigate =
    useNavigate();

  // ================= STATES =================

  const [report,
    setReport] =
    useState(null);

  const [opportunities,
    setOpportunities] =
    useState([]);

  const [loading,
    setLoading] =
    useState(false);

  // ================= FETCH =================

  const fetchSalesReport = async () => {
    try {
      setLoading(true);

      const opportunitiesRes = await apiInterceptor.get("/opportunities");
      const opps = opportunitiesRes.data.opportunities || opportunitiesRes.data || [];

      const totalRevenue = opps.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
      const totalOpportunities = opps.length;
      const wonDeals = opps.filter((item) => item.status === "WON").length;
      const conversionRate = totalOpportunities > 0 ? (wonDeals / totalOpportunities) * 100 : 0;

      setReport({
        totalRevenue,
        wonDeals,
        totalOpportunities,
        conversionRate
      });

      setOpportunities(opps);
    } catch (error) {
      console.error("Report fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {

    fetchSalesReport();

  }, []);

  return (

    <div >

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

          Sales Report

        </span>

      </div>

      {/* ================= HEADER ================= */}

      <div className="flex items-center gap-4 mb-8">

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

        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center">

          <TrendingUp
            size={28}
            className="text-emerald-400"
          />

        </div>

        <div>

          <h2 className="text-xl font-bold text-white">

            Sales Report

          </h2>

          <p className="text-sm text-gray-400 mt-1">

            Revenue & opportunity analytics

          </p>

        </div>

      </div>

      {/* ================= STATS ================= */}

      {report && (

        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">

          {/* TOTAL SALES */}

          <div className="bg-[#140f2d]/80 rounded-3xl p-6 shadow-sm border border-white/10">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-gray-400 font-medium">

                  Total Revenue

                </p>

                <h2 className="text-3xl font-bold text-[#10B981] mt-2">

                  ₹{report.totalRevenue?.toLocaleString()}

                </h2>

              </div>

              <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center">

                <IndianRupee
                  size={28}
                  className="text-emerald-400"
                />

              </div>

            </div>

          </div>

          {/* WON DEALS */}

          <div className="bg-[#140f2d]/80 rounded-3xl p-6 shadow-sm border border-white/10">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-gray-400 font-medium">

                  Won Deals

                </p>

                <h2 className="text-3xl font-bold text-blue-300 mt-2">

                  {report.wonDeals}

                </h2>

              </div>

              <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center">

                <CircleDollarSign
                  size={26}
                  className="text-blue-400"
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

                <h2 className="text-3xl font-bold text-[#F59E0B] mt-2">

                  {report.totalOpportunities}

                </h2>

              </div>

              <div className="w-14 h-14 rounded-2xl bg-yellow-100 flex items-center justify-center">

                <Target
                  size={26}
                  className="text-amber-400"
                />

              </div>

            </div>

          </div>

          {/* CONVERSION */}

          <div className="bg-[#140f2d]/80 rounded-3xl p-6 shadow-sm border border-white/10">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-gray-400 font-medium">

                  Conversion Rate

                </p>

                <h2 className="text-3xl font-bold text-[#8B5CF6] mt-2">

                  {report.conversionRate?.toFixed(1)}%

                </h2>

              </div>

              <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center">

                <BadgePercent
                  size={26}
                  className="text-purple-400"
                />

              </div>

            </div>

          </div>

        </div>

      )}

      {/* ================= TABLE ================= */}

      <div className="bg-[#140f2d]/80 rounded-3xl shadow-sm border border-white/10 overflow-hidden">

        {/* HEADER */}

        <div className="p-6 border-b border-white/10">

          <h2 className="text-xl font-bold text-white">

            Opportunity Revenue Report

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
                  Probability
                </th>

                <th className="px-6 py-4 text-left text-xs font-bold text-purple-300 uppercase">
                  Revenue
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

                      <td className="px-6 py-5">

                        {item.probability}%

                      </td>

                      <td className="px-6 py-5 font-bold text-[#10B981]">

                        ₹{item.amount?.toLocaleString()}

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
                      ? "Loading sales reports..."
                      : "No sales reports found"}

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

export default SalesReport;

