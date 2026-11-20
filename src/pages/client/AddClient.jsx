// src/pages/client/AddClient.jsx
import React, { useState, useEffect } from "react";
import apiInterceptor from "../../interceptors/interceptors";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  UserPlus,
  ChevronRight,
} from "lucide-react";

const AddClient = () => {
   const navigate = useNavigate();
  const [client, setClient] = useState({
    name: "",
    email: "",
    phone: "",
    companyName: "",
    industry: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    category: "",
    annualRevenue: "",
    notes: "",
  });
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await apiInterceptor.get("/client-categories/active");
        const data = res.data?.data || res.data;
        if (Array.isArray(data)) {
          setCategories(data);
        }
      } catch (err) {
        console.error("Failed to load client categories:", err);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setClient({
      ...client,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!client.name || !client.name.trim()) {
      alert("Client name is required.");
      return;
    }

    try {
      await apiInterceptor.post("/clients", client);
      alert("Client added successfully!");
      setClient({
        name: "",
        email: "",
        phone: "",
        companyName: "",
        industry: "",
        address: "",
        city: "",
        state: "",
        postalCode: "",
        country: "",
        category: "",
        annualRevenue: "",
        notes: "",
      });
      navigate("/dashboard/client/clients/list");
    } catch (error) {
      console.error("Error adding client:", error);
      const msg = error?.response?.data?.error || error?.response?.data?.message || "Failed to add client.";
      alert(msg);
    }
  };

  return (
    <div >

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
        Add Client
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
        style={{ background: 'rgba(255,243,214,0.14)' }}
      >
        <UserPlus size={22} style={{ color: '#f59e0b' }} />
      </div>

      {/* TITLE */}
      <div className="flex-1">

        <h2 className="text-xl font-bold text-white">
          Add Client
        </h2>

        <p className="text-sm text-gray-400">
          Register a new client
        </p>

      </div>

    </div>

      <form onSubmit={handleSubmit}>

        {/* BASIC INFORMATION */}
        <div className="bg-[#140f2d]/80 rounded-3xl shadow-sm p-6 mb-6">

          <h3 className="text-sm font-bold text-purple-300 mb-4 pb-2 border-b border-white/10">
            Basic Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

            <div>
              <label className="block text-xs font-semibold text-purple-300 mb-1">
                Client Name *
              </label>

              <input
                type="text"
                name="name"
                value={client.name}
                onChange={handleChange}
                placeholder="Enter client name"
                className="w-full px-3 py-2.5 rounded-xl border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 bg-white/5 text-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-purple-300 mb-1">
                Company Name
              </label>

              <input
                type="text"
                name="companyName"
                value={client.companyName}
                onChange={handleChange}
                placeholder="Company name"
                className="w-full px-3 py-2.5 rounded-xl border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 bg-white/5 text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-purple-300 mb-1">
                Category
              </label>

              <select
                name="category"
                value={client.category}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 bg-white/5 text-white"
              >
                <option value="" className="bg-[#140f2d] text-white">Select Category</option>
                {categories.length > 0 ? (
                  categories.map(c => (
                    <option key={c.id || c.name} value={c.name} className="bg-[#140f2d] text-white">
                      {c.name}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="Premium" className="bg-[#140f2d] text-white">Premium</option>
                    <option value="Regular" className="bg-[#140f2d] text-white">Regular</option>
                    <option value="VIP" className="bg-[#140f2d] text-white">VIP</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-purple-300 mb-1">
                Industry
              </label>

              <input
                type="text"
                name="industry"
                value={client.industry}
                onChange={handleChange}
                placeholder="Industry"
                className="w-full px-3 py-2.5 rounded-xl border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 bg-white/5 text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-purple-300 mb-1">
                Email *
              </label>

              <input
                type="email"
                name="email"
                value={client.email}
                onChange={handleChange}
                placeholder="client@email.com"
                className="w-full px-3 py-2.5 rounded-xl border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 bg-white/5 text-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-purple-300 mb-1">
                Phone *
              </label>

              <input
                type="text"
                name="phone"
                value={client.phone}
                onChange={handleChange}
                placeholder="+91 XXXXX XXXXX"
                className="w-full px-3 py-2.5 rounded-xl border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 bg-white/5 text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-purple-300 mb-1">
                Annual Revenue
              </label>

              <input
                type="number"
                name="annualRevenue"
                value={client.annualRevenue}
                onChange={handleChange}
                placeholder="0.00"
                className="w-full px-3 py-2.5 rounded-xl border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 bg-white/5 text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-purple-300 mb-1">
                Country
              </label>

              <input
                type="text"
                name="country"
                value={client.country}
                onChange={handleChange}
                placeholder="Country"
                className="w-full px-3 py-2.5 rounded-xl border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 bg-white/5 text-white"
              />
            </div>

          </div>
        </div>

        {/* ADDRESS DETAILS */}
        <div className="bg-[#140f2d]/80 rounded-3xl shadow-sm p-6 mb-6">

          <h3 className="text-sm font-bold text-purple-300 mb-4 pb-2 border-b border-white/10">
            Address Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

            <div>
              <label className="block text-xs font-semibold text-purple-300 mb-1">
                City
              </label>

              <input
                type="text"
                name="city"
                value={client.city}
                onChange={handleChange}
                placeholder="City"
                className="w-full px-3 py-2.5 rounded-xl border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 bg-white/5 text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-purple-300 mb-1">
                State
              </label>

              <input
                type="text"
                name="state"
                value={client.state}
                onChange={handleChange}
                placeholder="State"
                className="w-full px-3 py-2.5 rounded-xl border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 bg-white/5 text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-purple-300 mb-1">
                Postal Code
              </label>

              <input
                type="text"
                name="postalCode"
                value={client.postalCode}
                onChange={handleChange}
                placeholder="Postal code"
                className="w-full px-3 py-2.5 rounded-xl border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 bg-white/5 text-white"
              />
            </div>

          </div>

          <div className="mt-5">
            <label className="block text-xs font-semibold text-purple-300 mb-1">
              Address
            </label>

            <textarea
              name="address"
              value={client.address}
              onChange={handleChange}
              placeholder="Street, Area, City"
              rows="4"
              className="w-full px-3 py-2.5 rounded-xl border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 bg-white/5 text-white"
            />
          </div>
        </div>

        {/* NOTES */}
        <div className="bg-[#140f2d]/80 rounded-3xl shadow-sm p-6 mb-6">

          <h3 className="text-sm font-bold text-purple-300 mb-4 pb-2 border-b border-white/10">
            Additional Information
          </h3>

          <div className="mb-4">
              <label className="block text-xs font-semibold text-purple-300 mb-1">
                Notes
              </label>

            <textarea
              name="notes"
              value={client.notes}
              onChange={handleChange}
              rows="3"
              placeholder="Internal notes about this client"
              className="w-full px-3 py-2.5 rounded-xl border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 bg-white/5 text-white resize-none"
            />
          </div>
        </div>

        {/* BUTTON */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-[#1f3b5b] hover:bg-[#16304d] text-white px-8 py-3 rounded-xl font-semibold shadow-md"
          >
            Save Client
          </button>
        </div>

      </form>
    </div>
  );
};

export default AddClient;

