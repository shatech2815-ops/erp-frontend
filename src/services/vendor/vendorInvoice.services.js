
import apiInterceptor from "../../interceptors/interceptors";

// =========================
// CREATE INVOICE
// =========================
export const createInvoice = async (invoiceData) => {

  try {

    console.log(
      "SENDING DATA:",
      invoiceData
    );

    const response = await apiInterceptor.post(
      "/invoices/create-invoice",
      invoiceData
    );

    console.log(
      "SUCCESS RESPONSE:",
      response.data
    );

    return response.data;

  } catch (error) {

    console.error("FULL ERROR:", error);

    console.error(
      "BACKEND RESPONSE:",
      error.response
    );

    console.error(
      "BACKEND DATA:",
      error.response?.data
    );

    console.error(
      "STATUS:",
      error.response?.status
    );

    throw error;
  }
};

// =========================
// GET ALL INVOICES
// =========================
export const getAllVendorInvoices = async () => {
  try {
    const response = await apiInterceptor.get(
      "/invoices/get-all-invoices"
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching invoices:", error);
    throw error;
  }
};

// =========================
// GET INVOICE BY ID
// =========================
export const getInvoiceById = async (id) => {
  try {
    const response = await apiInterceptor.get(
      `/invoices/get-invoice/${id}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching invoice:", error);
    throw error;
  }
};

// =========================
// UPDATE INVOICE
// =========================
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

// =========================
// DELETE INVOICE
// =========================
export const deleteInvoice = async (id) => {
  try {
    const response = await apiInterceptor.delete(
      `/invoices/delete-invoice/${id}`
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting invoice:", error);
    throw error;
  }
};

// // =========================
// // MAKE PAYMENT
// // =========================
// export const makePayment = async (invoiceId, paymentData) => {
//   try {
//     const response = await apiInterceptor.post(
//       `/invoices/${invoiceId}/payments`,
//       paymentData
//     );
//     return response.data;
//   } catch (error) {
//     console.error("Error making payment:", error);
//     throw error;
//   }
// };

// // =========================
// // GET PAYMENT HISTORY
// // =========================
// export const getPaymentHistory = async (invoiceId) => {
//   try {
//     const response = await apiInterceptor.get(
//       `/invoices/${invoiceId}/payments`
//     );
//     return response.data;
//   } catch (error) {
//     console.error("Error fetching payment history:", error);
//     throw error;
//   }
// };
