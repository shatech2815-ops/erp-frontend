import apiInterceptor from "../../interceptors/interceptors";

// =========================
// CREATE SCHEDULE
// =========================
export const createProductionSchedule = async (scheduleData) => {
  try {
    const response = await apiInterceptor.post(
      "/production-schedules/create",
      scheduleData
    );
    return response.data;
  } catch (error) {
    console.error("Error creating production schedule:", error);
    throw error;
  }
};

// =========================
// START PRODUCTION
// =========================
export const startProductionSchedule = async (id, operator) => {
  try {
    const response = await apiInterceptor.patch(
      `/production-schedules/${id}/start`,
      { operator }
    );
    return response.data;
  } catch (error) {
    console.error("Error starting production schedule:", error);
    throw error;
  }
};

// =========================
// COMPLETE PRODUCTION
// =========================
export const completeProductionSchedule = async (id, producedQty) => {
  try {
    const response = await apiInterceptor.patch(
      `/production-schedules/${id}/complete`,
      { producedQty }
    );
    return response.data;
  } catch (error) {
    console.error("Error completing production schedule:", error);
    throw error;
  }
};

// =========================
// MARK DELAYED
// =========================
export const delayProductionSchedule = async (id, reason) => {
  try {
    const response = await apiInterceptor.patch(
      `/production-schedules/${id}/delay`,
      { reason }
    );
    return response.data;
  } catch (error) {
    console.error("Error delaying production schedule:", error);
    throw error;
  }
};

// =========================
// CANCEL SCHEDULE
// =========================
export const cancelProductionSchedule = async (id, reason) => {
  try {
    const response = await apiInterceptor.patch(
      `/production-schedules/${id}/cancel`,
      { reason }
    );
    return response.data;
  } catch (error) {
    console.error("Error cancelling production schedule:", error);
    throw error;
  }
};

// =========================
// UPDATE SCHEDULE
// =========================
export const updateProductionSchedule = async (id, scheduleData) => {
  try {
    const response = await apiInterceptor.put(
      `/production-schedules/${id}`,
      scheduleData
    );
    return response.data;
  } catch (error) {
    console.error("Error updating production schedule:", error);
    throw error;
  }
};

// =========================
// GET ALL SCHEDULES
// =========================
export const getAllProductionSchedules = async () => {
  try {
    const response = await apiInterceptor.get("/production-schedules");
    return response.data;
  } catch (error) {
    console.error("Error fetching production schedules:", error);
    throw error;
  }
};

// =========================
// GET SCHEDULE BY ID
// =========================
export const getProductionScheduleById = async (id) => {
  try {
    const response = await apiInterceptor.get(`/production-schedules/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching production schedule:", error);
    throw error;
  }
};

// =========================
// GET SCHEDULES BY STATUS
// =========================
export const getProductionSchedulesByStatus = async (status) => {
  try {
    const response = await apiInterceptor.get(
      `/production-schedules/status/${status}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching production schedules by status:", error);
    throw error;
  }
};

// =========================
// DELETE / DEACTIVATE SCHEDULE
// =========================
export const deleteProductionSchedule = async (id) => {
  try {
    const response = await apiInterceptor.delete(
      `/production-schedules/${id}`
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting production schedule:", error);
    throw error;
  }
};