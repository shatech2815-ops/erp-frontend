import apiInterceptor from "../../interceptors/interceptors";

export const createEmployeeAdvance = async (data) => {
  try {
    const response = await apiInterceptor.post("/employee-advances", data);
    return response.data;
  } catch (error) {
    console.error("Error creating employee advance:", error);
    throw error;
  }
};

export const getAllEmployeeAdvances = async () => {
  try {
    const response = await apiInterceptor.get("/employee-advances");
    return response.data;
  } catch (error) {
    console.error("Error fetching employee advances:", error);
    throw error;
  }
};
