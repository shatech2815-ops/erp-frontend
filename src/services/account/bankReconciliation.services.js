import apiInterceptor from "../../interceptors/interceptors";

// ========================
// CREATE Bank Reconciliation
// ========================
export const createBankReconciliation = async (reconciliationData) => {
  try {
    const response = await apiInterceptor.post(
      "/bank-reconciliation",
      reconciliationData
    );
    return response.data;
  } catch (error) {
    console.error("Error creating bank reconciliation:", error);
    throw error;
  }
};

// ========================
// GET All Bank Reconciliations
// ========================
export const getAllBankReconciliations = async () => {
  try {
    const response = await apiInterceptor.get(
      "/bank-reconciliation"
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching bank reconciliations:", error);
    throw error;
  }
};

// ========================
// GET Bank Reconciliation By ID
// ========================
export const getBankReconciliationById = async (id) => {
  try {
    const response = await apiInterceptor.get(
      `/bank-reconciliation/${id}`
    );
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching bank reconciliation with ID ${id}:`,
      error
    );
    throw error;
  }
};

// ========================
// DELETE Bank Reconciliation
// ========================
export const deleteBankReconciliation = async (id) => {
  try {
    const response = await apiInterceptor.delete(
      `/bank-reconciliation/${id}`
    );
    return response.data;
  } catch (error) {
    console.error(
      `Error deleting bank reconciliation with ID ${id}:`,
      error
    );
    throw error;
  }
};

// ========================
// AUTO MATCH Bank Transactions
// ========================
export const autoMatchBankTransactions = async (matchData) => {
  try {
    const response = await apiInterceptor.post(
      "/bank-reconciliation/match",
      matchData
    );
    return response.data;
  } catch (error) {
    console.error("Error auto matching transactions:", error);
    throw error;
  }
};