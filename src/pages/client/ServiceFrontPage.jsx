import React from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  ChevronRight,
  Wrench,
  ClipboardList,
  History,
  ShieldCheck,
  MessageSquareWarning,
} from "lucide-react";

const SECTIONS = [
  {
    label: "Service Requests",
    desc: "Manage customer support and requests",
    icon: ClipboardList,
    route: "/dashboard/client/service/add",
    color: "#8b5cf6",
    bg: "rgba(139,92,246,0.12)",
  },

  {
    label: "Service History",
    desc: "Track completed and ongoing services",
    icon: History,
    route: "/dashboard/client/service/history",
    color: "#059669",
    bg: "rgba(16,185,129,0.15)",
  },

  {
    label: "Warranty Management",
    desc: "Handle warranty coverage and claims",
    icon: ShieldCheck,
    route: "/dashboard/client/service/warranty",
    color: "#D97706",
    bg: "rgba(245,158,11,0.15)",
  },

  {
    label: "Complaints",
    desc: "Manage complaints and issue resolution",
    icon: MessageSquareWarning,
    route: "/dashboard/client/service/complaints",
    color: "#7C3AED",
    bg: "rgba(139,92,246,0.12)",
  },
];

export default function ServiceFrontPage() {

  const navigate = useNavigate();

  return (

    <div
      className="p-6 min-h-screen"
      style={{ background: "rgba(139,92,246,0.10)" }}
    >

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-purple-300 mb-4 font-medium">
        <button
          onClick={() => navigate("/dashboard/client")}
          className="hover:text-purple-200 transition-colors"
        >
          Client Management
        </button>
        <ChevronRight size={12} />
        <span className="text-white font-semibold">Service</span>
      </div>

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">

        {/* Back */}
        <button
          onClick={() => navigate("/dashboard/client")}
          className="
            w-9 h-9 rounded-xl
            border border-white/10
            bg-[#140f2d]/80
            flex items-center justify-center
            hover:bg-white/10
            transition-colors
            shadow-sm
          "
        >
          <ArrowLeft
            size={16}
            className="text-purple-300"
          />
        </button>

        {/* Title */}
        <div className="flex items-center gap-2">

          <div
            className="
              w-8 h-8 rounded-lg
              bg-gradient-to-br
              from-purple-500
              to-purple-400
              flex items-center justify-center
            "
          >
            <Wrench
              size={15}
              className="text-white"
            />
          </div>

          <div>

            <h1 className="text-xl font-extrabold text-white">
              Service
            </h1>

            <p className="text-xs text-gray-400 mt-0.5">
              Requests, complaints and warranty
            </p>

          </div>

        </div>

      </div>

      {/* Cards */}
      <div className="flex flex-col gap-4">

        {SECTIONS.map((sec, idx) => {

          const Icon = sec.icon;

          return (

            <button
              key={idx}
              onClick={() => navigate(sec.route)}
              className="
                relative flex items-center gap-4
                bg-[#140f2d]/80 rounded-2xl p-5
                shadow-sm border border-white/10
                hover:shadow-xl hover:-translate-y-1
                transition-all duration-200
                group text-left overflow-hidden
              "
            >

              {/* Icon */}
              <div
                className="
                  w-14 h-14 rounded-2xl
                  flex items-center justify-center
                  flex-shrink-0
                  transition-all duration-200
                  group-hover:scale-110
                "
                style={{ background: sec.bg }}
              >
                <Icon
                  size={24}
                  style={{ color: sec.color }}
                />
              </div>

              {/* Content */}
              <div className="flex-1">

                <p
                  className="
                    font-bold text-white
                    text-base
                    group-hover:text-purple-300
                    transition-colors
                  "
                >
                  {sec.label}
                </p>

                <p
                  className="
                    text-xs text-gray-400
                    mt-0.5 leading-relaxed
                  "
                >
                  {sec.desc}
                </p>

              </div>

              {/* Number */}
              <span
                className="
                  text-2xl font-black
                  opacity-10 absolute
                  right-4 top-1/2
                  -translate-y-1/2
                "
                style={{ color: sec.color }}
              >
                {idx + 1}
              </span>

            </button>
          );
        })}

      </div>

    </div>
  );
}
