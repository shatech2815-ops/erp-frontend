// src/pages/client/ClientList.jsx

import React, { useEffect, useState } from "react";
import apiInterceptor from "../../interceptors/interceptors";
import {
  ArrowLeft,
  Plus,
  Search,
  Users,
  Building2,
  Eye,
  Trash2,
  UserCheck,
  X,
   ChevronRight,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

const ClientList = () => {
  const navigate = useNavigate();

  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState("");

  const [categoryFilter, setCategoryFilter] =
    useState("");

  const [industryFilter, setIndustryFilter] =
    useState("");

  const [selectedClient, setSelectedClient] =
    useState(null);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const response = await apiInterceptor.get("/clients");
      setClients(response.data || []);
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  };

  const deleteClient = async (id) => {
    try {
      await apiInterceptor.delete("/clients/${id}");
      loadClients();
    } catch (error) {
      console.error("Error deleting client:", error);
      alert("Failed to delete client");
    }
  };

  // FILTERS
  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.name
        ?.toLowerCase()
        .includes(search.toLowerCase());

    const matchesCategory =
      !categoryFilter ||
      client.category === categoryFilter;

    const matchesIndustry =
      !industryFilter ||
      client.industry === industryFilter;

    return (
      matchesSearch &&
      matchesCategory &&
      matchesIndustry
    );
  });

  // UNIQUE CATEGORY LIST
  const categories = [
    ...new Set(
      clients
        .map((c) => c.category)
        .filter(Boolean)
    ),
  ];

  // UNIQUE INDUSTRY LIST
  const industries = [
    ...new Set(
      clients
        .map((c) => c.industry)
        .filter(Boolean)
    ),
  ];

  // ACTIVE CLIENTS COUNT
  const activeClientsCount = clients.length;

  return (
    <div>

      {/* Breadcrumb */}
<div className="flex items-center gap-2 text-xs text-purple-300 mb-4 font-medium">

  <button
    onClick={() => navigate('/dashboard/client')}
    className="hover:text-purple-300 transition-colors"
  >
    Client Management
  </button>

  <ChevronRight size={12} className="text-gray-300" />

  <button
        onClick={() => navigate('/dashboard/client/clients')}
        className="hover:text-purple-300 transition-colors"
      >
        Clients
      </button>
   <ChevronRight size={12} className="text-gray-300" />                                                                                                                         
  <span className="text-white font-semibold">
    Client List
  </span>

</div>

{/* Header */}
<div className="flex items-center gap-4 mb-6">

  {/* BACK BUTTON */}
  <button
    onClick={() => navigate('/dashboard/client/clients')}
    className="w-10 h-10 rounded-xl bg-[#140f2d]/80 border border-white/10 flex items-center justify-center text-purple-300 hover:bg-white/10 transition-colors shadow-sm"
  >
    <ArrowLeft size={16} />
  </button>

  {/* ICON */}
  <div
    className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm"
    style={{ background: 'rgba(34,197,94,0.15)' }}
  >
    <Users size={22} style={{ color: '#16a34a' }} />
  </div>

  {/* TITLE */}
  <div className="flex-1">

    <h2 className="text-xl font-bold text-white">
      Client List
    </h2>

    <p className="text-sm text-gray-400">
      {clients.length} clients registered
    </p>

  </div>

  {/* ADD BUTTON */}
  <button
    onClick={() =>
      navigate('/dashboard/client/clients/add')
    }
    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold shadow-md hover:opacity-90 transition-opacity"
    style={{
      background:
        'linear-gradient(135deg, #16a34a, #22c55e)',
    }}
  >
    <Plus size={16} />
    Add Client
  </button>

</div>
      {/* EMPTY STATE */}
      {clients.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-28">

          <div className="w-20 h-20 rounded-3xl bg-[#140f2d]/80 flex items-center justify-center shadow-sm mb-5">
            <Users size={38} className="text-[#4f6f91]" />
          </div>

          <h2 className="text-3xl font-bold text-white mb-2">
            No Clients Yet
          </h2>

          <p className="text-gray-400 text-center mb-8">
            Create your first client.
          </p>

          <button
            onClick={() =>
              navigate("/dashboard/client/clients/add")
            }
            className="bg-[#4f6f91] hover:bg-[#3d5d80] text-white px-6 py-3 rounded-xl font-semibold shadow"
          >
            <div className="flex items-center gap-2">
              <Plus size={18} />
              Add Client
            </div>
          </button>
        </div>
      ) : (
        <>
          {/* STATS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">

            {/* TOTAL */}
            <div className="bg-[#140f2d]/80 rounded-3xl p-5 shadow-sm">
              <div className="flex items-center gap-4">

                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                  <Users
                    className="text-gray-400"
                    size={24}
                  />
                </div>

                <div>
                  <p className="text-sm text-gray-400">
                    Total Clients
                  </p>

                  <h3 className="text-2xl font-bold text-white">
                    {clients.length}
                  </h3>
                </div>
              </div>
            </div>

            {/* ACTIVE */}
            <div className="bg-[#140f2d]/80 rounded-3xl p-5 shadow-sm">
              <div className="flex items-center gap-4">

                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                  <UserCheck
                    className="text-emerald-400"
                    size={24}
                  />
                </div>

                <div>
                  <p className="text-sm text-gray-400">
                    Active Clients
                  </p>

                  <h3 className="text-2xl font-bold text-white">
                    {activeClientsCount}
                  </h3>
                </div>
              </div>
            </div>

            {/* COMPANIES */}
            <div className="bg-[#140f2d]/80 rounded-3xl p-5 shadow-sm">
              <div className="flex items-center gap-4">

                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                  <Building2
                    className="text-[#ff9800]"
                    size={24}
                  />
                </div>

                <div>
                  <p className="text-sm text-gray-400">
                    Companies
                  </p>

                  <h3 className="text-2xl font-bold text-white">
                    {
                      clients.filter(
                        (c) => c.companyName
                      ).length
                    }
                  </h3>
                </div>
              </div>
            </div>

          </div>

          {/* SEARCH + FILTER */}
          <div className="bg-[#140f2d]/80 rounded-3xl p-4 mb-5 shadow-sm">

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              {/* SEARCH */}
              <div className="relative">
                <Search
                  className="absolute left-4 top-3.5 text-gray-400"
                  size={18}
                />

                <input
                  type="text"
                  placeholder="Search client..."
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  className="w-full border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none"
                />
              </div>

              {/* CATEGORY FILTER */}
              <select
                value={categoryFilter}
                onChange={(e) =>
                  setCategoryFilter(e.target.value)
                }
                className="border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none"
              >
                <option value="" className="bg-[#140f2d] text-white">
                  All Categories
                </option>

                {categories.map((category, index) => (
                  <option key={index} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              {/* INDUSTRY FILTER */}
              <select
                value={industryFilter}
                onChange={(e) =>
                  setIndustryFilter(e.target.value)
                }
                className="border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none"
              >
                <option value="" className="bg-[#140f2d] text-white">
                  All Industries
                </option>

                {industries.map((industry, index) => (
                  <option key={index} value={industry}>
                    {industry}
                  </option>
                ))}
              </select>

            </div>
          </div>

          {/* TABLE */}
          <div className="bg-[#140f2d]/80 rounded-3xl overflow-hidden shadow-sm">

            <table className="w-full">

              <thead className="bg-white/5 text-white">
                <tr>

                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">
                    Client Name
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">
                    Company
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">
                    Email
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">
                    Phone
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">
                    Category
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">
                    Actions
                  </th>

                </tr>
              </thead>

              <tbody>

                {filteredClients.map((client, index) => (
                  <tr
                    key={index}
                    className="border-t border-white/10"
                  >

                    <td className="px-6 py-4">
                      <p className="font-semibold text-sm text-white">
                        {client.name}
                      </p>

                      <p className="text-xs text-gray-400">
                        {client.city}
                      </p>
                    </td>

                    <td className="px-6 py-4 text-sm">
                      {client.companyName}
                    </td>

                    <td className="px-6 py-4 text-sm">
                      {client.email}
                    </td>

                    <td className="px-6 py-4 text-sm">
                      {client.phone}
                    </td>

                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full bg-blue-500/10 text-gray-400 text-xs font-semibold">
                        {client.category || "Regular"}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">

                        {/* VIEW */}
                        <button
                          onClick={() =>
                            setSelectedClient(client)
                          }
                          className="text-gray-400 hover:text-blue-600"
                        >
                          <Eye size={16} />
                        </button>

                        {/* DELETE */}
                        <button
                          onClick={() => deleteClient(client.id)}
                          className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400 hover:bg-red-500/20"
                        >
                          <Trash2 size={16} />
                        </button>

                      </div>
                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

            <div className="px-6 py-4 text-sm text-gray-400 border-t">
              Showing {filteredClients.length} clients
            </div>

          </div>
        </>
      )}

      {/* VIEW MODAL */}
{selectedClient && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

    <div className="bg-[#140f2d]/80 rounded-[28px] w-[440px] p-5 relative shadow-2xl">

      {/* CLOSE BUTTON */}
      <button
        onClick={() => setSelectedClient(null)}
        className="absolute right-5 top-5 w-8 h-8 rounded-full bg-white/5 text-white hover:bg-white/10 flex items-center justify-center"
      >
        <X size={18} className="text-gray-400" />
      </button>

      {/* TITLE */}
      <div className="mb-5">
        <h2 className="text-[28px] font-bold text-white leading-none">
          {selectedClient.name}
        </h2>

        <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full bg-emerald-500/10 text-[#19a463] text-sm font-semibold">
          Active Client
        </div>
      </div>

      {/* DETAILS GRID */}
      <div className="grid grid-cols-2 gap-3">

        {/* COMPANY */}
        <div className="bg-white/5 text-white rounded-2xl p-3">
          <p className="text-gray-400 text-xs mb-1">
            Company
          </p>

          <p className="text-white text-sm font-semibold">
            {selectedClient.companyName || "-"}
          </p>
        </div>

        {/* PHONE */}
        <div className="bg-white/5 text-white rounded-2xl p-3">
          <p className="text-gray-400 text-xs mb-1">
            Contact
          </p>

          <p className="text-white text-sm font-semibold">
            {selectedClient.phone || "-"}
          </p>
        </div>

        {/* EMAIL */}
        <div className="bg-white/5 text-white rounded-2xl p-3">
          <p className="text-gray-400 text-xs mb-1">
            Email
          </p>

          <p className="text-white text-sm font-semibold break-all">
            {selectedClient.email || "-"}
          </p>
        </div>

        {/* INDUSTRY */}
        <div className="bg-white/5 text-white rounded-2xl p-3">
          <p className="text-gray-400 text-xs mb-1">
            Industry
          </p>

          <p className="text-white text-sm font-semibold">
            {selectedClient.industry || "-"}
          </p>
        </div>

        {/* CATEGORY */}
        <div className="bg-white/5 text-white rounded-2xl p-3">
          <p className="text-gray-400 text-xs mb-1">
            Category
          </p>

          <p className="text-white text-sm font-semibold">
            {selectedClient.category || "-"}
          </p>
        </div>

        {/* REVENUE */}
        <div className="bg-white/5 text-white rounded-2xl p-3">
          <p className="text-gray-400 text-xs mb-1">
            Revenue
          </p>

          <p className="text-white text-sm font-semibold">
            ₹{selectedClient.annualRevenue || 0}
          </p>
        </div>

        {/* CITY */}
        <div className="bg-white/5 text-white rounded-2xl p-3">
          <p className="text-gray-400 text-xs mb-1">
            City
          </p>

          <p className="text-white text-sm font-semibold">
            {selectedClient.city || "-"}
          </p>
        </div>

        {/* STATE */}
        <div className="bg-white/5 text-white rounded-2xl p-3">
          <p className="text-gray-400 text-xs mb-1">
            State
          </p>

          <p className="text-white text-sm font-semibold">
            {selectedClient.state || "-"}
          </p>
        </div>

        {/* COUNTRY */}
        <div className="bg-white/5 text-white rounded-2xl p-3">
          <p className="text-gray-400 text-xs mb-1">
            Country
          </p>

          <p className="text-white text-sm font-semibold">
            {selectedClient.country || "-"}
          </p>
        </div>

        {/* POSTAL */}
        <div className="bg-white/5 text-white rounded-2xl p-3">
          <p className="text-gray-400 text-xs mb-1">
            Postal Code
          </p>

          <p className="text-white text-sm font-semibold">
            {selectedClient.postalCode || "-"}
          </p>
        </div>

      </div>

      {/* ADDRESS */}
      <div className="bg-white/5 text-white rounded-2xl p-3 mt-3">
        <p className="text-gray-400 text-xs mb-1">
          Address
        </p>

        <p className="text-white text-sm font-semibold">
          {selectedClient.address || "-"}
        </p>
      </div>

      {/* NOTES */}
      <div className="bg-white/5 text-white rounded-2xl p-3 mt-3">
        <p className="text-gray-400 text-xs mb-1">
          Notes
        </p>

        <p className="text-white text-sm font-semibold">
          {selectedClient.notes || "-"}
        </p>
      </div>

    </div>
  </div>
)}
    </div>
  );
};

export default ClientList;

