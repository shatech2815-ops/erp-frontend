import apiInterceptor from "../../interceptors/interceptors";

export const createGRN = async (grnData) => {
  try {
    const response = await apiInterceptor.post("/grns", grnData);
    return response.data;
  } catch (error) {
    console.error("Error creating GRN:", error);
    throw error;
  }
};

export const getAllGRNs = async () => {
  try {
    const response = await apiInterceptor.get("/grns");
    return response.data;
  } catch (error) {
    console.error("Error fetching GRNs:", error);
    throw error;
  }
};

export const getGRNById = async (id) => {
  try {
    const response = await apiInterceptor.get(`/grns/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching GRN details:", error);
    throw error;
  }
};

export const updateGRNStatus = async (id, status) => {
  try {
    const response = await apiInterceptor.put(`/grns/${id}/status`, { status });
    return response.data;
  } catch (error) {
    console.error("Error updating GRN status:", error);
    throw error;
  }
};
