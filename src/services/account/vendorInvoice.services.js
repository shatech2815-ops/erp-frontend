import apiInterceptor from "../../interceptors/interceptors";

// ========================
// CREATE Vendor Invoice
// ========================
export const createVendorInvoice = async (invoiceData) => {
  try {
    const response = await apiInterceptor.post(
      "/vendor-invoices",
      invoiceData
    );
    return response.data;
  } catch (error) {
    console.error("Error creating vendor invoice:", error);
    throw error;
  }
};

// ========================
// GET All Vendor Invoices
// ========================
export const getAllVendorInvoices = async () => {
  try {
    const response = await apiInterceptor.get(
      "/vendor-invoices"
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching vendor invoices:", error);
    throw error;
  }
};

// ========================
// GET Vendor Invoice By ID
// ========================
export const getVendorInvoiceById = async (id) => {
  try {
    const response = await apiInterceptor.get(
      `/vendor-invoices/${id}`
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching vendor invoice with ID ${id}:`, error);
    throw error;
  }
};

// ========================
// 3-WAY MATCH VENDOR INVOICE
// ========================
export const matchVendorInvoice = async (id) => {
  try {
    const response = await apiInterceptor.post(
      `/vendor-invoices/${id}/match`
    );
    return response.data;
  } catch (error) {
    console.error(`Error performing 3-way match for invoice ID ${id}:`, error);
    throw error;
  }
};