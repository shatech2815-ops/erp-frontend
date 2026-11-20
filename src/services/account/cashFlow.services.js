import apiInterceptor from "../../interceptors/interceptors";

// ========================
// GET Cash Flow Report
// ========================
export const getCashFlowReport = async (from, to) => {
  try {
    const response = await apiInterceptor.get("/reports/cash-flow", {
      params: {
        from,
        to,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching cash flow report:", error);
    throw error;
  }
};