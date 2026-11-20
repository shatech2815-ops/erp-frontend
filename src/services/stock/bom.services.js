import apiInterceptor from "../../interceptors/interceptors";

// =========================
// CREATE BOM
// =========================
export const createBOM = async (bomData) => {
  try {
    const response = await apiInterceptor.post(
      "/bom/create",
      bomData
    );
    return response.data;
  } catch (error) {
    console.error("Error creating BOM:", error);
    throw error;
  }
};

// =========================
// GET ALL BOM
// =========================
export const getAllBOMs = async () => {
  try {
    const response = await apiInterceptor.get("/bom/getall");
    return response.data;
  } catch (error) {
    console.error("Error fetching BOMs:", error);
    throw error;
  }
};

// =========================
// GET BOM BY ID
// =========================
export const getBOMById = async (id) => {
  try {
    const response = await apiInterceptor.get(`/bom/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching BOM by ID:", error);
    throw error;
  }
};

// =========================
// GET BOM BY PRODUCT ID
// =========================
export const getBOMByProductId = async (productId) => {
  try {
    const response = await apiInterceptor.get(
      `/bom/product/${productId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching BOM by Product ID:", error);
    throw error;
  }
};

// =========================
// UPDATE BOM
// =========================
export const updateBOM = async (id, bomData) => {
  try {
    const response = await apiInterceptor.put(
      `/bom/${id}`,
      bomData
    );
    return response.data;
  } catch (error) {
    console.error("Error updating BOM:", error);
    throw error;
  }
};

// =========================
// DELETE BOM (SOFT DELETE)
// =========================
export const deleteBOM = async (id) => {
  try {
    const response = await apiInterceptor.delete(`/bom/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting BOM:", error);
    throw error;
  }
};