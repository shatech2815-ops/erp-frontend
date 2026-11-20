import apiInterceptor from "../../interceptors/interceptors";

// Create Contract
export const createContract = async (data) => {
    try {
        const response = await apiInterceptor.post("/contracts/create-contract", data);
        return response.data;
    } catch (error) {
        console.error("Error creating contract:", error);
        throw error;
    }
};

// Update Contract
export const updateContract = async (id, data) => {
    try {
        const response = await apiInterceptor.put(`/contracts/update-contract/${id}`, data);
        return response.data;
    } catch (error) {
        console.error("Error updating contract:", error);
        throw error;
    }
};

// Get Contract by ID
export const getContractById = async (id) => {
    try {
        const response = await apiInterceptor.get(`/contracts/get-contract/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching contract by ID:", error);
        throw error;
    }
};

// Get All Contracts
export const getAllContracts = async () => {
    try {
        const response = await apiInterceptor.get("/contracts/get-all-contracts");
        return response.data;
    } catch (error) {
        console.error("Error fetching all contracts:", error);
        throw error;
    }
};

// Delete Contract
export const deleteContractById = async (id) => {
    try {
        const response = await apiInterceptor.delete(`/contracts/delete-contract/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting contract:", error);
        throw error;
    }
};