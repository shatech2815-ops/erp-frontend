import apiInterceptor from "../../interceptors/interceptors";

// ========================
// GET Profit & Loss Report
// ========================
export const getProfitLossReport = async (from, to) => {
  try {
    const response = await apiInterceptor.get(
      "/ledger/profit-and-loss",
      {
        params: {
          from,
          to,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching profit & loss report:", error);
    throw error;
  }
};