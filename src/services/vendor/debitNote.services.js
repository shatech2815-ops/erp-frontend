import apiInterceptor from "../../interceptors/interceptors";

// Create Debit Note
export const createDebitNote = async (data) => {
    try {

        const response = await apiInterceptor.post(
            "/debit-note",
            data
        );

        return response.data;

    } catch (error) {

        console.error(
            "Error creating debit note:",
            error
        );

        throw error;
    }
};

// Get All Debit Notes
export const getAllDebitNotes = async () => {
    try {

        const response = await apiInterceptor.get(
            "/debit-note"
        );

        return response.data;

    } catch (error) {

        console.error(
            "Error fetching debit notes:",
            error
        );

        throw error;
    }
};

// Get Debit Note By ID
export const getDebitNoteById = async (id) => {
    try {

        const response = await apiInterceptor.get(
            `/debit-note/${id}`
        );

        return response.data;

    } catch (error) {

        console.error(
            "Error fetching debit note by ID:",
            error
        );

        throw error;
    }
};

// Update Debit Note
export const updateDebitNote = async (id, data) => {
    try {

        const response = await apiInterceptor.put(
            `/debit-note/${id}`,
            data
        );

        return response.data;

    } catch (error) {

        console.error(
            "Error updating debit note:",
            error
        );

        throw error;
    }
};

// Delete Debit Note
export const deleteDebitNoteById = async (id) => {
    try {

        const response = await apiInterceptor.delete(
            `/debit-note/${id}`
        );

        return response.data;

    } catch (error) {

        console.error(
            "Error deleting debit note:",
            error
        );

        throw error;
    }
};