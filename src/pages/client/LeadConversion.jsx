// src/pages/client/LeadConversion.jsx

import React, {
  useEffect,
  useState,
} from "react";

import apiInterceptor from "../../interceptors/interceptors";

import {
  ArrowLeft,
  ChevronRight,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

const LeadConversion = () => {

  const navigate = useNavigate();

  // ================= STATES =================

  const [leads,
    setLeads] =
    useState([]);

  const [loading,
    setLoading] =
    useState(false);

  // ================= FETCH =================

  const fetchLeads =
    async () => {

      try {

        setLoading(true);

        const response =
          await apiInterceptor.get(
            "/leads"
          );

        setLeads(
          response.data.leads || []
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

    fetchLeads();

  }, []);

  // ================= CONVERT LEAD =================

  const handleConvert = async (leadId) => {
    try {
      setLoading(true);
      await apiInterceptor.post(`/leads/${leadId}/convert`);
      alert("Lead converted successfully!");
      fetchLeads();
    } catch (error) {
      console.error("Convert error:", error);
      alert("Failed to convert lead.");
    } finally {
      setLoading(false);
    }
  };

  // ================= FILTERS =================

  const totalLeads =
    leads.length;

  const contactedLeads =
    leads.filter(
      (item) =>
        item.status ===
        "CONTACTED"
    ).length;

  const qualifiedLeads =
    leads.filter(
      (item) =>
        item.status ===
        "QUALIFIED"
    ).length;

  const proposedLeads =
    leads.filter(
      (item) =>
        item.status ===
        "PROPOSAL"
    ).length;

  const wonLeads =
    leads.filter(
      (item) =>
        item.status ===
        "CONVERTED"
    ).length;

  // ================= READY TO CONVERT =================

  const readyToConvert =
    leads.filter(
      (item) =>
        item.status ===
        "QUALIFIED"
    );

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
          Lead Conversion
        </span>

      </div>

      {/* ================= HEADER ================= */}

      <div className="flex items-center gap-4 mb-6">

        {/* BACK */}

        <button
          onClick={() =>
            navigate(
              "/dashboard/client"
            )
          }
          className="w-10 h-10 rounded-xl bg-[#140f2d]/80 border border-white/10 flex items-center justify-center text-purple-300 shadow-sm"
        >

          <ArrowLeft size={16} />

        </button>

        {/* ICON */}

        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center shadow-sm">

          <TrendingUp
            size={22}
            className="text-[#16A34A]"
          />

        </div>

        {/* TITLE */}

        <div>

          <h2 className="text-xl font-bold text-white">
            Lead Conversion
          </h2>

          <p className="text-sm text-gray-400">
            Track lead conversion funnel
          </p>

        </div>

      </div>

      {/* ================= SUMMARY ================= */}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mt-6">

        {/* TOTAL */}

        <div className="bg-[#140f2d]/80 rounded-3xl p-5 shadow-sm border border-white/10 ">

          <p className="text-xs font-semibold text-gray-400 uppercase">
            Total Leads
          </p>

          <h3 className="text-3xl font-bold text-blue-300 mt-2">
            {totalLeads}
          </h3>

        </div>

        {/* QUALIFIED */}

        <div className="bg-[#140f2d]/80 rounded-3xl p-5 shadow-sm border border-white/10">

          <p className="text-xs font-semibold text-gray-400 uppercase">
            Qualified
          </p>

          <h3 className="text-3xl font-bold text-[#10B981] mt-2">
            {qualifiedLeads}
          </h3>

        </div>

        {/* WON */}

        <div className="bg-[#140f2d]/80 rounded-3xl p-5 shadow-sm border border-white/10">

          <p className="text-xs font-semibold text-gray-400 uppercase">
            Converted
          </p>

          <h3 className="text-3xl font-bold text-[#EC4899] mt-2">
            {wonLeads}
          </h3>

        </div>

        {/* RATE */}

        <div className="bg-[#140f2d]/80 rounded-3xl p-5 shadow-sm border border-white/10">

          <p className="text-xs font-semibold text-gray-400 uppercase">
            Conversion Rate
          </p>

          <h3 className="text-3xl font-bold text-[#F59E0B] mt-2">

            {(
              (wonLeads /
                totalLeads) *
              100 || 0
            ).toFixed(1)}
            %

          </h3>

        </div>

      </div>

      {/* ================= CONTENT ================= */}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mt-5">

        {/* ================= FUNNEL ================= */}

        <div className="bg-[#140f2d]/80 rounded-3xl shadow-sm p-6 border border-white/10">

          <h3 className="text-lg font-bold text-white mb-6">
            Conversion Funnel
          </h3>

          {/* TOTAL */}

          <div className="mb-4">

            <div className="w-full bg-blue-500/10 border border-[#3B82F6] rounded-xl py-4 text-center">

              <h4 className="text-lg font-bold text-white">

                {totalLeads} Total Leads

              </h4>

              <p className="text-xs text-gray-400">
                100%
              </p>

            </div>

          </div>

          {/* CONTACTED */}

          <div className="mb-4 flex justify-center">

            <div className="w-[85%] bg-purple-500/10 border border-[#8B5CF6] rounded-xl py-4 text-center">

              <h4 className="text-lg font-bold text-white">

                {contactedLeads} Contacted

              </h4>

              <p className="text-xs text-gray-400">

                {(
                  (contactedLeads /
                    totalLeads) *
                  100 || 0
                ).toFixed(1)}
                %

              </p>

            </div>

          </div>

          {/* QUALIFIED */}

          <div className="mb-4 flex justify-center">

            <div className="w-[70%] bg-emerald-500/10 border border-[#10B981] rounded-xl py-4 text-center">

              <h4 className="text-lg font-bold text-white">

                {qualifiedLeads} Qualified

              </h4>

              <p className="text-xs text-gray-400">

                {(
                  (qualifiedLeads /
                    totalLeads) *
                  100 || 0
                ).toFixed(1)}
                %

              </p>

            </div>

          </div>

          {/* PROPOSED */}

          <div className="mb-4 flex justify-center">

            <div className="w-[50%] bg-amber-500/10 border border-[#F59E0B] rounded-xl py-4 text-center">

              <h4 className="text-lg font-bold text-white">

                {proposedLeads} Proposed

              </h4>

              <p className="text-xs text-gray-400">

                {(
                  (proposedLeads /
                    totalLeads) *
                  100 || 0
                ).toFixed(1)}
                %

              </p>

            </div>

          </div>

          {/* WON */}

          <div className="flex justify-center">

            <div className="w-[30%] bg-pink-500/10 border border-[#EC4899] rounded-xl py-4 text-center">

              <h4 className="text-lg font-bold text-white">

                {wonLeads} Won

              </h4>

              <p className="text-xs text-gray-400">

                {(
                  (wonLeads /
                    totalLeads) *
                  100 || 0
                ).toFixed(1)}
                %

              </p>

            </div>

          </div>

        </div>

        {/* ================= READY TABLE ================= */}

        <div className="bg-[#140f2d]/80 rounded-3xl shadow-sm border border-white/10 overflow-hidden">

          {/* HEADER */}

          <div className="px-6 py-5 border-b border-white/10">

            <h3 className="text-lg font-bold text-white">
              Ready to Convert
            </h3>

          </div>

          {/* TABLE */}

          <div className="overflow-x-auto">

            <table className="w-full">

              {/* HEAD */}

              <thead className="bg-white/5 text-white">

                <tr>

                  <th className="text-left px-6 py-4 text-xs font-semibold text-purple-300 uppercase">
                    Lead
                  </th>

                  <th className="text-left px-6 py-4 text-xs font-semibold text-purple-300 uppercase">
                    Score
                  </th>

                  <th className="text-left px-6 py-4 text-xs font-semibold text-purple-300 uppercase">
                    Value
                  </th>

                  <th className="text-left px-6 py-4 text-xs font-semibold text-purple-300 uppercase">
                    Owner
                  </th>

                  <th className="text-center px-6 py-4 text-xs font-semibold text-purple-300 uppercase">
                    Action
                  </th>

                </tr>

              </thead>

              {/* BODY */}

              <tbody>

                {!loading &&
                readyToConvert.length >
                  0 ? (

                  readyToConvert.map(
                    (item) => (

                      <tr
                        key={item.id}
                        className="border-t border-white/10 hover:bg-[rgba(250,252,255,0.12)]"
                      >

                        {/* LEAD */}

                        <td className="px-6 py-5">

                          <div>

                            <h4 className="font-semibold text-white text-sm">

                              {item.firstName}{" "}
                              {item.lastName}

                            </h4>

                            <p className="text-xs text-gray-400">

                              {item.company}

                            </p>

                          </div>

                        </td>

                        {/* SCORE */}

                        <td className="px-6 py-5">

                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-emerald-400">

                            {item.leadScore ||
                              95}

                          </span>

                        </td>

                        {/* VALUE */}

                        <td className="px-6 py-5 text-sm font-semibold text-white">

                          ₹
                          {item.leadValue ||
                            "12.4L"}

                        </td>

                        {/* OWNER */}

                        <td className="px-6 py-5 text-sm font-medium text-white">

                          Arjun K.

                        </td>

                        {/* ACTION */}

                        <td className="px-6 py-5 text-center">

                          <button 
                            onClick={() => handleConvert(item.id)}
                            className="px-4 py-2 rounded-xl bg-emerald-500/10 text-[#16A34A] text-xs font-semibold hover:bg-[rgba(187,247,208,0.12)] transition-all">

                            Convert →

                          </button>

                        </td>

                      </tr>
                    )
                  )

                ) : (

                  <tr>

                    <td
                      colSpan="5"
                      className="text-center py-16 text-gray-400"
                    >

                      {loading
                        ? "Loading leads..."
                        : "No qualified leads found"}

                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

        </div>

      </div>

      

    </div>
  );
};

export default LeadConversion;

