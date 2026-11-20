import apiInterceptor from "../../interceptors/interceptors";

// ========================
// GET GST Report
// ========================
export const getGstReport = async ({
  type,
  gstin,
  from,
  to,
}) => {
  try {
    const response = await apiInterceptor.get("/reports/gst", {
      params: {
        type,
        gstin,
        from,
        to,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching GST report:", error);
    throw error;
  }
};