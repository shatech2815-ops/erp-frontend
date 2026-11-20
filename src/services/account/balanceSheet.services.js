import apiInterceptor from "../../interceptors/interceptors";

// ========================
// GET Balance Sheet Report
// ========================
export const getBalanceSheetReport = async (date) => {
  try {
    const response = await apiInterceptor.get("/ledger/balance-sheet", {
      params: {
        date,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching balance sheet report:", error);
    throw error;
  }
};