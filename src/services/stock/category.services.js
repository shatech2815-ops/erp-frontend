import apiInterceptor from "../../interceptors/interceptors";

// =========================
// CREATE CATEGORY
// =========================
export const createCategory = async (categoryData) => {
  try {
    const response = await apiInterceptor.post(
      "/categories/create",
      categoryData
    );
    return response.data;
  } catch (error) {
    console.error("Error creating category:", error);
    throw error;
  }
};

// =========================
// GET ALL CATEGORIES
// =========================
export const getAllCategories = async () => {
  try {
    const response = await apiInterceptor.get("/categories/getall");
    return response.data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
};

// =========================
// GET ACTIVE CATEGORIES
// =========================
export const getActiveCategories = async () => {
  try {
    const response = await apiInterceptor.get("/categories/active");
    return response.data;
  } catch (error) {
    console.error("Error fetching active categories:", error);
    throw error;
  }
};

// =========================
// GET CATEGORY BY ID
// =========================
export const getCategoryById = async (id) => {
  try {
    const response = await apiInterceptor.get(`/categories/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching category with ID ${id}:`, error);
    throw error;
  }
};



// =========================
// UPDATE CATEGORY
// =========================
export const updateCategory = async (id, categoryData) => {
  try {
    const response = await apiInterceptor.put(
      `/categories/${id}`,
      categoryData
    );
    return response.data;
  } catch (error) {
    console.error(`Error updating category with ID ${id}:`, error);
    throw error;
  }
};

// =========================
// DELETE CATEGORY (SOFT DELETE)
// =========================
export const deleteCategory = async (id) => {
  try {
    const response = await apiInterceptor.delete(`/categories/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting category with ID ${id}:`, error);
    throw error;
  }
};

// =========================
// HEALTH CHECK
// =========================
export const checkCategoryServiceHealth = async () => {
  try {
    const response = await apiInterceptor.get("/categories/health");
    return response.data;
  } catch (error) {
    console.error("Error checking category service health:", error);
    throw error;
  }
};