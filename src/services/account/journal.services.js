import apiInterceptor from "../../interceptors/interceptors";

export const postJournalEntry = async (data) => {
  try {
    const response = await apiInterceptor.post("/accounting/journal", data);
    return response.data;
  } catch (error) {
    console.error("Error posting journal entry:", error);
    throw error;
  }
};
