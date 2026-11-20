import apiInterceptor from "../../interceptors/interceptors";

export const createBudget = async (data) => {
  try {
    const response = await apiInterceptor.post("/budgets", data);
    return response.data;
  } catch (error) {
    console.error("Error creating budget:", error);
    throw error;
  }
};

export const getAllBudgets = async () => {
  try {
    const response = await apiInterceptor.get("/budgets");
    return response.data;
  } catch (error) {
    console.error("Error fetching budgets:", error);
    throw error;
  }
};

export const getBudgetPerformance = async (budgetId) => {
  try {
    const response = await apiInterceptor.get(`/budgets/${budgetId}/performance`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching budget performance for ID ${budgetId}:`, error);
    throw error;
  }
};
