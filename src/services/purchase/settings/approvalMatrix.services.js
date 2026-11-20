import apiInterceptor from "../../../interceptors/interceptors";

// CREATE APPROVAL MATRIX
export const createApprovalMatrix = async (data) => {
  try {
    const response = await apiInterceptor.post(
      "/settings/approval-matrix",
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error creating approval matrix:", error);
    throw error;
  }
};

// GET ALL APPROVAL MATRIX
export const getAllApprovalMatrix = async () => {
  try {
    const response = await apiInterceptor.get(
      "/settings/approval-matrix"
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching approval matrix:", error);
    throw error;
  }
};

// GET APPROVAL MATRIX BY MODULE
export const getApprovalMatrixByModule = async (module) => {
  try {
    const response = await apiInterceptor.get(
      `/settings/approval-matrix/module?module=${module}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching approval matrix by module:", error);
    throw error;
  }

  
};

// DELETE APPROVAL MATRIX
export const deleteApprovalMatrix = async (id) => {
  try {
    const response = await apiInterceptor.delete(
      `/settings/approval-matrix/${id}`
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting approval matrix:", error);
    throw error;
  }
};

// UPDATE APPROVAL MATRIX
export const updateApprovalMatrix = async (id, data) => {
  try {
    const response = await apiInterceptor.put(
      `/settings/approval-matrix/${id}`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error updating approval matrix:", error);
    throw error;
  }
};