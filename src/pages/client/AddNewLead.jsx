// src/pages/client/AddNewLead.jsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiInterceptor from "../../interceptors/interceptors";

import {
  ArrowLeft,
  ChevronRight,
  UserPlus,
} from "lucide-react";

const AddNewLead = () => {

  const navigate = useNavigate();

  const [lead, setLead] = useState({

    // BASIC

    leadName: "",
    company: "",
    designation: "",
    department: "",

    // CONTACT

    email: "",
    altEmail: "",
    mobile: "",
    linkedIn: "",
    companyWebsite: "",

    // COMPANY

    industry: "Technology",
    companySize: "1-10",
    annualRevenue: "",

    // QUALIFICATION

    leadSource: "",
    campaign: "None",
    leadScore: "4234",
    estimatedValue: "-6",
    priority: "High",
    expectedClose: "",

    // ASSIGNMENT

    assignTo: "Arjun Kumar",
    pipelineStage: "New",

    // PRODUCT

    productInterest: [],

    // EXTRA

    budgetRange: "< 1L",
    decisionTimeline: "Immediate",
    competitorInvolved: "None",

    // NOTES

    painPoints: "",
    internalNotes: "",

    // FOLLOWUP

    nextAction: "Send Email",
    followUpDate: "",
    reminder: "None",

    // FILE

    attachment: null,
  });

  // ================= CHANGE =================

  const handleChange = (e) => {

    const {
      name,
      value,
    } = e.target;

    setLead({
      ...lead,
      [name]: value,
    });
  };

  // ================= CHECKBOX =================

  const handleCheckboxChange =
    (product) => {

      const updatedProducts =
        lead.productInterest.includes(product)
          ? lead.productInterest.filter(
              (item) =>
                item !== product
            )
          : [
              ...lead.productInterest,
              product,
            ];

      setLead({
        ...lead,
        productInterest:
          updatedProducts,
      });
    };

  // ================= FILE =================

  const handleFileChange =
    (e) => {

      setLead({
        ...lead,
        attachment:
          e.target.files[0],
      });
    };

  // ================= SUBMIT =================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await apiInterceptor.post("/leads/create", lead);
      alert("Lead Added Successfully");
      navigate("/dashboard/client/leads");
    } catch (error) {
      console.error("Error adding lead:", error);
      alert("Failed to add lead. Please try again.");
    }
  };

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
              "/dashboard/client/leads"
            )
          }
        >
          Leads
        </button>

        <ChevronRight size={12} />

        <span className="text-white font-semibold">
          Add Lead
        </span>

      </div>

      {/* ================= HEADER ================= */}

      <div className="flex items-center gap-4 mb-6">

        <button
          onClick={() =>
            navigate(
              "/dashboard/client/leads"
            )
          }
          className="w-10 h-10 rounded-xl bg-[#140f2d]/80 border border-white/10 flex items-center justify-center shadow-sm"
        >

          <ArrowLeft size={16} />

        </button>

        <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center">

          <UserPlus
            size={22}
            className="text-[#7c3aed]"
          />

        </div>

        <div>

          <h2 className="text-xl font-bold text-white">
            Add New Lead
          </h2>

          <p className="text-sm text-gray-400">
            Lead ID: LDX-2024-0325 will be auto-assigned
          </p>

        </div>

      </div>

      {/* ================= FORM ================= */}

      <div className="bg-[#140f2d]/80 rounded-3xl p-6 shadow-sm border border-white/10">

        <form
          onSubmit={handleSubmit}
        >

          {/* ================= LEAD INFORMATION ================= */}

          <h2 className="text-[15px] font-bold text-white border-b pb-3 mb-5">
            Lead Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* LEAD NAME */}

            <div>

              <label className="block text-xs font-semibold text-purple-300 mb-1">
                Lead Name *
              </label>

              <input
                type="text"
                name="leadName"
                value={lead.leadName}
                onChange={handleChange}
                placeholder="Full name"
                className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white"
              />

            </div>

            {/* COMPANY */}

            <div>

              <label className="block text-xs font-semibold text-purple-300 mb-1">
                Company *
              </label>

              <input
                type="text"
                name="company"
                value={lead.company}
                onChange={handleChange}
                placeholder="Company name"
                className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white"
              />

            </div>

            {/* DESIGNATION */}

            <div>

              <label className="block text-xs font-semibold text-purple-300 mb-1">
                Designation
              </label>

              <input
                type="text"
                name="designation"
                value={lead.designation}
                onChange={handleChange}
                placeholder="CEO, Manager..."
                className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white"
              />

            </div>

            {/* DEPARTMENT */}

            <div>

              <label className="block text-xs font-semibold text-purple-300 mb-1">
                Department
              </label>

              <input
                type="text"
                name="department"
                value={lead.department}
                onChange={handleChange}
                placeholder="Procurement, IT..."
                className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white"
              />

            </div>

            {/* EMAIL */}

            <div>

              <label className="block text-xs font-semibold text-purple-300 mb-1">
                Email *
              </label>

              <input
                type="email"
                name="email"
                value={lead.email}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white"
              />

            </div>

            {/* ALT EMAIL */}

            <div>

              <label className="block text-xs font-semibold text-purple-300 mb-1">
                Alt Email
              </label>

              <input
                type="email"
                name="altEmail"
                value={lead.altEmail}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white"
              />

            </div>

            {/* MOBILE */}

            <div>

              <label className="block text-xs font-semibold text-purple-300 mb-1">
                Mobile *
              </label>

              <input
                type="text"
                name="mobile"
                value={lead.mobile}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white"
              />

            </div>

            {/* LINKEDIN */}

            <div>

              <label className="block text-xs font-semibold text-purple-300 mb-1">
                LinkedIn URL
              </label>

              <input
                type="text"
                name="linkedIn"
                value={lead.linkedIn}
                onChange={handleChange}
                placeholder="linkedin.com/in/..."
                className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white"
              />

            </div>

            {/* WEBSITE */}

            <div>

              <label className="block text-xs font-semibold text-purple-300 mb-1">
                Company Website
              </label>

              <input
                type="text"
                name="companyWebsite"
                value={lead.companyWebsite}
                onChange={handleChange}
                placeholder="https://"
                className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white"
              />

            </div>

            {/* INDUSTRY */}

            <div>

              <label className="block text-xs font-semibold text-purple-300 mb-1">
                Industry
              </label>

              <select
                name="industry"
                value={lead.industry}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white"
              >

                <option className="bg-[#140f2d] text-white">
                  Technology
                </option>

                <option className="bg-[#140f2d] text-white">
                  Healthcare
                </option>

                <option className="bg-[#140f2d] text-white">
                  Finance
                </option>

              </select>

            </div>

            {/* COMPANY SIZE */}

            <div>

              <label className="block text-xs font-semibold text-purple-300 mb-1">
                Company Size
              </label>

              <select
                name="companySize"
                value={lead.companySize}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white"
              >

                <option className="bg-[#140f2d] text-white">
                  1-10
                </option>

                <option className="bg-[#140f2d] text-white">
                  11-50
                </option>

                <option className="bg-[#140f2d] text-white">
                  51-100
                </option>

              </select>

            </div>

            {/* REVENUE */}

            <div>

              <label className="block text-xs font-semibold text-purple-300 mb-1">
                Annual Revenue (₹)
              </label>

              <input
                type="number"
                name="annualRevenue"
                value={lead.annualRevenue}
                onChange={handleChange}
                placeholder="Estimated company revenue"
                className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white"
              />

            </div>

          </div>

          {/* ================= LEAD QUALIFICATION ================= */}

          <h2 className="text-[15px] font-bold text-white border-b pb-3 mb-5 mt-8">
            Lead Qualification
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* LEAD SOURCE */}

            <div>

              <label className="block text-xs font-semibold text-purple-300 mb-1">
                Lead Source *
              </label>

              <select
                name="leadSource"
                value={lead.leadSource}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white"
              >

                <option value="" className="bg-[#140f2d] text-white">
                  Select...
                </option>

                <option className="bg-[#140f2d] text-white">
                  Website
                </option>

                <option className="bg-[#140f2d] text-white">
                  LinkedIn
                </option>

                <option className="bg-[#140f2d] text-white">
                  Referral
                </option>

              </select>

            </div>

            {/* CAMPAIGN */}

            <div>

              <label className="block text-xs font-semibold text-purple-300 mb-1">
                Campaign
              </label>

              <select
                name="campaign"
                value={lead.campaign}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white"
              >

                <option className="bg-[#140f2d] text-white">
                  None
                </option>

                <option className="bg-[#140f2d] text-white">
                  Summer Campaign
                </option>

              </select>

            </div>

            {/* LEAD SCORE */}

            <div>

              <label className="block text-xs font-semibold text-purple-300 mb-1">
                Lead Score (0-100)
              </label>

              <input
                type="number"
                name="leadScore"
                value={lead.leadScore}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white"
              />

            </div>

            {/* ESTIMATED VALUE */}

            <div>

              <label className="block text-xs font-semibold text-purple-300 mb-1">
                Estimated Value (₹)
              </label>

              <input
                type="number"
                name="estimatedValue"
                value={lead.estimatedValue}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white"
              />

            </div>

            {/* PRIORITY */}

            <div>

              <label className="block text-xs font-semibold text-purple-300 mb-1">
                Priority
              </label>

              <select
                name="priority"
                value={lead.priority}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white"
              >

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

            </div>

            {/* EXPECTED CLOSE */}

            <div>

              <label className="block text-xs font-semibold text-purple-300 mb-1">
                Expected Close
              </label>

              <input
                type="date"
                name="expectedClose"
                value={lead.expectedClose}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white"
              />

            </div>

            {/* ASSIGN TO */}

            <div>

              <label className="block text-xs font-semibold text-purple-300 mb-1">
                Assign To
              </label>

              <input
                list="assignToList"
                name="assignTo"
                value={lead.assignTo}
                onChange={handleChange}
                placeholder="Select or type..."
                className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white text-sm outline-none focus:ring-2 focus:ring-amber-500/30"
              />
              <datalist id="assignToList">
                <option value="Arjun Kumar" />
                <option value="Mano" />
                <option value="Admin" />
              </datalist>
            </div>

            {/* PIPELINE */}

            <div>

              <label className="block text-xs font-semibold text-purple-300 mb-1">
                Pipeline Stage
              </label>

              <select
                name="pipelineStage"
                value={lead.pipelineStage}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white"
              >

                <option className="bg-[#140f2d] text-white">
                  New
                </option>

                <option className="bg-[#140f2d] text-white">
                  Qualified
                </option>

                <option className="bg-[#140f2d] text-white">
                  Proposal
                </option>

              </select>

            </div>

          </div>

          {/* PRODUCT INTEREST */}

          <div className="mt-5">

            <label className="block text-xs font-semibold text-purple-300 mb-2">
              Product Interest
            </label>

            <input
              type="text"
              name="productInterest"
              value={lead.productInterest}
              onChange={handleChange}
              placeholder="Add Here..."
              className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white"
            />

          </div>
          {/* EXTRA FIELDS */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">

            <div>

              <label className="block text-xs font-semibold text-purple-300 mb-1">
                Budget Range (₹)
              </label>

              <select
                name="budgetRange"
                value={lead.budgetRange}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white"
              >

                <option className="bg-[#140f2d] text-white">
                  {"< 1L"}
                </option>

                <option className="bg-[#140f2d] text-white">
                  1L - 5L
                </option>

                <option className="bg-[#140f2d] text-white">
                  5L - 10L
                </option>

              </select>

            </div>

            <div>

              <label className="block text-xs font-semibold text-purple-300 mb-1">
                Decision Timeline
              </label>

              <select
                name="decisionTimeline"
                value={lead.decisionTimeline}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white"
              >

                <option className="bg-[#140f2d] text-white">
                  Immediate
                </option>

                <option className="bg-[#140f2d] text-white">
                  1 Month
                </option>

                <option className="bg-[#140f2d] text-white">
                  3 Months
                </option>

              </select>

            </div>

            <div>

              <label className="block text-xs font-semibold text-purple-300 mb-1">
                Competitor Involved?
              </label>

              <select
                name="competitorInvolved"
                value={lead.competitorInvolved}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white"
              >

                <option className="bg-[#140f2d] text-white">
                  None
                </option>

                <option className="bg-[#140f2d] text-white">
                  SAP
                </option>

                <option className="bg-[#140f2d] text-white">
                  Zoho
                </option>

              </select>

            </div>

          </div>

          {/* PAIN POINTS */}

          <div className="mt-5">

            <label className="block text-xs font-semibold text-purple-300 mb-1">
              Pain Points / Requirements
            </label>

            <textarea
              name="painPoints"
              value={lead.painPoints}
              onChange={handleChange}
              rows="4"
              placeholder="What problems is this lead trying to solve?"
              className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white"
            />

          </div>

          {/* NOTES */}

          <div className="mt-5">

            <label className="block text-xs font-semibold text-purple-300 mb-1">
              Internal Notes
            </label>

            <textarea
              name="internalNotes"
              value={lead.internalNotes}
              onChange={handleChange}
              rows="4"
              placeholder="Private notes for team..."
              className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white"
            />

          </div>

          {/* ================= FOLLOW UP ================= */}

          <h2 className="text-[15px] font-bold text-white border-b pb-3 mb-5 mt-8">
            Follow-up Setup
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            <div>

              <label className="block text-xs font-semibold text-purple-300 mb-1">
                Next Action
              </label>

              <select
                name="nextAction"
                value={lead.nextAction}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white"
              >

                <option className="bg-[#140f2d] text-white">
                  Send Email
                </option>

                <option className="bg-[#140f2d] text-white">
                  Call
                </option>

                <option className="bg-[#140f2d] text-white">
                  Meeting
                </option>

              </select>

            </div>

            <div>

              <label className="block text-xs font-semibold text-purple-300 mb-1">
                Follow-up Date
              </label>

              <input
                type="date"
                name="followUpDate"
                value={lead.followUpDate}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white"
              />

            </div>

            <div>

              <label className="block text-xs font-semibold text-purple-300 mb-1">
                Reminder
              </label>

              <select
                name="reminder"
                value={lead.reminder}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white"
              >

                <option className="bg-[#140f2d] text-white">
                  None
                </option>

                <option className="bg-[#140f2d] text-white">
                  1 Hour Before
                </option>

              </select>

            </div>

            <div>

              <label className="block text-xs font-semibold text-purple-300 mb-1">
                Upload Attachment
              </label>

              <input
                type="file"
                onChange={handleFileChange}
                className="w-full px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-white"
              />

            </div>

          </div>

          {/* BUTTONS */}

          <div className="flex justify-end gap-3 mt-8">

            <button
              type="submit"
              className="bg-blue-500 hover:bg-[#1D4ED8] text-white px-6 py-3 rounded-xl text-sm font-semibold shadow"
            >
              ✓ Save Lead
            </button>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/dashboard/client/leads"
                )
              }
              className="px-6 py-3 rounded-xl border border-white/10 bg-[#140f2d]/80 text-gray-300 text-sm font-semibold shadow-sm"
            >
              Cancel
            </button>

          </div>

        </form>

      </div>

    </div>
  );
};

export default AddNewLead;

