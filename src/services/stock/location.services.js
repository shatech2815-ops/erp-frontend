
import apiInterceptor from '../../interceptors/interceptors';

// =========================
// CREATE LOCATION
// =========================
export const createLocation = async (locationData) => {
  try {
    const response = await apiInterceptor.post('/locations', locationData);
    return response.data;
  } catch (error) {
    console.error('Error creating location:', error);
    throw error;
  }
};

// =========================
// GET ALL LOCATIONS
// =========================
export const getAllLocations = async () => {
  try {
    const response = await apiInterceptor.get('/locations');
    return response.data;
  } catch (error) {
    console.error('Error fetching locations:', error);
    throw error;
  }
};

// =========================
// GET AVAILABLE LOCATIONS
// =========================
export const getAvailableLocations = async () => {
  try {
    const response = await apiInterceptor.get('/locations/available');
    return response.data;
  } catch (error) {
    console.error('Error fetching available locations:', error);
    throw error;
  }
};

// =========================
// GET LOCATION BY ID
// =========================
export const getLocationById = async (id) => {
  try {
    const response = await apiInterceptor.get(`/locations/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching location with ID ${id}:`, error);
    throw error;
  }
};

// =========================
// GET LOCATIONS BY WAREHOUSE ID
// =========================
export const getLocationsByWarehouse = async (warehouseId) => {
  try {
    const response = await apiInterceptor.get(
      `/locations/warehouse/${warehouseId}`
    );
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching locations for warehouse ID ${warehouseId}:`,
      error
    );
    throw error;
  }
};

// =========================
// UPDATE LOCATION
// =========================
export const updateLocation = async (id, locationData) => {
  try {
    const response = await apiInterceptor.put(
      `/locations/${id}`,
      locationData
    );
    return response.data;
  } catch (error) {
    console.error(`Error updating location with ID ${id}:`, error);
    throw error;
  }
};

// =========================
// DEACTIVATE LOCATION
// =========================
export const deactivateLocation = async (id) => {
  try {
    const response = await apiInterceptor.delete(`/locations/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deactivating location with ID ${id}:`, error);
    throw error;
  }
};

// =========================
// BLOCK LOCATION
// =========================
export const blockLocation = async (id) => {
  try {
    const response = await apiInterceptor.patch(`/locations/${id}/block`);
    return response.data;
  } catch (error) {
    console.error(`Error blocking location with ID ${id}:`, error);
    throw error;
  }
};

// =========================
// UNBLOCK LOCATION
// =========================
export const unblockLocation = async (id) => {
  try {
    const response = await apiInterceptor.patch(`/locations/${id}/unblock`);
    return response.data;
  } catch (error) {
    console.error(`Error unblocking location with ID ${id}:`, error);
    throw error;
  }
};

// =========================
// INCREASE LOCATION CAPACITY
// =========================
export const increaseLocationCapacity = async (id, qty) => {
  try {
    const response = await apiInterceptor.patch(
      `/locations/${id}/increase-capacity`,
      qty
    );
    return response.data;
  } catch (error) {
    console.error(`Error increasing capacity for location ID ${id}:`, error);
    throw error;
  }
};

// =========================
// DECREASE LOCATION CAPACITY
// =========================
export const decreaseLocationCapacity = async (id, qty) => {
  try {
    const response = await apiInterceptor.patch(
      `/locations/${id}/decrease-capacity`,
      qty
    );
    return response.data;
  } catch (error) {
    console.error(`Error decreasing capacity for location ID ${id}:`, error);
    throw error;
  }
};
