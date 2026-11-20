import apiInterceptor from "../../interceptors/interceptors";

// ========================
// CREATE Payment Mode
// ========================
export const createPaymentMode = async (paymentModeData) => {
  try {
    const response = await apiInterceptor.post(
      "/payment-modes",
      paymentModeData
    );
    return response.data;
  } catch (error) {
    console.error("Error creating payment mode:", error);
    throw error;
  }
};

// ========================
// GET All Payment Modes
// ========================
export const getAllPaymentModes = async () => {
  try {
    const response = await apiInterceptor.get("/payment-modes");
    return response.data;
  } catch (error) {
    console.error("Error fetching payment modes:", error);
    throw error;
  }
};

// ========================
// GET Payment Mode By ID
// ========================
export const getPaymentModeById = async (id) => {
  try {
    const response = await apiInterceptor.get(`/payment-modes/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching payment mode with ID ${id}:`, error);
    throw error;
  }
};

// ========================
// UPDATE Payment Mode
// ========================
export const updatePaymentMode = async (id, paymentModeData) => {
  try {
    const response = await apiInterceptor.put(
      `/payment-modes/${id}`,
      paymentModeData
    );
    return response.data;
  } catch (error) {
    console.error(`Error updating payment mode with ID ${id}:`, error);
    throw error;
  }
};

// ========================
// DELETE Payment Mode
// ========================
export const deletePaymentMode = async (id) => {
  try {
    const response = await apiInterceptor.delete(`/payment-modes/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting payment mode with ID ${id}:`, error);
    throw error;
  }
};