// src/pages/client/ServiceHistory.jsx

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
  Eye,
  Pencil,
  Trash2,
  Plus,
} from "lucide-react";

const ServiceHistory = () => {

  const navigate = useNavigate();

  const [services, setServices] =
    useState([]);

  // FETCH SERVICE REQUESTS
  useEffect(() => {

    fetchServices();

  }, []);

  const fetchServices = async () => {
    try {
      const response = await apiInterceptor.get("/services");
      setServices(response.data || []);
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  // DELETE
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure want to delete?");
    if (!confirmDelete) return;

    try {
      // Assuming a DELETE endpoint exists or simply refetching for now.
      // If no DELETE endpoint exists, we'll just mock it in UI for now:
      // await apiInterceptor.delete("/services/${id}");
      const updatedServices = services.filter((item) => item.id !== id);
      setServices(updatedServices);
    } catch (error) {
      console.error("Error deleting service:", error);
    }
  };

  // STATUS COLOR
  const getStatusColor = (status) => {

    switch (status) {

      case "OPEN":
        return "bg-blue-100 text-blue-400";

      case "IN_PROGRESS":
        return "bg-yellow-100 text-amber-400";

      case "RESOLVED":
        return "bg-green-100 text-emerald-400";

      case "CLOSED":
        return "bg-white/10 text-gray-300";

      default:
        return "bg-white/5 text-white text-gray-300";
    }
  };

  // PRIORITY COLOR
  const getPriorityColor = (
    priority
  ) => {

    switch (priority) {

      case "LOW":
        return "bg-green-100 text-emerald-400";

      case "MEDIUM":
        return "bg-blue-100 text-blue-400";

      case "HIGH":
        return "bg-orange-100 text-orange-700";

      case "URGENT":
        return "bg-red-100 text-red-400";

      default:
        return "bg-white/5 text-white text-gray-300";
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

          <ChevronRight size={14} />

          <span
            className="cursor-pointer hover:text-purple-300"
            onClick={() =>
              navigate("/dashboard/client/service")
            }
          >
            Service
          </span>

          <ChevronRight size={14} />

          <span className="font-medium text-white">
            Service History
          </span>

        </div>

      </div>

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">

        <div className="flex items-center gap-4">

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
              Service History
            </h2>

            <p className="text-sm text-gray-400">
              Manage all service requests
            </p>

          </div>

        </div>

        {/* ADD BUTTON */}
        <button
          onClick={() =>
            navigate(
              "/dashboard/client/service/add"
            )
          }
          className="flex items-center gap-2 px-5 py-3 rounded-xl text-white text-sm font-semibold shadow-md"
          style={{
            background:
              "linear-gradient(135deg,#059669,#10b981)",
          }}
        >
          <Plus size={18} />

          Create Request
        </button>

      </div>

      {/* TABLE */}
      <div className="bg-[#140f2d]/80 rounded-3xl shadow-sm overflow-hidden">

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead className="bg-white/5 text-white">

              <tr className="text-left">

                <th className="px-5 py-4 text-sm font-semibold text-purple-300">
                  Ticket
                </th>

                <th className="px-5 py-4 text-sm font-semibold text-purple-300">
                  Client ID
                </th>

                <th className="px-5 py-4 text-sm font-semibold text-purple-300">
                  Order ID
                </th>

                <th className="px-5 py-4 text-sm font-semibold text-purple-300">
                  Title
                </th>

                <th className="px-5 py-4 text-sm font-semibold text-purple-300">
                  Priority
                </th>

                <th className="px-5 py-4 text-sm font-semibold text-purple-300">
                  Status
                </th>

                <th className="px-5 py-4 text-sm font-semibold text-purple-300">
                  Request Date
                </th>

                <th className="px-5 py-4 text-sm font-semibold text-purple-300">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>

              {services.length > 0 ? (

                services.map((item) => (

                  <tr
                    key={item.id}
                    className="border-t"
                  >

                    <td className="px-5 py-4 text-sm font-medium">
                      {item.ticketNumber}
                    </td>

                    <td className="px-5 py-4 text-sm">
                      {item.clientId}
                    </td>

                    <td className="px-5 py-4 text-sm">
                      {item.orderId || "-"}
                    </td>

                    <td className="px-5 py-4 text-sm">
                      {item.title}
                    </td>

                    <td className="px-5 py-4 text-sm">

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(item.priority)}`}
                      >
                        {item.priority || "-"}
                      </span>

                    </td>

                    <td className="px-5 py-4 text-sm">

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(item.status)}`}
                      >
                        {item.status}
                      </span>

                    </td>

                    <td className="px-5 py-4 text-sm">
                      {item.requestDate}
                    </td>

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
                          className="p-2 rounded-lg bg-yellow-100 text-amber-400"
                        >
                          <Pencil size={16} />
                        </button>

                        {/* DELETE */}
                        <button
                          onClick={() =>
                            handleDelete(item.id)
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
                    No service requests found
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

export default ServiceHistory;

