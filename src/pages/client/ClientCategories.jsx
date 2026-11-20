// src/pages/client/ClientCategories.jsx

import React, {
  useEffect,
  useState,
} from "react";

import apiInterceptor from "../../interceptors/interceptors";

import {
  ArrowLeft,
  ChevronRight,
  LayoutGrid,
  Plus,
  Pencil,
  Trash2,
  Search,
  Tag,
  CheckCircle2,
  RotateCcw,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

const ClientCategories = () => {

  const navigate = useNavigate();

  // ================= STATES =================

  const [categories,
    setCategories] =
    useState([]);

  const [filteredCategories,
    setFilteredCategories] =
    useState([]);

  const [search,
    setSearch] =
    useState("");

  const [loading,
    setLoading] =
    useState(false);

  const [showModal,
    setShowModal] =
    useState(false);

  const [editingId,
    setEditingId] =
    useState(null);

  // ================= FORM =================

  const [formData,
    setFormData] =
    useState({
      name: "",
      description: "",
      color: "#2563EB",
    });

  // ================= FETCH ALL =================

  const fetchCategories =
    async () => {

      try {

        setLoading(true);

        const response =
          await apiInterceptor.get(
            "/client-categories/getall"
          );

        const data = response.data?.data || response.data;

        setCategories(
          Array.isArray(data) ? data : []
        );

        setFilteredCategories(
          Array.isArray(data) ? data : []
        );

      } catch (error) {

        console.error(
          "Fetch error:",
          error
        );

      } finally {

        setLoading(false);
      }
    };

  // ================= ACTIVE =================

  const fetchActiveCategories =
    async () => {

      try {

        setLoading(true);

        const response =
          await apiInterceptor.get(
            "/client-categories/active"
          );

        const data = response.data?.data || response.data;

        setCategories(
          Array.isArray(data) ? data : []
        );

        setFilteredCategories(
          Array.isArray(data) ? data : []
        );

      } catch (error) {

        console.error(error);

      } finally {

        setLoading(false);
      }
    };

  // ================= SEARCH =================

  useEffect(() => {

    if (!search) {
      setFilteredCategories(categories);
      return;
    }

    const s = search.toLowerCase();
    setFilteredCategories(
      categories.filter((c) =>
        (c.name && c.name.toLowerCase().includes(s)) ||
        (c.description && c.description.toLowerCase().includes(s))
      )
    );

  }, [search, categories]);

  // ================= LOAD =================

  useEffect(() => {

    fetchCategories();

  }, []);

  // ================= HANDLE CHANGE =================

  const handleChange =
    (e) => {

      setFormData({
        ...formData,
        [e.target.name]:
          e.target.value,
      });
    };

  // ================= SUBMIT =================

  const handleSubmit =
    async (e) => {

      e.preventDefault();

      try {

        // CREATE

        if (!editingId) {

          await apiInterceptor.post(
            "/client-categories/create",
            formData
          );

        } else {

          // UPDATE

          await apiInterceptor.put(
            `/client-categories/${editingId}`,
            formData
          );
        }

        fetchCategories();

        setShowModal(false);

        setEditingId(null);

        setFormData({
          name: "",
          description: "",
          color: "#2563EB",
        });

      } catch (error) {

        console.error(
          "Save error:",
          error
        );
      }
    };

  // ================= EDIT =================

  const handleEdit =
    (item) => {

      setEditingId(
        item.id
      );

      setFormData({
        name: item.name,
        description:
          item.description,
        color: item.color,
      });

      setShowModal(true);
    };

  // ================= DELETE =================

  const handleDelete =
    async (id) => {

      const confirmDelete =
        window.confirm(
          "Delete this category?"
        );

      if (!confirmDelete)
        return;

      try {

        await apiInterceptor.delete(
          `/client-categories/${id}`
        );

        fetchCategories();

      } catch (error) {

        console.error(
          "Delete error:",
          error
        );
      }
    };

  // ================= RESET =================

  const handleReset =
    () => {

      setSearch("");

      fetchCategories();
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

        <span className="font-medium text-white">
          Client Categories
        </span>

      </div>

      {/* ================= HEADER ================= */}

      <div className="flex items-center justify-between mb-6">

        <div className="flex items-center gap-4">

          {/* BACK */}

          <button
            onClick={() =>
              navigate(
                "/dashboard/client"
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

            <LayoutGrid
              size={22}
              style={{
                color: "#2563EB",
              }}
            />

          </div>

          {/* TITLE */}

          <div>

            <h2 className="text-xl font-bold text-white">
              Client Categories
            </h2>

            <p className="text-sm text-gray-400">
              Manage all client categories
            </p>

          </div>

        </div>

        {/* ADD */}

        <button
          onClick={() => {

            setShowModal(true);

            setEditingId(null);

            setFormData({
              name: "",
              description: "",
              color:
                "#2563EB",
            });
          }}
          className="flex items-center gap-2 px-5 py-3 rounded-xl text-white text-sm font-semibold shadow-md"
          style={{
            background:
              "linear-gradient(135deg,#2563EB,#3B82F6)",
          }}
        >

          <Plus size={18} />

          Add Category

        </button>

      </div>

      {/* ================= SEARCH ================= */}

      <div className="bg-[#140f2d]/80 rounded-3xl shadow-sm p-5 mb-6">

        <div className="flex flex-wrap gap-4 items-center">

          {/* SEARCH */}

          <div className="flex items-center bg-purple-500/10 rounded-2xl px-4 py-3 flex-1">

            <Search
              size={18}
              className="text-gray-400"
            />

            <input
              type="text"
              placeholder="Search category..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              className="bg-transparent outline-none px-3 w-full"
            />

          </div>

          {/* ACTIVE */}

          <button
            onClick={
              fetchActiveCategories
            }
            className="px-5 py-3 rounded-2xl bg-green-100 text-emerald-400 font-semibold flex items-center gap-2"
          >

            <CheckCircle2
              size={18}
            />

            Active Categories

          </button>

          {/* RESET */}

          <button
            onClick={
              handleReset
            }
            className="px-5 py-3 rounded-2xl bg-white/5 text-white text-gray-300 font-semibold flex items-center gap-2"
          >

            <RotateCcw
              size={18}
            />

            Reset

          </button>

        </div>

      </div>

      {/* ================= CARDS ================= */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        {!loading &&
        filteredCategories.length >
          0 ? (

          filteredCategories.map(
            (item) => (

              <div
                key={item.id}
                className="bg-[#140f2d]/80 rounded-3xl shadow-sm p-5 border border-white/10"
              >

                {/* TOP */}

                <div className="flex items-start justify-between mb-4">

                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{
                      background:
                        item.color,
                    }}
                  >

                    <Tag
                      size={20}
                      className="text-white"
                    />

                  </div>

                  {/* ACTIONS */}

                  <div className="flex gap-2">

                    {/* EDIT */}

                    <button
                      onClick={() =>
                        handleEdit(
                          item
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

                </div>

                {/* NAME */}

                <h3 className="text-lg font-bold text-white mb-2">
                  {item.name}
                </h3>

                {/* DESCRIPTION */}

                <p className="text-sm text-gray-400 leading-relaxed min-h-[60px]">

                  {item.description
                    ? item.description
                    : "No description"}

                </p>

                {/* STATUS */}

                <div className="mt-5 flex items-center justify-between">

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      item.isActive
                        ? "bg-green-100 text-emerald-400"
                        : "bg-red-100 text-red-400"
                    }`}
                  >

                    {item.isActive
                      ? "Active"
                      : "Inactive"}

                  </span>

                  {/* COLOR */}

                  <div
                    className="w-6 h-6 rounded-full border"
                    style={{
                      background:
                        item.color,
                    }}
                  />

                </div>

              </div>
            )
          )

        ) : (

          <div className="col-span-3 bg-[#140f2d]/80 rounded-3xl shadow-sm p-16 text-center text-gray-400">

            {loading
              ? "Loading categories..."
              : "No categories found"}

          </div>

        )}

      </div>

      {/* ================= MODAL ================= */}

      {showModal && (

        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

          <div className="bg-[#140f2d]/80 rounded-3xl shadow-xl w-full max-w-lg p-6">

            {/* TITLE */}

            <div className="mb-6">

              <h2 className="text-2xl font-bold text-white">

                {editingId
                  ? "Update Category"
                  : "Create Category"}

              </h2>

              <p className="text-sm text-gray-400 mt-1">

                Enter category details

              </p>

            </div>

            {/* FORM */}

            <form
              onSubmit={
                handleSubmit
              }
              className="space-y-5"
            >

              {/* NAME */}

              <div>

                <label className="block text-sm font-semibold text-purple-300 mb-2">

                  Category Name

                </label>

                <input
                  type="text"
                  name="name"
                  value={
                    formData.name
                  }
                  onChange={
                    handleChange
                  }
                  required
                  className="w-full px-4 py-3 rounded-2xl bg-purple-500/10 outline-none"
                  placeholder="Enter category name"
                />

              </div>

              {/* DESCRIPTION */}

              <div>

                <label className="block text-sm font-semibold text-purple-300 mb-2">

                  Description

                </label>

                <textarea
                  name="description"
                  value={
                    formData.description
                  }
                  onChange={
                    handleChange
                  }
                  rows="4"
                  className="w-full px-4 py-3 rounded-2xl bg-purple-500/10 outline-none resize-none"
                  placeholder="Enter description"
                />

              </div>

              {/* COLOR */}

              <div>

                <label className="block text-sm font-semibold text-purple-300 mb-2">

                  Category Color

                </label>

                <input
                  type="color"
                  name="color"
                  value={
                    formData.color
                  }
                  onChange={
                    handleChange
                  }
                  className="w-20 h-12 rounded-xl border-none"
                />

              </div>

              {/* BUTTONS */}

              <div className="flex justify-end gap-3 pt-4">

                <button
                  type="button"
                  onClick={() =>
                    setShowModal(
                      false
                    )
                  }
                  className="px-5 py-3 rounded-2xl bg-white/5 text-white text-gray-300 font-semibold"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-5 py-3 rounded-2xl text-white font-semibold bg-blue-600"
                >

                  {editingId
                    ? "Update"
                    : "Create"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>

  );
};

export default ClientCategories;

