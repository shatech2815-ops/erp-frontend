import apiInterceptor from "../../interceptors/interceptors";

export const createRFQ = async (rfqData) => {
  try {
    const response = await apiInterceptor.post("/rfqs", rfqData);
    return response.data;
  } catch (error) {
    console.error("Error creating RFQ:", error);
    throw error;
  }
};

export const getAllRFQs = async () => {
  try {
    const response = await apiInterceptor.get("/rfqs");
    return response.data;
  } catch (error) {
    console.error("Error fetching RFQs:", error);
    throw error;
  }
};

export const getRFQById = async (id) => {
  try {
    const response = await apiInterceptor.get(`/rfqs/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching RFQ details:", error);
    throw error;
  }
};

export const updateRFQStatus = async (id, status) => {
  try {
    const response = await apiInterceptor.put(`/rfqs/${id}/status`, { status });
    return response.data;
  } catch (error) {
    console.error("Error updating RFQ status:", error);
    throw error;
  }
};
