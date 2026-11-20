import apiInterceptor from "../../interceptors/interceptors";

export const createFixedAsset = async (data) => {
  try {
    const response = await apiInterceptor.post("/fixed-assets", data);
    return response.data;
  } catch (error) {
    console.error("Error creating fixed asset:", error);
    throw error;
  }
};

export const getAllFixedAssets = async () => {
  try {
    const response = await apiInterceptor.get("/fixed-assets");
    return response.data;
  } catch (error) {
    console.error("Error fetching fixed assets:", error);
    throw error;
  }
};

export const runDepreciation = async (assetId) => {
  try {
    const response = await apiInterceptor.post(`/fixed-assets/${assetId}/depreciate`);
    return response.data;
  } catch (error) {
    console.error(`Error running depreciation for asset ID ${assetId}:`, error);
    throw error;
  }
};
