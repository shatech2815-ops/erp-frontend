import apiInterceptor from "../../interceptors/interceptors";

// ==========================
// GET INVENTORY VALUATION
// ==========================
export const getInventoryValuation = async () => {
  try {
    const response = await apiInterceptor.get("/reports/valuation");
    return response.data;
  } catch (error) {
    console.error("Error fetching inventory valuation:", error);
    throw error;
  }
};

// ==========================
// GET STOCK MOVEMENT
// ==========================
export const getStockMovement = async () => {
  try {
    const response = await apiInterceptor.get("/reports/movement");
    return response.data;
  } catch (error) {
    console.error("Error fetching stock movement:", error);
    throw error;
  }
};

// ==========================
// GET INVENTORY ACCURACY
// ==========================
export const getInventoryAccuracy = async () => {
  try {
    const response = await apiInterceptor.get("/reports/accuracy");
    return response.data;
  } catch (error) {
    console.error("Error fetching inventory accuracy:", error);
    throw error;
  }
};