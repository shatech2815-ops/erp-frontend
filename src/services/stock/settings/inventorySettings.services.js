import apiInterceptor from "../../../interceptors/interceptors";

// =========================
// SAVE SETTINGS
// =========================
export const saveInventorySettings = async (settingsData) => {
  try {
    const response = await apiInterceptor.post(
      "/settings",
      settingsData
    );
    return response.data;
  } catch (error) {
    console.error("Error saving inventory settings:", error);
    throw error;
  }
};

// =========================
// GET SETTINGS
// =========================
export const getInventorySettings = async () => {
  try {
    const response = await apiInterceptor.get("/settings");
    return response.data;
  } catch (error) {
    console.error("Error fetching inventory settings:", error);
    throw error;
  }
};

// =========================
// UPDATE SETTINGS
// =========================
export const updateInventorySettings = async (id, settingsData) => {
  try {
    const response = await apiInterceptor.put(
      `/settings/${id}`,
      settingsData
    );
    return response.data;
  } catch (error) {
    console.error("Error updating inventory settings:", error);
    throw error;
  }
};

// =========================
// DELETE SETTINGS
// =========================
export const deleteInventorySettings = async (id) => {
  try {
    const response = await apiInterceptor.delete(`/settings/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting inventory settings:", error);
    throw error;
  }
};