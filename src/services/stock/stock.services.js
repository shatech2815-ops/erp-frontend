import apiInterceptor from "../../interceptors/interceptors";

// =====================================================
// STOCK ADJUSTMENT
// =====================================================

export const createStockAdjustment = async (data) => {
  try {
    const response = await apiInterceptor.post("/stock/adjustments", data);
    return response.data;
  } catch (error) {
    console.error("Error creating stock adjustment:", error);
    throw error;
  }
};

export const getAllStockAdjustments = async () => {
  try {
    const response = await apiInterceptor.get("/stock/adjustments");
    return response.data;
  } catch (error) {
    console.error("Error fetching stock adjustments:", error);
    throw error;
  }
};

export const getStockAdjustmentById = async (id) => {
  try {
    const response = await apiInterceptor.get(`/stock/adjustments/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching stock adjustment:", error);
    throw error;
  }
};

// =====================================================
// STOCK LEVEL
// =====================================================

export const createStockLevel = async (data) => {
  try {
    const response = await apiInterceptor.post("/stock/levels", data);
    return response.data;
  } catch (error) {
    console.error("Error creating stock level:", error);
    throw error;
  }
};

export const getAllStockLevels = async () => {
  try {
    const response = await apiInterceptor.get("/stock/levels");
    return response.data;
  } catch (error) {
    console.error("Error fetching stock levels:", error);
    throw error;
  }
};

export const getStockLevelById = async (id) => {
  try {
    const response = await apiInterceptor.get(`/stock/levels/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching stock level:", error);
    throw error;
  }
};

export const updateStockLevel = async (id, data) => {
  try {
    const response = await apiInterceptor.put(`/stock/levels/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating stock level:", error);
    throw error;
  }
};

export const deleteStockLevel = async (id) => {
  try {
    const response = await apiInterceptor.delete(`/stock/levels/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting stock level:", error);
    throw error;
  }
};

// =====================================================
// STOCK TRANSFER
// =====================================================

export const createStockTransfer = async (data) => {
  try {
    const response = await apiInterceptor.post("/stock/transfers", data);
    return response.data;
  } catch (error) {
    console.error("Error creating stock transfer:", error);
    throw error;
  }
};

export const getAllStockTransfers = async () => {
  try {
    const response = await apiInterceptor.get("/stock/transfers");
    return response.data;
  } catch (error) {
    console.error("Error fetching stock transfers:", error);
    throw error;
  }
};

export const getStockTransferById = async (id) => {
  try {
    const response = await apiInterceptor.get(`/stock/transfers/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching stock transfer:", error);
    throw error;
  }
};

export const completeStockTransfer = async (id) => {
  try {
    const response = await apiInterceptor.patch(
      `/stock/transfers/${id}/complete`
    );
    return response.data;
  } catch (error) {
    console.error("Error completing stock transfer:", error);
    throw error;
  }
};

// =====================================================
// STOCK REPORT
// =====================================================

export const getStockAlerts = async () => {
  try {
    const response = await apiInterceptor.get("/stock/reports/alerts");
    return response.data;
  } catch (error) {
    console.error("Error fetching stock alerts:", error);
    throw error;
  }
};

export const getStockReport = async () => {
  try {
    const response = await apiInterceptor.get("/stock/reports/stock");
    return response.data;
  } catch (error) {
    console.error("Error fetching stock report:", error);
    throw error;
  }
};

// =====================================================
// STOCK MOVEMENT REPORT
// =====================================================

export const getStockMovementReport = async () => {
  try {
    const response = await apiInterceptor.get("/stock/reports/movement");
    return response.data;
  } catch (error) {
    console.error("Error fetching stock movement report:", error);
    throw error;
  }
};

// =====================================================
// INVENTORY VALUATION REPORT
// =====================================================

export const getInventoryValuation = async () => {
  try {
    const response = await apiInterceptor.get("/stock/reports/valuation");
    return response.data;
  } catch (error) {
    console.error("Error fetching inventory valuation:", error);
    throw error;
  }
};

export const getTotalInventoryValue = async () => {
  try {
    const response = await apiInterceptor.get(
      "/stock/reports/valuation/total"
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching total inventory value:", error);
    throw error;
  }
};

export const getInventoryAccuracy = async () => {
  try {
    const response = await apiInterceptor.get("/reports/accuracy");
    return response.data;
  } catch (error) {
    console.error("Error fetching inventory accuracy:", error);
    throw error;
  }
};

export const getSlowMovingItems = async () => {
  try {
    const response = await apiInterceptor.get("/reports/slow-moving");
    return response.data;
  } catch (error) {
    console.error("Error fetching slow moving items:", error);
    throw error;
  }
};