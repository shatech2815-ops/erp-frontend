import apiInterceptor from "../../interceptors/interceptors";

// =====================================================
// PRODUCTION PLAN APIs
// =====================================================

// CREATE PLAN
export const createProductionPlan = async (planData) => {
  try {
    const response = await apiInterceptor.post(
      "/production/plans",
      planData
    );
    return response.data;
  } catch (error) {
    console.error("Error creating production plan:", error);
    throw error;
  }
};

// GET ALL PLANS
export const getAllProductionPlans = async () => {
  try {
    const response = await apiInterceptor.get("/production/plans");
    return response.data;
  } catch (error) {
    console.error("Error fetching production plans:", error);
    throw error;
  }
};

// GET PLAN BY ID
export const getProductionPlanById = async (id) => {
  try {
    const response = await apiInterceptor.get(`/production/plans/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching production plan:", error);
    throw error;
  }
};

// UPDATE PLAN
export const updateProductionPlan = async (id, planData) => {
  try {
    const response = await apiInterceptor.put(
      `/production/plans/${id}`,
      planData
    );
    return response.data;
  } catch (error) {
    console.error("Error updating production plan:", error);
    throw error;
  }
};

// DELETE PLAN
export const deleteProductionPlan = async (id) => {
  try {
    const response = await apiInterceptor.delete(`/production/plans/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting production plan:", error);
    throw error;
  }
};

// =====================================================
// WORK ORDER APIs
// =====================================================

// CREATE WORK ORDER
export const createWorkOrder = async (workOrderData) => {
  try {
    const response = await apiInterceptor.post(
      "/work-orders/create",
      workOrderData
    );
    return response.data;
  } catch (error) {
    console.error("Error creating work order:", error);
    throw error;
  }
};

// GET ALL WORK ORDERS
export const getAllWorkOrders = async () => {
  try {
    const response = await apiInterceptor.get("/work-orders/getall");
    return response.data;
  } catch (error) {
    console.error("Error fetching work orders:", error);
    throw error;
  }
};

// GET WORK ORDER BY ID
export const getWorkOrderById = async (id) => {
  try {
    const response = await apiInterceptor.get(`/work-orders/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching work order:", error);
    throw error;
  }
};

// UPDATE WORK ORDER
export const updateWorkOrder = async (id, workOrderData) => {
  try {
    const response = await apiInterceptor.put(
      `/work-orders/${id}`,
      workOrderData
    );
    return response.data;
  } catch (error) {
    console.error("Error updating work order:", error);
    throw error;
  }
};

// DELETE WORK ORDER
export const deleteWorkOrder = async (id) => {
  try {
    const response = await apiInterceptor.delete(
      `/work-orders/${id}`
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting work order:", error);
    throw error;
  }
};

// =====================================================
// WORK ORDER STATUS FLOW APIs
// =====================================================

// RELEASE WORK ORDER
export const releaseWorkOrder = async (id) => {
  try {
    const response = await apiInterceptor.patch(
      `/work-orders/${id}/release`
    );
    return response.data;
  } catch (error) {
    console.error("Error releasing work order:", error);
    throw error;
  }
};

// START WORK ORDER
export const startWorkOrder = async (id) => {
  try {
    const response = await apiInterceptor.patch(
      `/work-orders/${id}/start`
    );
    return response.data;
  } catch (error) {
    console.error("Error starting work order:", error);
    throw error;
  }
};

// COMPLETE WORK ORDER
export const completeWorkOrder = async (id) => {
  try {
    const response = await apiInterceptor.patch(
      `/work-orders/${id}/complete`
    );
    return response.data;
  } catch (error) {
    console.error("Error completing work order:", error);
    throw error;
  }
};

// =====================================================
// PRODUCTION REPORT APIs
// =====================================================

// GET PRODUCTION REPORT
export const getProductionReport = async () => {
  try {
    const response = await apiInterceptor.get(
      "/production/reports/production"
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching production report:", error);
    throw error;
  }
};

// =====================================================
// MRP APIs
// =====================================================
export const getAllMrpRuns = async () => {
  try {
    const response = await apiInterceptor.get("/mrp-runs");
    return response.data;
  } catch (error) {
    console.error("Error fetching MRP runs:", error);
    throw error;
  }
};

export const deleteMrpRun = async (id) => {
  try {
    const response = await apiInterceptor.delete(`/mrp-runs/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting MRP run ID ${id}:`, error);
    throw error;
  }
};