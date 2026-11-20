// src/pages/client/DeliverySchedule.jsx

import React, {
  useEffect,
  useState,
} from "react";

import apiInterceptor from "../../interceptors/interceptors";

import {
  ChevronRight,
  Truck,
  CalendarDays,
  Search,
  Filter,
  Clock3,
  Eye,
  Pencil,
  ArrowLeft,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

const DeliverySchedule = () => {

  const navigate = useNavigate();

  // ================= STATES =================

  const [orders, setOrders] =
    useState([]);

  const [filteredOrders,
    setFilteredOrders] =
    useState([]);

  const [statusFilter,
    setStatusFilter] =
    useState("");

  const [search,
    setSearch] =
    useState("");

  const [loading,
    setLoading] =
    useState(false);

  // ================= FETCH ORDERS =================

  const fetchDeliveries =
    async () => {

      try {

        setLoading(true);

        const response =
          await apiInterceptor.get(
            "/orders?page=0&size=100"
          );

        const data = response.data?.orders || (Array.isArray(response.data) ? response.data : []);
        const deliveryOrders = data.filter(
            (item) =>
              item.expectedDeliveryDate ||
              item.deliveryDate
          );

        setOrders(
          deliveryOrders
        );

        setFilteredOrders(
          deliveryOrders
        );

      } catch (error) {

        console.error(
          "Delivery fetch error:",
          error
        );

      } finally {

        setLoading(false);
      }
    };

  // ================= FILTER =================

  useEffect(() => {

    let filtered = [...orders];

    // SEARCH

    if (search) {

      filtered =
        filtered.filter(
          (item) =>
            item.orderNumber
              ? item.orderNumber
                  .toLowerCase()
                  .includes(
                    search.toLowerCase()
                  )
              : false
        );
    }

    // STATUS

    if (statusFilter) {

      filtered =
        filtered.filter(
          (item) =>
            item.status ===
            statusFilter
        );
    }

    setFilteredOrders(filtered);

  }, [
    search,
    statusFilter,
    orders,
  ]);

  // ================= LOAD =================

  useEffect(() => {

    fetchDeliveries();

  }, []);

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

  return (

    <div>

      {/* ================= BREADCRUMB ================= */}

      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">

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
          Delivery Schedule
        </span>

      </div>

      {/* ================= HEADER ================= */}

      <div className="flex items-center justify-between mb-6">

        <div className="flex items-center gap-4">

          {/* BACK */}

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

          {/* ICON */}

          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm"
            style={{
              background:
                "rgba(59,130,246,0.15)",
            }}
          >

            <Truck
              size={22}
              style={{
                color: "#2563EB",
              }}
            />

          </div>

          {/* TITLE */}

          <div>

            <h2 className="text-xl font-bold text-white">
              Delivery Schedule
            </h2>

            <p className="text-sm text-gray-400">
              Manage delivery schedules
            </p>

          </div>

        </div>

      </div>

      {/* ================= FILTER SECTION ================= */}

      <div className="bg-[#140f2d]/80 rounded-3xl shadow-sm p-5 mb-6">

        <div className="flex flex-wrap gap-4 items-center">

          {/* SEARCH */}

          <div className="flex items-center bg-purple-500/10 rounded-2xl px-4 py-3 flex-1 min-w-[280px]">

            <Search
              size={18}
              className="text-gray-400"
            />

            <input
              type="text"
              placeholder="Search by Order Number..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              className="bg-transparent outline-none px-3 w-full"
            />

          </div>

          {/* STATUS */}

          <div className="flex items-center gap-2 bg-purple-500/10 rounded-2xl px-4 py-3">

            <Filter
              size={18}
              className="text-gray-400"
            />

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value
                )
              }
              className="bg-transparent outline-none"
            >

              <option value="" className="bg-[#140f2d] text-white">
                All Status
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

        </div>

      </div>

      {/* ================= TABLE ================= */}

      <div className="bg-[#140f2d]/80 rounded-3xl shadow-sm overflow-hidden">

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead className="bg-white/5 text-white">

              <tr>

                <th className="px-5 py-4 text-left text-sm font-semibold text-purple-300">
                  Order No
                </th>

                <th className="px-5 py-4 text-left text-sm font-semibold text-purple-300">
                  Client ID
                </th>

                <th className="px-5 py-4 text-left text-sm font-semibold text-purple-300">
                  Opportunity
                </th>

                <th className="px-5 py-4 text-left text-sm font-semibold text-purple-300">
                  Amount
                </th>

                <th className="px-5 py-4 text-left text-sm font-semibold text-purple-300">
                  Order Date
                </th>

                <th className="px-5 py-4 text-left text-sm font-semibold text-purple-300">
                  Expected Delivery
                </th>

                <th className="px-5 py-4 text-left text-sm font-semibold text-purple-300">
                  Delivery Date
                </th>

                <th className="px-5 py-4 text-left text-sm font-semibold text-purple-300">
                  Status
                </th>

                <th className="px-5 py-4 text-left text-sm font-semibold text-purple-300">
                  Notes
                </th>

                <th className="px-5 py-4 text-left text-sm font-semibold text-purple-300">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>

              {!loading &&
              filteredOrders.length >
                0 ? (

                filteredOrders.map(
                  (item) => (

                    <tr
                      key={item.id}
                      className="border-t hover:bg-[rgba(250,251,253,0.12)]"
                    >

                      {/* ORDER */}

                      <td className="px-5 py-4 font-semibold text-white">
                        {
                          item.orderNumber
                        }
                      </td>

                      {/* CLIENT */}

                      <td className="px-5 py-4 text-sm">
                        {
                          item.clientId
                        }
                      </td>

                      {/* OPPORTUNITY */}

                      <td className="px-5 py-4 text-sm">
                        {
                          item.opportunityId
                        }
                      </td>

                      {/* AMOUNT */}

                      <td className="px-5 py-4 font-semibold">
                        ₹
                        {
                          item.totalAmount
                        }
                      </td>

                      {/* ORDER DATE */}

                      <td className="px-5 py-4 text-sm">

                        <div className="flex items-center gap-2">

                          <CalendarDays
                            size={15}
                            className="text-blue-500"
                          />

                          {
                            item.orderDate
                          }

                        </div>

                      </td>

                      {/* EXPECTED */}

                      <td className="px-5 py-4 text-sm">

                        <div className="flex items-center gap-2">

                          <Clock3
                            size={15}
                            className="text-yellow-500"
                          />

                          {
                            item.expectedDeliveryDate
                          }

                        </div>

                      </td>

                      {/* DELIVERY */}

                      <td className="px-5 py-4 text-sm">

                        {item.deliveryDate
                          ? item.deliveryDate
                          : "-"}

                      </td>

                      {/* STATUS */}

                      <td className="px-5 py-4">

                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(item.status)}`}
                        >
                          {
                            item.status
                          }
                        </span>

                      </td>

                      {/* NOTES */}

                      <td className="px-5 py-4 text-sm max-w-[180px] truncate">

                        {item.notes
                          ? item.notes
                          : "-"}

                      </td>

                      {/* ACTION */}

                      <td className="px-5 py-4">

                        <div className="flex gap-2">

                          {/* VIEW */}

                          <button
                            className="p-2 rounded-lg bg-blue-100 text-blue-400"
                          >

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

                        </div>

                      </td>

                    </tr>
                  )
                )

              ) : (

                <tr>

                  <td
                    colSpan="10"
                    className="text-center py-14 text-gray-400"
                  >

                    {loading
                      ? "Loading..."
                      : "No delivery schedules found"}

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

export default DeliverySchedule;


