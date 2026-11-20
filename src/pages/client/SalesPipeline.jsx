// src/pages/client/SalesPipeline.jsx

import React, {
  useEffect,
  useState,
} from "react";

import apiInterceptor from "../../interceptors/interceptors";

import {
  ArrowLeft,
  ChevronRight,
  TrendingUp,
  DollarSign,
  Target,
  CircleDollarSign,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

const SalesPipeline = () => {

  const navigate =
    useNavigate();

  // ================= STATE =================

  const [opportunities,
    setOpportunities] =
    useState([]);

  const [loading,
    setLoading] =
    useState(false);

  // ================= FETCH =================

  const fetchOpportunities =
    async () => {

      try {

        setLoading(true);

        const response =
          await apiInterceptor.get(
            "/opportunities"
          );

        setOpportunities(
          response.data.opportunities || response.data || []
        );

      } catch (error) {

        console.error(
          "Fetch error:",
          error
        );

      } finally {

        setLoading(false);
      }
    };

  useEffect(() => {

    fetchOpportunities();

  }, []);

  // ================= STAGES =================

  const pipelineStages = [
    "Prospecting",
    "Qualification",
    "Proposal",
    "Negotiation",
    "Closed Won",
  ];

  // ================= TOTALS =================

  const totalValue =
    opportunities.reduce(
      (sum, item) =>
        sum + (item.amount || 0),
      0
    );

  const totalOpen =
    opportunities.filter(
      (item) =>
        item.status === "OPEN"
    ).length;

  const totalWon =
    opportunities.filter(
      (item) =>
        item.status === "WON"
    ).length;

  const totalLost =
    opportunities.filter(
      (item) =>
        item.status === "LOST"
    ).length;

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
        >
          Client Management
        </button>

        <ChevronRight size={12} />

        <button
          onClick={() =>
            navigate(
              "/dashboard/client/opportunities"
            )
          }
        >
          Opportunities
        </button>

        <ChevronRight size={12} />

        <span className="text-white font-semibold">
          Sales Pipeline
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
            className="w-11 h-11 rounded-2xl bg-[#140f2d]/80 border border-white/10 flex items-center justify-center shadow-sm text-purple-300"
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

            <h1 className="text-3xl font-bold text-white">

              Sales Pipeline

            </h1>

            <p className="text-sm text-gray-400 mt-1">

              Track opportunity stages & sales flow

            </p>

          </div>

        </div>

      </div>

      {/* ================= STATS ================= */}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">

        {/* TOTAL VALUE */}

        <div className="bg-[#140f2d]/80 rounded-3xl p-6 shadow-sm border border-white/10">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm text-gray-400 font-medium">
                Pipeline Value
              </p>

              <h2 className="text-3xl font-bold text-blue-300 mt-2">

                ₹{totalValue.toLocaleString()}

              </h2>

            </div>

            <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center">

              <DollarSign
                size={28}
                className="text-blue-400"
              />

            </div>

          </div>

        </div>

        {/* OPEN */}

        <div className="bg-[#140f2d]/80 rounded-3xl p-6 shadow-sm border border-white/10">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm text-gray-400 font-medium">
                Open Deals
              </p>

              <h2 className="text-3xl font-bold text-[#F59E0B] mt-2">

                {totalOpen}

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

        {/* WON */}

        <div className="bg-[#140f2d]/80 rounded-3xl p-6 shadow-sm border border-white/10">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm text-gray-400 font-medium">
                Won Deals
              </p>

              <h2 className="text-3xl font-bold text-[#10B981] mt-2">

                {totalWon}

              </h2>

            </div>

            <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center">

              <CircleDollarSign
                size={26}
                className="text-emerald-400"
              />

            </div>

          </div>

        </div>

        {/* LOST */}

        <div className="bg-[#140f2d]/80 rounded-3xl p-6 shadow-sm border border-white/10">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm text-gray-400 font-medium">
                Lost Deals
              </p>

              <h2 className="text-3xl font-bold text-[#EF4444] mt-2">

                {totalLost}

              </h2>

            </div>

            <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center">

              <TrendingUp
                size={24}
                className="text-red-400 rotate-180"
              />

            </div>

          </div>

        </div>

      </div>

      {/* ================= PIPELINE ================= */}

      <div className="grid grid-cols-1 md:grid-cols-5 gap-5">

        {pipelineStages.map(
          (stage) => {

            const stageData =
              opportunities.filter(
                (item) =>
                  item.stage === stage
              );

            return (

              <div
                key={stage}
                className="bg-[#140f2d]/80 rounded-3xl shadow-sm border border-white/10 flex flex-col"
              >

                {/* HEADER */}

                <div className="p-5 border-b border-white/10">

                  <div className="flex items-center justify-between">

                    <div>

                      <h3 className="text-lg font-bold text-white">

                        {stage}

                      </h3>

                      <p className="text-sm text-gray-400 mt-1">

                        {stageData.length} Deals

                      </p>

                    </div>

                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">

                      <TrendingUp
                        size={18}
                        className="text-blue-300"
                      />

                    </div>

                  </div>

                </div>

                {/* CARDS */}

                <div className="p-4 space-y-4 min-h-[500px]">

                  {stageData.length > 0 ? (

                    stageData.map(
                      (item) => (

                        <div
                          key={item.id}
                          className="bg-white/5 text-white rounded-2xl p-4 border border-white/10"
                        >

                          <h4 className="font-bold text-white text-sm">

                            {item.opportunityName}

                          </h4>

                          <p className="text-xs text-gray-400 mt-1">

                            Assigned:
                            {" "}
                            {item.assignedTo}

                          </p>

                          <div className="mt-4 flex items-center justify-between">

                            <span className="text-sm font-bold text-emerald-400">

                              ₹{item.amount}

                            </span>

                            <span className="text-xs bg-blue-100 text-blue-400 px-3 py-1 rounded-full font-semibold">

                              {item.probability}%

                            </span>

                          </div>

                          <div className="mt-3 text-xs text-gray-400">

                            Close:
                            {" "}
                            {item.expectedCloseDate}

                          </div>

                        </div>
                      )
                    )

                  ) : (

                    <div className="text-center py-12 text-sm text-gray-400">

                      No opportunities

                    </div>

                  )}

                </div>

              </div>
            );
          }
        )}

      </div>

      {/* ================= LOADING ================= */}

      {loading && (

        <div className="text-center py-10 text-gray-400">

          Loading pipeline...

        </div>

      )}

    </div>
  );
};

export default SalesPipeline;

