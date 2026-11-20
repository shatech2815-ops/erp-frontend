import apiInterceptor from "../../interceptors/interceptors";



export const createVendor = async (data) => {
  try {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") {
        formData.append(key, value);
      }
    });

    const response = await apiInterceptor.post(
      "/vendors/create-vendor",
      formData
    );

    return response.data;
  } catch (error) {
    console.error("Error creating vendor:", error);
    throw error;
  }
};

// ========================
// GET All Vendors
// ========================
export const getAllVendors = async () => {
  try {
    const response = await apiInterceptor.get("/vendors/get-all-vendors");
    return response.data;
  } catch (error) {
    console.error("Error fetching vendors:", error);
    throw error;
  }
};