import apiInterceptor from "../../interceptors/interceptors";

// =========================
// CREATE WAREHOUSE
// =========================
export const createWarehouse = async (warehouseData) => {
  try {
    const response = await apiInterceptor.post(
      "/warehouses",
      warehouseData
    );
    return response.data;
  } catch (error) {
    console.error("Error creating warehouse:", error);
    throw error;
  }
};

// =========================
// GET ALL WAREHOUSES
// =========================
export const getAllWarehouses = async () => {
  try {
    const response = await apiInterceptor.get("/warehouses");
    return response.data;
  } catch (error) {
    console.error("Error fetching warehouses:", error);
    throw error;
  }
};

// =========================
// GET ACTIVE WAREHOUSES
// =========================
export const getActiveWarehouses = async () => {
  try {
    const response = await apiInterceptor.get("/warehouses/active");
    return response.data;
  } catch (error) {
    console.error("Error fetching active warehouses:", error);
    throw error;
  }
};

// =========================
// GET WAREHOUSE BY ID
// =========================
export const getWarehouseById = async (id) => {
  try {
    const response = await apiInterceptor.get(`/warehouses/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching warehouse with ID ${id}:`, error);
    throw error;
  }
};

// =========================
// UPDATE WAREHOUSE
// =========================
export const updateWarehouse = async (id, warehouseData) => {
  try {
    const response = await apiInterceptor.put(
      `/warehouses/${id}`,
      warehouseData
    );
    return response.data;
  } catch (error) {
    console.error(`Error updating warehouse with ID ${id}:`, error);
    throw error;
  }
};

// =========================
// DEACTIVATE WAREHOUSE
// =========================
export const deactivateWarehouse = async (id) => {
  try {
    const response = await apiInterceptor.delete(`/warehouses/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deactivating warehouse with ID ${id}:`, error);
    throw error;
  }
};

// =========================
// SET DEFAULT WAREHOUSE
// =========================
export const setDefaultWarehouse = async (id) => {
  try {
    const response = await apiInterceptor.patch(
      `/warehouses/${id}/set-default`
    );
    return response.data;
  } catch (error) {
    console.error(`Error setting default warehouse with ID ${id}:`, error);
    throw error;
  }
};

// =========================
// INCREASE CAPACITY
// =========================
export const increaseWarehouseCapacity = async (id, qty) => {
  try {
    const response = await apiInterceptor.patch(
      `/warehouses/${id}/increase-capacity?qty=${qty}`
    );
    return response.data;
  } catch (error) {
    console.error(`Error increasing capacity for warehouse ID ${id}:`, error);
    throw error;
  }
};

// =========================
// DECREASE CAPACITY
// =========================
export const decreaseWarehouseCapacity = async (id, qty) => {
  try {
    const response = await apiInterceptor.patch(
      `/warehouses/${id}/decrease-capacity?qty=${qty}`
    );
    return response.data;
  } catch (error) {
    console.error(`Error decreasing capacity for warehouse ID ${id}:`, error);
    throw error;
  }
};

// =========================
// INVENTORY COUNTS
// =========================
export const getAllInventoryCounts = async () => {
  try {
    const response = await apiInterceptor.get("/inventory-counts");
    return response.data;
  } catch (error) {
    console.error("Error fetching inventory counts:", error);
    throw error;
  }
};

export const deleteInventoryCount = async (id) => {
  try {
    const response = await apiInterceptor.delete(`/inventory-counts/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting inventory count ID ${id}:`, error);
    throw error;
  }
};