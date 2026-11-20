import apiInterceptor from "../../interceptors/interceptors";

export const createItem = async (data) => {
  try {
    const response = await apiInterceptor.post("/items", data);
    return response.data;
  } catch (error) {
    console.error("Error creating item:", error);
    throw error;
  }
};

export const getItems = async () => {
  try {
    const response = await apiInterceptor.get("/items");
    return response.data;
  } catch (error) {
    console.error("Error fetching items:", error);
    throw error;
  }
};

export const updateItem = async (id, data) => {
  try {
    const response = await apiInterceptor.put(`/items/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating item:", error);
    throw error;
  }
};


export const deleteItem = async (id) => {
  try {
    const response = await apiInterceptor.delete(`/items/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting item:", error);
    throw error;
  }
};

export const createStock = async (data) => {
  try {
    const response = await apiInterceptor.post("/stock", data);
    return response.data;
  } catch (error) {
    console.error("Error creating/updating stock:", error);
    throw error;
  }
};


export const getStock = async () => {
  try {
    const response = await apiInterceptor.get("/stock");
    return response.data;
  } catch (error) {
    console.error("Error fetching stock:", error);
    throw error;
  }
};


export const createRequest = async (data) => {
  try {
    const response = await apiInterceptor.post("/item-requests", data);
    return response.data;
  } catch (error) {
    console.error("Error creating request:", error);
    throw error;
  }
};

export const getRequests = async () => {
  try {
    const response = await apiInterceptor.get("/item-requests");
    return response.data;
  } catch (error) {
    console.error("Error fetching requests:", error);
    throw error;
  }
};


export const updateRequestStatus = async (id, status) => {
  try {
    console.log("Updating request status:", { id, status });

    const response = await apiInterceptor.put(
      `/item-requests/${id}/status?status=${encodeURIComponent(status)}`
    );

    return response.data;
  } catch (error) {
    console.error("Error updating request status:", error);

    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
    }

    throw error;
  }
};

