import apiInterceptor from "../../interceptors/interceptors";

// ========================
// CREATE Vendor Payment
// ========================
export const createVendorPayment = async (paymentData) => {
  try {
    const response = await apiInterceptor.post(
      "/vendor-payments",
      paymentData
    );
    return response.data;
  } catch (error) {
    console.error("Error creating vendor payment:", error);
    throw error;
  }
};

// ========================
// GET All Vendor Payments
// ========================
export const getAllVendorPayments = async () => {
  try {
    const response = await apiInterceptor.get("/vendor-payments");
    return response.data;
  } catch (error) {
    console.error("Error fetching vendor payments:", error);
    throw error;
  }
};

// ========================
// GET Vendor Payment By ID
// ========================
export const getVendorPaymentById = async (id) => {
  try {
    const response = await apiInterceptor.get(`/vendor-payments/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching vendor payment with ID ${id}:`, error);
    throw error;
  }
};

// ========================
// DELETE Vendor Payment
// ========================
export const deleteVendorPayment = async (id) => {
  try {
    const response = await apiInterceptor.delete(`/vendor-payments/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting vendor payment with ID ${id}:`, error);
    throw error;
  }
};