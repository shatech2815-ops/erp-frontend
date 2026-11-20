import apiInterceptor from "../../interceptors/interceptors";

// ========================
// CREATE Expense
// ========================
export const createExpense = async (expenseData) => {
  try {
    const response = await apiInterceptor.post(
      "/expenses",
      expenseData
    );
    return response.data;
  } catch (error) {
    console.error("Error creating expense:", error);
    throw error;
  }
};

// ========================
// GET All Expenses
// ========================
export const getAllExpenses = async () => {
  try {
    const response = await apiInterceptor.get(
      "/expenses"
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching expenses:", error);
    throw error;
  }
};

// ========================
// CREATE Expense Category
// ========================
export const createExpenseCategory = async (categoryData) => {
  try {
    const response = await apiInterceptor.post(
      "/expense-categories",
      categoryData
    );
    return response.data;
  } catch (error) {
    console.error("Error creating expense category:", error);
    throw error;
  }
};

// ========================
// GET All Expense Categories
// ========================
export const getAllExpenseCategories = async () => {
  try {
    const response = await apiInterceptor.get(
      "/expense-categories"
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching expense categories:", error);
    throw error;
  }
};

// ========================
// GET Expense Report
// ========================
export const getExpenseReport = async (
  category = "",
  vendor = "",
  paymentMode = ""
) => {
  try {
    const response = await apiInterceptor.get(
      "/expenses/report",
      {
        params: {
          category,
          vendor,
          paymentMode,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching expense report:", error);
    throw error;
  }
};

// ========================
// DELETE Expense Category
// ========================
export const deleteExpenseCategory = async (id) => {
  try {
    const response = await apiInterceptor.delete(`/expense-categories/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting expense category:", error);
    throw error;
  }
};

// ========================
// DELETE Expense
// ========================
export const deleteExpense = async (id) => {
  try {
    const response = await apiInterceptor.delete(`/expenses/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting expense:", error);
    throw error;
  }
};