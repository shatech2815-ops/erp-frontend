import apiInterceptor from "../../interceptors/interceptors";

export const createCostCenter = async (data) => {
  try {
    const response = await apiInterceptor.post("/cost-centers", data);
    return response.data;
  } catch (error) {
    console.error("Error creating cost center:", error);
    throw error;
  }
};

export const getAllCostCenters = async () => {
  try {
    const response = await apiInterceptor.get("/cost-centers");
    return response.data;
  } catch (error) {
    console.error("Error fetching cost centers:", error);
    throw error;
  }
};
