// src/pages/client/CreateOpportunity.jsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiInterceptor from "../../interceptors/interceptors";

import {
  ArrowLeft,
  ChevronRight,
  BriefcaseBusiness,
} from "lucide-react";

const AddNewOpportunity = () => {

  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [leads, setLeads] = useState([]);
  const [opportunity, setOpportunity] = useState({
    opportunityName: "",
    clientId: "",
    leadId: "",
    status: "OPEN",
    amount: "",
    probability: "",
    expectedCloseDate: "",
    actualCloseDate: "",
    stage: "",
    assignedTo: "",
    description: "",
    notes: "",
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    apiInterceptor.get("/clients")
      .then(res => setClients(res.data || []))
      .catch(() => setClients([]));

    apiInterceptor.get("/leads")
      .then(res => setLeads(res.data.leads || []))
      .catch(() => setLeads([]));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (errorMessage) setErrorMessage("");

    setOpportunity({
      ...opportunity,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!opportunity.opportunityName || !opportunity.opportunityName.trim()) {
      const err = "Opportunity Name is required.";
      setErrorMessage(err);
      alert(err);
      return;
    }

    // Clean payload to prevent empty strings from causing database type mismatch
    const payload = {
      ...opportunity,
      opportunityName: opportunity.opportunityName.trim(),
      clientId: opportunity.clientId || null,
      leadId: opportunity.leadId || null,
      amount: opportunity.amount !== "" && !isNaN(opportunity.amount) ? Number(opportunity.amount) : null,
      probability: opportunity.probability !== "" && !isNaN(opportunity.probability) ? Number(opportunity.probability) : null,
      expectedCloseDate: opportunity.expectedCloseDate || null,
      actualCloseDate: opportunity.actualCloseDate || null,
      stage: opportunity.stage?.trim() || null,
      assignedTo: opportunity.assignedTo?.trim() || null,
      description: opportunity.description?.trim() || null,
      notes: opportunity.notes?.trim() || null,
    };

    setSubmitting(true);
    try {
      await apiInterceptor.post("/opportunities/create", payload);
      setSuccessMessage("Opportunity Created Successfully");
      alert("Opportunity Created Successfully");
      navigate("/dashboard/client/opportunities/list");
    } catch (error) {
      console.error("Error creating opportunity:", error);
      const actualError =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to create opportunity. Please check the provided details and try again.";
      setErrorMessage(actualError);
      alert(`Failed to create opportunity: ${actualError}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-purple-300 mb-4 font-medium">

        <button
          onClick={() =>
            navigate("/dashboard/client")
          }
          className="hover:text-purple-300"
        >
          Client Management
        </button>

        <ChevronRight
          size={12}
          className="text-gray-300"
        />

        <button
          onClick={() =>
            navigate(
              "/dashboard/client/opportunities"
            )
          }
          className="hover:text-purple-300"
        >
          Opportunities
        </button>

        <ChevronRight
          size={12}
          className="text-gray-300"
        />

        <span className="text-white font-semibold">
  Add New Opportunity
</span>

      </div>

      

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">

        <button
          onClick={() =>
            navigate(
              "/dashboard/client/opportunities"
            )
          }
          className="w-10 h-10 rounded-xl bg-[#140f2d]/80 border border-white/10 flex items-center justify-center text-purple-300 shadow-sm"
        >
          <ArrowLeft size={16} />
        </button>

        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm"
          style={{ background: "rgba(139,92,246,0.12)" }}
        >
          <BriefcaseBusiness
            size={22}
            style={{ color: "#7c3aed" }}
          />
        </div>

        <div className="flex-1">

          <h2 className="text-xl font-bold text-white">
  Add New Opportunity
</h2>

          <p className="text-sm text-gray-400">
            Create and manage opportunity details
          </p>

        </div>

      </div>

      {/* FORM */}
      <div className="bg-[#140f2d]/80 rounded-3xl p-6 shadow-sm">

        {errorMessage && (
          <div className="mb-5 p-4 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-red-200">Error:</span>
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage("")}
              className="text-red-400 hover:text-red-200 font-bold ml-3 text-lg leading-none"
            >
              &times;
            </button>
          </div>
        )}

        {successMessage && (
          <div className="mb-5 p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-sm flex items-center justify-between">
            <span>{successMessage}</span>
          </div>
        )}

        <h2 className="text-[16px] font-semibold text-white mb-5 border-b pb-3">
          Opportunity Information
        </h2>

        <form onSubmit={handleSubmit}>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

            {/* OPPORTUNITY NAME */}
            <div>
              <label className="block text-xs font-semibold text-purple-300 mb-1">
                Opportunity Name *
              </label>

              <input
                type="text"
                name="opportunityName"
                value={opportunity.opportunityName}
                onChange={handleChange}
                placeholder="Opportunity name"
                required
                className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white text-sm"
              />
            </div>

           {/* CLIENT DROPDOWN */}
            <div>
              <label className="block text-xs font-semibold text-purple-300 mb-1">
                Client *
              </label>

              <select
                name="clientId"
                value={opportunity.clientId}
                onChange={handleChange}
                required
                className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white text-sm"
              >
                <option value="" className="bg-[#140f2d] text-white">
                  Select Client
                </option>

                {clients.map((client, index) => (
                  <option
                    key={index}
                    value={client.name}
                  >
                    {client.name} {client.companyName ? `(${client.companyName})` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* LEAD DROPDOWN */}
            <div>
              <label className="block text-xs font-semibold text-purple-300 mb-1">
                Lead
              </label>

              <select
                name="leadId"
                value={opportunity.leadId}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white text-sm"
              >
                <option value="" className="bg-[#140f2d] text-white">
                  Select Lead
                </option>

                {leads.map((lead) => (
                  <option
                    key={lead.id}
                    value={lead.id}
                  >
                    {lead.leadName} ({lead.id})
                  </option>
                ))}
              </select>
            </div>

            {/* STATUS */}
            <div>
              <label className="block text-xs font-semibold text-purple-300 mb-1">
                Status
              </label>

              <select
                name="status"
                value={opportunity.status}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white text-sm"
              >
                <option value="OPEN">
                  OPEN
                </option>

                <option value="IN_PROGRESS">
                  IN PROGRESS
                </option>

                <option value="WON">
                  WON
                </option>

                <option value="LOST">
                  LOST
                </option>

                <option value="CLOSED">
                  CLOSED
                </option>

              </select>
            </div>

            {/* AMOUNT */}
            <div>
              <label className="block text-xs font-semibold text-purple-300 mb-1">
                Amount *
              </label>

              <input
                type="number"
                name="amount"
                value={opportunity.amount}
                onChange={handleChange}
                placeholder="0"
                required
                className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white text-sm"
              />
            </div>

            {/* PROBABILITY */}
            <div>
              <label className="block text-xs font-semibold text-purple-300 mb-1">
                Probability %
              </label>

              <input
                type="number"
                name="probability"
                value={opportunity.probability}
                onChange={handleChange}
                placeholder="0 - 100"
                className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white text-sm"
              />
            </div>

            {/* EXPECTED CLOSE DATE */}
            <div>
              <label className="block text-xs font-semibold text-purple-300 mb-1">
                Expected Close Date
              </label>

              <input
                type="date"
                name="expectedCloseDate"
                value={opportunity.expectedCloseDate}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white text-sm"
              />
            </div>

            {/* ACTUAL CLOSE DATE */}
            <div>
              <label className="block text-xs font-semibold text-purple-300 mb-1">
                Actual Close Date
              </label>

              <input
                type="date"
                name="actualCloseDate"
                value={opportunity.actualCloseDate}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white text-sm"
              />
            </div>

            {/* STAGE */}
            <div>
              <label className="block text-xs font-semibold text-purple-300 mb-1">
                Stage
              </label>

              <input
                type="text"
                name="stage"
                value={opportunity.stage}
                onChange={handleChange}
                placeholder="Negotiation"
                className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white text-sm"
              />
            </div>

            {/* ASSIGNED TO */}
            <div>
              <label className="block text-xs font-semibold text-purple-300 mb-1">
                Assigned To
              </label>

              <input
                type="text"
                name="assignedTo"
                value={opportunity.assignedTo}
                onChange={handleChange}
                placeholder="Assigned person"
                className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white text-sm"
              />
            </div>

          </div>

          {/* DESCRIPTION */}
          <div className="mt-5">

            <label className="block text-xs font-semibold text-purple-300 mb-1">
              Description
            </label>

            <textarea
              name="description"
              value={opportunity.description}
              onChange={handleChange}
              rows="4"
              placeholder="Opportunity description"
              className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white text-sm"
            />

          </div>

          {/* NOTES */}
          <div className="mt-5">

            <label className="block text-xs font-semibold text-purple-300 mb-1">
              Notes
            </label>

            <textarea
              name="notes"
              value={opportunity.notes}
              onChange={handleChange}
              rows="4"
              placeholder="Additional notes"
              className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white text-sm"
            />

          </div>

          {/* BUTTON */}
          <div className="flex justify-end mt-6">

            <button
              type="submit"
              disabled={submitting}
              className={`px-6 py-3 rounded-xl text-white text-sm font-semibold shadow-md transition-opacity ${
                submitting ? "opacity-60 cursor-not-allowed" : "hover:opacity-95"
              }`}
              style={{
                background:
                  "linear-gradient(135deg,#7c3aed,#8b5cf6)",
              }}
            >
              {submitting ? "Adding Opportunity..." : "Add Opportunity"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
};

export default AddNewOpportunity;

