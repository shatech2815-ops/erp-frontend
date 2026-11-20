import React, { useEffect, useState } from "react";

import apiInterceptor from "../../interceptors/interceptors";

import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  ChevronRight,
  ShoppingCart,
  Plus,
  Pencil,
  Trash2,
  Eye,
  Search,
  Filter,
  RotateCcw,
  CheckCircle2,
  TrendingUp,
  CalendarDays,
} from "lucide-react";

const OrderList = () => {

  const navigate = useNavigate();

  // ================= STATES =================

  const [orders, setOrders] =
    useState([]);

  const [page, setPage] =
    useState(0);

  const [totalPages, setTotalPages] =
    useState(0);

  const [activeCount,
    setActiveCount] =
    useState(0);

  const [deliveredAmount,
    setDeliveredAmount] =
    useState(0);

  const [orderNumber,
    setOrderNumber] =
    useState("");

  const [clientId,
    setClientId] =
    useState("");

  const [statusFilter,
    setStatusFilter] =
    useState("");

  const [startDate,
    setStartDate] =
    useState("");

  const [endDate,
    setEndDate] =
    useState("");

  const [loading,
    setLoading] =
    useState(false);

  // ================= FETCH ALL =================

  const fetchOrders =
    async () => {

      try {

        setLoading(true);

        const response =
          await apiInterceptor.get(
            "/orders?page=${page}&size=10"
          );

        setOrders(
          response.data.orders || response.data || []
        );

        setTotalPages(
          response.data.totalPages
        );

      } catch (error) {

        console.error(
          "Error fetching orders:",
          error
        );

      } finally {

        setLoading(false);
      }
    };

  // ================= ACTIVE COUNT =================

  const fetchActiveCount =
    async () => {

      try {

        const response =
          await apiInterceptor.get(
            "/orders/count/active"
          );

        setActiveCount(
          response.data
        );

      } catch (error) {

        console.error(error);
      }
    };

  // ================= DELIVERED AMOUNT =================

  const fetchDeliveredAmount =
    async () => {

      try {

        const response =
          await apiInterceptor.get(
            "/orders/total/delivered"
          );

        setDeliveredAmount(
          response.data
        );

      } catch (error) {

        console.error(error);
      }
    };

  // ================= GET BY ORDER NUMBER =================

  const fetchByOrderNumber =
    async () => {

      if (!orderNumber) return;

      try {

        setLoading(true);

        const response =
          await apiInterceptor.get(
            "/orders/number/${orderNumber}"
          );

        setOrders(
          Array.isArray(response.data) ? response.data : [response.data]
        );

      } catch (error) {

        console.error(error);

      } finally {

        setLoading(false);
      }
    };

  // ================= GET BY CLIENT =================

  const fetchByClientId =
    async () => {

      if (!clientId) return;

      try {

        setLoading(true);

        const response =
          await apiInterceptor.get(
            "/orders/client/${clientId}"
          );

        setOrders(
          response.data || []
        );

      } catch (error) {

        console.error(error);

      } finally {

        setLoading(false);
      }
    };

  // ================= GET BY STATUS =================

  const fetchByStatus =
    async (status) => {

      try {

        setLoading(true);

        const response =
          await apiInterceptor.get(
            "/orders/status/${status}"
          );

        setOrders(
          response.data || []
        );

      } catch (error) {

        console.error(error);

      } finally {

        setLoading(false);
      }
    };

  // ================= GET BY DATE RANGE =================

  const fetchByDateRange =
    async () => {

      if (
        !startDate ||
        !endDate
      ) return;

      try {

        setLoading(true);

        const response =
          await apiInterceptor.get(
            "/orders/date-range?startDate=${startDate}&endDate=${endDate}"
          );

        setOrders(
          response.data || []
        );

      } catch (error) {

        console.error(error);

      } finally {

        setLoading(false);
      }
    };

  // ================= DELETE =================

  const handleDelete =
    async (id) => {

      const confirmDelete =
        window.confirm(
          "Delete this order?"
        );

      if (!confirmDelete)
        return;

      try {

        await apiInterceptor.delete(
          "/orders/${id}"
        );

        fetchOrders();

      } catch (error) {

        console.error(
          "Delete failed:",
          error
        );
      }
    };

  // ================= STATUS COLOR =================

  const getStatusColor =
    (status) => {

      switch (status) {

        case "DRAFT":
          return "bg-white/5 text-white text-gray-300";

        case "CONFIRMED":
          return "bg-blue-100 text-blue-400";

        case "PROCESSING":
          return "bg-yellow-100 text-amber-400";

        case "SHIPPED":
          return "bg-indigo-100 text-indigo-400";

        case "DELIVERED":
          return "bg-green-100 text-emerald-400";

        case "CANCELLED":
          return "bg-red-100 text-red-400";

        default:
          return "bg-white/5 text-white text-gray-300";
      }
    };

  // ================= RESET =================

  const handleReset = () => {

    setOrderNumber("");

    setClientId("");

    setStatusFilter("");

    setStartDate("");

    setEndDate("");

    fetchOrders();
  };

  // ================= USE EFFECT =================

  useEffect(() => {

    fetchOrders();

    fetchActiveCount();

    fetchDeliveredAmount();

  }, [page]);

  return (

    <div >

      {/* ================= BREADCRUMB ================= */}

      <div className="flex items-center gap-2 text-xs text-purple-300 mb-4 font-medium">

        <span>
          Client Management
        </span>

        <ChevronRight size={14} />

        <span>
          Orders
        </span>

        <ChevronRight size={14} />

        <span className="font-medium text-white">
          Order List
        </span>

      </div>

      {/* ================= HEADER ================= */}

      <div className="flex items-center justify-between mb-6">

        <div className="flex items-center gap-4">

          <button
            onClick={() =>
              navigate("/dashboard/client/orders")
            }
            className="w-10 h-10 rounded-xl bg-[#140f2d]/80 border flex items-center justify-center shadow-sm"
          >
            <ArrowLeft size={16} />
          </button>

          <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center">

            <ShoppingCart
              size={22}
              className="text-blue-400"
            />

          </div>

          <div>

            <h2 className="text-2xl font-bold text-white">
              Order List
            </h2>

            <p className="text-sm text-gray-400">
              Manage all orders
            </p>

          </div>

        </div>

        <button
          onClick={() =>
            navigate(
              "/dashboard/client/orders/add"
            )
          }
          className="flex items-center gap-2 px-5 py-3 rounded-xl text-white text-sm font-semibold shadow-md bg-blue-600"
        >
          <Plus size={18} />
          Create Order
        </button>

      </div>

      {/* ================= CARDS ================= */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">

        {/* ACTIVE */}

        <div className="bg-[#140f2d]/80 rounded-3xl p-5 shadow-sm">

          <div className="flex items-center gap-4">

            <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center">

              <CheckCircle2 className="text-emerald-400" />

            </div>

            <div>

              <p className="text-sm text-gray-400">
                Active Orders
              </p>

              <h2 className="text-3xl font-bold text-white">
                {activeCount}
              </h2>

            </div>

          </div>

        </div>

        {/* DELIVERED */}

        <div className="bg-[#140f2d]/80 rounded-3xl p-5 shadow-sm">

          <div className="flex items-center gap-4">

            <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center">

              <TrendingUp className="text-blue-400" />

            </div>

            <div>

              <p className="text-sm text-gray-400">
                Delivered Amount
              </p>

              <h2 className="text-3xl font-bold text-white">
                ₹ {deliveredAmount}
              </h2>

            </div>

          </div>

        </div>

      </div>

      {/* ================= FILTERS ================= */}

      <div className="bg-[#140f2d]/80 rounded-3xl p-5 shadow-sm mb-6 flex flex-wrap gap-4 items-center">

        {/* ORDER NUMBER */}

        <div className="flex items-center bg-purple-500/10 rounded-2xl px-4 py-3">

          <Search
            size={18}
            className="text-gray-400"
          />

          <input
            type="text"
            placeholder="Order Number"
            value={orderNumber}
            onChange={(e) =>
              setOrderNumber(
                e.target.value
              )
            }
            className="bg-transparent outline-none px-3"
          />

          <button
            onClick={
              fetchByOrderNumber
            }
            className="px-4 py-2 rounded-xl bg-blue-600 text-white"
          >
            Search
          </button>

        </div>

        {/* CLIENT ID */}

        <div className="flex items-center bg-purple-500/10 rounded-2xl px-4 py-3">

          <input
            type="number"
            placeholder="Client ID"
            value={clientId}
            onChange={(e) =>
              setClientId(
                e.target.value
              )
            }
            className="bg-transparent outline-none"
          />

          <button
            onClick={
              fetchByClientId
            }
            className="px-4 py-2 rounded-xl bg-blue-600 text-white"
          >
            Search
          </button>

        </div>

        {/* STATUS */}

        <div className="flex items-center gap-2">

          <Filter
            size={18}
            className="text-gray-400"
          />

          <select
            value={statusFilter}
            onChange={(e) => {

              setStatusFilter(
                e.target.value
              );

              if (
                e.target.value ===
                ""
              ) {

                fetchOrders();

              } else {

                fetchByStatus(
                  e.target.value
                );
              }
            }}
            className="px-4 py-3 rounded-2xl bg-purple-500/10"
          >

            <option value="" className="bg-[#140f2d] text-white">
              All Status
            </option>

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

        {/* DATE RANGE */}

        <div className="flex items-center gap-2 bg-purple-500/10 rounded-2xl px-4 py-3">

          <CalendarDays
            size={18}
            className="text-gray-400"
          />

          <input
            type="date"
            value={startDate}
            onChange={(e) =>
              setStartDate(
                e.target.value
              )
            }
            className="bg-transparent outline-none"
          />

          <input
            type="date"
            value={endDate}
            onChange={(e) =>
              setEndDate(
                e.target.value
              )
            }
            className="bg-transparent outline-none"
          />

          <button
            onClick={
              fetchByDateRange
            }
            className="px-4 py-2 rounded-xl bg-blue-600 text-white"
          >
            Filter
          </button>

        </div>

        {/* RESET */}

        <button
          onClick={handleReset}
          className="px-5 py-3 rounded-2xl bg-white/5 text-white text-gray-300 font-semibold flex items-center gap-2"
        >

          <RotateCcw size={16} />

          Reset

        </button>

      </div>

      {/* ================= TABLE ================= */}

      <div className="bg-[#140f2d]/80 rounded-3xl shadow-sm overflow-hidden">

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead className="bg-white/5 text-white">

              <tr>

                <th className="px-5 py-4 text-left text-sm font-semibold text-purple-300">
                  ID
                </th>

                <th className="px-5 py-4 text-left text-sm font-semibold text-purple-300">
                  Order Number
                </th>

                <th className="px-5 py-4 text-left text-sm font-semibold text-purple-300">
                  Client ID
                </th>

                <th className="px-5 py-4 text-left text-sm font-semibold text-purple-300">
                  Opportunity ID
                </th>

                <th className="px-5 py-4 text-left text-sm font-semibold text-purple-300">
                  Total Amount
                </th>

                <th className="px-5 py-4 text-left text-sm font-semibold text-purple-300">
                  Status
                </th>

                <th className="px-5 py-4 text-left text-sm font-semibold text-purple-300">
                  Order Date
                </th>

                <th className="px-5 py-4 text-left text-sm font-semibold text-purple-300">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>

              {!loading &&
              orders.length > 0 ? (

                orders.map((item) => (

                  <tr
                    key={item.id}
                    className="border-t hover:bg-[rgba(250,251,253,0.12)]"
                  >

                    <td className="px-5 py-4">
                      {item.id}
                    </td>

                    <td className="px-5 py-4 font-semibold">
                      {item.orderNumber}
                    </td>

                    <td className="px-5 py-4">
                      {item.clientId}
                    </td>

                    <td className="px-5 py-4">
                      {item.opportunityId}
                    </td>

                    <td className="px-5 py-4 font-semibold">
                      ₹ {item.totalAmount}
                    </td>

                    <td className="px-5 py-4">

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(item.status)}`}
                      >
                        {item.status}
                      </span>

                    </td>

                    <td className="px-5 py-4">
                      {item.orderDate}
                    </td>

                    <td className="px-5 py-4">

                      <div className="flex gap-2">

                        {/* VIEW */}

                        <button className="p-2 rounded-lg bg-blue-100 text-blue-400">

                          <Eye size={16} />

                        </button>

                        {/* EDIT */}

                        <button
                          onClick={() =>
                            navigate(
                              `/dashboard/client/orders/edit/${item.id}`
                            )
                          }
                          className="p-2 rounded-lg bg-yellow-100 text-amber-400"
                        >

                          <Pencil size={16} />

                        </button>

                        {/* DELETE */}

                        <button
                          onClick={() =>
                            handleDelete(
                              item.id
                            )
                          }
                          className="p-2 rounded-lg bg-red-100 text-red-400"
                        >

                          <Trash2 size={16} />

                        </button>

                      </div>

                    </td>

                  </tr>

                ))

              ) : (

                <tr>

                  <td
                    colSpan="8"
                    className="text-center py-10 text-gray-400"
                  >

                    {loading
                      ? "Loading..."
                      : "No orders found"}

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

export default OrderList;


