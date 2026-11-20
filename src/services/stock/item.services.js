import apiInterceptor from "../../interceptors/interceptors";

// =========================
// CREATE ITEM
// =========================
export const createItem = async (itemData) => {
  try {
    const response = await apiInterceptor.post("/items", itemData);
    return response.data;
  } catch (error) {
    console.error("Error creating item:", error);
    throw error;
  }
};

// =========================
// GET ALL ITEMS
// =========================
export const getAllItems = async () => {
  try {
    const response = await apiInterceptor.get("/items");
    return response.data;
  } catch (error) {
    console.error("Error fetching items:", error);
    throw error;
  }
};

// =========================
// GET ITEM BY ID
// =========================
export const getItemById = async (id) => {
  try {
    const response = await apiInterceptor.get(`/items/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching item by ID:", error);
    throw error;
  }
};

// =========================
// GET ITEM BY SKU
// =========================
export const getItemBySku = async (sku) => {
  try {
    const response = await apiInterceptor.get(`/items/sku/${sku}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching item by SKU:", error);
    throw error;
  }
};

// =========================
// UPDATE ITEM
// =========================
export const updateItem = async (id, itemData) => {
  try {
    const response = await apiInterceptor.put(`/items/${id}`, itemData);
    return response.data;
  } catch (error) {
    console.error("Error updating item:", error);
    throw error;
  }
};

// =========================
// DELETE ITEM (SOFT DELETE)
// =========================
export const deleteItem = async (id) => {
  try {
    const response = await apiInterceptor.delete(`/items/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting item:", error);
    throw error;
  }
};

// =========================
// ADD STOCK
// =========================
export const addStock = async (id, qty) => {
  try {
    const response = await apiInterceptor.patch(
      `/items/${id}/add-stock`,
      qty,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error adding stock:", error);
    throw error;
  }
};

// =========================
// REDUCE STOCK
// =========================
export const reduceStock = async (id, qty) => {
  try {
    const response = await apiInterceptor.patch(
      `/items/${id}/reduce-stock`,
      qty,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error reducing stock:", error);
    throw error;
  }
};