import apiInterceptor from "../../interceptors/interceptors";

// CREATE TEMPLATE
export const createTemplate = async (data) => {
  try {
    const response = await apiInterceptor.post("/templates", data);
    return response.data;
  } catch (error) {
    console.error("Error creating template:", error);
    throw error;
  }
};

// GET ALL TEMPLATES
export const getAllTemplates = async () => {
  try {
    const response = await apiInterceptor.get("/templates");
    return response.data;
  } catch (error) {
    console.error("Error fetching templates:", error);
    throw error;
  }
};

// GET TEMPLATE BY ID
export const getTemplateById = async (id) => {
  try {
    const response = await apiInterceptor.get(`/templates/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching template:", error);
    throw error;
  }
};

// UPDATE TEMPLATE
export const updateTemplate = async (id, data) => {
  try {
    const response = await apiInterceptor.put(`/templates/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating template:", error);
    throw error;
  }
};

// DELETE TEMPLATE
export const deleteTemplate = async (id) => {
  try {
    const response = await apiInterceptor.delete(`/templates/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting template:", error);
    throw error;
  }
};