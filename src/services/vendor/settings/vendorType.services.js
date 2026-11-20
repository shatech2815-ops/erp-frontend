import apiInterceptor from "../../../interceptors/interceptors";

// Create Vendor Type
export const createVendorType = async (data) => {
    try {
        const response = await apiInterceptor.post(
            "/vendor-types/create-vendor-type",
            data
        );
        return response.data;
    } catch (error) {
        console.error("Error creating vendor type:", error);
        throw error;
    }
};

// Update Vendor Type
export const updateVendorType = async (id, data) => {
    try {
        const response = await apiInterceptor.put(
            `/vendor-types/update-vendor-type/${id}`,
            data
        );
        return response.data;
    } catch (error) {
        console.error("Error updating vendor type:", error);
        throw error;
    }
};

// Get All Vendor Types
export const getAllVendorTypes = async () => {
    try {
        const response = await apiInterceptor.get(
            "/vendor-types/get-all-vendor-types"
        );
        return response.data;
    } catch (error) {
        console.error("Error fetching all vendor types:", error);
        throw error;
    }
};

// Get Active Vendor Types
export const getActiveVendorTypes = async () => {
    try {
        const response = await apiInterceptor.get(
            "/vendor-types/get-active-vendor-types"
        );
        return response.data;
    } catch (error) {
        console.error("Error fetching active vendor types:", error);
        throw error;
    }
};

// Delete Vendor Type
export const deleteVendorType = async (id) => {
    try {
        const response = await apiInterceptor.delete(
            `/vendor-types/delete-vendor-type/${id}`
        );
        return response.data;
    } catch (error) {
        console.error("Error deleting vendor type:", error);
        throw error;
    }
};