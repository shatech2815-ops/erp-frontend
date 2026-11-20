import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, PackageOpen, RotateCcw, AlertTriangle, FileSpreadsheet, ArrowRight } from 'lucide-react';

export default function InventoryTestingFlow() {
  const navigate = useNavigate();

  const flows = [
    {
      title: "1. Setup Master Data",
      desc: "Create the foundation required to hold stock.",
      icon: <PackageOpen className="text-purple-400" size={24} />,
      color: "border-purple-500/30",
      steps: [
        "Go to Items -> Add New Item.",
        "Create an item (e.g. ID: 1, Name: 'Test Item', Reorder Level: 50).",
        "Make sure you have at least 2 Warehouses in Warehouse List."
      ]
    },
    {
      title: "2. Bring Stock In (Purchase Flow)",
      desc: "Simulate receiving stock from a vendor.",
      icon: <CheckCircle className="text-emerald-400" size={24} />,
      color: "border-emerald-500/30",
      steps: [
        "Go to Inventory -> Stock Receipt (IN).",
        "Enter Item ID: 1, Warehouse: 1, Quantity: 100.",
        "Check 'Physical Stock Balances' -> Should show 100 Available.",
        "Check 'Stock Movement Ledger' -> Shows RECEIPT of +100."
      ]
    },
    {
      title: "3. Internal Movement (Transfer)",
      desc: "Move stock between branches.",
      icon: <ArrowRight className="text-blue-400" size={24} />,
      color: "border-blue-500/30",
      steps: [
        "Go to Inventory -> Stock Transfer.",
        "Source: 1, Destination: 2, Quantity: 20.",
        "Check 'Physical Stock Balances' -> WH 1: 80, WH 2: 20."
      ]
    },
    {
      title: "4. Sales Flow (Reserve & Issue)",
      desc: "Simulate a customer order.",
      icon: <RotateCcw className="text-amber-400" size={24} />,
      color: "border-amber-500/30",
      steps: [
        "Go to Inventory -> Sales Pick List.",
        "Create Pick List for Item: 1, WH: 1, Qty: 30.",
        "Check 'Balances' -> On-hand: 80, Reserved: 30, Available: 50.",
        "Go back to Pick List -> Click 'Complete Pick'.",
        "Check 'Balances' -> On-hand: 50, Reserved: 0. Ledger shows ISSUE."
      ]
    },
    {
      title: "5. Audit & Low Stock",
      desc: "Check system health and physical inventory.",
      icon: <FileSpreadsheet className="text-rose-400" size={24} />,
      color: "border-rose-500/30",
      steps: [
        "Go to Inventory -> Low Stock Alerts (Should show your item since 50 <= Reorder 50).",
        "Go to Inventory -> Physical Stock Count.",
        "Enter WH: 1, click Load Snapshot. System says 50.",
        "Type 48 as Physical Quantity (Variance -2) and POST.",
        "Check 'Balances' -> Available is 48. Ledger shows ADJUSTMENT."
      ]
    }
  ];

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-[#140f2d]/80 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors shadow-sm"><ArrowLeft size={16} /></button>
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2"><AlertTriangle className="text-yellow-400" /> Temporary Testing Flow Guide</h2>
          <p className="text-sm text-gray-400">Follow these exact steps to test the Inventory Module end-to-end. (Remove this page when done).</p>
        </div>
      </div>

      <div className="space-y-6">
        {flows.map((f, i) => (
          <div key={i} className={`bg-[#140f2d]/80 rounded-2xl p-6 border ${f.color} shadow-lg flex gap-6 items-start`}>
             <div className="mt-1">{f.icon}</div>
             <div>
                <h3 className="text-lg font-bold text-white mb-1">{f.title}</h3>
                <p className="text-sm text-gray-400 mb-4">{f.desc}</p>
                <ul className="space-y-2">
                  {f.steps.map((step, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-sm text-gray-300 font-semibold bg-white/5 px-4 py-2 rounded-lg">
                       <span className="w-6 h-6 rounded-full bg-black/30 flex items-center justify-center text-xs text-white shrink-0">{idx + 1}</span>
                       {step}
                    </li>
                  ))}
                </ul>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}
