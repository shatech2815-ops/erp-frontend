
import apiInterceptor from "../../interceptors/interceptors";

// GET PURCHASE REPORTS WITH FILTERS
export const getPurchaseReports = async (
  startDate,
  endDate,
  supplier = "",
  status = ""
) => {
  try {
    const response = await apiInterceptor.get("/reports", {
      params: {
        startDate,
        endDate,
        supplier,
        status,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching purchase reports:", error);
    throw error;
  }
};