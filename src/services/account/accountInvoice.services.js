
import apiInterceptor from "../../interceptors/interceptors";

// ========================
// CREATE Invoice
// ========================
export const createInvoice = async (invoiceData) => {
  try {
    const response = await apiInterceptor.post(
      "/invoices/create-invoice",
      invoiceData
    );
    return response.data;
  } catch (error) {
    console.error("Error creating invoice:", error);
    throw error;
  }
};

// ========================
// GET All Invoices
// ========================
export const getAllAccountInvoices = async () => {
  try {
    const response = await apiInterceptor.get("/invoices/get-all-invoices");
    return response.data;
  } catch (error) {
    console.error("Error fetching invoices:", error);
    throw error;
  }
};

// ========================
// GET Invoice By ID
// ========================
export const getInvoiceById = async (id) => {
  try {
    const response = await apiInterceptor.get(`/invoices/get-invoice/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching invoice by ID:", error);
    throw error;
  }
};

// ========================
// UPDATE Invoice
// ========================
export const updateInvoice = async (id, invoiceData) => {
  try {
    const response = await apiInterceptor.put(
      `/invoices/${id}`,
      invoiceData
    );
    return response.data;
  } catch (error) {
    console.error("Error updating invoice:", error);
    throw error;
  }
};

// ========================
// DELETE Invoice
// ========================
export const deleteInvoice = async (id) => {
  try {
    const response = await apiInterceptor.delete(`/invoices/delete-invoice/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting invoice:", error);
    throw error;
  }
};

// ========================
// CREATE Invoice Tracking
// ========================
export const createInvoiceTracking = async (trackingData) => {
  try {
    const response = await apiInterceptor.post(
      "/invoices/tracking",
      trackingData
    );
    return response.data;
  } catch (error) {
    console.error("Error creating invoice tracking:", error);
    throw error;
  }
};

// ========================
// GET All Invoice Tracking
// ========================
export const getAllInvoiceTracking = async () => {
  try {
    const response = await apiInterceptor.get("/invoices/tracking");
    return response.data;
  } catch (error) {
    console.error("Error fetching invoice tracking:", error);
    throw error;
  }
};

export const updateInvoiceTrackingStatus = async (trackingData) => {
  try {
    const response = await apiInterceptor.put(
      "/invoices/tracking/status",
      trackingData
    );
    return response.data;
  } catch (error) {
    console.error("Error updating invoice tracking status:", error);
    throw error;
  }
};

export const deleteInvoiceTracking = async (id) => {
  try {
    const response = await apiInterceptor.delete(
      `/invoices/tracking/${id}`
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting invoice tracking:", error);
    throw error;
  }
};

export const getInvoiceTrackingById = async (id) => {
  try {
    const response = await apiInterceptor.get(`/invoices/tracking/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching invoice tracking by id:", error);
    throw error;
  }
};