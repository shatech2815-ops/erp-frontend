import apiInterceptor from "../../../interceptors/interceptors";

// Create Payment Term
export const createPaymentTerm = async (data) => {
    try {
        const response = await apiInterceptor.post(
            "/payment-terms/create-payment-term",
            data
        );
        return response.data;
    } catch (error) {
        console.error("Error creating payment term:", error);
        throw error;
    }
};

// Get All Payment Terms
export const getAllPaymentTerms = async () => {
    try {
        const response = await apiInterceptor.get(
            "/payment-terms/get-all-payment-terms"
        );
        return response.data;
    } catch (error) {
        console.error("Error fetching all payment terms:", error);
        throw error;
    }
};

// Get Active Payment Terms
export const getActivePaymentTerms = async () => {
    try {
        const response = await apiInterceptor.get(
            "/payment-terms/get-active-payment-terms"
        );
        return response.data;
    } catch (error) {
        console.error("Error fetching active payment terms:", error);
        throw error;
    }
};

// Delete Payment Term
export const deletePaymentTerm = async (id) => {
    try {
        const response = await apiInterceptor.delete(
            `/payment-terms/delete-payment-term/${id}`
        );
        return response.data;
    } catch (error) {
        console.error("Error deleting payment term:", error);
        throw error;
    }
};