import apiInterceptor from "../../interceptors/interceptors";

// ========================
// GET Trial Balance
// ========================
export const getTrialBalance = async (date) => {
  try {
    const response = await apiInterceptor.get(
      "/ledger/trial-balance",
      {
        params: {
          date,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching trial balance:", error);
    throw error;
  }
};