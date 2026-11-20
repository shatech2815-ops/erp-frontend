import apiInterceptor from "../../interceptors/interceptors";

// =========================
// CREATE SUPPLIER PO
// =========================
export const createSupplierPO = async (data) => {
  try {
    const response = await apiInterceptor.post("/supplier-po", data);
    return response.data;
  } catch (error) {
    console.error("Error creating supplier PO:", error);
    throw error;
  }
};

// =========================
// GET ALL SUPPLIER POs
// =========================
export const getAllSupplierPOs = async () => {
  try {
    const response = await apiInterceptor.get("/supplier-po");
    return response.data;
  } catch (error) {
    console.error("Error fetching supplier POs:", error);
    throw error;
  }
};

// =========================
// GET SUPPLIER PO BY ID
// =========================
export const getSupplierPOById = async (id) => {
  try {
    const response = await apiInterceptor.get(`/supplier-po/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching supplier PO:", error);
    throw error;
  }
};

// =========================
// DELETE SUPPLIER PO
// =========================
export const deleteSupplierPO = async (id) => {
  try {
    const response = await apiInterceptor.delete(`/supplier-po/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting supplier PO:", error);
    throw error;
  }
};