// src/pages/client/AddQuotation.jsx

import React, {
  useState,
  useEffect,
} from "react";
import apiInterceptor from "../../interceptors/interceptors";

import {
  ArrowLeft,
  ChevronRight,
  Plus,
  Eye,
  Save,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

const AddQuotation = () => {

  const navigate = useNavigate();

  // ================= STATE =================

  const [items,
    setItems] =
    useState([
      {
        product: "",
        hsn: "",
        qty: 1,
        unit: "Nos",
        rate: 0,
        discount: 0,
        tax: 18,
      },
    ]);

  const [quotation, setQuotation] = useState({
    clientId: "",
    opportunityId: "",
    quoteDate: "",
    validUntil: "",
    paymentTerms: "",
    currency: "INR",
    terms: "",
    specialNotes: "",
  });

  const [clients, setClients] = useState([]);
  const [opportunities, setOpportunities] = useState([]);

  useEffect(() => {
    // Fetch clients from localStorage (backend client module not built yet)
    const storedClients = JSON.parse(localStorage.getItem("clients")) || [];
    setClients(storedClients);

    // Fetch opportunities from API
    apiInterceptor.get("/opportunities")
      .then(res => setOpportunities(res.data.opportunities || res.data || []))
      .catch(err => console.error(err));
  }, []);

  // ================= ADD ITEM =================

  const addLineItem =
    () => {

      setItems([
        ...items,
        {
          product: "",
          hsn: "",
          qty: 1,
          unit: "Nos",
          rate: 0,
          discount: 0,
          tax: 18,
        },
      ]);
    };

  // ================= CHANGE =================

  const handleItemChange =
    (
      index,
      field,
      value
    ) => {

      const updated =
        [...items];

      updated[index][field] =
        value;

      setItems(updated);
    };

  // ================= CALCULATIONS =================

  const subtotal =
    items.reduce(
      (acc, item) =>
        acc +
        item.qty *
          item.rate,
      0
    );

  const totalDiscount =
    items.reduce(
      (acc, item) =>
        acc +
        Number(
          item.discount
        ),
      0
    );

  const taxAmount =
    items.reduce(
      (acc, item) =>
        acc +
        (item.qty *
          item.rate *
          item.tax) /
          100,
      0
    );

  const grandTotal =
    subtotal -
    totalDiscount +
    taxAmount;

  const handleQuotationChange = (e) => {
    const { name, value } = e.target;
    setQuotation({ ...quotation, [name]: value });
  };

  const handleSave = async (status = "Sent") => {
    try {
      const payload = {
        ...quotation,
        status,
        subtotal,
        totalDiscount,
        taxAmount,
        grandTotal,
        items,
        quoteDate: quotation.quoteDate || null,
        validUntil: quotation.validUntil || null,
      };
      await apiInterceptor.post("/quotation", payload);
      alert("Quotation Saved Successfully!");
      navigate("/dashboard/client/opportunities/quotations");
    } catch (error) {
      console.error("Save Error:", error);
      alert("Error saving quotation.");
    }
  };

  return (

    <div >

      {/* ================= BREADCRUMB ================= */}

      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">

        <span
          className="cursor-pointer hover:text-purple-300"
          onClick={() =>
            navigate(
              "/dashboard/client/opportunities/quotations"
            )
          }
        >
          Client Management
        </span>

        <ChevronRight size={14} />

        <span className="font-medium text-white">
          Add Quotation
        </span>

      </div>

      {/* ================= HEADER ================= */}

      <div className="flex items-center justify-between mb-6">

        {/* LEFT */}

        <div className="flex items-center gap-4">

          {/* BACK */}

          <button
            onClick={() =>
              navigate(
                "/dashboard/client/opportunities/quotations"
              )
            }

            className="w-11 h-11 rounded-2xl bg-[#140f2d]/80 border border-white/10 flex items-center justify-center"
            
          >

            <ArrowLeft
              size={16}
              className="text-purple-300"
            />

          </button>

          {/* TITLE */}

          <div>

            <h2 className="text-xl font-bold text-white">
              Quote Builder
            </h2>

            <p className="text-[15px] text-gray-400 mt-1">
              QT-2024-045 · Auto-generated
            </p>

          </div>

        </div>

        {/* BUTTONS */}

        <div className="flex items-center gap-3">

          <button className="px-4 py-2 rounded-xl bg-blue-500/10 text-blue-300 text-sm font-semibold flex items-center gap-2">

            <Eye size={16} />

            Preview

          </button>

          <button className="px-4 py-2 rounded-xl bg-white/5 text-white text-sm font-semibold flex items-center gap-2">

            <Save size={16} />

            Draft

          </button>

        </div>

      </div>

      {/* ================= FORM CARD ================= */}

      <div className="bg-[#140f2d]/80 rounded-[28px] border border-white/10 px-6 py-7 shadow-sm">

        {/* TOP FORM */}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-5">

          {/* CLIENT */}

          <div>

            <label className="block text-sm font-semibold text-purple-300 mb-2">

              Client *

            </label>

            <select className="w-full max-w-[620px] h-[48px] px-4 rounded-2xl bg-[#140f2d]/80 border border-white/10 outline-none">

              <option value="" className="bg-[#140f2d] text-white">
                Select...
              </option>
              {clients.map((client, index) => (
                <option key={index} value={client.name}>
                  {client.name} {client.companyName ? `(${client.companyName})` : ""}
                </option>
              ))}

            </select>

          </div>

          {/* OPPORTUNITY */}

          <div>

            <label className="block text-sm font-semibold text-purple-300 mb-2">

              Opportunity

            </label>

            <select
              name="clientId"
              value={quotation.clientId}
              onChange={handleQuotationChange}
              className="w-full max-w-[620px] h-[48px] px-4 rounded-2xl bg-[#140f2d]/80 border border-white/10 outline-none"
            >

              <option value="" className="bg-[#140f2d] text-white">
                None
              </option>
              {opportunities.map((opp) => (
                <option key={opp.id} value={opp.id}>
                  {opp.opportunityName}
                </option>
              ))}

            </select>

          </div>

          {/* DATE */}

          <div>

            <label className="block text-sm font-semibold text-purple-300 mb-2">

              Quote Date

            </label>

            <input
              type="date"
              name="quoteDate"
              value={quotation.quoteDate}
              onChange={handleQuotationChange}
              className="w-full max-w-[620px] h-[48px] px-4 rounded-2xl bg-[#140f2d]/80 border border-white/10 outline-none"
            />

          </div>

          {/* VALID */}

          <div>

            <label className="block text-sm font-semibold text-purple-300 mb-2">

              Valid Until

            </label>

            <input
              type="date"
              name="validUntil"
              value={quotation.validUntil}
              onChange={handleQuotationChange}
              className="w-full max-w-[620px] h-[48px] px-4 rounded-2xl bg-[#140f2d]/80 border border-white/10 outline-none"
            />

          </div>

          {/* TERMS */}

          <div>

            <label className="block text-sm font-semibold text-purple-300 mb-2">

              Payment Terms

            </label>

            <select
              name="paymentTerms"
              value={quotation.paymentTerms}
              onChange={handleQuotationChange}
              className="w-full max-w-[620px] h-[48px] px-4 rounded-2xl bg-[#140f2d]/80 border border-white/10 outline-none"
            >

              <option value="Immediate">
                Immediate
              </option>

            </select>

          </div>

          {/* CURRENCY */}

          <div>

            <label className="block text-sm font-semibold text-purple-300 mb-2">

              Currency

            </label>

            <select
              name="currency"
              value={quotation.currency}
              onChange={handleQuotationChange}
              className="w-full max-w-[620px] h-[48px] px-4 rounded-2xl bg-[#140f2d]/80 border border-white/10 outline-none"
            >

              <option value="INR">
                INR ₹
              </option>

            </select>

          </div>

        </div>

        {/* ================= LINE ITEMS ================= */}

        <div className="mt-8">

          <h3 className="text-sm font-bold text-purple-300 uppercase tracking-wide mb-4">

            Line Items

          </h3>

          {/* TABLE */}

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead>

                <tr className="border-b border-white/10">

                  <th className="text-left py-3 text-xs text-gray-400">
                    #
                  </th>

                  <th className="text-left py-3 text-xs text-gray-400">
                    Product/Service
                  </th>

                  <th className="text-left py-3 text-xs text-gray-400">
                    HSN/SAC
                  </th>

                  <th className="text-left py-3 text-xs text-gray-400">
                    Qty
                  </th>

                  <th className="text-left py-3 text-xs text-gray-400">
                    Unit
                  </th>

                  <th className="text-left py-3 text-xs text-gray-400">
                    Rate
                  </th>

                  <th className="text-left py-3 text-xs text-gray-400">
                    Discount
                  </th>

                  <th className="text-left py-3 text-xs text-gray-400">
                    Tax
                  </th>

                  <th className="text-left py-3 text-xs text-gray-400">
                    Amount
                  </th>

                </tr>

              </thead>

              <tbody>

                {items.map(
                  (
                    item,
                    index
                  ) => {

                    const amount =
                      item.qty *
                      item.rate;

                    return (

                      <tr
                        key={index}
                        className="border-b border-white/10"
                      >

                        <td className="py-4 text-sm font-semibold text-white">

                          {index + 1}

                        </td>

                        <td className="py-4 pr-3">

                          <input
                            type="text"
                            placeholder="Item name"
                            value={
                              item.product
                            }
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "product",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 rounded-xl bg-[#140f2d]/80 border border-white/10 outline-none"
                          />

                        </td>

                        <td className="py-4 pr-3">

                          <input
                            type="text"
                            placeholder="HSN"
                            value={
                              item.hsn
                            }
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "hsn",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 rounded-xl bg-[#140f2d]/80 border border-white/10 outline-none"
                          />

                        </td>

                        <td className="py-4 pr-3">

                          <input
                            type="number"
                            value={
                              item.qty
                            }
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "qty",
                                Number(
                                  e.target
                                    .value
                                )
                              )
                            }
                            className="w-20 px-3 py-2 rounded-xl bg-[#140f2d]/80 border border-white/10 outline-none"
                          />

                        </td>

                        <td className="py-4 pr-3">

                          <select
                            value={
                              item.unit
                            }
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "unit",
                                e.target
                                  .value
                              )
                            }
                            className="px-3 py-2 rounded-xl bg-[#140f2d]/80 border border-white/10 outline-none"
                          >

                            <option className="bg-[#140f2d] text-white">
                              Nos
                            </option>

                            <option className="bg-[#140f2d] text-white">
                              Pcs
                            </option>

                          </select>

                        </td>

                        <td className="py-4 pr-3">

                          <input
                            type="number"
                            value={
                              item.rate
                            }
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "rate",
                                Number(
                                  e.target
                                    .value
                                )
                              )
                            }
                            className="w-24 px-3 py-2 rounded-xl bg-[#140f2d]/80 border border-white/10 outline-none"
                          />

                        </td>

                        <td className="py-4 pr-3">

                          <input
                            type="number"
                            value={
                              item.discount
                            }
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "discount",
                                Number(
                                  e.target
                                    .value
                                )
                              )
                            }
                            className="w-20 px-3 py-2 rounded-xl bg-[#140f2d]/80 border border-white/10 outline-none"
                          />

                        </td>

                        <td className="py-4 pr-3">

                          <select
                            value={
                              item.tax
                            }
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "tax",
                                Number(
                                  e.target
                                    .value
                                )
                              )
                            }
                            className="px-3 py-2 rounded-xl bg-[#140f2d]/80 border border-white/10 outline-none"
                          >

                            <option value="18">
                              18%
                            </option>

                            <option value="12">
                              12%
                            </option>

                            <option value="5">
                              5%
                            </option>

                          </select>

                        </td>

                        <td className="py-4 text-sm font-bold text-blue-300">

                          ₹{amount}

                        </td>

                      </tr>
                    );
                  }
                )}

              </tbody>

            </table>

          </div>

          {/* ADD */}

          <button
            onClick={
              addLineItem
            }
            className="mt-4 px-4 py-2 rounded-xl bg-blue-500/10 text-blue-300 text-sm font-semibold flex items-center gap-2"
          >

            <Plus size={16} />

            Add Line Item

          </button>

        </div>

        {/* ================= TOTAL ================= */}

        <div className="flex justify-end mt-8">

          <div className="w-full max-w-sm bg-white/5 text-white rounded-3xl p-6 border border-white/10">

            <div className="space-y-3">

              <div className="flex justify-between text-sm">

                <span className="text-gray-400">
                  Subtotal
                </span>

                <span className="font-semibold text-white">

                  ₹{subtotal}

                </span>

              </div>

              <div className="flex justify-between text-sm">

                <span className="text-gray-400">
                  Discount
                </span>

                <span className="font-semibold text-white">

                  ₹{totalDiscount}

                </span>

              </div>

              <div className="flex justify-between text-sm">

                <span className="text-gray-400">
                  GST
                </span>

                <span className="font-semibold text-white">

                  ₹{taxAmount}

                </span>

              </div>

              <div className="border-t border-white/10 pt-3 flex justify-between">

                <span className="text-lg font-bold text-blue-300">
                  Grand Total
                </span>

                <span className="text-lg font-bold text-blue-300">

                  ₹{grandTotal}

                </span>

              </div>

            </div>

          </div>

        </div>

        {/* ================= NOTES ================= */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-8">

          <div>

            <label className="block text-sm font-semibold text-purple-300 mb-2">

              Terms & Conditions

            </label>

            <textarea
              name="terms"
              value={quotation.terms}
              onChange={handleQuotationChange}
              rows="4"
              placeholder="Standard T&C apply..."
              className="w-full px-4 py-3 rounded-2xl bg-[#140f2d]/80 border border-white/10 outline-none resize-none"
            />

          </div>

          <div>

            <label className="block text-sm font-semibold text-purple-300 mb-2">

              Special Notes

            </label>

            <textarea
              name="specialNotes"
              value={quotation.specialNotes}
              onChange={handleQuotationChange}
              rows="4"
              placeholder="For client's reference..."
              className="w-full px-4 py-3 rounded-2xl bg-[#140f2d]/80 border border-white/10 outline-none resize-none"
            />

          </div>

        </div>

        {/* ================= BUTTONS ================= */}

        <div className="flex items-center gap-3 mt-8">

          <button onClick={() => handleSave("Sent")} className="px-5 py-3 rounded-2xl bg-blue-500 text-white text-sm font-semibold shadow-sm">

            ✓ Create & Send Quote

          </button>

          <button onClick={() => handleSave("Draft")} className="px-5 py-3 rounded-2xl bg-white/5 text-white text-sm font-semibold">

            Save Draft

          </button>

          <button
            onClick={() =>
              navigate(
                "/dashboard/client/opportunities/quotations"
              )
            }
            className="px-5 py-3 rounded-2xl bg-red-100 text-red-400 text-sm font-semibold"
          >

            Cancel

          </button>

        </div>

      </div>

    </div>
  );
};

export default AddQuotation;

