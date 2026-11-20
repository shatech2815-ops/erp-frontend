import apiInterceptor from "../../interceptors/interceptors";

// ========================
// CREATE Journal Entry
// ========================
export const createJournalEntry = async (journalData) => {
  try {
    const response = await apiInterceptor.post("/ledger", journalData);
    return response.data;
  } catch (error) {
    console.error("Error creating journal entry:", error);
    throw error;
  }
};

// ========================
// GET All Journal Entries
// ========================
export const getAllJournalEntries = async (filters = {}) => {
  try {
    const response = await apiInterceptor.get("/ledger", {
      params: {
        start: filters.dateFrom || "",
        end: filters.dateTo || "",
        accountCode: filters.accountCode || "",
        accountName: filters.accountName || "",
        transactionType:
          filters.transactionType && filters.transactionType !== "All"
            ? filters.transactionType
            : "",
        referenceNo: filters.referenceNo || "",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching journal entries:", error);
    throw error;
  }
};

// ========================
// GET Journal Entry By ID
// ========================
export const getJournalEntryById = async (id) => {
  try {
    const response = await apiInterceptor.get(`/ledger/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching journal entry with ID ${id}:`, error);
    throw error;
  }
};