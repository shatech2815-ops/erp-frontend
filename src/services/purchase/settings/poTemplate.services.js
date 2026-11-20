import apiInterceptor from "../../../interceptors/interceptors";

// CREATE PO TEMPLATE
export const createPOTemplate = async (data) => {
  try {
    const response = await apiInterceptor.post("/po-templates", data);
    return response.data;
  } catch (error) {
    console.error("Error creating PO template:", error);
    throw error;
  }
};

// GET ALL PO TEMPLATES
export const getAllPOTemplates = async () => {
  try {
    const response = await apiInterceptor.get("/po-templates");
    return response.data;
  } catch (error) {
    console.error("Error fetching PO templates:", error);
    throw error;
  }
};

// GET ACTIVE PO TEMPLATES
export const getActivePOTemplates = async () => {
  try {
    const response = await apiInterceptor.get("/po-templates/active");
    return response.data;
  } catch (error) {
    console.error("Error fetching active PO templates:", error);
    throw error;
  }
};

// GET PO TEMPLATE BY ID
export const getPOTemplateById = async (id) => {
  try {
    const response = await apiInterceptor.get(`/po-templates/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching PO template with ID ${id}:`, error);
    throw error;
  }
};

// UPDATE PO TEMPLATE
export const updatePOTemplate = async (id, data) => {
  try {
    const response = await apiInterceptor.put(`/po-templates/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating PO template with ID ${id}:`, error);
    throw error;
  }
};

// DELETE PO TEMPLATE
export const deletePOTemplate = async (id) => {
  try {
    const response = await apiInterceptor.delete(`/po-templates/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting PO template with ID ${id}:`, error);
    throw error;
  }
};

// TOGGLE ACTIVE / INACTIVE STATUS
export const togglePOTemplateStatus = async (id) => {
  try {
    const response = await apiInterceptor.patch(`/po-templates/toggle/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error toggling PO template status for ID ${id}:`, error);
    throw error;
  }
};