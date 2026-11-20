import apiInterceptor from "../../interceptors/interceptors";

// =========================
// GENERATE VENDOR REPORT
// GET /api/vendor-reports/generate?startDate=yyyy-MM-dd&endDate=yyyy-MM-dd
// =========================
export const generateVendorReport = async (startDate, endDate) => {
  try {
    const response = await apiInterceptor.get(
      "/vendor-reports/generate",
      {
        params: {
          startDate,
          endDate,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error generating vendor report:", error);
    throw error;
  }
};

// =========================
// GET ALL VENDOR REPORTS
// GET /api/vendor-reports
// =========================
export const getAllVendorReports = async () => {
  try {
    const response = await apiInterceptor.get("/vendor-reports");
    return response.data;
  } catch (error) {
    console.error("Error fetching vendor reports:", error);
    throw error;
  }
};