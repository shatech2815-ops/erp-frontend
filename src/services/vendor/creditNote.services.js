import apiInterceptor from "../../interceptors/interceptors";

// Create Credit Note
export const createCreditNote = async (data) => {
    try {
        const response = await apiInterceptor.post(
            "/credit-note",
            data
        );

        return response.data;

    } catch (error) {

        console.error(
            "Error creating credit note:",
            error
        );

        throw error;
    }
};

// Get All Credit Notes
export const getAllCreditNotes = async () => {
    try {

        const response = await apiInterceptor.get(
            "/credit-note"
        );

        return response.data;

    } catch (error) {

        console.error(
            "Error fetching credit notes:",
            error
        );

        throw error;
    }
};

// Get Credit Note By ID
export const getCreditNoteById = async (id) => {
    try {

        const response = await apiInterceptor.get(
            `/credit-note/${id}`
        );

        return response.data;

    } catch (error) {

        console.error(
            "Error fetching credit note by ID:",
            error
        );

        throw error;
    }
};

// Update Credit Note
export const updateCreditNote = async (id, data) => {
    try {

        const response = await apiInterceptor.put(
            `/credit-note/${id}`,
            data
        );

        return response.data;

    } catch (error) {

        console.error(
            "Error updating credit note:",
            error
        );

        throw error;
    }
};

// Delete Credit Note
export const deleteCreditNoteById = async (id) => {
    try {

        const response = await apiInterceptor.delete(
            `/credit-note/${id}`
        );

        return response.data;

    } catch (error) {

        console.error(
            "Error deleting credit note:",
            error
        );

        throw error;
    }
};