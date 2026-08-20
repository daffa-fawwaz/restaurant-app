import { api } from "./api";
import type { LoginParams } from "../types/auth";

export const login = async (data: LoginParams) => {
  try {
    const response = await api.post("/auth/login", data);

    return response.data;
  } catch (error) {
    console.error("Error during login:", error);
    throw error;
  }
};