import apiInterceptor from "../../interceptors/interceptors";

// ========================
// GET Financial Report
// ========================
export const getFinancialReport = async ({
  reportType,
  from,
  to,
}) => {
  try {
    console.log({
      reportType,
      from,
      to,
    });

    const response = await apiInterceptor.get("/reports/financial", {
      params: {
        reportType,
        from,
        to,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching financial report:", error);
    throw error;
  }
};