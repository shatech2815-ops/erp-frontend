import apiInterceptor from "../../interceptors/interceptors";

// Create Quotation
export const createQuotation = async (data) => {
    try {

        const response = await apiInterceptor.post(
            "/quotation",
            data
        );

        return response.data;

    } catch (error) {

        console.error(
            "Error creating quotation:",
            error
        );

        throw error;
    }
};

// Get All Quotations
export const getAllQuotations = async () => {
    try {

        const response = await apiInterceptor.get(
            "/quotation"
        );

        return response.data;

    } catch (error) {

        console.error(
            "Error fetching quotations:",
            error
        );

        throw error;
    }
};

// Get Quotation By ID
export const getQuotationById = async (id) => {
    try {

        const response = await apiInterceptor.get(
            `/quotation/${id}`
        );

        return response.data;

    } catch (error) {

        console.error(
            "Error fetching quotation by ID:",
            error
        );

        throw error;
    }
};

// Update Quotation
export const updateQuotation = async (id, data) => {
    try {

        const response = await apiInterceptor.put(
            `/quotation/${id}`,
            data
        );

        return response.data;

    } catch (error) {

        console.error(
            "Error updating quotation:",
            error
        );

        throw error;
    }
};

// Delete Quotation
export const deleteQuotationById = async (id) => {
    try {

        const response = await apiInterceptor.delete(
            `/quotation/${id}`
        );

        return response.data;

    } catch (error) {

        console.error(
            "Error deleting quotation:",
            error
        );

        throw error;
    }
};