import React, { useEffect, useState } from "react";

import apiInterceptor from "../../interceptors/interceptors";

import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  ChevronRight,
  ShoppingCart,
} from "lucide-react";

const EditOrder = () => {

  const navigate = useNavigate();
  const { id } = useParams();

  const [clients, setClients] = useState([]);

  const [opportunities, setOpportunities] = useState([]);

  const [order, setOrder] = useState({

    orderNumber: "",

    clientId: "",

    opportunityId: "",

    status: "DRAFT",

    orderAmount: "",

    taxAmount: "",

    totalAmount: "",

    orderDate: "",

    deliveryDate: "",

    expectedDeliveryDate: "",

    description: "",

    notes: "",

  });

  // FETCH CLIENTS & OPPORTUNITIES
  useEffect(() => {
    fetchClients();
    fetchOpportunities();
    if (id) {
      fetchOrderDetails();
    }
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      const response = await apiInterceptor.get(`/orders/${id}`);
      if (response.data) {
        setOrder(response.data);
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await apiInterceptor.get("/clients");
      setClients(response.data || []);
    } catch (error) {
      console.error(
        "Error fetching clients:",
        error
      );
    }
  };

  const fetchOpportunities = async () => {
    try {
      const response = await apiInterceptor.get(
        "/opportunities"
      );
      setOpportunities(response.data.opportunities || response.data || []);
    } catch (error) {
      console.error(
        "Error fetching opportunities:",
        error
      );
    }
  };

  // HANDLE CHANGE
  const handleChange = (e) => {

    const { name, value } = e.target;

    setOrder({
      ...order,
      [name]: value,
    });
  };

  // CALCULATE TOTAL
  useEffect(() => {

    const amount =
      parseFloat(order.orderAmount) || 0;

    const tax =
      parseFloat(order.taxAmount) || 0;

    setOrder((prev) => ({
      ...prev,
      totalAmount: amount + tax,
    }));

  }, [order.orderAmount, order.taxAmount]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiInterceptor.put(`/orders/${id}`, order);
      alert("Order Updated Successfully");
      navigate("/dashboard/client/orders/list");
    } catch (error) {
      console.error("Error updating order:", error);
      alert("Failed to update order");
    }
  };

  return (

    <div>

      {/* BREADCRUMB */}
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
              "/dashboard/client/orders"
            )
          }
          className="hover:text-purple-300"
        >
          Orders
        </button>

        <ChevronRight
          size={12}
          className="text-gray-300"
        />

        <span className="text-white font-semibold">
          Edit Order
        </span>

      </div>

      {/* HEADER */}
      <div className="flex items-center gap-4 mb-6">

        <button
          onClick={() =>
            navigate(
              "/dashboard/client/orders"
            )
          }
          className="w-10 h-10 rounded-xl bg-[#140f2d]/80 border border-white/10 flex items-center justify-center text-purple-300 shadow-sm"
        >
          <ArrowLeft size={16} />
        </button>

        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm"
          style={{ background: "rgba(59,130,246,0.15)" }}
        >
          <ShoppingCart
            size={22}
            style={{ color: "#2563eb" }}
          />
        </div>

        <div className="flex-1">

          <h2 className="text-xl font-bold text-white">
            Edit Order
          </h2>

          <p className="text-sm text-gray-400">
            Create and manage order details
          </p>

        </div>

      </div>

      {/* FORM */}
      <div className="bg-[#140f2d]/80 rounded-3xl p-6 shadow-sm">

        <h2 className="text-[16px] font-semibold text-white mb-5 border-b pb-3">
          Order Information
        </h2>

        <form id="editOrderForm" onSubmit={handleSubmit}>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

            {/* ORDER NUMBER */}
            <div>

              <label className="block text-xs font-semibold text-purple-300 mb-1">
                Order Number *
              </label>

              <input
                type="text"
                name="orderNumber"
                value={order.orderNumber}
                onChange={handleChange}
                required
                placeholder="ORD-1001"
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
                value={order.clientId}
                onChange={handleChange}
                required
                className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white text-sm"
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

            {/* OPPORTUNITY */}
            <div>

              <label className="block text-xs font-semibold text-purple-300 mb-1">
                Opportunity
              </label>

              <select
                name="opportunityId"
                value={order.opportunityId}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white text-sm"
              >

                <option value="" className="bg-[#140f2d] text-white">
                  Select Opportunity
                </option>

                {opportunities.map((opportunity) => (

                  <option
                    key={opportunity.id}
                    value={opportunity.id}
                  >
                    {opportunity.opportunityName}
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
                value={order.status}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white text-sm"
              >

                <option value="DRAFT">
                  DRAFT
                </option>

                <option value="CONFIRMED">
                  CONFIRMED
                </option>

                <option value="PROCESSING">
                  PROCESSING
                </option>

                <option value="SHIPPED">
                  SHIPPED
                </option>

                <option value="DELIVERED">
                  DELIVERED
                </option>

                <option value="CANCELLED">
                  CANCELLED
                </option>

              </select>

            </div>

            {/* ORDER AMOUNT */}
            <div>

              <label className="block text-xs font-semibold text-purple-300 mb-1">
                Order Amount *
              </label>

              <input
                type="number"
                name="orderAmount"
                value={order.orderAmount}
                onChange={handleChange}
                required
                placeholder="0"
                className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white text-sm"
              />

            </div>

            {/* TAX */}
            <div>

              <label className="block text-xs font-semibold text-purple-300 mb-1">
                Tax Amount
              </label>

              <input
                type="number"
                name="taxAmount"
                value={order.taxAmount}
                onChange={handleChange}
                placeholder="0"
                className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white text-sm"
              />

            </div>

            {/* TOTAL */}
            <div>

              <label className="block text-xs font-semibold text-purple-300 mb-1">
                Total Amount
              </label>

              <input
                type="number"
                name="totalAmount"
                value={order.totalAmount}
                readOnly
                className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white text-sm"
              />

            </div>

            {/* ORDER DATE */}
            <div>

              <label className="block text-xs font-semibold text-purple-300 mb-1">
                Order Date *
              </label>

              <input
                type="date"
                name="orderDate"
                value={order.orderDate}
                onChange={handleChange}
                required
                className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white text-sm"
              />

            </div>

            {/* DELIVERY DATE */}
            <div>

              <label className="block text-xs font-semibold text-purple-300 mb-1">
                Delivery Date
              </label>

              <input
                type="date"
                name="deliveryDate"
                value={order.deliveryDate}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white text-sm"
              />

            </div>

            {/* EXPECTED DELIVERY */}
            <div>

              <label className="block text-xs font-semibold text-purple-300 mb-1">
                Expected Delivery
              </label>

              <input
                type="date"
                name="expectedDeliveryDate"
                value={order.expectedDeliveryDate}
                onChange={handleChange}
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
              value={order.description}
              onChange={handleChange}
              rows="4"
              placeholder="Order description"
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
              value={order.notes}
              onChange={handleChange}
              rows="4"
              placeholder="Additional notes"
              className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white text-sm"
            />

          </div>

          

        </form>

      </div>

      {/* BUTTONS */}
<div className="flex justify-end gap-3 mt-6">

  {/* CANCEL */}
  <button
    type="button"
    onClick={() =>
      navigate("/dashboard/client/orders")
    }
    className="px-6 py-3 rounded-xl border border-white/10 bg-[#140f2d]/80 text-gray-300 text-sm font-semibold shadow-sm hover:bg-white/10"
  >
    Cancel
  </button>

  {/* CREATE */}
  <button
    type="submit"
    form="editOrderForm"
    className="px-6 py-3 rounded-xl text-white text-sm font-semibold shadow-md"
    style={{
      background:
        "linear-gradient(135deg,#2563eb,#3b82f6)",
    }}
  >
    Update Order
  </button>

</div>

    </div>
  );
};

export default EditOrder;

