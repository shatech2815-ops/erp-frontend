// src/pages/client/OrderStatus.jsx

import React, {
  useEffect,
  useState,
} from "react";

import {
  ChevronRight,
  Truck,
  PackageCheck,
  CircleCheckBig,
  Package,
  Clock3,
  ArrowLeft,
  ShoppingCart,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import apiInterceptor from "../../interceptors/interceptors";

const OrderStatus = () => {

  const navigate = useNavigate();

  const [trackingId, setTrackingId] =
    useState("");

  const [orders, setOrders] =
    useState([]);

  const [order, setOrder] =
    useState(null);

  const stages = [
    "DRAFT",
    "CONFIRMED",
    "PROCESSING",
    "SHIPPED",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
  ];

  // FETCH ORDERS FROM API
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await apiInterceptor.get("/orders?page=0&size=100");
        const data = response.data?.orders || (Array.isArray(response.data) ? response.data : []);
        setOrders(data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };
    fetchOrders();
  }, []);

  const currentStageIndex =
    order
      ? stages.indexOf(order.status)
      : 0;

  // ICONS
  const getIcon = (stage) => {

    switch (stage) {

      case "DRAFT":
        return <Clock3 size={16} />;

      case "CONFIRMED":
        return <CircleCheckBig size={16} />;

      case "PROCESSING":
        return <Package size={16} />;

      case "SHIPPED":
        return <Truck size={16} />;

      case "OUT_FOR_DELIVERY":
        return <Truck size={16} />;

      case "DELIVERED":
        return <PackageCheck size={16} />;

      default:
        return <Clock3 size={16} />;
    }
  };

  // TRACK ORDER
  const handleTrack = () => {

    if (!trackingId) {

      alert("Select Order");

      return;
    }

    const selectedOrder =
      orders.find(
        (item) =>
          item.id.toString() ===
          trackingId.toString()
      );

    if (!selectedOrder) {

      alert("Order not found");

      return;
    }

    setOrder(selectedOrder);
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

          <ChevronRight size={14} />

          <span
            className="cursor-pointer hover:text-purple-300"
            onClick={() =>
              navigate("/dashboard/client/orders")
            }
          >
            Orders
          </span>

          <ChevronRight size={14} />

          <span className="font-medium text-white">
            Order Status
          </span>

        </div>

      </div>

      {/* HEADER */}
      <div className="flex items-center gap-4 mb-6">

        <button
          onClick={() =>
            navigate("/dashboard/client/orders")
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

        <div>

          <h2 className="text-xl font-bold text-white">
            Order Status
          </h2>

          <p className="text-sm text-gray-400">
            Track order delivery progress
          </p>

        </div>

      </div>

      {/* CARD */}
      <div className="bg-[#140f2d]/80 rounded-3xl shadow-sm p-6">

        {/* TITLE */}
        <div className="mb-6">

          <h2 className="text-xl font-bold text-white">
            Order Status Tracker
          </h2>

          <p className="text-sm text-gray-400 mt-1">
            Track your order delivery progress
          </p>

        </div>

        {/* SEARCH */}
        <div className="flex gap-3 mb-8">

          {/* ORDER DROPDOWN */}
          <select
            value={trackingId}
            onChange={(e) =>
              setTrackingId(e.target.value)
            }
            className="w-[300px] px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white text-sm"
          >

            <option value="" className="bg-[#140f2d] text-white">
              Select Order
            </option>

            {orders.map((item) => (

              <option
                key={item.id}
                value={item.id}
              >
                {item.orderNumber}
              </option>

            ))}

          </select>

          {/* TRACK BUTTON */}
          <button
            onClick={handleTrack}
            className="px-5 py-3 rounded-xl text-white text-sm font-semibold"
            style={{
              background:
                "linear-gradient(135deg,#2563eb,#3b82f6)",
            }}
          >
            Track
          </button>

        </div>

        {/* ORDER DETAILS */}
        {order && (

          <div className="border border-white/10 rounded-3xl p-6">

            {/* HEADER */}
            <div className="flex justify-between items-start mb-10">

              <div>

                <h3 className="text-lg font-bold text-white">
                  {order.orderNumber}
                </h3>

                <p className="text-sm text-gray-400 mt-1">
                  Client ID: {order.clientId}
                </p>

                <p className="text-sm text-gray-400">
                  Total Amount: ₹ {order.totalAmount}
                </p>

              </div>

              <span
                className="px-4 py-2 rounded-full text-xs font-semibold bg-blue-100 text-blue-400"
              >
                {order.status?.replaceAll("_", " ")}
              </span>

            </div>

            {/* TRACKER */}
            <div className="relative">

              {/* LINE */}
              <div className="absolute top-5 left-0 w-full h-1 bg-white/10 rounded-full">

                <div
                  className="h-1 rounded-full"
                  style={{
                    width: `${
                      (currentStageIndex /
                        (stages.length - 1)) *
                      100
                    }%`,
                    background:
                      "linear-gradient(135deg,#2563eb,#3b82f6)",
                  }}
                />

              </div>

              {/* STAGES */}
              <div className="relative flex justify-between">

                {stages.map(
                  (stage, index) => {

                    const completed =
                      index <= currentStageIndex;

                    return (

                      <div
                        key={stage}
                        className="flex flex-col items-center w-24"
                      >

                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-white shadow-md z-10 ${
                            completed
                              ? ""
                              : "bg-gray-300"
                          }`}
                          style={
                            completed
                              ? {
                                  background:
                                    "linear-gradient(135deg,#2563eb,#3b82f6)",
                                }
                              : {}
                          }
                        >
                          {getIcon(stage)}
                        </div>

                        <span
                          className={`text-xs font-semibold mt-3 text-center ${
                            completed
                              ? "text-white"
                              : "text-gray-400"
                          }`}
                        >
                          {stage.replaceAll("_", " ")}
                        </span>

                      </div>
                    );
                  }
                )}

              </div>

            </div>

            {/* EXTRA INFO */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-10">

              <div className="bg-white/5 text-white rounded-2xl p-4">

                <p className="text-xs text-gray-400 mb-1">
                  Order Date
                </p>

                <h4 className="text-sm font-semibold text-white">
                  {order.orderDate || "-"}
                </h4>

              </div>

              <div className="bg-white/5 text-white rounded-2xl p-4">

                <p className="text-xs text-gray-400 mb-1">
                  Delivery Date
                </p>

                <h4 className="text-sm font-semibold text-white">
                  {order.deliveryDate || "-"}
                </h4>

              </div>

              <div className="bg-white/5 text-white rounded-2xl p-4">

                <p className="text-xs text-gray-400 mb-1">
                  Expected Delivery
                </p>

                <h4 className="text-sm font-semibold text-white">
                  {order.expectedDeliveryDate || "-"}
                </h4>

              </div>

              <div className="bg-white/5 text-white rounded-2xl p-4">

                <p className="text-xs text-gray-400 mb-1">
                  Opportunity ID
                </p>

                <h4 className="text-sm font-semibold text-white">
                  {order.opportunityId || "-"}
                </h4>

              </div>

            </div>

            {/* DESCRIPTION */}
            <div className="mt-6 bg-white/5 text-white rounded-2xl p-5">

              <p className="text-xs text-gray-400 mb-2">
                Description
              </p>

              <p className="text-sm text-white">
                {order.description ||
                  "No description available"}
              </p>

            </div>

          </div>

        )}

      </div>

    </div>
  );
};

export default OrderStatus;

