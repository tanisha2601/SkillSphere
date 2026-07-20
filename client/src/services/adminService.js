import api from "./api";

const getErrorMessage = (error) => error?.message || "Something went wrong";

export const getAdminStats = async () => {
  try {
    return await api.get("/admin/stats");
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const getAllUsers = async () => {
  try {
    return await api.get("/admin/users");
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const suspendUser = async (userId) => {
  try {
    return await api.patch(`/admin/users/${userId}/suspend`);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const activateUser = async (userId) => {
  try {
    return await api.patch(`/admin/users/${userId}/activate`);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};