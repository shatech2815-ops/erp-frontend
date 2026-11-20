import apiInterceptor from "../../interceptors/interceptors";

// Create Delivery Challan
export const createDeliveryChallan = async (data) => {
    try {

        const response = await apiInterceptor.post(
            "/delivery-challan",
            data
        );

        return response.data;

    } catch (error) {

        console.error(
            "Error creating delivery challan:",
            error
        );

        throw error;
    }
};

// Get All Delivery Challans
export const getAllDeliveryChallans = async () => {
    try {

        const response = await apiInterceptor.get(
            "/delivery-challan"
        );

        return response.data;

    } catch (error) {

        console.error(
            "Error fetching delivery challans:",
            error
        );

        throw error;
    }
};

// Get Delivery Challan By ID
export const getDeliveryChallanById = async (id) => {
    try {

        const response = await apiInterceptor.get(
            `/delivery-challan/${id}`
        );

        return response.data;

    } catch (error) {

        console.error(
            "Error fetching delivery challan by ID:",
            error
        );

        throw error;
    }
};

// Update Delivery Challan
export const updateDeliveryChallan = async (id, data) => {
    try {

        const response = await apiInterceptor.put(
            `/delivery-challan/${id}`,
            data
        );

        return response.data;

    } catch (error) {

        console.error(
            "Error updating delivery challan:",
            error
        );

        throw error;
    }
};

// Delete Delivery Challan
export const deleteDeliveryChallanById = async (id) => {
    try {

        const response = await apiInterceptor.delete(
            `/delivery-challan/${id}`
        );

        return response.data;

    } catch (error) {

        console.error(
            "Error deleting delivery challan:",
            error
        );

        throw error;
    }
};