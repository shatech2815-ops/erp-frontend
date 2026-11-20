
import apiInterceptor from "../../interceptors/interceptors";

// CREATE REQUISITION
export const createRequisition = async (data) => {
  try {
    const response = await apiInterceptor.post("/requisitions", data);
    return response.data;
  } catch (error) {
    console.error("Error creating requisition:", error);
    throw error;
  }
};

// GET ALL REQUISITIONS
export const getAllRequisitions = async () => {
  try {
    const response = await apiInterceptor.get("/requisitions");
    return response.data;
  } catch (error) {
    console.error("Error fetching requisitions:", error);
    throw error;
  }
};

// GET REQUISITION BY ID
export const getRequisitionById = async (id) => {
  try {
    const response = await apiInterceptor.get(`/requisitions/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching requisition with ID ${id}:`, error);
    throw error;
  }
};

// UPDATE REQUISITION STATUS
export const updateRequisitionStatus = async (id, status) => {
  try {
    const response = await apiInterceptor.put(
      `/requisitions/${id}/status/${status}`
    );
    return response.data;
  } catch (error) {
    console.error("Error updating requisition status:", error);
    throw error;
  }
};

// APPROVE REQUISITION
export const approveRequisition = async (data) => {
  try {
    const response = await apiInterceptor.post("/requisitions/approve", data);
    return response.data;
  } catch (error) {
    console.error("Error approving requisition:", error);
    throw error;
  }
};

// GET APPROVAL HISTORY
export const getRequisitionApprovals = async (id) => {
  try {
    const response = await apiInterceptor.get(`/requisitions/${id}/approvals`);
    return response.data;
  } catch (error) {
    console.error("Error fetching approval history:", error);
    throw error;
  }
};
