import apiInterceptor from "../../interceptors/interceptors";

// ========================
// CREATE PURCHASE ORDER
// ========================
export const createOrder = async (data) => {
  try {
    const response = await apiInterceptor.post("/purchase-orders", data);
    return response.data;
  } catch (error) {
    console.error("Error creating purchase order:", error);
    throw error;
  }
};

// ========================
// GET ALL PURCHASE ORDERS
// ========================
export const getAllOrders = async () => {
  try {
    const response = await apiInterceptor.get("/purchase-orders");
    return response.data;
  } catch (error) {
    console.error("Error fetching purchase orders:", error);
    throw error;
  }
};

// ========================
// GET PURCHASE ORDER BY ID
// ========================
export const getOrderById = async (id) => {
  try {
    const response = await apiInterceptor.get(`/purchase-orders/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching purchase order:", error);
    throw error;
  }
};

// ========================
// UPDATE PURCHASE ORDER
// ========================
export const updateOrder = async (id, data) => {
  try {
    const response = await apiInterceptor.put(
      `/purchase-orders/${id}`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error updating purchase order:", error);
    throw error;
  }
};

// ========================
// DELETE PURCHASE ORDER
// ========================
export const deleteOrder = async (id) => {
  try {
    const response = await apiInterceptor.delete(`/purchase-orders/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting purchase order:", error);
    throw error;
  }
};

// ========================
// UPDATE STATUS
// ========================
export const updateOrderStatus = async (id, status) => {
  try {
    const response = await apiInterceptor.patch(
      `/purchase-orders/${id}/status?status=${encodeURIComponent(status)}`
    );
    return response.data;
  } catch (error) {
    console.error("Error updating order status:", error);
    throw error;
  }
};

// ========================
// QUICK STATUS ACTIONS
// ========================
export const approveOrder = async (id) => {
  try {
    const response = await apiInterceptor.patch(
      `/purchase-orders/${id}/approve`
    );
    return response.data;
  } catch (error) {
    console.error("Error approving purchase order:", error);
    throw error;
  }
};

export const shipOrder = async (id) => {
  try {
    const response = await apiInterceptor.patch(
      `/purchase-orders/${id}/ship`
    );
    return response.data;
  } catch (error) {
    console.error("Error shipping purchase order:", error);
    throw error;
  }
};

export const deliverOrder = async (id) => {
  try {
    const response = await apiInterceptor.patch(
      `/purchase-orders/${id}/deliver`
    );
    return response.data;
  } catch (error) {
    console.error("Error delivering purchase order:", error);
    throw error;
  }
};

export const cancelOrder = async (id) => {
  try {
    const response = await apiInterceptor.patch(
      `/purchase-orders/${id}/cancel`
    );
    return response.data;
  } catch (error) {
    console.error("Error cancelling purchase order:", error);
    throw error;
  }
};

// ========================
// GET TRACKER
// ========================
export const getOrderTracker = async (id) => {
  try {
    const response = await apiInterceptor.get(
      `/purchase-orders/${id}/tracker`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching purchase order tracker:", error);
    throw error;
  }
};

// ========================
// GET PURCHASE REPORTS
// ========================
export const getPurchaseReports = async ({
  startDate,
  endDate,
  supplier,
  status,
}) => {
  try {
    const params = new URLSearchParams();

    params.append("startDate", startDate);
    params.append("endDate", endDate);

    if (supplier) {
      params.append("supplier", supplier);
    }

    if (status) {
      params.append("status", status);
    }

    const response = await apiInterceptor.get(
      `/reports?${params.toString()}`
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching purchase reports:", error);
    throw error;
  }
};