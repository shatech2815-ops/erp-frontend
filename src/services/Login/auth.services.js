import apiInterceptor from "../../interceptors/interceptors";

// ========================
// LOGIN API
// ========================
export const loginUser = async (loginData) => {
  try {
    const response = await apiInterceptor.post(
      "/auth/login",
      loginData
    );

    return response.data;

  } catch (error) {

    console.error("Error during login:", error);
    throw error;
  }
};