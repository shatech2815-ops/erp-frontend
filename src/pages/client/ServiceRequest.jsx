// src/pages/client/ServiceRequest.jsx

import React, {
  useEffect,
  useState,
} from "react";
import apiInterceptor from "../../interceptors/interceptors";

import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  ChevronRight,
  Wrench,
} from "lucide-react";

const ServiceRequest = () => {

  const navigate = useNavigate();

  const [clients, setClients] =
    useState([]);

  const [orders, setOrders] =
    useState([]);

  const [service, setService] =
    useState({

      ticketNumber: "",

      clientId: "",

      orderId: "",

      status: "OPEN",

      title: "",

      description: "",

      priority: "",

      type: "",

      warrantyClaim: false,

      complaintType: "",

      requestDate: "",

      resolutionDate: "",

      expectedResolutionDate: "",

      assignedTo: "",

      resolutionNotes: "",

      notes: "",
    });

  // FETCH CLIENTS & ORDERS
  useEffect(() => {
    // 1. Fetch Orders from Backend API
    const fetchOrders = async () => {
      try {
        const response = await apiInterceptor.get("/orders");
        setOrders(response.data.orders || response.data || []);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };
    fetchOrders();

    // 2. Fetch Clients from Backend API
    const fetchClients = async () => {
      try {
        const response = await apiInterceptor.get("/clients");
        setClients(response.data || []);
      } catch (error) {
        console.error("Error fetching clients:", error);
      }
    };
    fetchClients();
  }, []);

  // HANDLE CHANGE
  const handleChange = (e) => {

    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setService({
      ...service,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    });
  };

  // SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await apiInterceptor.post("/services", service);
      alert("Service Request Created Successfully");

      setService({
        ticketNumber: "",
        clientId: "",
        orderId: "",
        status: "OPEN",
        title: "",
        description: "",
        priority: "",
        type: "",
        warrantyClaim: false,
        complaintType: "",
        requestDate: "",
        resolutionDate: "",
        expectedResolutionDate: "",
        assignedTo: "",
        resolutionNotes: "",
        notes: "",
      });
      navigate("/dashboard/client/service");
    } catch (error) {
      console.error("Error creating service request:", error);
      alert("Failed to create service request");
    }
  };

  return (

    <div>

      {/* TOP TITLE */}
      <div className="mb-6">

        

        {/* BREADCRUMB */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mt-4">

          <span
            className="cursor-pointer hover:text-purple-300"
            onClick={() =>
              navigate("/dashboard/client")
            }
          >
            Client Management
          </span>

          <ChevronRight size={12} />

          <span
            className="cursor-pointer hover:text-purple-300"
            onClick={() =>
              navigate("/dashboard/client/service")
            }
          >
            Service
          </span>

          <ChevronRight size={12} />

          <span className="font-medium text-white">
            Create Service Request
          </span>

        </div>

      </div>

      {/* HEADER */}
      <div className="flex items-center gap-4 mb-6">

        <button
          onClick={() =>
            navigate("/dashboard/client/service")
          }
          className="w-10 h-10 rounded-xl bg-[#140f2d]/80 border border-white/10 flex items-center justify-center text-purple-300 shadow-sm"
        >
          <ArrowLeft size={16} />
        </button>

        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm"
          style={{ background: "rgba(16,185,129,0.15)" }}
        >
          <Wrench
            size={22}
            style={{ color: "#059669" }}
          />
        </div>

        <div>

          <h2 className="text-xl font-bold text-white">
            Service Request
          </h2>

          <p className="text-sm text-gray-400">
            Create and manage service requests
          </p>

        </div>

      </div>

      {/* FORM CARD */}
      <div className="bg-[#140f2d]/80 rounded-3xl p-6 shadow-sm">

        <h2 className="text-[16px] font-semibold text-white mb-5 border-b pb-3">
          Service Information
        </h2>

        <form
          id="serviceRequestForm"
          onSubmit={handleSubmit}
        >

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

            {/* TICKET NUMBER */}
            <div>

              <label className="block text-xs font-semibold text-purple-300 mb-1">
                Ticket Number *
              </label>

              <input
                type="text"
                name="ticketNumber"
                value={service.ticketNumber}
                onChange={handleChange}
                placeholder="TICK-1001"
                required
                className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white text-sm"
              />

            </div>

            {/* CLIENT */}
            <div>

              <label className="block text-xs font-semibold text-purple-300 mb-1">
                Client *
              </label>

              <select
                name="clientId"
                value={service.clientId}
                onChange={handleChange}
                required
                className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white text-sm text-white"
              >

                <option value="" className="bg-[#140f2d] text-white">
                  Select Client
                </option>

                {clients.map((client) => (

                  <option
                    key={client.id}
                    value={client.id}
                    className="bg-[#140f2d] text-white"
                  >
                    {client.name}
                  </option>

                ))}

              </select>

            </div>

            {/* ORDER */}
            <div>

              <label className="block text-xs font-semibold text-purple-300 mb-1">
                Order
              </label>

              <select
                name="orderId"
                value={service.orderId}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white text-sm text-white"
              >

                <option value="" className="bg-[#140f2d] text-white">
                  Select Order
                </option>

                {orders.map((order) => (

                  <option
                    key={order.id}
                    value={order.id}
                    className="bg-[#140f2d] text-white"
                  >
                    {order.orderNumber}
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
                value={service.status}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white text-sm text-white"
              >

                <option value="OPEN" className="bg-[#140f2d] text-white">
                  OPEN
                </option>

                <option value="IN_PROGRESS" className="bg-[#140f2d] text-white">
                  IN_PROGRESS
                </option>

                <option value="RESOLVED" className="bg-[#140f2d] text-white">
                  RESOLVED
                </option>

                <option value="CLOSED" className="bg-[#140f2d] text-white">
                  CLOSED
                </option>

                <option value="PENDING" className="bg-[#140f2d] text-white">
                  PENDING
                </option>

                <option value="ON_HOLD" className="bg-[#140f2d] text-white">
                 ON_HOLD
                </option>

                <option value="REOPENED" className="bg-[#140f2d] text-white">
                 REOPENED
                </option>

              </select>

            </div>

            {/* TITLE */}
            <div>

              <label className="block text-xs font-semibold text-purple-300 mb-1">
                Title *
              </label>

              <input
                type="text"
                name="title"
                value={service.title}
                onChange={handleChange}
                placeholder="Service title"
                required
                className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white text-sm"
              />

            </div>

            {/* PRIORITY */}
            <div>

              <label className="block text-xs font-semibold text-purple-300 mb-1">
                Priority
              </label>

              <select
                name="priority"
                value={service.priority}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white text-sm text-white"
              >

                <option value="" className="bg-[#140f2d] text-white">
                  Select Priority
                </option>

                <option value="LOW" className="bg-[#140f2d] text-white">
                  LOW
                </option>

                <option value="MEDIUM" className="bg-[#140f2d] text-white">
                  MEDIUM
                </option>

                <option value="HIGH" className="bg-[#140f2d] text-white">
                  HIGH
                </option>

                <option value="URGENT" className="bg-[#140f2d] text-white">
                  URGENT
                </option>

              </select>

            </div>

            {/* TYPE */}
            <div>

              <label className="block text-xs font-semibold text-purple-300 mb-1">
                Type
              </label>

              <input
                type="text"
                name="type"
                value={service.type}
                onChange={handleChange}
                placeholder="Installation"
                className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white text-sm"
              />

            </div>

            {/* COMPLAINT TYPE */}
            <div>

              <label className="block text-xs font-semibold text-purple-300 mb-1">
                Complaint Type
              </label>

              <input
                type="text"
                name="complaintType"
                value={service.complaintType}
                onChange={handleChange}
                placeholder="Hardware Issue"
                className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white text-sm"
              />

            </div>

            {/* REQUEST DATE */}
            <div>

              <label className="block text-xs font-semibold text-purple-300 mb-1">
                Request Date *
              </label>

              <input
                type="date"
                name="requestDate"
                value={service.requestDate}
                onChange={handleChange}
                required
                className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white text-sm"
              />

            </div>

            {/* RESOLUTION DATE */}
            <div>

              <label className="block text-xs font-semibold text-purple-300 mb-1">
                Resolution Date
              </label>

              <input
                type="date"
                name="resolutionDate"
                value={service.resolutionDate}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white text-sm"
              />

            </div>

            {/* EXPECTED RESOLUTION */}
            <div>

              <label className="block text-xs font-semibold text-purple-300 mb-1">
                Expected Resolution
              </label>

              <input
                type="date"
                name="expectedResolutionDate"
                value={service.expectedResolutionDate}
                onChange={handleChange}
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
                value={service.assignedTo}
                onChange={handleChange}
                placeholder="Technician"
                className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white text-sm"
              />

            </div>

          </div>

          {/* WARRANTY */}
          <div className="mt-5">

            <label className="flex items-center gap-3 text-sm text-white">

              <input
                type="checkbox"
                name="warrantyClaim"
                checked={service.warrantyClaim}
                onChange={handleChange}
              />

              Warranty Claim

            </label>

          </div>

          {/* DESCRIPTION */}
          <div className="mt-5">

            <label className="block text-xs font-semibold text-purple-300 mb-1">
              Description
            </label>

            <textarea
              name="description"
              value={service.description}
              onChange={handleChange}
              rows="4"
              placeholder="Service request description"
              className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white text-sm"
            />

          </div>

          {/* RESOLUTION NOTES */}
          <div className="mt-5">

            <label className="block text-xs font-semibold text-purple-300 mb-1">
              Resolution Notes
            </label>

            <textarea
              name="resolutionNotes"
              value={service.resolutionNotes}
              onChange={handleChange}
              rows="4"
              placeholder="Resolution notes"
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
              value={service.notes}
              onChange={handleChange}
              rows="4"
              placeholder="Additional notes"
              className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white text-sm"
            />

          </div>

        </form>

        {/* BUTTONS */}
        <div className="flex justify-end gap-3 mt-6">

          {/* CANCEL */}
          <button
            type="button"
            onClick={() =>
              navigate(
                "/dashboard/client/service"
              )
            }
            className="px-6 py-3 rounded-xl border border-white/10 bg-[#140f2d]/80 text-gray-300 text-sm font-semibold shadow-sm hover:bg-white/10"
          >
            Cancel
          </button>

          {/* CREATE REQUEST */}
          <button
            type="submit"
            form="serviceRequestForm"
            className="px-6 py-3 rounded-xl text-white text-sm font-semibold shadow-md"
            style={{
              background:
                "linear-gradient(135deg,#059669,#10b981)",
            }}
          >
            Create Request
          </button>

        </div>

      </div>

    </div>
  );
};

export default ServiceRequest;

