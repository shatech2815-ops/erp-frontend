import React, { useState, useEffect } from "react";
import apiInterceptor from "../../interceptors/interceptors";
import {
  ArrowLeft,
  MessageSquare,
  Star,
  ThumbsUp,
  ChevronRight,
  Download,
  Smile,
  Frown,
  Meh,
  Plus,
  X
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const ClientFeedbackReport = () => {
  const navigate = useNavigate();

  const [feedbacks, setFeedbacks] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    clientName: "",
    rating: 5,
    sentiment: "positive",
    comment: ""
  });

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const response = await apiInterceptor.get("/feedbacks");
      setFeedbacks(response.data || []);
    } catch (error) {
      console.error("Error fetching feedbacks:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await apiInterceptor.get("/clients");
      setClients(response.data || []);
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
    fetchClients();
  }, []);

  const averageRating =
    feedbacks.length > 0
      ? (
          feedbacks.reduce((sum, fb) => sum + Number(fb.rating || 0), 0) /
          feedbacks.length
        ).toFixed(1)
      : "0.0";
  const positiveCount = feedbacks.filter((fb) => fb.sentiment === "positive").length;
  const negativeCount = feedbacks.filter((fb) => fb.sentiment === "negative").length;

  const handleRatingChange = (stars) => {
    let autoSentiment = "positive";
    if (stars === 3) autoSentiment = "neutral";
    else if (stars <= 2) autoSentiment = "negative";
    setFormData((prev) => ({
      ...prev,
      rating: stars,
      sentiment: autoSentiment
    }));
  };

  const handleAddFeedback = async (e) => {
    e.preventDefault();
    if (!formData.clientName.trim()) {
      alert("Please select or enter a client name.");
      return;
    }
    if (!formData.comment.trim()) {
      alert("Please enter feedback comments.");
      return;
    }

    try {
      setSubmitting(true);
      await apiInterceptor.post("/feedbacks", {
        clientName: formData.clientName.trim(),
        rating: Number(formData.rating),
        sentiment: formData.sentiment,
        comment: formData.comment.trim()
      });
      setShowAddModal(false);
      setFormData({
        clientName: "",
        rating: 5,
        sentiment: "positive",
        comment: ""
      });
      fetchFeedbacks();
      alert("Client feedback added successfully!");
    } catch (error) {
      console.error("Error adding feedback:", error);
      alert(error.response?.data?.error || "Failed to add feedback");
    } finally {
      setSubmitting(false);
    }
  };

  const handleExport = () => {
    if (!feedbacks || feedbacks.length === 0) {
      alert("No feedback records available to export. Please click 'Add Feedback' to create records first.");
      return;
    }

    const headers = ["Client", "Date", "Rating", "Feedback", "Sentiment"];
    const rows = feedbacks.map((fb) => [
      fb.clientName || "—",
      fb.createdAt
        ? new Date(fb.createdAt).toLocaleDateString()
        : fb.date
        ? new Date(fb.date).toLocaleDateString()
        : "—",
      fb.rating || 0,
      fb.comment || fb.feedback || "—",
      fb.sentiment || "—"
    ]);

    const csvContent = [
      headers.map((h) => `"${h}"`).join(","),
      ...rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `client-feedback-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
  };

  return (
    <div className="min-h-screen bg-[#0f0a1c] text-white p-6 font-sans">
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate("/dashboard/client/reports")}
            className="p-2 rounded-xl bg-white/5 text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <ArrowLeft size={20} className="text-gray-300" />
          </button>
          <div>
            <div className="flex items-center text-xs text-gray-400 mb-1 space-x-2">
              <span
                className="cursor-pointer hover:text-purple-300 transition-colors"
                onClick={() => navigate("/dashboard/client")}
              >
                Client Management
              </span>
              <ChevronRight size={12} />
              <span
                className="cursor-pointer hover:text-purple-300 transition-colors"
                onClick={() => navigate("/dashboard/client/reports")}
              >
                Reports
              </span>
              <ChevronRight size={12} />
              <span className="text-purple-400">Feedback</span>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
              Client Feedback Report
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-md cursor-pointer text-sm"
          >
            <Plus size={16} />
            <span>Add Feedback</span>
          </button>

          <button
            onClick={handleExport}
            className="flex items-center space-x-2 px-4 py-2.5 bg-white/5 text-white border border-white/10 rounded-xl hover:bg-white/10 transition-colors cursor-pointer text-sm font-semibold"
          >
            <Download size={16} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-[#140f2d] p-6 rounded-2xl border border-white/5 shadow-lg relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-500/10 rounded-full blur-xl" />
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
              <MessageSquare size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-400 font-medium">Total Feedback</p>
              <h2 className="text-3xl font-bold text-purple-300 mt-1">{feedbacks.length}</h2>
            </div>
          </div>
        </div>

        <div className="bg-[#140f2d] p-6 rounded-2xl border border-white/5 shadow-lg relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-yellow-500/10 rounded-full blur-xl" />
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center text-yellow-400">
              <Star size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-400 font-medium">Avg Rating</p>
              <h2 className="text-3xl font-bold text-yellow-300 mt-1">{averageRating} / 5</h2>
            </div>
          </div>
        </div>

        <div className="bg-[#140f2d] p-6 rounded-2xl border border-white/5 shadow-lg relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl" />
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Smile size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-400 font-medium">Positive Sentiments</p>
              <h2 className="text-3xl font-bold text-emerald-300 mt-1">{positiveCount}</h2>
            </div>
          </div>
        </div>

        <div className="bg-[#140f2d] p-6 rounded-2xl border border-white/5 shadow-lg relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-red-500/10 rounded-full blur-xl" />
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center text-red-400">
              <Frown size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-400 font-medium">Negative Sentiments</p>
              <h2 className="text-3xl font-bold text-red-300 mt-1">{negativeCount}</h2>
            </div>
          </div>
        </div>
      </div>

      {/* RECENT FEEDBACK TABLE */}
      <div className="bg-[#140f2d] rounded-2xl border border-white/5 overflow-hidden shadow-lg">
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-100">Recent Client Reviews</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-white text-gray-400 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Client</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Rating</th>
                <th className="px-6 py-4 font-semibold">Feedback</th>
                <th className="px-6 py-4 font-semibold text-center">Sentiment</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-12 text-gray-400">
                    Loading feedbacks...
                  </td>
                </tr>
              ) : feedbacks.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-12 text-gray-400">
                    No client feedback records found. Click "Add Feedback" above to create one.
                  </td>
                </tr>
              ) : (
                feedbacks.map((fb) => (
                  <tr
                    key={fb.id}
                    className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-200">{fb.clientName}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {fb.createdAt ? new Date(fb.createdAt).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className={
                              i < fb.rating
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-gray-600"
                            }
                          />
                        ))}
                      </div>
                    </td>
                    <td
                      className="px-6 py-4 text-sm text-gray-300 max-w-md truncate"
                      title={fb.comment}
                    >
                      "{fb.comment}"
                    </td>
                    <td className="px-6 py-4 text-center">
                      {fb.sentiment === "positive" && (
                        <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold">
                          Positive
                        </span>
                      )}
                      {fb.sentiment === "neutral" && (
                        <span className="inline-block px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-semibold">
                          Neutral
                        </span>
                      )}
                      {fb.sentiment === "negative" && (
                        <span className="inline-block px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-semibold">
                          Negative
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD FEEDBACK MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#140f2d] border border-white/10 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative text-white">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-red-400 transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <MessageSquare className="text-purple-400" size={22} />
              Add Client Feedback
            </h2>

            <form onSubmit={handleAddFeedback} className="space-y-4">
              {/* CLIENT */}
              <div>
                <label className="block text-xs font-semibold text-purple-300 uppercase tracking-wide mb-1">
                  Client Name *
                </label>
                {clients.length > 0 ? (
                  <select
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-[#0f0a1c] text-white text-sm outline-none focus:border-purple-500"
                    required
                  >
                    <option value="">Select Client</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.name} className="bg-[#140f2d] text-white">
                        {c.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    placeholder="Enter client or company name"
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white text-sm outline-none focus:border-purple-500"
                    required
                  />
                )}
              </div>

              {/* RATING */}
              <div>
                <label className="block text-xs font-semibold text-purple-300 uppercase tracking-wide mb-2">
                  Rating: {formData.rating} / 5 Stars
                </label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleRatingChange(star)}
                      className="p-1 hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Star
                        size={28}
                        className={
                          star <= formData.rating
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-600"
                        }
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* SENTIMENT */}
              <div>
                <label className="block text-xs font-semibold text-purple-300 uppercase tracking-wide mb-2">
                  Sentiment
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    {
                      key: "positive",
                      label: "Positive",
                      color: "border-emerald-500 bg-emerald-500/20 text-emerald-300"
                    },
                    {
                      key: "neutral",
                      label: "Neutral",
                      color: "border-blue-500 bg-blue-500/20 text-blue-300"
                    },
                    {
                      key: "negative",
                      label: "Negative",
                      color: "border-red-500 bg-red-500/20 text-red-300"
                    }
                  ].map((s) => (
                    <button
                      key={s.key}
                      type="button"
                      onClick={() => setFormData({ ...formData, sentiment: s.key })}
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold capitalize transition-all cursor-pointer ${
                        formData.sentiment === s.key
                          ? s.color
                          : "border-white/10 bg-white/5 text-gray-400 hover:bg-white/10"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* COMMENT */}
              <div>
                <label className="block text-xs font-semibold text-purple-300 uppercase tracking-wide mb-1">
                  Feedback Comments *
                </label>
                <textarea
                  rows={3}
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  placeholder="Share details of the client review or feedback..."
                  className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white text-sm outline-none resize-none focus:border-purple-500"
                  required
                />
              </div>

              {/* ACTIONS */}
              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 bg-white/10 hover:bg-white/15 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 shadow-md cursor-pointer"
                >
                  {submitting ? "Submitting..." : "Save Feedback"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientFeedbackReport;


