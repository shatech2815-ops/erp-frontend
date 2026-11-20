import apiInterceptor from "../../interceptors/interceptors";

// Get Vendor Performance by Vendor ID
export const getVendorPerformance = async (vendorId) => {
  try {
    const response = await apiInterceptor.get(
      `/performance/vendor/${vendorId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching vendor performance:", error);
    throw error;
  }
};

// Get SLA Tracking by Vendor ID
export const getSlaTracking = async (vendorId) => {
  try {
    const response = await apiInterceptor.get(
      `/performance/sla/${vendorId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching SLA tracking:", error);
    throw error;
  }
};

// Get Vendor Scorecard by Vendor ID
export const getVendorScorecard = async (vendorId) => {
  try {
    const response = await apiInterceptor.get(
      `/performance/scorecard/${vendorId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching vendor scorecard:", error);
    throw error;
  }
};

// Get Contract Expiry Report
export const getContractExpiryReport = async () => {
  try {
    const response = await apiInterceptor.get(
      "/performance/contract-expiry"
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching contract expiry report:", error);
    throw error;
  }
};

// Get Invoice Payment Report
export const getInvoicePaymentReport = async () => {
  try {
    const response = await apiInterceptor.get(
      "/performance/invoice-payment"
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching invoice payment report:", error);
    throw error;
  }
};

// Get Vendor Performance Report
export const getVendorPerformanceReport = async () => {
  try {
    const response = await apiInterceptor.get(
      "/performance/vendor-performance"
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching vendor performance report:", error);
    throw error;
  }
};