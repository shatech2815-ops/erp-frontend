// src/pages/client/LeadSource.jsx

import React, {
  useEffect,
  useState,
} from "react";

import apiInterceptor from "../../interceptors/interceptors";

import {
  ArrowLeft,
  ChevronRight,
  Radio,
  Search,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

const LeadSource = () => {

  const navigate = useNavigate();

  // ================= STATES =================

  const [sources,
    setSources] =
    useState([]);

  const [filteredSources,
    setFilteredSources] =
    useState([]);

  const [search,
    setSearch] =
    useState("");

  const [loading,
    setLoading] =
    useState(false);

  // ================= FETCH =================

  const fetchSources =
    async () => {

      try {

        setLoading(true);

        const response =
          await apiInterceptor.get(
            "/lead-sources"
          );

        setSources(
          response.data
        );

        setFilteredSources(
          response.data
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

  // ================= ACTIVE =================

  const fetchActiveSources =
    async () => {

      try {

        setLoading(true);

        const response =
          await apiInterceptor.get(
            "/lead-sources/active"
          );

        setSources(
          response.data
        );

        setFilteredSources(
          response.data
        );

      } catch (error) {

        console.error(error);

      } finally {

        setLoading(false);
      }
    };

  // ================= SEARCH =================

  useEffect(() => {

    if (!search) {

      setFilteredSources(
        sources
      );

      return;
    }

    const searchSources =
      async () => {

        try {

          const response =
            await apiInterceptor.get(
              "/lead-sources/search?name=${search}"
            );

          setFilteredSources(
            response.data
          );

        } catch (error) {

          console.error(error);
        }
      };

    searchSources();

  }, [search, sources]);

  // ================= LOAD =================

  useEffect(() => {

    fetchSources();

  }, []);

  // ================= RESET =================

  const handleReset =
    () => {

      setSearch("");

      fetchSources();
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
          Lead Source
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

        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm"
          style={{
            background:
              "rgba(59,130,246,0.15)",
          }}
        >

          <Radio
            size={22}
            style={{
              color: "#2563EB",
            }}
          />

        </div>

        {/* TITLE */}

        <div>

          <h2 className="text-xl font-bold text-white">
            Lead Sources
          </h2>

          <p className="text-sm text-gray-400">
            Source performance overview
          </p>

        </div>

      </div>

      {/* ================= SEARCH ================= */}

      <div className="bg-[#140f2d]/80 rounded-3xl shadow-sm p-5 mb-6">

        <div className="flex flex-wrap gap-4 items-center">

          {/* SEARCH */}

          <div className="flex items-center bg-purple-500/10 rounded-2xl px-4 py-3 flex-1">

            <Search
              size={18}
              className="text-gray-400"
            />

            <input
              type="text"
              placeholder="Search lead source..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              className="bg-transparent outline-none px-3 w-full"
            />

          </div>

          {/* ACTIVE */}

          <button
            onClick={
              fetchActiveSources
            }
            className="px-5 py-3 rounded-2xl bg-green-100 text-emerald-400 font-semibold flex items-center gap-2"
          >

            <CheckCircle2
              size={18}
            />

            Active Sources

          </button>

          {/* RESET */}

          <button
            onClick={
              handleReset
            }
            className="px-5 py-3 rounded-2xl bg-white/5 text-white text-gray-300 font-semibold flex items-center gap-2"
          >

            <RotateCcw
              size={18}
            />

            Reset

          </button>

        </div>

      </div>

      {/* ================= TABLE ================= */}

      <div className="bg-[#140f2d]/80 rounded-3xl shadow-sm overflow-hidden">

        {/* HEADER */}

        <div className="px-6 py-5 border-b border-white/10">

          <h3 className="text-lg font-bold text-white">
            Source Performance
          </h3>

        </div>

        {/* TABLE */}

        <div className="overflow-x-auto">

          <table className="w-full">

            {/* TABLE HEAD */}

            <thead className="bg-white/5 text-white">

              <tr>

                <th className="text-left px-6 py-4 text-xs font-semibold text-purple-300 uppercase">
                  Source
                </th>

                <th className="text-left px-6 py-4 text-xs font-semibold text-purple-300 uppercase">
                  Leads
                </th>

                <th className="text-left px-6 py-4 text-xs font-semibold text-purple-300 uppercase">
                  Qualified
                </th>

                <th className="text-left px-6 py-4 text-xs font-semibold text-purple-300 uppercase">
                  Won
                </th>

                <th className="text-left px-6 py-4 text-xs font-semibold text-purple-300 uppercase">
                  Conv. Rate
                </th>

                <th className="text-left px-6 py-4 text-xs font-semibold text-purple-300 uppercase">
                  Avg Value
                </th>

              </tr>

            </thead>

            {/* TABLE BODY */}

            <tbody>

              {!loading &&
              filteredSources.length >
                0 ? (

                filteredSources.map(
                  (item) => (

                    <tr
                      key={item.id}
                      className="border-t border-white/10 hover:bg-[rgba(250,252,255,0.12)]"
                    >

                      {/* SOURCE */}

                      <td className="px-6 py-5">

                        <div className="flex items-center gap-3">

                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center"
                            style={{
                              background:
                                item.color ||
                                "#2563EB",
                            }}
                          >

                            <Radio
                              size={16}
                              className="text-white"
                            />

                          </div>

                          <div>

                            <h4 className="font-semibold text-white text-sm">

                              {item.name}

                            </h4>

                            <p className="text-xs text-gray-400">

                              {item.description ||
                                "Lead Source"}

                            </p>

                          </div>

                        </div>

                      </td>

                      {/* LEADS */}

                      <td className="px-6 py-5 text-sm font-semibold text-white">

                        {item.totalLeads || 0}

                      </td>

                      {/* QUALIFIED */}

                      <td className="px-6 py-5 text-sm font-semibold text-white">

                        {item.qualifiedLeads || 0}

                      </td>

                      {/* WON */}

                      <td className="px-6 py-5 text-sm font-semibold text-white">

                        {item.wonLeads || 0}

                      </td>

                      {/* CONVERSION */}

                      <td className="px-6 py-5">

                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            item.conversionRate >= 50
                              ? "bg-green-100 text-emerald-400"
                              : item.conversionRate >= 20
                              ? "bg-blue-100 text-blue-400"
                              : "bg-red-100 text-red-400"
                          }`}
                        >

                          {item.conversionRate || 0}%

                        </span>

                      </td>

                      {/* AVG VALUE */}

                      <td className="px-6 py-5 text-sm font-semibold text-white">

                        ₹
                        {item.averageValue || 0}L

                      </td>

                    </tr>
                  )
                )

              ) : (

                <tr>

                  <td
                    colSpan="6"
                    className="text-center py-14 text-gray-400"
                  >

                    {loading
                      ? "Loading lead sources..."
                      : "No lead sources found"}

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

export default LeadSource;

