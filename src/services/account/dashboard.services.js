import apiInterceptor from "../../interceptors/interceptors";

// ========================
// GET Dashboard Data
// ========================
export const getDashboardData = async (from, to) => {
  try {
    const response = await apiInterceptor.get("/dashboard/summary", {
      params: {
        from,
        to,
      },
    });

    return response.data.data || response.data;
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    throw error;
  }
};