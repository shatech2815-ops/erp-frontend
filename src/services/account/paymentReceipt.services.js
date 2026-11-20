import apiInterceptor from "../../interceptors/interceptors";

// ========================
// CREATE Payment Receipt
// ========================
export const createPaymentReceipt = async (receiptData) => {
  try {
    const response = await apiInterceptor.post(
      "/payment-receipts",
      receiptData
    );
    return response.data;
  } catch (error) {
    console.error("Error creating payment receipt:", error);
    throw error;
  }
};

// ========================
// GET All Payment Receipts
// ========================
export const getAllPaymentReceipts = async () => {
  try {
    const response = await apiInterceptor.get(
      "/payment-receipts"
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching payment receipts:", error);
    throw error;
  }
};

// ========================
// GET Payment Receipt By ID
// ========================
export const getPaymentReceiptById = async (id) => {
  try {
    const response = await apiInterceptor.get(
      `/payment-receipts/${id}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching payment receipt:", error);
    throw error;
  }
};

// ========================
// UPDATE Payment Receipt
// ========================
export const updatePaymentReceipt = async (id, receiptData) => {
  try {
    const response = await apiInterceptor.put(
      `/payment-receipts/${id}`,
      receiptData
    );
    return response.data;
  } catch (error) {
    console.error("Error updating payment receipt:", error);
    throw error;
  }
};

// ========================
// DELETE Payment Receipt
// ========================
export const deletePaymentReceipt = async (id) => {
  try {
    const response = await apiInterceptor.delete(
      `/payment-receipts/${id}`
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting payment receipt:", error);
    throw error;
  }
};