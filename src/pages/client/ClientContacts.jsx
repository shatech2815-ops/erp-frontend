// src/pages/client/ClientContact.jsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Users,
  Plus,
  Trash2,
  Mail,
  Phone,
  Building2,
  ChevronRight,
  X,
} from "lucide-react";
import apiInterceptor from "../../interceptors/interceptors";

const ClientContact = () => {
    const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [clients, setClients] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    title: "",
    email: "",
    phone: "",
    department: "",
    primaryContact: false,
    notes: "",
    client: "",
  });

  useEffect(() => {
    loadContacts();
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const res = await apiInterceptor.get("/clients");
      setClients(res.data || []);
    } catch (err) {
      console.error("Error fetching clients:", err);
    }
  };

  const loadContacts = () => {
    const storedContacts =
      JSON.parse(localStorage.getItem("clientContacts")) ||
      [];

    setContacts(storedContacts);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]:
        type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.firstName || !formData.firstName.trim()) {
      alert("Please enter First Name");
      return;
    }

    if (!formData.email || !formData.email.trim()) {
      alert("Please enter Email Address");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      alert("Please enter a valid email address");
      return;
    }

    if (!formData.phone || !formData.phone.trim()) {
      alert("Please enter Phone Number");
      return;
    }

    const existingContacts =
      JSON.parse(
        localStorage.getItem("clientContacts")
      ) || [];

    const updatedContacts = [
      ...existingContacts,
      formData,
    ];

    localStorage.setItem(
      "clientContacts",
      JSON.stringify(updatedContacts)
    );

    setContacts(updatedContacts);

    alert("Client Contact Added Successfully");

    setFormData({
      firstName: "",
      lastName: "",
      title: "",
      email: "",
      phone: "",
      department: "",
      primaryContact: false,
      notes: "",
      client: "",
    });
  };

  const deleteContact = (index) => {
    const updatedContacts = contacts.filter(
      (_, i) => i !== index
    );

    localStorage.setItem(
      "clientContacts",
      JSON.stringify(updatedContacts)
    );

    setContacts(updatedContacts);
  };

  return (
    <div>

      {/* Breadcrumb */}
<div className="flex items-center gap-2 text-xs text-purple-300 mb-4 font-medium">

  <button
    onClick={() => navigate('/dashboard/client')}
    className="hover:text-purple-300 transition-colors"
  >
    Client Management
  </button>

  <ChevronRight size={12} className="text-gray-300" />

  <button
    onClick={() => navigate('/dashboard/client/clients')}
    className="hover:text-purple-300 transition-colors"
  >
    Clients
  </button>

  <ChevronRight size={12} className="text-gray-300" />

  <span className="text-white font-semibold">
    Client Contacts
  </span>

</div>

{/* Header */}
<div className="flex items-center gap-4 mb-6">

  {/* BACK BUTTON */}
  <button
    onClick={() => navigate('/dashboard/client/clients')}
    className="w-10 h-10 rounded-xl bg-[#140f2d]/80 border border-white/10 flex items-center justify-center text-purple-300 hover:bg-white/10 transition-colors shadow-sm"
  >
    <ArrowLeft size={16} />
  </button>

  {/* ICON */}
  <div
    className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm"
    style={{ background: 'rgba(59,130,246,0.15)' }}
  >
    <Users size={22} style={{ color: '#2563eb' }} />
  </div>

  {/* TITLE */}
  <div className="flex-1">

    <h2 className="text-xl font-bold text-white">
      Client Contacts
    </h2>

    <p className="text-sm text-gray-400">
      Manage all client contact details
    </p>

  </div>

</div>
      {/* FORM */}
      <div className="bg-[#140f2d]/80 rounded-3xl p-6 shadow-sm mb-6">

        <h2 className="text-[16px] font-semibold text-white mb-5 border-b pb-3">
          Add Client Contact
        </h2>

        <form onSubmit={handleSubmit}>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

            {/* FIRST NAME */}
            <div>
              <label className="block text-xs font-semibold text-purple-300 mb-1">
                First Name *
              </label>

              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="First name"
                className="w-full px-3 py-2.5 rounded-xl border border-white/10 text-sm bg-white/5 text-white"
                required
              />
            </div>

            {/* LAST NAME */}
            <div>
              <label className="block text-xs font-semibold text-purple-300 mb-1">
                Last Name
              </label>

              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Last name"
                className="w-full px-3 py-2.5 rounded-xl border border-white/10 text-sm bg-white/5 text-white"
              />
            </div>

            {/* TITLE */}
            <div>
              <label className="block text-xs font-semibold text-purple-300 mb-1">
                Title
              </label>

              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Manager"
                className="w-full px-3 py-2.5 rounded-xl border border-white/10 text-sm bg-white/5 text-white"
              />
            </div>

            {/* CLIENT */}
            <div>
              <label className="block text-xs font-semibold text-purple-300 mb-1">
                Client Name
              </label>

              {clients && clients.length > 0 ? (
                <select
                  name="client"
                  value={formData.client}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-xl border border-white/10 text-sm bg-[#140f2d] text-white outline-none"
                >
                  <option value="" className="bg-[#140f2d] text-white">Select Client</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.name} className="bg-[#140f2d] text-white">
                      {c.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  name="client"
                  value={formData.client}
                  onChange={handleChange}
                  placeholder="Client company"
                  className="w-full px-3 py-2.5 rounded-xl border border-white/10 text-sm bg-white/5 text-white"
                />
              )}
            </div>

            {/* EMAIL */}
            <div>
              <label className="block text-xs font-semibold text-purple-300 mb-1">
                Email *
              </label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="contact@email.com"
                className="w-full px-3 py-2.5 rounded-xl border border-white/10 text-sm bg-white/5 text-white"
                required
              />
            </div>

            {/* PHONE */}
            <div>
              <label className="block text-xs font-semibold text-purple-300 mb-1">
                Phone *
              </label>

              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 XXXXX XXXXX"
                className="w-full px-3 py-2.5 rounded-xl border border-white/10 text-sm bg-white/5 text-white"
                required
              />
            </div>

            {/* DEPARTMENT */}
            <div>
              <label className="block text-xs font-semibold text-purple-300 mb-1">
                Department
              </label>

              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                placeholder="Sales"
                className="w-full px-3 py-2.5 rounded-xl border border-white/10 text-sm bg-white/5 text-white"
              />
            </div>

            {/* PRIMARY */}
            <div className="flex items-center gap-3 mt-6">

              <input
                type="checkbox"
                name="primaryContact"
                checked={formData.primaryContact}
                onChange={handleChange}
                className="w-4 h-4"
              />

              <label className="text-sm font-medium text-white">
                Primary Contact
              </label>

            </div>

          </div>

          {/* NOTES */}
          <div className="mt-5">
            <label className="block text-xs font-semibold text-purple-300 mb-1">
              Notes
            </label>

            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="4"
              placeholder="Additional notes"
              className="w-full px-3 py-2.5 rounded-xl border border-white/10 text-sm bg-white/5 text-white"
            />
          </div>

          {/* BUTTON */}
          <div className="flex justify-end mt-6">

            <button
              type="submit"
              className="bg-[#4f6f91] hover:bg-[#3d5d80] text-white px-6 py-3 rounded-xl text-sm font-semibold shadow"
            >
              <div className="flex items-center gap-2">
                <Plus size={16} />
                Add Contact
              </div>
            </button>

          </div>

        </form>
      </div>

      {/* CONTACT LIST */}
{contacts.length > 0 && (
  <div className="bg-[#140f2d]/80 rounded-[24px] overflow-hidden shadow-sm mt-6">

    {/* TABLE HEADER */}
    <div className="bg-[#4f6f91] text-white">

      <div className="grid grid-cols-7 gap-4 px-6 py-4 text-[13px] font-semibold">

        <div>Contact Name</div>
        <div>Client</div>
        <div>Email</div>
        <div>Phone</div>
        <div>Department</div>
        <div>Type</div>
        <div>Actions</div>

      </div>
    </div>

    {/* TABLE BODY */}
    <div>

      {contacts.map((contact, index) => (
        <div
          key={index}
          className="grid grid-cols-7 gap-4 px-6 py-5 border-b border-white/10 items-center hover:bg-[rgba(250,252,255,0.12)]"
        >

          {/* NAME */}
          <div>
            <p className="text-[15px] font-semibold text-white">
              {contact.firstName} {contact.lastName}
            </p>

            <p className="text-xs text-gray-400 mt-1">
              {contact.title || "Client Contact"}
            </p>
          </div>

          {/* CLIENT */}
          <div className="text-sm text-gray-400">
            {contact.client || "-"}
          </div>

          {/* EMAIL */}
          <div className="text-sm text-gray-400 break-all">
            {contact.email || "-"}
          </div>

          {/* PHONE */}
          <div className="text-sm text-gray-400">
            {contact.phone || "-"}
          </div>

          {/* DEPARTMENT */}
          <div className="text-sm text-gray-400">
            {contact.department || "-"}
          </div>

          {/* TYPE */}
          <div>
            {contact.primaryContact ? (
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-[#19a463] text-xs font-semibold">
                Primary
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full bg-blue-500/10 text-gray-400 text-xs font-semibold">
                Secondary
              </span>
            )}
          </div>

          {/* ACTIONS */}
          <div className="flex items-center gap-4">

            <button
              onClick={() => {
                setSelectedContact(contact);
                setShowViewModal(true);
              }}
              className="text-purple-400 hover:text-purple-300 text-sm font-medium"
            >
              View
            </button>

            <button
              onClick={() => deleteContact(index)}
              className="text-red-400 hover:text-red-300"
            >
              <Trash2 size={16} />
            </button>

          </div>

        </div>
      ))}

    </div>

    {/* FOOTER */}
    <div className="px-6 py-4 text-sm text-gray-400">
      Showing {contacts.length} contact(s)
    </div>

  </div>
)}
      {/* VIEW CONTACT MODAL */}
      {showViewModal && selectedContact && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#140f2d] border border-white/10 rounded-3xl max-w-lg w-full p-6 text-white shadow-2xl relative">
            <button
              onClick={() => setShowViewModal(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-red-400 transition-colors"
            >
              <X size={20} />
            </button>

            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Users size={20} className="text-purple-400" />
              Contact Details
            </h3>

            <div className="space-y-3 text-sm">
              <div className="bg-purple-500/10 p-3.5 rounded-2xl">
                <span className="text-xs text-purple-300 font-semibold block uppercase mb-1">Full Name</span>
                <span className="font-bold text-white text-base">{selectedContact.firstName} {selectedContact.lastName || ""}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-purple-500/10 p-3.5 rounded-2xl">
                  <span className="text-xs text-purple-300 font-semibold block uppercase mb-1">Title</span>
                  <span className="text-white font-medium">{selectedContact.title || "—"}</span>
                </div>
                <div className="bg-purple-500/10 p-3.5 rounded-2xl">
                  <span className="text-xs text-purple-300 font-semibold block uppercase mb-1">Department</span>
                  <span className="text-white font-medium">{selectedContact.department || "—"}</span>
                </div>
              </div>
              <div className="bg-purple-500/10 p-3.5 rounded-2xl">
                <span className="text-xs text-purple-300 font-semibold block uppercase mb-1">Client</span>
                <span className="text-white font-medium">{selectedContact.client || "—"}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-purple-500/10 p-3.5 rounded-2xl">
                  <span className="text-xs text-purple-300 font-semibold block uppercase mb-1">Email</span>
                  <span className="text-purple-300 font-medium break-all">{selectedContact.email || "—"}</span>
                </div>
                <div className="bg-purple-500/10 p-3.5 rounded-2xl">
                  <span className="text-xs text-purple-300 font-semibold block uppercase mb-1">Phone</span>
                  <span className="text-white font-medium">{selectedContact.phone || "—"}</span>
                </div>
              </div>
              <div className="bg-purple-500/10 p-3.5 rounded-2xl">
                <span className="text-xs text-purple-300 font-semibold block uppercase mb-1">Contact Type</span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${selectedContact.primaryContact ? "bg-emerald-500/20 text-emerald-400" : "bg-blue-500/20 text-blue-300"}`}>
                  {selectedContact.primaryContact ? "Primary Contact" : "Secondary Contact"}
                </span>
              </div>
              {selectedContact.notes && (
                <div className="bg-purple-500/10 p-3.5 rounded-2xl">
                  <span className="text-xs text-purple-300 font-semibold block uppercase mb-1">Notes</span>
                  <span className="text-white/80 text-xs leading-relaxed">{selectedContact.notes}</span>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-5 py-2.5 bg-white/10 hover:bg-white/20 rounded-2xl text-xs font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientContact;

