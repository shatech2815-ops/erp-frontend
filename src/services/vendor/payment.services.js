import apiInterceptor  from "../../interceptors/interceptors";

export const makePayment= async(data)=>{
    try{
        const response=await apiInterceptor.post("/payments/make-payment",data)
        return response.data;
    }
    catch(error){
        console.error("Error making payment:", error)
        throw error;
    }
}

export const getPaymentHistoryById= async(invoiceId)=>{
    try{
        const response= await apiInterceptor.get(`/payments/history/${invoiceId}`)
        return response.data;
    }
    catch(error){
        console.error("Error fetching payment history by ID:", error)
        throw error;
    }
}