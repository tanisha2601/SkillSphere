import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "/api";

const client = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

const unwrap = (res) => res.data;

const getErrorMessage = (error) =>
  error?.response?.data?.message || error?.message || "Something went wrong";

export const createOrder = async (contractId) => {
  try {
    const res = await client.post("/payments/create-order", { contractId });
    return unwrap(res);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const verifyPayment = async (verificationData) => {
  try {
    const res = await client.post("/payments/verify", verificationData);
    return unwrap(res);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const getWallet = async () => {
  try {
    const res = await client.get("/payments/wallet");
    return unwrap(res);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const getPaymentHistory = async () => {
  try {
    const res = await client.get("/payments/history");
    return unwrap(res);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};