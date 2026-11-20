import apiInterceptor from "../../interceptors/interceptors";

// ========================
// CREATE Payment
// ========================
export const createPayment = async (paymentData) => {
  try {
    const response = await apiInterceptor.post(
      "/payments",
      paymentData
    );
    return response.data;
  } catch (error) {
    console.error("Error creating payment:", error);
    throw error;
  }
};

// ========================
// GET All Payments
// ========================
export const getAllPayments = async () => {
  try {
    const response = await apiInterceptor.get("/payments");
    return response.data;
  } catch (error) {
    console.error("Error fetching payments:", error);
    throw error;
  }
};

// ========================
// GET Payment By ID
// ========================
export const getPaymentById = async (id) => {
  try {
    const response = await apiInterceptor.get(`/payments/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching payment with ID ${id}:`, error);
    throw error;
  }
};

// ========================
// DELETE Payment
// ========================
export const deletePayment = async (id) => {
  try {
    const response = await apiInterceptor.delete(`/payments/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting payment with ID ${id}:`, error);
    throw error;
  }
};