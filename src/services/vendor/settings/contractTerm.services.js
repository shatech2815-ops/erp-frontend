import apiInterceptor from "../../../interceptors/interceptors";

// Create Contract Term
export const createContractTerm = async (data) => {
    try {
        const response = await apiInterceptor.post(
            "/contract-terms/create-contract-term",
            data
        );
        return response.data;
    } catch (error) {
        console.error("Error creating contract term:", error);
        throw error;
    }
};

// Get All Contract Terms
export const getAllContractTerms = async () => {
    try {
        const response = await apiInterceptor.get(
            "/contract-terms/get-all-contract-terms"
        );
        return response.data;
    } catch (error) {
        console.error("Error fetching all contract terms:", error);
        throw error;
    }
};

// Get Active Contract Terms
export const getActiveContractTerms = async () => {
    try {
        const response = await apiInterceptor.get(
            "/contract-terms/get-active-contract-terms"
        );
        return response.data;
    } catch (error) {
        console.error("Error fetching active contract terms:", error);
        throw error;
    }
};

// Delete Contract Term
export const deleteContractTerm = async (id) => {
    try {
        const response = await apiInterceptor.delete(
            `/contract-terms/delete-contract-term/${id}`
        );
        return response.data;
    } catch (error) {
        console.error("Error deleting contract term:", error);
        throw error;
    }
};