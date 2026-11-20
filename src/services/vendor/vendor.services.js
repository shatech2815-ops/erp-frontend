import apiInterceptor from "../../interceptors/interceptors";

export const createVendor = async (data) => {
    try {
        const formData = new FormData();

        Object.entries(data).forEach(([key, value]) => {
            if (
                value !== null &&
                value !== undefined &&
                value !== ""
            ) {
                formData.append(key, value);
            }
        });

        const response = await apiInterceptor.post(
            "/vendors/create-vendor",
            formData
        );

        return response.data;
    } catch (error) {
        console.error("Error creating vendor:", error);
        throw error;
    }
};

export const getAllVendors = async () => {
    try {
        const response = await apiInterceptor.get("/vendors/get-all-vendors");
        return response.data;
    } catch (error) {
        console.error("Error fetching vendors:", error);
        throw error;
    }
};

export const getVendorById = async (id) => {
    try {
        const response = await apiInterceptor.get(`/vendors/get-vendor/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching vendor:", error);
        throw error;
    }
};


export const updateVendor = async (id, form, uploadedFiles = {}) => {
    try {
        const formData = new FormData();

        Object.entries(form).forEach(([key, value]) => {
            if (key === "status") {
                formData.append(key, value?.toUpperCase());
            } else if (value && typeof value === "object" && !(value instanceof File)) {
                formData.append(key, JSON.stringify(value));
            } else {
                formData.append(key, value);
            }
        });

        if (uploadedFiles?.gst) formData.append("gstFile", uploadedFiles.gst);
        if (uploadedFiles?.pan) formData.append("panFile", uploadedFiles.pan);
        if (uploadedFiles?.addressProof) formData.append("addressProofFile", uploadedFiles.addressProof);
        if (uploadedFiles?.agreement) formData.append("agreementFile", uploadedFiles.agreement);

        const response = await apiInterceptor.put(
            `/vendors/update-vendor/${id}`,
            formData
        );

        return response.data;

    } catch (error) {
        console.error("Error updating vendor:", error);
        throw error;
    }
};

export const deleteVendor = async (id) => {
    try {
        const response = await apiInterceptor.delete(
            `/vendors/delete-vendor/${id}`
        );
        return response.data;
    } catch (error) {
        console.error("Error deleting vendor:", error);
        throw error;
    }
};


export const getVendorsByCategory = async (category) => {
    try {
        const response = await apiInterceptor.get(
            `/vendors/get-vendors-by-category/${encodeURIComponent(category)}`
        );
        return response.data;
    } catch (error) {
        console.error("Error fetching vendor by category:", error);
        throw error;
    }
};