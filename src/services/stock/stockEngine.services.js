import apiInterceptor from "../../interceptors/interceptors";

export const getStockBalances = async () => {
  try {
    const response = await apiInterceptor.get("/stock/balances");
    return response.data;
  } catch (error) {
    console.error("Error fetching stock balances:", error);
    throw error;
  }
};

export const getStockMovements = async () => {
  try {
    const response = await apiInterceptor.get("/stock/movements");
    return response.data;
  } catch (error) {
    console.error("Error fetching stock movements:", error);
    throw error;
  }
};

export const postStockReceipt = async (data) => {
  try {
    const response = await apiInterceptor.post("/stock/receipt", data);
    return response.data;
  } catch (error) {
    console.error("Error posting stock receipt:", error);
    throw error;
  }
};

export const postStockIssue = async (data) => {
  try {
    const response = await apiInterceptor.post("/stock/issue", data);
    return response.data;
  } catch (error) {
    console.error("Error posting stock issue:", error);
    throw error;
  }
};

export const postStockTransfer = async (data) => {
  try {
    const response = await apiInterceptor.post("/stock/transfer-new", data);
    return response.data;
  } catch (error) {
    console.error("Error posting stock transfer:", error);
    throw error;
  }
};

export const postStockReservation = async (data) => {
  try {
    const response = await apiInterceptor.post("/stock/reserve", data);
    return response.data;
  } catch (error) {
    console.error("Error reserving stock:", error);
    throw error;
  }
};
