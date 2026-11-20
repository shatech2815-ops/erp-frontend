import apiInterceptor from "../../../interceptors/interceptors";

// =========================
// CREATE UOM
// =========================
export const createUOM = async (uomData) => {
  try {
    const response = await apiInterceptor.post(
      "/uom",
      uomData
    );
    return response.data;
  } catch (error) {
    console.error("Error creating UOM:", error);
    throw error;
  }
};

// =========================
// GET ALL UOMS
// =========================
export const getAllUOMs = async () => {
  try {
    const response = await apiInterceptor.get("/uom");
    return response.data;
  } catch (error) {
    console.error("Error fetching UOMs:", error);
    throw error;
  }
};

// =========================
// GET UOM BY ID
// =========================
export const getUOMById = async (id) => {
  try {
    const response = await apiInterceptor.get(`/uom/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching UOM with ID ${id}:`, error);
    throw error;
  }
};

// =========================
// GET BASE UOMS
// =========================
export const getBaseUOMs = async () => {
  try {
    const response = await apiInterceptor.get("/uom/base");
    return response.data;
  } catch (error) {
    console.error("Error fetching base UOMs:", error);
    throw error;
  }
};

// =========================
// UPDATE UOM
// =========================
export const updateUOM = async (id, uomData) => {
  try {
    const response = await apiInterceptor.put(
      `/uom/${id}`,
      uomData
    );
    return response.data;
  } catch (error) {
    console.error(`Error updating UOM with ID ${id}:`, error);
    throw error;
  }
};

// =========================
// DELETE UOM
// =========================
export const deleteUOM = async (id) => {
  try {
    const response = await apiInterceptor.delete(`/uom/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting UOM with ID ${id}:`, error);
    throw error;
  }
};

// =========================
// CONVERT UOM TO BASE
// =========================
export const convertUOMToBase = async (uomId, qty) => {
  try {
    const response = await apiInterceptor.get("/uom/convert", {
      data: {
        uomId,
        qty,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error converting UOM:", error);
    throw error;
  }
};