import apiInterceptor from "../../../interceptors/interceptors";

// CREATE VENDOR CATEGORY
export const createVendorCategory = async (data) => {
  try {
    const response = await apiInterceptor.post("/vendor-categories/create", data);
    return response.data;
  } catch (error) {
    console.error("Error creating vendor category:", error);
    throw error;
  }
};


// GET ALL VENDOR CATEGORIES
export const getAllVendorCategories = async () => {
  try {
    const response = await apiInterceptor.get("/vendor-categories/all");
    return response.data;
  } catch (error) {                                                                                                                                                                                                    
    console.error("Error fetching vendor categories:", error);
    throw error;
  }
};

export const updateVendorCategory = async (id, data) => {
  try {
    const response = await apiInterceptor.put(
      `/vendor-categories/${id}`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error updating vendor category:", error);
    throw error;
  }
};

export const deleteVendorCategory = async (id) => {
  try {
    const response = await apiInterceptor.delete(
      `/vendor-categories/${id}`
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting vendor category:", error);
    throw error;
  }
};

export const toggleVendorCategoryStatus = async (id) => {
  try {
    const response = await apiInterceptor.patch(
      `/vendor-categories/toggle/${id}`
    );
    return response.data;
  } catch (error) {
    console.error("Error toggling vendor category status:", error);
    throw error;
  }
};
